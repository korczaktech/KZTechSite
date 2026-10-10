import express from "express";
import helmet from "helmet";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {MongoClient,ObjectId} from "mongodb";
import Stripe from "stripe";
import {randomUUID,randomBytes,createHash} from "node:crypto";

const app=express();
const PORT=Number(process.env.PORT||3000);
const isProd=process.env.NODE_ENV==="production";
const SECRET=process.env.JWT_SECRET||"";
const SITE_URL=(process.env.SITE_URL||"").replace(/\/$/,"");
const DEFAULT_FRONTEND_ORIGINS=["https://korczaktech.github.io"];
const FRONTEND_URLS=(process.env.FRONTEND_URL||"").split(",").map(v=>v.trim().replace(/\/$/,"")).filter(Boolean);
const FRONTEND_ORIGINS=FRONTEND_URLS.map(v=>{try{return new URL(v).origin}catch{return v}}).filter(Boolean);
const ALLOWED_ORIGINS=[...new Set([...DEFAULT_FRONTEND_ORIGINS,...FRONTEND_ORIGINS,SITE_URL,"https://kztechsite.onrender.com"].filter(Boolean))];

if(isProd&&(!SECRET||SECRET.length<32))throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
if(isProd&&!SITE_URL)throw new Error("SITE_URL must be configured in production.");
if(isProd&&!FRONTEND_URLS.length)throw new Error("FRONTEND_URL must be configured in production.");

