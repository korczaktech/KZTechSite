const API_URL="https://kztechsite.onrender.com";
const API_TIMEOUT_MS=30000;
const APP_VERSION="2026.10.02.12";
const root=document.querySelector("#app");
const FALLBACK_PRODUCTS=[
  {id:"korczak-ai",name:"Korczak AI",type:"AI",status:"Em evolução",description:"Inteligência e automação para o ecossistema Korczak."},
  {id:"morok",name:"MOROK",type:"Assistente",status:"Em desenvolvimento",description:"Assistente pessoal e operacional multiplataforma."},
  {id:"ide",name:"Korczak IDE",type:"Developer Tool",status:"Em desenvolvimento",description:"Ambiente de desenvolvimento para projetos Korczak."},
  {id:"workspace",name:"Korczak Workspace",type:"Produtividade",status:"Em evolução",description:"Suíte de produtividade e colaboração para documentos, arquivos, agenda, comunicação e trabalho em equipe."},
  {id:"flow",name:"KORCZAK FLOW",type:"Operations",status:"Em desenvolvimento",description:"Fluxos e automações para operações digitais."},
  {id:"documents",name:"KORCZAK DOCUMENTS",type:"Documents",status:"Em desenvolvimento",description:"Documentos e organização de informação."},
  {id:"vision",name:"KORCZAK VISION",type:"Intelligence",status:"Em desenvolvimento",description:"Visão e inteligência para decisões digitais."},
  {id:"ops",name:"KORCZAK OPS",type:"Operations",status:"Em desenvolvimento",description:"Operações e administração do ecossistema."},
  {id:"connect",name:"KORCZAK CONNECT",type:"Connectivity",status:"Em desenvolvimento",description:"Conectividade entre pessoas, sistemas e serviços."},
  {id:"mobile",name:"KORCZAK MOBILE",type:"Mobile",status:"Em desenvolvimento",description:"Experiências móveis para o ecossistema Korczak."},
  {id:"erp",name:"KORCZAK ERP",type:"KOS",status:"Em desenvolvimento",description:"Gestão empresarial para clientes, processos, financeiro e operação."}
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
  const timer=setTimeout(()=>controller.abort(),API_TIMEOUT_MS);
  try{
    const r=await fetch(API_URL+url,{...opt,headers:h,signal:controller.signal});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||"Não foi possível concluir a operação.");
    return d;
  }catch(error){
    if(error?.name==="AbortError")throw Error("O servidor demorou para responder. Tente novamente em alguns segundos.");
    if(error instanceof TypeError)throw Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    throw error;
  }finally{clearTimeout(timer)}
}

const links=[
  ["/","Início"],["/portfolio","Portfólio"],["/produtos","Produtos"],["/empresa","Empresa"],
  ["/historia","História"],["/visao","Visão"],["/valores","Valores"],["/parcerias","Parcerias"],["/carreiras","Carreiras"],
  ["/faq","FAQ"],["/contato","Contato"],["/conta","Meu perfil"]
];

