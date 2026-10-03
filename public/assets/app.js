const API_URL="https://kztechsite.onrender.com";
const API_TIMEOUT_MS=30000;
window.addEventListener("DOMContentLoaded",()=>{if(!document.querySelector("#app")?.innerHTML.trim()){try{render()}catch{document.querySelector("#app").innerHTML="<main style=\"min-height:100vh;display:grid;place-items:center;padding:40px;color:#fff;font:16px system-ui;background:#050505\"><div><h1>KORCZAK TECHNOLOGY</h1><p>Carregando a interface…</p></div></main>"}}});
const APP_VERSION="2026.10.02.24";
const root=document.querySelector("#app");
const FALLBACK_PRODUCTS=[
{id:"korczak-ai",name:"Korczak AI",type:"KOS",status:"Iniciado",description:"Inteligência e automação para o ecossistema Korczak."},
{id:"ide",name:"Korczak IDE",type:"KOS",status:"Iniciado",description:"Ambiente de desenvolvimento em construção ativa."},
{id:"morok",name:"MOROK",type:"KOS",status:"Iniciado",description:"Assistente pessoal e operacional."},
{id:"erp",name:"KORCZAK ERP",type:"KOS",status:"Iniciado",description:"Gestão empresarial."},
{id:"flow",name:"KORCZAK FLOW",type:"KOS",status:"Planejado",description:"Fluxos e automações."},
{id:"vision",name:"KORCZAK VISION",type:"KOS",status:"Planejado",description:"Visão operacional."},
{id:"ops",name:"KORCZAK OPS",type:"KOS",status:"Planejado",description:"Operações."},
{id:"connect",name:"KORCZAK CONNECT",type:"KOS",status:"Planejado",description:"Integrações."},
{id:"mobile",name:"KORCZAK MOBILE",type:"KOS",status:"Planejado",description:"Mobilidade."},
{id:"workspace",name:"Korczak Workspace",type:"Workspace",status:"Em construção",description:"Marca que reúne os aplicativos de produtividade."},
{id:"documents",name:"Korczak Documents",type:"Workspace",status:"Em construção",description:"Único aplicativo do Workspace iniciado atualmente."},
{id:"sheets",name:"Korczak Sheets",type:"Workspace",status:"Planejado",description:"Planilhas."},
{id:"slides",name:"Korczak Slides",type:"Workspace",status:"Planejado",description:"Apresentações."},
{id:"drive",name:"Korczak Drive",type:"Workspace",status:"Planejado",description:"Arquivos e armazenamento."},
{id:"cloud",name:"Korczak Cloud",type:"Workspace",status:"Planejado",description:"Serviços de nuvem."},
{id:"mail",name:"Korczak Mail",type:"Workspace",status:"Planejado",description:"Email."},
{id:"calendar",name:"Korczak Calendar",type:"Workspace",status:"Planejado",description:"Agenda."},
{id:"meet",name:"Korczak Meet",type:"Workspace",status:"Planejado",description:"Videoconferências."},
{id:"chat",name:"Korczak Chat",type:"Workspace",status:"Planejado",description:"Chat."},
{id:"forms",name:"Korczak Forms",type:"Workspace",status:"Planejado",description:"Formulários."},
{id:"sites",name:"Korczak Sites",type:"Workspace",status:"Planejado",description:"Sites."},
{id:"tasks",name:"Korczak Tasks",type:"Workspace",status:"Planejado",description:"Tarefas."},
{id:"keep",name:"Korczak Keep",type:"Workspace",status:"Planejado",description:"Notas."}
];
const state={token:localStorage.getItem("kz_token"),user:null,products:FALLBACK_PRODUCTS,quotes:[],orders:[],menu:false,authenticated:false,authMode:"login",authMessage:""};

