const API_URL="https://kztechsite.onrender.com";
const API_TIMEOUT_MS=30000;
const APP_VERSION="2026.10.02.24";
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
const state={token:localStorage.getItem("kz_token"),user:null,products:FALLBACK_PRODUCTS,quotes:[],orders:[],menu:false,authenticated:false,authMode:"login",authMessage:""};

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
  ["/","Início"],["/comercial","Comercial"],["/institucional","Institucional"],["/produtos","Produtos"],
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
    group("Principal",links.slice(0,4),0)+group("Ecossistema",links.slice(4,8),8)+group("Empresa & suporte",links.slice(8),12)+
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
const READY_SERVICES={"landing-page":["Landing Page",2810,"Página de campanha.",[["sections","Mais seções","Seções extras",390],["form","Formulário de leads","Captação de contatos",490],["analytics","Analytics","Métricas",390],["seo","SEO inicial","Busca",490],["animations","Animações","Microinterações",690],["integration","Integração","CRM, WhatsApp ou API",790]]],"site":["Site Profissional",8250,"Site institucional ou comercial.",[["dashboard","Dashboard","Painel administrativo",1900],["terms","Termos de uso","Página de Termos de Uso",390],["privacy","Política de privacidade","Página de privacidade",390],["pages","Páginas extras","Cada página adicional",490],["blog","Blog","Artigos",990],["cms","CMS","Conteúdo gerenciável",1490],["seo","SEO inicial","Busca",690],["analytics","Analytics","Métricas",390],["auth","Login e cadastro","Autenticação",1290],["multilang","Multilíngue","Idiomas",1490],["integrations","Integrações","APIs e serviços",990]]],"ecommerce":["E-commerce",13100,"Loja virtual.",[["products","Catálogo avançado","Categorias e variações",1290],["dashboard","Dashboard","Painel",1900],["payments","Pagamentos","Gateway",1290],["shipping","Frete","Cálculo de frete",990],["coupons","Cupons","Promoções",690],["customers","Área do cliente","Conta e pedidos",1290],["analytics","Analytics","Métricas",590],["seo","SEO","Busca",790],["integrations","Integrações","ERP, CRM ou APIs",1490]]],"web-app":["Aplicação Web / SaaS",105000,"Sistema web personalizado.",[["dashboard","Dashboard","Painel",2500],["auth","Autenticação","Login e sessões",1490],["roles","Permissões","Perfis",1490],["database","Banco de dados","Persistência",1990],["api","API","API própria",2490],["notifications","Notificações","Email ou push",990],["payments","Pagamentos","Assinaturas",1490],["files","Arquivos","Upload",1290],["analytics","Analytics","Métricas",690]]],"mobile":["Aplicativo Mobile",75000,"Android e iOS.",[["auth","Login e cadastro","Conta",1490],["dashboard","Dashboard","Painel",1900],["notifications","Push notifications","Notificações",990],["offline","Modo offline","Sincronização",1990],["payments","Pagamentos","Compras",1490],["maps","Mapas","Localização",1290],["camera","Câmera / mídia","Fotos e vídeo",990],["api","API / backend","Backend",2490],["store","Publicação","Lojas",1290]]],"api":["API / Backend",31900,"API ou backend próprio.",[["auth","Autenticação","Acesso",990],["database","Banco de dados","Dados",1490],["admin","Painel administrativo","Gestão",1900],["docs","Documentação","Docs",790],["webhooks","Webhooks","Eventos",690],["payments","Pagamentos","Gateway",1290],["storage","Armazenamento","Arquivos",990],["monitoring","Monitoramento","Logs",890]]],"integration":["Integração de Sistemas",41300,"Conexão entre sistemas.",[["api","API","Integração",990],["webhook","Webhooks","Eventos",690],["database","Banco de dados","Sincronização",1290],["crm","CRM","Conexão",990],["payments","Pagamentos","Gateway",990],["erp","ERP","Conexão",1490],["auth","Autenticação","OAuth/tokens",790]]],"automation":["Automação de Processos",9400,"Fluxos automatizados.",[["workflow","Workflow","Fluxo principal",790],["n8n","n8n","Automação",990],["webhook","Webhooks","Gatilhos",690],["schedules","Agendamentos","Rotinas",490],["email","Email","Envio",490],["sheets","Planilhas","Integração",590],["crm","CRM","Automação",990],["monitoring","Monitoramento","Logs",690]]],"bot":["Bot / Chatbot",26300,"Atendimento e processos.",[["faq","FAQ","Perguntas",490],["buttons","Menu interativo","Caminhos",590],["whatsapp","WhatsApp","Integração",1290],["telegram","Telegram","Integração",690],["crm","CRM","Registros",990],["scheduling","Agendamento","Agenda",890],["handoff","Atendimento humano","Transferência",590],["dashboard","Dashboard","Painel",1490]]],"customization":["Customização",21800,"Alterações em sistema existente.",[["ui","Interface","Visual",690],["page","Página / tela","Nova tela",790],["module","Módulo","Função",1490],["api","API","Endpoint",990],["auth","Acesso","Login/permissões",990],["database","Dados","Estrutura",990],["automation","Automação","Rotina",890],["deployment","Deploy","Publicação",490]]]};const OPTION_DIFFICULTY={
responsive:5,tracking:6,whatsapp:5,cookie:3,domain:4,deployment:7,accessibility:6,performance:8,multilang:9,security:9,support:5,search:6,forms:5,notifications:6,roles:7,files:7,backup:8,inventory:7,orders:8,reviews:5,abandoned:8,email:6,wishlist:4,"shipping-tracking":6,"multi-store":10,"reviews-admin":5,filters:7,audit:8,"admin-area":8,realtime:9,webhooks:6,queue:8,cache:7,monitoring:8,logs:5,"api-docs":4,"multi-tenant":12,biometric:6,"deep-links":5,sharing:4,location:6,chat:8,analytics:6,crash:7,tablet:5,"rate-limit":6,queues:8,integrations:9,cron:5,"api-version":5,sso:8,mapping:7,sync:9,retry:5,alerts:5,scheduler:5,conditions:5,filters:5,transform:6,http:6,database:8,approval:7,reports:7,commands:7,media:6,auth:7,payments:9,multichannel:10,knowledge:8,"queue":7,language:7,integration:8,dashboard:8,report:6,notification:5,migration:10,documentation:4};
const SERVICE_EXTRAS={
"landing-page":[["responsive","Design responsivo","Celular e tablet","Adapta layout, textos e controles para diferentes telas."],["tracking","Eventos de conversão","Ações importantes","Registra cliques, envios e outras ações para medir conversões."],["whatsapp","WhatsApp","Contato direto","Adiciona contato direto pelo WhatsApp."],["cookie","Aviso de cookies","Consentimento","Exibe e registra preferências de cookies quando necessário."],["domain","Domínio","Configuração","Prepara o projeto para domínio personalizado."],["deployment","Deploy","Publicação","Publica a página em produção."],["accessibility","Acessibilidade","Uso inclusivo","Melhora teclado, semântica, contraste e tecnologias assistivas."],["performance","Performance","Carregamento","Otimiza imagens, scripts e carregamento."],["multilang","Multilíngue","Idiomas","Disponibiliza a página em mais de um idioma."],["security","Segurança","Proteções","Adiciona validações e proteções básicas."]],
"site":[["search","Busca interna","Pesquisa","Permite pesquisar conteúdos dentro do site."],["forms","Formulários","Coleta de dados","Cria formulários para contato, cadastro e solicitações."],["notifications","Notificações","Avisos","Envia avisos conforme eventos definidos."],["roles","Permissões","Perfis de acesso","Define níveis de acesso para usuários e administradores."],["files","Arquivos","Uploads","Permite enviar e administrar arquivos."],["backup","Backup","Cópias de segurança","Preserva dados para reduzir risco de perda."],["performance","Performance","Velocidade","Otimiza carregamento e assets."],["accessibility","Acessibilidade","Uso inclusivo","Melhora navegação assistiva."],["security","Segurança","Proteções","Adiciona controles contra acesso indevido."],["support","Suporte","Atendimento","Estrutura canais e informações de suporte."]],
"ecommerce":[["inventory","Estoque","Controle de produtos","Controla disponibilidade e quantidade."],["orders","Gestão de pedidos","Operação","Organiza pedidos, status, pagamento e entrega."],["reviews","Avaliações","Opiniões","Permite coletar e exibir avaliações."],["abandoned","Carrinho abandonado","Recuperação","Cria fluxo para recuperar compras não finalizadas."],["email","Email transacional","Mensagens","Envia confirmações e atualizações de pedidos."],["wishlist","Lista de desejos","Favoritos","Permite salvar produtos para depois."],["search","Busca e filtros","Encontrar produtos","Facilita pesquisa e filtragem do catálogo."],["shipping-tracking","Rastreamento","Entrega","Exibe acompanhamento da entrega."],["multi-store","Multi-loja","Operações separadas","Estrutura mais de uma operação ou catálogo."],["reviews-admin","Moderação","Controle de conteúdo","Administra avaliações e conteúdo enviado por clientes."]],
"web-app":[["search","Busca","Pesquisa","Permite encontrar registros e conteúdos."],["filters","Filtros e relatórios","Análise","Cria filtros, consultas e relatórios."],["audit","Auditoria","Histórico de ações","Registra alterações e operações importantes."],["admin-area","Administração","Backoffice","Cria ferramentas internas de gestão."],["realtime","Tempo real","Atualização instantânea","Atualiza informações sem recarregar."],["webhooks","Webhooks","Eventos externos","Troca eventos automaticamente com outros sistemas."],["queue","Filas","Processamento assíncrono","Organiza tarefas demoradas em segundo plano."],["cache","Cache","Respostas rápidas","Reduz processamento repetido."],["backup","Backup","Recuperação","Preserva dados para recuperação."],["monitoring","Monitoramento","Saúde do sistema","Acompanha erros, disponibilidade e desempenho."]],
"mobile":[["biometric","Biometria","Acesso rápido","Usa autenticação biométrica compatível."],["deep-links","Links internos","Abrir telas","Abre telas específicas a partir de links."],["files","Arquivos","Upload e download","Permite trabalhar com arquivos."],["sharing","Compartilhamento","Compartilhar conteúdo","Usa recursos nativos para compartilhar."],["location","Geolocalização","Posição do dispositivo","Obtém localização quando autorizada."],["chat","Chat","Conversas","Cria mensagens entre usuários ou atendimento."],["realtime","Tempo real","Atualização instantânea","Mantém dados atualizados."],["analytics","Analytics","Métricas","Registra eventos de uso."],["crash","Monitoramento de erros","Diagnóstico","Registra falhas para manutenção."],["accessibility","Acessibilidade","Uso inclusivo","Melhora suporte assistivo."]],
"api":[["rate-limit","Rate limit","Controle de requisições","Limita chamadas para proteger a API."],["queues","Filas","Processamento","Executa tarefas demoradas fora da requisição."],["cache","Cache","Desempenho","Armazena respostas temporariamente."],["search","Busca","Pesquisa","Adiciona pesquisa e filtros."],["roles","Permissões","Autorização","Controla operações por usuário ou aplicação."],["audit","Auditoria","Rastreamento","Registra alterações e operações."],["integrations","Integrações","Serviços externos","Conecta APIs, CRMs, ERPs e serviços."],["cron","Agendamentos","Tarefas automáticas","Executa rotinas em horários definidos."],["realtime","Tempo real","Eventos","Atualiza clientes em tempo real."],["api-version","Versionamento","Evolução da API","Organiza versões para evolução segura."]],
"integration":[["sso","SSO","Login centralizado","Permite autenticação por provedor de identidade."],["mapping","Mapeamento de dados","Transformação","Converte campos e formatos entre sistemas."],["sync","Sincronização","Atualização de dados","Mantém registros equivalentes atualizados."],["queue","Filas","Processamento seguro","Organiza grandes volumes de eventos."],["retry","Retry","Tentativas automáticas","Repete operações temporariamente falhas."],["logs","Logs","Rastreamento","Registra integrações e resultados."],["alerts","Alertas","Falhas","Avisa quando uma integração falha."],["scheduler","Agendamento","Rotinas","Executa sincronizações em horários definidos."],["files","Arquivos","Transferência","Transfere arquivos entre plataformas."],["monitoring","Monitoramento","Saúde","Acompanha disponibilidade das conexões."]],
"automation":[["conditions","Condições","Decisões","Escolhe caminhos de acordo com os dados."],["filters","Filtros","Seleção","Processa apenas eventos que atendam às regras."],["transform","Transformação","Tratamento de dados","Limpa e reorganiza dados."],["http","HTTP","Requisições","Faz chamadas para APIs durante o fluxo."],["database","Banco de dados","Dados","Consulta ou altera dados automaticamente."],["notifications","Notificações","Avisos","Envia alertas quando algo acontece."],["approval","Aprovação","Intervenção humana","Pausa o fluxo para aprovação."],["retry","Retry","Tentativas","Repete etapas que falharam temporariamente."],["files","Arquivos","Processamento","Move, cria ou processa arquivos."],["reports","Relatórios","Resumo automático","Gera e envia informações consolidadas."]],
"bot":[["commands","Comandos","Ações","Executa ações específicas por comandos."],["forms","Formulários","Coleta de dados","Coleta informações estruturadas na conversa."],["media","Mídia","Imagens e arquivos","Trabalha com arquivos e mídias."],["notifications","Notificações","Avisos","Envia mensagens automáticas."],["auth","Autenticação","Identidade","Identifica o usuário quando necessário."],["payments","Pagamentos","Cobrança","Integra operações de pagamento."],["integrations","Integrações","Serviços externos","Conecta APIs, ERP, CRM e agenda."],["analytics","Analytics","Métricas","Mede conversas e etapas."],["multichannel","Multicanal","Vários canais","Reaproveita fluxos em vários canais."],["knowledge","Base de conhecimento","Conteúdo","Organiza informações usadas pelo bot."]],
"customization":[["integration","Integração","Serviço externo","Conecta o sistema a uma plataforma externa."],["dashboard","Dashboard","Painel","Cria telas administrativas e indicadores."],["report","Relatório","Informações","Cria consultas e relatórios personalizados."],["notification","Notificações","Avisos","Adiciona emails e alertas."],["search","Busca","Pesquisa","Adiciona busca e filtros."],["performance","Performance","Otimização","Melhora carregamento e processamento."],["security","Segurança","Proteção","Adiciona validações e controles."],["backup","Backup","Recuperação","Estrutura cópias de segurança."],["monitoring","Monitoramento","Saúde","Acompanha erros e disponibilidade."],["accessibility","Acessibilidade","Uso inclusivo","Adapta componentes para acessibilidade."]]
};
Object.keys(READY_SERVICES).forEach(k=>{
  const base=READY_SERVICES[k][3]||[];
  const existing=new Set(base.map(o=>o[0]));
  (SERVICE_EXTRAS[k]||[]).forEach(o=>{if(!existing.has(o[0]))base.push([o[0],o[1],o[2],o[3],OPTION_DIFFICULTY[o[0]]||6]);});
});
function money(v){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(v)}function serviceOptionPrices(service){
  const target=service[1],weights=service[3].map(o=>Number(o[4]??o[3])||0);
  if(!Number.isFinite(target)||target<=0)return weights;
  const sum=weights.reduce((a,b)=>a+b,0);
  if(!sum)return weights.map(()=>0);
  const raw=weights.map(w=>w*target/sum);
  const prices=raw.map(Math.floor);
  let remainder=target-prices.reduce((a,b)=>a+b,0);
  raw.map((v,i)=>({i,f:v-Math.floor(v)})).sort((a,b)=>b.f-a.f).forEach(x=>{if(remainder>0){prices[x.i]++;remainder--;}});
  return prices;
}