function nav(){
  const h=location.hash.startsWith("#/")?location.hash.slice(1):"/";
  const active=p=>h===p||(p!=="/"&&h.startsWith(p));
  const group=(title,items,offset)=>'<div class="side-section">'+title+'</div>'+items.map(([p,n],i)=>
    '<a class="side-link '+(active(p)?"active":"")+'" aria-current="'+(active(p)?"page":"false")+'" href="#'+p+'" data-action="close-menu"><span>'+n+'</span><span class="side-arrow">'+String(offset+i+1).padStart(2,"0")+'</span></a>'
  ).join("");
  return '<div class="site-background" aria-hidden="true"><svg viewBox="0 0 1600 900" preserveAspectRatio="none"><defs><radialGradient id="fogA"><stop stop-color="#8d6cff" stop-opacity=".22"/><stop offset=".55" stop-color="#473b75" stop-opacity=".09"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><radialGradient id="fogB"><stop stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="#050505"/><ellipse cx="1180" cy="260" rx="650" ry="300" fill="url(#fogA)"/><ellipse cx="390" cy="700" rx="600" ry="250" fill="url(#fogA)"/><ellipse cx="850" cy="500" rx="700" ry="190" fill="url(#fogB)" opacity=".5"/><path d="M-100 560 C240 420 430 690 760 535 S1240 410 1700 560" fill="none" stroke="#b9adff" stroke-opacity=".10" stroke-width="2"/><path d="M-100 650 C260 510 500 800 830 625 S1290 500 1700 650" fill="none" stroke="#fff" stroke-opacity=".055" stroke-width="1"/><g fill="#fff" opacity=".65"><circle cx="100" cy="130" r="1.4"/><circle cx="250" cy="310" r="1"/><circle cx="420" cy="100" r="1.2"/><circle cx="620" cy="250" r="1"/><circle cx="850" cy="120" r="1.3"/><circle cx="1050" cy="340" r="1"/><circle cx="1280" cy="100" r="1.3"/><circle cx="1480" cy="300" r="1"/></g></svg></div></div><header class="nav"><div class="shell"><a class="brand" href="#/" aria-label="Korczak Technology — início"><img class="brand-mark" src="./assets/mark.svg" alt="" aria-hidden="true">KORCZAK TECHNOLOGY</a><button class="menu-toggle '+(state.menu?"active":"")+'" type="button" aria-label="'+(state.menu?"Fechar navegação":"Abrir navegação")+'" aria-expanded="'+state.menu+'" aria-controls="site-sidebar" data-action="toggle-menu"><span class="menu-icon" aria-hidden="true"></span><span class="pulse" aria-hidden="true"></span></button></div></header>'+
    '<div class="sidebar-backdrop '+(state.menu?"open":"")+'" data-action="close-menu" aria-hidden="true"></div>'+
    '<aside id="site-sidebar" class="sidebar '+(state.menu?"open":"")+'" aria-label="Navegação principal" aria-hidden="'+(!state.menu)+'"'+(!state.menu?' inert':'')+'><div class="side-head"><div><small>Navegação</small></div><small>KZ / 01</small></div><nav class="side-nav">'+
    group("Principal",links.slice(0,4),0)+group("Ecossistema",links.slice(4,8),8)+group("Conta & suporte",links.slice(8),12)+
    '</nav><div class="side-footer">Korczak Technology · Sistemas, software e produtos digitais.</div></aside>';
}

function card(p,i){
  return '<a class="card" href="#/produto/'+encodeURIComponent(p.id)+'"><span class="status">'+esc(p.status||p.type)+'</span><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(p.description)+'</p><span class="card-arrow">'+icon("arrow")+'</span></a>';
}

function initMoon(){
 const canvas=document.getElementById("moon-canvas"); if(!canvas||canvas.dataset.ready)return; canvas.dataset.ready="1";
 const THREE=window.THREE;
 if(!THREE){canvas.style.display="none";canvas.parentElement.classList.add("moon-visible-fallback");return;}
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.1,100);
 camera.position.z=3;
 const light=new THREE.DirectionalLight(0xffffff,3);
 light.position.set(-2,2,4);
 scene.add(light);
 scene.add(new THREE.AmbientLight(0xffffff,.35));
 const geometry=new THREE.SphereGeometry(1,96,96);
 const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0});
 const moon=new THREE.Mesh(geometry,material);
 scene.add(moon);
 canvas._moon=moon;
 function resize(){
   const w=canvas.clientWidth||400,h=canvas.clientHeight||400;
   renderer.setSize(w,h,false);
   camera.aspect=w/h;
   camera.updateProjectionMatrix();
 }
 addEventListener("resize",resize);
 resize();
 function frame(){
   moon.rotation.y+=.0025;
   renderer.render(scene,camera);
   requestAnimationFrame(frame);
 }
 frame();
}

