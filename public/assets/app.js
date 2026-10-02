const API_URL="https://kztechsite.onrender.com";
const root=document.querySelector("#app");
const FALLBACK_PRODUCTS=[
  {id:"korczak-ai",name:"Korczak AI",type:"AI",status:"Em evolução",description:"Inteligência e automação para o ecossistema Korczak."},
  {id:"morok",name:"MOROK",type:"Assistente",status:"Em desenvolvimento",description:"Assistente pessoal e operacional multiplataforma."},
  {id:"ide",name:"Korczak IDE",type:"Developer Tool",status:"Em desenvolvimento",description:"Ambiente de desenvolvimento para projetos Korczak."},
  {id:"workspace",name:"Korczak Workspace",type:"Workspace",status:"Em evolução",description:"Espaço unificado para FLOW, DOCUMENTS, VISION, OPS e mais."},
  {id:"flow",name:"KORCZAK FLOW",type:"Operations",status:"Em desenvolvimento",description:"Fluxos e automações para operações digitais."},
  {id:"documents",name:"KORCZAK DOCUMENTS",type:"Documents",status:"Em desenvolvimento",description:"Documentos e organização de informação."},
  {id:"vision",name:"KORCZAK VISION",type:"Intelligence",status:"Em desenvolvimento",description:"Visão e inteligência para decisões digitais."},
  {id:"ops",name:"KORCZAK OPS",type:"Operations",status:"Em desenvolvimento",description:"Operações e administração do ecossistema."},
  {id:"connect",name:"KORCZAK CONNECT",type:"Connectivity",status:"Em desenvolvimento",description:"Conectividade entre pessoas, sistemas e serviços."},
  {id:"mobile",name:"KORCZAK MOBILE",type:"Mobile",status:"Em desenvolvimento",description:"Experiências móveis para o ecossistema Korczak."}
];
const state={token:localStorage.getItem("kz_token"),user:null,products:FALLBACK_PRODUCTS,quotes:[],orders:[],menu:false};

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
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const r=await fetch(API_URL+url,{...opt,headers:h,signal:controller.signal});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||"Não foi possível concluir a operação.");
    return d;
  }finally{clearTimeout(timer)}
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
    '<aside id="site-sidebar" class="sidebar '+(state.menu?"open":"")+'" aria-label="Navegação principal" aria-hidden="'+(!state.menu)+'"'+(!state.menu?' inert':'')+'><div class="side-head"><div><small>Navegação</small></div><small>KZ / 01</small></div><nav class="side-nav">'+
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
  const groups=[["Inteligência & assistência",state.products.filter(p=>["korczak-ai","morok","vision"].includes(p.id))],["Desenvolvimento & workspace",state.products.filter(p=>["ide","workspace","documents"].includes(p.id))],["Operações & conectividade",state.products.filter(p=>["flow","ops","connect","mobile"].includes(p.id))]];
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Produtos · Catálogo completo</span><h2>O ecossistema Korczak.</h2><p class="section-lead">Todos os produtos registrados no catálogo central, organizados por área de atuação e apresentados com seu estágio atual.</p></div>'+groups.map(g=>'<section class="section-group"><div class="split-head"><div><span class="eyebrow">'+esc(g[0])+'</span><h3>'+g[0]+'</h3></div><span class="muted">'+g[1].length+' produtos</span></div><div class="grid">'+g[1].map((p,i)=>card(p,i)).join('')+'</div></section>').join('')+'</main>';
}

function product(id){
  const p=state.products.find(x=>x.id===id);
  if(!p)return '<main id="main-content" class="section shell"><span class="eyebrow">Produto</span><h2>Produto não encontrado.</h2><p class="section-lead">O produto solicitado não está no catálogo atual.</p><a class="btn ghost" href="#/produtos">Voltar aos produtos</a></main>';
  const related=state.products.filter(x=>x.id!==p.id&&x.type===p.type).slice(0,3);
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">'+esc(p.type)+' · '+esc(p.status)+'</span><h2>'+esc(p.name)+'.</h2><p class="section-lead">'+esc(p.description)+'</p><div class="actions"><button class="btn" type="button" data-action="quote" data-product="'+esc(p.id)+'">Solicitar orçamento '+icon("arrow")+'</button><button class="btn ghost" type="button" data-action="checkout" data-product="'+esc(p.id)+'">Comprar</button><a class="btn ghost" href="#/produtos">Ver catálogo</a></div></div><div class="split"><section><span class="eyebrow">Propósito</span><h3>Uma peça do ecossistema.</h3><p class="muted">'+esc(p.name)+' faz parte da arquitetura de produtos da Korczak Technology e possui o estágio <strong>'+esc(p.status)+'</strong>.</p></section><section><span class="eyebrow">Próximo passo</span><h3>Fale sobre sua necessidade.</h3><p class="muted">Envie uma solicitação com contexto, objetivo e requisitos. A equipe poderá avaliar o escopo.</p></section></div>'+(related.length?'<div class="rule"></div><span class="eyebrow">Relacionados</span><div class="grid">'+related.map(card).join('')+'</div>':'')+'</main>';
}

