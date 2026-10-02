# Checklist de produção

1. Definir JWT_SECRET longo e aleatório.
2. Configurar MONGODB_URI em segredo no Render.
3. Restringir acesso do Atlas ao necessário para o serviço.
4. Configurar STRIPE_SECRET_KEY somente no backend.
5. Configurar STRIPE_WEBHOOK_SECRET antes de processar eventos de pagamento.
6. Definir SITE_URL com domínio oficial.
7. Definir FRONTEND_URL com a URL completa do frontend, incluindo /KZTechSite quando aplicável.
8. Configurar o health check do Render em /health.
9. Configurar o endpoint Stripe /api/stripe/webhook com STRIPE_WEBHOOK_SECRET.
10. Criar primeiro usuário administrativo por processo seguro, nunca por senha hardcoded.
11. Revisar textos legais com profissional habilitado antes do uso comercial.
12. Configurar domínio/TLS.
13. Monitorar /api/health e logs sem registrar senhas, tokens ou dados de cartão.
