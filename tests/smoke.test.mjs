import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("smoke: repository has the complete runtime surface",()=>{
  for(const path of [
    "package.json",".env.example","render.yaml","README.md",
    "public/index.html","public/assets/app.js","public/assets/styles.css","public/assets/mark.svg",
    "server/index.mjs",".github/workflows/ci.yml",".github/workflows/pages.yml"
  ]) assert.ok(fs.existsSync(path),`Arquivo ausente: ${path}`);
});