const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
const money=value=>{const n=Number(value);return Number.isFinite(n)?n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2}):"R$ 0,00"};
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
  ["/","Início"],["/mentoria","Mentoria"],["/comercial","Comercial"],["/institucional","Institucional"],
  ["/produtos","Produtos"],["/historia","História"],["/visao","Visão"],["/valores","Valores"],["/parcerias","Parcerias"],
  ["/carreiras","Carreiras"],["/faq","FAQ"],["/contato","Contato"],["/conta","Meu perfil"]
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
    group("Principal",links.slice(0,5),0)+group("Ecossistema",links.slice(5,9),5)+group("Empresa & suporte",links.slice(9),9)+
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
 return '<main id="main-content"><section class="hero shell"><div class="hero-copy"><span class="eyebrow">KORCZAK TECHNOLOGY · PORTA DE ENTRADA</span><h1>Encontre o caminho certo para conhecer a Korczak.</h1><p>Comece pela área que faz sentido para você: conheça o que fazemos comercialmente ou entenda quem somos, nossa história e nossa visão.</p></div><div class="moon-stage" aria-label="Identidade visual Korczak"><div class="moon-3d-wrap"><canvas id="moon-canvas"></canvas></div></div></section><section class="section shell gateway-section"><div class="section-heading"><span class="eyebrow">Comece por aqui</span><h2>Duas portas. Um ecossistema.</h2><p class="section-lead">Não sabe por onde começar? Escolha a área que corresponde ao que você procura. Você poderá voltar à página inicial a qualquer momento.</p></div><div class="gateway-grid"><a class="gateway-card gateway-commercial" href="#/comercial"><span class="gateway-number">01</span><span class="eyebrow">Comercial</span><h3>Quero conhecer soluções e possibilidades.</h3><p>Para você que quer ver nosso portfólio, conhecer nossos desenvolvimentos, entender o que cada solução faz, solicitar um orçamento ou falar com a equipe.</p><span class="gateway-link">Entrar na área comercial '+icon("arrow")+'</span></a><a class="gateway-card gateway-institutional" href="#/institucional"><span class="gateway-number">02</span><span class="eyebrow">Institucional</span><h3>Quero conhecer a Korczak.</h3><p>Para você que quer entender quem somos, nossa história, visão, valores, atuação e como organizamos nosso ecossistema de tecnologia.</p><span class="gateway-link">Entrar na área institucional '+icon("arrow")+'</span></a></div></section><section class="section shell"><span class="eyebrow">Em destaque</span><h2>Conheça o que estamos construindo.</h2><p class="section-lead">Alguns dos produtos que representam diferentes frentes da Korczak Technology.</p><div class="grid featured-home-grid"><a class="card featured" href="#/produto/korczak-ai"><span class="status">Inteligência</span><span class="card-index">01</span><h3>Korczak AI</h3><p class="muted">Inteligência e automação para o ecossistema Korczak.</p><span class="card-arrow">Explorar '+icon("arrow")+'</span></a><a class="card featured" href="#/workspace"><span class="status">Produtividade</span><span class="card-index">02</span><h3>Korczak Workspace</h3><p class="muted">Uma suíte para documentos, arquivos, agenda, comunicação e colaboração em um único ambiente.</p><span class="card-arrow">Conhecer '+icon("arrow")+'</span></a><a class="card featured" href="#/produto/ide"><span class="status">Developer Tool</span><span class="card-index">03</span><h3>Korczak IDE</h3><p class="muted">Ambiente de desenvolvimento para projetos Korczak.</p><span class="card-arrow">Explorar '+icon("arrow")+'</span></a></div></section><section class="section shell home-kos"><div class="info-deep"><div><span class="eyebrow">Também em destaque</span><h3>KOS · Korczak Operations System</h3></div><div><p class="muted">A suíte empresarial para organizar processos, gestão, documentos, indicadores, integrações e mobilidade.</p><a class="text-link" href="#/kos">Conhecer o KOS '+icon("arrow")+'</a></div></div></section></main>';
}
const READY_SERVICES={"landing-page":["Landing Page",2810,"Página de campanha.",[["sections","Mais seções","Seções extras",390],["form","Formulário de leads","Captação de contatos",490],["analytics","Analytics","Métricas",390],["seo","SEO inicial","Busca",490],["animations","Animações","Microinterações",690],["integration","Integração","CRM, WhatsApp ou API",790]]],"site":["Site Profissional",8250,"Site institucional ou comercial.",[["dashboard","Dashboard","Painel administrativo",1900],["terms","Termos de uso","Página de Termos de Uso",390],["privacy","Política de privacidade","Página de privacidade",390],["pages","Páginas extras","Cada página adicional",490],["blog","Blog","Artigos",990],["cms","CMS","Conteúdo gerenciável",1490],["seo","SEO inicial","Busca",690],["analytics","Analytics","Métricas",390],["auth","Login e cadastro","Autenticação",1290],["multilang","Multilíngue","Idiomas",1490],["integrations","Integrações","APIs e serviços",990]]],"ecommerce":["E-commerce",13100,"Loja virtual.",[["products","Catálogo avançado","Categorias e variações",1290],["dashboard","Dashboard","Painel",1900],["payments","Pagamentos","Gateway",1290],["shipping","Frete","Cálculo de frete",990],["coupons","Cupons","Promoções",690],["customers","Área do cliente","Conta e pedidos",1290],["analytics","Analytics","Métricas",590],["seo","SEO","Busca",790],["integrations","Integrações","ERP, CRM ou APIs",1490]]],"web-app":["Aplicação Web / SaaS",105000,"Sistema web personalizado.",[["dashboard","Dashboard","Painel",2500],["auth","Autenticação","Login e sessões",1490],["roles","Permissões","Perfis",1490],["database","Banco de dados","Persistência",1990],["api","API","API própria",2490],["notifications","Notificações","Email ou push",990],["payments","Pagamentos","Assinaturas",1490],["files","Arquivos","Upload",1290],["analytics","Analytics","Métricas",690]]],"mobile":["Aplicativo Mobile",75000,"Android e iOS.",[["auth","Login e cadastro","Conta",1490],["dashboard","Dashboard","Painel",1900],["notifications","Push notifications","Notificações",990],["offline","Modo offline","Sincronização",1990],["payments","Pagamentos","Compras",1490],["maps","Mapas","Localização",1290],["camera","Câmera / mídia","Fotos e vídeo",990],["api","API / backend","Backend",2490],["store","Publicação","Lojas",1290]]],"api":["API / Backend",31900,"API ou backend próprio.",[["auth","Autenticação","Acesso",990],["database","Banco de dados","Dados",1490],["admin","Painel administrativo","Gestão",1900],["docs","Documentação","Docs",790],["webhooks","Webhooks","Eventos",690],["payments","Pagamentos","Gateway",1290],["storage","Armazenamento","Arquivos",990],["monitoring","Monitoramento","Logs",890]]],"integration":["Integração de Sistemas",41300,"Conexão entre sistemas.",[["api","API","Integração",990],["webhook","Webhooks","Eventos",690],["database","Banco de dados","Sincronização",1290],["crm","CRM","Conexão",990],["payments","Pagamentos","Gateway",990],["erp","ERP","Conexão",1490],["auth","Autenticação","OAuth/tokens",790]]],"automation":["Automação de Processos",9400,"Fluxos automatizados.",[["workflow","Workflow","Fluxo principal",790],["n8n","n8n","Automação",990],["webhook","Webhooks","Gatilhos",690],["schedules","Agendamentos","Rotinas",490],["email","Email","Envio",490],["sheets","Planilhas","Integração",590],["crm","CRM","Automação",990],["monitoring","Monitoramento","Logs",690]]],"bot":["Bot / Chatbot",26300,"Atendimento e processos.",[["faq","FAQ","Perguntas",490],["buttons","Menu interativo","Caminhos",590],["whatsapp","WhatsApp","Integração",1290],["telegram","Telegram","Integração",690],["crm","CRM","Registros",990],["scheduling","Agendamento","Agenda",890],["handoff","Atendimento humano","Transferência",590],["dashboard","Dashboard","Painel",1490]]],"customization":["Customização",21800,"Alterações em sistema existente.",[["ui","Interface","Visual",690],["page","Página / tela","Nova tela",790],["module","Módulo","Função",1490],["api","API","Endpoint",990],["auth","Acesso","Login/permissões",990],["database","Dados","Estrutura",990],["automation","Automação","Rotina",890],["deployment","Deploy","Publicação",490]]]};const OPTION_DIFFICULTY={sections:3,form:5,analytics:6,seo:6,animations:3,integration:8,dashboard:8,terms:2,privacy:2,pages:4,blog:4,cms:8,auth:7,multilang:9,integrations:9,products:7,payments:9,shipping:6,coupons:4,customers:7,roles:7,database:8,api:8,notifications:6,files:7,offline:8,maps:7,camera:5,store:5,admin:7,docs:4,webhooks:6,storage:6,monitoring:8,webhook:6,crm:7,erp:9,workflow:6,n8n:6,schedules:4,email:5,sheets:5,faq:2,buttons:3,whatsapp:5,telegram:4,scheduling:5,handoff:4,ui:3,page:5,module:8,automation:7,deployment:7,responsive:3,tracking:6,cookie:3,domain:4,accessibility:6,performance:8,security:9,search:6,forms:5,backup:8,support:3,inventory:7,orders:8,reviews:5,abandoned:8,wishlist:4,"shipping-tracking":6,"multi-store":10,"reviews-admin":5,filters:7,audit:8,"admin-area":8,realtime:9,queue:8,cache:7,biometric:6,"deep-links":5,sharing:4,location:6,chat:8,crash:7,"rate-limit":6,queues:8,cron:5,"api-version":5,sso:8,mapping:7,sync:9,retry:5,logs:5,alerts:5,scheduler:5,conditions:5,transform:6,http:6,approval:7,reports:7,commands:7,media:6,multichannel:10,knowledge:8,report:6,notification:5};
const OPTION_NEED={sections:3,form:6,analytics:5,seo:6,animations:2,integration:7,dashboard:7,terms:3,privacy:4,pages:5,blog:4,cms:7,auth:8,multilang:3,integrations:7,products:9,payments:10,shipping:8,coupons:4,customers:8,roles:7,database:10,api:9,notifications:4,files:5,offline:5,maps:5,camera:4,store:7,admin:8,docs:5,webhooks:7,storage:6,monitoring:8,webhook:7,crm:6,erp:7,workflow:9,n8n:7,schedules:5,email:7,sheets:4,faq:6,buttons:5,whatsapp:5,telegram:4,scheduling:6,handoff:6,ui:4,page:6,module:9,automation:7,deployment:8,responsive:8,tracking:5,cookie:4,domain:5,accessibility:7,performance:7,security:9,search:5,forms:6,backup:8,support:4,inventory:9,orders:10,reviews:4,abandoned:5,wishlist:3,"shipping-tracking":7,"multi-store":3,"reviews-admin":4,filters:6,audit:7,"admin-area":8,realtime:6,queue:7,cache:5,biometric:4,"deep-links":4,sharing:3,location:5,chat:7,crash:8,"rate-limit":8,queues:8,cron:5,"api-version":5,sso:6,mapping:6,sync:9,retry:7,logs:7,alerts:6,scheduler:5,conditions:7,transform:7,http:8,approval:5,reports:6,commands:7,media:5,multichannel:7,knowledge:8,report:6,notification:5};
const SERVICE_EXTRAS={
"landing-page":[
 ["tracking","Rastreamento de conversões","Métricas avançadas","Mede ações específicas, conversões e campanhas."],
 ["whatsapp","Integração com WhatsApp","Contato externo","Conecta a página a fluxos e atendimento pelo WhatsApp."],
 ["multilang","Mais idiomas","Internacionalização","Adiciona versões do conteúdo em outros idiomas."],
 ["animations","Animações avançadas","Experiência visual","Adiciona interações e movimentos personalizados além do padrão."],
 ["integration","Integrações externas","Sistemas externos","Conecta a landing page a CRM, automações ou outras plataformas."]
],
"site":[
 ["multilang","Mais idiomas","Internacionalização","Adiciona versões completas do site em outros idiomas."],
 ["integrations","Integrações externas","Sistemas e plataformas","Conecta o site a CRM, ERP, APIs ou ferramentas externas."],
 ["dashboard","Painel administrativo avançado","Gestão","Cria uma área administrativa personalizada para operações que exigem controles além do conteúdo padrão."],
 ["realtime","Atualizações em tempo real","Tempo real","Atualiza informações sem recarregar a página."],
 ["automation","Automação de processos","Automação","Executa tarefas e fluxos automaticamente a partir de eventos do site."]
],
"ecommerce":[
 ["abandoned","Recuperação de carrinho","Vendas","Cria automações para tentar recuperar compras não finalizadas."],
 ["multi-store","Multi-loja","Operações","Permite administrar mais de uma loja ou operação na mesma estrutura."],
 ["shipping-tracking","Rastreamento avançado de entrega","Logística","Integra o acompanhamento detalhado da entrega."],
 ["erp","Integração com ERP","Gestão empresarial","Sincroniza a loja com um sistema empresarial externo."],
 ["crm","Integração com CRM","Relacionamento","Sincroniza clientes e informações comerciais com um CRM."]
],
"web-app":[
 ["realtime","Tempo real","Atualização instantânea","Atualiza informações sem recarregar a aplicação."],
 ["webhooks","Webhooks","Eventos externos","Troca eventos automaticamente com outros sistemas."],
 ["queue","Filas de processamento","Processamento assíncrono","Processa tarefas demoradas em segundo plano."],
 ["cache","Cache avançado","Desempenho","Reduz processamento repetido em aplicações com maior carga."],
 ["monitoring","Monitoramento avançado","Observabilidade","Acompanha métricas e sinais operacionais detalhados."],
 ["integrations","Integrações externas","Sistemas","Conecta a aplicação a plataformas e serviços externos."]
],
"mobile":[
 ["biometric","Biometria","Acesso","Adiciona autenticação biométrica quando suportada pelo dispositivo."],
 ["deep-links","Deep links","Navegação","Abre diretamente telas específicas a partir de links."],
 ["location","Geolocalização","Localização","Usa a localização do dispositivo em recursos que dependem dela."],
 ["chat","Chat em tempo real","Conversas","Adiciona comunicação instantânea entre usuários ou com atendimento."],
 ["realtime","Dados em tempo real","Sincronização","Mantém informações atualizadas instantaneamente."],
 ["sharing","Compartilhamento avançado","Integração nativa","Adiciona fluxos personalizados de compartilhamento do sistema."],
 ["offline","Offline avançado","Uso sem conexão","Permite que partes mais complexas do aplicativo funcionem sem internet e sincronizem depois."]
],
"api":[
 ["queues","Filas de processamento","Escala","Processa tarefas demoradas de forma assíncrona."],
 ["cache","Cache","Desempenho","Armazena respostas temporariamente para reduzir processamento."],
 ["search","Busca especializada","Pesquisa","Adiciona mecanismos de busca e filtros específicos para grandes volumes de dados."],
 ["roles","Permissões avançadas","Autorização","Cria regras detalhadas de acesso por usuário, equipe ou aplicação."],
 ["audit","Auditoria detalhada","Rastreamento","Mantém histórico detalhado das operações realizadas."],
 ["integrations","Integrações externas","Serviços","Conecta a APIs, CRMs, ERPs e outras plataformas."],
 ["realtime","Tempo real","Eventos","Entrega atualizações em tempo real para clientes conectados."],
 ["api-version","Versionamento avançado","Evolução","Mantém múltiplas versões da API para compatibilidade entre integrações."]
],
"integration":[
 ["sso","SSO","Identidade","Conecta a integração a um provedor de identidade centralizado."],
 ["queue","Filas","Escala","Processa grandes volumes de eventos sem bloquear a integração."],
 ["scheduler","Agendamentos avançados","Rotinas","Executa sincronizações e tarefas em horários programados."],
 ["files","Transferência de arquivos","Arquivos","Move arquivos entre plataformas durante a integração."],
 ["alerts","Alertas operacionais","Falhas","Notifica a equipe quando uma integração apresenta problemas."]
],
"automation":[
 ["database","Automação com banco de dados","Dados","Consulta ou altera bancos de dados durante os fluxos."],
 ["http","Integrações HTTP avançadas","APIs","Faz chamadas personalizadas para APIs externas."],
 ["approval","Aprovação humana","Controle","Pausa um fluxo para que uma pessoa aprove antes da continuação."],
 ["files","Automação de arquivos","Arquivos","Cria, move ou processa arquivos automaticamente."],
 ["reports","Relatórios automáticos","Relatórios","Gera e envia relatórios de processos."],
 ["notifications","Notificações avançadas","Avisos","Envia notificações por canais adicionais conforme regras do fluxo."]
],
"bot":[
 ["media","Mídia avançada","Arquivos","Processa imagens, vídeos, documentos e outros formatos."],
 ["payments","Pagamentos no bot","Cobrança","Permite realizar operações de pagamento dentro do fluxo."],
 ["integrations","Integrações externas","Sistemas","Conecta o bot a CRM, ERP, agenda e outras plataformas."],
 ["analytics","Analytics avançado","Métricas","Analisa conversas, etapas e resultados do atendimento."],
 ["multichannel","Multicanal","Canais","Reaproveita o bot em diferentes canais de atendimento."],
 ["knowledge","Base de conhecimento avançada","Conteúdo","Organiza grandes volumes de conteúdo para consulta pelo bot."]
],
"customization":[
 ["integration","Integração externa","Conexões","Conecta o sistema existente a um serviço externo."],
 ["dashboard","Dashboard personalizado","Gestão","Cria painéis administrativos ou indicadores sob medida."],
 ["report","Relatórios personalizados","Informações","Cria relatórios específicos para a necessidade do sistema."],
 ["notification","Notificações adicionais","Avisos","Adiciona canais e regras de aviso além do funcionamento atual."],
 ["automation","Automação personalizada","Processos","Automatiza rotinas específicas do sistema existente."],
 ["monitoring","Monitoramento","Observabilidade","Adiciona acompanhamento técnico de erros e disponibilidade."]
]
};

