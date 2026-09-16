# Kelux AI — Back office interno

Espaço interno da Kelux AI onde a equipa passa a ter a estratégia, os objetivos,
os KPIs e a gestão comercial.

**Esta é uma versão de apresentação**, para mostrar numa reunião de equipa.
Sem backend, sem base de dados, sem autenticação e sem integração com o site
kelux.ai. Todos os dados são de exemplo. A parte funcional é construída depois.

---

## Ver o projeto

Não há build. É HTML, CSS e JavaScript simples.

Abrir `index.html` diretamente no browser funciona. Para servir localmente:

```bash
npx serve .
# ou, com Python
python -m http.server 4321
```

---

## Estrutura

```
index.html               Ecrã inicial — menu das três áreas
comercial.html           Área comercial — menu de três blocos
proposta-comercial.html  Proposta comercial — as seis secções
clientes.html            Gestão de clientes — três separadores
financeiro.html          Área financeira — faturado, cobrado e custos
socios.html              Objetivos — apresentação de oito ecrãs
assets/
  css/kelux.css          Estilo partilhado e tokens da marca
  css/socios.css         Estilo da área dos objetivos
  js/dados.js            Dados de exemplo (editar aqui)
  js/comercial.js        Navegação e renderização da proposta comercial
  js/socios.js           Revelação com o scroll
  css/painel.css         Separadores, KPIs e listas (clientes e financeiro)
  css/financeiro.css     O que só a área financeira usa
  js/clientes-dados.js   Carteira de clientes (o único ficheiro a trocar pela BD)
  js/clientes.js         Separadores, constelação e termómetro
  js/financeiro-dados.js Faturas e custos (o único ficheiro a trocar pela BD)
  js/financeiro.js       Posição de cobrança, faturas e custos
  img/                   Fotografias da equipa
```

---

## Áreas

| # | Área                | Estado      |
| - | ------------------- | ----------- |
| 01 | Comercial          | Ativa       |
| 02 | Financeiro         | Ativa       |
| 03 | Objetivos          | Ativa       |

As áreas ainda não disponíveis aparecem **"por acender"**, não bloqueadas —
visíveis e legíveis, para a equipa ver o que aí vem.

### Área financeira

Lê a folha de faturação no Google Sheets (separadores **Invocies** e **Costs**)
e mostra-a em três separadores:

| # | Separador | O que mostra |
| - | --------- | ------------ |
| 01 | Posição  | Faturado, recebido, por receber e por faturar, com a barra de cobrança |
| 02 | Faturas  | Linha a linha, com estado e totais por filtro |
| 03 | Custos   | Estrutura mensal e quanto do mês está coberto pelo que entrou |

**A folha não tem coluna de recebimentos.** O estado `recebido` de cada linha em
`financeiro-dados.js` foi preenchido à mão. Enquanto não houver essa coluna — ou
base de dados — é aí que se marca quem pagou.

### Área comercial

Entra num menu com três blocos:

| # | Bloco                | Estado      |
| - | -------------------- | ----------- |
| 01 | Proposta comercial  | Ativa       |
| 02 | Gestão de clientes  | Ativa       |
| 03 | Prospeção comercial | Por acender |

A gestão de clientes é para onde vão os clientes já adjudicados.

#### Gestão de clientes

Os clientes já adjudicados, em três separadores:

| # | Separador       | O que mostra |
| - | --------------- | ------------ |
| 01 | Dashboard      | Clientes ativos ao dia de hoje, avenças vs one-shot, quantos estão sem contacto |
| 02 | Carteira       | A constelação: um planeta por cliente, a área proporcional ao peso da avença |
| 03 | Acompanhamento | Última interação, owner e o termómetro, com filtros |

**Sem números, de propósito.** A página é vista por toda a equipa, por isso o
peso de cada cliente só se lê pela comparação entre planetas. Em
`clientes-dados.js` o campo é um `peso` de 1 a 100, não um valor em euros —
quando houver base de dados é o servidor que o calcula, para o valor real não
chegar sequer ao browser.

**O termómetro** conta os dias desde o último contacto, seja de que tipo for:
até 5 dias está em dia, acima de 5 fica vermelho, acima de 7 é crítico. Os
limites vivem na constante `TERMOMETRO`. Clientes sem ponto de situação
definido ficam marcados como **sem ritmo**.

#### Proposta comercial

