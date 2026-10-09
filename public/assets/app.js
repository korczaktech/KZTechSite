const API_URL="https://kztechsite.onrender.com";
const API_TIMEOUT_MS=30000;
window.addEventListener("DOMContentLoaded",()=>{if(!document.querySelector("#app")?.innerHTML.trim()){try{render()}catch{document.querySelector("#app").innerHTML="<main style=\"min-height:100vh;display:grid;place-items:center;padding:40px;color:#fff;font:16px system-ui;background:#050505\"><div><h1>KORCZAK TECHNOLOGIES</h1><p>Carregando a interface…</p></div></main>"}}});
const APP_VERSION="2026.10.04.8";
const root=document.querySelector("#app");
const FALLBACK_PRODUCTS=[];
const PLAN_CATALOG={};

const MODULAR_CATALOG={};

const state={token:localStorage.getItem("kz_token"),user:null,content:{},products:FALLBACK_PRODUCTS,plans:PLAN_CATALOG,quotes:[],orders:[],menu:false,authenticated:false,authMode:"login",authMessage:""};

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

function cmsPage(id){const raw=state.content?.pages?.[id]?.html;if(!raw)return "";return String(raw).replace(/\{\{ARROW\}\}/g,icon("arrow")).replace(/\{\{EXTERNAL\}\}/g,icon("external")).replace(/\{\{MENTOR_WHATSAPP\}\}/g,typeof MENTOR_WHATSAPP==="string"?MENTOR_WHATSAPP:"#/contato");}
function cmsInfoPage(id){const p=state.content?.pages?.info?.[id];if(!p)return infoPage("Página não encontrada","KZ Tech","O conteúdo desta página ainda não foi configurado.");return infoPage(p.title,p.kicker,p.body,p.sections||[]);}


const links=[
  ["/","Início"],["/mentoria","Mentoria"],["/comercial","Comercial"],["/pre-venda","Pré-venda"],["/institucional","Institucional"],
  ["/produtos","Produtos"],["/historia","História"],["/visao","Visão"],["/valores","Valores"],["/parcerias","Parcerias"],
  ["/carreiras","Carreiras"],["/faq","FAQ"],["/contato","Contato"],["/conta","Meu perfil"]
];