let db=null;
let accountsDb=null;
const mongo=process.env.MONGODB_URI?new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000}):null;
const accountsMongo=process.env.MONGODB_ACCOUNTS_URI?new MongoClient(process.env.MONGODB_ACCOUNTS_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000}):null;
const stripe=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
const rateBuckets=new Map();
function rateLimit({windowMs=60000,max=60}={}){return (req,res,next)=>{const now=Date.now(),key=req.ip||"unknown",old=rateBuckets.get(key);if(!old||now-old.started>=windowMs){rateBuckets.set(key,{started:now,count:1});return next()}old.count++;if(old.count>max){res.set("Retry-After",String(Math.ceil((windowMs-(now-old.started))/1000)));return res.status(429).json({error:"Muitas solicitações. Aguarde alguns segundos e tente novamente."})}next()}}
setInterval(()=>{const now=Date.now();for(const [k,v] of rateBuckets)if(now-v.started>900000)rateBuckets.delete(k)},900000).unref();
const FRONTEND_URL=FRONTEND_URLS[0]||"";
const GITHUB_REPO=String(process.env.GITHUB_REPO||"korczaktech/KZTechSite").replace(/^https?:\/\/github\.com\//,"").replace(/\.git$/,"").replace(/^\/+|\/+$/g,"");
const GITHUB_BRANCH=String(process.env.GITHUB_BRANCH||"main").trim()||"main";
const GITHUB_TOKEN=String(process.env.GITHUB_TOKEN||"").trim();
const checkoutBase=FRONTEND_URL||SITE_URL||"http://localhost:3000";
const PLANOS_PADRAO={
  "korczak-ai":[
    {id:"free",name:"Free",price:0,preSalePrice:0,billing:"mês",tag:"Grátis",description:"Recursos essenciais para conhecer e usar o Korczak AI.",features:["Acesso gratuito","Recursos essenciais","Limites de uso"]},
    {id:"go",name:"Go",price:21,preSalePrice:18,billing:"mês",tag:"Entrada",description:"Mais capacidade para uso frequente.",features:["Tudo do Free","Mais capacidade","Recursos ampliados"]},
    {id:"plus",name:"Plus",price:26,preSalePrice:22,billing:"mês",tag:"Uso diário",description:"Para uso frequente de inteligência e criação.",features:["Tudo do Go","Mais ferramentas","Uso mais amplo"]},
    {id:"pro",name:"Pro",price:521,preSalePrice:443,billing:"mês",tag:"Profissional",description:"Para trabalho profissional e tarefas intensas.",features:["Tudo do Plus","Limites maiores","Recursos profissionais"]}
  ],
  "ide":[
    {id:"free",name:"Free",price:0,preSalePrice:0,billing:"mês",tag:"Grátis",description:"Ambiente de desenvolvimento para começar.",features:["Editor essencial","Uso individual","Sem mensalidade"]},
    {id:"pro",name:"Pro",price:52,preSalePrice:44,billing:"mês",tag:"Individual",description:"Desenvolvimento diário com assistência ampliada.",features:["Tudo do Free","Assistência avançada","Mais uso"]},
    {id:"pro-plus",name:"Pro+",price:203,preSalePrice:173,billing:"mês",tag:"Avançado",description:"Projetos complexos e modelos premium.",features:["Tudo do Pro","Modelos premium","Maior capacidade"]},
    {id:"max",name:"Max",price:521,preSalePrice:443,billing:"mês",tag:"Alta utilização",description:"Fluxos de desenvolvimento de alto volume.",features:["Tudo do Pro+","Alto volume","Prioridade"]},
    {id:"business",name:"Business",price:74,preSalePrice:63,billing:"usuário/mês",tag:"Equipes",description:"Gestão e governança para equipes.",features:["Tudo do Pro","Controle de acesso","Governança"]},
    {id:"enterprise",name:"Enterprise",price:152,preSalePrice:129,billing:"usuário/mês",tag:"Empresarial",description:"Para organizações em escala.",features:["Tudo do Business","Recursos corporativos","Gestão ampliada"]}
  ],
  "hub":[
    {id:"starter",name:"Starter",price:27,preSalePrice:23,billing:"usuário/mês",tag:"Entrada",description:"Produtividade e colaboração essenciais.",features:["Email profissional","30 GB por usuário","Apps HUB"]},
    {id:"standard",name:"Standard",price:55,preSalePrice:47,billing:"usuário/mês",tag:"Mais usado",description:"Mais armazenamento e colaboração.",features:["Tudo do Starter","2 TB por usuário","Recursos avançados"]},
    {id:"plus",name:"Plus",price:86,preSalePrice:73,billing:"usuário/mês",tag:"Avançado",description:"Mais armazenamento, segurança e administração.",features:["Tudo do Standard","5 TB por usuário","Segurança avançada"]},
    {id:"enterprise",name:"Enterprise",price:null,preSalePrice:null,billing:"sob consulta",tag:"Empresarial",description:"Configuração corporativa sob escopo.",features:["Recursos Enterprise","Controles corporativos","Preço sob consulta"]}
  ],
  "erp":[{id:"erp-base",name:"Base de Gestão",price:6000,preSalePrice:5100,billing:"implantação",monthly:350,preSaleMonthly:298,tag:"Obrigatório",description:"Núcleo do ERP.",features:["Cadastros","Usuários","Permissões"]},{id:"erp-financeiro",name:"Financeiro",price:5000,preSalePrice:4250,billing:"implantação",monthly:350,preSaleMonthly:298,tag:"Alta utilidade",description:"Financeiro.",features:["Contas","Fluxo de caixa","Relatórios"]},{id:"erp-crm",name:"CRM e Vendas",price:3500,preSalePrice:2975,billing:"implantação",monthly:250,preSaleMonthly:213,tag:"Comercial",description:"CRM e vendas.",features:["Clientes","Funil","Vendas"]},{id:"erp-estoque",name:"Estoque",price:4000,preSalePrice:3400,billing:"implantação",monthly:300,preSaleMonthly:255,tag:"Operacional",description:"Controle de estoque.",features:["Saldos","Entradas e saídas","Movimentações"]},{id:"erp-fiscal",name:"Fiscal",price:5000,preSalePrice:4250,billing:"implantação",monthly:350,preSaleMonthly:298,tag:"Complexidade alta",description:"Rotinas fiscais.",features:["Regras fiscais","Documentos","Integração"]},{id:"erp-rh",name:"RH",price:3000,preSalePrice:2550,billing:"implantação",monthly:200,preSaleMonthly:170,tag:"Gestão de pessoas",description:"Rotinas de RH.",features:["Colaboradores","Dados internos","Rotinas"]},{id:"erp-bi",name:"BI e Indicadores",price:3500,preSalePrice:2975,billing:"implantação",monthly:250,preSaleMonthly:213,tag:"Análise",description:"Indicadores e dashboards.",features:["Dashboards","KPIs","Relatórios"]}],
  "flow":[{id:"flow-base",name:"Base de Processos",price:2000,preSalePrice:1700,billing:"implantação",monthly:250,preSaleMonthly:213,tag:"Obrigatório",description:"Núcleo de processos.",features:["Processos","Etapas","Responsáveis"]},{id:"flow-aprovacoes",name:"Aprovações",price:1500,preSalePrice:1275,billing:"implantação",monthly:200,preSaleMonthly:170,tag:"Governança",description:"Aprovações por etapa.",features:["Alçadas","Aprovação","Histórico"]},{id:"flow-automacoes",name:"Automações",price:3000,preSalePrice:2550,billing:"implantação",monthly:350,preSaleMonthly:298,tag:"Complexidade alta",description:"Regras e automações.",features:["Gatilhos","Ações","Condições"]},{id:"flow-formularios",name:"Formulários",price:1500,preSalePrice:1275,billing:"implantação",monthly:200,preSaleMonthly:170,tag:"Entrada de dados",description:"Formulários conectados a processos.",features:["Formulários","Campos","Validações"]},{id:"flow-integracoes",name:"Integrações",price:3000,preSalePrice:2550,billing:"implantação",monthly:350,preSaleMonthly:298,tag:"Integração",description:"APIs e sistemas externos.",features:["APIs","Webhooks","Sincronização"]}],
  "vision":[{id:"vision-base",name:"Base Analítica",price:3000,preSalePrice:2550,billing:"implantação",monthly:600,preSaleMonthly:510,tag:"Obrigatório",description:"Núcleo analítico.",features:["Modelo","Indicadores","Painel"]},{id:"vision-dashboards",name:"Dashboards",price:3000,preSalePrice:2550,billing:"implantação",monthly:600,preSaleMonthly:510,tag:"Visualização",description:"Painéis personalizados.",features:["Dashboards","Filtros","Visões"]},{id:"vision-bi",name:"BI Avançado",price:4500,preSalePrice:3825,billing:"implantação",monthly:900,preSaleMonthly:765,tag:"Complexidade alta",description:"Análises avançadas.",features:["Cruzamentos","Análises","KPIs"]},{id:"vision-fontes",name:"Fontes de Dados",price:3000,preSalePrice:2550,billing:"implantação",monthly:700,preSaleMonthly:595,tag:"Integração",description:"Conectores e ingestão.",features:["Conectores","Importação","Atualização"]},{id:"vision-alertas",name:"Alertas e Monitoramento",price:2000,preSalePrice:1700,billing:"implantação",monthly:350,preSaleMonthly:298,tag:"Operacional",description:"Alertas por condições.",features:["Alertas","Regras","Acompanhamento"]}],
  "ops":[{id:"ops-base",name:"Base Operacional",price:4500,preSalePrice:3825,billing:"implantação",monthly:700,preSaleMonthly:595,tag:"Obrigatório",description:"Núcleo operacional.",features:["Painel","Acessos","Serviços"]},{id:"ops-monitoramento",name:"Monitoramento",price:4500,preSalePrice:3825,billing:"implantação",monthly:700,preSaleMonthly:595,tag:"Alta utilidade",description:"Métricas e eventos.",features:["Métricas","Health checks","Alertas"]},{id:"ops-admin",name:"Administração",price:3500,preSalePrice:2975,billing:"implantação",monthly:600,preSaleMonthly:510,tag:"Gestão",description:"Configurações e administração.",features:["Configurações","Acessos","Rotinas"]},{id:"ops-incidentes",name:"Incidentes e Suporte",price:3000,preSalePrice:2550,billing:"implantação",monthly:500,preSaleMonthly:425,tag:"Operacional",description:"Gestão de incidentes.",features:["Chamados","Prioridades","Histórico"]},{id:"ops-auditoria",name:"Auditoria",price:3000,preSalePrice:2550,billing:"implantação",monthly:500,preSaleMonthly:425,tag:"Governança",description:"Rastreabilidade.",features:["Logs","Histórico","Auditoria"]},{id:"ops-infra",name:"Infraestrutura",price:4500,preSalePrice:3825,billing:"implantação",monthly:700,preSaleMonthly:595,tag:"Complexidade alta",description:"Recursos técnicos.",features:["Recursos","Ambientes","Indicadores"]}],
  "connect":[{id:"connect-base",name:"Base de Integrações",price:3500,preSalePrice:2975,billing:"implantação",monthly:500,preSaleMonthly:425,tag:"Obrigatório",description:"Núcleo de integrações.",features:["Conexões","Credenciais","Logs"]},{id:"connect-api",name:"API Gateway",price:3500,preSalePrice:2975,billing:"implantação",monthly:500,preSaleMonthly:425,tag:"Integração",description:"APIs organizadas.",features:["APIs","Autenticação","Acesso"]},{id:"connect-webhooks",name:"Webhooks",price:2000,preSalePrice:1700,billing:"implantação",monthly:300,preSaleMonthly:255,tag:"Automação",description:"Eventos em tempo real.",features:["Eventos","Disparos","Recebimento"]},{id:"connect-conectores",name:"Conectores",price:4500,preSalePrice:3825,billing:"implantação",monthly:600,preSaleMonthly:510,tag:"Complexidade alta",description:"Integrações específicas.",features:["Conectores","Mapeamento","Sincronização"]},{id:"connect-identidade",name:"Identidade e SSO",price:3000,preSalePrice:2550,billing:"implantação",monthly:450,preSaleMonthly:383,tag:"Segurança",description:"Identidade e acesso centralizado.",features:["SSO","Autenticação","Acesso"]}],
  "mobile":[{id:"mobile-base",name:"Base do Aplicativo",price:5000,preSalePrice:4250,billing:"implantação",monthly:700,preSaleMonthly:595,tag:"Obrigatório",description:"Estrutura principal do app.",features:["Shell","Navegação","Arquitetura"]},{id:"mobile-auth",name:"Autenticação",price:2500,preSalePrice:2125,billing:"implantação",monthly:350,preSaleMonthly:298,tag:"Segurança",description:"Login e acesso.",features:["Login","Sessões","Permissões"]},{id:"mobile-notificacoes",name:"Notificações",price:2000,preSalePrice:1700,billing:"implantação",monthly:300,preSaleMonthly:255,tag:"Comunicação",description:"Notificações push.",features:["Push","Preferências","Eventos"]},{id:"mobile-offline",name:"Modo Offline",price:3500,preSalePrice:2975,billing:"implantação",monthly:500,preSaleMonthly:425,tag:"Complexidade alta",description:"Uso offline e sincronização.",features:["Cache","Sincronização","Recuperação"]},{id:"mobile-publicacao",name:"Publicação e Distribuição",price:3000,preSalePrice:2550,billing:"implantação",monthly:400,preSaleMonthly:340,tag:"Operação",description:"Distribuição e manutenção.",features:["Builds","Distribuição","Atualizações"]}],
  "wms":[{id:"wms-base",name:"Base WMS",price:7000,preSalePrice:5950,billing:"implantação",monthly:900,preSaleMonthly:765,tag:"Obrigatório",description:"Núcleo de armazém.",features:["Estrutura","Usuários","Regras"]},{id:"wms-estoque",name:"Estoque e Endereçamento",price:9000,preSalePrice:7650,billing:"implantação",monthly:1200,preSaleMonthly:1020,tag:"Alta utilidade",description:"Estoque e posições.",features:["Endereçamento","Saldos","Movimentações"]},{id:"wms-recebimento",name:"Recebimento",price:6000,preSalePrice:5100,billing:"implantação",monthly:900,preSaleMonthly:765,tag:"Operacional",description:"Entrada e conferência.",features:["Recebimento","Conferência","Divergências"]},{id:"wms-picking",name:"Picking",price:8000,preSalePrice:6800,billing:"implantação",monthly:1100,preSaleMonthly:935,tag:"Complexidade alta",description:"Separação de pedidos.",features:["Ondas","Separação","Conferência"]},{id:"wms-expedicao",name:"Expedição",price:6000,preSalePrice:5100,billing:"implantação",monthly:900,preSaleMonthly:765,tag:"Operacional",description:"Despacho e rastreabilidade.",features:["Expedição","Conferência","Rastreabilidade"]},{id:"wms-barcodes",name:"Código de Barras",price:5000,preSalePrice:4250,billing:"implantação",monthly:750,preSaleMonthly:638,tag:"Integração",description:"Leitura e identificação.",features:["Leitura","Etiquetas","Identificação"]},{id:"wms-bi",name:"Painel Logístico",price:5000,preSalePrice:4250,billing:"implantação",monthly:700,preSaleMonthly:595,tag:"Análise",description:"KPIs de armazém.",features:["KPIs","Dashboards","Relatórios"]}]
};
const commercialProducts=Object.fromEntries([
  ["erp",{amount:0,currency:"brl",priceId:""}]
]);

const products=[
["korczak-ai","KORCZAK AI","Inteligência","Produto iniciado: inteligência e automação para o ecossistema Korczak.","Iniciado"],
["ide","Korczak IDE","Desenvolvimento","Produto iniciado: ambiente de desenvolvimento para projetos Korczak.","Iniciado"],
["morok","MOROK","Assistente","Assistente pessoal e operacional em desenvolvimento.","Em desenvolvimento"],
["erp","KORCZAK ERP","Gestão","Produto iniciado: gestão empresarial para clientes, processos, financeiro e operação.","Iniciado"],
["flow","KORCZAK FLOW","Operations","Produto planejado para fluxos e automações operacionais.","Planejado"],
["vision","KORCZAK VISION","Intelligence","Produto planejado para visão e inteligência operacional.","Planejado"],
["ops","KORCZAK OPS","Operations","Produto planejado para operações e administração do ecossistema.","Planejado"],
["connect","KORCZAK CONNECT","Connectivity","Produto planejado para integração entre pessoas, sistemas e serviços.","Planejado"],
["mobile","KORCZAK MOBILE","Mobile","Produto planejado para experiências móveis do ecossistema.","Planejado"],
["wms","KORCZAK WMS","Operations","Sistema de gestão de armazém planejado para operações logísticas.","Planejado"],
["hub","HUB","HUB","Suíte central que reúne os aplicativos de produtividade e colaboração.","Em construção"],
["vault","Vault","HUB","Arquivos e armazenamento.","Planejado"],
["nexus","Nexus","HUB","Documentos.","Em construção"],
["nexa","Nexa","HUB","Planilhas.","Planejado"],
["veya","Veya","HUB","Apresentações.","Planejado"],
["formly","Formly","HUB","Formulários.","Planejado"],
["korvo","Korvo","HUB","E-mail.","Planejado"],
["chrona","Chrona","HUB","Calendário.","Planejado"],
["meet","Meet","HUB","Videoconferências.","Planejado"],
["pulse","Pulse","HUB","Chat e comunicação.","Planejado"],
["acta","Acta","HUB","Tarefas.","Planejado"],
["memo","Memo","HUB","Anotações.","Planejado"],
["people","People","HUB","Contatos.","Planejado"],
["web","Web","HUB","Criação de sites.","Planejado"],
["klash","Klash","HUB","Notas rápidas e lembretes.","Planejado"]
].map(x=>({id:x[0],name:x[1],type:x[2],description:x[3],status:x[4]}));

app.disable("x-powered-by");
app.set("trust proxy",1);
app.use(helmet({
  contentSecurityPolicy:{
    directives:{
      defaultSrc:["'self'"],
      scriptSrc:["'self'","https://ajax.googleapis.com","https://cdn.jsdelivr.net"],
      styleSrc:["'self'","'unsafe-inline'"],
      imgSrc:["'self'","data:"],
      connectSrc:["'self'","https://kztechsite.onrender.com"],
      fontSrc:["'self'","data:"],
      objectSrc:["'none'"],
      baseUri:["'self'"],
      frameAncestors:["'none'"],
      formAction:["'self'","https://checkout.stripe.com"]
    }
  },
  crossOriginEmbedderPolicy:false,
  referrerPolicy:{policy:"strict-origin-when-cross-origin"}
}));
app.use(cors({
  origin(origin,callback){
    if(!origin||ALLOWED_ORIGINS.includes(origin))return callback(null,true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials:true,
  methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders:["Content-Type","Authorization"],
  maxAge:86400
}));
app.post("/api/stripe/webhook",express.raw({type:"application/json",limit:"256kb"}),async(req,res)=>{
  if(!stripe||!process.env.STRIPE_WEBHOOK_SECRET)return res.status(503).json({error:"Stripe webhook não configurado"});
  const signature=req.headers["stripe-signature"];
  if(!signature)return res.status(400).json({error:"Assinatura Stripe ausente"});
  let event;
  try{event=stripe.webhooks.constructEvent(req.body,signature,process.env.STRIPE_WEBHOOK_SECRET)}
  catch{ return res.status(400).json({error:"Assinatura Stripe inválida"}) }
  try{
    const session=event.data?.object;
    if(db&&session?.metadata?.userId&&session?.id){
      const status=event.type==="checkout.session.completed"?"paid":
        event.type==="checkout.session.async_payment_succeeded"?"paid":
        event.type==="checkout.session.async_payment_failed"?"payment_failed":
        event.type==="checkout.session.expired"?"expired":null;
      if(status){
        await db.collection("orders").updateOne(
          {sessionId:session.id,userId:session.metadata.userId},
          {$set:{status,paymentStatus:session.payment_status||null,updatedAt:new Date()},$setOnInsert:{productId:session.metadata.productId||null,createdAt:new Date()}},
          {upsert:true}
        );
      }
    }
    res.json({received:true});
  }catch(err){
    console.error("Stripe webhook error:",err?.message||err);
    res.status(500).json({error:"Erro ao processar webhook"});
  }
});
app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:false,limit:"100kb"}));
app.use("/admin",express.static("admin",{extensions:["html"]}));