function beginnerExplanation(o){
  const label=String(o[1]||"");
  const detail=String(o[3]||o[2]||"");
  const map={
    "Dashboard":"É um painel de controle onde você consegue ver informações importantes e administrar partes do sistema em um só lugar.",
    "API":"É uma ponte que permite que dois sistemas troquem informações e comandos automaticamente.",
    "Autenticação":"É o sistema de login que confirma quem é o usuário antes de permitir acesso.",
    "Banco de dados":"É onde as informações do sistema ficam organizadas e podem ser salvas e consultadas.",
    "Analytics":"Mostra dados sobre acessos e uso para entender o que está acontecendo no sistema.",
    "SEO":"Ajuda páginas e conteúdos a serem encontrados e entendidos por mecanismos de busca.",
    "Performance":"É o trabalho de deixar o sistema carregar e responder mais rapidamente.",
    "Acessibilidade":"Adapta a interface para que mais pessoas consigam usar o sistema, inclusive com teclado ou leitores de tela.",
    "Segurança":"Adiciona proteções para reduzir riscos de acesso indevido, dados expostos e uso abusivo.",
    "Backup":"Cria cópias de segurança para que informações possam ser recuperadas depois de uma falha.",
    "Monitoramento":"Acompanha o funcionamento do sistema e ajuda a identificar erros ou indisponibilidade.",
    "Permissões":"Define o que cada tipo de usuário pode ver ou fazer.",
    "Notificações":"Envia avisos automaticamente quando determinadas ações ou acontecimentos ocorrem.",
    "Integrações":"Faz o sistema conversar com outros serviços, aplicativos ou plataformas.",
    "Webhooks":"Permite que um sistema avise outro automaticamente quando um evento acontece.",
    "Pagamentos":"Conecta o projeto a meios de cobrança para receber pagamentos.",
    "Chat":"Cria uma área para troca de mensagens entre pessoas ou com atendimento.",
    "Multilíngue":"Permite apresentar o mesmo sistema em diferentes idiomas."
  };
  return map[label]||detail;
}
function servicePage(id){
  const safeId=Object.prototype.hasOwnProperty.call(READY_SERVICES,id)?id:"site";
  const s=READY_SERVICES[safeId]||READY_SERVICES.site;
  const prices=serviceOptionPrices(s);
  const opts=s[3].map((o,i)=>{
    const price=prices[i];
    return '<div class="service-option-wrap"><label class="service-option"><input type="checkbox" data-service-option data-price="'+price+'" data-label="'+esc(o[1])+'"><span><strong>'+esc(o[1])+'</strong><small>'+esc(o[2])+'</small></span><b class="service-option-price"><small>Preço</small>'+money(price)+'</b></label><details class="service-option-info"><summary>O que isso faz?</summary><p>'+esc(beginnerExplanation(o))+'</p></details></div>';
  }).join("");
  const cap=s[1]==null?"Sem teto fixo":"Teto máximo: "+money(s[1]);
  return '<main id="main-content" class="section shell commercial-config-page"><div class="service-config-head"><a class="text-link" href="#/comercial">← Voltar para serviços</a><span class="eyebrow">Configurador · '+esc(s[0])+'</span><h2>'+esc(s[0])+'</h2><p class="section-lead">'+esc(s[2])+' Escolha os recursos que deseja incluir.</p></div><div class="service-config-layout"><section class="service-options-panel"><div class="config-panel-head"><div><span class="eyebrow">01 · Configure</span><h3>Monte sua solução.</h3></div><span class="config-cap">'+cap+'</span></div><div class="service-options">'+opts+'</div></section><aside class="service-summary"><span class="eyebrow">02 · Orçamento estimado</span><h3>Seu projeto</h3><div class="summary-start"><span>Valor atual</span><strong>R$ 0</strong></div><div class="summary-selected" data-service-selected><span>Nenhum recurso selecionado.</span></div><div class="summary-total"><span>Total estimado</span><strong data-service-total>R$ 0</strong></div><p class="muted">O projeto começa em R$ 0. Cada recurso selecionado adiciona seu valor ao orçamento. Os valores de cada recurso são proporcionais ao esforço técnico, complexidade e necessidade relativa dentro do serviço.</p><button class="btn" type="button" data-service-request data-service-id="'+esc(safeId)+'">Solicitar este projeto →</button></aside></div></main>';
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
  else if(h.startsWith("/servicos/"))c=servicePage(decodeURIComponent(h.split("/")[2]||"site"));
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
  document.body.classList.toggle("menu-open",state.menu);
  document.body.classList.remove("loading");
  const titleMap={"/":"KORCZAK TECHNOLOGY","/comercial":"Comercial","/institucional":"Institucional","/empresa":"Empresa","/portfolio":"Portfólio","/produtos":"Produtos","/workspace":"Korczak Workspace","/kos":"KOS","/contato":"Contato","/conta":"Meu perfil","/historia":"História","/visao":"Visão","/valores":"Valores","/parcerias":"Parcerias","/carreiras":"Carreiras","/faq":"FAQ","/privacidade":"Privacidade","/uso":"Uso","/servico":"Serviço"};
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
  if(action==="reload"){location.reload();return true}
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
addEventListener("hashchange",()=>{if(state.menu)state.menu=false;render();window.scrollTo({top:0,behavior:"smooth"})});

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