const SERVICE_INCLUDED={
  "landing-page":["responsive","deployment","security","performance","accessibility","seo","sections","form","analytics"],
  "site":["responsive","deployment","security","performance","accessibility","seo","sections","pages","forms","cookie","terms","privacy"],
  "ecommerce":["responsive","deployment","security","performance","accessibility","seo","sections","pages","forms","search","filters","files","auth","roles","products","dashboard","payments","shipping","inventory","orders","customers","cart","checkout","email","analytics"],
  "web-app":["responsive","deployment","security","performance","accessibility","sections","pages","forms","files","auth","roles","database","api","dashboard","notifications","audit","backup"],
  "mobile":["deployment","security","performance","accessibility","auth","dashboard","notifications","files","api","store","crash"],
  "api":["auth","database","admin","docs","webhooks","storage","monitoring","rate-limit"],
  "integration":["api","webhook","auth","mapping","sync","retry","logs","monitoring"],
  "automation":["workflow","webhook","conditions","transform","retry","logs"],
  "bot":["commands","faq","buttons","handoff","forms","auth","notifications"],
  "customization":[]
};

Object.keys(SERVICE_INCLUDED).forEach(serviceId=>{
  const included=new Set(SERVICE_INCLUDED[serviceId]||[]);
  if(READY_SERVICES[serviceId]){
    READY_SERVICES[serviceId][3]=(READY_SERVICES[serviceId][3]||[]).filter(option=>!included.has(option[0]));
  }
  if(SERVICE_EXTRAS[serviceId]){
    SERVICE_EXTRAS[serviceId]=SERVICE_EXTRAS[serviceId].filter(option=>!included.has(option[0]));
  }
});
Object.keys(READY_SERVICES).forEach(k=>{
  const base=READY_SERVICES[k][3]||[];
  const existing=new Set(base.map(o=>o[0]));
  (SERVICE_EXTRAS[k]||[]).forEach(o=>{if(!existing.has(o[0]))base.push([o[0],o[1],o[2],o[3],OPTION_DIFFICULTY[o[0]]||6]);});
});


function serviceOptionPrices(service){
  const options=service[3]||[];
  return options.map((o)=>{
    const difficulty=Number(OPTION_DIFFICULTY[o[0]]??5);
    const need=Number(OPTION_NEED[o[0]]??5);
    // Preço acessível para uma empresa pequena: complexidade pesa mais,
    // enquanto a necessidade ajusta o valor conforme a utilidade do recurso.
    const price=150+(difficulty*75)+(need*45)+(difficulty*need*4);
    return Math.max(200,Math.round(price/50)*50);
  });
}
function beginnerExplanation(o){
  const id=String(o[0]||"");
  const descriptions={
    sections:"Adiciona novas seções à página para apresentar mais informações, serviços ou conteúdos.",
    form:"Cria um formulário para visitantes enviarem dados, mensagens, pedidos ou contatos.",
    analytics:"Registra e apresenta dados de acesso e uso para ajudar a entender o desempenho da página ou sistema.",
    seo:"Prepara páginas e conteúdos para serem melhor encontrados e interpretados pelos mecanismos de busca.",
    animations:"Adiciona movimentos e microinterações para tornar a interface mais dinâmica e clara.",
    integration:"Conecta o projeto a outro sistema ou serviço, permitindo troca de dados ou ações automáticas.",
    dashboard:"Cria um painel central para visualizar informações e administrar recursos do sistema.",
    terms:"Adiciona uma página com as condições e regras de utilização do serviço.",
    privacy:"Adiciona uma página explicando como os dados pessoais são tratados e utilizados.",
    pages:"Cria páginas adicionais além da estrutura principal do projeto.",
    blog:"Cria uma área para publicar, organizar e apresentar artigos e conteúdos.",
    cms:"Permite administrar conteúdos do site por uma área de gerenciamento, sem precisar editar o código a cada alteração.",
    auth:"Cria o sistema de entrada de usuários, com cadastro, login e controle de sessão.",
    multilang:"Disponibiliza o conteúdo do projeto em diferentes idiomas.",
    integrations:"Conecta o sistema a APIs, plataformas e outros serviços necessários ao projeto.",
    products:"Cria um catálogo com produtos, categorias e variações para organizar uma loja.",
    payments:"Conecta o projeto a um meio de pagamento para processar cobranças.",
    shipping:"Calcula ou organiza opções de entrega e seus respectivos valores.",
    coupons:"Permite criar códigos ou regras de desconto para compras.",
    customers:"Cria uma área onde clientes podem acessar sua conta e acompanhar informações e pedidos.",
    roles:"Define diferentes níveis de acesso para determinar o que cada usuário pode visualizar ou alterar.",
    database:"Cria a estrutura usada para armazenar, organizar e consultar os dados do sistema.",
    api:"Cria uma interface de comunicação para outros sistemas enviarem e receberem dados do projeto.",
    notifications:"Envia avisos ao usuário quando eventos ou ações importantes acontecem.",
    files:"Permite enviar, armazenar, acessar ou administrar arquivos dentro do sistema.",
    offline:"Permite continuar usando determinadas funções sem conexão e sincronizar os dados quando a conexão voltar.",
    maps:"Adiciona mapas e recursos de localização ao projeto.",
    camera:"Permite utilizar câmera e recursos de mídia do dispositivo quando autorizados.",
    store:"Prepara o aplicativo para publicação e distribuição nas lojas correspondentes.",
    admin:"Cria ferramentas para administradores gerenciarem o sistema e seus dados.",
    docs:"Organiza uma documentação para explicar como utilizar ou integrar a API ou serviço.",
    webhooks:"Permite que o sistema envie ou receba avisos automáticos quando eventos acontecem.",
    storage:"Adiciona armazenamento para arquivos ou outros dados que precisam ficar disponíveis no sistema.",
    monitoring:"Acompanha disponibilidade, erros e funcionamento do sistema para facilitar a identificação de problemas.",
    webhook:"Cria uma conexão baseada em eventos para avisar outro sistema automaticamente.",
    crm:"Conecta o projeto a uma ferramenta de relacionamento e gestão de clientes.",
    erp:"Conecta o projeto a um sistema de gestão empresarial para compartilhar informações e processos.",
    workflow:"Define a sequência de etapas que um processo automatizado deve executar.",
    n8n:"Integra o projeto ao n8n para criar e executar automações entre serviços.",
    schedules:"Executa tarefas automaticamente em horários ou intervalos definidos.",
    email:"Permite enviar emails automáticos ou transacionais a partir do projeto.",
    sheets:"Conecta o sistema a planilhas para consultar, registrar ou atualizar informações.",
    faq:"Cria uma área de perguntas e respostas para orientar usuários sobre dúvidas frequentes.",
    buttons:"Cria opções e caminhos de interação para que o usuário escolha ações dentro do bot.",
    whatsapp:"Conecta o projeto ao WhatsApp para comunicação, atendimento ou automações.",
    telegram:"Conecta o projeto ao Telegram para comunicação e automações.",
    scheduling:"Permite organizar horários, reservas ou agendamentos dentro do sistema.",
    handoff:"Permite encaminhar a conversa do bot para uma pessoa quando o atendimento automático não for suficiente.",
    ui:"Altera ou cria elementos visuais da interface para adequá-los ao projeto.",
    page:"Cria uma nova página ou tela com conteúdo e funções específicas.",
    module:"Adiciona um conjunto de funcionalidades organizado como um novo módulo do sistema.",
    automation:"Automatiza uma tarefa ou processo que anteriormente precisaria ser executado manualmente.",
    deployment:"Publica o projeto em um ambiente onde os usuários possam acessá-lo.",
    responsive:"Adapta a interface para funcionar corretamente em diferentes tamanhos de tela.",
    tracking:"Registra ações importantes, como cliques ou envios, para acompanhar conversões e comportamento.",
    cookie:"Adiciona o aviso e o controle de preferências relacionados ao uso de cookies.",
    domain:"Configura o projeto para funcionar com um domínio personalizado.",
    accessibility:"Melhora a utilização do projeto por pessoas com diferentes necessidades de acesso, incluindo teclado e tecnologias assistivas.",
    performance:"Otimiza carregamento, processamento e uso de recursos para tornar o projeto mais rápido e eficiente.",
    security:"Adiciona mecanismos de proteção para reduzir riscos de acesso indevido, abuso e exposição de dados.",
    search:"Adiciona uma ferramenta para pesquisar conteúdos ou registros dentro do projeto.",
    forms:"Cria formulários estruturados para coleta de informações e solicitações.",
    backup:"Cria cópias de segurança para permitir recuperação de dados em caso de falha ou perda.",
    support:"Estrutura informações e canais para ajudar usuários a obter atendimento e suporte.",
    inventory:"Permite controlar a quantidade e disponibilidade dos produtos.",
    orders:"Organiza pedidos, seus estados e informações necessárias para acompanhar a venda.",
    reviews:"Permite que clientes enviem e consultem avaliações sobre produtos ou serviços.",
    abandoned:"Cria um fluxo para identificar e tentar recuperar compras que não foram finalizadas.",
    wishlist:"Permite que usuários salvem produtos ou itens para consultar posteriormente.",
    "shipping-tracking":"Permite acompanhar o andamento de uma entrega depois que o pedido foi enviado.",
    "multi-store":"Permite administrar mais de uma loja, operação ou catálogo dentro da mesma estrutura.",
    "reviews-admin":"Permite moderar, aprovar, ocultar ou administrar avaliações enviadas por usuários.",
    filters:"Permite filtrar informações para encontrar registros ou resultados específicos.",
    audit:"Registra ações importantes realizadas no sistema para permitir consulta e rastreamento posterior.",
    "admin-area":"Cria uma área interna para administradores gerenciarem dados, usuários e configurações.",
    realtime:"Atualiza informações em tempo real sem exigir que o usuário recarregue a página.",
    queue:"Organiza tarefas para processamento em segundo plano, evitando que operações demoradas bloqueiem o usuário.",
    cache:"Guarda temporariamente informações usadas com frequência para reduzir processamento e acelerar respostas.",
    biometric:"Permite usar recursos biométricos compatíveis do dispositivo para autenticação.",
    "deep-links":"Permite abrir diretamente uma tela ou função específica do aplicativo por meio de um link.",
    sharing:"Permite compartilhar conteúdos usando os recursos disponíveis no dispositivo.",
    location:"Permite utilizar a localização do dispositivo, mediante autorização do usuário.",
    chat:"Cria uma área de conversa para troca de mensagens entre usuários ou com atendimento.",
    crash:"Registra falhas do aplicativo para ajudar a identificar e corrigir problemas.",
    "rate-limit":"Limita a quantidade de requisições em determinado período para proteger a API contra excesso de chamadas.",
    queues:"Organiza tarefas e eventos para processamento assíncrono e controlado.",
    cron:"Executa tarefas automaticamente em horários ou intervalos programados.",
    "api-version":"Organiza versões da API para permitir mudanças sem interromper integrações existentes.",
    sso:"Permite que usuários utilizem uma identidade centralizada para acessar o sistema.",
    mapping:"Converte e relaciona campos de dados entre sistemas com estruturas diferentes.",
    sync:"Mantém informações correspondentes atualizadas entre dois ou mais sistemas.",
    retry:"Tenta novamente uma operação que falhou temporariamente.",
    logs:"Registra acontecimentos e operações do sistema para consulta e diagnóstico.",
    alerts:"Envia avisos quando uma condição importante, erro ou falha é detectada.",
    scheduler:"Programa execuções automáticas de tarefas em datas ou horários definidos.",
    conditions:"Define regras que escolhem caminhos diferentes dentro de uma automação.",
    transform:"Converte, limpa ou reorganiza dados antes que sejam usados por outra etapa.",
    http:"Permite fazer requisições HTTP para conversar com APIs e serviços externos.",
    approval:"Inclui uma etapa em que uma pessoa precisa aprovar algo antes que o fluxo continue.",
    reports:"Gera informações organizadas para acompanhar resultados, operações ou indicadores.",
    commands:"Define comandos que o bot reconhece para executar ações ou responder aos usuários.",
    media:"Permite receber, enviar ou trabalhar com imagens, vídeos e outros arquivos de mídia.",
    multichannel:"Permite utilizar uma estrutura de bot em diferentes canais de comunicação.",
    knowledge:"Organiza conteúdos e informações que o bot pode utilizar para responder ou orientar usuários.",
    report:"Cria relatórios ou consultas específicas para as necessidades do sistema.",
    notification:"Adiciona avisos por email ou outros canais disponíveis no projeto.",
    migration:"Move ou adapta dados e estruturas de um sistema ou versão para outra."
  };
  return descriptions[id]||String(o[3]||o[2]||"Recurso adicional configurado de acordo com a necessidade do projeto.");
}

