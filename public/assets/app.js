const API_URL="https://kztechsite.onrender.com";
const root=document.querySelector("#app");
const state={token:localStorage.getItem("kz_token"),user:null,products:[],menu:false};

const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
const icon=name=>{
  const paths={
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>',
    external:'<path d="M14 5h5v5M19 5l-8 8"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'
  };
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.arrow)+'</svg>';
};

async function api(url,opt={}){
  const h={"Content-Type":"application/json",...(opt.headers||{})};
  if(state.token)h.Authorization="Bearer "+state.token;
  const r=await fetch(API_URL+url,{...opt,headers:h});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(d.error||"Não foi possível concluir a operação.");
  return d;
}

const links=[
  ["/","Início"],["/portfolio","Portfólio"],["/produtos","Produtos"],["/empresa","Empresa"],
  ["/historia","História"],["/visao","Visão"],["/valores","Valores"],["/parcerias","Parcerias"],["/carreiras","Carreiras"],
  ["/faq","FAQ"],["/contato","Contato"],["/conta","Meu perfil"]
];

function nav(){
  const h=location.hash.slice(2)||"/";
  const active=p=>h===p||(p!=="/"&&h.startsWith(p));
  const group=(title,items,offset)=>'<div class="side-section">'+title+'</div>'+items.map(([p,n],i)=>
    '<a class="side-link '+(active(p)?"active":"")+'" aria-current="'+(active(p)?"page":"false")+'" href="#'+p+'" data-action="close-menu"><span>'+n+'</span><span class="side-arrow">'+String(offset+i+1).padStart(2,"0")+'</span></a>'
  ).join("");
  return '<header class="nav"><div class="shell"><a class="brand" href="#/" aria-label="Korczak Technology — início"><img class="brand-mark" src="./assets/mark.svg" alt="" aria-hidden="true">KORCZAK TECHNOLOGY</a><button class="menu-toggle '+(state.menu?"active":"")+'" type="button" aria-label="'+(state.menu?"Fechar navegação":"Abrir navegação")+'" aria-expanded="'+state.menu+'" aria-controls="site-sidebar" data-action="toggle-menu"><span class="menu-icon" aria-hidden="true"></span><span class="pulse" aria-hidden="true"></span></button></div></header>'+
    '<div class="sidebar-backdrop '+(state.menu?"open":"")+'" data-action="close-menu" aria-hidden="true"></div>'+
    '<aside id="site-sidebar" class="sidebar '+(state.menu?"open":"")+'" aria-label="Navegação principal" aria-hidden="'+(!state.menu)+'"><div class="side-head"><div><small>Navegação</small></div><small>KZ / 01</small></div><nav class="side-nav">'+
    group("Principal",links.slice(0,4),0)+group("Ecossistema",links.slice(4,9),9)+group("Conta & suporte",links.slice(9),14)+
    '</nav><div class="side-footer">Korczak Technology · Sistemas, software e produtos digitais.</div></aside>';
}

function card(p,i){
  return '<a class="card" href="#/produto/'+encodeURIComponent(p.id)+'"><span class="status">'+esc(p.status||p.type)+'</span><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(p.description)+'</p><span class="card-arrow">'+icon("arrow")+'</span></a>';
}

function home(){
  return '<main id="main-content"><section class="hero shell"><span class="eyebrow">Tecnologia · Software · Sistemas</span><h1>Construímos tecnologia para operar o futuro.</h1><p>Korczak Technology cria produtos digitais, plataformas e sistemas para pessoas, equipes e operações.</p><div class="actions"><a class="btn" href="#/portfolio">Ver portfólio '+icon("arrow")+'</a><a class="btn ghost" href="#/empresa">Conhecer a empresa</a></div></section><section class="section shell"><span class="eyebrow">Ecossistema</span><h2>Um portfólio. Várias possibilidades.</h2><div class="grid">'+state.products.slice(0,6).map(card).join("")+'</div></section></main>';
}

function portfolio(){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Portfólio</span><h2>O universo Korczak.</h2><p class="section-lead">Um conjunto de produtos e projetos que formam o ecossistema Korczak Technology. Explore cada iniciativa, seu propósito e estágio atual.</p></div><div class="grid">'+state.products.map(card).join("")+'</div></main>';
}