const TIPOS_CONTEUDO=new Set(["texto","html","imagem","link","atributo","estilo","classe","visibilidade"]);
const emailValida=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||"").trim());
function idMongo(v){try{return new ObjectId(v)}catch{return null}}
const CENTRAL_APPS=["Site","Morok","IDE","AI","ERP","FLOW","DOCUMENTS","VISION","OPS","CONNECT","MOBILE","Vault","Nexus","Nexa","Veya","Formly","Korvo","Chrona","Meet","Pulse","Acta","Memo","People","Web","Klash"];
function centralConta({id=randomUUID(),name,email,siteSenha="",role="user",verified=false,createdAt=new Date()}){const agora=createdAt||new Date();return {id,Nome:name,Email:email,Telefone:null,Autenticacao:{Email:email,SenhaHash:siteSenha,EmailVerificado:Boolean(verified)},Planos:{KOS:{Free:true,Hephaestus:false,Apollo:false,Athena:false,Zeus:false,Veles:false,Marzanna:false},Workspace:{Free:true,Hephaestus:false,Apollo:false,Athena:false,Zeus:false,Veles:false,Marzanna:false}},Verified:Boolean(verified),EmailVerified:Boolean(verified),PhoneVerified:false,Conta:{Status:"active",Role:role,CriadaEm:agora.toISOString(),AtualizadaEm:agora.toISOString(),UltimoLogin:null},Produtos:{KOS:true,Workspace:true,Site:true},Seguranca:{TwoFactorEnabled:false,RecoveryEnabled:true},Preferencias:{Idioma:"pt-BR",Tema:"dark"},Metadados:{OrigemCadastro:"KZTechSite",VersaoCadastro:"1.0.0",UltimoDispositivo:"",UltimoIP:null}};}

function accountSafe(u){return {_id:String(u.id),id:String(u.id),name:u.Nome,email:u.Autenticacao?.Email||u.Email,phone:u.Telefone||null,role:u.Conta?.Role||"user",verified:Boolean(u.Autenticacao?.EmailVerificado??u.EmailVerified??u.Verified)};}
const GMAIL_CLIENT_ID=String(process.env.GMAIL_CLIENT_ID||"").trim(),GMAIL_CLIENT_SECRET=String(process.env.GMAIL_CLIENT_SECRET||"").trim(),GMAIL_REFRESH_TOKEN=String(process.env.GMAIL_REFRESH_TOKEN||"").trim(),GMAIL_SENDER_EMAIL=String(process.env.GMAIL_SENDER_EMAIL||"").trim().toLowerCase();
const GMAIL_NOTIFICATION_EMAIL=String(process.env.GMAIL_NOTIFICATION_EMAIL||"").trim().toLowerCase();
const GMAIL_API_CONFIGURED=Boolean(GMAIL_CLIENT_ID&&GMAIL_CLIENT_SECRET&&GMAIL_REFRESH_TOKEN&&GMAIL_SENDER_EMAIL&&emailValida(GMAIL_SENDER_EMAIL));
const hashAuthToken=v=>createHash("sha256").update(String(v)).digest("hex");
async function gmailAccessToken(){
 if(!GMAIL_API_CONFIGURED)throw new Error("Configure as credenciais OAuth do Gmail no Render.");
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:GMAIL_CLIENT_ID,client_secret:GMAIL_CLIENT_SECRET,refresh_token:GMAIL_REFRESH_TOKEN,grant_type:"refresh_token"})});
 const d=await r.json().catch(()=>({}));if(!r.ok||!d.access_token){console.error("Gmail OAuth falhou:",d.error||r.status);throw new Error("Não foi possível autorizar o Gmail.");}return d.access_token;
}
async function sendGmail({to,subject,text}){
 const recipient=String(to||"").trim().toLowerCase();if(!emailValida(recipient))throw new Error("Destinatário inválido.");
 const enc=v=>Buffer.from(String(v),"utf8").toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
 const mime=[`From: Korczak Technologies <${GMAIL_SENDER_EMAIL}>`,`To: ${recipient}`,`Subject: =?UTF-8?B?${Buffer.from(String(subject||"Korczak Technologies").replace(/[\r\n]/g," ")).toString("base64")}?=`,"MIME-Version: 1.0",'Content-Type: text/plain; charset="UTF-8"',"Content-Transfer-Encoding: base64","",Buffer.from(String(text||""),"utf8").toString("base64")].join("\r\n");
 const token=await gmailAccessToken(),r=await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({raw:enc(mime)})}),d=await r.json().catch(()=>({}));
 if(!r.ok){console.error("Gmail API erro:",d.error?.status||r.status);throw new Error("O Gmail não conseguiu enviar a mensagem.");}return d;
}
async function emailLink(user,value,type){
 const route=type==="verificar"?"verificar-email":"redefinir-senha";
 const link=`${FRONTEND_URL||SITE_URL}/#/${route}?token=${encodeURIComponent(value)}`;
 await sendGmail({to:user.Email,subject:type==="verificar"?"Verifique seu e-mail — Korczak Technologies":"Recuperação de acesso — Korczak Technologies",text:`Olá, ${user.Nome||"usuário"}!\n\n${type==="verificar"?"Confirme seu e-mail":"Para definir uma nova senha"}: \n${link}\n\nEste link expira em 30 minutos. Se você não solicitou esta ação, ignore a mensagem.\n\nKorczak Technologies`});
}
async function securityEmail(user,subject,message){if(!GMAIL_API_CONFIGURED)return;try{await sendGmail({to:user.Email,subject,text:`Olá, ${user.Nome||"usuário"}.\n\n${message}\n\nKorczak Technologies`});}catch(e){console.error("Notificação de segurança não enviada:",e?.message||e);}}

async function registrarAuditoria(req,acao,detalhes){
  if(!db)return;
  await db.collection("auditoria").insertOne({
    acao,email:req.user?.email||"sistema",detalhes:String(detalhes||"").slice(0,2000),
    criadoEm:new Date()
  });
}
function limparConteudo(body={}){
  const pagina=String(body.pagina||"/").trim().slice(0,300);
  const seletor=String(body.seletor||"").trim().slice(0,1000);
  const tipo=String(body.tipo||"texto").trim();
  const valor=String(body.valor??"").slice(0,1000000);
  const atributo=String(body.atributo||"").trim().slice(0,100);
  const propriedade=String(body.propriedade||"").trim().slice(0,100);
  if(!seletor||!TIPOS_CONTEUDO.has(tipo)||!valor)return null;
  return {pagina:pagina||"/",seletor,tipo,valor,atributo,propriedade,publicado:body.publicado!==false,ordem:Number.isFinite(Number(body.ordem))?Number(body.ordem):0};
}

app.get("/api/conteudo-publicado",async(req,res)=>{
  if(!db)return res.json([]);
  const rows=await db.collection("conteudo").find({publicado:true}).sort({ordem:1,atualizadoEm:1}).toArray();
  res.json(rows.map(r=>({_id:String(r._id),pagina:r.pagina,seletor:r.seletor,tipo:r.tipo,valor:r.valor,atributo:r.atributo||"",propriedade:r.propriedade||"",publicado:true,ordem:r.ordem||0})));
});