const MENTOR_WHATSAPP="https://wa.me/5511954083183";
const MENTOR_TRACKS={
  frontend:{title:"Front-end",description:"Interfaces, páginas e aplicações web.",levels:[
    ["iniciante-front","Iniciante","HTML · CSS · JavaScript",500,"Aprenda a criar páginas e interfaces começando pela estrutura, estilos e lógica da web."],
    ["intermediario-front","Intermediário","HTML · CSS · JavaScript · React",750,"Evolua para aplicações mais completas, componentes e organização de projetos com React."],
    ["profissional-front","Profissional","React · TypeScript · Git/GitHub · APIs",900,"Trabalhe com uma stack profissional, integração com APIs e fluxo de desenvolvimento com Git."]
  ]},
  backend:{title:"Back-end",description:"Servidores, APIs, bancos de dados e lógica.",levels:[
    ["iniciante-back","Iniciante","Python · JavaScript · SQL",600,"Aprenda lógica de servidor, programação e os fundamentos de bancos de dados."],
    ["intermediario-back","Intermediário","Python · Node.js · SQL · APIs",900,"Construa servidores e APIs conectados a bancos de dados e aplicações."],
    ["profissional-back","Profissional","Node.js · Java · SQL · APIs · Git",1050,"Aprofunde arquitetura de back-end, APIs, bancos e práticas profissionais de desenvolvimento."]
  ]},
  fullstack:{title:"Full-stack",description:"Front-end e back-end integrados em projetos completos.",levels:[
    ["iniciante-fullstack","Iniciante","HTML · CSS · JavaScript · Python",700,"Aprenda a construir uma aplicação completa começando pela interface e chegando ao servidor."],
    ["intermediario-fullstack","Intermediário","React · Node.js · SQL · APIs",1000,"Integre interface, servidor, banco de dados e APIs em projetos mais completos."],
    ["profissional-fullstack","Profissional","React · TypeScript · Node.js · SQL · Git",1200,"Trabalhe com uma stack full-stack profissional e desenvolva projetos completos com boas práticas."]
  ]}
};
const MENTOR_TECHS=[["JavaScript","Web e lógica de programação",50],["Python","Programação e automação",50],["HTML","Estrutura web",50],["CSS","Interfaces e estilos",50],["Kotlin","Desenvolvimento Kotlin",100],["Java","Aplicações e back-end",100],["Node.js","Back-end com JavaScript",150],["React","Interfaces e aplicações web",150],["SQL","Bancos de dados",100],["Git / GitHub","Versionamento e colaboração",100],["C#","Desenvolvimento com .NET",150],["TypeScript","JavaScript tipado",100]];

function mentorMoney(v){return Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:0,maximumFractionDigits:0})+"/mês";}
function mentorCard(track,level){
  return '<article class="mentor-level-card"><span class="eyebrow">'+esc(track.title)+'</span><h3>'+esc(level[1])+'</h3><p>'+esc(level[4])+'</p><small>'+esc(level[2])+'</small><strong>'+mentorMoney(level[3])+'</strong><a class="btn ghost" href="#/mentoria/'+encodeURIComponent(level[0])+'">Conhecer trilha '+icon("arrow")+'</a></article>';
}
function mentorshipPage(){
  return '<main id="main-content" class="mentor-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KORCZAK TECHNOLOGY · FORMAÇÃO · PRÁTICA</span><h1>Mentoria<br><span>Korczak.</span></h1><p>Aprenda tecnologia construindo um projeto real, com acompanhamento e orientação profissional.</p><div class="actions"><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Quero me inscrever '+icon("arrow")+'</a><a class="btn ghost" href="#/mentoria/precos">Calcular mensalidade '+icon("arrow")+'</a></div></div><div class="mentor-monogram" aria-hidden="true">M</div></section><section class="section shell split"><span class="eyebrow">01 · A MENTORIA</span><div><h2>Formação técnica prática e acompanhada.</h2><p>A mentoria foi criada para quem quer aprender programação colocando o conhecimento em prática. O conteúdo é definido de acordo com a trilha, as tecnologias e o projeto que você deseja desenvolver.</p><p>A mensalidade pode partir de <strong>R$ 100/mês</strong> em uma grade personalizada, enquanto as trilhas prontas possuem valores próprios.</p></div></section><section class="section shell"><span class="eyebrow">02 · COMO FUNCIONA</span><div class="grid mentor-feature-grid"><article class="card"><span class="card-index">01</span><h3>Projeto real</h3><p>Você aplica os conhecimentos em um projeto desenvolvido ao longo da mentoria.</p></article><article class="card"><span class="card-index">02</span><h3>Acompanhamento</h3><p>O aprendizado acontece com orientação, revisão e direcionamento técnico.</p></article><article class="card"><span class="card-index">03</span><h3>Trilha definida</h3><p>Escolha Front-end, Back-end, Full-stack ou monte uma grade personalizada.</p></article><article class="card"><span class="card-index">04</span><h3>Formação prática</h3><p>O objetivo é transformar estudo em capacidade de construir e evoluir projetos.</p></article></div></section><section class="section shell split"><span class="eyebrow">03 · ESTRUTURA</span><div><h2>Um caminho de estudo com objetivo claro.</h2><p>As trilhas possuem níveis iniciante, intermediário e profissional. O nível escolhido define as tecnologias e a profundidade esperada.</p><p>Também é possível montar uma grade própria selecionando as tecnologias desejadas.</p></div></section><section class="section shell mentor-cta"><span class="eyebrow">04 · PRÓXIMO PASSO</span><h2>Escolha sua formação.</h2><p>Veja os valores, compare as trilhas e calcule uma grade personalizada.</p><div class="actions"><a class="btn" href="#/mentoria/precos">Ver preços e calcular '+icon("arrow")+'</a><a class="btn ghost" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Inscrever-se pelo WhatsApp '+icon("external")+'</a></div></section></main>';
}
function mentorshipPrices(){
  const tracks=Object.values(MENTOR_TRACKS).map(t=>'<article class="mentor-track-card"><span class="eyebrow">TRILHA</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.description)+'</p><div class="mentor-level-list">'+t.levels.map(l=>'<a class="mentor-price-row" href="#/mentoria/'+encodeURIComponent(l[0])+'"><span><b>'+esc(l[1])+'</b><small>'+esc(l[2])+'</small></span><strong>'+mentorMoney(l[3])+'</strong><span class="side-arrow">→</span></a>').join("")+'</div></article>').join("");
  const techs=MENTOR_TECHS.map(t=>'<label class="mentor-tech-row"><span><b>'+esc(t[0])+'</b><small>'+esc(t[1])+'</small></span><strong>+ '+mentorMoney(t[2]).replace("/mês","")+'</strong><input type="checkbox" data-mentor-tech data-price="'+t[2]+'"><span class="mentor-toggle" aria-hidden="true"></span></label>').join("");
  return '<main id="main-content" class="mentor-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KORCZAK TECHNOLOGY · MENTORIA · INVESTIMENTO</span><h1>Quanto<br><span>custa?</span></h1><p>Escolha uma trilha pronta ou monte sua própria grade de estudos.</p></div><div class="mentor-monogram" aria-hidden="true">R$</div></section><section class="section shell"><span class="eyebrow">01 · TRILHAS</span><h2>Escolha seu caminho.</h2><p class="section-lead">Cada trilha possui uma formação diferente, com três níveis: iniciante, intermediário e profissional.</p><div class="mentor-track-grid">'+tracks+'</div></section><section class="section shell mentor-custom"><div class="mentor-custom-head"><div><span class="eyebrow">02 · MINHA PRÓPRIA GRADE</span><h2>Monte do seu jeito.</h2><p>Começa em R$ 100/mês e aumenta conforme as tecnologias escolhidas.</p></div><div class="mentor-total"><small>TOTAL MENSAL</small><strong data-mentor-total>R$ 100</strong><span data-mentor-count>0 tecnologias selecionadas</span></div></div><div class="mentor-tech-list">'+techs+'</div></section><section class="section shell split"><span class="eyebrow">03 · VALORES</span><div><h2>Formação técnica com preço acessível.</h2><p>Os valores exibidos são mensalidades da mentoria. A grade personalizada começa em R$ 100/mês e recebe os acréscimos correspondentes às tecnologias selecionadas.</p></div></section><section class="section shell mentor-cta"><span class="eyebrow">04 · INSCRIÇÃO</span><h2>Escolheu sua trilha?</h2><p>Fale diretamente com a Korczak Technology para confirmar sua formação.</p><div class="actions"><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Quero me inscrever '+icon("arrow")+'</a><a class="btn ghost" href="#/mentoria">Voltar para Mentoria</a></div></section></main>';
}
function updateMentorTotal(el){
  const root=el.closest(".mentor-page"); if(!root)return;
  let total=100,count=0;
  root.querySelectorAll("[data-mentor-tech]:checked").forEach(x=>{total+=Number(x.dataset.price)||0;count++;});
  const totalEl=root.querySelector("[data-mentor-total]"),countEl=root.querySelector("[data-mentor-count]");
  if(totalEl)totalEl.textContent=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:0,maximumFractionDigits:0});
  if(countEl)countEl.textContent=count+" "+(count===1?"tecnologia selecionada":"tecnologias selecionadas");
}
function mentorshipDetail(id){
  let selected=null;
  for(const t of Object.values(MENTOR_TRACKS)){selected=t.levels.find(l=>l[0]===id);if(selected)break;}
  if(!selected)return mentorshipPrices();
  const techs=selected[2].split(" · ");
  return '<main id="main-content" class="mentor-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KORCZAK TECHNOLOGY · MENTORIA</span><h1>'+esc(selected[1])+'<br><span>'+esc(selected[0].includes("front")?"Front-end":selected[0].includes("back")?"Back-end":"Full-stack")+'</span></h1><p>'+esc(selected[4])+'</p><div class="actions"><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Quero me inscrever '+icon("arrow")+'</a><a class="btn ghost" href="#/mentoria/precos">Ver preços</a></div></div><div class="mentor-price-hero"><small>Mensalidade</small><strong>'+mentorMoney(selected[3])+'</strong></div></section><section class="section shell split"><span class="eyebrow">01 · O QUE VOCÊ ESTUDA</span><div><h2>Trilha de '+esc(selected[1].toLowerCase())+'.</h2><p>Você desenvolve os fundamentos e práticas necessários para avançar nesta etapa da formação.</p><div class="mentor-tech-pills">'+techs.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div></div></section><section class="section shell mentor-cta"><span class="eyebrow">02 · INSCRIÇÃO</span><h2>Pronto para começar?</h2><p>Use o WhatsApp para confirmar disponibilidade e alinhar o início da mentoria.</p><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Inscrever-se pelo WhatsApp '+icon("external")+'</a></section></main>';
}

