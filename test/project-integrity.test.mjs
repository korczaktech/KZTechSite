import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const server=await readFile("server/index.mjs","utf8");
const app=await readFile("public/assets/app.js","utf8");
const readme=await readFile("README.md","utf8");

test("catalogo real do ecossistema",()=>{
  for(const id of ["korczak-ai","ide","morok","erp","hub","nexus"]) assert.match(server,new RegExp('\\["'+id+'"'));
  for(const id of ["flow","vision","ops","connect","mobile"]) assert.match(server,new RegExp('\\["'+id+'"[^\
]*"Planejado"'));
  assert.match(server,/["]hub["],"HUB"/);
  assert.match(server,/["]nexus["],"Nexus"/);
  assert.match(app,/Núcleo documental do HUB/);
});

test("HUB não apresenta módulos futuros como iniciados",()=>{
  for(const [id,name] of [["hubvault","HUBVault"],["nexa","Nexa"],["veya","Veya"],["formly","Formly"],["korvo","Korvo"],["chrona","Chrona"],["meet","Meet"],["pulse","Pulse"],["acta","Acta"],["memo","Memo"],["people","People"],["web","Web"],["klash","Klash"]]){
    assert.match(app,new RegExp('id:"'+id+'",name:"'+name+'",type:"Workspace",status:"Planejado"'));
  }
});

test("documentação não promete módulos futuros como implementados",()=>{
  assert.match(readme,/HUB|Nexus/);
  assert.match(readme,/FLOW|VISION|OPS|CONNECT|MOBILE/);
});

test("API mantém proteção nos endpoints sensíveis",()=>{
  assert.match(server,/app\.post\("\/api\/auth\/login",rateLimit/);
  assert.match(server,/app\.post\("\/api\/auth\/register",rateLimit/);
  assert.match(server,/app\.post\("\/api\/contact",rateLimit/);
  assert.match(server,/app\.post\("\/api\/analiticas\/evento",rateLimit/);
});