| # | Secção                | O que mostra |
| - | --------------------- | ------------ |
| 01 | A equipa             | Os cinco comerciais |
| 02 | O objetivo           | 15 reuniões/semana, regras de contagem e a escada de metas |
| 03 | Comissões            | 15% da avença durante 12 meses, regras e simulação por escalões |
| 04 | Organização          | Pipeline, tipos de lead, ficha de lead, avisos de duplicado, propriedade |
| 05 | Agentes e a fila fria | Como os agentes se integram e quando passam a lead a uma pessoa |
| 06 | Ranking              | Reuniões marcadas por comercial — semana, mês e ano |

### Objetivos

Página de apresentação ao vivo: cada secção ocupa um ecrã, revela-se com o
scroll e mostra números grandes em vez de texto. As setas e a barra de espaço
avançam de secção, para quem apresenta.

| # | Secção            | O que mostra |
| - | ----------------- | ------------ |
| 01 | Avenças          | Barras de agosto a dezembro e o salto exigido entre meses |
| 02 | One-shot         | Meta, média mensal, feito, e a linha do acumulado |
| 03 | Tesouraria       | O que entra e o acumulado, mês a mês |
| 04 | Missão Guiné     | As duas condições a 30 de novembro |
| 05 | Plano de ação    | Funil até às 10 reuniões por semana |
| 06 | Percurso         | Linha do tempo até dezembro, com os marcos a acender um a um |
| 07 | Como lá chegamos | Diagrama que se acende com o scroll, converge nas 10 reuniões |
| 08 | Ideias a explorar | Três ideias, uma frase cada |

No percurso, a cor do ponto diz o nível do marco: verde para execução, âmbar
para a campanha, coral para a avaliação da Missão Guiné — o ponto maior, o que
decide a viagem — e roxo para o que ainda não aconteceu.

Todos os valores são fixos no código de `socios.html`, em euros e sem IVA.

---

## Identidade visual

Alinhada com o branding novo de kelux.ai — papel quente, tinta escura, ouro.

Tokens tirados do próprio site, em `assets/css/kelux.css`:

| Token | Valor | Onde |
| ----- | ----- | ---- |
| `--ink` | `#F3EFE6` | Papel — fundo de tudo |
| `--ink-2` | `#FAF7F0` | Cartões e blocos levantados |
| `--txt-warm` | `#0F1115` | Tinta — títulos e números |
| `--mut` | `#5B5C5A` | Texto secundário |
| `--gold` | `#B47B1E` | O ouro — acentos e destaques |
| `--gold-soft` | `#E3B778` | Ouro claro, sobre fundo escuro |
| `--escuro` | `#0E1113` | Secções escuras (missão Guiné) |
| `--line` | `rgba(180,123,30,.34)` | Traço dourado |

- Grotesca do sistema em peso 800, com `letter-spacing` negativo, nos títulos
  e nos números; monoespaçada em maiúsculas para etiquetas
- A marca escreve-se **Kelux** com o ponto final a ouro
- Metáfora da luz — secções e blocos que se acendem com o scroll
- Numeração em algarismos (01, 02, 03), legível a qualquer distância
- Sem gradientes, sem efeitos decorativos

---

## Fotografias da equipa

As cinco fotos estão em `assets/img/`, já recortadas em quadrado e centradas
na cara, para o enquadramento circular não cortar ninguém.

Para trocar uma, substituir o ficheiro pelo mesmo nome. Se a nova foto não
estiver centrada na cara, recortar em quadrado antes de a colocar.

Sem foto (campo `foto: null` em `assets/js/dados.js`), aparece a inicial
iluminada. As fotos entram nos cards da equipa e nas barras do ranking.

---

## Alterar os dados

Tudo em `assets/js/dados.js`:

- `EQUIPA` — pessoas, fotos e descrições
- `ESCADA` — degraus e meta atual
- `RANKING` — reuniões e no-show por vista (semana, mês, ano)
- `RECORDE` — recorde histórico da equipa
- `COMISSOES` — linhas da tabela de simulação
- `FICHA_EXEMPLO` — campos e histórico da ficha de lead

---

## A seguir

- Contas criadas manualmente pelo administrador, com permissões por perfil —
  a área dos objetivos não tem autenticação nesta fase
- Backend e base de dados
- Substituir os valores fixos da área dos objetivos por dados reais
- A área financeira