function servicePage(id){
  const safeId=Object.prototype.hasOwnProperty.call(READY_SERVICES,id)?id:"site";
  const s=READY_SERVICES[safeId]||READY_SERVICES.site;
  const serviceOptions=Array.isArray(s&&s[3])?s[3]:[];
  const prices=serviceOptionPrices({...s,3:serviceOptions});
  const includedIds=Array.isArray(SERVICE_INCLUDED[safeId])?SERVICE_INCLUDED[safeId]:[];
  const includedLabels={
    responsive:"Design responsivo",deployment:"Publicação do site",security:"Segurança básica",performance:"Desempenho otimizado",accessibility:"Acessibilidade",seo:"SEO inicial",sections:"Estrutura e seções necessárias",form:"Formulários básicos",analytics:"Métricas básicas",cookie:"Aviso e preferências de cookies",pages:"Páginas necessárias do site",blog:"Área de blog",forms:"Formulários",search:"Busca",filters:"Filtros",files:"Uploads e arquivos",auth:"Login e cadastro",roles:"Perfis e permissões básicas",faq:"FAQ / ajuda",reviews:"Avaliações",terms:"Termos de uso",privacy:"Política de privacidade",products:"Catálogo de produtos",dashboard:"Painel básico",payments:"Pagamentos",shipping:"Frete",inventory:"Estoque",orders:"Gestão de pedidos",customers:"Área do cliente",cart:"Carrinho",wishlist:"Lista de desejos",coupons:"Cupons",email:"Emails transacionais","shipping-tracking":"Acompanhamento de entrega",database:"Banco de dados",api:"API",notifications:"Notificações",audit:"Registro básico de ações",backup:"Backup",admin:"Painel administrativo",docs:"Documentação",webhooks:"Webhooks",storage:"Armazenamento","rate-limit":"Limite de requisições",mapping:"Mapeamento de dados",sync:"Sincronização",retry:"Tentativas automáticas",logs:"Logs básicos",workflow:"Workflow",n8n:"Base de automação n8n",conditions:"Condições",transform:"Transformação de dados",commands:"Comandos",buttons:"Menu interativo",handoff:"Atendimento humano",camera:"Câmera / mídia",store:"Publicação nas lojas"};
  const included=[...new Set(includedIds)].map(x=>'<li>'+esc(includedLabels[x]||x)+'</li>').join("");
  const opts=serviceOptions.map((o,i)=>{
    const price=prices[i];
    return '<div class="service-table-row" role="row"><div class="service-cell service-select" role="cell"><label class="service-option-check"><input type="checkbox" data-service-option data-price="'+price+'" data-label="'+esc(o[1])+'"><span class="checkmark" aria-hidden="true"></span></label></div><div class="service-cell service-feature" role="cell"><strong>'+esc(o[1])+'</strong><small>'+esc(o[2])+'</small></div><div class="service-cell service-explain" role="cell"><details class="service-option-info"><summary>O que isso faz?</summary><p>'+esc(beginnerExplanation(o))+'</p></details></div><div class="service-cell service-price-cell" role="cell"><span>Preço</span><b>'+money(price)+'</b></div></div>';
  }).join("");
  const cap=s[1]==null?"Sem teto fixo":"Teto máximo: "+money(s[1]);
  return '<main id="main-content" class="section shell commercial-config-page"><div class="service-config-head"><a class="text-link" href="#/comercial">← Voltar para serviços</a><span class="eyebrow">Configurador · '+esc(s[0])+'</span><h2>'+esc(s[0])+'</h2><p class="section-lead">'+esc(s[2])+' O serviço já inclui os fundamentos necessários; abaixo você pode adicionar apenas recursos realmente opcionais.</p></div><section class="service-included-panel"><span class="eyebrow">Já incluído</span><h3>O que vem no serviço.</h3><p class="muted">Estes recursos fazem parte da base deste tipo de projeto e não são cobrados novamente como adicionais.</p><ul class="service-included-list">'+included+'</ul></section><div class="service-config-layout"><section class="service-options-panel"><div class="config-panel-head"><div><span class="eyebrow">01 · Adicionais</span><h3>Recursos opcionais.</h3></div><span class="config-cap">'+cap+'</span></div><div class="service-pricing-table" role="table" aria-label="Recursos opcionais e preços">'+opts+'</div></section><aside class="service-summary"><span class="eyebrow">02 · Orçamento estimado</span><h3>Seu projeto</h3><div class="summary-start"><span>Valor atual</span><strong>R$ 0</strong></div><div class="summary-selected" data-service-selected><span>Nenhum recurso selecionado.</span></div><div class="summary-total"><span>Total estimado</span><strong data-service-total>R$ 0</strong></div><p class="muted">O valor exibido considera somente recursos opcionais selecionados. A base do serviço já contempla os itens listados acima.</p><button class="btn" type="button" data-service-request data-service-id="'+esc(safeId)+'">Fazer Orçamento '+icon("arrow")+'</button></aside></div></main>';
}


function updateServiceQuote(el){
  const panel=el.closest(".service-config-layout");
  if(!panel)return;
  let total=0;
  const selected=[];
  panel.querySelectorAll("[data-service-option]:checked").forEach(x=>{const p=Number(x.dataset.price)||0;total+=p;selected.push({label:x.dataset.label,price:p});});
  panel.querySelector("[data-service-selected]").innerHTML=selected.length?selected.map(x=>"<span>"+esc(x.label)+" <b>+"+money(x.price)+"</b></span>").join(""):"<span>Nenhum recurso selecionado.</span>";
  panel.querySelector("[data-service-total]").textContent=money(total);
}

function requestServiceQuote(btn){
  const s=READY_SERVICES[btn.dataset.serviceId]||READY_SERVICES.site,panel=btn.closest(".service-config-layout");
  if(!s||!panel)return;
  const selected=[...panel.querySelectorAll("[data-service-option]:checked")].map(x=>({label:x.dataset.label,price:Number(x.dataset.price)||0}));
  const total=selected.reduce((n,x)=>n+x.price,0);
  try{sessionStorage.setItem("kz_quote_request",JSON.stringify({service:s[0],total,selected}))}catch{}
  registrarAnalitica("interacao","Orçamento de serviço",{categoria:"comercial",subcategoria:"orcamentos",acao:"Preparou orçamento de serviço",descricao:"Configurou recursos opcionais para solicitar um orçamento.",entidade:"servico",entidadeId:btn.dataset.serviceId,metadados:{servico:s[0],total,recursos:selected}});
  location.hash="#/contato";
  toast("Configuração preparada para o contato.");
}

