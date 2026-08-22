/* ==========================================================================
   Kelux AI — Back office interno
   Área comercial: navegação e renderização.
   Sem dependências. Os dados vêm de assets/js/dados.js
   ========================================================================== */

(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const ROMANOS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  const romano = n => ROMANOS[n - 1] || String(n);

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
     Navegação entre secções
     ------------------------------------------------------------------------ */

  const seccoes = $$('.sec');
  const nav = $('#secnav');

  seccoes.forEach((sec, i) => {
    const b = document.createElement('button');
    b.className = 'secnav__btn';
    b.type = 'button';
    b.setAttribute('aria-current', 'false');
    b.dataset.alvo = sec.id;
    b.innerHTML = '<span class="rn">' + sec.dataset.rn + '</span>' +
                  '<span>' + sec.dataset.nome + '</span>';
    b.addEventListener('click', () => abrir(sec.id, true));
    nav.appendChild(b);
    if (i === 0) b.setAttribute('aria-current', 'true');
  });

  function abrir(id, comScroll) {
    const alvo = document.getElementById(id);
    if (!alvo) return;

    seccoes.forEach(s => s.classList.toggle('is-active', s === alvo));
    $$('.secnav__btn', nav).forEach(b =>
      b.setAttribute('aria-current', String(b.dataset.alvo === id))
    );

    if (history.replaceState) history.replaceState(null, '', '#' + id);

    if (comScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'sec-6') requestAnimationFrame(animarBarras);
  }

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
      ['Degrau atual', romano(iDegrau) + ' de ' + romano(ESCADA.degraus.length), '', ESCADA.metaAtual + ' reuniões'],
      ['No-show da equipa', nsEquipa + '%', '', v.etiqueta],
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
               '<span class="bar__rank">' + romano(i + 1) + '</span>' +
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
      '<span>Total ' + v.etiqueta + ' · ' + v.total + ' reuniões</span>' +
      '<span>' + (vista === 'semana'
        ? (v.total >= ESCADA.metaAtual
            ? 'Meta batida · a escada sobe no domingo'
            : 'Abaixo da meta de ' + ESCADA.metaAtual)
        : 'Meta semanal · ' + ESCADA.metaAtual) +
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

  const inicial = location.hash && document.querySelector(location.hash)
    ? location.hash.slice(1)
    : seccoes[0].id;

  abrir(inicial, false);
})();