function products(){
  return '<main id="main-content" class="section shell"><span class="eyebrow">Produtos</span><h2>O ecossistema Korczak.</h2><p class="section-lead">Produtos próprios organizados em uma arquitetura modular.</p><div class="grid">'+state.products.map(card).join("")+'</div></main>';
}

function product(id){
  const p=state.products.find(x=>x.id===id);
  if(!p)return '<main id="main-content" class="section shell"><span class="eyebrow">Produto</span><h2>Produto não encontrado.</h2><a class="btn ghost" href="#/produtos">Voltar aos produtos</a></main>';
  return '<main id="main-content" class="section shell"><span class="eyebrow">'+esc(p.type)+'</span><h2>'+esc(p.name)+'.</h2><div class="split"><div><p class="section-lead">'+esc(p.description)+'</p></div><div><span class="status">'+esc(p.status)+'</span><div class="actions"><button class="btn" type="button" data-action="quote" data-product="'+esc(p.id)+'">Solicitar orçamento '+icon("arrow")+'</button></div></div></div></main>';
}

function company(){
  return '<main id="main-content" class="section shell"><span class="eyebrow">Empresa</span><h2>Korczak Technology.</h2><div class="split"><div><h3>Nossa história</h3><p class="muted">Uma empresa orientada à construção de software, sistemas e produtos digitais próprios, desenvolvidos de forma modular.</p></div><div><h3>Visão</h3><p class="muted">Criar uma camada tecnológica integrada para trabalho, operações, desenvolvimento e inteligência digital.</p></div></div><div class="rule"></div><h3>Valores</h3><p class="muted">Clareza · Autonomia · Engenharia · Privacidade · Evolução contínua</p></main>';
}

function contact(){
  return '<main id="main-content" class="section shell"><span class="eyebrow">Contato</span><h2>Vamos conversar.</h2><p class="section-lead">Envie uma mensagem para a equipe Korczak Technology.</p><form class="form" id="contact-form"><label><span class="sr-only">Nome</span><input class="field" name="name" placeholder="Nome" autocomplete="name" required></label><label><span class="sr-only">Email</span><input class="field" name="email" type="email" placeholder="Email" autocomplete="email" required></label><label><span class="sr-only">Telefone</span><input class="field" name="phone" placeholder="Telefone" autocomplete="tel"></label><label><span class="sr-only">Mensagem</span><textarea class="field" name="message" rows="7" placeholder="Como podemos ajudar?" required></textarea></label><button class="btn" type="submit">Enviar mensagem '+icon("arrow")+'</button><small id="msg" class="muted form-note" role="status"></small></form></main>';
}

function account(){
  if(!state.token)return '<main id="main-content" class="section shell"><span class="eyebrow">Meu perfil</span><h2>Entre na sua conta.</h2><form class="form" id="login-form"><label><span class="sr-only">Email</span><input class="field" name="email" type="email" placeholder="Email" autocomplete="email" required></label><label><span class="sr-only">Senha</span><input class="field" name="password" type="password" placeholder="Senha" autocomplete="current-password" required></label><button class="btn" type="submit">Entrar</button><button type="button" class="btn ghost" data-action="register">Criar conta</button><small id="auth" class="muted form-note" role="status"></small></form></main>';
  const u=state.user||{},initial=esc((u.name||"K").slice(0,1).toUpperCase());
  return '<main id="main-content" class="section shell"><span class="eyebrow">Meu perfil</span><h2>Minha conta.</h2><div class="profile"><aside class="profile-aside"><div class="profile-avatar" aria-hidden="true">'+initial+'</div><h3>'+esc(u.name||"Usuário")+'</h3><p class="muted">'+esc(u.email||"")+'</p><span class="status">'+esc(u.role||"user")+'</span></aside><section class="profile-main"><div class="profile-row"><span class="muted">Nome</span><strong>'+esc(u.name||"—")+'</strong></div><div class="profile-row"><span class="muted">Email</span><strong>'+esc(u.email||"—")+'</strong></div><div class="profile-row"><span class="muted">Perfil</span><strong>'+esc(u.role||"user")+'</strong></div><div class="profile-row"><span class="muted">Verificação</span><strong>'+((u.verified)?"Verificado":"Pendente")+'</strong></div><div class="actions"><a class="btn ghost" href="#/contato">Falar com a equipe</a><button class="btn" type="button" data-action="logout">Sair</button></div></section></div></main>';
}