function commercial(){return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">01 · Área comercial</span><h2>Para quem quer conhecer, escolher e avançar.</h2><p class="section-lead">Escolha uma solução pronta e monte exatamente o que você precisa. Quanto mais recursos forem adicionados, maior será o orçamento estimado.</p><div class="actions"><a class="btn" href="#/produtos">Ver nosso portfólio '+icon("arrow")+'</a><a class="btn ghost" href="#/contato">Falar com a equipe</a></div></div><div class="section-heading commercial-services-heading"><span class="eyebrow">Serviços prontos</span><h3>Comece com uma base. Configure o restante.</h3><p class="section-lead">Cada serviço abre um painel próprio para escolher páginas, dashboards, termos, integrações, autenticação e outros recursos.</p></div><div class="service-grid"><article class="service-card"><span class="service-number">01</span><span class="eyebrow">Configuração personalizada</span><h4>Landing Page</h4><p class="muted">Página de campanha.</p><a class="text-link" href="#/servicos/landing-page">Configurar serviço →</a></article><article class="service-card"><span class="service-number">02</span><span class="eyebrow">Configuração personalizada</span><h4>Site Profissional</h4><p class="muted">Site institucional ou comercial.</p><a class="text-link" href="#/servicos/site">Configurar serviço →</a></article><article class="service-card"><span class="service-number">03</span><span class="eyebrow">Configuração personalizada</span><h4>E-commerce</h4><p class="muted">Loja virtual.</p><a class="text-link" href="#/servicos/ecommerce">Configurar serviço →</a></article><article class="service-card"><span class="service-number">04</span><span class="eyebrow">Configuração personalizada</span><h4>Aplicação Web / SaaS</h4><p class="muted">Sistema web personalizado.</p><a class="text-link" href="#/servicos/web-app">Configurar serviço →</a></article><article class="service-card"><span class="service-number">05</span><span class="eyebrow">Configuração personalizada</span><h4>Aplicativo Mobile</h4><p class="muted">Android e iOS.</p><a class="text-link" href="#/servicos/mobile">Configurar serviço →</a></article><article class="service-card"><span class="service-number">06</span><span class="eyebrow">Configuração personalizada</span><h4>API / Backend</h4><p class="muted">API ou backend próprio.</p><a class="text-link" href="#/servicos/api">Configurar serviço →</a></article><article class="service-card"><span class="service-number">07</span><span class="eyebrow">Configuração personalizada</span><h4>Integração de Sistemas</h4><p class="muted">Conexão entre sistemas.</p><a class="text-link" href="#/servicos/integration">Configurar serviço →</a></article><article class="service-card"><span class="service-number">08</span><span class="eyebrow">Configuração personalizada</span><h4>Automação de Processos</h4><p class="muted">Fluxos automatizados.</p><a class="text-link" href="#/servicos/automation">Configurar serviço →</a></article><article class="service-card"><span class="service-number">09</span><span class="eyebrow">Configuração personalizada</span><h4>Bot / Chatbot</h4><p class="muted">Atendimento e processos.</p><a class="text-link" href="#/servicos/bot">Configurar serviço →</a></article><article class="service-card"><span class="service-number">10</span><span class="eyebrow">Configuração personalizada</span><h4>Customização</h4><p class="muted">Alterações em sistema existente.</p><a class="text-link" href="#/servicos/customization">Configurar serviço →</a></article></div><div class="pricing-note"><span class="eyebrow">Como funciona</span><p class="muted">Os valores exibidos são referências iniciais. A configuração gera uma estimativa; a proposta final depende da análise técnica do escopo.</p></div></main>'}
function institutional(){
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">02 · Área institucional</span><h2>Para quem quer conhecer a Korczak por inteiro.</h2><p class="section-lead">Esta é a página inicial institucional. Aqui você entende quem somos, como pensamos, de onde viemos e como o ecossistema Korczak Technology é organizado.</p><div class="actions"><a class="btn" href="#/empresa">Conhecer a empresa '+icon("arrow")+'</a><a class="btn ghost" href="#/historia">Conhecer nossa história</a></div></div><div class="section-heading"><span class="eyebrow">O que você encontra aqui</span><h3>Conheça nossa base.</h3></div><div class="info-grid"><section class="info-card"><span class="eyebrow">01 · Empresa</span><h3>Quem somos.</h3><p class="muted">Nossa atuação em software, sistemas, produtos digitais e construção de tecnologia própria.</p><a class="text-link" href="#/empresa">Sobre a empresa '+icon("arrow")+'</a></section><section class="info-card"><span class="eyebrow">02 · História</span><h3>De onde viemos.</h3><p class="muted">Conheça a trajetória, as etapas de construção e a evolução dos projetos que formaram o ecossistema.</p><a class="text-link" href="#/historia">Nossa história '+icon("arrow")+'</a></section><section class="info-card"><span class="eyebrow">03 · Visão e valores</span><h3>Como pensamos.</h3><p class="muted">Entenda a visão de longo prazo e os princípios que orientam produto, engenharia e relacionamento.</p><div class="actions"><a class="text-link" href="#/visao">Visão '+icon("arrow")+'</a><a class="text-link" href="#/valores">Valores '+icon("arrow")+'</a></div></section><section class="info-card"><span class="eyebrow">04 · Ecossistema</span><h3>Como tudo se organiza.</h3><p class="muted">Veja como produtos de produtividade, operações, inteligência, desenvolvimento e conectividade se relacionam.</p><a class="text-link" href="#/portfolio">Explorar ecossistema '+icon("arrow")+'</a></section></div><div class="info-deep"><div><span class="eyebrow">Transparência</span><h3>O estágio de cada produto é explícito.</h3></div><p class="muted">Produtos em evolução ou desenvolvimento são apresentados dessa forma para diferenciar claramente o que já está disponível, o que está sendo construído e o que ainda depende de novas etapas.</p></div></main>';
}function portfolio(){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Portfólio</span><h2>O universo Korczak.</h2><p class="section-lead">Um conjunto de produtos e projetos que formam o ecossistema Korczak Technology. Explore cada iniciativa, seu propósito e estágio atual.</p></div><div class="grid">'+state.products.map(card).join("")+'</div></main>';
}

function products(){
 const kosIds=["korczak-ai","ide","morok","erp","flow","vision","ops","connect","mobile"];
 const wsIds=["documents","sheets","slides","drive","cloud","mail","calendar","meet","chat","forms","sites","tasks","keep"];
 const kos=kosIds.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
 const ws=wsIds.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Produtos · Catálogo</span><h2>Produtos e suítes Korczak.</h2><p class="section-lead">O Workspace é uma marca que reúne aplicativos de produtividade. O KOS reúne produtos operacionais.</p></div><section class="section-group"><div class="split-head"><div><span class="eyebrow">KORCZAK WORKSPACE</span><h3>Aplicativos do Workspace</h3></div><span class="muted">O Workspace não é um produto comprável</span></div><div class="workspace-grid">'+ws.map((p,i)=>'<article class="workspace-app '+(p.status==="Em construção"?"active":"planned")+'"><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="status">'+esc(p.status)+'</span><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(p.description)+'</p>'+(p.id==="documents"?'<a class="btn ghost" href="#/produto/documents">Ver planos</a>':p.status==="Planejado"?'<span class="plan-note">Assinar pré-venda</span>':"")+'</article>').join("")+'</div></section><section class="section-group"><div class="split-head"><div><span class="eyebrow">KOS · KORCZAK OPERATIONS SYSTEM</span><h3>Produtos operacionais</h3></div><span class="muted">'+kos.length+' produtos</span></div><div class="grid">'+kos.map(card).join("")+'</div></section></main>';
}
function workspace(){
 const ids=["documents","sheets","slides","drive","cloud","mail","calendar","meet","chat","forms","sites","tasks","keep"];
 const apps=ids.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
 return '<main id="main-content" class="section shell workspace-page"><div class="portfolio-hero"><span class="eyebrow">KORCZAK WORKSPACE · SUÍTE DE PRODUTIVIDADE</span><h2>Seu trabalho, em um único espaço.</h2><p class="section-lead">O Workspace reúne documentos, planilhas, arquivos, nuvem, email, agenda, reuniões, comunicação e outros aplicativos. Apenas o Documents está em construção.</p></div><section class="workspace-grid">'+apps.map((a,i)=>'<article class="workspace-app '+(a.status==="Em construção"?"active":"planned")+'"><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="status">'+esc(a.status)+'</span><h3>'+esc(a.name)+'</h3><p class="muted">'+esc(a.description)+'</p>'+(a.id==="documents"?'<a class="btn ghost" href="#/produto/documents">Ver planos</a>':a.status==="Planejado"?'<span class="plan-note">Assinar pré-venda</span>':"")+'</article>').join("")+'</section></main>';
}
function kos(){
 const ids=["korczak-ai","ide","morok","erp","flow","vision","ops","connect","mobile"];
 const items=ids.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
 return '<main id="main-content" class="section shell workspace-page"><div class="portfolio-hero"><span class="eyebrow">KOS · KORCZAK OPERATIONS SYSTEM</span><h2>Operação e produtos Korczak.</h2><p class="section-lead">Os únicos produtos iniciados no KOS são KORCZAK AI, Korczak IDE, MOROK e KORCZAK ERP. Os demais permanecem planejados.</p></div><section class="workspace-grid">'+items.map((p,i)=>'<article class="workspace-app '+(p.status==="Iniciado"?"active":"planned")+'"><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="status">'+esc(p.status)+'</span><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(p.description)+'</p>'+(p.status==="Iniciado"?'<span class="plan-note">Compra + mensalidade · condições em definição</span>':'<span class="plan-note">Assinar pré-venda</span>')+'</article>').join("")+'</section></main>';
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
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Empresa · Korczak Technology</span><h2>Uma startup técnica construída sobre arquitetura, engenharia e desenvolvimento.</h2><p class="section-lead">Há três anos, transformamos ideias em software por meio de um processo técnico estruturado: primeiro organizamos o problema, depois planejamos a solução e, então, desenvolvemos cada parte com espaço para evolução.</p></div><section class="section-group"><div class="split-head"><div><span class="eyebrow">01 · Arquitetura</span><h3>A estrutura antes da construção.</h3></div><span class="muted">Organizar · dividir · alinhar</span></div><div class="info-grid"><section class="info-card"><h3>Como funciona</h3><p class="muted">A arquitetura define a estrutura do projeto antes que sua construção avance. Identificamos os objetivos, componentes, dependências, fluxos e limites necessários para transformar uma ideia em uma solução organizada.</p></section><section class="info-card"><h3>Como fazemos</h3><p class="muted">Dividimos o projeto em fases pequenas e detalhadas. Cada fase possui uma finalidade clara e é apresentada ao cliente para que decisões, prioridades e próximos passos sejam compreendidos e alinhados antes do avanço.</p></section></div></section><section class="section-group"><div class="split-head"><div><span class="eyebrow">02 · Engenharia</span><h3>O planejamento que conecta as partes.</h3></div><span class="muted">Planejar · relacionar · preparar</span></div><div class="info-grid"><section class="info-card"><h3>Como funciona</h3><p class="muted">Depois da estruturação, a engenharia transforma a arquitetura em um plano técnico. Definimos o papel de cada componente, como as partes se comunicam, onde cada recurso se encaixa e quais dependências precisam ser consideradas.</p></section><section class="info-card"><h3>Como fazemos</h3><p class="muted">Planejamos pensando também no futuro: identificamos pontos de extensão, possíveis integrações e espaços para novas funcionalidades, evitando que uma atualização posterior exija reconstruir aquilo que já funciona.</p></section></div></section><section class="section-group"><div class="split-head"><div><span class="eyebrow">03 · Desenvolvimento</span><h3>A execução técnica da solução.</h3></div><span class="muted">Construir · testar · evoluir</span></div><div class="info-grid"><section class="info-card"><h3>Como funciona</h3><p class="muted">O desenvolvimento é a etapa em que o planejamento se transforma em software. Construímos os componentes definidos, conectamos suas responsabilidades e validamos o comportamento da solução ao longo da evolução do projeto.</p></section><section class="info-card"><h3>Como fazemos</h3><p class="muted">Trabalhamos por etapas, acompanhando o que foi definido, verificando o resultado e ajustando o necessário antes de avançar. Assim, o desenvolvimento permanece conectado à arquitetura e ao planejamento técnico.</p></section></div></section><section class="section-group"><div class="split-head"><div><span class="eyebrow">04 · Integração</span><h3>Uma visão única do projeto.</h3></div><span class="muted">Conectar · validar · evoluir</span></div><div class="info-grid"><section class="info-card"><h3>Como funciona</h3><p class="muted">As três disciplinas permanecem conectadas durante todo o ciclo. Decisões de arquitetura orientam a engenharia, a engenharia orienta o desenvolvimento e os resultados do desenvolvimento alimentam novas decisões.</p></section><section class="info-card"><h3>Como fazemos</h3><p class="muted">Mantemos documentação, decisões e prioridades próximas da execução. Isso permite identificar mudanças cedo, preservar contexto e preparar o projeto para novos ciclos sem perder sua estrutura.</p></section></div></section><section class="info-deep"><div><span class="eyebrow">Como tudo se conecta</span><h3>Arquitetura → Engenharia → Desenvolvimento.</h3></div><p class="muted">A arquitetura estabelece a base e divide o projeto. A engenharia organiza essa base em um plano técnico e prepara sua evolução. O desenvolvimento executa esse plano e devolve informações para validação e próximos ciclos. As três áreas trabalham como partes de um mesmo processo, mantendo decisões, execução e evolução alinhadas.</p></section><div class="actions"><a class="btn" href="#/produtos">Conhecer nossos projetos '+icon("arrow")+'</a><a class="btn ghost" href="#/contato">Falar com a equipe</a></div></main>';
}
function historyPage(){
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">História · Desde 2023</span><h2>Uma ideia de comunidade que se transformou em uma startup de tecnologia.</h2><p class="section-lead">A história da Korczak Technology começou com a vontade de criar um espaço para pessoas interessadas em programação, tecnologia e cultura digital. Desde então, essa ideia evoluiu para uma trajetória de estudo, construção e projetos reais.</p></div><div class="timeline"><article class="info-card"><span class="eyebrow">2023 · Origem</span><h3>O início com Raphael Korczak e Akira.</h3><p class="muted">Em 2023, os dois fundadores imaginaram um ambiente que aproximasse programadores, brasileiros e pessoas que queriam aprender e participar do universo tecnológico, incluindo sua cultura e seus meios futuristas.</p></article><article class="info-card"><span class="eyebrow">2023 · Rede Moon</span><h3>O primeiro projeto da Korczak Technologies.</h3><p class="muted">A ideia ganhou forma com a Rede Moon, uma grande comunidade no Discord voltada a diferentes interesses e nichos. O projeto reunia pessoas interessadas em animes, jogos, esportes e outros temas, chegando a administrar aproximadamente dez servidores simultaneamente.</p></article><article class="info-card"><span class="eyebrow">2024 · Uma nova fase</span><h3>Akira segue seu próprio caminho.</h3><p class="muted">Em 2024, Akira deixou de participar da operação para seguir sua própria trajetória. A contribuição feita até aquele momento permaneceu como parte da origem e do legado que ajudaram a formar a Korczak.</p></article><article class="info-card"><span class="eyebrow">Desde então · Continuidade</span><h3>Estudar, construir e transformar ideias em realidade.</h3><p class="muted">A Korczak continuou avançando, estudando novas tecnologias e transformando a visão inicial em uma startup técnica. Os sonhos continuam importantes, mas passaram a caminhar ao lado de algo concreto: projetos desenvolvidos, produtos estruturados e uma base tecnológica em evolução.</p></article></div><section class="info-deep"><div><span class="eyebrow">O que permanece</span><h3>Do espírito de comunidade à construção de tecnologia.</h3></div><p class="muted">A origem continua influenciando nossa forma de trabalhar: curiosidade, aprendizado e vontade de construir. A diferença é que hoje essa visão se materializa em arquitetura, engenharia, desenvolvimento e produtos próprios.</p></section><section class="info-deep"><div><span class="eyebrow">Soberania Brasileira</span><h3>Construir tecnologia também é ampliar possibilidades para o Brasil.</h3></div><p class="muted">A Korczak Technology nasceu com a intenção de contribuir para um mercado tecnológico brasileiro mais forte. Grande parte das ferramentas digitais utilizadas no cotidiano brasileiro é criada por empresas estrangeiras. Nosso objetivo é ampliar esse cenário, desenvolvendo software e produtos próprios no Brasil e criando mais oportunidades para profissionais, empresas e usuários brasileiros participarem da construção da tecnologia que utilizam.</p><p class="muted">Para nós, soberania tecnológica não significa isolamento. Significa ter capacidade própria para criar, adaptar, manter e evoluir soluções, além de fortalecer conhecimento, mercado e oportunidades dentro do país. Queremos que o Brasil não seja apenas consumidor de tecnologia, mas também um lugar onde tecnologia relevante seja projetada, desenvolvida e colocada em circulação.</p></section><div class="actions"><a class="btn" href="#/empresa">Conhecer como trabalhamos '+icon("arrow")+'</a><a class="btn ghost" href="#/produtos">Ver projetos</a></div></main>';
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
  return '<main id="main-content" class="auth-page"><section class="auth-shell"><div class="auth-brand"><img src="./assets/mark.svg" alt="" aria-hidden="true"><span>KORCZAK TECHNOLOGY</span></div><div class="auth-copy"><span class="eyebrow">Acesso seguro</span><h1>'+(loginMode?"Entre no seu ecossistema.":"Crie sua conta Korczak.")+'</h1><p>'+(loginMode?"Entre para acessar produtos, orçamento, pedidos e seu perfil.":"Crie sua conta para acessar o ecossistema Korczak, acompanhar solicitações e utilizar os recursos disponíveis.")+'</p></div><div class="auth-card"><div class="auth-tabs"><button class="'+(loginMode?"active":"")+'" type="button" data-action="auth-mode" data-mode="login">Entrar</button><button class="'+(!loginMode?"active":"")+'" type="button" data-action="auth-mode" data-mode="register">Criar conta</button></div><form class="auth-form" id="auth-form" data-mode="'+(loginMode?"login":"register")+'" novalidate>'+(!loginMode?'<label><span>Nome</span><input class="field" name="name" autocomplete="name" placeholder="Seu nome" required></label>':"")+'<label><span>Email</span><input class="field" name="email" type="email" autocomplete="email" placeholder="seu@email.com" required></label><label><span>Senha</span><input class="field" name="password" type="password" autocomplete="'+(loginMode?"current-password":"new-password")+'" placeholder="Mínimo de 8 caracteres" minlength="8" required></label><button class="btn auth-submit" type="submit">'+(loginMode?"Entrar":"Criar minha conta")+' '+icon("arrow")+'</button><small id="auth-message" class="form-note" role="status">'+esc(message)+'</small></form><p class="auth-terms">Ao continuar, você concorda com as <a href="#/privacidade">informações de privacidade</a> e as <a href="#/uso">regras de uso</a>.</p></div></section></main>';
}

function account(){
  if(!state.token){if(!state.authMode)state.authMode="login";return authPage(state.authMode,state.authMessage||"");}
  const u=state.user||{},initial=esc((u.name||"K").slice(0,1).toUpperCase());
  const quoteRows=state.quotes.length?state.quotes.map(q=>'<div class="profile-row"><span>'+esc(q.productId)+'</span><strong>'+esc(q.status||"pending")+'</strong><small class="muted">'+new Date(q.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma solicitação de orçamento ainda.</div>';
  const orderRows=state.orders.length?state.orders.map(o=>'<div class="profile-row"><span>'+esc(o.productId)+'</span><strong>'+esc(o.status||"checkout_created")+'</strong><small class="muted">'+new Date(o.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma compra registrada.</div>';
  return '<main id="main-content" class="section shell"><span class="eyebrow">Meu perfil</span><h2>Minha conta.</h2><div class="profile"><aside class="profile-aside"><div class="profile-avatar" aria-hidden="true">'+initial+'</div><h3>'+esc(u.name||"Usuário")+'</h3><p class="muted">'+esc(u.email||"")+'</p><span class="status">'+esc(u.role||"user")+'</span></aside><section class="profile-main"><div class="profile-row"><span class="muted">Nome</span><strong>'+esc(u.name||"—")+'</strong></div><div class="profile-row"><span class="muted">Email</span><strong>'+esc(u.email||"—")+'</strong></div><div class="profile-row"><span class="muted">Perfil</span><strong>'+esc(u.role||"user")+'</strong></div><div class="profile-row"><span class="muted">Verificação</span><strong>'+((u.verified)?"Verificado":"Pendente")+'</strong></div><div class="actions"><a class="btn ghost" href="#/contato">Falar com a equipe</a><button class="btn" type="button" data-action="logout">Sair</button></div></section></div><div class="rule"></div><div class="split"><section><span class="eyebrow">Orçamentos</span><h3>Histórico comercial</h3>'+quoteRows+'</section><section><span class="eyebrow">Pedidos</span><h3>Histórico de compras</h3>'+orderRows+'</section></div></main>';
}

function infoPage(title,kicker,body,sections=[]){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">'+esc(kicker)+'</span><h2>'+esc(title)+'.</h2><p class="section-lead">'+esc(body)+'</p><div class="info-meta"><span>01 · Estratégia</span><span>02 · Produto</span><span>03 · Engenharia</span></div></div>'+(sections.length?'<div class="info-grid">'+sections.map((x,i)=>'<section class="info-card"><span class="eyebrow">'+String(i+1).padStart(2,"0")+' · '+esc(x[0])+'</span><h3>'+esc(x[1])+'</h3><p class="muted">'+esc(x[2])+'</p><a class="text-link" href="#/contato">Falar com a equipe '+icon("arrow")+'</a></section>').join('')+'</div>':'')+'<section class="info-deep"><div><span class="eyebrow">Perspectiva</span><h3>Construção contínua, decisões claras.</h3></div><p class="muted">A Korczak Technology estrutura seus projetos em etapas para que produto, engenharia, experiência e operação possam evoluir com contexto, documentação e objetivos mensuráveis.</p></section><div class="actions"><a class="btn" href="#/produtos">Explorar produtos '+icon("arrow")+'</a><a class="btn ghost" href="#/contato">Entrar em contato</a></div></main>';
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
  return '<footer class="footer"><div class="shell footer-grid"><div class="footer-company"><strong>KORCZAK TECHNOLOGY</strong><span>Software, sistemas e produtos digitais.</span><div class="footer-contact"><a href="tel:+5511954083183" aria-label="Ligar para Raphael">Raphael: +55 (11) 95408-3183</a><a href="mailto:SAC.korczak.tecnologies@gmail.com">SAC: SAC.korczak.tecnologies@gmail.com</a><a href="mailto:korczaktechnology@gmail.com">Comercial: korczaktechnology@gmail.com</a></div></div><div class="footer-social"><span>Redes sociais</span><div class="social-links"><a class="social-link" href="https://www.instagram.com/korczak_.tech/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @korczak_.tech"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg><span>Instagram · @korczak_.tech</span></a><a class="social-link" href="https://www.facebook.com/people/Korczak-Technologies/61593956412109/" target="_blank" rel="noopener noreferrer" aria-label="Facebook Korczak Technologies"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.9-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z"></path></svg><span>Facebook · Korczak Technologies</span></a></div></div><div class="footer-legal"><span>© '+new Date().getFullYear()+' Korczak Technology</span><span class="footer-links"><a href="#/privacidade">Privacidade</a><a href="#/uso">Uso</a><a href="#/servico">Serviço</a></span></div></div></footer>';
}

function render(){
  const h=location.hash.startsWith("#/")?location.hash.slice(1):"/";
  if(!root)return;
  try{
  const pages={
    "/sobre":()=>infoPage("Sobre nós","Empresa","Tecnologia com propósito, engenharia enxuta e produtos próprios.",[
      ["Identidade","Korczak Technology","Uma empresa orientada à construção de software, sistemas e produtos digitais próprios."],
      ["Atuação","Ecossistema","Produtos independentes que também podem trabalhar em conjunto conforme a necessidade."],
      ["Princípio","Clareza","Interfaces compreensíveis, responsabilidades bem definidas e evolução técnica documentada."]
    ]),
    "/historia":()=>historyPage(),
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
  if(h==="/acesso")c=authPage(state.authMode||"login",state.authMessage||"");
  else if(h==="/conta"&&!state.authenticated)c=authPage(state.authMode||"login");
  else if(h==="/")c=home();
  else if(h==="/comercial")c=commercial();
  else if(h==="/mentoria")c=mentorshipPage();
  else if(h==="/mentoria/precos")c=mentorshipPrices();
  else if(h.startsWith("/mentoria/"))c=mentorshipDetail(decodeURIComponent(h.split("/")[2]||""));
  else if(h.startsWith("/servicos/")){let serviceId="site";try{serviceId=decodeURIComponent(h.split("/")[2]||"site")}catch{}c=servicePage(serviceId);}
  else if(h==="/institucional")c=institutional();
  else if(h==="/portfolio")c=portfolio();
  else if(h==="/produtos")c=products();
  else if(h==="/empresa")c=company();
  else if(h==="/workspace")c=workspace();
  else if(h==="/kos")c=kos();
  else if(pages[h])c=pages[h]();
  else if(h==="/contato")c=contact();
  else if(h==="/conta")c=account();
  else if(h==="/checkout/sucesso")c=checkoutState("sucesso");
  else if(h==="/checkout/cancelado")c=checkoutState("cancelado");
  else if(h==="/privacidade")c=legal("privacidade");
  else if(h==="/uso")c=legal("uso");
  else if(h==="/servico")c=legal("servico");
  else if(h.startsWith("/produto/")){
    let productId="";
    try{productId=decodeURIComponent(h.split("/")[2]||"")}catch{}
    c=product(productId);
  }
  else c=infoPage("Página não encontrada","KZ Tech","A página solicitada não existe ou foi movida.",[["Navegação","Voltar ao ecossistema","Use a navegação para explorar a empresa, os produtos e os canais de contato."]]);
  root.innerHTML=(h!=="/conta"||state.authenticated)?nav()+c+footer():c;initMoon();
  const authForm=root.querySelector("#auth-form");
  if(authForm)authForm.addEventListener("submit",submitAuth);
  root.querySelectorAll("[data-service-option]").forEach(el=>el.addEventListener("change",()=>updateServiceQuote(el)));
  root.querySelectorAll("[data-mentor-tech]").forEach(el=>el.addEventListener("change",()=>{updateMentorTotal(el);if(el.checked)registrarAnalitica("interacao","Tecnologia selecionada",{categoria:"comercial",subcategoria:"mentorias",acao:"Selecionou tecnologia para a mentoria",descricao:"Selecionou uma tecnologia na grade personalizada da Mentoria.",entidade:"tecnologia",entidadeId:el.closest(".mentor-tech-row")?.querySelector("b")?.textContent||""});}));
  document.body.classList.toggle("menu-open",state.menu);
  document.body.classList.remove("loading");
  const titleMap={"/":"KORCZAK TECHNOLOGY","/comercial":"Comercial","/mentoria":"Mentoria","/mentoria/precos":"Preços da Mentoria","/institucional":"Institucional","/empresa":"Empresa","/portfolio":"Portfólio","/produtos":"Produtos","/workspace":"Korczak Workspace","/kos":"KOS","/contato":"Contato","/conta":"Meu perfil","/historia":"História","/visao":"Visão","/valores":"Valores","/parcerias":"Parcerias","/carreiras":"Carreiras","/faq":"FAQ","/privacidade":"Privacidade","/uso":"Uso","/servico":"Serviço"};
  let detail=null;
  if(h.startsWith("/produto/")){
    try{detail=state.products.find(x=>x.id===decodeURIComponent(h.split("/")[2]||""))?.name||null}catch{}
  }
  document.title="KORCZAK TECHNOLOGY"+(detail?" · "+detail:(titleMap[h]?" · "+titleMap[h]:""));
  if(state.menu)document.querySelector(".sidebar")?.focus?.();
  }catch(error){
    console.error("Render error:",error);
    root.innerHTML=nav()+`<main id="main-content" class="section shell"><span class="eyebrow">KZ Tech</span><h2>Não foi possível carregar esta página.</h2><p class="section-lead">O conteúdo encontrou um erro inesperado. Recarregue a página ou volte ao início.</p><div class="actions"><a class="btn" href="#/">Voltar ao início</a><button class="btn ghost" type="button" data-action="reload">Recarregar</button></div></main>`+footer();
  }
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
  if(action==="register"){state.authMode="register";state.authMessage="";location.hash="#/acesso";render();return true}
  if(action==="auth-mode"){state.authMode=target.closest("[data-action]").dataset.mode;state.authMessage="";render();return true}
  if(action==="reload"){location.reload();
registrarPaginaAtual();
load();return true}
  if(action==="quote"){quote(target.closest("[data-action]").dataset.product);return true}
  if(action==="checkout"){checkout(target.closest("[data-action]").dataset.product);return true}
  return false;
}

document.addEventListener("click",e=>{const q=e.target.closest("[data-service-request]");if(q){e.preventDefault();requestServiceQuote(q);return}if(handleAction(e.target))e.preventDefault()});
async function submitAuth(e){
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
    const d=await api(mode==="login"?"/api/auth/login":"/api/auth/register",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:new URLSearchParams(payload).toString()});
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
document.addEventListener("submit",e=>{
  if(e.target.id==="contact-form")sendContact(e);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&state.menu)closeMenu();
});
function classificarInteracao(alvo,texto){
  const href=String(alvo?.getAttribute?.("href")||""),t=texto.toLowerCase();
  if(/criar minha conta|criar conta/.test(t))return ["contas","cadastros","Criar conta","Iniciou o fluxo de criação de conta."];
  if(/^entrar\b/.test(t)||t==="login")return ["contas","logins","Entrar","Iniciou o fluxo de login."];
  if(/meu perfil/.test(t))return ["contas","perfil","Abrir perfil","Abriu o perfil da conta."];
  if(/quero me inscrever|inscrever-se/.test(t))return ["comercial","mentorias","Inscrição na mentoria","Demonstrou interesse em se inscrever na Mentoria."];
  if(/solicitar orçamento|fazer orçamento|orçamento/.test(t))return ["comercial","orcamentos","Solicitar orçamento","Iniciou uma solicitação de orçamento."];
  if(/\bcomprar\b/.test(t))return ["comercial","compras","Comprar","Iniciou uma compra."];
  if(/contato|falar com a equipe/.test(t))return ["comercial","contato","Falar com a equipe","Abriu um canal de contato comercial."];
  if(/mentoria/.test(href)||/mentoria/.test(t))return ["comercial","mentorias","Mentoria","Navegou pela Mentoria."];
  if(/servicos/.test(href)||/configurar serviço/.test(t))return ["comercial","servicos","Configurar serviço","Abriu a configuração de um serviço."];
  if(/produto/.test(href)||/portfólio|catálogo/.test(t))return ["comercial","produtos","Explorar produto","Explorou produtos do catálogo."];
  if(/institucional|empresa|história|visão|valores|parcerias|carreiras|faq/.test(href))return ["institucional","navegacao","Navegação institucional","Navegou por uma página institucional."];
  return ["interacoes","geral",texto||"Interação","Interagiu com um elemento do site."];
}
function categoriaPagina(pagina){
  if(/\/mentoria/.test(pagina)||/\/produto|\/comercial|\/servicos|\/workspace|\/kos/.test(pagina))return "comercial";
  if(/\/conta|\/acesso/.test(pagina))return "contas";
  if(/\/sobre|\/historia|\/visao|\/valores|\/parcerias|\/carreiras|\/faq|\/institucional|\/empresa/.test(pagina))return "institucional";
  return "interacoes";
}
function registrarAnalitica(tipo="visualizacao",evento="",extra={}){
  try{
    const id=localStorage.getItem("kz_visitante")||crypto.randomUUID();localStorage.setItem("kz_visitante",id);
    const pagina=location.hash.replace(/^#/,"")||"/",ua=navigator.userAgent;
    const navegador=/Edg/i.test(ua)?"Edge":/Chrome/i.test(ua)?"Chrome":/Firefox/i.test(ua)?"Firefox":/Safari/i.test(ua)?"Safari":"Outro";
    const sistema=/Android/i.test(ua)?"Android":/iPhone|iPad|iPod/i.test(ua)?"iOS":/Windows/i.test(ua)?"Windows":/Mac OS/i.test(ua)?"macOS":/Linux/i.test(ua)?"Linux":"Outro";
    const dispositivo=/Mobi|Android/i.test(ua)?"mobile":"desktop";
    const payload={pagina,tipo,categoria:extra.categoria||categoriaPagina(pagina),subcategoria:extra.subcategoria||"geral",acao:extra.acao||evento,descricao:extra.descricao||"",usuarioId:String(state.user?._id||""),nome:state.user?.name||"",email:state.user?.email||"",entidade:extra.entidade||"",entidadeId:extra.entidadeId||"",metadados:extra.metadados||{},caminho:location.href,titulo:document.title,referencia:id,dispositivo,navegador,sistema,idioma:navigator.language,largura:innerWidth,altura:innerHeight,evento};
    fetch("https://kztechsite.onrender.com/api/analiticas/evento",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});
  }catch{}
}
addEventListener("hashchange",()=>{if(state.menu)state.menu=false;render();window.scrollTo({top:0,behavior:"smooth"});registrarPaginaAtual()});
let ultimaPaginaAnalitica="";
function registrarPaginaAtual(){
  const pagina=location.hash.replace(/^#/, "")||"/";
  if(pagina===ultimaPaginaAnalitica)return;
  ultimaPaginaAnalitica=pagina;
  setTimeout(()=>registrarAnalitica("visualizacao"),150);
}
document.addEventListener("click",e=>{
  const alvo=e.target.closest("a,button,[data-action]");if(!alvo)return;
  const texto=(alvo.textContent||"").replace(/\s+/g," ").trim().slice(0,100);if(!texto)return;
  const [categoria,subcategoria,acao,descricao]=classificarInteracao(alvo,texto);
  registrarAnalitica("interacao",acao,{categoria,subcategoria,acao,descricao});
});


async function load(){
  if(!root)return;
  document.body.classList.add("loading");
  state.authenticated=false;
  if(!state.authMode)state.authMode="login";
  render();
  if(state.token){
    try{
      state.user=state.user||await api("/api/me");
      state.authenticated=true;
    }catch{
      state.token=null;state.user=null;localStorage.removeItem("kz_token");
    }
  }
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
    }catch(x){
      if(x?.message==="Não autenticado"||x?.message==="Sessão inválida"||x?.message==="Usuário não encontrado"){
        localStorage.removeItem("kz_token"); state.token=null; state.user=null;
      }
      state.quotes=[]; state.orders=[];
    }
  }
  render();
  document.body.classList.remove("loading");
}
load();