async function registrarEventoAnalitico(d={}){if(!db)return;await db.collection("analiticas").insertOne({pagina:String(d.pagina||"/").slice(0,300),tipo:String(d.tipo||"interacao").slice(0,60),categoria:String(d.categoria||"interacoes").slice(0,60),subcategoria:String(d.subcategoria||"geral").slice(0,80),acao:String(d.acao||"").slice(0,160),descricao:String(d.descricao||"").slice(0,500),referencia:String(d.referencia||"").slice(0,500),usuarioId:String(d.usuarioId||"").slice(0,100),nome:String(d.nome||"").slice(0,120),email:String(d.email||"").slice(0,180),entidade:String(d.entidade||"").slice(0,120),entidadeId:String(d.entidadeId||"").slice(0,120),metadados:d.metadados&&typeof d.metadados==="object"?d.metadados:{},dispositivo:"servidor",navegador:"",sistema:"",idioma:"pt-BR",largura:0,altura:0,evento:String(d.acao||"").slice(0,120),criadoEm:new Date()});}
app.post("/api/analiticas/evento",rateLimit({windowMs:60000,max:120}),async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const b=req.body||{},pagina=String(b.pagina||"/").slice(0,300),tipo=String(b.tipo||"visualizacao").slice(0,60);
  if(!pagina)return res.status(400).json({error:"Página inválida"});
  let usuarioId=String(b.usuarioId||"").slice(0,100);
  let nome=String(b.nome||"").slice(0,120);
  let emailEvento=String(b.email||"").slice(0,180);
  if(usuarioId){
    const u=idMongo(usuarioId)?await accountsDb.collection("contas").findOne({id:usuarioId},{projection:{Nome:1,Email:1}}):null;
    if(u){nome=String(u.Nome||nome).slice(0,120);emailEvento=String(u.Email||emailEvento).slice(0,180);}
  }else if(emailEvento){
    const u=await accountsDb.collection("contas").findOne({"Autenticacao.Email":email(emailEvento)},{projection:{Nome:1,Email:1,id:1,"Autenticacao.Email":1}});
    if(u){usuarioId=String(u._id);nome=String(u.name||nome).slice(0,120);emailEvento=String(u.email||emailEvento).slice(0,180);}
  }
  await db.collection("analiticas").insertOne({
    pagina,tipo,
    categoria:String(b.categoria||"interacoes").slice(0,60),subcategoria:String(b.subcategoria||"geral").slice(0,80),acao:String(b.acao||b.evento||"").slice(0,160),descricao:String(b.descricao||"").slice(0,500),usuarioId,nome,email:emailEvento,entidade:String(b.entidade||"").slice(0,120),entidadeId:String(b.entidadeId||"").slice(0,120),metadados:b.metadados&&typeof b.metadados==="object"?b.metadados:{},
    caminho:String(b.caminho||pagina).slice(0,500),
    titulo:String(b.titulo||"").slice(0,300),
    referencia:String(b.referencia||"").slice(0,500),
    dispositivo:String(b.dispositivo||"desktop").slice(0,30),
    navegador:String(b.navegador||"").slice(0,80),
    sistema:String(b.sistema||"").slice(0,80),
    idioma:String(b.idioma||"pt-BR").slice(0,30),
    largura:Number(b.largura)||0,altura:Number(b.altura)||0,
    evento:String(b.evento||"").slice(0,120),
    criadoEm:new Date()
  });
  res.status(201).json({ok:true});
});
app.get("/api/admin/analiticas",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const dias=Math.min(Math.max(Number(req.query.dias)||30,1),365);
  const desde=new Date(Date.now()-dias*86400000);
  try{
    const eventos=db.collection("analiticas");
    const base=[
      {$set:{_analyticsDate:{$convert:{input:"$criadoEm",to:"date",onError:null,onNull:null}}}},
      {$match:{_analyticsDate:{$gte:desde}}}
    ];
    const safeAgg=async(pipeline,fallback=[])=>{
      try{return await eventos.aggregate([...base,...pipeline]).toArray();}
      catch(error){console.error("Analytics section error:",error?.message||error);return fallback;}
    };
    const [total,unicos,paginas,dispositivos,navegadores,tipos,diarios,mercado,categorias,subcategorias,acoes,ultimos]=await Promise.all([
      safeAgg([{$count:"total"}]),
      safeAgg([{$match:{referencia:{$nin:["",null]}}},{$group:{_id:"$referencia"}},{$count:"total"}]),
      safeAgg([{$group:{_id:"$pagina",total:{$sum:1}}},{$sort:{total:-1}},{$limit:20}]),
      safeAgg([{$group:{_id:"$dispositivo",total:{$sum:1}}},{$sort:{total:-1}}]),
      safeAgg([{$group:{_id:"$navegador",total:{$sum:1}}},{$sort:{total:-1}}]),
      safeAgg([{$group:{_id:"$tipo",total:{$sum:1}}},{$sort:{total:-1}}]),
      safeAgg([{$group:{_id:{$dateToString:{date:"$_analyticsDate",format:"%Y-%m-%d"}},total:{$sum:1}}},{$sort:{_id:1}}]),
      safeAgg([{$group:{_id:{$dateToString:{date:"$_analyticsDate",format:"%H:%M"}},total:{$sum:1}}},{$sort:{_id:1}}]),
      safeAgg([{$group:{_id:"$categoria",total:{$sum:1}}},{$sort:{total:-1}}]),
      safeAgg([{$group:{_id:"$subcategoria",total:{$sum:1}}},{$sort:{total:-1}}]),
      safeAgg([{$group:{_id:"$acao",total:{$sum:1}}},{$sort:{total:-1}},{$limit:30}]),
      safeAgg([{$sort:{_analyticsDate:-1}},{$limit:100},{$unset:"_analyticsDate"}])
    ]);
    res.json({
      dias,
      total:total[0]?.total||0,
      visitantes:unicos[0]?.total||0,
      paginas,dispositivos,navegadores,tipos,diarios,mercado,categorias,subcategorias,acoes,
      ultimos:ultimos.map(r=>({...r,_id:String(r._id)}))
    });
  }catch(error){
    console.error("Analytics aggregation error:",error?.message||error);
    res.status(500).json({error:"Não foi possível carregar as analytics."});
  }
});
app.post("/api/interessados/korczak-ai",rateLimit({windowMs:60000,max:10}),async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const b=req.body||{};
  const nome=String(b.nome||"").trim().slice(0,120);
  const emailInformado=String(b.email||"").trim().toLowerCase().slice(0,180);
  const whatsapp=String(b.whatsapp||"").trim().slice(0,40);
  const cidade=String(b.cidade||"").trim().slice(0,100);
  const estado=String(b.estado||"").trim().slice(0,100);
  const pais=String(b.pais||"").trim().slice(0,100);
  const ondeConheceu=String(b.ondeConheceu||"").trim().slice(0,120);
  const uso=String(b.uso||"").trim().slice(0,500);
  const consentimento=b.consentimento===true;
  if(nome.length<2)return res.status(400).json({error:"Informe seu nome."});
  if(!emailValida(emailInformado))return res.status(400).json({error:"Informe um email válido."});
  if(!cidade||!estado||!pais)return res.status(400).json({error:"Informe cidade, estado e país."});
  if(!ondeConheceu)return res.status(400).json({error:"Informe onde conheceu a Korczak AI."});
  if(!consentimento)return res.status(400).json({error:"É necessário autorizar o contato sobre a Korczak AI."});
  const agora=new Date();
  const doc={
    produto:"korczak-ai",
    nome,email:emailInformado,whatsapp,cidade,estado,pais,ondeConheceu,uso,
    consentimento:true,
    origem:String(b.origem||"site").slice(0,80),
    status:"interessado",
    atualizadoEm:agora,
    criadoEm:agora
  };
  const existente=await db.collection("interessados").findOne({produto:"korczak-ai",email:emailInformado});
  if(existente){
    await db.collection("interessados").updateOne({_id:existente._id},{$set:{...doc,criadoEm:existente.criadoEm||agora}});
    return res.json({ok:true,novo:false,message:"Seu interesse já estava registrado. Atualizamos seus dados."});
  }
  const r=await db.collection("interessados").insertOne(doc);
  res.status(201).json({ok:true,novo:true,id:String(r.insertedId),message:"Seu interesse foi registrado."});
});
app.get("/api/admin/interessados",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const produto=String(req.query.produto||"").trim().slice(0,80);
  const filtro=produto?{produto}:{};
  const rows=await db.collection("interessados").find(filtro,{projection:{}}).sort({criadoEm:-1}).limit(2000).toArray();
  res.json(rows.map(r=>({...r,_id:String(r._id)})));
});
app.get("/api/admin/contas",auth,admin,async(req,res)=>{if(!db||!accountsDb)return res.status(503).json({error:"Banco não configurado"});const [usuarios,atividades]=await Promise.all([accountsDb.collection("contas").find({}).sort({"Conta.AtualizadaEm":-1}).limit(1000).toArray(),db.collection("atividade_contas").find().sort({criadoEm:-1}).limit(500).toArray()]);const mapa=new Map();for(const a of atividades){const k=String(a.usuarioId||a.email||"");if(!mapa.has(k))mapa.set(k,[]);mapa.get(k).push({...a,_id:String(a._id)});}res.json({contas:usuarios.map(u=>({...accountSafe(u),atividades:mapa.get(String(u.id))||[]})),atividades:atividades.map(a=>({...a,_id:String(a._id)}))});});
app.get("/api/admin/resumo",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const [conteudo,midias,admins,auditoria,usuarios,contatos,orcamentos,pedidos,interessadosAI]=await Promise.all([
    db.collection("conteudo").countDocuments(),
    db.collection("midias").countDocuments(),
    db.collection("usuarios_administradores").countDocuments(),
    db.collection("auditoria").countDocuments(),
    accountsDb.collection("contas").countDocuments(),
    db.collection("contacts").countDocuments(),
    db.collection("quotes").countDocuments(),
    db.collection("orders").countDocuments(),
    db.collection("interessados").countDocuments({produto:"korczak-ai"})
  ]);
  res.json({"Regras de conteúdo":conteudo,"Mídias":midias,"Administradores":admins,"Registros de auditoria":auditoria,"Usuários":usuarios,"Contatos":contatos,"Orçamentos":orcamentos,"Pedidos":pedidos,"Interessados Korczak AI":interessadosAI});
});
app.get("/api/admin/conteudo",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("conteudo").find().sort({atualizadoEm:-1}).limit(1000).toArray();
  const nomes=await nomesPorEmails(rows.flatMap(r=>[r.criadoPor,r.atualizadoPor]));
  res.json(rows.map(r=>({...r,_id:String(r._id),criadoPorNome:nomes.get(email(r.criadoPor))||r.criadoPor||"Sistema",atualizadoPorNome:nomes.get(email(r.atualizadoPor))||r.atualizadoPor||"Sistema"})));
});
app.post("/api/admin/conteudo",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const data=limparConteudo(req.body);
  if(!data)return res.status(400).json({error:"Regra de conteúdo inválida"});
  const agora=new Date();
  const doc={...data,criadoEm:agora,atualizadoEm:agora,criadoPor:req.user.email,atualizadoPor:req.user.email};
  const r=await db.collection("conteudo").insertOne(doc);
  await registrarAuditoria(req,"criar_conteudo",`Regra ${r.insertedId} criada para ${data.pagina} / ${data.seletor}`);
  res.status(201).json({...doc,_id:String(r.insertedId)});
});
app.put("/api/admin/conteudo/:id",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const id=idMongo(req.params.id),data=limparConteudo(req.body);
  if(!id||!data)return res.status(400).json({error:"Regra de conteúdo inválida"});
  const agora=new Date();
  const r=await db.collection("conteudo").findOneAndUpdate({_id:id},{$set:{...data,atualizadoEm:agora,atualizadoPor:req.user.email}},{returnDocument:"after"});
  if(!r)return res.status(404).json({error:"Regra não encontrada"});
  await registrarAuditoria(req,"editar_conteudo",`Regra ${id} atualizada`);
  res.json({...r,_id:String(r._id)});
});
app.patch("/api/admin/conteudo/:id",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const id=idMongo(req.params.id);
  if(!id)return res.status(400).json({error:"Identificador inválido"});
  const data={};
  if(typeof req.body.publicado==="boolean")data.publicado=req.body.publicado;
  if(!Object.keys(data).length)return res.status(400).json({error:"Nenhuma alteração informada"});
  data.atualizadoEm=new Date();data.atualizadoPor=req.user.email;
  await db.collection("conteudo").updateOne({_id:id},{$set:data});
  await registrarAuditoria(req,data.publicado?"publicar_conteudo":"despublicar_conteudo",`Regra ${id}`);
  res.json({ok:true});
});
app.delete("/api/admin/conteudo/:id",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const id=idMongo(req.params.id);if(!id)return res.status(400).json({error:"Identificador inválido"});
  await db.collection("conteudo").deleteOne({_id:id});
  await registrarAuditoria(req,"excluir_conteudo",`Regra ${id} excluída`);
  res.json({ok:true});
});

