/* ==========================================================================
   Kelux AI — Back office interno
   Área financeira: posição de cobrança, faturas e custos.
   Sem dependências. Os dados vêm de assets/js/financeiro-dados.js
   ========================================================================== */

(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const texto = s => String(s).replace(/[&<>"]/g, m => ESCAPES[m]);

  /* Euros à portuguesa: ponto nos milhares, vírgula nos cêntimos.
     À mão, porque o toLocaleString só agrupa a partir de cinco dígitos em
     pt-PT e ficava 11.335 ao lado de 5904 na mesma fila de números. */
  function euros(v, cent) {
    const neg = v < 0;
    const fixo = Math.abs(v).toFixed(cent ? 2 : 0);
    const partes = fixo.split('.');
    const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '−' : '') + inteiro +
           (partes[1] ? ',' + partes[1] : '') + ' €';
  }

  const ESTADO = {
    'recebido':    { rot: 'Recebido',    cor: 'verde'    },
    'por-receber': { rot: 'Por receber', cor: 'vermelho' },
    'por-faturar': { rot: 'Por faturar', cor: 'ambar'    },
    'previsto':    { rot: 'Previsto',    cor: 'neutro'   }
  };

  const soma = (lista, campo) => lista.reduce((t, f) => t + f[campo], 0);
  const doEstado = e => FATURAS.filter(f => f.estado === e);

  /* Agosto é o mês fechado; setembro ainda é pipeline e conta à parte */
  const agosto   = FATURAS.filter(f => f.estado !== 'previsto');
  const previsto = doEstado('previsto');

  const recebido    = doEstado('recebido');
  const porReceber  = doEstado('por-receber');
  const porFaturar  = doEstado('por-faturar');

  const extra = (typeof EXTRA_RECEBIDO !== 'undefined' ? EXTRA_RECEBIDO : []);
  const totalExtra = extra.reduce((t, e) => t + e.valor, 0);

  const faturadoTotal = soma(recebido, 'total') + soma(porReceber, 'total');
  const recebidoTotal = soma(recebido, 'total') + totalExtra;
  const aReceber      = soma(porReceber, 'total');
  const aFaturar      = soma(porFaturar, 'total');

  /* ------------------------------------------------------------------------
     Separadores — os mesmos da gestão de clientes
     ------------------------------------------------------------------------ */

  const paineis = $$('.painel');
  const tabs = $('#tabs');
  const botoes = [];

  function mostrar(i) {
    paineis.forEach((p, n) => p.classList.toggle('is-on', n === i));
    botoes.forEach((b, n) => b.setAttribute('aria-selected', n === i ? 'true' : 'false'));
    history.replaceState(null, '', '#' + paineis[i].id);
  }

  paineis.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.setAttribute('aria-controls', p.id);
    b.innerHTML = '<span class="rn">' + p.dataset.rn + '</span><span>' +
                  texto(p.dataset.nome) + '</span>';
    b.addEventListener('click', () => mostrar(i));
    tabs.appendChild(b);
    botoes.push(b);
  });

  tabs.addEventListener('keydown', e => {
    const i = botoes.findIndex(b => b === document.activeElement);
    if (i < 0) return;
    let alvo = -1;
    if (e.key === 'ArrowRight') alvo = (i + 1) % botoes.length;
    if (e.key === 'ArrowLeft')  alvo = (i - 1 + botoes.length) % botoes.length;
    if (alvo < 0) return;
    e.preventDefault();
    botoes[alvo].focus();
    mostrar(alvo);
  });

  /* ------------------------------------------------------------------------
     01 — Posição
     ------------------------------------------------------------------------ */

  const pctCobrado = faturadoTotal
    ? Math.round(soma(recebido, 'total') / faturadoTotal * 100)
    : 0;

  $('#kpis').innerHTML = [
    { n: euros(faturadoTotal), u: 'faturado em agosto<br>com IVA' },
    { n: euros(recebidoTotal), u: 'já entrou<br>em conta', bom: true },
    { n: euros(aReceber),      u: 'faturado<br>e por receber', alerta: true },
    { n: euros(aFaturar),      u: 'fechado<br>e ainda por faturar', ambar: true }
  ].map(k =>
    '<div class="kpi' +
      (k.alerta ? ' kpi--alerta' : '') +
      (k.bom ? ' kpi--bom' : '') +
      (k.ambar ? ' kpi--ambar' : '') + '">' +
      '<div class="kpi__n kpi__n--eur">' + k.n + '</div>' +
      '<div class="kpi__u">' + k.u + '</div>' +
    '</div>'
  ).join('');

  $('#cobranca-barra').innerHTML =
    '<div class="cobranca__parte cobranca__parte--pago" style="width:' + pctCobrado + '%"></div>' +
    '<div class="cobranca__parte cobranca__parte--divida" style="width:' + (100 - pctCobrado) + '%"></div>';

  $('#cobranca-leg').innerHTML =
    '<span><span class="ponto ponto--pago"></span> Cobrado &middot; ' + pctCobrado + '% do faturado</span>' +
    '<span><span class="ponto ponto--divida"></span> Por cobrar &middot; ' + (100 - pctCobrado) + '%</span>' +
    '<span>' + porReceber.length + ' faturas por receber</span>';

  /* O que a folha não explica fica dito em voz alta, não escondido num total */
  const avisos = [];

  if (totalExtra) {
    extra.forEach(e => {
      avisos.push('<b>' + texto(e.cliente) + ' &middot; ' + euros(e.valor) + ' recebidos sem fatura na folha.</b> ' +
                  texto(e.nota) + '.');
    });
  }
  if (porFaturar.length) {
    avisos.push('<b>' + porFaturar.map(f => texto(f.cliente)).join(', ') +
                ' está fechado mas por faturar</b> &mdash; ' + euros(aFaturar) +
                ' que ainda nem começaram a contar o prazo de pagamento.');
  }
  if (previsto.length) {
    avisos.push('<b>Setembro traz ' + euros(soma(previsto, 'total')) + ' em pipeline</b>, ' +
                'dos quais ' + euros(previsto[0].total) + ' são da ' + texto(previsto[0].cliente) +
                ' &mdash; sozinha, mais de metade do mês.');
  }

  $('#realce').innerHTML = avisos.map(a => '<p class="realce__l">' + a + '</p>').join('');

  /* ------------------------------------------------------------------------
     02 — Faturas
     ------------------------------------------------------------------------ */

  const ORDEM = ['por-receber', 'por-faturar', 'recebido', 'previsto'];

  const FILTROS = [
    { id: 'todas',       rot: 'Todas',        f: () => true },
    { id: 'por-receber', rot: 'Por receber',  f: f => f.estado === 'por-receber' },
    { id: 'por-faturar', rot: 'Por faturar',  f: f => f.estado === 'por-faturar' },
    { id: 'recebido',    rot: 'Recebidas',    f: f => f.estado === 'recebido' },
    { id: 'previsto',    rot: 'Setembro',     f: f => f.estado === 'previsto' }
  ];

  let filtro = FILTROS[0];

  function linha(f) {
    const e = ESTADO[f.estado];
    return '<div class="linha linha--fat linha--' + e.cor + '">' +
      '<div>' +
        '<div class="linha__nome">' + texto(f.cliente) + '</div>' +
        '<div class="linha__tipo">' + (f.n ? 'Fatura ' + texto(f.n) : 'Sem fatura') +
          ' &middot; ' + texto(f.mes) + '</div>' +
      '</div>' +
      '<div class="linha__tipo">' + (f.tipo === 'avenca' ? 'Avença' : 'One-shot') + '</div>' +
      '<div class="linha__eur">' + euros(f.total, true) +
        '<span class="linha__liq">' + euros(f.liquido, true) + ' sem IVA</span>' +
      '</div>' +
      '<div class="pastilha pastilha--' + e.cor + '">' + e.rot + '</div>' +
    '</div>';
  }

  function desenharLista() {
    const visiveis = FATURAS.filter(filtro.f)
      .slice()
      .sort((a, b) => (ORDEM.indexOf(a.estado) - ORDEM.indexOf(b.estado)) || (b.total - a.total));

    const total = soma(visiveis, 'total');

    $('#lista').innerHTML = visiveis.length
      ? visiveis.map(linha).join('') +
        '<div class="linha linha--soma">' +
          '<div class="linha__nome">' + visiveis.length + ' linhas</div>' +
          '<div></div>' +
          '<div class="linha__eur">' + euros(total, true) + '</div>' +
          '<div></div>' +
        '</div>'
      : '<div class="linha"><div class="linha__tipo">Nada nesta lista.</div></div>';
  }

  $('#filtros').innerHTML = FILTROS.map(f =>
    '<button class="filtro" type="button" data-id="' + f.id + '" ' +
    'aria-pressed="' + (f.id === 'todas') + '">' + f.rot + '</button>'
  ).join('');

  $('#filtros').addEventListener('click', e => {
    const b = e.target.closest('.filtro');
    if (!b) return;
    filtro = FILTROS.find(f => f.id === b.dataset.id);
    $$('.filtro').forEach(o => o.setAttribute('aria-pressed', o === b ? 'true' : 'false'));
    desenharLista();
  });

  desenharLista();

  /* ------------------------------------------------------------------------
     03 — Custos
     ------------------------------------------------------------------------ */

  const custoTotal = CUSTOS.reduce((t, c) => t + c.valor, 0);
  const margem = VENDAS_MODELO - custoTotal;

  /* Quanto do mês já está coberto pelo que entrou mesmo em conta */
  const cobertura = Math.round(recebidoTotal / custoTotal * 100);

  $('#kpis-custos').innerHTML = [
    { n: euros(custoTotal),     u: 'de custo<br>por mês' },
    { n: euros(VENDAS_MODELO),  u: 'de faturação<br>que a folha assume' },
    { n: euros(margem),         u: 'de margem<br>nesse cenário', bom: true },
    { n: cobertura + '%',       u: 'do custo do mês<br>coberto pelo que entrou',
      alerta: cobertura < 100, bom: cobertura >= 100 }
  ].map(k =>
    '<div class="kpi' +
      (k.alerta ? ' kpi--alerta' : '') +
      (k.bom ? ' kpi--bom' : '') + '">' +
      '<div class="kpi__n kpi__n--eur">' + k.n + '</div>' +
      '<div class="kpi__u">' + k.u + '</div>' +
    '</div>'
  ).join('');

  const maiorCusto = Math.max.apply(null, CUSTOS.map(c => c.valor));

  $('#custos').innerHTML = CUSTOS.map(c =>
    '<div class="custo">' +
      '<div class="custo__r">' + texto(c.rubrica) + '</div>' +
      '<div class="custo__b"><span style="width:' +
        Math.round(c.valor / maiorCusto * 100) + '%"></span></div>' +
      '<div class="custo__v">' + euros(c.valor) + '</div>' +
    '</div>'
  ).join('');

  $('#nota-custos').innerHTML =
    'Estes são valores de um mês típico, do separador <b>Costs</b> da folha — não o ' +
    'fecho de agosto. A faturação de ' + euros(VENDAS_MODELO) + ' é a que a folha assume ' +
    'para dar a margem. Agosto faturou ' + euros(faturadoTotal) + ' com IVA e entraram ' +
    euros(recebidoTotal) + ' em conta' +
    (recebidoTotal > faturadoTotal
      ? ' — mais do que o faturado, porque ' + euros(totalExtra) +
        ' entraram sem fatura correspondente na folha.'
      : '.');

  /* ------------------------------------------------------------------------ */

  if (typeof FIN_PERIODO === 'string') {
    $('#foot-periodo').textContent = 'Folha de faturação · ' + FIN_PERIODO;
  }

  function abrirPeloEndereco() {
    const i = paineis.findIndex(p => '#' + p.id === location.hash);
    if (i >= 0) mostrar(i);
  }

  abrirPeloEndereco();
  window.addEventListener('hashchange', abrirPeloEndereco);

})();
