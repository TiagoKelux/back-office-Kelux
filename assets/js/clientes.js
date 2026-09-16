/* ==========================================================================
   Kelux AI — Back office interno
   Gestão de clientes: separadores, mapa de bolas e termómetro.
   Sem dependências. Os dados vêm de assets/js/clientes-dados.js
   ========================================================================== */

(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const pessoa = id => EQUIPA.find(p => p.id === id) || { nome: id, foto: null };

  const DIA = 86400000;

  /* Hoje à meia-noite, para a contagem de dias não variar com a hora a que se abre */
  function hoje() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  const diasDesde = iso => Math.max(0, Math.round((hoje() - Date.parse(iso)) / DIA));

  /* Estado do termómetro — a regra vive em TERMOMETRO, não aqui */
  function estado(dias) {
    if (dias > TERMOMETRO.critico) return 'critico';
    if (dias > TERMOMETRO.vermelho) return 'vermelho';
    return 'em-dia';
  }

  const ETIQUETA = { 'em-dia': 'Em dia', 'vermelho': 'Vermelho', 'critico': 'Crítico' };

  const CANAL = {
    chamada: 'Chamada', email: 'Email', reuniao: 'Reunião', mensagem: 'Mensagem'
  };

  const RITMO = {
    semanal: 'Ponto semanal', quinzenal: 'Ponto quinzenal', mensal: 'Ponto mensal'
  };

  /* Cada cliente com o que é calculado a partir da data */
  const carteira = CLIENTES.map(c => {
    const dias = diasDesde(c.ultimaInteracao);
    return Object.assign({}, c, { dias: dias, estado: estado(dias) });
  });

  const emRisco  = carteira.filter(c => c.estado !== 'em-dia');
  const semRitmo = carteira.filter(c => !c.pontoSituacao);

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const texto = s => String(s).replace(/[&<>"]/g, m => ESCAPES[m]);

  /* ------------------------------------------------------------------------
     Separadores
     ------------------------------------------------------------------------ */

  const paineis = $$('.painel');
  const tabs = $('#tabs');
  const botoes = [];

  function mostrar(i) {
    paineis.forEach((p, n) => p.classList.toggle('is-on', n === i));
    botoes.forEach((b, n) => b.setAttribute('aria-selected', n === i ? 'true' : 'false'));
    history.replaceState(null, '', '#' + paineis[i].id);
    esconderDica();
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

  /* Setas navegam entre separadores, como num back office a sério */
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
     01 — Dashboard
     ------------------------------------------------------------------------ */

  const avencas  = carteira.filter(c => c.tipo === 'avenca');
  const oneshots = carteira.filter(c => c.tipo === 'oneshot');

  $('#kpis').innerHTML = [
    { n: carteira.length, u: 'clientes ativos<br>ao dia de hoje' },
    { n: avencas.length,  u: 'em avença<br>todos os meses' },
    { n: oneshots.length, u: 'one-shot<br>trabalho pontual' },
    { n: emRisco.length,  u: 'sem contacto<br>há mais de 5 dias', alerta: true }
  ].map(k =>
    '<div class="kpi' + (k.alerta ? ' kpi--alerta' : '') + '">' +
      '<div class="kpi__n">' + k.n + '</div>' +
      '<div class="kpi__u">' + k.u + '</div>' +
    '</div>'
  ).join('');

  const pctAvenca = carteira.length
    ? Math.round(avencas.length / carteira.length * 100)
    : 0;

  $('#split-barra').innerHTML =
    '<div class="split__parte split__parte--avenca" style="width:' + pctAvenca + '%"></div>' +
    '<div class="split__parte split__parte--oneshot" style="width:' + (100 - pctAvenca) + '%"></div>';

  $('#split-leg').innerHTML =
    '<span><span class="split__ponto split__ponto--avenca"></span> Avença &middot; ' +
      avencas.length + ' de ' + carteira.length + '</span>' +
    '<span><span class="split__ponto split__ponto--oneshot"></span> One-shot &middot; ' +
      oneshots.length + ' de ' + carteira.length + '</span>' +
    (semRitmo.length
      ? '<span>' + semRitmo.length + ' sem ponto de situação definido</span>'
      : '');

  /* ------------------------------------------------------------------------
     02 — A constelação

     Cada cliente é um planeta: corpo esférico, com o lado iluminado virado
     à mesma estrela, superfície a girar devagar e um fio de luz na borda.
     O raio vai pela raiz do peso — é a área que o olho compara, não o raio.

     Não se tocam. Cada um tem o seu espaço e vagueia, sem nunca chocar.
     ------------------------------------------------------------------------ */

  const CEU = { l: 1000, a: 580, margem: 26 };

  /* Aleatório com semente: o céu é sempre o mesmo de cada vez que se abre,
     senão os clientes saltavam de sítio a cada recarregamento */
  function semente(s) {
    let x = s;
    return function () {
      x = (x * 1664525 + 1013904223) % 4294967296;
      return x / 4294967296;
    };
  }

  function arrumar(itens) {
    const pesoMax = Math.max.apply(null, itens.map(c => c.peso));
    const sorte = semente(20260816);
    const postas = [];

    itens.slice()
      .sort((a, b) => b.peso - a.peso)
      .forEach(c => {
        const r = 14 + 48 * Math.sqrt(c.peso / pesoMax);
        let melhor = null, melhorFolga = -Infinity;

        // Atira-se um punhado de posições e fica sempre a que mais respira —
        // o céu enche-se por igual em vez de amontoar tudo a um canto
        for (let t = 0; t < 700; t++) {
          const x = CEU.margem + r + sorte() * (CEU.l - 2 * (CEU.margem + r));
          const y = CEU.margem + r + sorte() * (CEU.a - 2 * (CEU.margem + r));

          let folga = Infinity;
          for (const p of postas) {
            const dx = p.x - x, dy = p.y - y;
            folga = Math.min(folga, Math.sqrt(dx * dx + dy * dy) - p.r - r);
          }
          if (folga === Infinity) folga = CEU.l;              // o primeiro
          if (folga > melhorFolga) { melhorFolga = folga; melhor = { x, y, r, c }; }
        }

        if (melhor) postas.push(melhor);
      });

    return postas;
  }
  /* --------------------------------------------------------------------
     O fundo do céu.

     Tudo aqui é deliberadamente pequeno e ténue: são pontinhos, e não podem
     roubar atenção às galáxias dos clientes, que são o assunto da página.
     -------------------------------------------------------------------- */

  /* As cores verdadeiras das estrelas: a maioria é alaranjada e fraca, as
     brancas e azuis são poucas mas são as que se vêem melhor */
  const CORES_ESTRELA = [
    'e-fria', 'e-fria', 'e-fria', 'e-fria',
    'e-sol', 'e-sol', 'e-sol',
    'e-branca', 'e-branca',
    'e-quente'
  ];

  function plano(s, quantos, rMax, opMax) {
    const sorte = semente(s);
    let saida = '';
    for (let i = 0; i < quantos; i++) {
      const x = (sorte() * CEU.l).toFixed(1);
      const y = (sorte() * CEU.a).toFixed(1);
      // Raio ao cubo: muitíssimas minúsculas, pouquíssimas grandes —
      // é essa proporção que faz um céu parecer um céu
      const r = (0.34 + Math.pow(sorte(), 3) * rMax).toFixed(2);
      const o = (0.10 + Math.pow(sorte(), 1.7) * opMax).toFixed(2);
      const d = (sorte() * 12).toFixed(1);
      const t = (4.5 + sorte() * 9).toFixed(1);
      const cor = CORES_ESTRELA[Math.floor(sorte() * CORES_ESTRELA.length)];
      saida += '<circle class="po ' + cor + '" cx="' + x + '" cy="' + y + '" r="' + r +
               '" style="--o:' + o + ';--pisca:' + t + 's;animation-delay:-' + d + 's"></circle>';
    }
    return saida;
  }

  /* A faixa da Via Láctea: uma diagonal onde as estrelas se acumulam, com
     manchas escuras de poeira a cortá-la. É o que tira o ar de papel de
     parede a um fundo estrelado. */
  function viaLactea() {
    const sorte = semente(5150);
    const ang = -24 * Math.PI / 180;
    const cx = CEU.l * 0.5, cy = CEU.a * 0.46;
    let saida = '';

    for (let i = 0; i < 520; i++) {
      // Ao longo da faixa é uniforme; de través concentra-se no meio
      const u = (sorte() - 0.5) * CEU.l * 1.5;
      const g1 = sorte() + sorte() + sorte() - 1.5;          // quase uma gaussiana
      const v = g1 * CEU.a * 0.16;

      const x = (cx + u * Math.cos(ang) - v * Math.sin(ang)).toFixed(1);
      const y = (cy + u * Math.sin(ang) + v * Math.cos(ang)).toFixed(1);
      if (x < -20 || x > CEU.l + 20 || y < -20 || y > CEU.a + 20) continue;

      const r = (0.3 + Math.pow(sorte(), 3.4) * 0.8).toFixed(2);
      const o = (0.09 + Math.pow(sorte(), 2) * 0.4).toFixed(2);
      const cor = CORES_ESTRELA[Math.floor(sorte() * CORES_ESTRELA.length)];
      saida += '<circle class="po ' + cor + '" cx="' + x + '" cy="' + y +
               '" r="' + r + '" style="--o:' + o + '"></circle>';
    }

    // Manchas escuras de poeira por cima da faixa
    for (let i = 0; i < 7; i++) {
      const u = (sorte() - 0.5) * CEU.l * 1.1;
      const v = (sorte() - 0.5) * CEU.a * 0.22;
      const x = (cx + u * Math.cos(ang) - v * Math.sin(ang)).toFixed(1);
      const y = (cy + u * Math.sin(ang) + v * Math.cos(ang)).toFixed(1);
      const rx = (60 + sorte() * 130).toFixed(1);
      const ry = (16 + sorte() * 34).toFixed(1);
      const rot = (-24 + (sorte() - 0.5) * 40).toFixed(1);
      const op = (0.26 + sorte() * 0.2).toFixed(2);
      saida += '<ellipse class="po__escuro" cx="' + x + '" cy="' + y + '" rx="' + rx +
               '" ry="' + ry + '" opacity="' + op +
               '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"></ellipse>';
    }

    return saida;
  }

  /* Galáxias muito distantes — manchinhas de nada, no fundo do quadro.
     Não são clientes: é só profundidade. */
  function galaxiasDistantes() {
    const sorte = semente(60607);
    let saida = '';
    for (let i = 0; i < 13; i++) {
      const x = (sorte() * CEU.l).toFixed(1);
      const y = (sorte() * CEU.a).toFixed(1);
      const rx = (2.2 + sorte() * 4.5).toFixed(2);
      const ry = (rx * (0.28 + sorte() * 0.5)).toFixed(2);
      const rot = (sorte() * 180).toFixed(1);
      const o = (0.07 + sorte() * 0.13).toFixed(2);
      saida += '<ellipse class="gal-longe" cx="' + x + '" cy="' + y + '" rx="' + rx +
               '" ry="' + ry + '" opacity="' + o +
               '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"></ellipse>';
    }
    return saida;
  }

  /* Meia dúzia de estrelas maiores, com brilho próprio e cintilação lenta */
  function estrelas() {
    const sorte = semente(31337);
    let saida = '';
    for (let i = 0; i < 16; i++) {
      const x = (sorte() * CEU.l).toFixed(1);
      const y = (sorte() * CEU.a).toFixed(1);
      const r = (2.2 + sorte() * 3).toFixed(2);
      const o = (0.2 + sorte() * 0.34).toFixed(2);
      const d = (sorte() * 14).toFixed(1);
      const t = (7 + sorte() * 8).toFixed(1);
      saida += '<circle class="po po--viva" cx="' + x + '" cy="' + y + '" r="' + r +
               '" style="--o:' + o + ';--pisca:' + t + 's;animation-delay:-' + d + 's"></circle>';
    }
    return saida;
  }

  /* Cometas: passam de vez em quando e desaparecem. A animação dura muito
     mais do que a passagem — o cometa só é visível nos primeiros instantes
     do ciclo, e o resto do tempo está à espera, fora de vista. */
  function cometas() {
    const sorte = semente(1066);
    let saida = '';
    for (let i = 0; i < 4; i++) {
      const x0 = (sorte() * CEU.l * 0.8).toFixed(1);
      const y0 = (sorte() * CEU.a * 0.9).toFixed(1);
      const ang = (-40 + sorte() * 80).toFixed(1);
      const dist = (320 + sorte() * 420).toFixed(0);
      const dur = (26 + sorte() * 40).toFixed(1);
      const atraso = (-sorte() * 60).toFixed(1);
      const cauda = (26 + sorte() * 40).toFixed(1);

      saida += '<g transform="translate(' + x0 + ',' + y0 + ') rotate(' + ang + ')">' +
                 '<g class="cometa" style="--dist:' + dist + 'px;--dur:' + dur +
                    's;animation-delay:' + atraso + 's">' +
                   '<path class="cometa__cauda" d="M0 0 L -' + cauda + ' 0"></path>' +
                   '<circle class="cometa__cabeca" r="1.1"></circle>' +
                 '</g>' +
               '</g>';
    }
    return saida;
  }


  /* Nebulosa — três manchas muito ténues que respiram, só para o fundo não
     ser um preto chapado por trás dos planetas */
  function nebulosa() {
    const sorte = semente(9091);
    let saida = '';
    const cores = ['neb-quente', 'neb-fria', 'neb-quente'];
    for (let i = 0; i < 3; i++) {
      const cx = (120 + sorte() * (CEU.l - 240)).toFixed(1);
      const cy = (90 + sorte() * (CEU.a - 180)).toFixed(1);
      const rx = (190 + sorte() * 190).toFixed(1);
      const ry = (110 + sorte() * 110).toFixed(1);
      const ang = (-30 + sorte() * 60).toFixed(1);
      const t = (48 + sorte() * 40).toFixed(1);
      const d = (sorte() * 40).toFixed(1);
      // A rotação fica na elipse e a respiração no grupo: se fossem no mesmo
      // elemento, a animação CSS apagava o atributo transform
      saida += '<g class="neb" style="--resp:' + t + 's;animation-delay:-' + d + 's">' +
                 '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
                   '" fill="url(#' + cores[i] + ')" ' +
                   'transform="rotate(' + ang + ' ' + cx + ' ' + cy + ')"></ellipse>' +
               '</g>';
    }
    return saida;
  }
  /* O feitio de cada galáxia sai do id do cliente, e não da ordem por que são
     desenhadas: o mesmo cliente tem sempre a mesma galáxia, abertura após
     abertura. Dois clientes do mesmo tamanho nunca ficam iguais. */
  function codigo(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return semente((h >>> 0) || 1);
  }

  /* Quatro famílias, como no céu a sério:
       espiral   — braços abertos a sair do bojo
       barrada   — uma barra ao meio, e os braços a nascer das pontas
       eliptica  — sem braços, um enxame de estrelas velhas
       perfil    — vista de canto, com a faixa de poeira a cortá-la ao meio */
  const FAMILIAS = ['espiral', 'barrada', 'espiral', 'eliptica', 'barrada', 'perfil'];

  function feitio(p) {
    const sorte = codigo(p.c.id);
    const familia = FAMILIAS[Math.floor(sorte() * FAMILIAS.length)];

    return {
      familia: familia,
      bracos: 2 + Math.floor(sorte() * 2),
      voltas: 1.05 + sorte() * 0.85,
      sentido: sorte() > 0.5 ? 1 : -1,
      // Uma galáxia quase nunca se vê de frente. A vista de perfil é quase uma linha.
      achatar: familia === 'perfil'   ? 0.10 + sorte() * 0.07
             : familia === 'eliptica' ? 0.58 + sorte() * 0.28
             :                          0.30 + sorte() * 0.44,
      inclinar: -70 + sorte() * 140,
      bojo: 0.15 + sorte() * 0.09,
      giro: (90 + sorte() * 110).toFixed(1),
      campo: (150 + sorte() * 120).toFixed(1),
      dur: (32 + sorte() * 26).toFixed(1),
      atraso: (sorte() * -40).toFixed(1),
      dx: (5 + sorte() * 9).toFixed(1),
      dy: (4 + sorte() * 8).toFixed(1),
      resp: (14 + sorte() * 12).toFixed(1),
      sorte: sorte
    };
  }

  /* Um ponto do braço, à distância t do centro (0 a 1).
     É uma espiral logarítmica: o ângulo cresce e o raio cresce com ele. */
  function noBraco(r, f, base, t, inicio) {
    const ang = base + f.sentido * t * f.voltas * Math.PI * 2;
    const raio = r * (inicio + (1 - inicio) * Math.pow(t, 0.82));
    return { ang: ang, raio: raio };
  }

  /* As estrelas dos braços.

     Três populações, como nas fotografias a sério: as azuis jovens nascem nos
     braços e são as mais brilhantes, as brancas fazem o corpo do disco, e as
     amarelas velhas concentram-se para dentro. Espalha-se cada uma para fora
     da linha do braço, senão o braço parecia um arame. */
  function bracos(r, f, frio) {
    const sorte = f.sorte;
    if (f.familia === 'eliptica') return '';

    const quantas = Math.round(Math.min(620, Math.max(150, r * 9)));
    const porBraco = Math.round(quantas / f.bracos);
    const inicio = f.familia === 'barrada' ? 0.40 : 0.11;
    let saida = '';

    for (let b = 0; b < f.bracos; b++) {
      const base = (Math.PI * 2 / f.bracos) * b;

      for (let i = 0; i < porBraco; i++) {
        const t = (i + sorte() * 0.9) / porBraco;
        const pt = noBraco(r, f, base, t, inicio);

        // Mais solto na ponta do braço do que junto ao bojo
        const solta = (sorte() - 0.5) * r * (0.05 + t * 0.18);
        const soltaA = (sorte() - 0.5) * (0.20 + t * 0.34);

        const x = Math.cos(pt.ang + soltaA) * (pt.raio + solta);
        const y = Math.sin(pt.ang + soltaA) * (pt.raio + solta);

        const dado = sorte();
        let cor, tam, op;
        if (dado < 0.24) {                       // jovens, nos braços
          cor = frio ? 'e-azul' : 'e-clara';
          tam = 0.34 + sorte() * 0.62;
          op = 0.55 + sorte() * 0.42;
        } else if (dado < 0.78) {                // o corpo do disco
          cor = 'e-branca';
          tam = 0.24 + sorte() * 0.42;
          op = 0.24 + (1 - t) * 0.42;
        } else {                                 // velhas, para dentro
          cor = 'e-velha';
          tam = 0.24 + sorte() * 0.38;
          op = 0.20 + (1 - t) * 0.40;
        }

        saida += '<circle class="' + cor + '" cx="' + x.toFixed(1) + '" cy="' +
                 y.toFixed(1) + '" r="' + tam.toFixed(2) + '" opacity="' +
                 op.toFixed(2) + '"></circle>';
      }
    }

    return saida;
  }

  /* Faixas de poeira — as riscas escuras que seguem a borda de dentro de cada
     braço. São elas que dão relevo: sem poeira, uma galáxia parece um borrão. */
  function poeiraDosBracos(r, f) {
    if (f.familia === 'eliptica') return '';

    if (f.familia === 'perfil') {
      // De canto vê-se uma faixa só, a cortar o disco ao meio
      return '<ellipse class="gal__faixa" rx="' + (r * 0.96).toFixed(1) +
             '" ry="' + (r * 0.13).toFixed(1) + '"></ellipse>';
    }

    const inicio = f.familia === 'barrada' ? 0.40 : 0.11;
    let saida = '';

    for (let b = 0; b < f.bracos; b++) {
      const base = (Math.PI * 2 / f.bracos) * b - 0.20 * f.sentido;
      let d = '';
      for (let i = 0; i <= 22; i++) {
        const pt = noBraco(r, f, base, i / 22, inicio);
        const x = (Math.cos(pt.ang) * pt.raio).toFixed(1);
        const y = (Math.sin(pt.ang) * pt.raio).toFixed(1);
        d += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
      }
      saida += '<path class="gal__luz" d="' + d.trim() + '" stroke-width="' +
               (r * 0.30).toFixed(1) + '"></path>';
      saida += '<path class="gal__poeira" d="' + d.trim() + '" stroke-width="' +
               (r * 0.062).toFixed(1) + '"></path>';
    }

    return saida;
  }

  /* Berçários de estrelas: os nós cor-de-rosa onde o gás está a arder.
     São eles que piscam — é o que faz a galáxia parecer viva e não um desenho. */
  function bercarios(r, f) {
    if (f.familia === 'eliptica' || r < 20) return '';

    const sorte = f.sorte;
    const quantos = Math.round(Math.min(16, Math.max(4, r / 7)));
    const inicio = f.familia === 'barrada' ? 0.40 : 0.11;
    let saida = '';

    for (let i = 0; i < quantos; i++) {
      const b = Math.floor(sorte() * f.bracos);
      const base = (Math.PI * 2 / f.bracos) * b;
      const t = 0.25 + sorte() * 0.7;
      const pt = noBraco(r, f, base, t, inicio);
      const solta = (sorte() - 0.5) * r * 0.1;

      const x = (Math.cos(pt.ang) * (pt.raio + solta)).toFixed(1);
      const y = (Math.sin(pt.ang) * (pt.raio + solta)).toFixed(1);
      const tam = (r * (0.028 + sorte() * 0.03)).toFixed(2);
      const t2 = (3.5 + sorte() * 5).toFixed(1);
      const d = (sorte() * 9).toFixed(1);

      saida += '<circle class="gal__hii" cx="' + x + '" cy="' + y + '" r="' + tam +
               '" style="--pisca:' + t2 + 's;animation-delay:-' + d + 's"></circle>';
    }

    return saida;
  }

  /* O enxame de uma elíptica, e o halo esparso que todas têm à volta */
  function enxame(r, f, quantas, dentro, opBase) {
    const sorte = f.sorte;
    let saida = '';
    for (let i = 0; i < quantas; i++) {
      const d = Math.pow(sorte(), dentro) * r;
      const a = sorte() * Math.PI * 2;
      const x = (Math.cos(a) * d).toFixed(1);
      const y = (Math.sin(a) * d).toFixed(1);
      const tam = (0.22 + sorte() * 0.5).toFixed(2);
      const op = (opBase + (1 - d / r) * 0.42).toFixed(2);
      saida += '<circle class="e-velha" cx="' + x + '" cy="' + y + '" r="' + tam +
               '" opacity="' + op + '"></circle>';
    }
    return saida;
  }

  /* A barra central das barradas */
  function barra(r, f) {
    if (f.familia !== 'barrada') return '';
    return '<ellipse class="gal__barra" rx="' + (r * 0.44).toFixed(1) +
           '" ry="' + (r * 0.12).toFixed(1) + '"></ellipse>';
  }

  const DEFS =
    '<defs>' +
      // Bojo — a luz velha e densa do centro
      '<radialGradient id="nuc-avenca">' +
        '<stop offset="0%" stop-color="#FFFBF0"></stop>' +
        '<stop offset="22%" stop-color="#FFE7B8" stop-opacity=".92"></stop>' +
        '<stop offset="52%" stop-color="#E9B76A" stop-opacity=".45"></stop>' +
        '<stop offset="100%" stop-color="#C58A28" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<radialGradient id="nuc-oneshot">' +
        '<stop offset="0%" stop-color="#FFFFFF"></stop>' +
        '<stop offset="22%" stop-color="#E4F0FA" stop-opacity=".92"></stop>' +
        '<stop offset="52%" stop-color="#A8C2D8" stop-opacity=".45"></stop>' +
        '<stop offset="100%" stop-color="#7C93A8" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      // O disco, por baixo das estrelas, para o braço não flutuar no vazio
      '<radialGradient id="disco-avenca">' +
        '<stop offset="0%" stop-color="#F0C275" stop-opacity=".34"></stop>' +
        '<stop offset="58%" stop-color="#C98A2E" stop-opacity=".13"></stop>' +
        '<stop offset="100%" stop-color="#8A5C12" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<radialGradient id="disco-oneshot">' +
        '<stop offset="0%" stop-color="#D6E6F4" stop-opacity=".30"></stop>' +
        '<stop offset="58%" stop-color="#8FA6B8" stop-opacity=".11"></stop>' +
        '<stop offset="100%" stop-color="#5E6B77" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      // Halos
      '<radialGradient id="h-avenca">' +
        '<stop offset="30%" stop-color="#E8B45F" stop-opacity=".26"></stop>' +
        '<stop offset="100%" stop-color="#E8B45F" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<radialGradient id="h-oneshot">' +
        '<stop offset="30%" stop-color="#C3CCD4" stop-opacity=".22"></stop>' +
        '<stop offset="100%" stop-color="#C3CCD4" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<radialGradient id="h-risco">' +
        '<stop offset="34%" stop-color="#D86A4A" stop-opacity=".48"></stop>' +
        '<stop offset="100%" stop-color="#D86A4A" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      // Nebulosas de fundo
      '<radialGradient id="neb-quente">' +
        '<stop offset="0%" stop-color="#7A4E12" stop-opacity=".30"></stop>' +
        '<stop offset="100%" stop-color="#7A4E12" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<radialGradient id="neb-fria">' +
        '<stop offset="0%" stop-color="#2B4256" stop-opacity=".32"></stop>' +
        '<stop offset="100%" stop-color="#2B4256" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<radialGradient id="poeiraEscura">' +
        '<stop offset="0%" stop-color="#05070A" stop-opacity=".9"></stop>' +
        '<stop offset="55%" stop-color="#05070A" stop-opacity=".45"></stop>' +
        '<stop offset="100%" stop-color="#05070A" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<radialGradient id="vinheta" gradientUnits="userSpaceOnUse" ' +
        'cx="500" cy="267" r="700">' +
        '<stop offset="55%" stop-color="#000" stop-opacity="0"></stop>' +
        '<stop offset="100%" stop-color="#000" stop-opacity=".55"></stop>' +
      '</radialGradient>' +
      '<linearGradient id="cauda" x1="0%" x2="100%">' +
        '<stop offset="0%" stop-color="#CFE4FF" stop-opacity="0"></stop>' +
        '<stop offset="100%" stop-color="#FFFFFF" stop-opacity=".85"></stop>' +
      '</linearGradient>' +
      '<radialGradient id="brilho">' +
        '<stop offset="0%" stop-color="#FFF6E2"></stop>' +
        '<stop offset="100%" stop-color="#FFF6E2" stop-opacity="0"></stop>' +
      '</radialGradient>' +
    '</defs>';

  function desenharMapa() {
    const postas = arrumar(carteira);
    if (!postas.length) return;

    const corpos = postas.map(p => {
      const c = p.c;
      const f = feitio(p);
      const r = p.r;
      const frio = c.tipo === 'oneshot';

      const classes = ['bolha', 'bolha--' + c.tipo, 'bolha--' + c.estado,
                       'bolha--' + f.familia].join(' ');

      const legenda = c.nome + ', ' + (c.tipo === 'avenca' ? 'avença' : 'one-shot') +
                      ', último contacto há ' + c.dias + ' dias';
      const halo = c.estado === 'em-dia' ? 'h-' + c.tipo : 'h-risco';

      const estilo = '--dur:' + f.dur + 's;--atraso:' + f.atraso + 's;' +
                     '--dx:' + f.dx + 'px;--dy:' + f.dy + 'px;' +
                     '--giro:' + f.giro + 's;--campo:' + f.campo + 's;' +
                     '--resp:' + f.resp + 's';

      /* A pilha de transformações vive em elementos separados de propósito:
         a posição num atributo, a deriva em CSS, a inclinação noutro atributo
         e a rotação em CSS. Se duas delas partilhassem elemento, a animação
         CSS apagava o atributo transform. */
      return '<g class="gal-pos" transform="translate(' + p.x.toFixed(1) + ',' +
                 p.y.toFixed(1) + ')">' +
               '<g class="' + classes + '" style="' + estilo + '" tabindex="0" ' +
                  'role="img" data-id="' + c.id + '" aria-label="' + texto(legenda) + '">' +

                 '<circle class="halo" r="' + (r * 1.85).toFixed(1) +
                   '" fill="url(#' + halo + ')"></circle>' +

                 // Alvo invisível: sem ele só as estrelas recebiam o rato, e
                 // entre elas o ponteiro caía no vazio. Cobre a galáxia toda
                 // e ainda o nome que fica por baixo.
                 '<circle class="alvo" cy="' + (r * 0.34).toFixed(1) +
                   '" r="' + Math.max(28, r * 1.18).toFixed(1) + '"></circle>' +

                 '<g class="gal__tombo" transform="rotate(' + f.inclinar.toFixed(1) +
                    ') scale(1,' + f.achatar.toFixed(2) + ')">' +

                   // O halo esparso de estrelas velhas roda mais devagar que o disco
                   '<g class="gal__campo">' +
                     enxame(r, f, Math.round(Math.min(90, Math.max(22, r * 1.1))), 1.1, 0.08) +
                   '</g>' +

                   '<ellipse class="gal__disco" rx="' + (r * 0.98).toFixed(1) +
                     '" ry="' + (r * 0.98).toFixed(1) +
                     '" fill="url(#disco-' + c.tipo + ')"></ellipse>' +

                   '<g class="gal__giro">' +
                     poeiraDosBracos(r, f) +
                     barra(r, f) +
                     (f.familia === 'eliptica'
                       ? enxame(r, f, Math.round(Math.min(280, Math.max(60, r * 4))), 1.8, 0.2)
                       : bracos(r, f, frio)) +
                     bercarios(r, f) +
                   '</g>' +
                 '</g>' +

                 '<circle class="gal__nucleo" r="' + (r * f.bojo * 2.8).toFixed(1) +
                   '" fill="url(#nuc-' + c.tipo + ')"></circle>' +

                 '<text y="' + (r + 20).toFixed(1) + '">' + texto(c.nome) + '</text>' +
               '</g>' +
             '</g>';
    }).join('');

    $('#mapa').innerHTML =
      '<svg viewBox="0 0 ' + CEU.l + ' ' + CEU.a + '" preserveAspectRatio="xMidYMid meet" ' +
      'role="group" aria-label="Carteira de clientes: uma galáxia por cliente, ' +
      'maior quanto maior o peso da avença">' +
      DEFS +
      '<g class="neb-grupo">' + nebulosa() + '</g>' +

      // Três planos de profundidade: quanto mais longe, mais ténue e mais
      // devagar se move. É a diferença de velocidade que dá a distância.
      '<g class="po-grupo po-grupo--fundo">' + viaLactea() +
        galaxiasDistantes() + '</g>' +
      '<g class="po-grupo po-grupo--longe">' + plano(7771, 320, 0.9, 0.34) + '</g>' +
      '<g class="po-grupo po-grupo--perto">' + plano(4242, 140, 1.5, 0.55) +
        estrelas() + '</g>' +

      '<g class="cometas">' + cometas() + '</g>' +
      '<g class="galaxia">' + corpos + '</g>' +

      // A vinheta vai por cima de tudo e não recebe o rato: escurece os
      // cantos e puxa o olho para o meio do quadro, como numa objectiva
      '<rect class="vinheta" x="-700" y="-700" width="2400" height="2000" ' +
        'fill="url(#vinheta)"></rect>' +
      '</svg>';
  }

  desenharMapa();

  /* ------------------------------------------------------------------------
     A dica que segue o rato — e abre ao toque, que em telemóvel não há rato
     ------------------------------------------------------------------------ */

  const dica = $('#dica');

  function conteudoDica(c) {
    const p = pessoa(c.owner);
    const retrato = p.foto ? '<img src="' + p.foto + '" alt="">' : '';
    const quando = c.dias === 0 ? 'Falámos hoje'
                 : c.dias === 1 ? 'Há 1 dia'
                 : 'Há ' + c.dias + ' dias';

    return '<div class="dica__n">' + texto(c.nome) + '</div>' +
      '<div>' + (c.tipo === 'avenca' ? 'Avença' : 'One-shot') + '</div>' +
      '<div class="dica__l">' + retrato + '<span>' + texto(p.nome) + ' &middot; owner</span></div>' +
      '<div class="dica__l dica__estado dica__estado--' + c.estado + '">' +
        quando + ' &middot; ' + (CANAL[c.canal] || c.canal) +
      '</div>' +
      (c.pontoSituacao
        ? '<div class="dica__l">' + RITMO[c.pontoSituacao] + '</div>'
        : '<div class="dica__l">Sem ponto de situação definido</div>');
  }

  /* Põe a dica ao lado do corpo apontado, nunca por cima dele: quem aponta
     quer continuar a ver o planeta de que está a ler */
  function porDica(c, x, y, corpo) {
    if (!c) return;
    dica.innerHTML = conteudoDica(c);
    dica.classList.add('is-on');

    const l = dica.offsetWidth, a = dica.offsetHeight;
    const folga = 16;
    const limite = (v, max) => Math.max(12, Math.min(v, max - 12));

    let cx, cy;

    if (corpo) {
      // À direita do planeta; se não couber, à esquerda
      cx = corpo.right + folga;
      if (cx + l > window.innerWidth - 12) cx = corpo.left - folga - l;
      cy = corpo.top + corpo.height / 2 - a / 2;
      // Se nenhum dos lados serve, sai por cima ou por baixo
      if (cx < 12) {
        cx = corpo.left + corpo.width / 2 - l / 2;
        cy = corpo.bottom + folga;
        if (cy + a > window.innerHeight - 12) cy = corpo.top - folga - a;
      }
    } else {
      cx = x + folga;
      cy = y + folga;
    }

    dica.style.left = limite(cx, window.innerWidth - l) + 'px';
    dica.style.top  = limite(cy, window.innerHeight - a) + 'px';
  }

  /* Quando a dica é aberta por clique ou teclado fica presa à bola: o browser
     dá scroll para focar o elemento, e sem isto a dica fugia no mesmo instante */
  let presa = null;

  function esconderDica() {
    presa = null;
    dica.classList.remove('is-on');
  }

  const porId = id => carteira.find(c => c.id === id);

  const mapa = $('#mapa');

  /* O rectângulo do corpo em si — não do grupo, que inclui o halo e o nome */
  function caixa(g) {
    const n = g.querySelector('.nucleo');
    return (n || g).getBoundingClientRect();
  }

  mapa.addEventListener('mousemove', e => {
    const g = e.target.closest('.bolha');
    if (!g) return esconderDica();
    presa = null;
    porDica(porId(g.dataset.id), e.clientX, e.clientY, caixa(g));
  });
  mapa.addEventListener('mouseleave', esconderDica);

  // Toque e teclado — a mesma informação, sem rato
  function dicaNoCentro(g) {
    presa = g;
    const r = caixa(g);
    porDica(porId(g.dataset.id), r.left + r.width / 2, r.top + r.height / 2, r);
  }

  mapa.addEventListener('click', e => {
    const g = e.target.closest('.bolha');
    if (!g) return esconderDica();
    dicaNoCentro(g);
  });
  mapa.addEventListener('focusin', e => {
    const g = e.target.closest('.bolha');
    if (g) dicaNoCentro(g);
  });
  mapa.addEventListener('focusout', esconderDica);
  window.addEventListener('scroll', () => {
    if (presa) dicaNoCentro(presa); else esconderDica();
  }, { passive: true });

  /* ------------------------------------------------------------------------
     03 — Acompanhamento
     ------------------------------------------------------------------------ */

  const FILTROS = [
    { id: 'todos',     rot: 'Todos',                 f: () => true },
    { id: 'risco',     rot: 'A arrefecer',           f: c => c.estado !== 'em-dia' },
    { id: 'critico',   rot: 'Críticos',              f: c => c.estado === 'critico' },
    { id: 'sem-ritmo', rot: 'Sem ponto de situação', f: c => !c.pontoSituacao }
  ];

  let filtro = FILTROS[0];

  function linha(c) {
    const p = pessoa(c.owner);
    const retrato = p.foto ? '<img src="' + p.foto + '" alt="">' : '';
    // A barra enche até ao crítico; daí para cima fica cheia
    const nivel = Math.min(100, Math.round(c.dias / TERMOMETRO.critico * 100));
    const quando = c.dias === 0 ? '<b>Hoje</b>'
                 : c.dias === 1 ? '<b>Há 1 dia</b>'
                 : '<b>Há ' + c.dias + ' dias</b>';

    return '<div class="linha' + (c.estado === 'critico' ? ' linha--critico' : '') + '">' +
      '<div>' +
        '<div class="linha__nome">' + texto(c.nome) +
          (c.pontoSituacao ? '' : '<span class="sem-ritmo">Sem ritmo</span>') +
        '</div>' +
        '<div class="linha__tipo">' + (c.tipo === 'avenca' ? 'Avença' : 'One-shot') + '</div>' +
      '</div>' +
      '<div class="linha__owner">' + retrato + '<span>' + texto(p.nome) + '</span></div>' +
      '<div class="linha__quando">' + quando + '<br>' + (CANAL[c.canal] || c.canal) + '</div>' +
      '<div class="termo termo--' + c.estado + '">' +
        '<span class="termo__barra"><span class="termo__nivel" style="width:' + nivel + '%"></span></span>' +
        '<span class="termo__et">' + ETIQUETA[c.estado] + '</span>' +
      '</div>' +
    '</div>';
  }

  function desenharLista() {
    // Quem está há mais tempo sem contacto aparece primeiro — é quem precisa
    const visiveis = carteira.filter(filtro.f).sort((a, b) => b.dias - a.dias);
    $('#lista').innerHTML = visiveis.length
      ? visiveis.map(linha).join('')
      : '<div class="linha"><div class="linha__quando">Ninguém nesta lista. Bom sinal.</div></div>';
  }

  $('#filtros').innerHTML = FILTROS.map(f =>
    '<button class="filtro" type="button" data-id="' + f.id + '" ' +
    'aria-pressed="' + (f.id === 'todos') + '">' + f.rot + '</button>'
  ).join('');

  $('#filtros').addEventListener('click', e => {
    const b = e.target.closest('.filtro');
    if (!b) return;
    filtro = FILTROS.find(f => f.id === b.dataset.id);
    $$('.filtro', $('#filtros')).forEach(o =>
      o.setAttribute('aria-pressed', o === b ? 'true' : 'false'));
    desenharLista();
  });

  desenharLista();

  /* ------------------------------------------------------------------------
     O céu, à mão — filtrar, contar, andar pelo teclado e sair
     ------------------------------------------------------------------------ */

  const CEU_FILTROS = [
    { id: 'todos',   rot: 'Toda a carteira', f: () => true },
    { id: 'avenca',  rot: 'Avenças',        f: c => c.tipo === 'avenca' },
    { id: 'oneshot', rot: 'One-shot',       f: c => c.tipo === 'oneshot' },
    { id: 'risco',   rot: 'A arrefecer',    f: c => c.estado !== 'em-dia' }
  ];

  let filtroCeu = CEU_FILTROS[0];

  function aplicarFiltroCeu() {
    let dentro = 0;
    $$('.bolha').forEach(g => {
      const c = porId(g.dataset.id);
      const entra = !!c && filtroCeu.f(c);
      // Quem fica de fora apaga-se mas não desaparece: a carteira continua
      // a ser maior do que o filtro, e isso tem de se ver
      g.classList.toggle('bolha--fora', !entra);
      if (entra) dentro++;
    });

    $('#mapa-conta').textContent = dentro === carteira.length
      ? carteira.length + ' clientes'
      : dentro + ' de ' + carteira.length + ' clientes';

    esconderDica();
  }

  $('#filtros-ceu').innerHTML = CEU_FILTROS.map(f =>
    '<button class="filtro" type="button" data-id="' + f.id + '" ' +
    'aria-pressed="' + (f.id === 'todos') + '">' + f.rot + '</button>'
  ).join('');

  $('#filtros-ceu').addEventListener('click', e => {
    const b = e.target.closest('.filtro');
    if (!b) return;
    filtroCeu = CEU_FILTROS.find(f => f.id === b.dataset.id);
    $$('.filtro', $('#filtros-ceu')).forEach(o =>
      o.setAttribute('aria-pressed', o === b ? 'true' : 'false'));
    aplicarFiltroCeu();
  });

  aplicarFiltroCeu();

  /* Setas andam de galáxia em galáxia, por ordem de tamanho; Escape fecha a
     ficha. Quem não usa rato tem de conseguir percorrer o céu na mesma. */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') return esconderDica();

    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (!$('#p2').classList.contains('is-on')) return;
    if (document.activeElement && document.activeElement.closest('.tabs, .filtros')) return;

    const visiveis = $$('.bolha').filter(g => !g.classList.contains('bolha--fora'));
    if (!visiveis.length) return;

    const atual = visiveis.findIndex(g => g === document.activeElement);
    const passo = e.key === 'ArrowRight' ? 1 : -1;
    const alvo = visiveis[(atual + passo + visiveis.length) % visiveis.length];

    e.preventDefault();
    alvo.focus();
    dicaNoCentro(alvo);
  });

  /* Só no fim: mostrar() mexe na dica, que só existe depois de tudo montado */
  function abrirPeloEndereco() {
    const i = paineis.findIndex(p => '#' + p.id === location.hash);
    if (i >= 0) mostrar(i);
  }

  abrirPeloEndereco();
  window.addEventListener('hashchange', abrirPeloEndereco);

  if (typeof CLIENTES_PERIODO === 'string') {
    $('#foot-periodo').textContent = 'Dados de exemplo · ' + CLIENTES_PERIODO;
  }

})();
