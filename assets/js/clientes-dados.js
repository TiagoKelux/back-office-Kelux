/* ==========================================================================
   Kelux AI — Back office interno
   Gestão de clientes — camada de dados.

   ESTE É O ÚNICO FICHEIRO A SUBSTITUIR quando existir base de dados.
   Tudo o resto (clientes.js) lê daqui e não sabe de onde vêm os dados.

   ORIGEM — folha de faturação, separador principal, linhas de AGOSTO de 2026.
   Setembro já lá está mas fica de fora, como combinado.

   O QUE VEM DA FOLHA:  nome da empresa, tipo (avença / one-shot) e o peso,
                        calculado a partir do valor faturado.
   O QUE NÃO VEM:       owner, última interação, canal e ponto de situação.
                        A folha de faturação não tem nada disso. Os valores
                        abaixo são inventados, só para o ecrã ter o que mostrar
                        — têm de ser corrigidos antes de isto ir à equipa.

   Forma de cada cliente — espelha as tabelas que a BD vai ter:

     id              chave, minúsculas sem espaços
     nome            como aparece no ecrã
     tipo            'avenca' | 'oneshot'
     peso            peso relativo, 1 a 100, do valor faturado no mês
                     face ao maior desse mês.
                     O VALOR EM EUROS NÃO ESTÁ NESTE FICHEIRO, de propósito:
                     a página é vista por toda a equipa e o que chega ao
                     browser chega a toda a gente. Quando houver base de dados,
                     é o servidor que calcula o peso e só envia o peso.
     owner           id de alguém em EQUIPA (assets/js/dados.js)
     ultimaInteracao data ISO do último contacto, seja de que tipo for
     canal           'chamada' | 'email' | 'reuniao' | 'mensagem'
     pontoSituacao   'semanal' | 'quinzenal' | 'mensal' | null
                     null = não tem ponto de situação definido, fica sinalizado
   ========================================================================== */

/* Mês que os dados representam — aparece no rodapé dos separadores */
const CLIENTES_PERIODO = 'agosto de 2026';

const CLIENTES = [
  /* ----- Avenças ----- */
  { id:'actioncoach', nome:'ActionCoach Porto',   tipo:'avenca',  peso:62, owner:'marly',   ultimaInteracao:'2026-09-15', canal:'reuniao',  pontoSituacao:'semanal'   },
  { id:'datelka',     nome:'Datelka',             tipo:'avenca',  peso:27, owner:'ruben',   ultimaInteracao:'2026-09-11', canal:'chamada',  pontoSituacao:'quinzenal' },
  { id:'chambino',    nome:'Chambino Areias',     tipo:'avenca',  peso:9,  owner:'ze',      ultimaInteracao:'2026-09-08', canal:'email',    pontoSituacao:null        },

  /* ----- One-shot ----- */
  { id:'superoi',     nome:'Superoi',             tipo:'oneshot', peso:100, owner:'tiago',  ultimaInteracao:'2026-09-14', canal:'reuniao',  pontoSituacao:'mensal'    },
  { id:'sigma',       nome:'Sigmaconstellation',  tipo:'oneshot', peso:30,  owner:'ricardo',ultimaInteracao:'2026-09-09', canal:'email',    pontoSituacao:null        },
  { id:'ummaisum',    nome:'Um Mais Um',          tipo:'oneshot', peso:12,  owner:'marly',  ultimaInteracao:'2026-09-02', canal:'mensagem', pontoSituacao:null        }
];

/* Regra do termómetro, em dias sem qualquer contacto.
   Até 5 está em dia; acima de 5 fica vermelho; acima de 7 é crítico. */
const TERMOMETRO = { vermelho: 5, critico: 7 };
