# KZ Tech Site

Site institucional e comercial da **Korczak Technology**, com catálogo, páginas institucionais, contas, orçamento, checkout, analytics e painel administrativo.

## Estado real do ecossistema

O site apresenta o ecossistema completo como visão de produto, mas **não trata produtos planejados como produtos já iniciados**.

### Produtos iniciados

Atualmente, os produtos em desenvolvimento ativo são:

- **KORCZAK AI**
- **Korczak IDE**
- **MOROK**
- **KORCZAK ERP**

### Korczak Workspace

O Workspace está em construção. **O único produto do Workspace iniciado atualmente é o Korczak Documents.**

Os demais conceitos do Workspace — Sheets, Slides, Drive, Mail, Calendar, Meet, Chat, Forms e Sites — permanecem planejados e são exibidos no site explicitamente como planejados.

### KOS

O KOS reúne os produtos empresariais planejados e iniciados conforme o estado real do projeto. Neste momento, **KORCZAK ERP é o produto do KOS em desenvolvimento ativo**. FLOW, DOCUMENTS, VISION, OPS, CONNECT e MOBILE permanecem planejados; o KORCZAK DOCUMENTS do Workspace é um produto separado do KOS.

> KORCZAK AI, Korczak IDE e MOROK são produtos próprios do ecossistema Korczak e não devem ser apresentados como módulos já implementados do KOS.

## Funcionalidades atuais do site

- Página institucional e navegação responsiva.
- Catálogo de produtos com status real.
- Páginas de produto.
- Página do Workspace com separação entre iniciado e planejado.
- Páginas institucionais: história, visão, valores, parcerias, carreiras, FAQ e contato.
- Cadastro e login de usuários.
- Perfil do usuário.
- Histórico de orçamentos e pedidos.
- Solicitação de orçamento.
- Checkout Stripe para produtos atualmente comercializáveis.
- Webhook Stripe com atualização do pedido.
- Analytics de visualizações e interações.
- Identificação de usuário em eventos autenticados.
- Painel administrativo protegido por JWT.
- Gestão de conteúdo pelo CMS.
- Gestão de mídias.
- Gestão de administradores.
- Auditoria administrativa.
- Dashboard de analytics com filtros por período e categoria.
- API de saúde e readiness.
- Headers de segurança via Helmet.
- CORS restrito às origens configuradas.
- Limitação de requisições para endpoints sensíveis.

## Produtos comercializáveis

O checkout fica restrito aos produtos iniciados que possuem configuração comercial:

- KORCZAK AI
- Korczak IDE
- MOROK
- KORCZAK ERP
- Korczak Documents

Produtos planejados não são aceitos pelo endpoint de checkout mesmo que alguém tente enviar o ID manualmente.

## Analytics

Os analytics continuam armazenados no **MongoDB Atlas** por enquanto.

Cada evento pode registrar:

- página e caminho;
- tipo de evento;
- categoria e subcategoria;
- ação e descrição;
- nome e e-mail quando a pessoa estiver identificada;
- ID do usuário;
- entidade e entidade relacionada;
- dispositivo, navegador e sistema;
- idioma e viewport;
- metadados;
- data e hora.

O painel administrativo apresenta os registros de forma legível, incluindo o responsável identificado quando disponível.

## Administração

O painel administrativo possui:

- Analytics
- Contas
- Comercial
- Interações
- Conteúdo
- Mídias
- Administradores
- Auditoria

As rotas administrativas exigem autenticação e papel de administrador. O frontend preserva a sessão administrativa entre navegações usando armazenamento local e de sessão.

## Segurança e confiabilidade

A API utiliza:

- JWT para autenticação;
- bcrypt para armazenamento de senhas;
- Helmet;
- CORS controlado;
- validação de dados de entrada;
- limites de tamanho de corpo;
- rate limiting em login, cadastro, contato, analytics e checkout;
- validação de assinatura do webhook Stripe;
- verificação de propriedade da sessão Stripe;
- separação de rotas públicas e administrativas;
- auditoria das operações administrativas;
- endpoints `/health` e `/api/ready`.

O segredo JWT e as credenciais externas devem permanecer em variáveis de ambiente e nunca no repositório.

## Stack

- Node.js 20+
- Express 5
- HTML/CSS/JavaScript/SVG
- MongoDB Atlas
- Stripe
- GitHub Pages
- Render

## Estrutura

```
public/                 Site público
public/assets/          JavaScript, CSS e SVG
admin/                  Painel administrativo
server/index.mjs        API e integração com MongoDB/Stripe
.github/workflows/      CI e deploy do frontend
render.yaml             Configuração do serviço Render
```

## Validação

Antes de considerar uma alteração pronta, o projeto deve passar por:

1. verificação de sintaxe JavaScript;
2. testes automatizados disponíveis no repositório;
3. validação do build/deploy do GitHub Pages;
4. verificação do health check da API;
5. verificação das rotas de autenticação;
6. verificação das rotas administrativas;
7. verificação do checkout e webhook quando Stripe estiver configurado.

## Estado do projeto

A base institucional, comercial, contas, analytics e administração está implementada. O ecossistema de produtos continua sendo desenvolvido por etapas.

**Importante:** “Planejado” significa que o produto é uma parte prevista do ecossistema, não que sua aplicação já esteja pronta.