function company(){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Empresa · Korczak Technology</span><h2>Construímos o ecossistema, não apenas páginas.</h2><p class="section-lead">A Korczak Technology desenvolve software, sistemas e produtos digitais próprios para transformar ideias em ferramentas utilizáveis, conectadas e evolutivas.</p><div class="actions"><a class="btn" href="#/produtos">Explorar produtos '+icon("arrow")+'</a><a class="btn ghost" href="#/contato">Falar com a equipe</a></div></div><div class="split"><section><span class="eyebrow">O que fazemos</span><h3>Produto + engenharia.</h3><p class="muted">Projetamos interfaces, aplicações, plataformas e infraestrutura digital com foco em clareza, modularidade, segurança e evolução contínua.</p></section><section><span class="eyebrow">Como pensamos</span><h3>Construção incremental.</h3><p class="muted">Cada produto pode começar pequeno e crescer por fases, preservando uma base técnica organizada e preparada para novas integrações.</p></section></div><div class="rule"></div><span class="eyebrow">Ecossistema</span><h3>De ferramentas a operações.</h3><p class="muted">O portfólio reúne produtos de inteligência, desenvolvimento, produtividade, documentos, operações, conectividade e experiências móveis.</p></main>';
}

function contact(){
  return '<main id="main-content" class="section shell"><span class="eyebrow">Contato</span><h2>Vamos conversar.</h2><p class="section-lead">Envie uma mensagem para a equipe Korczak Technology.</p><form class="form" id="contact-form"><label><span class="sr-only">Nome</span><input class="field" name="name" placeholder="Nome" autocomplete="name" required></label><label><span class="sr-only">Email</span><input class="field" name="email" type="email" placeholder="Email" autocomplete="email" required></label><label><span class="sr-only">Telefone</span><input class="field" name="phone" placeholder="Telefone" autocomplete="tel"></label><label><span class="sr-only">Mensagem</span><textarea class="field" name="message" rows="7" placeholder="Como podemos ajudar?" required></textarea></label><button class="btn" type="submit">Enviar mensagem '+icon("arrow")+'</button><small id="msg" class="muted form-note" role="status"></small></form></main>';
}