function infoPage(title,kicker,body){
  return '<main id="main-content" class="section shell"><span class="eyebrow">'+kicker+'</span><h2>'+title+'.</h2><p class="section-lead">'+body+'</p></main>';
}

const legalPages={
  privacidade:["Privacidade","Como tratamos dados","Esta página descreve, de forma geral, como dados pessoais podem ser utilizados no ecossistema Korczak Technology.","Dados de conta podem ser utilizados para autenticação e manutenção do perfil. Dados enviados pelo formulário de contato são utilizados para atendimento. Solicitações de orçamento ficam associadas à conta para acompanhamento.","Coletamos apenas informações necessárias aos recursos utilizados. Credenciais são armazenadas no backend em formato protegido por hash; senhas não devem ser armazenadas em texto puro."],
  uso:["Uso","Regras de uso","O uso do site e dos serviços deve ocorrer de forma lícita, responsável e compatível com sua finalidade.","Não é permitido utilizar as interfaces ou APIs para comprometer sistemas, tentar obter acesso não autorizado, enviar conteúdo ilícito ou interferir deliberadamente na disponibilidade dos serviços.","Podemos limitar ou suspender acessos que representem risco à segurança ou violação das regras aplicáveis, respeitados os direitos previstos em lei."],
  servico:["Serviço","Condições de serviço","As características, disponibilidade e condições de cada produto podem variar conforme seu estágio de desenvolvimento e contratação.","Recursos em desenvolvimento ou planejados podem sofrer alterações. Serviços comerciais específicos podem possuir condições, preços, prazos e responsabilidades definidos em proposta ou contrato.","Pagamentos processados por terceiros seguem também as condições do respectivo provedor. Informações comerciais definitivas devem ser verificadas antes da contratação."]
};

function legal(kind){
  const p=legalPages[kind]||legalPages.privacidade;
  return '<main id="main-content" class="section shell"><span class="eyebrow">Legal</span><h2>'+p[0]+'.</h2><nav class="legal-nav" aria-label="Documentos legais">'+Object.entries(legalPages).map(([k,v])=>'<a href="#/'+k+'" aria-current="'+(k===kind?"page":"false")+'">'+v[0]+'</a>').join("")+'</nav><article class="legal-copy"><h3>'+p[1]+'</h3><p class="muted">'+p[2]+'</p><h3>Diretrizes</h3><p class="muted">'+p[3]+'</p><h3>Responsabilidade</h3><p class="muted">'+p[4]+'</p></article></main>';
}

function footer(){
  return '<footer class="footer shell"><span>© '+new Date().getFullYear()+' Korczak Technology</span><span class="footer-links"><a href="#/privacidade">Privacidade</a><a href="#/uso">Uso</a><a href="#/servico">Serviço</a></span></footer>';
}

function render(){
  const h=location.hash.slice(2)||"/";
  let c=h==="/"?home():h==="/portfolio"?portfolio():h==="/produtos"?products():h==="/empresa"?company():h==="/sobre"?infoPage("Sobre nós","Empresa","Tecnologia com propósito, engenharia enxuta e produtos próprios."):h==="/historia"?infoPage("Nossa história","Empresa","Uma trajetória construída por projetos, experimentação e evolução contínua."):h==="/visao"?infoPage("Nossa visão","Empresa","Conectar pessoas, software, operações e inteligência em uma arquitetura coerente."):h==="/valores"?infoPage("Nossos valores","Empresa","Clareza · Autonomia · Engenharia · Privacidade · Evolução contínua."):h==="/faq"?infoPage("Perguntas frequentes","Suporte","Informações sobre produtos, contas, orçamento, pagamentos e suporte."):h==="/carreiras"?infoPage("Carreiras","Empresa","Oportunidades serão publicadas conforme novos times e projetos forem abertos."):h==="/parcerias"?infoPage("Parcerias","Comercial","Integrações, projetos, distribuição e oportunidades comerciais."):h==="/contato"?contact():h==="/conta"?account():h==="/privacidade"?legal("privacidade"):h==="/uso"?legal("uso"):h==="/servico"?legal("servico"):h.startsWith("produto/")?product(decodeURIComponent(h.split("/")[1])):home();
  root.innerHTML=nav()+c+footer();
  document.body.classList.toggle("menu-open",state.menu);
  document.body.classList.remove("loading");
  document.title=(h===" /"?"KORCZAK TECHNOLOGY":"KORCZAK TECHNOLOGY · "+(h.split("/")[1]||""));
  if(state.menu){document.querySelector(".sidebar")?.focus?.()}
}

