const API="https://kztechsite.onrender.com";const T=sessionStorage.getItem("adm")||localStorage.getItem("kz_admin_session");if(T)sessionStorage.setItem("adm",T);
const E=id=>document.getElementById(id);
async function api(path,opt={}){
 const h=new Headers(opt.headers||{});h.set("Authorization","Bearer "+T);if(opt.body&&!h.has("Content-Type"))h.set("Content-Type","application/json");
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);try{const url=API+(path.startsWith("/api/")?path:"/api"+path);const r=await fetch(url,{...opt,headers:h,signal:c.signal});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Erro de comunicação");return d}catch(x){if(x.name==="AbortError")throw Error("O servidor demorou demais para responder.");throw x}finally{clearTimeout(timer)}
}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const fmtDate=x=>x?new Date(x).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"medium"}):"—";
const labels={visualizacao:"Visualização",interacao:"Interação",cadastro:"Cadastro",login:"Login",orcamento:"Orçamento",compra:"Compra",presale:"Pré-venda"};
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
 el.innerHTML=rows?.length?rows.map(x=>{let raw=mode==="sub"?(typeof x._id==="object"?(x._id?.subcategoria||""):x._id):x._id;let name=mode==="sub"?(subLabels[raw]||raw||"Geral"):mode==="cat"?(catLabels[raw]||raw):String(raw||"Sem informação");return '<div class="metric"><div><span>'+esc(name)+'</span><b>'+esc(x.total)+'</b></div><div class="barra"><i style="width:'+Math.round((Number(x.total)||0)/max*100)+'%"></i></div></div>'}).join(""):'<p class="vazio">Sem dados no período.</p>';
}
let diasAnalytics=30,lastAnalytics=null;
async function analytics(){
 try{
 const x=await api("/admin/analiticas?dias="+diasAnalytics);
 lastAnalytics=x;
 E("atualizado").textContent="Atualizado em "+new Date().toLocaleTimeString("pt-BR");
 E("totalPeriodo").textContent=x.total+" eventos";
 const views=x.diarios||x.mercado||[];
 const vals=views.map(v=>Number(v.total)||0);
 const max=Math.max(...vals,1);
 const W=900,H=300,left=48,right=18,top=22,bottom=34;
 const plotW=W-left-right,plotH=H-top-bottom;
 const step=vals.length>1?plotW/(vals.length-1):0;
 const y=v=>top+plotH-(v/max)*plotH;
 const coords=vals.map((v,i)=>({x:vals.length===1?left+plotW/2:left+i*step+left,y:y(v),v}));
 const line=coords.length<3?coords.map((p,i)=>(i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" "):coords.slice(1).reduce((d,p,i)=>{const prev=coords[i],before=coords[Math.max(0,i-1)],next=coords[Math.min(coords.length-1,i+2)],dx=p.x-prev.x,lo=Math.min(prev.y,p.y),hi=Math.max(prev.y,p.y),t=.28;const tangentPrev=(p.y-before.y)/(i===0?1:2),tangentNext=(next.y-prev.y)/(i===coords.length-2?1:2);const c1x=prev.x+dx/3,c2x=p.x-dx/3,c1y=Math.max(lo,Math.min(hi,prev.y+tangentPrev*t)),c2y=Math.max(lo,Math.min(hi,p.y-tangentNext*t));return d+" C "+c1x.toFixed(1)+" "+c1y.toFixed(1)+", "+c2x.toFixed(1)+" "+c2y.toFixed(1)+", "+p.x.toFixed(1)+" "+p.y.toFixed(1)},"M "+coords[0].x.toFixed(1)+" "+coords[0].y.toFixed(1));
 const area=line+" L "+coords[coords.length-1].x.toFixed(1)+" "+(top+plotH)+" L "+coords[0].x.toFixed(1)+" "+(top+plotH)+" Z";
 const first=views.length?views[0]._id:"";
 const middle=views.length?views[Math.floor(views.length/2)]._id:"";
 const last=views.length?views[views.length-1]._id:"";
 const shortDate=v=>{const s=String(v??"");const m=s.match(/^(\\d{4})-(\\d{2})-(\\d{2})/);return m?m[3]+"/"+m[2]:s.slice(-5)};
 const grid=[0,.25,.5,.75,1].map(f=>{const yy=top+plotH*(1-f);return '<line x1="'+left+'" y1="'+yy+'" x2="'+(W-right)+'" y2="'+yy+'" class="chart-grid"/><text x="'+(left-10)+'" y="'+(yy+4)+'" text-anchor="end" class="chart-axis">'+Math.round(max*f)+'</text>'}).join("");
 const labelIndexes=[0,Math.floor((views.length-1)/2),views.length-1].filter((v,i,a)=>a.indexOf(v)===i);
 const xlabels=labelIndexes.map(i=>'<text x="'+coords[i].x+'" y="'+(H-8)+'" text-anchor="'+(i===0?"start":i===views.length-1?"end":"middle")+'" class="chart-axis">'+esc(shortDate(views[i]._id))+'</text>').join("");
 const dots=coords.map((p,i)=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(i===coords.length-1?"5":"3")+'" class="chart-dot"><title>'+esc(views[i]._id)+' · '+p.v+' eventos</title></circle>').join("");
 E("grafico").innerHTML=views.length
  ? '<div class="chart-canvas"><svg class="stock-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Eventos por dia no período selecionado"><defs><linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9b8cff" stop-opacity=".34"/><stop offset="100%" stop-color="#9b8cff" stop-opacity=".015"/></linearGradient><linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#9b8cff"/><stop offset="100%" stop-color="#c5baff"/></linearGradient></defs>'+grid+'<line id="chartHoverLine" x1="0" y1="'+top+'" x2="0" y2="'+(top+plotH)+'" class="chart-hover-line" visibility="hidden"/><path d="'+area+'" class="chart-area"/><path d="'+line+'" class="chart-line"/>'+dots+xlabels+'</svg><div id="chartTooltip" class="chart-tooltip" role="status" aria-live="polite" hidden></div></div><div class="stock-labels"><span>Início · '+esc(first)+'</span><span>Fim · '+esc(last)+'</span></div>'
  : '<p class="vazio">Ainda não há dados.</p>';
 if(views.length){
  const svg=E("grafico").querySelector(".stock-svg"),canvas=E("grafico").querySelector(".chart-canvas"),tip=E("chartTooltip"),guide=E("chartHoverLine");
  const showPoint=event=>{
   const rect=svg.getBoundingClientRect(),box=canvas.getBoundingClientRect();
   const px=(event.clientX-rect.left)/rect.width*W;
   let idx=0;for(let i=1;i<coords.length;i++)if(Math.abs(coords[i].x-px)<Math.abs(coords[idx].x-px))idx=i;
   const p=coords[idx],raw=String(views[idx]._id??"");
   guide.setAttribute("x1",p.x);guide.setAttribute("x2",p.x);guide.setAttribute("visibility","visible");
   svg.querySelectorAll(".chart-dot").forEach((dot,i)=>dot.classList.toggle("chart-dot-active",i===idx));
   const date=raw.match(/^\\d{4}-\\d{2}-\\d{2}/)?new Date(raw.slice(0,10)+"T12:00:00").toLocaleDateString("pt-BR",{dateStyle:"full"}):raw;
   tip.innerHTML='<strong>'+esc(date)+'</strong><span>'+esc(p.v)+' '+(p.v===1?'evento':'eventos')+'</span>';
   tip.hidden=false;
   const tx=event.clientX-box.left+14,ty=event.clientY-box.top-16;
   tip.style.left=Math.max(8,Math.min(tx,box.width-tip.offsetWidth-8))+"px";
   tip.style.top=Math.max(8,Math.min(ty,box.height-tip.offsetHeight-8))+"px";
  };
  svg.addEventListener("pointermove",showPoint);
  svg.addEventListener("pointerdown",showPoint);
  svg.addEventListener("pointerleave",()=>{guide.setAttribute("visibility","hidden");tip.hidden=true;svg.querySelectorAll(".chart-dot-active").forEach(dot=>dot.classList.remove("chart-dot-active"));});
 }
 const visitors=Number(x.visitantes)||0;
 E("kpis").innerHTML=[["Eventos",x.total,"Todas as atividades"],["Visitantes",visitors,"Identificadores únicos"],["Cadastros",(x.subcategorias||[]).filter(a=>a._id?.subcategoria==="cadastros").reduce((n,a)=>n+a.total,0),"Contas criadas"],["Comercial",(x.categorias||[]).find(a=>a._id==="comercial")?.total||0,"Atividade comercial"],["Período",diasAnalytics+" dias","Janela analisada"]].map(a=>'<div class="kpi"><span>'+a[0]+'</span><strong>'+esc(a[1])+'</strong><small>'+a[2]+'</small></div>').join("");
 barras(x.categorias,"categorias","cat");
 barras(x.subcategorias,"subcategorias","sub");
 barras(x.acoes,"acoes");
 barras(x.paginas,"paginas");
 barras(x.dispositivos,"dispositivos");
 barras(x.navegadores,"navegadores");
 E("ultimos").innerHTML=(x.ultimos||[]).map(eventCard).join("")||'<p class="vazio">Nenhuma atividade registrada.</p>';
 renderCategoryFilters(x.categorias||[]);
 }catch(e){
  const msg=e?.message||"Não foi possível carregar as analytics."; const el=E("atualizado"); if(el)el.textContent="Analytics indisponível: "+msg; const g=E("grafico"); if(g)g.innerHTML='<p class="vazio">Não foi possível carregar os dados de analytics.</p>';
 }
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
 E("comercialKpis").innerHTML=[["Orçamentos",x.orcamentos?.length||0,"Solicitações recebidas"],["Pré-vendas",x.preVendas?.length||0,"Intenções de compra"],["Compras",x.compras?.length||0,"Checkouts/pedidos"],["Contatos",x.contatos?.length||0,"Mensagens recebidas"]].map(a=>'<div class="kpi"><span>'+a[0]+'</span><strong>'+a[1]+'</strong><small>'+a[2]+'</small></div>').join("");
 const row=(r,t)=>'<article class="comercial-row"><div><strong>'+esc(r.nome||"Visitante")+'</strong><span>'+esc(r.email||"")+'</span></div><div><b>'+esc(t)+'</b><small>'+esc(r.productId||r.serviceId||r.objective||r.status||"")+(r.scope?"<br>"+esc(r.scope).slice(0,220):"")+'</small></div><time>'+fmtDate(r.createdAt)+'</time></article>';
 E("orcamentosLista").innerHTML=(x.orcamentos||[]).map(r=>row(r,"Orçamento")).join("")||'<p class="vazio">Nenhum orçamento.</p>';
 E("comprasLista").innerHTML=(x.compras||[]).map(r=>row(r,"Compra")).join("")||'<p class="vazio">Nenhuma compra.</p>'; E("preVendasLista").innerHTML=(x.preVendas||[]).map(r=>row(r,"Pré-venda")).join("")||'<p class="vazio">Nenhuma pré-venda.</p>';
 E("contatosLista").innerHTML=(x.contatos||[]).map(r=>'<article class="comercial-row"><div><strong>'+esc(r.name||"Sem nome")+'</strong><span>'+esc(r.email||"")+'</span></div><div><b>Contato</b><small>'+esc(r.message||"").slice(0,220)+'</small></div><time>'+fmtDate(r.createdAt)+'</time></article>').join("")||'<p class="vazio">Nenhum contato.</p>';
}
async function interacoes(){const x=lastAnalytics||await api("/admin/analiticas?dias="+diasAnalytics);E("interacoesLista").innerHTML=(x.ultimos||[]).filter(r=>r.tipo==="interacao"||r.tipo==="visualizacao").map(eventCard).join("")||'<p class="vazio">Nenhuma interação registrada.</p>'}
async function health(){try{const x=await fetch(API+"/api/health").then(r=>r.json());E("saude")?.replaceChildren();}catch{}}
let cache=[];
async function rules(){cache=await api("/admin/conteudo");E("lista").innerHTML=cache.map(r=>'<div class="item"><b>'+esc(r.seletor)+'</b> · '+esc(r.tipo)+'<div class="meta">'+esc(r.pagina)+' · '+(r.publicado?"Publicado":"Rascunho")+'<br>Responsável: '+esc(r.atualizadoPorNome||r.criadoPorNome||r.atualizadoPor||r.criadoPor||"Sistema")+'<br>'+esc(r.valor).slice(0,250)+'</div><div class="actions"><button onclick="edit(\''+r._id+'\')">Editar</button><button onclick="pub(\''+r._id+'\','+(!r.publicado)+')">'+(r.publicado?"Despublicar":"Publicar")+'</button><button onclick="delr(\''+r._id+'\')">Excluir</button></div></div>').join("")}
function fill(r={}){for(const [id,v] of Object.entries({id:r._id||"",pg:r.pagina||"/",sel:r.seletor||"",tipo:r.tipo||"texto",atr:r.atributo||"",prop:r.propriedade||"",val:r.valor||""}))E(id).value=v;E("pub").checked=r.publicado!==false}
window.edit=id=>{fill(cache.find(x=>x._id===id));E("dlg").showModal()};window.pub=async(id,p)=>{await api("/admin/conteudo/"+id,{method:"PATCH",body:JSON.stringify({publicado:p})});rules()};window.delr=async id=>{if(confirm("Excluir?")){await api("/admin/conteudo/"+id,{method:"DELETE"});rules()}};
async function media(){const x=await api("/admin/midias");E("media").innerHTML=x.map(r=>'<div class="item"><img src="'+esc(r.url)+'" style="max-width:100%;max-height:180px"><p><b>'+esc(r.nome)+'</b></p><div class="meta">Responsável: '+esc(r.criadoPorNome||r.criadoPor||"Sistema") + '<br>Enviada em: '+fmtDate(r.criadoEm)+'</div><input readonly value="'+esc(r.url)+'"></div>').join("")}
async function admins(){const x=await api("/admin/administradores");E("adminLista").innerHTML=x.map(r=>'<div class="item"><b>'+esc(r.nome)+'</b><div>'+esc(r.email)+' · '+esc(r.papel)+'</div></div>').join("")}
async function logs(){const x=await api("/admin/auditoria");E("logs").innerHTML=x.map(r=>'<div class="item"><b>'+esc(r.acao)+'</b><div class="meta">Responsável: '+esc(r.nome||r.email||"Sistema")+' · '+esc(r.email||"sem e-mail")+' · '+fmtDate(r.criadoEm)+'</div><p>'+esc(r.detalhes)+'</p></div>').join("")}
let planosAdminData={};
async function planosAdmin(){
 const x=await api("/admin/planos");planosAdminData=x||{};
 const groups=Object.entries(planosAdminData);
 E("planosAdmin").innerHTML=groups.map(([key,lista])=>'<section class="panel plan-admin-group"><div class="panel-title"><h2>'+esc(key.toUpperCase())+'</h2><span>'+lista.length+' plano(s)</span></div>'+lista.map((p,i)=>'<article class="plan-admin-card" data-plan-group="'+esc(key)+'" data-plan-index="'+i+'"><div><strong>'+esc(p.name||p.id)+'</strong><small>'+esc(p.tag||"")+'</small></div><label>Preço<input data-plan-field="price" type="number" min="0" step="1" value="'+(p.price==null?"":esc(p.price))+'" placeholder="Sob consulta"></label><label>Pré-venda (-15%)<input data-plan-field="preSalePrice" type="number" min="0" step="1" value="'+(p.preSalePrice==null?"":esc(p.preSalePrice))+'" placeholder="Sob consulta"></label>'+(p.monthly!==undefined?'<label>Mensalidade<input data-plan-field="monthly" type="number" min="0" step="1" value="'+(p.monthly==null?"":esc(p.monthly))+'"></label><label>Pré-venda mensal<input data-plan-field="preSaleMonthly" type="number" min="0" step="1" value="'+(p.preSaleMonthly==null?"":esc(p.preSaleMonthly))+'"></label>':"")+'<span class="plan-admin-meta">'+esc(p.billing||"mês")+' · '+esc(p.id)+'</span></article>').join("")+'</section>').join("");
}
async function salvarPlanosAdmin(){
 const clone=JSON.parse(JSON.stringify(planosAdminData));
 document.querySelectorAll(".plan-admin-card").forEach(card=>{
  const g=card.dataset.planGroup,i=Number(card.dataset.planIndex),p=clone[g]?.[i];if(!p)return;
  card.querySelectorAll("[data-plan-field]").forEach(input=>{const k=input.dataset.planField;p[k]=input.value===""?null:Number(input.value);});
 });
 const b=E("salvarPlanos");if(b){b.disabled=true;b.textContent="Salvando…";}
 try{planosAdminData=await api("/admin/planos",{method:"PUT",body:JSON.stringify(clone)});await planosAdmin();if(b)b.textContent="✓ Salvo";setTimeout(()=>{if(b)b.textContent="Salvar alterações"},1500)}
 catch(e){alert(e.message);if(b)b.textContent="Salvar alterações"}
 finally{if(b)b.disabled=false}
}
async function load(){try{await analytics()}catch(e){const el=E("atualizado");if(el)el.textContent="Analytics indisponível: "+(e?.message||"erro desconhecido")}}
async function atualizarTudo(){const b=E("atualizarTudo");if(!b)return;b.disabled=true;b.textContent="↻ Atualizando…";try{await load();b.textContent="✓ Atualizado";setTimeout(()=>b.textContent="↻ Atualizar informações",1600)}catch{b.textContent="⚠ Erro";setTimeout(()=>b.textContent="↻ Atualizar informações",2200)}finally{b.disabled=false}}
E("atualizarTudo")?.addEventListener("click",atualizarTudo);E("out").onclick=()=>{sessionStorage.removeItem("adm");localStorage.removeItem("kz_admin_session");location.href=new URL("./",location.href).href};
function mostrarSupercategoria(tipo){const analyticsAtivo=tipo==="analytics";E("analyticsSuper").hidden=!analyticsAtivo;E("administracao").hidden=analyticsAtivo;document.querySelectorAll(".aba").forEach(x=>x.hidden=true);document.querySelectorAll("[data-a]").forEach(x=>x.classList.remove("ativo"));if(analyticsAtivo){E("analytics").hidden=false;document.querySelector('[data-a="analytics"]')?.classList.add("ativo");}}
async function abrirAba(nome){
 const allowed=["analytics","planos","contas","comercial","interacoes","conteudo","midias","admins","auditoria"];
 if(!allowed.includes(nome))return;
 document.querySelectorAll(".aba").forEach(el=>el.hidden=el.id!==nome);
 document.querySelectorAll("[data-a]").forEach(el=>el.classList.toggle("ativo",el.dataset.a===nome));
 E("analyticsSuper").hidden=false;E("administracao").hidden=true;
 document.querySelectorAll("[data-super]").forEach(el=>el.classList.toggle("super-ativo",el.dataset.super==="analytics"));
 try{
  if(nome==="analytics")await analytics();
  else if(nome==="planos")await planosAdmin();
  else if(nome==="contas")await contas();
  else if(nome==="comercial")await comercial();
  else if(nome==="interacoes")await interacoes();
  else if(nome==="conteudo")await rules();
  else if(nome==="midias")await media();
  else if(nome==="admins")await admins();
  else if(nome==="auditoria")await logs();
 }catch(err){
  const el=E(nome==="planos"?"planosAdmin":nome==="contas"?"contasLista":nome==="comercial"?"comercialKpis":nome==="interacoes"?"interacoesLista":nome==="conteudo"?"lista":nome==="midias"?"media":nome==="admins"?"adminLista":nome==="auditoria"?"logs":"atualizado");
  if(el)el.innerHTML='<p class="vazio">Não foi possível carregar esta seção: '+esc(err?.message||"erro inesperado")+'</p>';
 }
}
document.querySelectorAll("[data-a]").forEach(b=>b.addEventListener("click",()=>abrirAba(b.dataset.a)));
document.querySelectorAll("[data-super]").forEach(b=>b.onclick=async()=>{
 document.querySelectorAll("[data-super]").forEach(x=>x.classList.toggle("super-ativo",x===b));
 mostrarSupercategoria(b.dataset.super);
 if(b.dataset.super==="analytics")await abrirAba("analytics");
});
document.querySelectorAll(".periodos [data-dias]").forEach(b=>b.addEventListener("click",async()=>{const dias=Math.max(1,Math.min(365,Number(b.dataset.dias)||30));diasAnalytics=dias;document.querySelectorAll(".periodos [data-dias]").forEach(x=>x.classList.toggle("selecionado",x===b));await analytics();}));E("atualizarAnalytics").onclick=analytics;E("salvarPlanos").onclick=salvarPlanosAdmin;E("atualizarContas").onclick=contas;E("atualizarInteracoes").onclick=interacoes;
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
 }
})();
setInterval(()=>{const a=E("analytics");if(a&&!a.hidden)analytics().catch(()=>{})},60000);