function nav(){
  const h=(location.hash.startsWith("#/")?location.hash.slice(1):"/").split("?")[0];
  const active=p=>h===p||(p!=="/"&&h.startsWith(p));
  const group=(title,items,offset)=>'<div class="side-section">'+title+'</div>'+items.map(([p,n],i)=>
    '<a class="side-link '+(active(p)?"active":"")+'" aria-current="'+(active(p)?"page":"false")+'" href="#'+p+'" data-action="close-menu"><span>'+n+'</span><span class="side-arrow">'+String(offset+i+1).padStart(2,"0")+'</span></a>'
  ).join("");
  return '<div class="site-background" aria-hidden="true"><svg viewBox="0 0 1600 900" preserveAspectRatio="none"><defs><radialGradient id="fogA"><stop stop-color="#8d6cff" stop-opacity=".22"/><stop offset=".55" stop-color="#473b75" stop-opacity=".09"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><radialGradient id="fogB"><stop stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="#050505"/><ellipse cx="1180" cy="260" rx="650" ry="300" fill="url(#fogA)"/><ellipse cx="390" cy="700" rx="600" ry="250" fill="url(#fogA)"/><ellipse cx="850" cy="500" rx="700" ry="190" fill="url(#fogB)" opacity=".5"/><path d="M-100 560 C240 420 430 690 760 535 S1240 410 1700 560" fill="none" stroke="#b9adff" stroke-opacity=".10" stroke-width="2"/><path d="M-100 650 C260 510 500 800 830 625 S1290 500 1700 650" fill="none" stroke="#fff" stroke-opacity=".055" stroke-width="1"/><g fill="#fff" opacity=".65"><circle cx="100" cy="130" r="1.4"/><circle cx="250" cy="310" r="1"/><circle cx="420" cy="100" r="1.2"/><circle cx="620" cy="250" r="1"/><circle cx="850" cy="120" r="1.3"/><circle cx="1050" cy="340" r="1"/><circle cx="1280" cy="100" r="1.3"/><circle cx="1480" cy="300" r="1"/></g></svg></div></div><header class="nav"><div class="shell"><a class="brand" href="#/" aria-label="Korczak Technologies — início"><img class="brand-mark" src="./assets/mark.svg" alt="" aria-hidden="true">KORCZAK TECHNOLOGIES</a><button class="menu-toggle '+(state.menu?"active":"")+'" type="button" aria-label="'+(state.menu?"Fechar navegação":"Abrir navegação")+'" aria-expanded="'+state.menu+'" aria-controls="site-sidebar" data-action="toggle-menu"><span class="menu-icon" aria-hidden="true"></span><span class="pulse" aria-hidden="true"></span></button></div></header>'+
    '<div class="sidebar-backdrop '+(state.menu?"open":"")+'" data-action="close-menu" aria-hidden="true"></div>'+
    '<aside id="site-sidebar" class="sidebar '+(state.menu?"open":"")+'" aria-label="Navegação principal" aria-hidden="'+(!state.menu)+'"'+(!state.menu?' inert':'')+'><div class="side-head"><div><small>Navegação</small></div><small>KZ / 01</small></div><nav class="side-nav">'+
    group("Principal",links.slice(0,5),0)+group("Ecossistema",links.slice(5,9),5)+group("Empresa & suporte",links.slice(9),9)+
    '</nav><div class="side-footer">Korczak Technologies · Sistemas, software e produtos digitais.</div></aside>';
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

function home(){return cmsPage("home")}
const READY_SERVICES={};const OPTION_DIFFICULTY={};
const OPTION_NEED={};
const SERVICE_EXTRAS={};

const SERVICE_INCLUDED={};

function normalizeServiceCatalog(){
  Object.keys(SERVICE_INCLUDED).forEach(serviceId=>{
    const included=new Set(SERVICE_INCLUDED[serviceId]||[]);
    if(READY_SERVICES[serviceId])READY_SERVICES[serviceId][3]=(READY_SERVICES[serviceId][3]||[]).filter(option=>!included.has(option[0]));
    if(SERVICE_EXTRAS[serviceId])SERVICE_EXTRAS[serviceId]=SERVICE_EXTRAS[serviceId].filter(option=>!included.has(option[0]));
  });
  Object.keys(READY_SERVICES).forEach(k=>{
    const base=READY_SERVICES[k][3]||[],existing=new Set(base.map(o=>o[0]));
    (SERVICE_EXTRAS[k]||[]).forEach(o=>{if(!existing.has(o[0]))base.push([o[0],o[1],o[2],o[3],OPTION_DIFFICULTY[o[0]]||6]);});
  });
}
normalizeServiceCatalog();


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
  return '<main id="main-content" class="mentor-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KORCZAK TECHNOLOGIES · FORMAÇÃO · PRÁTICA</span><h1>Mentoria<br><span>Korczak.</span></h1><p>Aprenda tecnologia construindo um projeto real, com acompanhamento e orientação profissional.</p><div class="actions"><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Quero me inscrever '+icon("arrow")+'</a><a class="btn ghost" href="#/mentoria/precos">Calcular mensalidade '+icon("arrow")+'</a></div></div><div class="mentor-monogram" aria-hidden="true">M</div></section><section class="section shell split"><span class="eyebrow">01 · A MENTORIA</span><div><h2>Formação técnica prática e acompanhada.</h2><p>A mentoria foi criada para quem quer aprender programação colocando o conhecimento em prática. O conteúdo é definido de acordo com a trilha, as tecnologias e o projeto que você deseja desenvolver.</p><p>A mensalidade pode partir de <strong>R$ 100/mês</strong> em uma grade personalizada, enquanto as trilhas prontas possuem valores próprios.</p></div></section><section class="section shell"><span class="eyebrow">02 · COMO FUNCIONA</span><div class="grid mentor-feature-grid"><article class="card"><span class="card-index">01</span><h3>Projeto real</h3><p>Você aplica os conhecimentos em um projeto desenvolvido ao longo da mentoria.</p></article><article class="card"><span class="card-index">02</span><h3>Acompanhamento</h3><p>O aprendizado acontece com orientação, revisão e direcionamento técnico.</p></article><article class="card"><span class="card-index">03</span><h3>Trilha definida</h3><p>Escolha Front-end, Back-end, Full-stack ou monte uma grade personalizada.</p></article><article class="card"><span class="card-index">04</span><h3>Formação prática</h3><p>O objetivo é transformar estudo em capacidade de construir e evoluir projetos.</p></article></div></section><section class="section shell split"><span class="eyebrow">03 · ESTRUTURA</span><div><h2>Um caminho de estudo com objetivo claro.</h2><p>As trilhas possuem níveis iniciante, intermediário e profissional. O nível escolhido define as tecnologias e a profundidade esperada.</p><p>Também é possível montar uma grade própria selecionando as tecnologias desejadas.</p></div></section><section class="section shell mentor-cta"><span class="eyebrow">04 · PRÓXIMO PASSO</span><h2>Escolha sua formação.</h2><p>Veja os valores, compare as trilhas e calcule uma grade personalizada.</p><div class="actions"><a class="btn" href="#/mentoria/precos">Ver preços e calcular '+icon("arrow")+'</a><a class="btn ghost" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Inscrever-se pelo WhatsApp '+icon("external")+'</a></div></section></main>';
}
function mentorshipPrices(){
  const tracks=Object.values(MENTOR_TRACKS).map(t=>'<article class="mentor-track-card"><span class="eyebrow">TRILHA</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.description)+'</p><div class="mentor-level-list">'+t.levels.map(l=>'<a class="mentor-price-row" href="#/mentoria/'+encodeURIComponent(l[0])+'"><span><b>'+esc(l[1])+'</b><small>'+esc(l[2])+'</small></span><strong>'+mentorMoney(l[3])+'</strong><span class="side-arrow">→</span></a>').join("")+'</div></article>').join("");
  const techs=MENTOR_TECHS.map(t=>'<label class="mentor-tech-row"><span><b>'+esc(t[0])+'</b><small>'+esc(t[1])+'</small></span><strong>+ '+mentorMoney(t[2]).replace("/mês","")+'</strong><input type="checkbox" data-mentor-tech data-price="'+t[2]+'"><span class="mentor-toggle" aria-hidden="true"></span></label>').join("");
  return '<main id="main-content" class="mentor-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KORCZAK TECHNOLOGIES · MENTORIA · INVESTIMENTO</span><h1>Quanto<br><span>custa?</span></h1><p>Escolha uma trilha pronta ou monte sua própria grade de estudos.</p></div><div class="mentor-monogram" aria-hidden="true">R$</div></section><section class="section shell"><span class="eyebrow">01 · TRILHAS</span><h2>Escolha seu caminho.</h2><p class="section-lead">Cada trilha possui uma formação diferente, com três níveis: iniciante, intermediário e profissional.</p><div class="mentor-track-grid">'+tracks+'</div></section><section class="section shell mentor-custom"><div class="mentor-custom-head"><div><span class="eyebrow">02 · MINHA PRÓPRIA GRADE</span><h2>Monte do seu jeito.</h2><p>Começa em R$ 100/mês e aumenta conforme as tecnologias escolhidas.</p></div><div class="mentor-total"><small>TOTAL MENSAL</small><strong data-mentor-total>R$ 100</strong><span data-mentor-count>0 tecnologias selecionadas</span></div></div><div class="mentor-tech-list">'+techs+'</div></section><section class="section shell split"><span class="eyebrow">03 · VALORES</span><div><h2>Formação técnica com preço acessível.</h2><p>Os valores exibidos são mensalidades da mentoria. A grade personalizada começa em R$ 100/mês e recebe os acréscimos correspondentes às tecnologias selecionadas.</p></div></section><section class="section shell mentor-cta"><span class="eyebrow">04 · INSCRIÇÃO</span><h2>Escolheu sua trilha?</h2><p>Fale diretamente com a Korczak Technologies para confirmar sua formação.</p><div class="actions"><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Quero me inscrever '+icon("arrow")+'</a><a class="btn ghost" href="#/mentoria">Voltar para Mentoria</a></div></section></main>';
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
  return '<main id="main-content" class="mentor-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KORCZAK TECHNOLOGIES · MENTORIA</span><h1>'+esc(selected[1])+'<br><span>'+esc(selected[0].includes("front")?"Front-end":selected[0].includes("back")?"Back-end":"Full-stack")+'</span></h1><p>'+esc(selected[4])+'</p><div class="actions"><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Quero me inscrever '+icon("arrow")+'</a><a class="btn ghost" href="#/mentoria/precos">Ver preços</a></div></div><div class="mentor-price-hero"><small>Mensalidade</small><strong>'+mentorMoney(selected[3])+'</strong></div></section><section class="section shell split"><span class="eyebrow">01 · O QUE VOCÊ ESTUDA</span><div><h2>Trilha de '+esc(selected[1].toLowerCase())+'.</h2><p>'+esc(selected[4])+'</p><div class="mentor-tech-pills">'+techs.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div></div></section><section class="section shell split"><span class="eyebrow">02 · COMO ENSINAMOS</span><div><h2>Trilhas semanais, com horas combinadas.</h2><p>O conteúdo é organizado em trilhas semanais. Mentor e mentorado definem em comum acordo os dias, horários e quantidade de horas das sessões, de acordo com a rotina e as necessidades do aprendizado.</p><p>Cada semana combina explicação, prática, exercícios, revisão e evolução do projeto. O mentor acompanha o progresso e ajusta a profundidade da trilha conforme o desenvolvimento do mentorado.</p></div></section><section class="section shell split"><span class="eyebrow">03 · CONDIÇÕES</span><div><h2>Ciclo inicial trimestral.</h2><p>O contrato começa obrigatoriamente no Plano Trimestral Inicial. O trimestre é o ciclo mínimo da metodologia e o valor integral é pago na assinatura.</p><p>Após os três primeiros meses, se houver continuidade, a contratação pode passar para mensalidade recorrente. A mensalidade vence a cada 30 dias e a rescisão pode ocorrer após o terceiro mês mediante aviso prévio escrito de 15 dias antes do próximo vencimento, conforme contrato.</p></div></section><section class="section shell mentor-cta"><span class="eyebrow">02 · INSCRIÇÃO</span><h2>Pronto para começar?</h2><p>Use o WhatsApp para confirmar disponibilidade e alinhar o início da mentoria.</p><a class="btn" href="'+MENTOR_WHATSAPP+'" target="_blank" rel="noopener">Inscrever-se pelo WhatsApp '+icon("external")+'</a></section></main>';
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
  return '<main id="main-content" class="section shell commercial-config-page"><div class="service-config-head"><a class="text-link" href="#/comercial">← Voltar para serviços</a><span class="eyebrow">Configurador · '+esc(s[0])+'</span><h2>'+esc(s[0])+'</h2><p class="section-lead">'+esc(s[2])+' O serviço já inclui os fundamentos necessários; abaixo você pode adicionar apenas recursos realmente opcionais.</p></div><section class="service-included-panel"><span class="eyebrow">Já incluído</span><h3>O que vem no serviço.</h3><p class="muted">Estes recursos fazem parte da base deste tipo de projeto e não são cobrados novamente como adicionais.</p><ul class="service-included-list">'+included+'</ul></section><div class="service-config-layout"><section class="service-options-panel"><div class="config-panel-head"><div><span class="eyebrow">01 · Adicionais</span><h3>Recursos opcionais.</h3></div><span class="config-cap">'+cap+'</span></div><div class="service-pricing-table" role="table" aria-label="Recursos opcionais e preços">'+opts+'</div></section><aside class="service-summary"><span class="eyebrow">02 · Orçamento estimado</span><h3>Seu projeto</h3><div class="summary-start"><span>Valor atual</span><strong>R$ 0</strong></div><div class="summary-selected" data-service-selected><span>Nenhum recurso selecionado.</span></div><div class="summary-total"><span>Total estimado</span><strong data-service-total>R$ 0</strong></div><p class="muted">O valor exibido considera somente recursos opcionais selecionados. A base do serviço já contempla os itens listados acima.</p><button class="btn" type="button" data-service-request data-service-id="'+esc(safeId)+'">Fazer Orçamento '+icon("arrow")+'</button></aside></div><section class="section shell mentor-cta service-budget-cta"><span class="eyebrow">PRÓXIMO PASSO</span><h2>Quer fazer o seu?</h2><p>Conte o que você quer construir, o prazo desejado e o que precisa. A solicitação de orçamento é analisada separadamente do contato.</p><a class="btn" href="#/orcamento?servico='+encodeURIComponent(safeId)+'">Fazer orçamento '+icon("arrow")+'</a></section></main>';
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
  location.hash="#/orcamento?servico="+encodeURIComponent(btn.dataset.serviceId);
  toast("Configuração preparada para o orçamento.");
}

function commercial(){return cmsPage("commercial")}
function institutional(){return cmsPage("institutional")}function portfolio(){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Portfólio</span><h2>O universo Korczak.</h2><p class="section-lead">Um conjunto de produtos e projetos que formam o ecossistema Korczak Technologies. Explore cada iniciativa, seu propósito e estágio atual.</p></div><div class="grid">'+state.products.map(card).join("")+'</div></main>';
}

function products(){
 const kosIds=["korczak-ai","ide","morok","erp","flow","vision","ops","connect","mobile","wms"];
 const hubIds=["vault","nexus","nexa","veya","formly","korvo","chrona","meet","pulse","acta","memo","people","web","klash"];
 const all=Array.isArray(state.products)?state.products:[];
 const byId=new Map(all.filter(Boolean).map(p=>[p.id,p]));
 const kos=kosIds.map(id=>byId.get(id)).filter(Boolean);
 const ws=hubIds.map(id=>byId.get(id)).filter(Boolean);
 const catalog=state.content?.productsPage||{};
 const title=catalog.title||"Produtos e suítes Korczak.";
 const lead=catalog.description||"Conheça os produtos e aplicativos do ecossistema Korczak Technologies.";
 const hubTitle=catalog.hubTitle||"Aplicativos do HUB";
 const hubNote=catalog.hubNote||"Produtividade, documentos e colaboração em um único ecossistema.";
 const kosTitle=catalog.kosTitle||"Produtos operacionais";
 const hubCards=ws.length?ws.map((p,i)=>'<article class="hub-app '+(p.status==="Em construção"?"active":"planned")+'"><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="status">'+esc(p.status||"Status não informado")+'</span><h3>'+esc(p.name||p.id)+'</h3><p class="muted">'+esc(p.description||"Produto do ecossistema Korczak Technologies.")+'</p>'+(p.id==="nexus"?'<div class="actions product-card-actions"><a class="btn" href="#/produto/nexus">Conhecer Nexus '+icon("arrow")+'</a><a class="btn ghost" href="#/download/nexus">Baixar</a></div>':p.status==="Planejado"?'<a class="btn ghost" href="#/assinatura?produto='+encodeURIComponent(p.id)+'">Assinar pré-venda</a>':"")+'</article>').join(""):'<div class="empty-state"><h3>Catálogo temporariamente indisponível.</h3><p class="muted">Não foi possível carregar os produtos agora. Recarregue a página para tentar novamente.</p><button class="btn ghost" type="button" data-action="reload">Recarregar</button></div>';
 const kosCards=kos.length?kos.map(card).join(""):'<div class="empty-state"><h3>Produtos indisponíveis no momento.</h3><p class="muted">O catálogo operacional não pôde ser carregado.</p></div>';
 return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">'+esc(catalog.eyebrow||"Produtos · Catálogo")+'</span><h2>'+esc(title)+'</h2><p class="section-lead">'+esc(lead)+'</p></div><section class="section-group product-catalog-section"><div class="split-head"><div><span class="eyebrow">HUB</span><h3>'+esc(hubTitle)+'</h3></div><span class="muted">'+esc(hubNote)+'</span></div><div class="product-hub-grid">'+hubCards+'</div></section><section class="section-group product-catalog-section"><div class="split-head"><div><span class="eyebrow">KOS · KORCZAK OPERATIONS SYSTEM</span><h3>'+esc(kosTitle)+'</h3></div><span class="muted">'+kos.length+' produtos</span></div><div class="product-kos-grid">'+kosCards+'</div></section></main>';
}
function hub(){
 const ids=["vault","nexus","nexa","veya","formly","korvo","chrona","meet","pulse","acta","memo","people","web","klash"];
 const apps=ids.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
 return '<main id="main-content" class="section shell hub-page"><div class="portfolio-hero"><span class="eyebrow">HUB · SUÍTE DE PRODUTIVIDADE</span><h2>Seu trabalho, em um único espaço.</h2><p class="section-lead">O HUB reúne arquivos, documentos, planilhas, apresentações, formulários, e-mail, calendário, videoconferências, comunicação, tarefas, contatos, sites e anotações.</p></div><section class="hub-grid">'+apps.map((a,i)=>'<article class="hub-app '+(a.status==="Em construção"?"active":"planned")+'"><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="status">'+esc(a.status)+'</span><h3>'+esc(a.name)+'</h3><p class="muted">'+esc(a.description)+'</p>'+(a.id==="nexus"?'<a class="btn ghost" href="#/produto/nexus">Ver planos</a>':a.status==="Planejado"?'<span class="plan-note">Assinar pré-venda</span>':"")+'</article>').join("")+'</section></main>';
}
function kos(){
 const ids=["korczak-ai","ide","morok","erp","flow","vision","ops","connect","mobile","wms"];
 const items=ids.map(id=>state.products.find(p=>p.id===id)).filter(Boolean);
 return '<main id="main-content" class="section shell hub-page"><div class="portfolio-hero"><span class="eyebrow">KOS · KORCZAK OPERATIONS SYSTEM</span><h2>Operação e produtos Korczak.</h2><p class="section-lead">Os únicos produtos iniciados no KOS são KORCZAK AI, Korczak IDE, MOROK e KORCZAK ERP. Os demais permanecem planejados.</p></div><section class="hub-grid">'+items.map((p,i)=>'<article class="hub-app '+(p.status==="Iniciado"?"active":"planned")+'"><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="status">'+esc(p.status)+'</span><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(p.description)+'</p>'+(p.status==="Iniciado"?'<span class="plan-note">Compra + mensalidade · condições em definição</span>':'<span class="plan-note">Assinar pré-venda</span>')+'</article>').join("")+'</section></main>';
}
function planKeyForProduct(id){return id;}
function planSectionFor(id){
  const key=planKeyForProduct(id),plans=state.plans?.[key]||PLAN_CATALOG[key]||[];
  if(!plans.length)return "";
  const title=key==="hub"?"Planos do HUB":id==="korczak-ai"?"Planos do Korczak AI":id==="ide"?"Planos do Korczak IDE":"Planos do "+(state.products.find(x=>x.id===id)?.name||id);
  const personalIds=key==="morok"?new Set(["free","starter","basic","business","professional"]):new Set(["free","starter","standard","plus"]);
  const businessIds=new Set(["business"]);
  const personal=plans.filter(p=>personalIds.has(p.id));
  const business=plans.filter(p=>businessIds.has(p.id));
  const enterprise=plans.filter(p=>!personalIds.has(p.id)&&!businessIds.has(p.id));
  const hasTabs=personal.length>0&&(business.length>0||enterprise.length>0);
  const renderPlan=(plan,group)=>{
    const isEnterprise=group==="enterprise",price=Number(plan.price),pre=Number(plan.preSalePrice);
    return '<article class="mentor-track-card product-plan-card plan-group-card" data-plan-group="'+group+'"><span class="eyebrow">'+esc(plan.tag||"PLANO")+'</span><h3>'+esc(plan.name)+'</h3><p>'+esc(plan.description||"")+'</p><div class="plan-price-main"><strong>'+money(price)+'</strong><small>/ '+esc(plan.billing||"mês")+'</small></div>'+(isEnterprise?'<div class="enterprise-price-detail"><span>Por usuário</span><strong data-enterprise-price="'+price+'">'+money(price)+'</strong><small>/ usuário / mês</small><div class="enterprise-total-row"><span>Total mensal</span><strong data-enterprise-total="'+price+'">'+money(price)+'</strong></div></div>':"")+(Number.isFinite(pre)&&pre!==price?'<div class="plan-presale"><span>Pré-venda · -15%</span><b>'+money(pre)+'</b>'+(isEnterprise?'<small data-enterprise-presale="'+pre+'"> · '+money(pre)+' / usuário / mês</small>':"")+'</div>':"")+'<ul class="feature-list">'+(plan.features||[]).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul><a class="btn ghost" href="#/assinatura?produto='+encodeURIComponent(id)+'&plano='+encodeURIComponent(plan.id)+'">Assinar pré-venda '+icon("arrow")+'</a></article>';
  };
  const enterpriseControl=enterprise.length?'<div class="enterprise-users-control" data-enterprise-users-wrap hidden><label>Quantidade de usuários <input type="number" min="1" step="1" value="1" data-enterprise-users aria-label="Quantidade de usuários empresariais"></label><span>Total calculado para a mensalidade.</span></div>':"";
  return '<section id="planos" class="section-group plan-section"><span class="eyebrow">PLANOS · INVESTIMENTO</span><h3>'+title+'</h3><p class="section-lead">Escolha entre planos pessoais, Business e Enterprise. Os planos empresariais calculam o total conforme a quantidade de usuários.</p>'+(hasTabs?'<div class="plan-audience-switch" role="tablist" aria-label="Tipo de plano"><button type="button" class="plan-audience-tab is-active" data-plan-tab="personal" role="tab" aria-selected="true">Pessoal</button>'+(business.length?'<button type="button" class="plan-audience-tab" data-plan-tab="business" role="tab" aria-selected="false">Business</button>':"")+(enterprise.length?'<button type="button" class="plan-audience-tab" data-plan-tab="enterprise" role="tab" aria-selected="false">Enterprise</button>':"")+'</div>':"")+enterpriseControl+'<div class="mentor-track-grid product-plan-grid" data-plan-groups>'+plans.map(p=>renderPlan(p,personalIds.has(p.id)?"personal":businessIds.has(p.id)?"business":"enterprise")).join("")+'</div><p class="muted plan-footnote">A pré-venda aplica 15% de desconto sobre o preço comercial já ajustado.</p></section>';
}
function modularProductPage(id){
  const p=state.products.find(x=>x.id===id),mods=MODULAR_CATALOG[id];
  if(!p||!mods)return productPlansPage(id);
  const required=mods.filter(m=>m.required),total=required.reduce((a,m)=>a+m.price,0),monthly=required.reduce((a,m)=>a+m.monthly,0);
  return '<main id="main-content" class="mentor-page modular-product-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KOS · '+esc(p.status)+'</span><h1>'+esc(p.name)+'<br><span>Monte sua solução.</span></h1><p>Escolha somente os módulos que fazem sentido para sua operação. Cada módulo possui preço próprio de implantação e mensalidade. O valor considera utilidade, dificuldade de desenvolvimento, integração, testes e implantação.</p><div class="actions"><a class="btn ghost" href="#/produto/'+encodeURIComponent(id)+'">Conhecer produto →</a><a class="btn" data-module-quote href="#/assinatura?produto='+encodeURIComponent(id)+'">Assinar pré-venda →</a></div></div><div class="mentor-price-hero"><small>Modelo comercial</small><strong>Modular</strong></div></section><section class="section shell"><div class="split-head"><div><span class="eyebrow">01 · MÓDULOS</span><h2>Escolha os módulos.</h2></div><span class="muted">Implantação + mensalidade por módulo</span></div><p class="section-lead">A base é obrigatória para garantir o funcionamento do produto. Os demais módulos são opcionais.</p><div class="kos-module-layout"><div class="kos-module-grid">'+mods.map((m,i)=>'<label class="kos-module-card '+(m.required?"required":"")+'"><input type="checkbox" data-module-toggle data-product="'+esc(id)+'" data-module="'+esc(m.id)+'" '+(m.required?"checked disabled":"")+'><span class="module-check">'+(m.required?"BASE OBRIGATÓRIA":"ADICIONAR")+'</span><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="eyebrow">'+esc(m.tag)+'</span><h3>'+esc(m.name)+'</h3><p>'+esc(m.description)+'</p><div class="module-prices"><div><small>Implantação</small><strong>'+money(m.price)+'</strong></div><div><small>Mensal</small><strong>'+money(m.monthly)+'</strong><span>/ mês</span></div></div><ul class="feature-list">'+m.features.map(f=>'<li>'+esc(f)+'</li>').join("")+'</ul></label>').join("")+'</div><aside class="kos-module-summary"><span class="eyebrow">02 · SUA CONFIGURAÇÃO</span><h3>'+esc(p.name)+'</h3><div class="module-summary-row"><span>Módulos selecionados</span><strong data-module-count>'+required.length+'</strong></div><div class="module-summary-row"><span>Implantação</span><strong data-module-total>'+money(total)+'</strong></div><div class="module-summary-row"><span>Mensalidade</span><strong data-module-monthly>'+money(monthly)+'</strong></div><div class="module-presale"><span>Pré-venda · -15%</span><strong data-module-presale>'+money(Math.round(total*.85))+'</strong><small data-module-presale-monthly>'+money(Math.round(monthly*.85))+' / mês</small></div><p class="muted">A pré-venda aplica 15% de desconto sobre os valores da configuração escolhida.</p><a class="btn" data-module-quote href="#/assinatura?produto='+encodeURIComponent(id)+'&modulos='+encodeURIComponent(required.map(m=>m.id).join(","))+'">Comprar esta configuração '+icon("arrow")+'</a></aside></div></section><section class="section shell split"><span class="eyebrow">03 · CRITÉRIO DE PREÇO</span><div><h2>O preço acompanha a complexidade.</h2><p>Não é um preço igual para todos os módulos. Recursos mais úteis ou mais difíceis de construir e implantar têm valores maiores. Integrações, regras de negócio, volume de dados, testes, segurança e manutenção também entram no cálculo.</p><p>Assim, você paga pela configuração que realmente pretende usar e pode acrescentar novos módulos conforme a operação crescer.</p></div></section></main>';
}
function productPlansPage(id){
  const p=state.products.find(x=>x.id===id),plans=state.plans?.[id]||PLAN_CATALOG[id]||[];
  if(!p||!plans.length)return product(id);
  return '<main id="main-content" class="mentor-page"><section class="hero shell mentor-hero"><div><span class="eyebrow">KORCZAK TECHNOLOGIES · PLANOS</span><h1>'+esc(p.name)+'<br><span>Escolha seu plano.</span></h1><p>Escolha entre os planos pessoais e empresariais. A seleção abaixo é feita nesta própria página; o cadastro de pré-venda só é aberto depois que um plano específico for escolhido.</p><div class="actions"><a class="btn ghost" href="#/produto/'+encodeURIComponent(id)+'">Conhecer produto '+icon("arrow")+'</a></div></div><div class="mentor-price-hero"><small>Pré-venda</small><strong>-15%</strong></div></section>'+planSectionFor(id)+'</main>';
}
function product(id){
  const p=state.products.find(x=>x.id===id);
  if(!p)return '<main id="main-content" class="section shell"><span class="eyebrow">Produto</span><h2>Produto não encontrado.</h2><p class="section-lead">O produto solicitado não está no catálogo atual.</p><a class="btn ghost" href="#/produtos">Voltar aos produtos</a></main>'+planBlock;
  const details=state.content?.productsDetails||{};
  const d=details[p.id]||["Produto Korczak","Uma solução do ecossistema Korczak Technologies.","Consulte a equipe para conhecer escopo, disponibilidade e próximos passos."];
  const isModular=Boolean(MODULAR_CATALOG[p.id]);
  const planBlock="";
  const related=state.products.filter(x=>x.id!==p.id&&x.type===p.type).slice(0,3);
  const isHubApp=p.type==="HUB";
  const isKOS=["korczak-ai","ide","morok","erp","flow","vision","ops","connect","mobile","wms"].includes(p.id);
  let action="";
  if(p.id==="korczak-ai") action='<a class="btn" href="#/interesse/korczak-ai">Entrar na lista de interessados '+icon("arrow")+'</a>';
  else if(p.id==="ide") action='<a class="btn" href="#/planos/'+encodeURIComponent(p.id)+'">Ver planos '+icon("arrow")+'</a>';
  else if(isHubApp&&p.id==="nexus") action='<a class="btn" href="#/planos/nexus">Ver planos '+icon("arrow")+'</a><a class="btn ghost" href="#/download/nexus">Baixar Nexus '+icon("arrow")+'</a>';
  else if(isHubApp&&p.status==="Planejado") action='<a class="btn" href="#/assinatura?produto='+encodeURIComponent(p.id)+'">Assinar pré-venda '+icon("arrow")+'</a>';
  else if(isKOS&&isModular) action='<a class="btn" href="#/planos/'+encodeURIComponent(p.id)+'">Montar por módulos '+icon("arrow")+'</a>';
  else if(isKOS&&p.status==="Em desenvolvimento") action='<span class="plan-note">Em desenvolvimento · comercialização futura</span>';
  else if(isKOS&&p.status==="Planejado") action='<a class="btn" href="#/assinatura?produto='+encodeURIComponent(p.id)+'">Assinar pré-venda '+icon("arrow")+'</a>';
  else if(isKOS&&p.status==="Iniciado") action='<a class="btn" href="#/planos/'+encodeURIComponent(p.id)+'">Ver condições '+icon("arrow")+'</a>';
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">'+esc(p.type)+' · '+esc(p.status)+'</span><h2>'+esc(p.name)+'.</h2><p class="section-lead">'+esc(d[1])+'</p><div class="actions">'+action+'<a class="btn ghost" href="#/produtos">Ver catálogo</a></div></div><div class="detail-grid"><section class="detail-panel"><span class="eyebrow">O que é</span><h3>'+esc(d[0])+'</h3><p class="muted">'+esc(d[2])+'</p><ul class="feature-list"><li>Arquitetura pensada para evolução por etapas.</li><li>Interface orientada à clareza e ao uso cotidiano.</li><li>Integração com o ecossistema quando aplicável.</li><li>Escopo e disponibilidade definidos conforme o estágio.</li></ul></section><aside class="detail-panel"><span class="eyebrow">Status</span><h3>'+esc(p.status)+'</h3><p class="muted">O estágio publicado indica o nível atual de desenvolvimento e não representa necessariamente disponibilidade comercial completa.</p><a class="btn ghost" href="#/contato">Falar com a equipe '+icon("arrow")+'</a></aside></div><div class="split"><section><span class="eyebrow">Como funciona</span><h3>Construído para crescer.</h3><p class="muted">O produto é desenvolvido em fases, começando pelos recursos essenciais e ampliando capacidades conforme requisitos, testes e feedback.</p></section><section><span class="eyebrow">Próximo passo</span><h3>Defina seu cenário.</h3><p class="muted">Para projetos, contratação ou parceria, envie objetivo, equipe, requisitos e prazo desejado.</p></section></div>'+(related.length?'<div class="rule"></div><span class="eyebrow">Relacionados</span><div class="grid">'+related.map(card).join('')+'</div>':'')+'</main>'+planBlock;
}

async function loadNexusRelease(){
  const stateEl=document.getElementById("nexus-release");
  const button=document.getElementById("nexus-android-download");
  if(!stateEl||!button)return;
  try{
    const response=await fetch("https://api.github.com/repos/korczaktech/kz-nexus/releases/latest",{headers:{Accept:"application/vnd.github+json"}});
    if(!response.ok)throw new Error("release");
    const release=await response.json();
    const apk=(release.assets||[]).find(a=>/\.apk$/i.test(a.name));
    if(!apk)throw new Error("apk");
    stateEl.innerHTML='<span class="release-state">Última versão: '+esc(release.tag_name||release.name||"disponível")+'</span>';
    button.href=apk.browser_download_url;
    button.hidden=false;
  }catch(error){
    stateEl.innerHTML='<span class="release-state">Não foi possível consultar a última versão agora. Tente novamente.</span>';
    button.hidden=true;
  }
}

function nexusDownloadPage(){
  return '<main id="main-content" class="section shell nexus-download-page"><div class="portfolio-hero"><span class="eyebrow">NEXUS · BAIXAR</span><h2>Baixe o Nexus.</h2><p class="section-lead">Escolha sua plataforma. Android usa sempre o APK da última release do repositório kz-nexus. No iPhone e iPad, o Nexus funciona como PWA instalado pelo Safari.</p></div><section class="nexus-download-grid"><article class="nexus-download-card"><span class="eyebrow">ANDROID</span><h3>Nexus para Android</h3><p class="muted">Baixe e instale diretamente o APK da última versão publicada.</p><div class="nexus-release" id="nexus-release"><span class="release-state">Consultando última versão…</span></div><a class="btn" id="nexus-android-download" href="#" hidden>Baixar APK '+icon("arrow")+'</a></article><article class="nexus-download-card"><span class="eyebrow">IOS · PWA</span><h3>Nexus no iPhone e iPad</h3><p class="muted">Não precisa de App Store. Instale o Nexus diretamente pelo Safari como um aplicativo.</p><ol class="nexus-ios-steps"><li><strong>Abra o Nexus no Safari.</strong><span>Entre em <code>korczaktech.github.io/kz-nexus</code> usando o Safari.</span></li><li><strong>Abra o menu Compartilhar.</strong><span>Toque no ícone de compartilhar do Safari.</span></li><li><strong>Adicione à Tela de Início.</strong><span>Selecione “Adicionar à Tela de Início” e confirme em “Adicionar”.</span></li><li><strong>Abra pelo novo ícone.</strong><span>O Nexus ficará disponível na Tela de Início como um aplicativo.</span></li></ol><a class="btn ghost" href="https://korczaktech.github.io/kz-nexus" target="_blank" rel="noopener noreferrer">Abrir Nexus no Safari '+icon("external")+'</a></article><article class="nexus-download-card"><span class="eyebrow">DESKTOP</span><h3>Nexus Desktop</h3><p class="muted">Acesse o Korczak Nexus diretamente pelo navegador no computador.</p><a class="btn" href="https://korczaktech.github.io/kz-nexus" target="_blank" rel="noopener noreferrer">Ir para o Nexus '+icon("external")+'</a></article></section><div class="actions"><a class="btn ghost" href="#/produto/nexus">Voltar ao Nexus '+icon("arrow")+'</a><a class="btn ghost" href="#/produtos">Ver produtos</a></div></main>';
}
function company(){return cmsPage("company")}
function historyPage(){return cmsPage("historyPage")}

function korczakAiInterestPage(){
  return '<main id="main-content" class="section shell interest-page"><div class="portfolio-hero"><span class="eyebrow">KORCZAK AI · ALPHA</span><h2>Entre na lista de interessados.</h2><p class="section-lead">A Korczak AI está em alpha e ainda passa por testes. Deixe seus dados para receber informações sobre disponibilidade, testes e próximos acessos.</p></div><section class="interest-layout"><div class="interest-copy"><span class="eyebrow">ACESSO ANTECIPADO</span><h3>Seja avisado quando houver novidades.</h3><p class="muted">O cadastro não cria uma conta nem garante acesso imediato à alpha. Ele registra seu interesse para que a equipe possa entrar em contato.</p><div class="interest-note"><strong>Alpha</strong><span>Produto em testes · vagas e disponibilidade podem variar.</span></div></div><form class="interest-form" id="korczak-ai-interest-form"><label>Nome<input name="nome" autocomplete="name" required maxlength="120" placeholder="Seu nome"></label><label>Email<input name="email" type="email" autocomplete="email" required maxlength="180" placeholder="voce@exemplo.com"></label><label>WhatsApp <span class="muted">opcional</span><input name="whatsapp" autocomplete="tel" maxlength="40" placeholder="(11) 99999-9999"></label><div class="interest-form-row"><label>Cidade<input name="cidade" autocomplete="address-level2" required maxlength="100" placeholder="Sua cidade"></label><label>Estado<input name="estado" autocomplete="address-level1" required maxlength="100" placeholder="Seu estado"></label></div><label>País<input name="pais" autocomplete="country-name" required maxlength="100" placeholder="Seu país"></label><label>Onde conheceu a Korczak AI?<select name="ondeConheceu" required><option value="">Selecione uma opção</option><option>Instagram</option><option>Facebook</option><option>LinkedIn</option><option>YouTube</option><option>Google</option><option>Indicação</option><option>Site da Korczak Technologies</option><option>Outro</option></select></label><label>Como pretende usar a Korczak AI? <span class="muted">opcional</span><textarea name="uso" maxlength="500" rows="4" placeholder="Conte brevemente o que você gostaria de fazer com a Korczak AI."></textarea></label><label class="interest-check"><input name="consentimento" type="checkbox" value="true" required><span>Autorizo a Korczak Technologies a entrar em contato comigo sobre a Korczak AI e sua alpha.</span></label><button class="btn" type="submit">Entrar na lista '+icon("arrow")+'</button><p class="form-message" id="korczak-ai-interest-msg" role="status" aria-live="polite"></p></form></section></main>';
}
async function sendKorczakAiInterest(e){
  e.preventDefault();
  const form=e.target,msg=form.querySelector("#korczak-ai-interest-msg"),button=form.querySelector("button[type=submit]");
  button.disabled=true;msg.textContent="Registrando…";
  try{
    const data=Object.fromEntries(new FormData(form));
    data.consentimento=form.querySelector('[name="consentimento"]').checked;
    await api("/api/interessados/korczak-ai",{method:"POST",body:JSON.stringify(data)});
    form.reset();msg.textContent="Seu interesse foi registrado. A equipe poderá entrar em contato quando houver novidades da alpha.";toast("Interesse registrado.");
  }catch(x){msg.textContent=x?.message||"Não foi possível registrar seu interesse.";toast(msg.textContent)}
  finally{button.disabled=false}
}
function contact(){return cmsPage("contact")}

async function sendQuote(e){
  e.preventDefault();
  const form=e.target.closest("#quote-form");
  if(!form)return;
  const msg=form.querySelector("#quote-msg"),button=form.querySelector("button[type=submit]");
  button.disabled=true;msg.textContent="Enviando…";
  try{await api("/api/quotes",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});form.reset();msg.textContent="Solicitação enviada. A equipe retornará pelo contato informado.";toast("Orçamento enviado.");}
  catch(x){msg.textContent=x.message;toast(x.message)}
  finally{button.disabled=false}
}
function updateKOSModules(el){
  const product=el.dataset.product,page=el.closest(".modular-product-page"),mods=MODULAR_CATALOG[product]||[];
  if(!page)return;
  const selected=mods.filter(m=>m.required||page.querySelector('[data-module-toggle][data-module="'+m.id+'"]')?.checked);
  const total=selected.reduce((a,m)=>a+Number(m.price||0),0),monthly=selected.reduce((a,m)=>a+Number(m.monthly||0),0);
  page.querySelector("[data-module-count]").textContent=String(selected.length);
  page.querySelector("[data-module-total]").textContent=money(total);
  page.querySelector("[data-module-monthly]").textContent=money(monthly);
  page.querySelector("[data-module-presale]").textContent=money(Math.round(total*.85));
  page.querySelector("[data-module-presale-monthly]").textContent=money(Math.round(monthly*.85))+" / mês";
  const ids=selected.map(m=>m.id).join(",");
  page.querySelectorAll("[data-module-quote]").forEach(a=>a.href="#/assinatura?produto="+encodeURIComponent(product)+"&modulos="+encodeURIComponent(ids));
}
function subscriptionPage(){
  const qs=new URLSearchParams((location.hash.split("?")[1]||""));
  const requestedProductId=qs.get("produto")||"",planId=qs.get("plano")||"",moduleIds=qs.get("modulos")||"",audience=qs.get("audiencia")||"personal";
  const userCount=Math.max(1,parseInt(qs.get("usuarios")||"1",10)||1);
  const requestedProduct=state.products.find(x=>x.id===requestedProductId);
  const catalog=state.content?.plans||PLAN_CATALOG||{};
  const mergedPlans={};
  for(const [key,list] of Object.entries(catalog))if(Array.isArray(list)&&list.length)mergedPlans[key]=list;
  for(const [key,list] of Object.entries(state.plans||{}))if(Array.isArray(list)&&list.length)mergedPlans[key]=list;

  const selectedProduct=requestedProduct||(state.products.find(x=>x.id==="hub")||null);
  const requestedPlanKey=selectedProduct?.id||"hub";
  const plans=Array.isArray(mergedPlans[requestedPlanKey])?mergedPlans[requestedPlanKey]:[];
  if(!selectedProduct||!plans.length)return '<main id="main-content" class="section shell subscription-page"><div class="portfolio-hero"><span class="eyebrow">PRÉ-VENDA · ASSINATURA</span><h2>Nenhum plano disponível.</h2><p class="section-lead">O catálogo de planos deste produto ainda não está disponível.</p><a class="btn" href="#/produtos">Voltar aos produtos '+icon("arrow")+'</a></div></main>';

  const personalIds=requestedPlanKey==="morok"?new Set(["free","starter","basic","business","professional"]):new Set(["free","starter","standard","plus"]);
  const personal=plans.filter(x=>personalIds.has(x.id));
  const enterprise=plans.filter(x=>!personalIds.has(x.id));
  const hasTabs=personal.length&&enterprise.length;
  const selectedPlan=plans.find(x=>x.id===planId)||null;
  const selectedGroup=selectedPlan?(personalIds.has(selectedPlan.id)?"personal":"enterprise"):(audience==="enterprise"&&enterprise.length?"enterprise":"personal");
  const workspaceName=selectedProduct.name||requestedPlanKey;
  const allMods=MODULAR_CATALOG[selectedProduct.id]||[];
  const effectiveModuleIds=moduleIds||allMods.filter(x=>x.required).map(x=>x.id).join(",");
  const mods=allMods.filter(x=>effectiveModuleIds.split(",").includes(x.id));

  const renderPlans=(list,group)=>list.map(pl=>{
    const active=selectedPlan?.id===pl.id;
    const perUser=Number(pl.preSalePrice);
    const commercial=Number(pl.price);
    const isEnterprise=group==="enterprise";
    const total=Number.isFinite(perUser)?perUser*userCount:0;
    return '<article class="workspace-plan-card '+(active?"selected":"")+'" data-subscription-plan-group="'+group+'"><div class="workspace-plan-top"><span class="eyebrow">'+esc(pl.tag||"PLANO")+'</span>'+(active?'<span class="workspace-plan-selected">Selecionado</span>':"")+'</div><h3>'+esc(pl.name)+'</h3><p class="muted">'+esc(pl.description||"Condição especial de pré-venda")+'</p><div class="workspace-plan-price"><strong>'+((Number.isFinite(perUser))?money(perUser):"Sob consulta")+'</strong><small>/ '+esc(pl.billing||"mês")+'</small></div>'+(isEnterprise?'<div class="enterprise-price-detail"><span>Preço por usuário</span><strong>'+money(perUser)+'</strong><small>/ usuário / mês</small><div class="enterprise-total-row"><span>Total mensal · '+userCount+' '+(userCount===1?"usuário":"usuários")+'</span><strong>'+money(total)+'</strong></div></div>':"")+(isEnterprise&&Number.isFinite(commercial)&&commercial!==perUser?'<div class="plan-commercial-reference"><span>Preço comercial por usuário</span><b>'+money(commercial)+'/usuário/mês</b></div>':"")+'<ul class="feature-list">'+(Array.isArray(pl.features)?pl.features.map(f=>'<li>'+esc(f)+'</li>').join(""):"")+'</ul><a class="btn ghost" href="#/assinatura?produto='+encodeURIComponent(selectedProduct.id)+'&plano='+encodeURIComponent(pl.id)+(effectiveModuleIds?'&modulos='+encodeURIComponent(effectiveModuleIds):'')+'&audiencia='+group+'&usuarios='+userCount+'">Escolher plano '+icon("arrow")+'</a></article>';
  }).join("");

  const tabs=hasTabs?'<div class="plan-audience-switch subscription-audience-switch" role="tablist" aria-label="Tipo de plano"><a class="plan-audience-tab '+(selectedGroup==="personal"?"is-active":"")+'" data-subscription-tab="personal" role="tab" aria-selected="'+(selectedGroup==="personal"?"true":"false")+'" href="#/assinatura?produto='+encodeURIComponent(selectedProduct.id)+'&audiencia=personal">Pessoal</a><a class="plan-audience-tab '+(selectedGroup==="enterprise"?"is-active":"")+'" data-subscription-tab="enterprise" role="tab" aria-selected="'+(selectedGroup==="enterprise"?"true":"false")+'" href="#/assinatura?produto='+encodeURIComponent(selectedProduct.id)+'&audiencia=enterprise&usuarios='+userCount+'">Empresarial</a></div>':"";
  const usersControl=enterprise.length?'<div class="enterprise-users-control"><label>Quantidade de usuários <input type="number" min="1" step="1" value="'+userCount+'" data-subscription-users aria-label="Quantidade de usuários empresariais"></label><span>O total mensal é calculado automaticamente por usuário.</span></div>':"";

  const groupCards='<section class="subscription-plan-group workspace-subscription-group"><div class="section-heading"><span class="eyebrow">WORKSPACE · ASSINATURAS</span><h3>Planos de '+esc(workspaceName)+'</h3><p class="muted">Escolha um plano '+(hasTabs?(selectedGroup==="personal"?"pessoal":"empresarial")+" de ":"de ")+esc(workspaceName)+' para avançar.</p></div>'+tabs+(selectedGroup==="enterprise"?usersControl:"")+'<div class="workspace-plan-grid subscription-plan-grid" data-subscription-plan-grid>'+(selectedGroup==="enterprise"?renderPlans(enterprise,"enterprise"):renderPlans(personal,"personal"))+'</div></section>';

  const implementation=mods.reduce((n,x)=>n+(Number.isFinite(Number(x.preSalePrice))?Number(x.preSalePrice):Math.round(Number(x.price||0)*.85)),0);
  const perUserMonthly=selectedPlan?(Number.isFinite(Number(selectedPlan.preSaleMonthly))?Number(selectedPlan.preSaleMonthly):Number.isFinite(Number(selectedPlan.preSalePrice))?Number(selectedPlan.preSalePrice):Number.isFinite(Number(selectedPlan.monthly))?Number(selectedPlan.monthly):0):0;
  const monthly=selectedPlan&&selectedGroup==="enterprise"?perUserMonthly*userCount:perUserMonthly;
  const hasSelection=!!selectedPlan;
  const setup=implementation>0;
  const summaryName=selectedPlan?workspaceName+" · "+selectedPlan.name:workspaceName;

  const form=hasSelection?'<section class="subscription-layout"><div class="subscription-summary"><span class="eyebrow">RESUMO DA ASSINATURA</span><h3>'+esc(summaryName)+'</h3>'+(selectedGroup==="enterprise"?'<div class="subscription-price-row"><span>Preço por usuário</span><strong>'+money(perUserMonthly)+'</strong><small>/ usuário / mês</small></div><div class="subscription-price-row"><span>Quantidade</span><strong>'+userCount+'</strong><small>'+ (userCount===1?"usuário":"usuários")+'</small></div>':"")+'<div class="subscription-price-row"><span>Mensalidade total</span><strong>'+money(monthly)+'</strong><small>/ mês</small></div>'+(setup?'<div class="subscription-price-row"><span>Implantação</span><strong>'+money(implementation)+'</strong><small>pagamento único</small></div>':"")+'<div class="subscription-pix"><span class="eyebrow">PAGAMENTO</span><strong>Pagamento conectado em breve</strong><p class="muted">A assinatura será registrada agora. A cobrança será conectada posteriormente.</p><div class="pix-placeholder">PAGAMENTO · aguardando conexão</div></div></div><form id="subscription-form" class="form subscription-form"><input type="hidden" name="productId" value="'+esc(selectedProduct.id)+'"><input type="hidden" name="planId" value="'+esc(planId)+'"><input type="hidden" name="moduleIds" value="'+esc(effectiveModuleIds)+'"><input type="hidden" name="userCount" value="'+userCount+'"><label>Nome<input class="field" name="name" required value="'+esc(state.user?.name||"")+'"></label><label>Email<input class="field" type="email" name="email" required value="'+esc(state.user?.email||"")+'"></label><label>Telefone<input class="field" name="phone" required></label><label>Empresa (opcional)<input class="field" name="company"></label><label>CPF/CNPJ (opcional)<input class="field" name="document"></label><button class="btn" type="submit">Avançar com esta assinatura '+icon("arrow")+'</button><small id="subscription-msg" class="muted form-note" role="status"></small></form></section>':'<section class="info-deep"><span class="eyebrow">ESCOLHA UMA ASSINATURA</span><h3>Selecione um plano de '+esc(workspaceName)+' para avançar.</h3><p class="muted">O formulário de pré-venda não aparece enquanto nenhum plano estiver selecionado.</p></section>';

  return '<main id="main-content" class="section shell subscription-page"><div class="portfolio-hero"><span class="eyebrow">PRÉ-VENDA · ASSINATURA</span><h2>Escolha seu plano.</h2><p class="section-lead">Selecione primeiro o tipo de plano e depois o plano desejado. No empresarial, informe a quantidade de usuários para ver o total mensal.</p></div>'+groupCards+form+'</main>';
}
function presalePage(){
  const cms=state.content?.presale||{};
  const qs=new URLSearchParams((location.hash.split("?")[1]||""));
  const selectedId=qs.get("produto")||"";
  const selectedPlan=qs.get("plano")||"";
  const selectedModules=qs.get("modulos")||"";
  const all=Array.isArray(state.products)?state.products:[];
  const kos=all.filter(p=>p.type==="KOS"),hub=all.filter(p=>p.type==="HUB");
  const priceLabel=(p)=>{
    const key=planKeyForProduct(p.id);
    const plans=state.plans?.[key]||PLAN_CATALOG[key]||[];
    const prices=plans.map(x=>Number(x.preSalePrice)).filter(Number.isFinite);
    if(prices.length)return "A partir de "+money(Math.min(...prices))+" / "+(plans[0].billing||"mês");
    const mods=MODULAR_CATALOG[p.id];
    if(mods?.length){
      const base=mods.filter(x=>x.required).reduce((n,x)=>n+Number(x.price||0),0);
      return "A partir de "+money(Math.round(base*.85))+" de implantação";
    }
    return "Condição especial de pré-venda";
  };
  const card=(p,i)=>'<article class="presale-card '+(p.id===selectedId?"selected":"")+'"><div class="presale-card-top"><span class="card-index">'+String(i+1).padStart(2,"0")+'</span><span class="status">'+esc(p.status||"Produto")+'</span></div><h3>'+esc(p.name)+'</h3><p class="muted">'+esc(p.description||"")+'</p><strong class="presale-card-price">'+esc(priceLabel(p))+'</strong><a class="btn '+(p.id===selectedId?"":"ghost")+'" href="#/assinatura?produto='+encodeURIComponent(p.id)+'">Assinar pré-venda '+icon("arrow")+'</a></article>';
  const productRows=(items)=>items.map((p,i)=>card(p,i)).join("");
  const selected=all.find(p=>p.id===selectedId);
  const selectedPlans=selected?(state.plans?.[planKeyForProduct(selected.id)]||PLAN_CATALOG[planKeyForProduct(selected.id)]||[]):[];
  const selectedMods=selected?(MODULAR_CATALOG[selected.id]||[]):[];
  const selectedPlanObj=selectedPlans.find(x=>x.id===selectedPlan);
  const selectedModuleIds=selectedModules?selectedModules.split(",").filter(Boolean):selectedMods.filter(x=>x.required).map(x=>x.id);
  const chosenMods=selectedMods.filter(x=>selectedModuleIds.includes(x.id));
  const selectedPrice=selectedPlanObj&&Number.isFinite(Number(selectedPlanObj.preSalePrice))?Number(selectedPlanObj.preSalePrice):chosenMods.length?Math.round(chosenMods.reduce((n,x)=>n+Number(x.price||0),0)*.85):null;
  const selectedMonthly=selectedPlanObj&&Number.isFinite(Number(selectedPlanObj.preSaleMonthly))?Number(selectedPlanObj.preSaleMonthly):chosenMods.length?Math.round(chosenMods.reduce((n,x)=>n+Number(x.monthly||0),0)*.85):null;
  const selectedCatalog=selected?[selected]:[];
  const catalogSection=selected?'':'<section class="section-group presale-group"><div class="split-head"><div><span class="eyebrow">KOS</span><h3>'+esc(cms.kosTitle||"Produtos operacionais")+'</h3></div><span class="muted">'+kos.length+' aplicativos</span></div><div class="presale-grid">'+productRows(kos)+'</div></section><section class="section-group presale-group"><div class="split-head"><div><span class="eyebrow">HUB</span><h3>'+esc(cms.hubTitle||"Aplicativos do HUB")+'</h3></div><span class="muted">'+hub.length+' aplicativos</span></div><div class="presale-grid">'+productRows(hub)+'</div></section>';
  const selectedSection=selected?'<section class="section-group presale-group"><div class="split-head"><div><span class="eyebrow">'+esc(selected.type||"PRODUTO")+'</span><h3>'+esc(selected.name)+'</h3></div><span class="muted">1 aplicativo</span></div><div class="presale-grid">'+productRows(selectedCatalog)+'</div></section>':'';
  return '<main id="main-content" class="section shell presale-page"><div class="portfolio-hero"><span class="eyebrow">'+esc(cms.eyebrow||"PRÉ-VENDA · ECOSSISTEMA KORCZAK")+'</span><h2>'+esc(cms.title||"Garanta seu acesso antecipado.")+'</h2><p class="section-lead">'+(selected?'Assinatura exclusiva de '+esc(selected.name)+'. Nenhum outro aplicativo é exibido nesta etapa.':esc(cms.lead||"A pré-venda reúne todos os aplicativos do catálogo, inclusive produtos em desenvolvimento e planejados."))+'</p></div><section class="presale-intro"><div><span class="eyebrow">'+esc(selected?"PRODUTO SELECIONADO":cms.introEyebrow||"01 · TODOS OS APLICATIVOS")+'</span><h3>'+esc(selected?selected.name:cms.introTitle||"Escolha o que você quer receber primeiro.")+'</h3><p class="muted">'+esc(selected?"Os planos desta etapa pertencem somente ao aplicativo selecionado.":cms.introText||"A condição de pré-venda é registrada separadamente de um orçamento.")+'</p></div><a class="btn ghost" href="#/produtos">'+esc(selected?"Trocar aplicativo":cms.catalogButton||"Ver catálogo")+' '+icon("arrow")+'</a></section>'+catalogSection+selectedSection+(selected?'<section class="section presale-checkout"><div class="presale-selected-head"><div><span class="eyebrow">'+esc(cms.selectedEyebrow||"02 · PRODUTO SELECIONADO")+'</span><h2>'+esc(selected.name)+'</h2><p class="section-lead">'+esc(selected.description||"")+'</p></div><span class="status">'+esc(selected.status||"Pré-venda")+'</span></div>'+(selectedPlans.length?'<div class="presale-choice-grid">'+selectedPlans.map(pl=>'<a class="presale-choice '+(pl.id===selectedPlan?"selected":"")+'" href="#/assinatura?produto='+encodeURIComponent(selected.id)+'&plano='+encodeURIComponent(pl.id)+'"><span class="eyebrow">'+esc(pl.tag||"PLANO")+'</span><h3>'+esc(pl.name)+'</h3><strong>'+((Number.isFinite(Number(pl.preSalePrice)))?money(pl.preSalePrice):"Sob consulta")+'</strong><small>/ '+esc(pl.billing||"mês")+'</small><span>Pré-venda · 15% OFF</span></a>').join("")+'</div>':selectedMods.length?'<div class="presale-choice-grid">'+selectedMods.map(m=>'<a class="presale-choice '+(selectedModuleIds.includes(m.id)?"selected":"")+'" href="#/assinatura?produto='+encodeURIComponent(selected.id)+'&modulos='+encodeURIComponent(selectedModuleIds.includes(m.id)?selectedModuleIds.filter(x=>x!==m.id).concat(m.required?[m.id]:[]).join(","):selectedModuleIds.concat(m.id).join(","))+'"><span class="eyebrow">'+esc(m.required?"BASE OBRIGATÓRIA":m.tag||"MÓDULO")+'</span><h3>'+esc(m.name)+'</h3><strong>'+money(Math.round(Number(m.price||0)*.85))+'</strong><small>implantação · pré-venda</small></a>').join("")+'</div>':"")+'<div class="presale-summary"><div><span>Condição de pré-venda</span><strong>'+(selectedPrice!==null?money(selectedPrice):esc(cms.pendingPrice||"Definida no lançamento"))+'</strong></div>'+(selectedMonthly!==null?'<div><span>Mensalidade</span><strong>'+money(selectedMonthly)+'</strong><small>/ mês</small></div>':"")+'<div><span>Produto</span><strong>'+esc(selected.name)+'</strong></div></div><div class="presale-next-step"><span class="eyebrow">03 · ASSINATURA</span><h3>Pronto para reservar sua pré-venda?</h3><p class="muted">Continue para a página exclusiva de assinatura. É lá que seus dados serão registrados e o pagamento será conectado posteriormente.</p><a class="btn" href="#/assinatura?produto='+encodeURIComponent(selected.id)+'&plano='+encodeURIComponent(selectedPlan)+'&modulos='+encodeURIComponent(selectedModuleIds.join(","))+'">Assinar pré-venda '+icon("arrow")+'</a></div></section>':"")+'</main>';
}

async function sendPresale(e){
  e.preventDefault();
  const form=e.target,msg=form.querySelector("#presale-msg"),button=form.querySelector("button[type=submit]");
  button.disabled=true;msg.textContent="Registrando…";
  try{
    await api("/api/presales",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    msg.textContent="Pré-venda registrada. A equipe enviará as instruções de pagamento quando a oferta estiver disponível.";
    toast("Pré-venda registrada com sucesso.");
    registrarAnalitica("presale","Pré-venda registrada",{categoria:"comercial",subcategoria:"pre-venda",acao:"Pré-venda registrada",descricao:"Intenção de compra registrada na página de pré-venda.",entidade:"produto",entidadeId:form.productId.value});
  }catch(x){msg.textContent=x.message;toast(x.message)}
  finally{button.disabled=false}
}
function quotePage(){
  const qs=new URLSearchParams((location.hash.split("?")[1]||""));
  const productId=qs.get("produto")||"",serviceId=qs.get("servico")||"",planId=qs.get("plano")||"",moduleIds=qs.get("modulos")||"";
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">ORÇAMENTO · SOLICITAÇÃO TÉCNICA</span><h2>Quero fazer o meu.</h2><p class="section-lead">Este formulário é diferente do contato: aqui coletamos objetivo, escopo, prazo e faixa de investimento para preparar um orçamento.</p></div><form id="quote-form" class="form quote-form"><input type="hidden" name="productId" value="'+esc(productId)+'"><input type="hidden" name="serviceId" value="'+esc(serviceId)+'"><input type="hidden" name="moduleIds" value="'+esc(moduleIds)+'"><label>Nome<input class="field" name="name" required value="'+esc(state.user?.name||"")+'"></label><label>Email<input class="field" type="email" name="email" required value="'+esc(state.user?.email||"")+'"></label><label>Telefone<input class="field" name="phone" required></label><label>Empresa (opcional)<input class="field" name="company"></label><label>O que você quer fazer?<select class="field" name="objective" required><option value="">Selecione</option><option>Site ou aplicação</option><option>Produto digital</option><option>Integração</option><option>Automação</option><option>Melhoria de sistema existente</option><option>Outro</option></select></label><label>Escopo / funcionalidades<textarea class="field" name="scope" rows="6" required placeholder="Explique o que precisa ser desenvolvido."></textarea></label><label>Prazo desejado<input class="field" name="deadline" placeholder="Ex.: 30 dias, 3 meses"></label><label>Faixa de investimento (opcional)<select class="field" name="budget"><option>Prefiro não informar</option><option>Até R$ 5.000</option><option>R$ 5.000 a R$ 15.000</option><option>R$ 15.000 a R$ 50.000</option><option>Acima de R$ 50.000</option></select></label><label>Detalhes adicionais<textarea class="field" name="details" rows="5"></textarea></label><button class="btn" type="submit">Solicitar orçamento '+icon("arrow")+'</button><small id="quote-msg" class="muted form-note"></small></form></main>';
}
function checkoutState(kind){
  const success=kind==="sucesso";
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">Checkout · '+(success?"Concluído":"Cancelado")+'</span><h2>'+(success?"Pagamento processado.":"Pagamento cancelado.")+'</h2><p class="section-lead">'+(success?"Seu checkout foi concluído pelo Stripe. O status do pedido pode ser consultado na sua conta.":"Nenhuma cobrança foi concluída nesta etapa. Você pode voltar ao catálogo e tentar novamente.")+'</p><div class="actions"><a class="btn" href="#/conta">Minha conta</a><a class="btn ghost" href="#/produtos">Ver produtos</a></div></div></main>';
}
function authPage(mode="login",message=""){
  const loginMode=mode==="login";
  return '<main id="main-content" class="auth-page"><section class="auth-shell"><div class="auth-brand"><img src="./assets/mark.svg" alt="" aria-hidden="true"><span>KORCZAK TECHNOLOGIES</span></div><div class="auth-copy"><span class="eyebrow">Acesso seguro</span><h1>'+(loginMode?"Entre no seu ecossistema.":"Crie sua conta Korczak.")+'</h1><p>'+(loginMode?"Entre para acessar produtos, orçamento, pedidos e seu perfil.":"Crie sua conta para acessar o ecossistema Korczak, acompanhar solicitações e utilizar os recursos disponíveis.")+'</p></div><div class="auth-card"><div class="auth-tabs"><button class="'+(loginMode?"active":"")+'" type="button" data-action="auth-mode" data-mode="login">Entrar</button><button class="'+(!loginMode?"active":"")+'" type="button" data-action="auth-mode" data-mode="register">Criar conta</button></div><form class="auth-form" id="auth-form" data-mode="'+(loginMode?"login":"register")+'" novalidate>'+(!loginMode?'<label><span>Nome</span><input class="field" name="name" autocomplete="name" placeholder="Seu nome" required></label>':"")+'<label><span>Email</span><input class="field" name="email" type="email" autocomplete="email" placeholder="seu@email.com" required></label><label><span>Senha</span><input class="field" name="password" type="password" autocomplete="'+(loginMode?"current-password":"new-password")+'" placeholder="Mínimo de 8 caracteres" minlength="8" required></label><button class="btn auth-submit" type="submit">'+(loginMode?"Entrar":"Criar minha conta")+' '+icon("arrow")+'</button><small id="auth-message" class="form-note" role="status">'+esc(message)+'</small></form>'+(loginMode?'<div class="auth-recovery"><a href="#/conta?recuperar=1" data-action="forgot-password">Esqueci minha senha</a><span>·</span><button type="button" data-action="resend-verification">Reenviar verificação</button></div>':'')+'<p class="auth-terms">Ao continuar, você concorda com as <a href="#/privacidade">informações de privacidade</a> e as <a href="#/uso">regras de uso</a>.</p></div></section></main>';
}

function account(){
  const hashQuery=location.hash.includes("?")?location.hash.split("?").slice(1).join("?"):"";
  const query=new URLSearchParams(hashQuery);
  const verifyToken=query.get("verificar")||(location.hash.startsWith("#/verificar-email")?query.get("token"):"")||"",resetToken=query.get("redefinir")||(location.hash.startsWith("#/redefinir-senha")?query.get("token"):"")||"",recover=query.has("recuperar");
  if(verifyToken)return '<main id="main-content" class="auth-page"><section class="auth-shell"><div class="auth-card"><span class="eyebrow">Verificação de e-mail</span><h1>Confirme seu endereço.</h1><p>Use o botão abaixo para confirmar seu e-mail e ativar o acesso.</p><form id="verify-email-form" class="auth-form"><input type="hidden" name="token" value="'+esc(verifyToken)+'"><button class="btn" type="submit">Verificar e-mail '+icon("arrow")+'</button><small id="auth-message" class="form-note" role="status"></small></form></div></section></main>';
  if(resetToken)return '<main id="main-content" class="auth-page"><section class="auth-shell"><div class="auth-card"><span class="eyebrow">Recuperação segura</span><h1>Defina uma nova senha.</h1><form id="reset-password-form" class="auth-form"><input type="hidden" name="token" value="'+esc(resetToken)+'"><label><span>Nova senha</span><input class="field" name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label><button class="btn" type="submit">Salvar nova senha '+icon("arrow")+'</button><small id="auth-message" class="form-note" role="status"></small></form></div></section></main>';
  if(recover)return '<main id="main-content" class="auth-page"><section class="auth-shell"><div class="auth-card"><span class="eyebrow">Recuperação de acesso</span><h1>Recupere sua conta.</h1><p>Enviaremos um link seguro para o e-mail cadastrado.</p><form id="forgot-password-form" class="auth-form"><label><span>Email</span><input class="field" name="email" type="email" autocomplete="email" required></label><button class="btn" type="submit">Enviar link de recuperação '+icon("arrow")+'</button><small id="auth-message" class="form-note" role="status"></small></form><p><a href="#/conta">Voltar ao login</a></p></div></section></main>';
  if(!state.token){if(!state.authMode)state.authMode="login";return authPage(state.authMode,state.authMessage||"");}
  const u=state.user||{},initial=esc((u.name||"K").slice(0,1).toUpperCase());
  const quoteRows=state.quotes.length?state.quotes.map(q=>'<div class="profile-row"><span>'+esc(q.productId)+'</span><strong>'+esc(q.status||"pending")+'</strong><small class="muted">'+new Date(q.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma solicitação de orçamento ainda.</div>';
  const orderRows=state.orders.length?state.orders.map(o=>'<div class="profile-row"><span>'+esc(o.productId)+'</span><strong>'+esc(o.status||"checkout_created")+'</strong><small class="muted">'+new Date(o.createdAt).toLocaleDateString("pt-BR")+'</small></div>').join(""):'<div class="empty">Nenhuma compra registrada.</div>';
  return '<main id="main-content" class="section shell"><span class="eyebrow">Meu perfil</span><h2>Minha conta.</h2><div class="profile"><aside class="profile-aside"><div class="profile-avatar" aria-hidden="true">'+initial+'</div><h3>'+esc(u.name||"Usuário")+'</h3><p class="muted">'+esc(u.email||"")+'</p><span class="status">'+esc(u.role||"user")+'</span></aside><section class="profile-main"><form id="profile-form" class="profile-form"><div class="profile-row"><label class="field-label">Nome<input class="field" name="name" value="'+esc(u.name||"")+'" autocomplete="name" required></label></div><div class="profile-row"><label class="field-label">Telefone<input class="field" name="phone" value="'+esc(u.phone||"")+'" autocomplete="tel" placeholder="Seu telefone"></label></div><div class="profile-row"><span class="muted">Email</span><strong>'+esc(u.email||"—")+'</strong></div><div class="profile-row"><span class="muted">Perfil</span><strong>'+esc(u.role||"user")+'</strong></div><div class="profile-row"><span class="muted">Verificação</span><strong>'+((u.verified)?"Verificado":"Pendente")+'</strong></div><button class="btn" type="submit">Salvar dados '+icon("arrow")+'</button><small id="profile-message" class="form-note" role="status"></small></form></section></div><div class="rule"></div><section class="auth-card account-security"><span class="eyebrow">Segurança</span><h3>Alterar senha do site.</h3><form id="password-form" class="auth-form"><label><span>Senha atual</span><input class="field" name="currentPassword" type="password" autocomplete="current-password" required></label><label><span>Nova senha</span><input class="field" name="newPassword" type="password" autocomplete="new-password" minlength="8" required></label><button class="btn" type="submit">Alterar senha '+icon("arrow")+'</button><small id="password-message" class="form-note" role="status"></small></form></section><div class="actions"><a class="btn ghost" href="#/contato">Falar com a equipe</a><button class="btn" type="button" data-action="logout">Sair</button></div><div class="rule"></div><div class="split"><section><span class="eyebrow">Orçamentos</span><h3>Histórico comercial</h3>'+quoteRows+'</section><section><span class="eyebrow">Pedidos</span><h3>Histórico de compras</h3>'+orderRows+'</section></div></main>';
}
function infoPage(title,kicker,body,sections=[]){
  return '<main id="main-content" class="section shell"><div class="portfolio-hero"><span class="eyebrow">'+esc(kicker)+'</span><h2>'+esc(title)+'.</h2><p class="section-lead">'+esc(body)+'</p><div class="info-meta"><span>01 · Estratégia</span><span>02 · Produto</span><span>03 · Engenharia</span></div></div>'+(sections.length?'<div class="info-grid">'+sections.map((x,i)=>'<section class="info-card"><span class="eyebrow">'+String(i+1).padStart(2,"0")+' · '+esc(x[0])+'</span><h3>'+esc(x[1])+'</h3><p class="muted">'+esc(x[2])+'</p><a class="text-link" href="#/contato">Falar com a equipe '+icon("arrow")+'</a></section>').join('')+'</div>':'')+'<section class="info-deep"><div><span class="eyebrow">Perspectiva</span><h3>Construção contínua, decisões claras.</h3></div><p class="muted">A Korczak Technologies estrutura seus projetos em etapas para que produto, engenharia, experiência e operação possam evoluir com contexto, documentação e objetivos mensuráveis.</p></section><div class="actions"><a class="btn" href="#/produtos">Explorar produtos '+icon("arrow")+'</a><a class="btn ghost" href="#/contato">Entrar em contato</a></div></main>';
}

const legalPages={};

function legal(kind){const legalPages=state.content?.legal||{};const p=legalPages[kind]||legalPages.privacidade;return '<main id="main-content" class="section shell"><span class="eyebrow">Legal</span><h2>'+esc(p?.[0]||"Legal")+'.</h2><nav class="legal-nav" aria-label="Documentos legais">'+Object.entries(legalPages).map(([k,v])=>'<a href="#/'+k+'" aria-current="'+(k===kind?"page":"false")+'">'+esc(v[0])+'</a>').join("")+'</nav><article class="legal-copy"><h3>'+esc(p?.[1]||"Informações")+ '</h3><p class="muted">'+esc(p?.[2]||"")+ '</p><h3>Diretrizes</h3><p class="muted">'+esc(p?.[3]||"")+ '</p><h3>Responsabilidade</h3><p class="muted">'+esc(p?.[4]||"")+ '</p></article></main>'}

function footer(){
  return '<footer class="footer"><div class="shell footer-grid"><div class="footer-company"><strong>KORCZAK TECHNOLOGIES</strong><span>Software, sistemas e produtos digitais.</span><div class="footer-contact"><a href="tel:+5511954083183" aria-label="Ligar para Raphael">Raphael: +55 (11) 95408-3183</a><a href="mailto:SAC.korczak.tecnologies@gmail.com">SAC: SAC.korczak.tecnologies@gmail.com</a><a href="mailto:korczaktechnology@gmail.com">Comercial: korczaktechnology@gmail.com</a></div></div><div class="footer-social"><span>Redes sociais</span><div class="social-links"><a class="social-link" href="https://www.instagram.com/korczak_.tech/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @korczak_.tech"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg><span>Instagram · @korczak_.tech</span></a><a class="social-link" href="https://www.facebook.com/people/Korczak-Technologies/61593956412109/" target="_blank" rel="noopener noreferrer" aria-label="Facebook Korczak Technologies"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.9-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z"></path></svg><span>Facebook · Korczak Technologies</span></a></div></div><div class="footer-legal"><span>© '+new Date().getFullYear()+' Korczak Technologies</span><span class="footer-links"><a href="#/privacidade">Privacidade</a><a href="#/uso">Uso</a><a href="#/servico">Serviço</a></span></div></div></footer>';
}

function render(){
  const h=(location.hash.startsWith("#/")?location.hash.slice(1):"/").split("?")[0];
  if(!root)return;
  try{
  const pages={
    "/sobre":()=>cmsInfoPage("sobre"),
    "/historia":()=>historyPage(),
    "/visao":()=>cmsInfoPage("visao"),
    "/valores":()=>cmsInfoPage("valores"),
    "/parcerias":()=>cmsInfoPage("parcerias"),
    "/carreiras":()=>cmsInfoPage("carreiras"),
    "/faq":()=>cmsInfoPage("faq")
  };
  let c;
  if(h==="/acesso")c=authPage(state.authMode||"login",state.authMessage||"");
  else if(h==="/redefinir-senha"||h==="/verificar-email")c=account();
  else if(h==="/conta"&&!state.authenticated&&!/[?&](?:redefinir|verificar|recuperar)(?:=|&|$)/.test(location.hash))c=authPage(state.authMode||"login");
  else if(h==="/")c=home();
  else if(h==="/comercial")c=commercial();
  else if(h.startsWith("/pre-venda"))c=presalePage();
  else if(h.startsWith("/assinatura"))c=subscriptionPage();
  else if(h==="/mentoria")c=mentorshipPage();
  else if(h==="/mentoria/precos")c=mentorshipPrices();
  else if(h.startsWith("/mentoria/"))c=mentorshipDetail(decodeURIComponent(h.split("/")[2]||""));
  else if(h.startsWith("/servicos/")){let serviceId="site";try{serviceId=decodeURIComponent(h.split("/")[2]||"site")}catch{}c=servicePage(serviceId);}
  else if(h==="/institucional")c=institutional();
  else if(h==="/portfolio")c=portfolio();
  else if(h==="/produtos")c=products();
  else if(h==="/empresa")c=company();
  else if(h==="/hub")c=hub();
  else if(h==="/kos")c=kos();
  else if(pages[h])c=pages[h]();
  else if(h==="/interesse/korczak-ai")c=korczakAiInterestPage();
  else if(h==="/contato")c=contact();
  else if(h.startsWith("/orcamento"))c=quotePage();
  else if(h==="/conta")c=account();
  else if(h==="/checkout/sucesso")c=checkoutState("sucesso");
  else if(h==="/checkout/cancelado")c=checkoutState("cancelado");
  else if(h==="/privacidade")c=legal("privacidade");
  else if(h==="/uso")c=legal("uso");
  else if(h==="/servico")c=legal("servico");
  else if(h.startsWith("/planos/")){let productId="";try{productId=decodeURIComponent(h.split("/")[2]||"")}catch{}c=MODULAR_CATALOG[productId]?modularProductPage(productId):productPlansPage(productId);}
  else if(h==="/download/nexus")c=nexusDownloadPage();
  else if(h.startsWith("/produto/")){
    let productId="";
    try{productId=decodeURIComponent(h.split("/")[2]||"")}catch{}
    c=product(productId);
  }
  else c=infoPage("Página não encontrada","KZ Tech","A página solicitada não existe ou foi movida.",[["Navegação","Voltar ao ecossistema","Use a navegação para explorar a empresa, os produtos e os canais de contato."]]);
  const authFlow=["/conta","/redefinir-senha","/verificar-email"].includes(h)&&(!state.authenticated||h!=="/conta"||/[?&](?:redefinir|verificar|recuperar)(?:=|&|$)/.test(location.hash));
  root.innerHTML=authFlow?c:nav()+c+footer();initMoon();if(h==="/download/nexus")loadNexusRelease();
  const authForm=root.querySelector("#auth-form");
  if(authForm)authForm.addEventListener("submit",submitAuth);
  root.querySelectorAll("[data-service-option]").forEach(el=>el.addEventListener("change",()=>updateServiceQuote(el)));root.querySelectorAll("[data-module-toggle]").forEach(el=>el.addEventListener("change",()=>updateKOSModules(el)));
  root.querySelectorAll("[data-mentor-tech]").forEach(el=>el.addEventListener("change",()=>{updateMentorTotal(el);if(el.checked)registrarAnalitica("interacao","Tecnologia selecionada",{categoria:"comercial",subcategoria:"mentorias",acao:"Selecionou tecnologia para a mentoria",descricao:"Selecionou uma tecnologia na grade personalizada da Mentoria.",entidade:"tecnologia",entidadeId:el.closest(".mentor-tech-row")?.querySelector("b")?.textContent||""});}));
  document.body.classList.toggle("menu-open",state.menu);
  document.body.classList.remove("loading");
  const titleMap={"/":"KORCZAK TECHNOLOGIES","/comercial":"Comercial","/pre-venda":"Pré-venda","/assinatura":"Assinatura","/mentoria":"Mentoria","/mentoria/precos":"Preços da Mentoria","/institucional":"Institucional","/empresa":"Empresa","/portfolio":"Portfólio","/produtos":"Produtos","/hub":"HUB","/kos":"KOS","/contato":"Contato","/conta":"Meu perfil","/orcamento":"Solicitar orçamento","/historia":"História","/visao":"Visão","/valores":"Valores","/parcerias":"Parcerias","/carreiras":"Carreiras","/faq":"FAQ","/privacidade":"Privacidade","/uso":"Uso","/servico":"Serviço","/download/nexus":"Baixar Nexus"};
  let detail=null;
  if(h.startsWith("/produto/")){
    try{detail=state.products.find(x=>x.id===decodeURIComponent(h.split("/")[2]||""))?.name||null}catch{}
  }
  document.title="KORCZAK TECHNOLOGIES"+(detail?" · "+detail:(titleMap[h]?" · "+titleMap[h]:""));
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
  const form=e.target.closest("#contact-form"),msg=form.querySelector("#msg"),button=form.querySelector("button[type=submit]");
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
  location.hash="#/assinatura?produto="+encodeURIComponent(id);
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
  if(action==="forgot-password"){state.authMessage="";location.hash="#/conta?recuperar=1";render();return true;}
  if(action==="resend-verification"){const mail=prompt("Digite o e-mail da sua conta para reenviar a verificação:");if(mail)api("/api/auth/resend-verification",{method:"POST",body:JSON.stringify({email:mail})}).then(d=>toast(d.message||"Solicitação processada.")).catch(e=>toast(e.message));return true;}
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

document.addEventListener("click",e=>{const tab=e.target.closest("[data-plan-tab]");if(tab){const section=tab.closest(".plan-section");if(section){section.querySelectorAll("[data-plan-tab]").forEach(x=>{const active=x===tab;x.classList.toggle("is-active",active);x.setAttribute("aria-selected",active?"true":"false")});const group=tab.dataset.planTab;section.querySelectorAll(".plan-group-card").forEach(card=>{card.hidden=card.dataset.planGroup!==group});const usersWrap=section.querySelector("[data-enterprise-users-wrap]");if(usersWrap)usersWrap.hidden=group!=="enterprise"}return}const q=e.target.closest("[data-service-request]");if(q){e.preventDefault();requestServiceQuote(q);return}if(handleAction(e.target))e.preventDefault()});
document.addEventListener("input",e=>{
 const target=e.target;
 const input=target.closest("[data-enterprise-users]");
 if(input){
  const users=Math.max(1,parseInt(input.value||"1",10)||1);
  input.value=users;
  const section=input.closest(".plan-section");
  if(section){
   section.querySelectorAll("[data-enterprise-total]").forEach(el=>{const price=Number(el.dataset.enterpriseTotal)||0;el.textContent=money(price*users)});
   section.querySelectorAll("[data-enterprise-presale]").forEach(el=>{const price=Number(el.dataset.enterprisePresale)||0;el.textContent=" · "+money(price*users)+" total / mês"});
  }
  return;
 }
 const sub=target.closest("[data-subscription-users]");
 if(sub){
  const users=Math.max(1,parseInt(sub.value||"1",10)||1);
  sub.value=users;
  const qs=new URLSearchParams(location.hash.split("?")[1]||"");
  qs.set("usuarios",String(users));
  location.hash="#/assinatura?"+qs.toString();
 }
});
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
    const d=await api(mode==="login"?"/api/auth/login":"/api/auth/register",{method:"POST",body:JSON.stringify(payload)});
    if(!d?.user)throw Error("O servidor não retornou os dados da conta.");
    if(mode==="register"&&d.emailVerificationRequired){
      state.token=null;state.user=null;state.authenticated=false;localStorage.removeItem("kz_token");
      state.authMode="login";state.authMessage=d.emailSent?"Conta criada. Confira sua caixa de entrada e confirme o e-mail antes de entrar.":"Conta criada, mas o envio de e-mail ainda não está configurado. A equipe precisa concluir a configuração do Gmail e você poderá solicitar novo envio.";
      render();return;
    }
    if(!d?.token)throw Error("O servidor não retornou uma sessão válida.");
    state.token=d.token;state.user=d.user;state.authenticated=true;state.authMode="login";state.authMessage="";
    localStorage.setItem("kz_token",d.token);
    render();
    toast("Login realizado.");
    await load();
  }catch(x){msg.textContent=x?.message||"Não foi possível concluir o cadastro."}
  finally{
    button.disabled=false;
    if(document.body.contains(button))button.textContent=button.dataset.originalText||"Continuar";
  }
}
async function sendProfile(e){
  e.preventDefault();
  const form=e.target,msg=form.querySelector("#profile-message"),button=form.querySelector("button[type=submit]");
  button.disabled=true;msg.textContent="Salvando…";
  try{
    const d=await api("/api/me",{method:"PATCH",body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    state.user=d.user;state.token=d.token;localStorage.setItem("kz_token",d.token);msg.textContent="Dados salvos.";toast("Perfil atualizado.");render();
  }catch(x){msg.textContent=x.message}
  finally{if(document.body.contains(button))button.disabled=false}
}

async function submitVerifyEmail(e){e.preventDefault();const form=e.target,msg=form.querySelector("#auth-message"),button=form.querySelector("button[type=submit]");button.disabled=true;msg.textContent="Verificando…";try{const d=await api("/api/auth/verify-email",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});msg.textContent=d.message||"E-mail verificado.";setTimeout(()=>{location.hash="#/conta";render()},1200)}catch(x){msg.textContent=x.message}finally{button.disabled=false}}
async function submitForgotPassword(e){e.preventDefault();const form=e.target,msg=form.querySelector("#auth-message"),button=form.querySelector("button[type=submit]");button.disabled=true;msg.textContent="Enviando…";try{const d=await api("/api/auth/forgot-password",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});msg.textContent=d.message||"Se existir uma conta, enviaremos as instruções."}catch(x){msg.textContent=x.message}finally{button.disabled=false}}
async function submitResetPassword(e){e.preventDefault();const form=e.target,msg=form.querySelector("#auth-message"),button=form.querySelector("button[type=submit]");button.disabled=true;msg.textContent="Salvando…";try{const d=await api("/api/auth/reset-password",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(form)))});msg.textContent=d.message||"Senha alterada.";setTimeout(()=>{location.hash="#/conta";render()},1500)}catch(x){msg.textContent=x.message}finally{button.disabled=false}}
async function sendPasswordChange(e){
  e.preventDefault();
  const form=e.target,msg=form.querySelector("#password-message"),button=form.querySelector("button[type=submit]");
  const data=Object.fromEntries(new FormData(form));
  if(String(data.newPassword||"").length<8){msg.textContent="A nova senha precisa ter pelo menos 8 caracteres.";return}
  button.disabled=true;msg.textContent="Alterando…";
  try{const d=await api("/api/me/password",{method:"POST",body:JSON.stringify(data)});form.reset();msg.textContent=d.message||"Senha alterada com sucesso.";toast("Senha alterada com sucesso.");}
  catch(x){msg.textContent=x.message}
  finally{button.disabled=false}
}
document.addEventListener("submit",e=>{
  if(e.target.id==="verify-email-form")submitVerifyEmail(e);
  if(e.target.id==="forgot-password-form")submitForgotPassword(e);
  if(e.target.id==="reset-password-form")submitResetPassword(e);
  if(e.target.id==="contact-form")sendContact(e);
  if(e.target.id==="profile-form")sendProfile(e);
  if(e.target.id==="password-form")sendPasswordChange(e);
  if(e.target.id==="quote-form")sendQuote(e);
  if(e.target.id==="presale-form")sendPresale(e);
  if(e.target.id==="subscription-form")sendSubscription(e);
  if(e.target.id==="korczak-ai-interest-form")sendKorczakAiInterest(e);
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
  if(/\/mentoria/.test(pagina)||/\/produto|\/comercial|\/servicos|\/hub|\/kos/.test(pagina))return "comercial";
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
    const content=await fetch("./data/content.json?"+APP_VERSION).then(r=>r.ok?r.json():null);
    if(content)state.content=content;
    if(content?.products?.length)state.products=content.products;
    if(content?.plans)Object.assign(PLAN_CATALOG,content.plans);
    if(content?.modules)for(const [id,list] of Object.entries(content.modules))MODULAR_CATALOG[id]=list.map(m=>({...m}));
    if(content?.services){
      Object.assign(READY_SERVICES,content.services.ready||{});
      Object.assign(SERVICE_EXTRAS,content.services.extras||{});
      Object.assign(SERVICE_INCLUDED,content.services.included||{});
      Object.assign(OPTION_DIFFICULTY,content.services.difficulty||{});
      Object.assign(OPTION_NEED,content.services.need||{});
      normalizeServiceCatalog();
    }
    state.plans={...PLAN_CATALOG};
    try{const plans=await api("/api/planos");if(plans&&typeof plans==="object"){for(const [key,list] of Object.entries(plans)){if(!Array.isArray(list))continue;const cmsPlans=Array.isArray(state.plans[key])?state.plans[key]:[];const byId=new Map(cmsPlans.map(p=>[p.id,p]));for(const p of list)byId.set(p.id,p);state.plans[key]=Array.from(byId.values());}}}catch{}
  }catch{}
  if(!state.products.length){try{const products=await api("/api/products");if(Array.isArray(products)&&products.length)state.products=products;}catch{}}
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
