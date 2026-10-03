import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";

const app=fs.readFileSync("public/assets/app.js","utf8");
const server=fs.readFileSync("server/index.mjs","utf8");
const render=fs.readFileSync("render.yaml","utf8");
const content=fs.readFileSync("public/data/content.json","utf8");

test("runtime: backend e frontend são JavaScript sintaticamente válidos",()=>{
  execFileSync(process.execPath,["--check","server/index.mjs"]);
  execFileSync(process.execPath,["--check","public/assets/app.js"]);
});

test("runtime: shell e assets principais existem",()=>{
  const html=fs.readFileSync("public/index.html","utf8");
  assert.match(html,/id="app"/);
  assert.match(html,/assets\/styles\.css/);
  assert.match(html,/assets\/app\.js/);
  assert.ok(fs.existsSync("public/assets/styles.css"));
  assert.ok(fs.existsSync("public/assets/app.js"));
  assert.ok(fs.existsSync("public/assets/mark.svg"));
});

test("runtime: frontend não depende do backend para o primeiro render",()=>{
  const app=fs.readFileSync("public/assets/app.js","utf8");
  assert.match(app,/FALLBACK_PRODUCTS/);
  assert.match(app,/data\/content\.json/);
  assert.match(content,/"products"/);
  assert.match(app,/render\(\);/);
  assert.ok(app.includes('api("/api/products")'));
});

test("runtime: navegação lateral não bloqueia links",()=>{
  const app=fs.readFileSync("public/assets/app.js","utf8");
  assert.ok(app.includes('if(action==="close-menu"){closeMenu();return false}'));
});

test("runtime: API e Mongo têm configuração resiliente",()=>{
  const server=fs.readFileSync("server/index.mjs","utf8");
  assert.match(server,/serverSelectionTimeoutMS:10000/);
  assert.match(server,/const FRONTEND_URLS=/);
  assert.match(server,/FRONTEND_URLS\[0\]/);
});

test("runtime: Pages é uma origem CORS permitida por padrão",()=>{
  const server=fs.readFileSync("server/index.mjs","utf8");
  assert.match(server,/https:\/\/korczaktechnology-tech\.github\.io/);
  assert.match(server,/ALLOWED_ORIGINS/);
});

test("runtime: validação de email aceita formato comum",()=>{
  const server=fs.readFileSync("server/index.mjs","utf8");
  assert.match(server,/\^\[\^\\s@\]\+@\[\^\\s@\]\+\\\.\[\^\\s@\]\+\$/);
});

test("runtime: frontend remove o estado loading após bootstrap",()=>{
  assert.match(app,/document\.body\.classList\.remove\(["']loading["']\)/);
});
test("runtime: CSP está habilitado no backend",()=>{
  assert.match(server,/contentSecurityPolicy:\{/);
  assert.ok(server.includes("frameAncestors:[\"'none'\"]"));
});
test("runtime: Render usa health endpoint configurado",()=>assert.match(render,/healthCheckPath: \/health/));

test("runtime: Frontend URL pode conter caminho do GitHub Pages sem quebrar CORS",()=>{
  assert.match(server,/new URL\(v\)\.origin/);
  assert.match(render,/healthCheckPath: \/health/);
});

test("runtime: Render health endpoint existe",()=>{
  assert.match(server,/app\.get\("\/health"/);
});
test("runtime: entradas de contato possuem limites e email válido",()=>{
  assert.match(server,/cleanName\.length<2/);
  assert.match(server,/cleanMessage\.length>5000/);
  assert.match(server,/cleanPhone\.length>40/);
});
test("runtime: frontend URL é obrigatória em produção",()=>{
  assert.match(server,/FRONTEND_URL must be configured in production/);
});
test("runtime: Stripe usa o preço gerenciado quando Price ID existe",()=>{
  assert.match(server,/stripe\.prices\.retrieve\(config\.priceId\)/);
  assert.match(server,/price\.unit_amount/);
});
test("runtime: pedidos e webhook são idempotentes",()=>{
  assert.match(server,/\{upsert:true\}/);
  assert.match(server,/\$setOnInsert/);
});
