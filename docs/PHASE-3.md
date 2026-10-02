# Fase 3 — Comercial

## Implementação

- Cadastro, login e perfil autenticado.
- Solicitação de orçamento vinculada ao usuário.
- Histórico de orçamentos e pedidos.
- Página de conta com dados e histórico comercial.
- Catálogo comercial com preços definidos no servidor.
- O navegador não envia um valor para definir a cobrança.
- Stripe Checkout no servidor.
- Suporte a Stripe Price IDs por produto.
- Checkout vinculado ao usuário autenticado.
- Metadata de usuário e produto na sessão Stripe.
- Estados de checkout: sucesso e cancelamento.
- Consulta autenticada de sessão de Checkout.
- Registro do pedido quando uma sessão é criada.
- Configuração dos preços via variáveis de ambiente.
- Fallback para valores definidos no servidor quando Price ID não estiver configurado.
- Cache-busting do frontend.
- Testes automatizados de estrutura comercial.

## Segurança comercial

O cliente envia somente o identificador do produto. O backend resolve produto, moeda e valor a partir da configuração própria. Um valor arbitrário enviado pelo navegador não é usado para criar a cobrança.

## Configuração

Configure STRIPE_SECRET_KEY e, preferencialmente, os STRIPE_PRICE_* correspondentes no Render. SITE_URL/FRONTEND_URL devem apontar para os destinos corretos do ambiente.

## Critérios de conclusão

1. Cadastro e login funcionam através da API.
2. Usuário autenticado possui perfil.
3. Orçamentos ficam vinculados ao usuário e aparecem no histórico.
4. Pedidos ficam vinculados ao usuário e aparecem no histórico.
5. Checkout usa somente preço resolvido no servidor.
6. Stripe retorna uma URL de Checkout.
7. Sucesso e cancelamento têm páginas próprias.
8. CI e GitHub Pages passam no commit final.