const CMS_SOURCE_FILES=new Set(["public/index.html","public/assets/styles.css","public/assets/app.js","public/assets/cms.js","public/data/content.json","server/index.mjs"]);
const CMS_PAGES=[
{id:"home",name:"Página inicial",route:"#/"},
{id:"comercial",name:"Comercial",route:"#/comercial"},
{id:"produtos",name:"Produtos",route:"#/produtos"},
{id:"produto-generico",name:"Produto / catálogo",route:"#/produto/:id"},
{id:"korczak-ai",name:"KORCZAK AI",route:"#/produto/korczak-ai"},
{id:"ide",name:"Korczak IDE",route:"#/produto/ide"},
{id:"nexus",name:"Nexus",route:"#/produto/nexus"},
{id:"hub",name:"HUB",route:"#/hub"},
{id:"kos",name:"KOS",route:"#/kos"},
{id:"servicos",name:"Serviços",route:"#/servico"},
{id:"landing-page",name:"Serviço · Landing Page",route:"#/servicos/landing-page"},
{id:"site",name:"Serviço · Site",route:"#/servicos/site"},
{id:"ecommerce",name:"Serviço · E-commerce",route:"#/servicos/ecommerce"},
{id:"web-app",name:"Serviço · Web App",route:"#/servicos/web-app"},
{id:"mobile",name:"Serviço · Mobile",route:"#/servicos/mobile"},
{id:"api",name:"Serviço · API",route:"#/servicos/api"},
{id:"integration",name:"Serviço · Integração",route:"#/servicos/integration"},
{id:"automation",name:"Serviço · Automação",route:"#/servicos/automation"},
{id:"bot",name:"Serviço · Bot",route:"#/servicos/bot"},
{id:"customization",name:"Serviço · Customização",route:"#/servicos/customization"},
{id:"orcamento",name:"Orçamento",route:"#/orcamento"},
{id:"mentoria",name:"Mentoria",route:"#/mentoria"},
{id:"mentoria-precos",name:"Mentoria · Preços",route:"#/mentoria/precos"},
{id:"mentoria-detalhe",name:"Mentoria · Detalhe",route:"#/mentoria/:id"},
{id:"institucional",name:"Institucional",route:"#/institucional"},
{id:"empresa",name:"Empresa",route:"#/empresa"},
{id:"historia",name:"História",route:"#/historia"},
{id:"visao",name:"Visão",route:"#/visao"},
{id:"valores",name:"Valores",route:"#/valores"},
{id:"portfolio",name:"Portfólio",route:"#/portfolio"},
{id:"contato",name:"Contato",route:"#/contato"},
{id:"conta",name:"Conta",route:"#/conta"},
{id:"planos",name:"Planos",route:"#/planos/:id"},
{id:"privacidade",name:"Privacidade",route:"#/privacidade"},
{id:"uso",name:"Termos de uso",route:"#/uso"},
{id:"acesso",name:"Acesso",route:"#/acesso"}
];
const CMS_FILE_TYPES={
"public/index.html":{type:"HTML",label:"HTML"},
"public/assets/styles.css":{type:"CSS",label:"CSS"},
"public/assets/app.js":{type:"JS",label:"JavaScript"},
"public/assets/cms.js":{type:"CMS",label:"CMS"},
"public/data/content.json":{type:"DATA",label:"Conteúdo, catálogo e preços centrais"},
"server/index.mjs":{type:"BACKEND",label:"Backend / API"}
};
function cmsFileForPage(page){const p=CMS_PAGES.find(x=>x.id===page)||CMS_PAGES[0];return Object.entries(CMS_FILE_TYPES).map(([path,x])=>({...x,path,page:p.id,pageName:p.name,route:p.route,editable:true}));}
function githubApiUrl(path){return "https://api.github.com/repos/"+GITHUB_REPO+"/contents/"+path.split("/").map(encodeURIComponent).join("/");}
async function githubRequest(path,options={}){
 const headers={Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",...(options.headers||{})};
 if(GITHUB_TOKEN)headers.Authorization="Bearer "+GITHUB_TOKEN;
 const r=await fetch(githubApiUrl(path),{...options,headers});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(new Error(d.message||"Falha na comunicação com o GitHub"),{status:r.status,data:d});
 return d;
}
app.get("/api/admin/cms/pages",auth,admin,async(req,res)=>res.json({repository:GITHUB_REPO,branch:GITHUB_BRANCH,pages:CMS_PAGES,react:false,files:Object.values(CMS_FILE_TYPES).map(x=>x.label)}));
app.get("/api/admin/cms/files",auth,admin,async(req,res)=>{const page=String(req.query.page||"home");res.json({page:CMS_PAGES.find(x=>x.id===page)?.id||"home",files:cmsFileForPage(page)});});
app.get("/api/admin/cms/file",auth,admin,async(req,res)=>{
 const path=String(req.query.path||"");if(!CMS_SOURCE_FILES.has(path))return res.status(400).json({error:"Arquivo não permitido pelo CMS."});
 try{const d=await githubRequest(path);const content=Buffer.from(String(d.content||"").replace(/\s/g,""),"base64").toString("utf8");res.json({path,content,sha:d.sha,branch:GITHUB_BRANCH,size:content.length});}
 catch(e){console.error("CMS read error:",e?.message||e);res.status(e.status===404?404:502).json({error:"Não foi possível ler o arquivo-fonte no GitHub.",details:e.message});}
});
app.put("/api/admin/cms/file",auth,admin,async(req,res)=>{
 const path=String(req.body?.path||""),content=String(req.body?.content??""),sha=String(req.body?.sha||"");
 if(!CMS_SOURCE_FILES.has(path))return res.status(400).json({error:"Arquivo não permitido pelo CMS."});
 if(!sha)return res.status(400).json({error:"SHA do arquivo ausente. Recarregue o editor antes de salvar."});
 if(content.length>2000000)return res.status(413).json({error:"Arquivo muito grande para edição pelo CMS."});
 if(!GITHUB_TOKEN)return res.status(503).json({error:"CMS de fonte ainda não está conectado ao GitHub. Configure GITHUB_TOKEN no Render."});
 try{
  const message=String(req.body?.message||("CMS: atualizar "+path)).slice(0,200);
  const d=await githubRequest(path,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,content:Buffer.from(content,"utf8").toString("base64"),sha,branch:GITHUB_BRANCH})});
  await registrarAuditoria(req,"cms_salvar_fonte","Arquivo "+path+" atualizado no GitHub. Commit "+(d.commit?.sha||""));
  res.json({ok:true,path,sha:d.content?.sha||null,commit:d.commit?.sha||null});
 }catch(e){console.error("CMS write error:",e?.message||e);const conflict=e.status===409||e.status===422;res.status(conflict?409:502).json({error:conflict?"O arquivo mudou no GitHub antes do salvamento. Recarregue e tente novamente.":"Não foi possível salvar o arquivo no GitHub.",details:e.message});}
});
app.get("/api/admin/midias",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("midias").find({}, {projection:{dados:0}}).sort({criadoEm:-1}).limit(300).toArray();
  const nomes=await nomesPorEmails(rows.map(r=>r.criadoPor));
  res.json(rows.map(r=>({...r,_id:String(r._id),criadoPorNome:nomes.get(email(r.criadoPor))||r.criadoPor||"Sistema",url:`/api/midia/${r._id}`})));
});
app.post("/api/admin/midias",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const nome=String(req.body?.nome||"imagem").slice(0,200),tipo=String(req.body?.tipo||"").toLowerCase(),dados=String(req.body?.dados||"");
  const tamanho=Number(req.body?.tamanho||0);
  if(!/^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/.test(tipo)||!dados.startsWith("data:image/")||tamanho<1||tamanho>8*1024*1024)
    return res.status(400).json({error:"Imagem inválida. Formatos aceitos: PNG, JPEG, WebP, GIF e SVG; máximo de 8 MB."});
  const agora=new Date();
  const r=await db.collection("midias").insertOne({nome,tipo,tamanho,dados,criadoEm:agora,criadoPor:req.user.email});
  await registrarAuditoria(req,"enviar_midia",`Mídia ${r.insertedId} enviada: ${nome}`);
  res.status(201).json({_id:String(r.insertedId),url:`/api/midia/${r.insertedId}`});
});
app.get("/api/midia/:id",async(req,res)=>{
  if(!db)return res.status(404).end();
  const id=idMongo(req.params.id);if(!id)return res.status(404).end();
  const m=await db.collection("midias").findOne({_id:id},{projection:{dados:1,tipo:1}});
  if(!m)return res.status(404).end();
  const raw=String(m.dados||"").replace(/^data:[^;]+;base64,/,"");
  try{
    res.setHeader("Content-Type",m.tipo||"image/png");
    res.setHeader("Cache-Control","public,max-age=31536000,immutable");
    res.end(Buffer.from(raw,"base64"));
  }catch{res.status(500).end()}
});
app.get("/api/admin/administradores",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("usuarios_administradores").find({}, {projection:{senhaHash:0}}).sort({criadoEm:-1}).toArray();
  res.json(rows.map(r=>({...r,_id:String(r._id)})));
});
app.post("/api/admin/administradores",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const nome=String(req.body?.nome||"").trim().slice(0,120),mail=email(req.body?.email),senha=String(req.body?.senha||"");
  if(nome.length<2||!emailValida(mail)||senha.length<8||senha.length>128)return res.status(400).json({error:"Dados do administrador inválidos"});
  try{
    const agora=new Date();
    const existente=await accountsDb.collection("contas").findOne({"Autenticacao.Email":mail},{projection:{id:1}});
    if(existente)return res.status(409).json({error:"E-mail já cadastrado"});
    const u=centralConta({name:nome,email:mail,siteSenha:await bcrypt.hash(senha,12),role:"admin",verified:true,createdAt:agora});
    await accountsDb.collection("contas").insertOne(u);
    await db.collection("usuarios_administradores").insertOne({usuarioId:u.id,nome,email:mail,papel:"administrador",criadoEm:agora,criadoPor:req.user.email});
    await registrarAuditoria(req,"criar_administrador",`Administrador ${mail} criado`);
    res.status(201).json({ok:true});
  }catch(e){res.status(e.code===11000?409:500).json({error:e.code===11000?"E-mail já cadastrado":"Falha ao criar administrador"})}
});
app.get("/api/admin/auditoria",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("auditoria").find().sort({criadoEm:-1}).limit(300).toArray();
  const nomes=await nomesPorEmails(rows.map(r=>r.email));
  res.json(rows.map(r=>({...r,_id:String(r._id),nome:nomes.get(email(r.email))||r.email||"Sistema"})));
});

const rate=new Map();
app.use((req,res,next)=>{
  if(!req.path.startsWith("/api/"))return next();
  const key=req.ip||"unknown",now=Date.now(),v=rate.get(key)||{n:0,t:now};
  if(now-v.t>60000){v.n=0;v.t=now}
  v.n++;
  if(v.n>120)return res.status(429).json({error:"Muitas requisições"});
  rate.set(key,v);
  if(rate.size>10000){for(const [k,x] of rate)if(now-x.t>120000)rate.delete(k)}
  next();
});

const email=v=>String(v||"").trim().toLowerCase();
const token=u=>jwt.sign({sub:String(u._id),email:u.email,role:u.role||"user"},SECRET,{expiresIn:"7d"});
function auth(req,res,next){try{const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))throw 0;req.user=jwt.verify(h.slice(7),SECRET);next()}catch{res.status(401).json({error:"Não autenticado"})}}
function admin(req,res,next){if(req.user?.role!=="admin")return res.status(403).json({error:"Acesso restrito"});next()}
async function nomesPorEmails(emails){
  if(!accountsDb)return new Map();
  const lista=[...new Set((emails||[]).map(v=>email(v)).filter(Boolean))];
  if(!lista.length)return new Map();
  const usuarios=await accountsDb.collection("contas").find({"Autenticacao.Email":{$in:lista}},{projection:{Nome:1,Email:1,"Autenticacao.Email":1}}).toArray();
  return new Map(usuarios.map(u=>[email(u.Autenticacao?.Email||u.Email),u.Nome||""]));
}


