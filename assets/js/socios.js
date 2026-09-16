/* ==========================================================================
   Kelux AI — Objetivos
   A página revela-se com o scroll: barras a crescer, números a contar,
   blocos a acender. Sem dependências.
   ========================================================================== */

(function () {
  'use strict';

  var parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Barra de progresso — a única referência de tempo da apresentação
     ------------------------------------------------------------------ */
  var barra = document.getElementById('progresso');
  var pendente = false;

  function progresso() {
    pendente = false;
    var alt = document.documentElement.scrollHeight - window.innerHeight;
    var p = alt > 0 ? (window.scrollY / alt) * 100 : 0;
    barra.style.width = Math.min(100, Math.max(0, p)) + '%';
  }

  if (barra) {
    window.addEventListener('scroll', function () {
      if (!pendente) { pendente = true; requestAnimationFrame(progresso); }
    }, { passive: true });
    progresso();
  }

  /* ------------------------------------------------------------------
     Observador genérico de entrada no ecrã
     ------------------------------------------------------------------ */
  function observar(seletor, aoEntrar, margem, limiar) {
    var alvos = document.querySelectorAll(seletor);
    if (!alvos.length) return;

    if (parado || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(alvos, function (el) { aoEntrar(el); });
      return;
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { aoEntrar(e.target); obs.unobserve(e.target); }
      });
    }, {
      threshold: typeof limiar === 'number' ? limiar : 0.15,
      rootMargin: margem || '0px 0px -8% 0px'
    });

    Array.prototype.forEach.call(alvos, function (el) { obs.observe(el); });
  }

  var seccoes = Array.prototype.slice.call(document.querySelectorAll('.scr'));

  /* ------------------------------------------------------------------
     Escalonamento — dentro de cada ecrã, os blocos entram em cascata
     ------------------------------------------------------------------ */
  if (!parado) {
    seccoes.forEach(function (sec) {
      var blocos = sec.querySelectorAll('.rev');
      Array.prototype.forEach.call(blocos, function (el, i) {
        el.style.setProperty('--d', (i * 110) + 'ms');
      });
    });
  }

  observar('.rev', function (el) { el.classList.add('in'); });

  /* A mancha de luz de fundo acende com a secção */
  observar('.scr', function (el) { el.classList.add('vis'); }, '0px', 0.25);

  /* ------------------------------------------------------------------
     Barras — a altura vem do atributo, cresce quando entra no ecrã.
     Cada gráfico escalona as suas barras da esquerda para a direita.
     ------------------------------------------------------------------ */
  function prepararBarras(seletorGrupo, seletorBarra) {
    var grupos = document.querySelectorAll(seletorGrupo);
    Array.prototype.forEach.call(grupos, function (grupo) {
      var barras = grupo.querySelectorAll(seletorBarra);
      Array.prototype.forEach.call(barras, function (b, i) {
        var atraso = parado ? 0 : i * 130;
        b.style.setProperty('--db', atraso + 'ms');
        var val = b.parentNode.querySelector('.aven__v, .tes__v');
        if (val) val.style.setProperty('--dv', (atraso + 180) + 'ms');
      });
      // os saltos entre barras entram depois das barras a que dizem respeito
      var saltos = grupo.querySelectorAll('.aven__d');
      Array.prototype.forEach.call(saltos, function (s, i) {
        s.style.setProperty('--dv', (parado ? 0 : i * 130 + 420) + 'ms');
      });
    });
  }

  prepararBarras('.aven', '.aven__bar');
  prepararBarras('.tes', '.tes__bar');

  observar('.aven__bar, .tes__bar', function (el) {
    var h = parseFloat(el.getAttribute('data-h')) || 0;
    // um mínimo visível para os valores pequenos não desaparecerem
    el.style.height = Math.max(h, 1.4) + '%';
  }, '0px 0px -12% 0px');

  /* ------------------------------------------------------------------
     Números a contar — o valor final está no HTML, o JS só o percorre
     ------------------------------------------------------------------ */
  var separa = /^(\D*)([\d.,]+)(.*)$/;

  function formatar(n, casas) {
    try {
      return n.toLocaleString('pt-PT', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
      });
    } catch (err) {
      return casas ? n.toFixed(casas) : String(Math.round(n));
    }
  }

  function contar(el) {
    var texto = (el.getAttribute('data-fim') || el.textContent).trim();
    var p = separa.exec(texto);
    if (!p) return;

    var prefixo = p[1];
    var bruto = p[2];
    var sufixo = p[3];
    var casas = bruto.indexOf(',') > -1 ? bruto.split(',')[1].length : 0;
    var fim = parseFloat(bruto.replace(/\./g, '').replace(',', '.'));
    if (isNaN(fim)) return;

    el.setAttribute('data-fim', texto);

    // com o separador em segundo plano o requestAnimationFrame não corre:
    // mostra-se logo o valor final, para nunca ficar um zero pendurado
    if (parado || document.hidden) { el.textContent = texto; return; }

    var dur = 1250;
    var atraso = parseFloat(el.getAttribute('data-atraso')) || 0;
    var inicio = null;

    el.textContent = prefixo + formatar(0, casas) + sufixo;

    function passo(t) {
      if (inicio === null) inicio = t;
      var q = (t - inicio - atraso) / dur;
      if (q < 0) { requestAnimationFrame(passo); return; }
      if (q >= 1) { el.textContent = texto; return; }
      // easing de saída suave: rápido no início, assenta no fim
      var e = 1 - Math.pow(1 - q, 4);
      el.textContent = prefixo + formatar(fim * e, casas) + sufixo;
      requestAnimationFrame(passo);
    }

    requestAnimationFrame(passo);
  }

  // o atraso de cada número segue o da barra ou do bloco a que pertence
  Array.prototype.forEach.call(document.querySelectorAll('[data-contar]'), function (el) {
    var d = el.style.getPropertyValue('--dv') || '';
    var ms = parseFloat(d);
    if (!isNaN(ms)) el.setAttribute('data-atraso', ms);
  });

  observar('[data-contar]', contar, '0px 0px -10% 0px', 0.3);

  /* ------------------------------------------------------------------
     Percurso — cada marco acende quando entra no ecrã.
     O atraso em cascata vem do --i no CSS, para o caso de vários
     marcos entrarem na mesma altura num ecrã grande.
     ------------------------------------------------------------------ */
  observar('.marco', function (el) { el.classList.add('on'); }, '0px 0px -4% 0px');

  /* ------------------------------------------------------------------
     Diagrama — os blocos acendem-se por ordem, à medida do scroll
     ------------------------------------------------------------------ */
  var fluxo = document.querySelectorAll('[data-passo]');

  if (fluxo.length) {
    if (parado || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(fluxo, function (el) { el.classList.add('on'); });
    } else {
      var acesos = 0;

      var obsFluxo = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          var passo = parseInt(e.target.getAttribute('data-passo'), 10);
          // acende tudo o que vem antes, para nunca haver buracos na cadeia
          if (passo > acesos) acesos = passo;
          Array.prototype.forEach.call(fluxo, function (el) {
            if (parseInt(el.getAttribute('data-passo'), 10) <= acesos) {
              el.classList.add('on');
            }
          });
        });
      }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });

      Array.prototype.forEach.call(fluxo, function (el) { obsFluxo.observe(el); });
    }
  }

  /* ------------------------------------------------------------------
     Índice lateral — marca a secção onde estamos e inverte no ecrã escuro
     ------------------------------------------------------------------ */
  var idx = document.getElementById('idx');
  var links = idx ? Array.prototype.slice.call(idx.querySelectorAll('.idx__i')) : [];

  function marcarIndice() {
    if (!links.length) return;
    var meio = window.scrollY + window.innerHeight / 2;
    var atual = 0;
    for (var i = 0; i < seccoes.length; i++) {
      if (seccoes[i].offsetTop <= meio) atual = i;
    }
    links.forEach(function (a, i) { a.classList.toggle('agora', i === atual); });
    idx.classList.toggle('sobre-escuro', !!(seccoes[atual] && seccoes[atual].classList.contains('scr--dark')));
  }

  if (idx) {
    idx.classList.add('pronto');
    marcarIndice();
  }

  /* ------------------------------------------------------------------
     Dica de scroll — desaparece assim que a apresentação arranca
     ------------------------------------------------------------------ */
  var dica = document.getElementById('dica');
  if (dica && !parado) {
    setTimeout(function () {
      if (window.scrollY < 40) dica.classList.add('on');
    }, 1400);
  }

  var pendente2 = false;
  function aoRolar() {
    pendente2 = false;
    marcarIndice();
    if (dica && window.scrollY > 40) dica.classList.add('fora');
  }

  window.addEventListener('scroll', function () {
    if (!pendente2) { pendente2 = true; requestAnimationFrame(aoRolar); }
  }, { passive: true });

  /* ------------------------------------------------------------------
     Setas e espaço avançam secção — para quem apresenta ao vivo
     ------------------------------------------------------------------ */
  document.addEventListener('keydown', function (ev) {
    var frente = ev.key === 'ArrowDown' || ev.key === 'PageDown' || ev.key === ' ';
    var tras = ev.key === 'ArrowUp' || ev.key === 'PageUp';
    if (!frente && !tras) return;

    var alvo = ev.target;
    if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA')) return;

    var y = window.scrollY;
    var i;

    if (frente) {
      for (i = 0; i < seccoes.length; i++) {
        if (seccoes[i].offsetTop > y + 12) { break; }
      }
    } else {
      for (i = seccoes.length - 1; i >= 0; i--) {
        if (seccoes[i].offsetTop < y - 12) { break; }
      }
    }

    if (i >= 0 && i < seccoes.length) {
      ev.preventDefault();
      window.scrollTo({ top: seccoes[i].offsetTop, behavior: parado ? 'auto' : 'smooth' });
    }
  });

})();
