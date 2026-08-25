# Handoff: Esporte SA — App de Gestão de Pelada

## Overview
Esporte SA é um app web mobile-first para a Pastoral do Esporte de uma paróquia gerenciar a "pelada" (jogo de futebol) semanal: cadastro/perfil de jogadores, sorteio balanceado de times, tabela de jogos, registro de placar ao vivo, dashboard estatístico ("Raio-X da Pelada") e gestão de estrelas (rating 1-5) dos jogadores com sugestão automática por IA.

## About the Design Files
O arquivo incluído (`Esporte SA.dc.html`) é uma **referência de design em HTML** — um protótipo interativo em React que mostra a aparência e o comportamento pretendidos, não código de produção para copiar diretamente. A tarefa é **recriar esse design no ambiente/stack real do app** (React Native, Flutter, SwiftUI, Next.js, etc. — o que já for usado no projeto, ou a escolha mais adequada caso o projeto esteja começando do zero), usando os padrões e bibliotecas já estabelecidos.

O arquivo hoje apresenta as 8 telas lado a lado, cada uma dentro de um "card" com moldura de celular, para facilitar a revisão de todas de uma vez — isso é só um recurso de apresentação. No app real, cada tela é uma tela própria de navegação (o app tem apenas uma tela visível por vez).

## Fidelity
**Alta fidelidade (hifi)**: cores, tipografia, espaçamento e a maior parte das interações já estão definidos e devem ser recriados com precisão. Fotos de jogadores estão como placeholders ("FOTO") — substituir por upload/avatar real. Ícones foram desenhados como formas geométricas simples (círculos, glifos "★"); podem ser substituídos por um icon set real caso o time tenha um (ex.: bola, chuteira, troféu, escudo) mantendo o mesmo significado e posição.

## Design Tokens

**Cores** (definidas como CSS custom properties no protótipo):
- `--bg`: `#0d0e10` (fundo base, grafite quase preto)
- `--bg2`: `oklch(0.19 0.006 260)` (superfície de cards)
- `--bg3`: `oklch(0.235 0.009 260)` (superfície elevada / inputs)
- `--bgold` (borda dourada sutil): `oklch(0.55 0.09 85 / 0.32)`
- `--gold` (destaque primário — vitórias, estrelas, artilheiro, CTAs): `oklch(0.80 0.16 86)`
- `--green` (destaque secundário — ações positivas, assistências): `oklch(0.72 0.17 148)`
- `--red` (ao vivo, encerrar, saldo negativo): `oklch(0.62 0.19 25)`
- `--text`: `oklch(0.96 0.006 90)`
- `--muted`: `oklch(0.62 0.012 90)`
- `--muted2`: `oklch(0.42 0.012 90)`
- Cores de times (para diferenciar times no sorteio): hues `86` (dourado), `148` (verde), `220` (azul), `15` (vermelho), `300` (roxo), todas em `oklch(0.62 0.16 <hue>)` — mesma luminosidade/chroma, variando só o matiz.

**Tipografia**:
- Títulos / placar / números grandes: **Barlow Condensed**, peso 700–800, uppercase, letter-spacing leve (estilo painel de estádio).
- Corpo/texto: **Manrope**, pesos 400–800.
- Ambas via Google Fonts.

**Raio de borda**: cards internos 12–16px; molduras de tela (frame) 32px; pills/badges 20px (full).

**Sombras**: cards usam `box-shadow` escura e sutil (`0 8-20px 24-50px rgba(0,0,0,.5-.6)`) para profundidade tipo "placar de estádio".

**Toques mínimos**: botões e áreas tocáveis usam no mínimo 44px de altura (uso em campo, durante o jogo).

## Screens / Views

### 1. Login / Cadastro
- Logo circular "SA" + wordmark "ESPORTE SA" (Barlow Condensed 800, 34px, uppercase) + "Pastoral do Esporte" (caption).
- Card com: placeholder de foto de perfil (círculo tracejado), campo Nome (texto), campo Posição preferida (select: Qualquer/Goleiro/Zagueiro/Meio-campo/Atacante), botão "Entrar" (dourado, full width).
- **Não deve haver** nenhum campo/checkbox de "sou admin" nesta tela — o papel de administrador é atribuído por outro meio (ex.: lista de admins da paróquia no backend), nunca autodeclarado pelo usuário no cadastro.

### 2. Perfil do Jogador
- Header "Meu Perfil". Foto (círculo, borda dourada), nome (26px condensed), badge de posição, 5 estrelas (glifo ★, douradas as preenchidas / cinza translúcido as vazias).
- Grid 2x2 de estatísticas: Gols (dourado), Assistências (verde), Jogos, Vitórias — número grande (32px) + label pequena uppercase.
- Lista "Histórico recente": até 3 cards com data, resultado da pelada e linha pessoal ("1 gol · 2 assistências"). Estado vazio: "Nenhuma pelada registrada ainda" para jogador novo.

