/* ==========================================================================
   Kelux AI — Back office interno
   Dados de exemplo.

   Tudo neste ficheiro é fictício e serve apenas para a versão de apresentação.
   Quando existir backend, isto é substituído por dados reais.

   Para colocar as fotos da equipa: guardar os ficheiros em assets/img/
   e preencher o campo "foto" de cada pessoa (ex.: "assets/img/marly.jpg").
   ========================================================================== */

const EQUIPA = [
  { id:'marly',   nome:'Marly',   foto:null, linha:'Descrição por definir.' },
  { id:'ruben',   nome:'Rúben',   foto:null, linha:'Descrição por definir.' },
  { id:'ze',      nome:'Zé',      foto:null, linha:'Descrição por definir.' },
  { id:'tiago',   nome:'Tiago',   foto:null, linha:'Descrição por definir.' },
  { id:'ricardo', nome:'Ricardo', foto:null, linha:'Descrição por definir.' }
];

/* A escada de metas — ajusta-se sozinha todos os domingos à noite */
const ESCADA = {
  degraus: [10, 15, 20, 25, 30, 35, 40, 45, 50],
  metaInicial: 15,
  metaAtual: 15
};

/* Reuniões marcadas e taxa de no-show, por vista.
   ns = percentagem de reuniões marcadas que o cliente não compareceu. */
const RANKING = {
  semana: {
    etiqueta: 'esta semana',
    total: 17,
    dados: [
      { id:'marly',   reunioes:5, ns:0  },
      { id:'ruben',   reunioes:4, ns:25 },
      { id:'ze',      reunioes:3, ns:0  },
      { id:'tiago',   reunioes:3, ns:33 },
      { id:'ricardo', reunioes:2, ns:0  }
    ]
  },
  mes: {
    etiqueta: 'este mês',
    total: 71,
    dados: [
      { id:'marly',   reunioes:18, ns:11 },
      { id:'ruben',   reunioes:16, ns:19 },
      { id:'ze',      reunioes:14, ns:7  },
      { id:'tiago',   reunioes:12, ns:25 },
      { id:'ricardo', reunioes:11, ns:9  }
    ]
  },
  ano: {
    etiqueta: 'este ano',
    total: 571,
    dados: [
      { id:'marly',   reunioes:142, ns:13 },
      { id:'ruben',   reunioes:128, ns:17 },
      { id:'ze',      reunioes:117, ns:10 },
      { id:'tiago',   reunioes:96,  ns:21 },
      { id:'ricardo', reunioes:88,  ns:12 }
    ]
  }
};

/* Recorde histórico da equipa numa única semana */
const RECORDE = { valor: 24, quando: 'semana de 11 mai 2026' };

/* Tabela de simulação de comissões — escalões genéricos, sem nomes */
const COMISSOES = [
  { avenca: '750 €',   mes: '112,50 €', total: '1.350 €' },
  { avenca: '1.250 €', mes: '187,50 €', total: '2.250 €' },
  { avenca: '1.500 €', mes: '225 €',    total: '2.700 €' },
  { avenca: '1.700 €', mes: '255 €',    total: '3.060 €' }
];

/* Ficha de lead — exemplo visual dos campos */
const FICHA_EXEMPLO = {
  campos: [
    { k:'Empresa',              v:'Metalúrgica Serra Norte, Lda.' },
    { k:'Website',              v:'serranorte.pt' },
    { k:'Pessoa',               v:'Helena Marques' },
    { k:'Cargo',                v:'Diretora de Operações' },
    { k:'Indústria',            v:'Metalomecânica' },
    { k:'Dimensão da empresa',  v:'40 a 80 pessoas' },
    { k:'Email',                v:'h.marques@serranorte.pt' },
    { k:'Telefone',             v:'+351 9XX XXX XXX' },
    { k:'Origem',               v:'Agente — pesquisa GEO' },
    { k:'Quem adicionou',       v:'Agente Kelux' },
    { k:'Quem marcou a reunião',v:'Rúben' },
    { k:'Estado do pipeline',   v:'Reunião marcada' },
    { k:'Nível de interesse',   v:'Alto' },
    { k:'Produto de interesse', v:'Automação de processos · 1.500 €/mês' },
    { k:'Próxima ação',         v:'Reunião — 3 set 2026, 10h00' },
    { k:'Motivo de perda',      v:'—' }
  ],
  automaticos: [
    { k:'Último contacto',      v:'21 ago 2026' },
    { k:'Meio do último contacto', v:'Chamada' }
  ],
  notas: 'Já tentaram um CRM há dois anos, ninguém o usou. Sensível a tempo de implementação. Decisão partilhada com o CEO.',
  historico: [
    { data:'12 ago 2026', meio:'Email',   resultado:'Sem resposta',      nota:'Primeiro contacto do agente.' },
    { data:'14 ago 2026', meio:'LinkedIn',resultado:'Respondeu',         nota:'Pediu para falar depois de férias.' },
    { data:'19 ago 2026', meio:'Email',   resultado:'Respondeu',         nota:'Disponível a partir de dia 21.' },
    { data:'21 ago 2026', meio:'Chamada', resultado:'Reunião marcada',   nota:'Agendada para 3 de setembro, 10h00.' }
  ]
};
