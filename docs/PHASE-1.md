# Fase 1 — Interface

A Fase 1 entrega a camada visual e de interação do KZ Tech Site sem dependência de framework.

## Escopo concluído

- Interface minimalista em fundo escuro, tipografia responsiva e linguagem visual consistente.
- Design system centralizado em CSS com tokens de cor, espaçamento, bordas, raios, sombras e breakpoints.
- Layout desktop e mobile com grids adaptáveis, navegação lateral e formulários responsivos.
- Navegação por hash preservando funcionamento em GitHub Pages.
- Sidebar direita com abertura/fechamento animado, backdrop, estado ativo e fechamento por Escape.
- Botão de menu com microanimação e feedback de interação.
- SVGs inline para ícones de interface, sem biblioteca externa.
- Foco visível e labels acessíveis nos formulários.
- Sidebar fechada marcada como inert para evitar foco em conteúdo oculto.
- Suporte a prefers-reduced-motion.
- Estados de carregamento, mensagens de status e toast de feedback.
- Cards de produtos, botões, badges de status, perfil, documentos legais e rodapé reutilizando os mesmos componentes visuais.
- Escape de conteúdo dinâmico antes de inserção no HTML.
- Remoção de handlers inline: interações usam delegação de eventos no JavaScript.
- Favicon e marca SVG.
- Meta viewport, theme color, descrição e suporte a modo de cores escuro.

## Arquivos principais

- public/index.html — shell HTML acessível.
- public/assets/styles.css — design system e responsividade.
- public/assets/app.js — roteamento, componentes e interações.
- public/assets/mark.svg — marca vetorial.

## Critério de conclusão

A Fase 1 é considerada concluída quando:

1. O site renderiza sem framework.
2. As rotas por hash continuam navegáveis no GitHub Pages.
3. A navegação lateral funciona por mouse, toque e teclado.
4. Desktop e mobile possuem layout adaptável sem overflow horizontal intencional.
5. Os componentes principais possuem estados de hover, foco e interação.
6. A interface respeita redução de movimento.
7. Os workflows de CI e Pages conseguem processar a versão atual.
