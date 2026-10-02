# Checklist de produção

1. Definir JWT_SECRET longo e aleatório.
2. Configurar MONGODB_URI em segredo no Render.
3. Restringir acesso do Atlas ao necessário para o serviço.
4. Configurar STRIPE_SECRET_KEY somente no backend.
5. Configurar STRIPE_WEBHOOK_SECRET antes de processar eventos de pagamento.
6. Definir SITE_URL com domínio oficial.
7. Criar primeiro usuário administrativo por processo seguro, nunca por senha hardcoded.
8. Revisar textos legais com profissional habilitado antes do uso comercial.
9. Configurar domínio/TLS.
10. Monitorar /api/health e logs sem registrar senhas, tokens ou dados de cartão.