function toast(message){
  let region=document.querySelector(".toast-region");
  if(!region){region=document.createElement("div");region.className="toast-region";region.setAttribute("aria-live","polite");document.body.append(region)}
  const el=document.createElement("div");el.className="toast";el.textContent=message;region.append(el);
  setTimeout(()=>el.remove(),4200);
}

async function sendContact(e){
  e.preventDefault();
  const form=e.currentTarget,msg=form.querySelector("#msg"),button=form.querySelector("button[type=submit]");
  button.disabled=true;msg.textContent="Enviando…";
  try{await api("/api/contact",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});form.reset();msg.textContent="Mensagem enviada.";toast("Mensagem enviada com sucesso.");}
  catch(x){msg.textContent=x.message;toast(x.message)}
  finally{button.disabled=false}
}

async function login(e){
  e.preventDefault();
  const form=e.currentTarget,msg=form.querySelector("#auth"),button=form.querySelector("button[type=submit]");
  button.disabled=true;msg.textContent="Entrando…";
  try{const d=await api("/api/auth/login",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});state.token=d.token;state.user=d.user;localStorage.setItem("kz_token",d.token);render();toast("Login realizado.");}
  catch(x){msg.textContent=x.message}
  finally{button.disabled=false}
}

async function register(){
  const name=prompt("Nome:");
  const email=prompt("Email:");
  const password=prompt("Senha (8+ caracteres):");
  if(!name||!email||!password)return;
  try{const d=await api("/api/auth/register",{method:"POST",body:JSON.stringify({name,email,password})});state.token=d.token;state.user=d.user;localStorage.setItem("kz_token",d.token);render();toast("Conta criada.");}
  catch(x){toast(x.message)}
}

async function quote(id){
  if(!state.token){location.hash="#/conta";toast("Entre na sua conta para solicitar um orçamento.");return}
  const message=prompt("Descreva o que você precisa:");
  if(message===null)return;
  try{await api("/api/quotes",{method:"POST",body:JSON.stringify({productId:id,message})});toast("Solicitação enviada.");}
  catch(x){toast(x.message)}
}

function logout(){
  state.token=null;state.user=null;localStorage.removeItem("kz_token");render();toast("Sessão encerrada.");
}

function closeMenu(){
  if(!state.menu)return;
  state.menu=false;render();
}

function handleAction(target){
  const action=target.closest("[data-action]")?.dataset.action;
  if(!action)return false;
  if(action==="toggle-menu"){state.menu=!state.menu;render();return true}
  if(action==="close-menu"){closeMenu();return true}
  if(action==="logout"){logout();return true}
  if(action==="register"){register();return true}
  if(action==="quote"){quote(target.closest("[data-action]").dataset.product);return true}
  return false;
}

document.addEventListener("click",e=>{if(handleAction(e.target))e.preventDefault()});
document.addEventListener("submit",e=>{
  if(e.target.id==="contact-form")sendContact(e);
  if(e.target.id==="login-form")login(e);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&state.menu)closeMenu();
});
addEventListener("hashchange",()=>{if(state.menu)state.menu=false;render();window.scrollTo({top:0,behavior:"smooth"})});

async function load(){
  document.body.classList.add("loading");
  try{state.products=await api("/api/products");if(state.token)state.user=await api("/api/me")}
  catch(e){if(state.token){localStorage.removeItem("kz_token");state.token=null;state.user=null}}
  render();
}
load();