function home(){
 const featured=state.products.filter(p=>["korczak-ai","workspace","ide"].includes(p.id));
 return '<main id="main-content"><section class="hero shell"><div class="hero-copy"><span class="eyebrow">KORCZAK TECHNOLOGY · SOFTWARE · SISTEMAS</span><h1>Construímos tecnologia para operar o futuro.</h1><p>Produtos digitais para inteligência, produtividade, desenvolvimento e operações empresariais.</p><div class="actions"><a class="btn" href="#/portfolio">Ver portfólio '+icon("arrow")+'</a><a class="btn ghost" href="#/empresa">Conhecer a empresa</a></div></div><div class="moon-stage" aria-label="Lua 3D realista baseada em dados lunares da NASA"><div class="moon-3d-wrap" aria-label="Lua 3D realista"><canvas id="moon-canvas"></canvas></div></div></div></section><section class="section shell"><span class="eyebrow">Em destaque</span><h2>O núcleo do ecossistema.</h2><p class="section-lead">Na página inicial, três produtos representam as principais portas de entrada: inteligência, produtividade e desenvolvimento.</p><div class="grid">'+featured.map((p,i)=>card(p,i)).join("")+'</div></section><section class="section shell"><div class="split"><section><span class="eyebrow">Korczak Workspace</span><h3>Produtividade e colaboração.</h3><p class="muted">Uma suíte própria para o trabalho diário: documentos, planilhas, apresentações, arquivos, agenda, comunicação e colaboração.</p><a class="btn ghost" href="#/workspace">Conhecer o Workspace '+icon("arrow")+'</a></section><section><span class="eyebrow">KOS · Korczak Operations System</span><h3>Operação empresarial.</h3><p class="muted">Uma suíte separada para empresas: ERP, FLOW, DOCUMENTS, VISION, OPS, CONNECT e MOBILE.</p><a class="btn ghost" href="#/kos">Conhecer o KOS '+icon("arrow")+'</a></section></div></section></main>';
}

function portfolio(){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Portfólio</span><h2>O universo Korczak.</h2><p class="section-lead">Um conjunto de produtos e projetos que formam o ecossistema Korczak Technology. Explore cada iniciativa, seu propósito e estágio atual.</p></div><div class="grid">'+state.products.map(card).join("")+'</div></main>';
}

function products(){
 const groups=[["Produtos em destaque",state.products.filter(p=>["korczak-ai","morok","ide"].includes(p.id))],["Korczak Workspace",state.products.filter(p=>p.id==="workspace")],["KOS · Operações empresariais",state.products.filter(p=>["erp","flow","documents","vision","ops","connect","mobile"].includes(p.id))]];
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Produtos · Catálogo</span><h2>Do trabalho diário à operação empresarial.</h2><p class="section-lead">Explore os produtos da Korczak Technology. O Workspace é a suíte de produtividade; o KOS é a suíte voltada à operação de empresas.</p><div class="actions"><a class="btn ghost" href="#/workspace">Abrir Korczak Workspace '+icon("arrow")+'</a><a class="btn ghost" href="#/kos">Explorar KOS '+icon("arrow")+'</a></div></div>'+groups.map(g=>'<section class="section-group"><div class="split-head"><div><span class="eyebrow">'+esc(g[0])+'</span><h3>'+g[0]+'</h3></div><span class="muted">'+g[1].length+' produto(s)</span></div><div class="grid">'+g[1].map((p,i)=>card(p,i)).join("")+'</div></section>').join("")+'</main>';
}
function workspace(){
 const apps=[["documents","Korczak Documents","Documentos de texto, edição e colaboração."],["sheets","Korczak Sheets","Planilhas, dados, fórmulas e análises."],["slides","Korczak Slides","Apresentações e materiais visuais."],["drive","Korczak Drive","Arquivos, pastas e armazenamento organizado."],["mail","Korczak Mail","Comunicação por email para o trabalho."],["calendar","Korczak Calendar","Agenda, eventos, reuniões e compromissos."],["meet","Korczak Meet","Reuniões e comunicação por vídeo."],["chat","Korczak Chat","Comunicação rápida entre pessoas e equipes."],["forms","Korczak Forms","Formulários, coleta de informações e respostas."],["sites","Korczak Sites","Páginas internas e espaços compartilhados."]];
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Korczak Workspace</span><h2>A suíte de produtividade da Korczak.</h2><p class="section-lead">O Workspace reúne ferramentas para o trabalho diário, seguindo a mesma categoria de necessidades atendidas por suítes como o Google Workspace: criar, armazenar, comunicar, organizar e colaborar.</p></div><div class="grid">'+apps.map((a,i)=>'<article class="card"><span class="status">Workspace</span><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><h3>'+esc(a[1])+'</h3><p class="muted">'+esc(a[2])+'</p><span class="card-arrow">'+icon("arrow")+'</span></article>').join("")+'</div><div class="rule"></div><span class="eyebrow">Como funciona</span><h3>Uma conta, várias ferramentas.</h3><p class="section-lead">O usuário trabalha em um espaço comum, com documentos, arquivos, comunicação e agenda conectados ao contexto de sua equipe.</p></main>';
}
function kos(){
 const ids=["erp","flow","documents","vision","ops","connect","mobile"];
 const descriptions={erp:"Gestão empresarial, clientes, processos e financeiro.",flow:"Fluxos, tarefas e automações de processos.",documents:"Documentos empresariais, organização e histórico.",vision:"Painéis e visão operacional para indicadores.",ops:"Operação, administração e observabilidade.",connect:"Integrações e comunicação entre sistemas.",mobile:"Acesso móvel aos recursos empresariais."};
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">KOS · Korczak Operations System</span><h2>A suíte empresarial.</h2><p class="section-lead">O KOS é separado do Workspace. Enquanto o Workspace atende produtividade e colaboração, o KOS organiza a operação de empresas.</p></div><div class="grid">'+ids.map((id,i)=>{const p=state.products.find(x=>x.id===id);return p?'<a class="card" href="#/produto/'+encodeURIComponent(id)+'"><span class="status">KOS</span><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(descriptions[id])+'</p><span class="card-arrow">'+icon("arrow")+'</span></a>':""}).join("")+'</div></main>';
}