app.get("/health",(req,res)=>res.status(200).json({
  ok:true,service:"kztechsite",database:Boolean(db),stripe:Boolean(stripe),
  environment:process.env.NODE_ENV||"development",time:new Date().toISOString()
}));
app.get("/api/health",(req,res)=>res.status(200).json({
  ok:true,service:"kztechsite",database:Boolean(db),stripe:Boolean(stripe),
  environment:process.env.NODE_ENV||"development",time:new Date().toISOString()
}));
app.get("/api/ready",(req,res)=>{
  const ready=Boolean(db&&accountsDb);
  res.status(ready?200:503).json({ready,database:ready,time:new Date().toISOString()});
});
app.get("/api/products",(req,res)=>res.json(products.map(p=>({...p,commercial:Boolean(commercialProducts[p.id]),price:commercialProducts[p.id]?.amount||null,currency:commercialProducts[p.id]?.currency||"brl"}))));

app.post("/api/contact",rateLimit({windowMs:60000,max:10}),async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const {name,phone,message}=req.body||{},mail=email(req.body?.email);
  const cleanName=String(name||"").trim(),cleanMessage=String(message||"").trim(),cleanPhone=String(phone||"").trim();
  if(cleanName.length<2||cleanName.length>120||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(mail)||cleanMessage.length<1||cleanMessage.length>5000||cleanPhone.length>40)
    return res.status(400).json({error:"Dados de contato inválidos"});
  const agora=new Date();
  await db.collection("contacts").insertOne({name:cleanName,email:mail.slice(0,180),phone:cleanPhone,message:cleanMessage,createdAt:agora,status:"new"});
  await registrarEventoAnalitico({tipo:"contato",categoria:"comercial",subcategoria:"contato",acao:"Contato enviado",descricao:"Mensagem enviada pelo formulário de contato.",pagina:"/contato",nome:cleanName,email:mail,entidade:"contato",metadados:{telefone:cleanPhone}});
  let emailNotificationSent=false;
  if(GMAIL_API_CONFIGURED&&GMAIL_NOTIFICATION_EMAIL&&emailValida(GMAIL_NOTIFICATION_EMAIL)){
    try{
      await sendGmail({to:GMAIL_NOTIFICATION_EMAIL,subject:"Novo contato pelo site — Korczak Technologies",text:`Novo contato recebido pelo site.\n\nNome: ${cleanName}\nE-mail: ${mail}\nTelefone: ${cleanPhone||"Não informado"}\n\nMensagem:\n${cleanMessage}\n\nRecebido em: ${agora.toISOString()}`});
      emailNotificationSent=true;
    }catch(e){console.error("Notificação de contato não enviada:",e?.message||e);}
  }
  res.status(201).json({ok:true,emailNotificationSent});
});


app.get("/api/notifications/email-status",(req,res)=>res.json({provider:"gmail-api",configured:GMAIL_API_CONFIGURED,contactNotifications:Boolean(GMAIL_NOTIFICATION_EMAIL&&emailValida(GMAIL_NOTIFICATION_EMAIL))}));
app.post("/api/admin/email/test",auth,admin,rateLimit({windowMs:60000,max:3}),async(req,res)=>{
 if(!GMAIL_API_CONFIGURED)return res.status(503).json({ok:false,error:"Gmail não configurado. Defina as quatro variáveis OAuth no Render."});
 const recipient=email(req.user?.email);
 if(!emailValida(recipient))return res.status(400).json({ok:false,error:"O e-mail da sessão administrativa é inválido."});
 try{
  const result=await sendGmail({to:recipient,subject:"Teste de envio — Korczak Technologies",text:`O envio pelo Gmail API está funcionando.\n\nDestinatário de teste: ${recipient}\nData: ${new Date().toISOString()}\n\nKorczak Technologies`});
  res.json({ok:true,message:"E-mail de teste enviado.",messageId:result.id||null,to:recipient});
 }catch(e){console.error("Teste de e-mail falhou:",e?.message||e);res.status(502).json({ok:false,error:"O Gmail não conseguiu enviar o teste. Confira OAuth, escopo gmail.send e o endereço remetente."});}
});
app.post("/api/auth/verify-email",rateLimit({windowMs:60000,max:12}),async(req,res)=>{
 if(!accountsDb)return res.status(503).json({error:"Banco não configurado"});const raw=String(req.body?.token||"");
 if(raw.length<32||raw.length>256)return res.status(400).json({error:"Link inválido ou expirado."});
 const u=await accountsDb.collection("contas").findOne({EmailVerificationTokenHash:hashAuthToken(raw),EmailVerificationExpires:{$gt:new Date()}});
 if(!u)return res.status(400).json({error:"Link inválido ou expirado. Solicite outro e-mail."});
 const now=new Date();await accountsDb.collection("contas").updateOne({_id:u._id},{$set:{EmailVerified:true,Verified:true,"Autenticacao.EmailVerificado":true,EmailVerifiedAt:now,"Conta.AtualizadaEm":now.toISOString()},$unset:{EmailVerificationTokenHash:"",EmailVerificationExpires:""}});
 await securityEmail(u,"E-mail verificado","Seu endereço de e-mail foi verificado com sucesso.");res.json({ok:true,message:"E-mail verificado. Você já pode entrar."});
});
app.post("/api/auth/resend-verification",rateLimit({windowMs:60000,max:4}),async(req,res)=>{
 if(!accountsDb)return res.status(503).json({error:"Banco não configurado"});const mail=email(req.body?.email);
 if(!emailValida(mail))return res.status(400).json({error:"Informe um e-mail válido."});
 const u=await accountsDb.collection("contas").findOne({"Autenticacao.Email":mail});
 if(u&&!u.EmailVerified&&!u.Verified){const value=randomBytes(32).toString("hex");await accountsDb.collection("contas").updateOne({_id:u._id},{$set:{EmailVerificationTokenHash:hashAuthToken(value),EmailVerificationExpires:new Date(Date.now()+1800000)}});
 try{await emailLink(u,value,"verificar");}catch(e){console.error("Envio de verificação falhou:",e?.message||e);return res.status(503).json({error:"Não foi possível enviar o e-mail. Confira a configuração do Gmail no Render."});}}
 res.json({ok:true,message:"Se a conta existir e precisar de verificação, enviaremos as instruções."});
});
app.post("/api/auth/forgot-password",rateLimit({windowMs:60000,max:5}),async(req,res)=>{
 if(!accountsDb)return res.status(503).json({error:"Banco não configurado"});const mail=email(req.body?.email);
 if(!emailValida(mail))return res.status(400).json({error:"Informe um e-mail válido."});
 const u=await accountsDb.collection("contas").findOne({"Autenticacao.Email":mail});
 if(u){const value=randomBytes(32).toString("hex");await accountsDb.collection("contas").updateOne({_id:u._id},{$set:{PasswordResetTokenHash:hashAuthToken(value),PasswordResetExpires:new Date(Date.now()+1800000)}});
 try{await emailLink(u,value,"redefinir");}catch(e){console.error("Envio de recuperação falhou:",e?.message||e);return res.status(503).json({error:"Não foi possível enviar o e-mail. Confira a configuração do Gmail no Render."});}}
 res.json({ok:true,message:"Se existir uma conta para esse endereço, enviaremos as instruções de recuperação."});
});
app.post("/api/auth/reset-password",rateLimit({windowMs:60000,max:8}),async(req,res)=>{
 if(!accountsDb)return res.status(503).json({error:"Banco não configurado"});const raw=String(req.body?.token||""),pass=String(req.body?.password||"");
 if(raw.length<32||raw.length>256||pass.length<8||pass.length>128)return res.status(400).json({error:"Link inválido ou senha fora do limite de 8 a 128 caracteres."});
 const u=await accountsDb.collection("contas").findOne({PasswordResetTokenHash:hashAuthToken(raw),PasswordResetExpires:{$gt:new Date()}});
 if(!u)return res.status(400).json({error:"Link de recuperação inválido ou expirado. Solicite outro."});
 const now=new Date();await accountsDb.collection("contas").updateOne({_id:u._id},{$set:{"Autenticacao.SenhaHash":await bcrypt.hash(pass,12),PasswordChangedAt:now,"Conta.AtualizadaEm":now.toISOString()},$unset:{PasswordResetTokenHash:"",PasswordResetExpires:""}});
 await securityEmail(u,"Senha alterada","A senha da sua conta foi alterada. Se não foi você, solicite uma nova recuperação.");res.json({ok:true,message:"Senha alterada com sucesso. Você já pode entrar."});
});

app.post("/api/auth/register",rateLimit({windowMs:60000,max:8}),async(req,res)=>{
  if(!db||!accountsDb)return res.status(503).json({error:"Banco não configurado"});
  const name=String(req.body?.name||"").trim(),mail=email(req.body?.email),pass=String(req.body?.password||"");
  if(name.length<2||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)||pass.length<8||pass.length>128)return res.status(400).json({error:"Dados inválidos"});
  try{
    if(await accountsDb.collection("contas").findOne({"Autenticacao.Email":mail},{projection:{id:1}}))return res.status(409).json({error:"Email já cadastrado"});
    const verifyToken=randomBytes(32).toString("hex");
    const u=centralConta({name,email:mail,siteSenha:await bcrypt.hash(pass,12),verified:false});
    u.EmailVerified=false;u.EmailVerificationTokenHash=hashAuthToken(verifyToken);u.EmailVerificationExpires=new Date(Date.now()+1800000);
    await accountsDb.collection("contas").insertOne(u);
    let emailSent=false;
    if(GMAIL_API_CONFIGURED){try{await emailLink(u,verifyToken,"verificar");emailSent=true;}catch(e){console.error("E-mail inicial de verificação falhou:",e?.message||e);}}
    const safe=accountSafe(u),agora=new Date();
    await db.collection("atividade_contas").insertOne({usuarioId:u.id,nome:name,email:mail,tipo:"cadastro",acao:"Conta criada",descricao:"Nova conta criada no site.",pagina:"/conta",criadoEm:agora});
    await registrarEventoAnalitico({tipo:"cadastro",categoria:"contas",subcategoria:"cadastros",acao:"Conta criada",descricao:"Nova conta criada no site.",pagina:"/conta",usuarioId:u.id,nome,email:mail,entidade:"conta",entidadeId:u.id});
    res.status(201).json({user:safe,token:token(safe),emailVerificationRequired:true,emailSent});
  }catch(e){res.status(e.code===11000?409:500).json({error:e.code===11000?"Email já cadastrado":"Falha ao criar conta"});}
});

