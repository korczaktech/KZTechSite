import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const server=fs.readFileSync("server/index.mjs","utf8");
const app=fs.readFileSync("public/assets/app.js","utf8");
const env=fs.readFileSync(".env.example","utf8");
test("Fase 3: autenticação e perfil comercial",()=>{
  for(const x of ["/api/auth/register","/api/auth/login","/api/me","/api/quotes","/api/orders"])assert.ok(server.includes(x));
  assert.ok(server.includes("bcrypt.hash")); assert.ok(server.includes("jwt.sign"));
});
test("Fase 3: preços são resolvidos no servidor",()=>{
  assert.ok(server.includes("commercialProducts")); assert.ok(server.includes("STRIPE_PRICE_KORCZAK_AI"));
  assert.ok(server.includes("unit_amount:amount")); assert.doesNotMatch(server,/Number\(req\.body\?\.amount\)/);
});
test("Fase 3: Stripe Checkout e estados",()=>{
  assert.ok(server.includes("stripe.checkout.sessions.create")); assert.ok(server.includes("success_url")); assert.ok(server.includes("cancel_url"));
  assert.ok(app.includes("/checkout/sucesso")); assert.ok(app.includes("/checkout/cancelado")); assert.ok(app.includes('data-action="checkout"'));
});
test("Fase 3: configuração Stripe documentada",()=>{
  for(const id of ["KORCZAK_AI","MOROK","ERP","IDE","WORKSPACE","FLOW","DOCUMENTS","VISION","OPS","CONNECT","MOBILE"])assert.ok(env.includes("STRIPE_PRICE_"+id));
});
test("Fase 3: webhook Stripe confirma e atualiza pedidos",()=>{
  assert.ok(server.includes('/api/stripe/webhook'));
  assert.ok(server.includes('stripe.webhooks.constructEvent'));
  assert.ok(server.includes('checkout.session.completed'));
  assert.ok(server.includes('payment_failed'));
  assert.ok(server.includes('sessionId:session.id'));
});
