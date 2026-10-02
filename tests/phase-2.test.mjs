import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync("public/index.html","utf8");
const app=fs.readFileSync("public/assets/app.js","utf8");
const phases=fs.readFileSync("docs/PHASE-2.md","utf8");

test("Fase 2: shell frontend existe e usa assets versionados",()=>{
  assert.ok(html.includes('id="app"'));
  assert.ok(html.includes('app.js?v=20261002-8'));
});

test("Fase 2: rotas institucionais completas",()=>{
  for(const route of ["/empresa","/sobre","/historia","/visao","/valores","/parcerias","/carreiras","/faq","/contato","/produtos","/portfolio","/privacidade","/uso","/servico"]){
    assert.ok(app.includes('"'+route+'"')||app.includes('="'+route+'"'),"Rota ausente: "+route);
  }
});

test("Fase 2: catálogo completo contém os dez produtos",()=>{
  for(const id of ["korczak-ai","morok","ide","workspace","flow","documents","vision","ops","connect","mobile"]){
    assert.ok(app.includes('id:"'+id+'"'),"Produto ausente: "+id);
  }
});

test("Fase 2: conteúdo dinâmico é escapado e handlers inline não são usados",()=>{
  assert.ok(app.includes("const esc="));
  assert.doesNotMatch(app,/onclick\s*=/i);
  assert.ok(app.includes('data-action="quote"'));
});

test("Fase 2: documentação declara os critérios",()=>{
  assert.ok(phases.includes("## Critério de conclusão"));
  assert.match(phases,/catálogo completo/i);
});