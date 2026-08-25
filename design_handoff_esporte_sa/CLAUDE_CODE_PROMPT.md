Cole este prompt no Claude Code, dentro da pasta do seu projeto (com o arquivo `Esporte SA.dc.html` e o `README.md` deste handoff também na pasta ou referenciados):

---

Estou implementando o app **Esporte SA**, um app mobile-first para a Pastoral do Esporte de uma paróquia gerenciar a pelada (jogo de futebol) semanal: cadastro de jogadores, sorteio balanceado de times, tabela de jogos, registro de placar ao vivo, dashboard estatístico e gestão de estrelas dos jogadores.

Anexei dois arquivos de referência de design:
- `README.md` — especificação completa das 8 telas, tokens de design (cores, tipografia, espaçamento), modelo de dados e lógica de negócio (sorteio balanceado por estrelas, fórmula de sugestão de estrela por IA, etc).
- `Esporte SA.dc.html` — um protótipo HTML/React interativo de alta fidelidade mostrando a aparência e o comportamento exatos de cada tela (hoje as 8 telas aparecem lado a lado só para facilitar a revisão — no app real cada uma é uma tela de navegação separada).

**O que fazer:**
1. Leia o `README.md` e abra o `Esporte SA.dc.html` para entender a aparência e as interações de cada tela.
2. [Se o projeto já existe] Use o stack, os componentes e os padrões já existentes no meu projeto — não introduza uma nova lib de UI. Recrie o design pixel a próximo com fidelidade alta, adaptando aos componentes disponíveis.
   [Se o projeto está vazio] Configure um app React Native (Expo) — ou sugira a stack mais adequada — e implemente as 8 telas como telas de navegação reais (React Navigation ou similar), com estado compartilhado entre elas (contexto/zustand/redux, à sua escolha).
3. Implemente as 8 telas: Login/Cadastro, Perfil do Jogador, Admin·Nova Pelada, Resultado do Sorteio, Tabela de Jogos do Dia, Registro Ao Vivo, Dashboard "Raio-X da Pelada", Gestão de Estrelas — com a navegação real entre elas (não lado a lado).
4. Implemente a lógica de negócio descrita no README: sorteio em snake draft por estrelas, geração de jogos todos-contra-todos, cronômetro e registro de eventos (gol/assistência) ao vivo atualizando placar e estatísticas dos jogadores, e a fórmula de sugestão de estrela por IA com os botões Aprovar/Ajustar/Ignorar.
5. Use exatamente os tokens de cor, tipografia e espaçamento do README (dark mode, dourado + verde como destaques, Barlow Condensed nos títulos/placar, Manrope no corpo).
6. Deixe fotos de jogadores como placeholders (avatar circular) prontos para receber upload real depois.
7. Garanta que todos os alvos de toque tenham no mínimo 44px (uso em campo, durante o jogo).

Antes de codar, me pergunte se tiver dúvida sobre stack, backend/persistência de dados, ou autenticação — o design cobre só a interface e o comportamento de front-end.

---