function checkoutState(kind){
  const success=kind==="sucesso";
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Checkout · '+(success?"Concluído":"Cancelado")+'</span><h2>'+(success?"Pagamento processado.":"Pagamento cancelado.")+'</h2><p class="section-lead">'+(success?"Seu checkout foi concluído pelo Stripe. O status do pedido pode ser consultado na sua conta.":"Nenhuma cobrança foi concluída nesta etapa. Você pode voltar ao catálogo e tentar novamente.")+'</p><div class="actions"><a class="btn" href="#/conta">Minha conta</a><a class="btn ghost" href="#/produtos">Ver produtos</a></div></div></main>';
}
function account(){
  if(!state.token)return '<main id="main-content" class="section shell"><span class="eyebrow">Meu perfil</span><h2>Entre na sua conta.</h2><form class="form" id="login-form"><label><span class="sr-only">Email</span><input class="field" name="email" type="email" placeholder="Email" autocomplete="email" required></label><label><span class="sr-only">Senha</span><input class="field" name="password" type="password" placeholder="Senha" autocomplete="current-password" required></label><button class="btn" type="submit">Entrar</button><button type="button" class="btn ghost" data-action="register">Criar conta</button><small id="auth" class="muted form-note" role="status"></small></form></main>';
  const u=state.user||{},initial=esc((u.name||"K").slice(0,1).toUpperCase());
  const quoteRows=state.quotes.length?state.quotes.map(q=>'<div class="profile-row"><span>'+esc(q.productId)+'</span><strong>'+esc(q.status||"pending")+'</strong><small class="muted">'+new Date(q.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma solicitação de orçamento ainda.</div>';
  const orderRows=state.orders.length?state.orders.map(o=>'<div class="profile-row"><span>'+esc(o.productId)+'</span><strong>'+esc(o.status||"checkout_created")+'</strong><small class="muted">'+new Date(o.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma compra registrada.</div>';
  return '<main id="main-content" class="section shell"><span class="eyebrow">Meu perfil</span><h2>Minha conta.</h2><div class="profile"><aside class="profile-aside"><div class="profile-avatar" aria-hidden="true">'+initial+'</div><h3>'+esc(u.name||"Usuário")+'</h3><p class="muted">'+esc(u.email||"")+'</p><span class="status">'+esc(u.role||"user")+'</span></aside><section class="profile-main"><div class="profile-row"><span class="muted">Nome</span><strong>'+esc(u.name||"—")+'</strong></div><div class="profile-row"><span class="muted">Email</span><strong>'+esc(u.email||"—")+'</strong></div><div class="profile-row"><span class="muted">Perfil</span><strong>'+esc(u.role||"user")+'</strong></div><div class="profile-row"><span class="muted">Verificação</span><strong>'+((u.verified)?"Verificado":"Pendente")+'</strong></div><div class="actions"><a class="btn ghost" href="#/contato">Falar com a equipe</a><button class="btn" type="button" data-action="logout">Sair</button></div></section></div><div class="rule"></div><div class="split"><section><span class="eyebrow">Orçamentos</span><h3>Histórico comercial</h3>'+quoteRows+'</section><section><span class="eyebrow">Pedidos</span><h3>Histórico de compras</h3>'+orderRows+'</section></div></main>';
}

function infoPage(title,kicker,body,sections=[]){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">'+esc(kicker)+'</span><h2>'+esc(title)+'.</h2><p class="section-lead">'+esc(body)+'</p></div>'+(sections.length?'<div class="split">'+sections.map(x=>'<section><span class="eyebrow">'+esc(x[0])+'</span><h3>'+esc(x[1])+'</h3><p class="muted">'+esc(x[2])+'</p></section>').join('')+'</div>':'')+'</main>';
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
  const pages={
    "/sobre":()=>infoPage("Sobre nós","Empresa","Tecnologia com propósito, engenharia enxuta e produtos próprios.",[
      ["Identidade","Korczak Technology","Uma empresa orientada à construção de software, sistemas e produtos digitais próprios."],
      ["Atuação","Ecossistema","Produtos independentes que também podem trabalhar em conjunto conforme a necessidade."],
      ["Princípio","Clareza","Interfaces compreensíveis, responsabilidades bem definidas e evolução técnica documentada."]
    ]),
    "/historia":()=>infoPage("Nossa história","História","Uma trajetória construída por projetos, experimentação e evolução contínua.",[
      ["Origem","Construir","A operação nasceu da vontade de criar tecnologia própria em vez de depender apenas de soluções prontas."],
      ["Evolução","Projetar","Projetos foram sendo organizados em produtos e módulos com responsabilidades específicas."],
      ["Hoje","Integrar","O ecossistema conecta desenvolvimento, produtividade, inteligência, operações e experiências digitais."]
    ]),
    "/visao":()=>infoPage("Nossa visão","Visão","Criar uma camada tecnológica integrada para trabalho, operações, desenvolvimento e inteligência digital.",[
      ["Horizonte","Tecnologia acessível","Produtos devem ser claros para quem usa e sustentáveis para quem mantém."],
      ["Arquitetura","Modularidade","Cada módulo deve poder evoluir sem exigir que todo o ecossistema seja reconstruído."],
      ["Futuro","Integração","Conectar ferramentas e fluxos para reduzir fragmentação e ampliar autonomia."]
    ]),
    "/valores":()=>infoPage("Nossos valores","Valores","Princípios que orientam decisões de produto, engenharia e relacionamento.",[
      ["01","Clareza","Comunicar o que um sistema faz, quais são seus limites e como utilizá-lo."],
      ["02","Autonomia","Criar ferramentas que ampliem a capacidade das pessoas e equipes."],
      ["03","Engenharia","Priorizar bases técnicas organizadas, testáveis e evolutivas."],
      ["04","Privacidade","Tratar dados e acessos com responsabilidade e necessidade mínima."],
      ["05","Evolução","Melhorar continuamente por fases, métricas, feedback e aprendizado."]
    ]),
    "/parcerias":()=>infoPage("Parcerias","Comercial","Integrações, projetos, distribuição e oportunidades comerciais.",[
      ["Tecnologia","Integrações","Conecte serviços, APIs e ferramentas ao ecossistema quando houver uma necessidade técnica compatível."],
      ["Projetos","Construção conjunta","Projetos específicos podem ser avaliados conforme escopo, prazo, capacidade e requisitos."],
      ["Ecossistema","Cooperação","Buscamos relações que criem utilidade concreta para usuários, empresas e produtos."]
    ]),
    "/carreiras":()=>infoPage("Carreiras","Empresa","Oportunidades serão publicadas conforme novos times e projetos forem abertos.",[
      ["Perfil","Construção","Interesse por software, produto, sistemas, design e resolução de problemas."],
      ["Cultura","Responsabilidade","Autonomia vem acompanhada de documentação, comunicação e compromisso com a qualidade."],
      ["Oportunidades","Em evolução","As posições e formatos de colaboração serão apresentados conforme forem oficialmente abertos."]
    ]),
    "/faq":()=>infoPage("Perguntas frequentes","Suporte","Informações gerais sobre produtos, contas, orçamento, pagamentos e suporte.",[
      ["Produtos","O que existe?","O catálogo apresenta os produtos e projetos atualmente registrados no ecossistema, incluindo seus respectivos estágios."],
      ["Orçamento","Como solicitar?","Entre em uma conta, abra a página de um produto e envie uma solicitação descrevendo sua necessidade."],
      ["Contato","Como falar conosco?","Use o formulário de contato para enviar nome, email, telefone opcional e mensagem."],
      ["Desenvolvimento","Tudo está pronto?","Não. Cada produto possui um estágio explícito para diferenciar evolução, desenvolvimento e planejamento."]
    ])
  };
  let c;
  if(h==="/")c=home();
  else if(h==="/portfolio")c=portfolio();
  else if(h==="/produtos")c=products();
  else if(h==="/empresa")c=company();
  else if(pages[h])c=pages[h]();
  else if(h==="/contato")c=contact();
  else if(h==="/conta")c=account();
  else if(h==="/checkout/sucesso")c=checkoutState("sucesso");
  else if(h==="/checkout/cancelado")c=checkoutState("cancelado");
  else if(h==="/privacidade")c=legal("privacidade");
  else if(h==="/uso")c=legal("uso");
  else if(h==="/servico")c=legal("servico");
  else if(h.startsWith("produto/")){
    let productId="";
    try{productId=decodeURIComponent(h.split("/")[1]||"")}catch{}
    c=product(productId);
  }
  else c=infoPage("Página não encontrada","KZ Tech","A página solicitada não existe ou foi movida.",[["Navegação","Voltar ao ecossistema","Use a navegação para explorar a empresa, os produtos e os canais de contato."]]);
  root.innerHTML=nav()+c+footer();
  document.body.classList.toggle("menu-open",state.menu);
  document.body.classList.remove("loading");
  const titleMap={"/":"KORCZAK TECHNOLOGY","/empresa":"Empresa","/portfolio":"Portfólio","/produtos":"Produtos","/contato":"Contato","/conta":"Meu perfil","/historia":"História","/visao":"Visão","/valores":"Valores","/parcerias":"Parcerias","/carreiras":"Carreiras","/faq":"FAQ","/privacidade":"Privacidade","/uso":"Uso","/servico":"Serviço"};
  let detail=null;
  if(h.startsWith("produto/")){
    try{detail=state.products.find(x=>x.id===decodeURIComponent(h.split("/")[1]||""))?.name||null}catch{}
  }
  document.title="KORCZAK TECHNOLOGY"+(detail?" · "+detail:(titleMap[h]?" · "+titleMap[h]:""));
  if(state.menu)document.querySelector(".sidebar")?.focus?.();
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

async function checkout(id){
  if(!state.token){location.hash="#/conta";toast("Entre na sua conta para continuar.");return}
  try{
    const d=await api("/api/checkout",{method:"POST",body:JSON.stringify({productId:id})});
    if(d.url)location.href=d.url;else toast("Checkout indisponível.");
  }catch(x){toast(x.message)}
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
  if(action==="close-menu"){closeMenu();return false}
  if(action==="logout"){logout();return true}
  if(action==="register"){register();return true}
  if(action==="quote"){quote(target.closest("[data-action]").dataset.product);return true}
  if(action==="checkout"){checkout(target.closest("[data-action]").dataset.product);return true}
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
  if(!root)return;
  document.body.classList.add("loading");
  render();
  try{
    const products=await api("/api/products");
    if(Array.isArray(products)&&products.length)state.products=products;
  }catch{}
  if(state.token){
    try{
      state.user=await api("/api/me");
      state.quotes=await api("/api/quotes");
      state.orders=await api("/api/orders");
    }catch{
      localStorage.removeItem("kz_token");
      state.token=null;
      state.user=null;
      state.quotes=[];
      state.orders=[];
    }
  }
  render();
}
load();
