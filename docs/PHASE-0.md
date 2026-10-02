# Fase 0 — Fundação

A Fase 0 deixa o projeto executável e preparado para infraestrutura externa.

## Contrato de infraestrutura

**Runtime:** Node.js 20+  
**Servidor:** Express  
**Banco:** MongoDB Atlas  
**Pagamentos:** Stripe (somente backend)  
**Deploy:** Render Web Service Free  
**Frontend:** publicado pelo GitHub Pages  
**Segredos:** variáveis de ambiente do Render

## Endpoints base

- GET /api/health — liveness
- GET /api/ready — readiness; retorna 503 se o MongoDB ainda não estiver conectado

## Inicialização

Em produção, o processo não inicia sem:
- MONGODB_URI
- JWT_SECRET com pelo menos 32 caracteres
- FRONTEND_URL

O servidor faz ping no MongoDB antes de abrir a porta.

## Segurança-base

- Helmet
- X-Powered-By desativado
- trust proxy configurado para Render
- payload JSON limitado
- rate limit básico da API
- segredos somente por ambiente
- hash de senha com bcrypt
- JWT para autenticação
- encerramento gracioso em SIGTERM/SIGINT

## MongoDB

Banco padrão: KZTech.

Coleções iniciais:
- users
- contacts
- quotes
- orders

Índices são criados automaticamente na inicialização.

## Render

O `render.yaml` define o Web Service, comando de build, comando de start, health check e variáveis secretas.

## Stripe

A chave secreta nunca deve ir para `public/`. A integração usa `STRIPE_SECRET_KEY` no backend.

## Critério de conclusão

A Fase 0 está concluída quando o Render conseguir iniciar o serviço e:
- /api/health retornar 200
- /api/ready retornar 200
- database retornar true
- o frontend abrir
- GitHub Actions passar