function product(id){
  const p=state.products.find(x=>x.id===id);
  if(!p)return '<main id="main-content" class="section shell"><span class="eyebrow">Produto</span><h2>Produto não encontrado.</h2><p class="section-lead">O produto solicitado não está no catálogo atual.</p><a class="btn ghost" href="#/produtos">Voltar aos produtos</a></main>';
  const details={
    "korczak-ai":["Inteligência aplicada","Camada de inteligência para assistência, análise, geração e automação dentro do ecossistema Korczak.","Centraliza recursos inteligentes, contexto e automações para reduzir trabalho repetitivo e apoiar decisões."],
    "morok":["Assistente pessoal e operacional","Um assistente multiplataforma pensado para comandos, automações e interação por voz e interface.","O MOROK conecta comandos predefinidos, experiências web, desktop e mobile e novas integrações conforme evolui."],
    "ide":["Ambiente de desenvolvimento","Um ambiente para criar, testar, organizar e evoluir projetos de software.","A proposta é reunir desenvolvimento, organização de projetos e ferramentas técnicas em uma experiência própria."],
    "workspace":["Produtividade e colaboração","Uma suíte para documentos, planilhas, apresentações, arquivos, email, agenda, reuniões, chat, formulários e sites.","Uma conta e um contexto de trabalho reúnem as ferramentas usadas diariamente por pessoas e equipes."],
    "erp":["Gestão empresarial","Núcleo de gestão para clientes, processos, financeiro e rotinas empresariais.","O ERP organiza informações centrais da empresa e cria uma base para acompanhar operações e resultados."],
    "flow":["Automação de processos","Fluxos para tarefas, aprovações, rotinas e automações.","O FLOW transforma processos repetitivos em etapas rastreáveis, com responsáveis e estados definidos."],
    "documents":["Gestão documental empresarial","Organização, criação, consulta e histórico de documentos ligados à operação.","No KOS, o DOCUMENTS atende ao contexto empresarial e aos processos que precisam de rastreabilidade."],
    "vision":["Visão operacional","Painéis e camadas de informação para acompanhar indicadores, contexto e atividade.","O VISION transforma dados operacionais em uma visão mais clara para acompanhamento e análise."],
    "ops":["Operações e administração","Controle técnico e operacional do ecossistema empresarial.","O OPS concentra rotinas de administração, acompanhamento e observabilidade dos serviços."],
    "connect":["Conectividade","Integração entre pessoas, sistemas, serviços e canais.","O CONNECT funciona como camada de comunicação e integração entre partes do ecossistema."],
    "mobile":["Operação em mobilidade","Experiência móvel para acessar e operar recursos empresariais.","O MOBILE leva recursos selecionados do ecossistema para contextos em que a operação acontece fora do desktop."]
  };
  const d=details[p.id]||["Produto Korczak","Uma solução do ecossistema Korczak Technology.","Consulte a equipe para conhecer escopo, disponibilidade e próximos passos."];
  const related=state.products.filter(x=>x.id!==p.id&&x.type===p.type).slice(0,3);
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">'+esc(p.type)+' · '+esc(p.status)+'</span><h2>'+esc(p.name)+'.</h2><p class="section-lead">'+esc(d[1])+'</p><div class="actions"><button class="btn" type="button" data-action="quote" data-product="'+esc(p.id)+'">Solicitar orçamento '+icon("arrow")+'</button><button class="btn ghost" type="button" data-action="checkout" data-product="'+esc(p.id)+'">Comprar</button><a class="btn ghost" href="#/produtos">Ver catálogo</a></div></div><div class="detail-grid"><section class="detail-panel"><span class="eyebrow">O que é</span><h3>'+esc(d[0])+'</h3><p class="muted">'+esc(d[2])+'</p><ul class="feature-list"><li>Arquitetura pensada para evolução por etapas.</li><li>Interface orientada à clareza e ao uso cotidiano.</li><li>Integração com o ecossistema quando aplicável.</li><li>Escopo e disponibilidade definidos conforme o estágio.</li></ul></section><aside class="detail-panel"><span class="eyebrow">Status</span><h3>'+esc(p.status)+'</h3><p class="muted">O estágio publicado indica o nível atual de desenvolvimento e não representa necessariamente disponibilidade comercial completa.</p><a class="btn ghost" href="#/contato">Falar com a equipe '+icon("arrow")+'</a></aside></div><div class="split"><section><span class="eyebrow">Como funciona</span><h3>Construído para crescer.</h3><p class="muted">O produto é desenvolvido em fases, começando pelos recursos essenciais e ampliando capacidades conforme requisitos, testes e feedback.</p></section><section><span class="eyebrow">Próximo passo</span><h3>Defina seu cenário.</h3><p class="muted">Para projetos, contratação ou parceria, envie objetivo, equipe, requisitos e prazo desejado.</p></section></div>'+(related.length?'<div class="rule"></div><span class="eyebrow">Relacionados</span><div class="grid">'+related.map(card).join('')+'</div>':'')+'</main>';
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
function authPage(mode="login",message=""){
  const loginMode=mode==="login";
  return '<main id="main-content" class="auth-page"><section class="auth-shell"><div class="auth-brand"><img src="./assets/mark.svg" alt="" aria-hidden="true"><span>KORCZAK TECHNOLOGY</span></div><div class="auth-copy"><span class="eyebrow">Acesso seguro</span><h1>'+(loginMode?"Entre no seu ecossistema.":"Crie sua conta Korczak.")+'</h1><p>'+(loginMode?"Entre para acessar produtos, orçamento, pedidos e seu perfil.":"Crie sua conta para acessar o ecossistema Korczak, acompanhar solicitações e utilizar os recursos disponíveis.")+'</p></div><div class="auth-card"><div class="auth-tabs"><button class="'+(loginMode?"active":"")+'" type="button" data-action="auth-mode" data-mode="login">Entrar</button><button class="'+(!loginMode?"active":"")+'" type="button" data-action="auth-mode" data-mode="register">Criar conta</button></div><form class="auth-form" id="auth-form" data-mode="'+(loginMode?"login":"register")+'">'+(!loginMode?'<label><span>Nome</span><input class="field" name="name" autocomplete="name" placeholder="Seu nome" required></label>':"")+'<label><span>Email</span><input class="field" name="email" type="email" autocomplete="email" placeholder="seu@email.com" required></label><label><span>Senha</span><input class="field" name="password" type="password" autocomplete="'+(loginMode?"current-password":"new-password")+'" placeholder="Mínimo de 8 caracteres" minlength="8" required></label><button class="btn auth-submit" type="submit">'+(loginMode?"Entrar":"Criar minha conta")+' '+icon("arrow")+'</button><small id="auth-message" class="form-note" role="status">'+esc(message)+'</small></form><p class="auth-terms">Ao continuar, você concorda com as <a href="#/privacidade">informações de privacidade</a> e as <a href="#/uso">regras de uso</a>.</p></div></section></main>';
}

function account(){
  if(!state.token){state.authMode="login";return authPage(state.authMode,state.authMessage||"");}
  const u=state.user||{},initial=esc((u.name||"K").slice(0,1).toUpperCase());
  const quoteRows=state.quotes.length?state.quotes.map(q=>'<div class="profile-row"><span>'+esc(q.productId)+'</span><strong>'+esc(q.status||"pending")+'</strong><small class="muted">'+new Date(q.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma solicitação de orçamento ainda.</div>';
  const orderRows=state.orders.length?state.orders.map(o=>'<div class="profile-row"><span>'+esc(o.productId)+'</span><strong>'+esc(o.status||"checkout_created")+'</strong><small class="muted">'+new Date(o.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma compra registrada.</div>';
  return '<main id="main-content" class="section shell"><span class="eyebrow">Meu perfil</span><h2>Minha conta.</h2><div class="profile"><aside class="profile-aside"><div class="profile-avatar" aria-hidden="true">'+initial+'</div><h3>'+esc(u.name||"Usuário")+'</h3><p class="muted">'+esc(u.email||"")+'</p><span class="status">'+esc(u.role||"user")+'</span></aside><section class="profile-main"><div class="profile-row"><span class="muted">Nome</span><strong>'+esc(u.name||"—")+'</strong></div><div class="profile-row"><span class="muted">Email</span><strong>'+esc(u.email||"—")+'</strong></div><div class="profile-row"><span class="muted">Perfil</span><strong>'+esc(u.role||"user")+'</strong></div><div class="profile-row"><span class="muted">Verificação</span><strong>'+((u.verified)?"Verificado":"Pendente")+'</strong></div><div class="actions"><a class="btn ghost" href="#/contato">Falar com a equipe</a><button class="btn" type="button" data-action="logout">Sair</button></div></section></div><div class="rule"></div><div class="split"><section><span class="eyebrow">Orçamentos</span><h3>Histórico comercial</h3>'+quoteRows+'</section><section><span class="eyebrow">Pedidos</span><h3>Histórico de compras</h3>'+orderRows+'</section></div></main>';
}async function submitAuth(e){
  e.preventDefault();
  const form=e.currentTarget;
  const mode=form.dataset.mode==="register"?"register":"login";
  const button=form.querySelector("button[type=submit]");
  const msg=form.querySelector("#auth-message");
  const payload=Object.fromEntries(new FormData(form));
  const name=String(payload.name||"").trim();
  const mail=String(payload.email||"").trim();
  const pass=String(payload.password||"");
  msg.textContent="";
  if(mode==="register"&&(name.length<2||name.length>120)){msg.textContent="Informe seu nome completo.";return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){msg.textContent="Informe um email válido.";return}
  if(pass.length<8||pass.length>128){msg.textContent="A senha deve ter entre 8 e 128 caracteres.";return}
  button.disabled=true;
  button.dataset.originalText=button.textContent;
  button.textContent=mode==="login"?"Entrando…":"Criando conta…";
  try{
    const d=await api(mode==="login"?"/api/auth/login":"/api/auth/register",{method:"POST",body:JSON.stringify(payload)});
    if(!d?.token||!d?.user)throw Error("O servidor não retornou uma sessão válida.");
    state.token=d.token;state.user=d.user;state.authenticated=true;state.authMode="login";state.authMessage="";
    localStorage.setItem("kz_token",d.token);
    render();
    toast(mode==="login"?"Login realizado.":"Conta criada com sucesso.");
    await load();
  }catch(x){msg.textContent=x?.message||"Não foi possível concluir o cadastro."}
  finally{
    button.disabled=false;
    if(document.body.contains(button))button.textContent=button.dataset.originalText||"Continuar";
  }
}

