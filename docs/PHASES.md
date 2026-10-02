# Plano oficial — 6 fases

## Fase 0 — Fundação
- arquitetura Node/Express
- MongoDB Atlas
- variáveis secretas
- Helmet, JWT e hash de senha
- health check
- Render
- separação frontend/backend
- catálogo centralizado

## Fase 1 — Interface
- estética minimalista inspirada no Moon
- responsividade
- navegação por hash
- design system CSS
- SVG e ícones
- acessibilidade sem dependência de framework

## Fase 2 — Institucional — CONCLUÍDA
- início institucional
- portfólio e catálogo completo
- produto individual com relacionados e orçamento
- empresa e sobre nós
- história
- visão
- valores
- parcerias
- carreiras
- FAQ
- contato
- privacidade, uso e serviço
- catálogo completo do ecossistema

## Fase 3 — Comercial — CONCLUÍDA
- cadastro/login
- perfil autenticado
- solicitação e histórico de orçamento
- histórico de pedidos
- Stripe Checkout no servidor
- preços configuráveis por produto
- preços resolvidos exclusivamente no backend
- estados de sucesso/cancelamento
- consulta autenticada de sessão Stripe

## Fase 4 — Segurança e administração
- autenticação JWT
- autorização por papel
- hash bcrypt
- Helmet
- limites de payload
- validação de entrada
- índices MongoDB
- endpoints administrativos
- webhook Stripe com assinatura
- auditoria e recuperação de conta como próxima camada

## Fase 5 — Qualidade e operação
- smoke tests
- CI
- health check
- SEO
- acessibilidade
- documentação
- observabilidade
- política de privacidade/uso/serviço/cookies
- checklist de produção