app.post("/api/auth/login",rateLimit({windowMs:60000,max:10}),async(req,res)=>{
  if(!db||!accountsDb)return res.status(503).json({error:"Banco não configurado"});
  const mail=email(req.body?.email);
  const u=await accountsDb.collection("contas").findOne({"Autenticacao.Email":mail});
  if(!u||!u.Autenticacao?.SenhaHash||!(await bcrypt.compare(String(req.body?.password||""),u.Autenticacao.SenhaHash))return res.status(401).json({error:"Email ou senha inválidos"});
  if(u.EmailVerificationTokenHash&&!u.EmailVerified&&!u.Verified)return res.status(403).json({error:"Verifique seu e-mail antes de entrar.",code:"EMAIL_NOT_VERIFIED"});
  const agora=new Date();
  await accountsDb.collection("contas").updateOne({id:u.id},{$set:{"Conta.UltimoLogin":agora,"Conta.AtualizadaEm":agora.toISOString()}});
  const safe=accountSafe(u);
  await db.collection("atividade_contas").insertOne({usuarioId:u.id,nome:u.Nome||"",email:u.Email||"",tipo:"login",acao:"Login realizado",descricao:"Entrada na conta realizada com sucesso.",pagina:"/conta",criadoEm:agora});
  await registrarEventoAnalitico({tipo:"login",categoria:"contas",subcategoria:"logins",acao:"Login realizado",descricao:"Entrada na conta realizada com sucesso.",pagina:"/conta",usuarioId:u.id,nome:u.Nome,email:u.Email,entidade:"conta",entidadeId:u.id});
  res.json({user:safe,token:token(safe)});
});

app.get("/api/quotes",auth,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("quotes").find({userId:req.user.sub}).sort({createdAt:-1}).limit(100).toArray();
  res.json(rows);
});

function planKeyForProductServer(id){return ["hub","vault","nexus","nexa","veya","formly","korvo","chrona","meet","pulse","acta","memo","people","web","klash"].includes(id)?"hub":id;}
app.post("/api/subscriptions",rateLimit({windowMs:60000,max:12}),async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const productId=String(req.body?.productId||"").trim();
  const planId=String(req.body?.planId||"").trim();
  const moduleIds=String(req.body?.moduleIds||"").trim().slice(0,2000);
  const name=String(req.body?.name||"").trim();
  const mail=email(req.body?.email);
  const phone=String(req.body?.phone||"").trim();
  const company=String(req.body?.company||"").trim().slice(0,180);
  const document=String(req.body?.document||"").trim().slice(0,40);
  const p=products.find(x=>x.id===productId);
  if(!p||name.length<2||!emailValida(mail)||phone.length<8)return res.status(400).json({error:"Preencha nome, email e telefone para iniciar a assinatura"});
  const catalogo=await lerCatalogoCentral();
  const planos=normalizarPlanos(catalogo.plans||PLANOS_PADRAO);
  const lista=planos[planKeyForProductServer(productId)]||[];
  const plano=lista.find(x=>x.id===planId);
  const modsCatalog=catalogo.modules?.[productId]||[];
  const ids=moduleIds?moduleIds.split(",").filter(Boolean):[];
  const mods=modsCatalog.filter(x=>ids.includes(x.id));
  if(!plano&&!mods.length)return res.status(400).json({error:"Selecione um plano ou uma configuração de módulos válida"});
  const monthly=plano&&Number.isFinite(Number(plano.preSalePrice))?Number(plano.preSalePrice):mods.reduce((n,x)=>n+(Number.isFinite(Number(x.preSaleMonthly))?Number(x.preSaleMonthly):Math.round(Number(x.monthly||0)*.85)),0);
  const implementation=mods.reduce((n,x)=>n+(Number.isFinite(Number(x.preSalePrice))?Number(x.preSalePrice):Math.round(Number(x.price||0)*.85)),0);
  const agora=new Date();
  const row={userId:req.user?.sub||null,productId,planId:planId||null,moduleIds,name,email:mail,phone,company,document,monthly,implementation,paymentMethod:null,paymentStatus:"pending_payment",status:"pending",createdAt:agora,updatedAt:agora};
  const result=await db.collection("subscriptions").insertOne(row);
  await registrarEventoAnalitico({tipo:"assinatura",categoria:"comercial",subcategoria:"assinaturas",acao:"Assinatura iniciada",descricao:"Fluxo de assinatura de pré-venda iniciado; pagamento será conectado posteriormente.",pagina:"/assinatura",usuarioId:req.user?.sub||null,nome:name,email:mail,entidade:"produto",entidadeId:productId,metadados:{planId:planId||null,moduleIds,monthly,implementation,paymentMethod:"pix"}});
  res.status(201).json({ok:true,id:String(result.insertedId),status:"pending_payment",payment:{method:null,qrCode:null,copyPaste:null}});
});
app.post("/api/presales",rateLimit({windowMs:60000,max:12}),async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const productId=String(req.body?.productId||"").trim();
  const planId=String(req.body?.planId||"").trim();
  const moduleIds=String(req.body?.moduleIds||"").trim().slice(0,2000);
  const name=String(req.body?.name||"").trim();
  const mail=email(req.body?.email);
  const phone=String(req.body?.phone||"").trim();
  const company=String(req.body?.company||"").trim().slice(0,180);
  if(!products.some(p=>p.id===productId)||name.length<2||!emailValida(mail)||phone.length<8)
    return res.status(400).json({error:"Preencha nome, email, telefone e produto para registrar a pré-venda"});
  const agora=new Date();
  const row={userId:req.user?.sub||null,productId,planId:planId||null,moduleIds,name,email:mail,phone,company,status:"pending",createdAt:agora};
  const result=await db.collection("presales").insertOne(row);
  await registrarEventoAnalitico({tipo:"presale",categoria:"comercial",subcategoria:"pre-venda",acao:"Pré-venda registrada",descricao:"Intenção de compra registrada na pré-venda.",pagina:"/pre-venda",usuarioId:req.user?.sub||null,nome:name,email:mail,entidade:"produto",entidadeId:productId,metadados:{planId:planId||null,moduleIds}});
  res.status(201).json({ok:true,id:String(result.insertedId)});
});

app.get("/api/orders",auth,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("orders").find({userId:req.user.sub}).sort({createdAt:-1}).limit(100).toArray();
  res.json(rows);
});

app.get("/api/me",auth,async(req,res)=>{
  if(!db||!accountsDb)return res.status(503).json({error:"Banco não configurado"});
  const u=await accountsDb.collection("contas").findOne({id:req.user.sub});
  u?res.json(accountSafe(u)):res.status(404).json({error:"Usuário não encontrado"});
});

app.patch("/api/me",rateLimit({windowMs:60000,max:12}),auth,async(req,res)=>{
  if(!db||!accountsDb)return res.status(503).json({error:"Banco não configurado"});
  const name=String(req.body?.name??"").trim();
  const phone=String(req.body?.phone??"").trim();
  if(name.length<2||name.length>120)return res.status(400).json({error:"Nome inválido"});
  if(phone.length>40)return res.status(400).json({error:"Telefone inválido"});
  const agora=new Date();
  await accountsDb.collection("contas").updateOne({id:req.user.sub},{$set:{Nome:name,Telefone:phone||null,"Conta.AtualizadaEm":agora.toISOString()}});
  const u=await accountsDb.collection("contas").findOne({id:req.user.sub});
  if(!u)return res.status(404).json({error:"Usuário não encontrado"});
  await registrarEventoAnalitico({tipo:"perfil",categoria:"contas",subcategoria:"perfil",acao:"Perfil atualizado",descricao:"Dados básicos da conta foram atualizados.",pagina:"/conta",usuarioId:u.id,nome:u.Nome,email:u.Email,entidade:"conta",entidadeId:u.id});
  const safe=accountSafe(u);
  res.json({user:safe,token:token(safe)});
});

app.post("/api/me/password",rateLimit({windowMs:60000,max:5}),auth,async(req,res)=>{
  if(!db||!accountsDb)return res.status(503).json({error:"Banco não configurado"});
  const current=String(req.body?.currentPassword||"");
  const next=String(req.body?.newPassword||"");
  if(next.length<8||next.length>128)return res.status(400).json({error:"A nova senha deve ter entre 8 e 128 caracteres."});
  if(current===next)return res.status(400).json({error:"A nova senha deve ser diferente da atual."});
  const u=await accountsDb.collection("contas").findOne({id:req.user.sub});
  const hash=u?.Autenticacao?.SenhaHash||"";
  if(!u||!hash||!(await bcrypt.compare(current,hash)))return res.status(401).json({error:"Senha atual inválida"});
  const newHash=await bcrypt.hash(next,12),agora=new Date();
  await accountsDb.collection("contas").updateOne({id:req.user.sub},{$set:{"Autenticacao.SenhaHash":newHash,"Conta.AtualizadaEm":agora.toISOString()}});
  await registrarEventoAnalitico({tipo:"seguranca",categoria:"contas",subcategoria:"seguranca",acao:"Senha do site alterada",descricao:"A senha de acesso ao site foi alterada.",pagina:"/conta",usuarioId:u.id,nome:u.Nome,email:u.Email,entidade:"conta",entidadeId:u.id});
  res.json({ok:true,message:"Senha alterada com sucesso."});
});

app.post("/api/quotes",rateLimit({windowMs:60000,max:12}),async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const productId=String(req.body?.productId||"");
  const objective=String(req.body?.objective||"").trim();
  const scope=String(req.body?.scope||"").trim();
  const name=String(req.body?.name||"").trim();
  const mail=email(req.body?.email);
  const phone=String(req.body?.phone||"").trim();
  const serviceId=String(req.body?.serviceId||"").trim();
  const planId=String(req.body?.planId||"").trim();
  if((!products.some(p=>p.id===productId)&&!serviceId)||name.length<2||!emailValida(mail)||phone.length<8||objective.length<2||scope.length<10)
    return res.status(400).json({error:"Preencha os campos obrigatórios do orçamento"});
  const agora=new Date();
  await db.collection("quotes").insertOne({userId:req.user?.sub||null,productId:productId||null,serviceId:serviceId||null,planId:planId||null,name,email:mail,phone,company:String(req.body?.company||"").slice(0,180),objective,scope:scope.slice(0,8000),deadline:String(req.body?.deadline||"").slice(0,180),budget:String(req.body?.budget||"").slice(0,180),details:String(req.body?.details||"").slice(0,5000),moduleIds:String(req.body?.moduleIds||"").slice(0,2000),status:"pending",createdAt:agora});
  const u=req.user?.sub?await accountsDb.collection("contas").findOne({id:req.user.sub}):null;
  await registrarEventoAnalitico({tipo:"orcamento",categoria:"comercial",subcategoria:"orcamentos",acao:"Orçamento solicitado",descricao:"Solicitação de orçamento enviada.",pagina:productId?"/produto/"+productId:serviceId?"/servicos/"+serviceId:"/orcamento",usuarioId:req.user?.sub||null,nome:u?.Nome||name,email:u?.Email||mail,entidade:"produto",entidadeId:productId,metadados:{objetivo:objective,escopo:scope.slice(0,500),servico:serviceId||null,produto:productId||null}});
  res.status(201).json({ok:true});
});

