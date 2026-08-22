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
index.html               Ecrã inicial — menu das seis áreas
comercial.html           Área comercial — as seis secções
assets/
  css/kelux.css          Todo o estilo
  js/dados.js            Dados de exemplo (editar aqui)
  js/comercial.js        Navegação e renderização
  img/                   Fotografias da equipa (a colocar)
```

---

## Áreas

| Área                 | Estado      |
| -------------------- | ----------- |
| Comercial            | Ativa       |
| Financeiro           | Por acender |
| Clientes e Projetos  | Por acender |
| Propostas            | Por acender |
| Produtos e Preços    | Por acender |
| Agentes              | Por acender |

As áreas ainda não disponíveis aparecem **"por acender"**, não bloqueadas —
visíveis e legíveis, para a equipa ver o que aí vem.

### Área comercial

| # | Secção                | O que mostra |
| - | --------------------- | ------------ |
| I | A equipa              | Os cinco comerciais |
| II | O objetivo           | 15 reuniões/semana, regras de contagem e a escada de metas |
| III | Comissões          | 15% da avença durante 12 meses, regras e simulação por escalões |
| IV | Organização         | Pipeline, tipos de lead, ficha de lead, avisos de duplicado, propriedade |
| V | Agentes e a fila fria | Como os agentes se integram e quando passam a lead a uma pessoa |
| VI | Ranking             | Reuniões marcadas por comercial — semana, mês e ano |

---

## Identidade visual

Alinhada com kelux.ai:

- Fundo escuro `#080C16`
- Metáfora da luz — secções que se acendem, contraste entre escuro e iluminado
- Numeração romana nas secções e nos itens
- Bodoni Moda (títulos), Instrument Sans (corpo), IBM Plex Mono (números e etiquetas)
- Acentos quentes: `#E3B778`, `#FFF3DC`, `#E8B45C`, `#C6A35C`
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

## Privacidade

Valores de comissão são informação pessoal. A tabela mostra **escalões**, não o
que cada pessoa ganha. Entre comerciais, o único número visível é o **número de
reuniões marcadas**.

---

## A seguir

- Contas criadas manualmente pelo administrador, com permissões por perfil
- Backend e base de dados
- As restantes cinco áreas