### 3. Admin · Nova Pelada
- Header "Nova Pelada". Campo de data (date picker nativo).
- Lista "Jogadores presentes": linha por jogador com checkbox, avatar, nome, posição e estrelas; contador "{presentes}/{total}" em destaque dourado.
- Stepper "Quantidade de times" (2 a 5, botões − / +).
- CTA fixo no rodapé "Sortear Times" (dourado).
- **Lógica de sorteio**: ordenar presentes por estrelas (desc) e distribuir em "snake draft" (1,2,3...N,N...3,2,1...) entre os times selecionados, para equilibrar a soma de estrelas.

### 4. Resultado do Sorteio
- Um card por time: barra colorida no topo, nome do time (**input editável** — admin digita o nome na hora), soma de estrelas do time em destaque, lista de jogadores com estrelas e dois botões (‹ ›) para mover o jogador para o time anterior/seguinte (substitui drag-and-drop, mais confiável em touch).
- CTA fixo "Confirmar Times e Gerar Jogos" — gera os confrontos todos-contra-todos (round robin) e vai para a tabela de jogos.

### 5. Tabela de Jogos do Dia
- Lista de confrontos: nome + cor de cada time, placar central (ou "vs" se ainda não começou), badge de status (Agendado / Finalizado — tocar num jogo Agendado inicia o registro ao vivo).
- Abaixo, tabela de classificação do dia: Time, J, V, E, D, SG.

### 6. Registro de Jogo Ao Vivo
- Sem navegação/tabs — tela cheia dedicada, usada durante a partida.
- Topo: indicador "AO VIVO" pulsante (vermelho) + cronômetro (mm:ss) + placar grande (Barlow Condensed 46px) com nomes dos times coloridos.
- Duas colunas (Time A / Time B) com um botão grande por jogador (mín. 44px). Tocar no jogador expande dois botões: "Gol" (dourado) e "Assist." (verde).
- Feed de eventos recentes abaixo (mais recente no topo): badge "G"/"A" colorido + nome do jogador + verbo + tempo do evento.
- Botão "Encerrar Jogo" (contorno vermelho) no rodapé — grava o placar final, soma gols/assistências/jogos/vitórias aos jogadores envolvidos.
- Estado sem jogo ao vivo: lista de confrontos agendados com botão "Iniciar" para cada um.

### 7. Dashboard "Raio-X da Pelada"
- Seletor de período (Pelada / Mês / Ano) em pills.
- Dois cards de destaque: Artilheiro (foto + nome + total de gols, moldura dourada) e Garçom da Rodada (foto + nome + total de assistências, moldura verde).
- Ranking de Gols e Ranking de Assistências: listas top 5, numeradas.
- Tabela "Desempenho por Time": J, V, E, D, GM, GS, SG.
- "Destaques da Rodada": grid 2x2 com mais gols na rodada, gol mais rápido, time mais seguro (menos gols sofridos), time que mais venceu.

### 8. Gestão de Estrelas (Admin)
- Lista de jogadores com estrela atual e tag indicando origem: "MANUAL" ou "SUGERIDO POR IA".
- Quando há sugestão pendente da IA (estrela sugerida ≠ atual): mostra "{atual}★ → {sugerido}★ sugerido" com botões Aprovar / Ajustar (abre stepper numérico inline 1–5) / Ignorar.
- **Lógica de sugestão (referência)**: `pontuação = gols*2 + assistências*1.5 + vitórias`; `média = pontuação / jogos`; faixas → <1.5:★1, <3:★2, <5:★3, <7:★4, ≥7:★5. Ajustar como necessário com dados reais/feedback de admins.

## Interactions & Behavior
- Toda navegação e estado (jogadores, times, jogos, eventos ao vivo, sugestões de estrela) é compartilhado entre as telas — uma ação num fluxo (ex. sortear times) deve refletir imediatamente nas telas dependentes (resultado do sorteio, jogos do dia).
- Cronômetro da partida ao vivo conta em tempo real enquanto a tela está aberta; deve persistir caso o app seja minimizado (usar timestamp de início, não apenas um contador incremental, na implementação real).
- Sem animações complexas — apenas microinterações simples (pulso do indicador "AO VIVO", troca de estado dos botões).

## State Management
Dados principais a modelar no app real:
- **Player**: id, nome, foto, posição, estrelas (1-5), origem da estrela (manual/ia), gols, assistências, jogos, vitórias.
- **Pelada** (rodada do dia): data, lista de presentes, número de times.
- **Team**: id, nome (editável), cor/matiz, lista de playerIds.
- **Game**: id, timeA, timeB, placarA, placarB, status (agendado/ao vivo/finalizado).
- **Event** (ao vivo): jogo, jogador, tipo (gol/assistência), minuto/segundo.
- **StarSuggestion**: jogador, estrela sugerida pela IA, status (pendente/aprovada/ajustada/ignorada).

## Assets
Nenhum asset externo — fotos são placeholders circulares com texto "FOTO"; ícones são formas geométricas simples ou o glifo "★". Substituir por fotos reais de jogadores e, opcionalmente, um icon set (bola, chuteira, troféu, escudo) na implementação final.

## Files
- `Esporte SA.dc.html` — protótipo completo, todas as 8 telas lado a lado, interativo (React embutido). Abrir no navegador para ver/testar o comportamento.
