import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const server=await readFile("server/index.mjs","utf8");
const app=await readFile("public/assets/app.js","utf8");
const readme=await readFile("README.md","utf8");

test("catalogo real do ecossistema",()=>{
  for(const id of ["korczak-ai","ide","morok","erp","documents"]) assert.match(server,new RegExp('\\["'+id+'"'));
  for(const id of ["flow","vision","ops","connect","mobile"]) assert.match(server,new RegExp('\\["'+id+'"[^\\n]*"Planejado"'));
  assert.match(server,/KORCZAK DOCUMENTS/);
  assert.match(app,/Único produto iniciado atualmente dentro do Workspace/);
});

test("workspace não apresenta módulos futuros como iniciados",()=>{
  assert.match(app,/Korczak Sheets","Planejado/);
  assert.match(app,/Korczak Slides","Planejado/);
  assert.match(app,/Korczak Drive","Planejado/);
  assert.match(app,/Korczak Mail","Planejado/);
  assert.match(app,/Korczak Calendar","Planejado/);
  assert.match(app,/Korczak Meet","Planejado/);
  assert.match(app,/Korczak Chat","Planejado/);
  assert.match(app,/Korczak Forms","Planejado/);
  assert.match(app,/Korczak Sites","Planejado/);
});

test("documentação não promete módulos futuros como implementados",()=>{
  assert.match(readme,/O único produto do Workspace iniciado atualmente é o Korczak Documents/);
  assert.match(readme,/FLOW, DOCUMENTS, VISION, OPS, CONNECT e MOBILE permanecem planejados/);
});

test("API mantém proteção nos endpoints sensíveis",()=>{
  assert.match(server,/app\.post\("\/api\/auth\/login",rateLimit/);
  assert.match(server,/app\.post\("\/api\/auth\/register",rateLimit/);
  assert.match(server,/app\.post\("\/api\/contact",rateLimit/);
  assert.match(server,/app\.post\("\/api\/analiticas\/evento",rateLimit/);
});
