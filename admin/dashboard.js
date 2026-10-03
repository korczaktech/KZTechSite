const API="https://kztechsite.onrender.com";const T=sessionStorage.getItem("adm")||localStorage.getItem("kz_admin_session");if(T)sessionStorage.setItem("adm",T);
const E=id=>document.getElementById(id);
async function api(path,opt={}){
 const h=new Headers(opt.headers||{});h.set("Authorization","Bearer "+T);if(opt.body&&!h.has("Content-Type"))h.set("Content-Type","application/json");
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);try{const url=API+(path.startsWith("/api/")?path:"/api"+path);const r=await fetch(url,{...opt,headers:h,signal:c.signal});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Erro de comunicação");return d}catch(x){if(x.name==="AbortError")throw Error("O servidor demorou demais para responder.");throw x}finally{clearTimeout(timer)}
}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const fmtDate=x=>x?new Date(x).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"medium"}):"—";
const labels={visualizacao:"Visualização",interacao:"Interação",cadastro:"Cadastro",login:"Login",orcamento:"Orçamento",compra:"Compra"};
const catLabels={institucional:"Institucional",comercial:"Comercial",contas:"Contas",interacoes:"Interações"};
const subLabels={orcamentos:"Orçamentos",compras:"Compras",mentorias:"Mentorias",cadastros:"Cadastros",logins:"Log-ins",perfil:"Perfil",produtos:"Produtos",servicos:"Serviços",contato:"Contato",navegacao:"Navegação",geral:"Geral"};
function humanEvent(r){
 let cat=r.categoria||"",sub=r.subcategoria||"",acao=r.acao||r.evento||"",desc=r.descricao||"";
 const t=String(acao);
 if(!cat||cat==="interacoes"&&(!sub||sub==="geral")){
   const low=(t+" "+(r.pagina||"")).toLowerCase();
   if(/criar|minha conta|cadastro/.test(low)){cat="contas";sub="cadastros";acao="Criar conta";desc=desc||"Iniciou o fluxo de criação de conta."}
   else if(/entrar|login/.test(low)){cat="contas";sub="logins";acao="Entrar";desc=desc||"Iniciou o fluxo de login."}
   else if(/mentoria|inscrever/.test(low)){cat="comercial";sub="mentorias";acao="Inscrição na mentoria";desc=desc||"Demonstrou interesse em se inscrever na Mentoria."}
   else if(/orçamento/.test(low)){cat="comercial";sub="orcamentos";acao="Solicitar orçamento";desc=desc||"Iniciou uma solicitação de orçamento."}
   else if(/comprar|compra/.test(low)){cat="comercial";sub="compras";acao="Comprar";desc=desc||"Iniciou uma compra."}
   else if(/contato|falar/.test(low)){cat="comercial";sub="contato";acao="Falar com a equipe";desc=desc||"Abriu um canal de contato."}
 }
 if(!acao||/^\d+$/.test(t)||/01Comercial/.test(t)){acao="Interação na página";desc=desc||"Interagiu com o site."}
 return {cat,sub,acao,desc};
}
function eventCard(r){
 const h=humanEvent(r),user=r.nome||r.email;
 const pessoa=user?'<div class="evento-pessoa"><strong>'+esc(r.nome||"Visitante")+'</strong><span>'+esc(r.email||"")+'</span></div>':"";
 return '<article class="evento-card"><div class="evento-icone">'+esc((h.cat||"i").slice(0,1).toUpperCase())+'</div><div class="evento-corpo"><div class="evento-top"><span class="tag">'+esc(catLabels[h.cat]||h.cat||"Interações")+'</span><span class="tag secundario">'+esc(subLabels[h.sub]||h.sub||"Geral")+'</span><time>'+fmtDate(r.criadoEm)+'</time></div><h3>'+esc(h.acao)+'</h3><p>'+esc(h.desc)+'</p><div class="evento-meta"><span>📍 '+esc(r.pagina||"/")+'</span>'+ (r.entidade?'<span>'+esc(r.entidade)+(r.entidadeId?" · "+esc(r.entidadeId):"")+'</span>':"") +pessoa+'</div></div></article>';
}
function barras(rows,target,mode="normal"){
 const el=E(target),max=Math.max(...(rows||[]).map(x=>Number(x.total)||0),1);
 el.innerHTML=rows?.length?rows.map(x=>{let name=mode==="sub"?(subLabels[x._id?.subcategoria]||x._id?.subcategoria||"Geral"):mode==="cat"?(catLabels[x._id]||x._id):String(x._id||"Sem informação");return '<div class="metric"><div><span>'+esc(name)+'</span><b>'+esc(x.total)+'</b></div><div class="barra"><i style="width:'+Math.round((Number(x.total)||0)/max*100)+'%"></i></div></div>'}).join(""):'<p class="vazio">Sem dados no período.</p>';
}
let diasAnalytics=30,lastAnalytics=null;
async function analytics(){
 const x=await api("/admin/analiticas?dias="+diasAnalytics);lastAnalytics=x;
 E("atualizado").textContent="Atualizado em "+new Date().toLocaleTimeString("pt-BR");E("totalPeriodo").textContent=x.total+" eventos";
 const views=x.diarios||[],max=Math.max(...views.map(v=>Number(v.total)||0),1);
 E("grafico").innerHTML=views.length?views.map(v=>'<div class="coluna" title="'+esc(v._id)+': '+esc(v.total)+'"><i style="height:'+Math.max(5,Math.round((Number(v.total)||0)/max*100))+'%"></i><span>'+esc(v._id.slice(5))+'</span></div>').join(""):'<p class="vazio">Ainda não há dados.</p>';
 const visitors=Number(x.visitantes)||0,catTotal=(x.categorias||[]).reduce((n,a)=>n+Number(a.total||0),0);
 E("kpis").innerHTML=[["Eventos",x.total,"Todas as atividades"],["Visitantes",visitors,"Identificadores únicos"],["Cadastros",(x.subcategorias||[]).filter(a=>a._id?.subcategoria==="cadastros").reduce((n,a)=>n+a.total,0),"Contas criadas"],["Comercial",(x.categorias||[]).find(a=>a._id==="comercial")?.total||0,"Atividade comercial"],["Período",diasAnalytics+" dias","Janela analisada"]].map(a=>'<div class="kpi"><span>'+a[0]+'</span><strong>'+esc(a[1])+'</strong><small>'+a[2]+'</small></div>').join("");
 barras(x.categorias,"categorias","cat");barras(x.subcategorias,"subcategorias","sub");barras(x.acoes,"acoes");barras(x.paginas,"paginas");barras(x.dispositivos,"dispositivos");barras(x.navegadores,"navegadores");
 E("ultimos").innerHTML=(x.ultimos||[]).map(eventCard).join("")||'<p class="vazio">Nenhuma atividade registrada.</p>';
 renderCategoryFilters(x.categorias||[]);
}
function renderCategoryFilters(rows){E("filtrosCategorias").innerHTML='<button class="filtro ativo" data-cat="">Todas</button>'+rows.map(x=>'<button class="filtro" data-cat="'+esc(x._id)+'">'+esc(catLabels[x._id]||x._id)+' <b>'+x.total+'</b></button>').join("");document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-cat]").forEach(x=>x.classList.remove("ativo"));b.classList.add("ativo");const cat=b.dataset.cat;const rows=(lastAnalytics?.ultimos||[]).filter(x=>!cat||humanEvent(x).cat===cat);E("ultimos").innerHTML=rows.map(eventCard).join("")||'<p class="vazio">Nenhuma atividade nessa categoria.</p>'})}
async function contas(){
 const x=await api("/admin/contas"),contas=x.contas||[],ativ=x.atividades||[];
 const cad=ativ.filter(a=>a.tipo==="cadastro").length,log=ativ.filter(a=>a.tipo==="login").length;
 E("contaKpis").innerHTML=[["Contas",contas.length,"Total de contas"],["Cadastros",cad,"Contas criadas com rastreamento"],["Log-ins",log,"Entradas registradas"],["Verificadas",contas.filter(a=>a.verified).length,"Contas verificadas"]].map(a=>'<div class="kpi"><span>'+a[0]+'</span><strong>'+a[1]+'</strong><small>'+a[2]+'</small></div>').join("");
 E("contasLista").innerHTML=contas.map(u=>{const a=u.atividades||[],logins=a.filter(x=>x.tipo==="login").length;return '<details class="conta-card"><summary><div><strong>'+esc(u.name||"Sem nome")+'</strong><span>'+esc(u.email||"")+'</span></div><div class="conta-badges"><b>'+logins+' log-ins</b><small>'+esc(u.verified?"Verificada":"Não verificada")+'</small></div></summary><div class="conta-detalhes"><div><span>Nome</span><b>'+esc(u.name||"—")+'</b></div><div><span>E-mail</span><b>'+esc(u.email||"—")+'</b></div><div><span>Conta criada</span><b>'+fmtDate(u.createdAt)+'</b></div><div><span>Último registro</span><b>'+fmtDate(a[0]?.criadoEm)+'</b></div><div><span>Perfil</span><b>'+esc(u.role||"user")+'</b></div></div></details>'}).join("")||'<p class="vazio">Nenhuma conta cadastrada.</p>';
 E("atividadesContas").innerHTML=ativ.map(eventCard).join("")||'<p class="vazio">Nenhuma atividade de conta registrada.</p>';
}
async function comercial(){
 const x=await api("/admin/comercial");
 E("comercialKpis").innerHTML=[["Orçamentos",x.orcamentos?.length||0,"Solicitações recebidas"],["Compras",x.compras?.length||0,"Checkouts/pedidos"],["Contatos",x.contatos?.length||0,"Mensagens recebidas"]].map(a=>'<div class="kpi"><span>'+a[0]+'</span><strong>'+a[1]+'</strong><small>'+a[2]+'</small></div>').join("");
 const row=(r,t)=>'<article class="comercial-row"><div><strong>'+esc(r.nome||"Visitante")+'</strong><span>'+esc(r.email||"")+'</span></div><div><b>'+esc(t)+'</b><small>'+esc(r.productId||r.status||r.message||"")+'</small></div><time>'+fmtDate(r.createdAt)+'</time></article>';
 E("orcamentosLista").innerHTML=(x.orcamentos||[]).map(r=>row(r,"Orçamento")).join("")||'<p class="vazio">Nenhum orçamento.</p>';
 E("comprasLista").innerHTML=(x.compras||[]).map(r=>row(r,"Compra")).join("")||'<p class="vazio">Nenhuma compra.</p>';
 E("contatosLista").innerHTML=(x.contatos||[]).map(r=>'<article class="comercial-row"><div><strong>'+esc(r.name||"Sem nome")+'</strong><span>'+esc(r.email||"")+'</span></div><div><b>Contato</b><small>'+esc(r.message||"").slice(0,220)+'</small></div><time>'+fmtDate(r.createdAt)+'</time></article>').join("")||'<p class="vazio">Nenhum contato.</p>';
}
async function interacoes(){const x=lastAnalytics||await api("/admin/analiticas?dias="+diasAnalytics);E("interacoesLista").innerHTML=(x.ultimos||[]).filter(r=>r.tipo==="interacao"||r.tipo==="visualizacao").map(eventCard).join("")||'<p class="vazio">Nenhuma interação registrada.</p>'}
async function health(){try{const x=await fetch(API+"/api/health").then(r=>r.json());E("saude")?.replaceChildren();}catch{}}
let cache=[];
async function rules(){cache=await api("/admin/conteudo");E("lista").innerHTML=cache.map(r=>'<div class="item"><b>'+esc(r.seletor)+'</b> · '+esc(r.tipo)+'<div class="meta">'+esc(r.pagina)+' · '+(r.publicado?"Publicado":"Rascunho")+'<br>Responsável: '+esc(r.atualizadoPor||r.criadoPor||"Sistema")+'<br>'+esc(r.valor).slice(0,250)+'</div><div class="actions"><button onclick="edit(\''+r._id+'\')">Editar</button><button onclick="pub(\''+r._id+'\','+(!r.publicado)+')">'+(r.publicado?"Despublicar":"Publicar")+'</button><button onclick="delr(\''+r._id+'\')">Excluir</button></div></div>').join("")}
function fill(r={}){for(const [id,v] of Object.entries({id:r._id||"",pg:r.pagina||"/",sel:r.seletor||"",tipo:r.tipo||"texto",atr:r.atributo||"",prop:r.propriedade||"",val:r.valor||""}))E(id).value=v;E("pub").checked=r.publicado!==false}
window.edit=id=>{fill(cache.find(x=>x._id===id));E("dlg").showModal()};window.pub=async(id,p)=>{await api("/admin/conteudo/"+id,{method:"PATCH",body:JSON.stringify({publicado:p})});rules()};window.delr=async id=>{if(confirm("Excluir?")){await api("/admin/conteudo/"+id,{method:"DELETE"});rules()}};
async function media(){const x=await api("/admin/midias");E("media").innerHTML=x.map(r=>'<div class="item"><img src="'+esc(r.url)+'" style="max-width:100%;max-height:180px"><p><b>'+esc(r.nome)+'</b></p><div class="meta">Responsável: '+esc(r.criadoPor||"Sistema") + '<br>Enviada em: '+fmtDate(r.criadoEm)+'</div><input readonly value="'+esc(r.url)+'"></div>').join("")}
async function admins(){const x=await api("/admin/administradores");E("adminLista").innerHTML=x.map(r=>'<div class="item"><b>'+esc(r.nome)+'</b><div>'+esc(r.email)+' · '+esc(r.papel)+'</div></div>').join("")}
async function logs(){const x=await api("/admin/auditoria");E("logs").innerHTML=x.map(r=>'<div class="item"><b>'+esc(r.acao)+'</b><div class="meta">Responsável: '+esc(r.nome||r.email||"Sistema")+' · '+esc(r.email||"sem e-mail")+' · '+fmtDate(r.criadoEm)+'</div><p>'+esc(r.detalhes)+'</p></div>').join("")}
async function load(){
 const tarefas=[
  ["analytics",analytics],["contas",contas],["comercial",comercial],["conteúdo",rules],["mídias",media],["administradores",admins],["auditoria",logs]
 ];
 const erros=[];
 await Promise.all(tarefas.map(async([nome,fn])=>{try{await fn()}catch(e){erros.push(nome+": "+(e?.message||"erro desconhecido"))}}));
 if(erros.length){
  const el=E("atualizado");
  if(el)el.textContent="Painel carregado com avisos: "+erros.join(" · ");
 }
}
async function atualizarTudo(){const b=E("atualizarTudo");if(!b)return;b.disabled=true;b.textContent="↻ Atualizando…";try{await load();b.textContent="✓ Atualizado";setTimeout(()=>b.textContent="↻ Atualizar informações",1600)}catch{b.textContent="⚠ Erro";setTimeout(()=>b.textContent="↻ Atualizar informações",2200)}finally{b.disabled=false}}
E("atualizarTudo")?.addEventListener("click",atualizarTudo);E("out").onclick=()=>{sessionStorage.removeItem("adm");localStorage.removeItem("kz_admin_session");location.href=new URL("./",location.href).href};
document.querySelectorAll("[data-a]").forEach(b=>b.onclick=async()=>{document.querySelectorAll("[data-a]").forEach(x=>x.classList.remove("ativo"));b.classList.add("ativo");document.querySelectorAll(".aba").forEach(x=>x.hidden=true);E(b.dataset.a).hidden=false;if(b.dataset.a==="analytics")await analytics();if(b.dataset.a==="contas")await contas();if(b.dataset.a==="comercial")await comercial();if(b.dataset.a==="interacoes")await interacoes()});
document.querySelectorAll("[data-dias]").forEach(b=>b.onclick=async()=>{diasAnalytics=Number(b.dataset.dias)||30;document.querySelectorAll("[data-dias]").forEach(x=>x.classList.remove("selecionado"));b.classList.add("selecionado");await analytics()});
E("atualizarAnalytics").onclick=analytics;E("atualizarContas").onclick=contas;E("atualizarInteracoes").onclick=interacoes;
E("novo").onclick=()=>{fill();E("dlg").showModal()};E("cancel").onclick=()=>E("dlg").close();E("rf").onsubmit=async e=>{e.preventDefault();const b={pagina:E("pg").value,seletor:E("sel").value,tipo:E("tipo").value,atributo:E("atr").value,propriedade:E("prop").value,valor:E("val").value,publicado:E("pub").checked},id=E("id").value;await api(id?"/admin/conteudo/"+id:"/admin/conteudo",{method:id?"PUT":"POST",body:JSON.stringify(b)});E("dlg").close();rules()};
E("file").onchange=e=>{const f=e.target.files[0];if(!f||f.size>8388608)return alert("Imagem máxima: 8 MB");const q=new FileReader();q.onload=async()=>{try{await api("/admin/midias",{method:"POST",body:JSON.stringify({nome:f.name,tipo:f.type,tamanho:f.size,dados:q.result})});media()}catch(x){alert(x.message)}};q.readAsDataURL(f)};
E("novoAdmin").onclick=()=>E("ad").showModal();E("ac").onclick=()=>E("ad").close();E("af").onsubmit=async e=>{e.preventDefault();try{await api("/admin/administradores",{method:"POST",body:JSON.stringify({nome:E("an").value,email:E("ae").value,senha:E("ap").value})});E("ad").close();e.target.reset();admins()}catch(x){alert(x.message)}};
(async()=>{
 if(!T){
  const el=E("atualizado");
  if(el)el.textContent="Sessão administrativa ausente. Faça login novamente.";
  return;
 }
 try{
  const u=await api("/api/me");
  if(u.role!=="admin")throw Error("Conta sem permissão de administrador");
  await load();
 }catch(e){
  const el=E("atualizado");
  if(el)el.textContent="Sessão/API: "+(e?.message||"não foi possível validar a sessão")+" — o painel foi mantido aberto para diagnóstico.";
  try{await load()}catch{}
 }
})();
setInterval(()=>{const a=E("analytics");if(a&&!a.hidden)analytics()},60000);