async function lerCatalogoCentral(){
  try{
    const d=await githubRequest("public/data/content.json");
    return JSON.parse(Buffer.from(String(d.content||"").replace(/\\s/g,""),"base64").toString("utf8"));
  }catch{return {plans:PLANOS_PADRAO,modules:{}}}
}
function normalizarPlanos(dados){
  const out=dados&&typeof dados==="object"&&!Array.isArray(dados)?{...dados}:{...PLANOS_PADRAO};
  if(!out.hub&&out.workspace)out.hub=out.workspace;
  delete out.workspace;
  return out;
}
app.get("/api/planos",async(req,res)=>{const catalogo=await lerCatalogoCentral();res.json(normalizarPlanos(catalogo.plans||PLANOS_PADRAO));});
app.get("/api/admin/planos",auth,admin,async(req,res)=>{const catalogo=await lerCatalogoCentral();res.json(normalizarPlanos(catalogo.plans||PLANOS_PADRAO));});
app.put("/api/admin/planos",rateLimit({windowMs:60000,max:20}),auth,admin,async(req,res)=>{
  const dados=req.body&&typeof req.body==="object"?req.body:null;
  if(!dados||Array.isArray(dados)||Object.keys(dados).length>30)return res.status(400).json({error:"Catálogo de planos inválido"});
  for(const [chave,lista] of Object.entries(dados)){
    if(!Array.isArray(lista)||lista.length>20)return res.status(400).json({error:"Lista de planos inválida em "+chave});
    for(const p of lista){
      if(!p||typeof p!=="object"||!String(p.id||"").trim()||!String(p.name||"").trim())return res.status(400).json({error:"Plano inválido em "+chave});
      for(const k of ["price","preSalePrice","monthly","preSaleMonthly"])if(p[k]!==null&&p[k]!==undefined&&(!Number.isFinite(Number(p[k]))||Number(p[k])<0))return res.status(400).json({error:"Preço inválido em "+chave+"/"+p.id});
    }
  }
  if(!GITHUB_TOKEN)return res.status(503).json({error:"CMS de fonte ainda não está conectado ao GitHub. Configure GITHUB_TOKEN no Render."});
  try{
    const d=await githubRequest("public/data/content.json");
    const catalogo=JSON.parse(Buffer.from(String(d.content||"").replace(/\\s/g,""),"base64").toString("utf8"));
    catalogo.plans=dados;
    const commit=await githubRequest("public/data/content.json",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:"CMS: atualizar preços e catálogo central",content:Buffer.from(JSON.stringify(catalogo,null,2),"utf8").toString("base64"),sha:d.sha,branch:GITHUB_BRANCH})});
    await registrarAuditoria(req,"Atualização de preços","Catálogo central de preços atualizado pelo CMS. Commit "+(commit.commit?.sha||""));
    res.json(dados);
  }catch(e){const conflict=e.status===409||e.status===422;res.status(conflict?409:502).json({error:conflict?"O catálogo mudou no GitHub. Recarregue e tente novamente.":"Não foi possível salvar o catálogo central.",details:e.message});}
});
app.get("/api/admin/comercial",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  try{
    const [orcamentos,compras,contatos,preVendas]=await Promise.all([
      db.collection("quotes").find().sort({createdAt:-1}).limit(500).toArray(),
      db.collection("orders").find().sort({createdAt:-1}).limit(500).toArray(),
      db.collection("contacts").find().sort({createdAt:-1}).limit(500).toArray(),
      db.collection("presales").find().sort({createdAt:-1}).limit(500).toArray()
    ]);
    const normalizar=r=>({...r,_id:String(r._id),nome:r.nome||r.name||"Visitante"});
    res.json({orcamentos:orcamentos.map(normalizar),compras:compras.map(normalizar),contatos:contatos.map(normalizar),preVendas:preVendas.map(normalizar)});
  }catch(error){
    console.error("Commercial admin error:",error?.message||error);
    res.status(500).json({error:"Não foi possível carregar os dados comerciais."});
  }
});
app.get("/api/admin/contacts",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  res.json(await db.collection("contacts").find().sort({createdAt:-1}).limit(100).toArray());
});
app.get("/api/admin/quotes",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  res.json(await db.collection("quotes").find().sort({createdAt:-1}).limit(100).toArray());
});

app.post("/api/checkout",rateLimit({windowMs:60000,max:12}),auth,async(req,res)=>{
  if(!stripe)return res.status(503).json({error:"Stripe não configurado"});
  const p=products.find(x=>x.id===req.body?.productId);
  const config=p&&commercialProducts[p.id];
  if(!p||!config||!config.priceId)return res.status(409).json({error:"O modelo comercial deste produto ainda está em definição. Não há compra automática disponível."});
  let amount=config.amount;
  let currency=config.currency;
  if(config.priceId){
    const price=await stripe.prices.retrieve(config.priceId);
    if(!price.active||price.type!=="one_time"||price.currency!==currency||typeof price.unit_amount!=="number")
      return res.status(503).json({error:"Preço Stripe inválido ou indisponível"});
    amount=price.unit_amount;
    currency=price.currency;
  }
  const line=config.priceId
    ?{price:config.priceId,quantity:1}
    :{price_data:{currency,product_data:{name:p.name},unit_amount:amount},quantity:1};
  const s=await stripe.checkout.sessions.create({
    mode:"payment",line_items:[line],
    success_url:checkoutBase+"/#/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}",
    cancel_url:checkoutBase+"/#/checkout/cancelado",
    customer_email:req.user.email,
    metadata:{userId:req.user.sub,productId:p.id}
  });
  if(db)await db.collection("orders").updateOne(
    {sessionId:s.id},
    {$setOnInsert:{userId:req.user.sub,productId:p.id,sessionId:s.id,status:"checkout_created",amount,currency,createdAt:new Date(),updatedAt:new Date()}},
    {upsert:true}
  );
  await registrarEventoAnalitico({tipo:"compra",categoria:"comercial",subcategoria:"compras",acao:"Compra iniciada",descricao:"Checkout criado para o produto.",pagina:"/produto/"+p.id,usuarioId:req.user.sub,nome:req.user?.name,email:req.user?.email,entidade:"produto",entidadeId:p.id,metadados:{valor:amount,currency,sessionId:s.id}});
  res.json({url:s.url});
});

app.get("/api/checkout/session/:id",auth,async(req,res)=>{
  if(!stripe)return res.status(503).json({error:"Stripe não configurado"});
  const session=await stripe.checkout.sessions.retrieve(req.params.id);
  if(session.metadata?.userId!==req.user.sub)return res.status(403).json({error:"Sessão não pertence ao usuário"});
  res.json({id:session.id,status:session.status,paymentStatus:session.payment_status,productId:session.metadata?.productId||null});
});

app.use((err,req,res,next)=>{
  if(err?.message==="Origin not allowed by CORS")return res.status(403).json({error:"Origem não autorizada"});
  console.error("API error:",err?.message||err);
  res.status(500).json({error:"Erro interno"});
});

app.get("/",(req,res)=>res.json({service:"kztechsite-api",ok:true}));
app.use((req,res)=>res.status(404).json({error:"Rota não encontrada"}));

let server;
async function start(){
  if(!mongo){
    if(isProd)throw new Error("MONGODB_URI is required in production.");
    console.warn("MONGODB_URI not configured; database features are disabled.");
  }
  if(mongo){
    await mongo.connect();
    db=mongo.db(process.env.MONGODB_DB||"KZTech");
    await db.command({ping:1});
    if(accountsMongo){
      await accountsMongo.connect();
      accountsDb=accountsMongo.db(process.env.MONGODB_ACCOUNTS_DATABASE||"Contas");
    }else if(isProd){
      throw new Error("MONGODB_ACCOUNTS_URI is required in production.");
    }else{
      accountsDb=mongo.db(process.env.MONGODB_ACCOUNTS_DATABASE||"Contas");
    }
    await accountsDb.command({ping:1});
    await accountsDb.collection("contas").createIndex({Email:1},{unique:true});
    await db.collection("conteudo").createIndex({publicado:1,pagina:1,ordem:1});
  await db.collection("analiticas").createIndex({criadoEm:-1});
  await db.collection("analiticas").createIndex({pagina:1,criadoEm:-1});
    await db.collection("analiticas").createIndex({categoria:1,subcategoria:1,criadoEm:-1});
    await db.collection("analiticas").createIndex({usuarioId:1,criadoEm:-1});
    await db.collection("atividade_contas").createIndex({criadoEm:-1});
    await db.collection("atividade_contas").createIndex({usuarioId:1,criadoEm:-1});
    await db.collection("conteudo").createIndex({seletor:1,pagina:1},{unique:true});
    await db.collection("midias").createIndex({criadoEm:-1});
    await db.collection("usuarios_administradores").createIndex({email:1},{unique:true});
    await db.collection("auditoria").createIndex({criadoEm:-1});
    await db.collection("contacts").createIndex({createdAt:-1});
    await db.collection("quotes").createIndex({createdAt:-1});
    await db.collection("quotes").createIndex({userId:1,createdAt:-1});
    await db.collection("presales").createIndex({createdAt:-1});
    await db.collection("subscriptions").createIndex({createdAt:-1});
    await db.collection("subscriptions").createIndex({userId:1,createdAt:-1});
    await db.collection("subscriptions").createIndex({productId:1,planId:1,createdAt:-1});
    await db.collection("presales").createIndex({userId:1,createdAt:-1});
    await db.collection("orders").createIndex({userId:1,createdAt:-1});
    await db.collection("orders").createIndex({sessionId:1},{unique:true,sparse:true});
    console.log("MongoDB connected");
  }
  server=app.listen(PORT,()=>console.log(`KZTechSite API listening on ${PORT}`));
}
async function shutdown(signal){
  console.log(`${signal}: shutting down`);
  if(server)await new Promise(resolve=>server.close(resolve));
  if(accountsMongo)await accountsMongo.close();
  if(mongo)await mongo.close();
  process.exit(0);
}
process.on("SIGTERM",()=>shutdown("SIGTERM"));
process.on("SIGINT",()=>shutdown("SIGINT"));
start().catch(e=>{console.error("Startup failed:",e.message);process.exit(1)});