/* ==========================================================================
   Kelux AI — Back office interno
   Área comercial: navegação, scroll e renderização.
   Sem dependências. Os dados vêm de assets/js/dados.js
   ========================================================================== */

(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // Numeração em algarismos, com zero à esquerda — legível a qualquer distância
  const numero = n => String(n).padStart(2, '0');

  const pessoa = id => EQUIPA.find(p => p.id === id) || { nome: id, foto: null };

  /* Avatar: usa a foto quando existir, senão a inicial iluminada */
  function avatar(p, classe, classeInicial) {
    if (p.foto) {
      return '<span class="' + classe + '"><img src="' + p.foto + '" alt="' + p.nome + '"></span>';
    }
    return '<span class="' + classe + '"><span class="' + classeInicial + '">' +
           p.nome.charAt(0) + '</span></span>';
  }

  /* ------------------------------------------------------------------------
     Navegação — a página corre toda de uma vez, os separadores só marcam
     onde vamos e levam lá quando se clica.
     ------------------------------------------------------------------------ */

  const seccoes = $$('.sec');
  const nav = $('#secnav');
  const botoes = [];

  seccoes.forEach(sec => {
    const b = document.createElement('button');
    b.className = 'secnav__btn';
    b.type = 'button';
    b.setAttribute('aria-current', 'false');
    b.dataset.alvo = sec.id;
    b.innerHTML = '<span class="rn">' + sec.dataset.rn + '</span>' +
                  '<span>' + sec.dataset.nome + '</span>';
    b.addEventListener('click', () => {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + sec.id);
    });
    nav.appendChild(b);
    botoes.push(b);
  });

  /* Marca a secção que está a ser lida e arrasta o separador para a vista */
  let atual = null;

  function marcar() {
    const limite = 160;   // abaixo do cabeçalho fixo
    let i = 0;
    for (let k = 0; k < seccoes.length; k++) {
      if (seccoes[k].getBoundingClientRect().top <= limite) i = k;
    }

    // no fim da página, a última secção manda
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      i = seccoes.length - 1;
    }

    if (i === atual) return;
    atual = i;

    botoes.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));

    const b = botoes[i];
    const alvo = b.offsetLeft - (nav.clientWidth - b.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, alvo), behavior: 'smooth' });

    history.replaceState(null, '', '#' + seccoes[i].id);
  }

  let pendente = false;
  window.addEventListener('scroll', () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(() => { pendente = false; marcar(); });
  }, { passive: true });

  window.addEventListener('resize', marcar, { passive: true });

  /* ------------------------------------------------------------------------
     I — A equipa
     ------------------------------------------------------------------------ */

  $('#team').innerHTML = EQUIPA.map(p =>
    '<div class="member">' +
      avatar(p, 'member__photo', 'member__initial') +
      '<div class="member__name">' + p.nome + '</div>' +
      '<div class="member__role">Comercial</div>' +
      '<p class="member__line">' + p.linha + '</p>' +
    '</div>'
  ).join('');

  /* ------------------------------------------------------------------------
     II — A escada
     ------------------------------------------------------------------------ */

  (function escada() {
    const d = ESCADA.degraus;
    const iAtual = d.indexOf(ESCADA.metaAtual);
    const min = 38, max = 158;

    $('#stair').innerHTML = d.map((v, i) => {
      const altura = min + (max - min) * (i / (d.length - 1));
      let cls = 'step';
      if (i < iAtual) cls += ' step--done';
      if (i === iAtual) cls += ' step--now';

      return '<div class="' + cls + '">' +
               '<span class="step__flag">' + (i === iAtual ? 'Meta' : '') + '</span>' +
               '<span class="step__val">' + v + '</span>' +
               '<span class="step__bar" style="height:' + Math.round(altura) + 'px"></span>' +
             '</div>';
    }).join('');
  })();

  /* ------------------------------------------------------------------------
     III — Tabela de comissões
     ------------------------------------------------------------------------ */

  $('#tbl-comissoes').innerHTML = COMISSOES.map(l =>
    '<tr><td>' + l.avenca + '</td><td>' + l.mes + '</td><td>' + l.total + '</td></tr>'
  ).join('');

  /* ------------------------------------------------------------------------
     IV — Ficha de lead
     ------------------------------------------------------------------------ */

  (function ficha() {
    const f = FICHA_EXEMPLO;

    $('#ficha-campos').innerHTML =
      f.campos.map(c =>
        '<div class="field"><span class="field__k">' + c.k + '</span>' +
        '<div class="field__v">' + c.v + '</div></div>'
      ).join('') +
      '<div class="field field--wide"><span class="field__k">Notas</span>' +
      '<div class="field__v">' + f.notas + '</div></div>';

    $('#ficha-auto').innerHTML = f.automaticos.map(c =>
      '<div class="field"><span class="field__k">' + c.k + '</span>' +
      '<div class="field__v field__v--auto">' + c.v + '</div></div>'
    ).join('');

    $('#ficha-hist').innerHTML =
      '<div class="hist__row hist__row--h">' +
        '<span>Data</span><span>Meio</span><span>Resultado</span><span>Nota</span>' +
      '</div>' +
      f.historico.map(h =>
        '<div class="hist__row">' +
          '<span class="hist__d">' + h.data + '</span>' +
          '<span class="hist__d">' + h.meio + '</span>' +
          '<span class="hist__r">' + h.resultado + '</span>' +
          '<span class="hist__n">' + h.nota + '</span>' +
        '</div>'
      ).join('');
  })();

  /* ------------------------------------------------------------------------
     VI — Ranking
     ------------------------------------------------------------------------ */

  let vistaAtual = 'semana';

  function desenharRanking(vista) {
    const v = RANKING[vista];
    const linhas = v.dados.slice().sort((a, b) => b.reunioes - a.reunioes);
    const topo = linhas[0].reunioes;

    /* No-show da equipa, ponderado pelo número de reuniões */
    const totalR = linhas.reduce((s, l) => s + l.reunioes, 0);
    const nsEquipa = Math.round(linhas.reduce((s, l) => s + l.ns * l.reunioes, 0) / totalR);

    const iDegrau = ESCADA.degraus.indexOf(ESCADA.metaAtual) + 1;

    $('#stats').innerHTML = [
      ['Reuniões marcadas', v.total, 'luz', v.etiqueta],
      ['Meta da semana', ESCADA.metaAtual, '', 'Equipa toda'],
      ['Degrau atual', numero(iDegrau) + ' de ' + numero(ESCADA.degraus.length), '', ESCADA.metaAtual + ' reuniões'],
      ['No-show da equipa', nsEquipa + '%', '', 'reuniões já realizadas'],
      ['Recorde da equipa', RECORDE.valor, '', RECORDE.quando]
    ].map(s =>
      '<div class="stat">' +
        '<span class="stat__k">' + s[0] + '</span>' +
        '<div class="stat__v' + (s[2] ? ' stat__v--' + s[2] : '') + '">' + s[1] + '</div>' +
        '<div class="stat__sub">' + s[3] + '</div>' +
      '</div>'
    ).join('');

    $('#chart').innerHTML = linhas.map((l, i) => {
      const p = pessoa(l.id);
      const pct = Math.round((l.reunioes / topo) * 100);
      return '<div class="bar' + (i === 0 ? ' bar--lead' : '') + '">' +
               '<span class="bar__rank">' + numero(i + 1) + '</span>' +
               avatar(p, 'bar__photo', 'bar__initial') +
               '<div class="bar__mid">' +
                 '<div class="bar__name">' + p.nome + '</div>' +
                 '<div class="bar__track"><span class="bar__fill" data-pct="' + pct + '"></span></div>' +
               '</div>' +
               '<div class="bar__right">' +
                 '<div class="bar__count">' + l.reunioes + '</div>' +
                 '<div class="bar__ns">no-show ' + l.ns + '%</div>' +
               '</div>' +
             '</div>';
    }).join('') +
    '<div class="chart__foot">' +
      '<span>Total ' + v.etiqueta + ' &middot; ' + v.total + ' reuniões</span>' +
      '<span>' + (vista === 'semana'
        ? (v.total >= ESCADA.metaAtual
            ? 'Meta batida &middot; a escada sobe no domingo'
            : 'Abaixo da meta de ' + ESCADA.metaAtual)
        : 'Meta semanal &middot; ' + ESCADA.metaAtual) +
      '</span>' +
    '</div>';

    requestAnimationFrame(animarBarras);
  }

  function animarBarras() {
    $$('.bar__fill').forEach(f => { f.style.width = f.dataset.pct + '%'; });
  }

  $$('.views__b').forEach(b => {
    b.addEventListener('click', () => {
      vistaAtual = b.dataset.vista;
      $$('.views__b').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      desenharRanking(vistaAtual);
    });
  });

  desenharRanking(vistaAtual);

  /* ------------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------------ */

  if (location.hash) {
    const alvo = document.querySelector(location.hash);
    if (alvo && alvo.classList.contains('sec')) {
      requestAnimationFrame(() => alvo.scrollIntoView({ block: 'start' }));
    }
  }

  marcar();
})();
