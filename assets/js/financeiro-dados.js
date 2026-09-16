/* ==========================================================================
   Kelux AI — Back office interno
   Área financeira — camada de dados.

   ESTE É O ÚNICO FICHEIRO A SUBSTITUIR quando existir base de dados.

   ORIGEM — folha de faturação no Google Sheets, separadores "Invocies" e
   "Costs". Valores copiados tal como lá estão, em euros.

   O QUE VEM DA FOLHA:  nº de fatura, mês, empresa, tipo, valor sem IVA,
                        total com IVA, se está para faturar e se a fatura já
                        foi enviada ao cliente. Mais a estrutura de custos.
   O QUE NÃO VEM:       se o dinheiro entrou. A folha não tem coluna de
                        recebimentos — o campo `recebido` abaixo foi
                        preenchido à mão, com o que foi dito:
                        Superoi e Chambino pagos, o resto por receber.

   Estados de cada linha:
     'recebido'     faturado e o dinheiro entrou
     'por-receber'  fatura emitida e enviada, à espera de pagamento
     'por-faturar'  trabalho fechado, fatura ainda não emitida
     'previsto'     ainda nem trabalho fechado — pipeline do mês seguinte
   ========================================================================== */

const FIN_PERIODO = 'agosto de 2026';
const FIN_HOJE = '2026-09-16';

/* IVA à taxa normal, para reconstruir totais quando for preciso */
const IVA = 0.23;

const FATURAS = [
  /* ---- Agosto: faturas emitidas e enviadas ---- */
  { n:'2026/1', mes:'Agosto', cliente:'Chambino Areias',    tipo:'avenca',  liquido:350.00,   total:430.50,   estado:'recebido'    },
  { n:'2026/5', mes:'Agosto', cliente:'Superoi',            tipo:'oneshot', liquido:4065.04,  total:5000.00,  estado:'recebido'    },
  { n:'2026/2', mes:'Agosto', cliente:'Sigmaconstellation', tipo:'oneshot', liquido:1200.00,  total:1476.00,  estado:'por-receber' },
  { n:'2026/3', mes:'Agosto', cliente:'Datelka',            tipo:'avenca',  liquido:1100.00,  total:1353.00,  estado:'por-receber' },
  { n:'2026/4', mes:'Agosto', cliente:'ActionCoach Porto',  tipo:'avenca',  liquido:2500.00,  total:3075.00,  estado:'por-receber' },

  /* ---- Agosto: fechado mas ainda por faturar (na folha, "Faturar: não") ---- */
  { n:null,     mes:'Agosto', cliente:'Um Mais Um',         tipo:'oneshot', liquido:500.00,   total:615.00,   estado:'por-faturar' },

  /* ---- Setembro: pipeline, sem nº de fatura atribuído ---- */
  { n:null, mes:'Setembro', cliente:'Fidelidade',       tipo:'avenca', liquido:10000.00, total:12300.00, estado:'previsto' },
  { n:null, mes:'Setembro', cliente:'ActionCoach Porto', tipo:'avenca', liquido:2500.00,  total:3075.00,  estado:'previsto' },
  { n:null, mes:'Setembro', cliente:'KW',               tipo:'avenca', liquido:1800.00,  total:2214.00,  estado:'previsto' },
  { n:null, mes:'Setembro', cliente:'Pop',              tipo:'avenca', liquido:1400.00,  total:1722.00,  estado:'previsto' },
  { n:null, mes:'Setembro', cliente:'Datelka',          tipo:'avenca', liquido:1100.00,  total:1353.00,  estado:'previsto' },
  { n:null, mes:'Setembro', cliente:'VW',               tipo:'avenca', liquido:500.00,   total:615.00,   estado:'previsto' },
  { n:null, mes:'Setembro', cliente:'Inercor / Chambino', tipo:'avenca', liquido:350.00, total:430.50,   estado:'previsto' }
];

/* Recebimentos que não correspondem a nenhuma fatura da folha.
   A Superoi é do Ricardo, sócio. Entraram 5.000 € da fatura 2026/5 e mais
   6.000 € que ainda não têm fatura emitida — falta perceber a que respeitam. */
const EXTRA_RECEBIDO = [
  { cliente:'Superoi', valor:6000.00, nota:'Entrada sem fatura na folha — por esclarecer' }
];

/* Estrutura de custos mensal, separador "Costs".
   São valores de mês típico, não o fecho de agosto. */
const CUSTOS = [
  { rubrica:'Others',    valor:4000 },
  { rubrica:'Managers',  valor:3000 },
  { rubrica:'IT Dev',    valor:2000 },
  { rubrica:'Finance',   valor:1000 },
  { rubrica:'Designer',  valor:670  }
];

/* Faturação mensal que a folha assume para esta estrutura de custos */
const VENDAS_MODELO = 17000;
