import express from "express";
import helmet from "helmet";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {MongoClient,ObjectId} from "mongodb";
import Stripe from "stripe";

const app=express();
const PORT=Number(process.env.PORT||3000);
const isProd=process.env.NODE_ENV==="production";
const SECRET=process.env.JWT_SECRET||"";
const SITE_URL=(process.env.SITE_URL||"").replace(/\/$/,"");
const DEFAULT_FRONTEND_ORIGINS=["https://korczaktechnology-tech.github.io"];
const API_ORIGINS=(process.env.FRONTEND_URL||"").split(",").map(v=>v.trim().replace(/\/$/,"")).filter(Boolean);
const ALLOWED_ORIGINS=[...new Set([...DEFAULT_FRONTEND_ORIGINS,...API_ORIGINS])];

if(isProd&&(!SECRET||SECRET.length<32))throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
if(isProd&&!SITE_URL)throw new Error("SITE_URL must be configured in production.");

let db=null;
const mongo=process.env.MONGODB_URI?new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000}):null;
const stripe=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
const FRONTEND_URLS=(process.env.FRONTEND_URL||"").split(",").map(v=>v.trim().replace(/\/$/,"")).filter(Boolean);
const FRONTEND_URL=FRONTEND_URLS[0]||"";
const checkoutBase=FRONTEND_URL||SITE_URL||"http://localhost:3000";
const commercialProducts=Object.fromEntries([
  ["korczak-ai",{"amount":9900,"currency":"brl","priceId":process.env.STRIPE_PRICE_KORCZAK_AI||""}],
  ["morok",{"amount":4900,"currency":"brl","priceId":process.env.STRIPE_PRICE_MOROK||""}],
  ["ide",{"amount":7900,"currency":"brl","priceId":process.env.STRIPE_PRICE_IDE||""}],
  ["workspace",{"amount":14900,"currency":"brl","priceId":process.env.STRIPE_PRICE_WORKSPACE||""}],
  ["flow",{"amount":9900,"currency":"brl","priceId":process.env.STRIPE_PRICE_FLOW||""}],
  ["documents",{"amount":5900,"currency":"brl","priceId":process.env.STRIPE_PRICE_DOCUMENTS||""}],
  ["vision",{"amount":9900,"currency":"brl","priceId":process.env.STRIPE_PRICE_VISION||""}],
  ["ops",{"amount":9900,"currency":"brl","priceId":process.env.STRIPE_PRICE_OPS||""}],
  ["connect",{"amount":7900,"currency":"brl","priceId":process.env.STRIPE_PRICE_CONNECT||""}],
  ["mobile",{"amount":7900,"currency":"brl","priceId":process.env.STRIPE_PRICE_MOBILE||""}]
]);

const products=[
["korczak-ai","Korczak AI","AI / Platform","Inteligência e automação para o ecossistema Korczak.","Em evolução"],
["morok","MOROK","Assistente / Interface","Assistente pessoal e operacional multiplataforma.","Em desenvolvimento"],
["ide","Korczak IDE","Developer Tool","Ambiente de desenvolvimento para construir e operar projetos.","Em desenvolvimento"],
["workspace","Korczak Workspace","Workspace","Espaço unificado para FLOW, DOCUMENTS, VISION, OPS e outros módulos.","Em evolução"],
["flow","KORCZAK FLOW","Operations","Fluxos e automações organizacionais.","Em evolução"],
["documents","KORCZAK DOCUMENTS","Documents","Organização e gestão documental.","Em evolução"],
["vision","KORCZAK VISION","Intelligence","Visão operacional e acompanhamento de informações.","Em evolução"],
["ops","KORCZAK OPS","Operations","Operações, monitoramento e controle.","Em evolução"],
["connect","KORCZAK CONNECT","Connectivity","Conectividade entre pessoas, serviços e produtos.","Planejado"],
["mobile","KORCZAK MOBILE","Mobile","Experiências móveis do ecossistema.","Planejado"]
].map(x=>({id:x[0],name:x[1],type:x[2],description:x[3],status:x[4]}));

app.disable("x-powered-by");
app.set("trust proxy",1);
app.use(helmet({
  contentSecurityPolicy:false,
  crossOriginEmbedderPolicy:false,
  referrerPolicy:{policy:"strict-origin-when-cross-origin"}
}));
app.use(cors({
  origin(origin,callback){
    if(!origin||ALLOWED_ORIGINS.includes(origin))return callback(null,true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  methods:["GET","POST","OPTIONS"],
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
          {$set:{status,paymentStatus:session.payment_status||null,updatedAt:new Date()}}
        );
      }
    }
    res.json({received:true});
  }catch(err){
    console.error("Stripe webhook error:",err?.message||err);
    res.status(500).json({error:"Erro ao processar webhook"});
  }
});
app.use(express.json({limit:"100kb"}));

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

app.get("/api/health",(req,res)=>res.status(200).json({
  ok:true,service:"kztechsite",database:Boolean(db),stripe:Boolean(stripe),
  environment:process.env.NODE_ENV||"development",time:new Date().toISOString()
}));
app.get("/api/ready",(req,res)=>{
  const ready=Boolean(db);
  res.status(ready?200:503).json({ready,database:ready,time:new Date().toISOString()});
});
app.get("/api/products",(req,res)=>res.json(products.map(p=>({...p,commercial:Boolean(commercialProducts[p.id]),price:commercialProducts[p.id]?.amount||null,currency:commercialProducts[p.id]?.currency||"brl"}))));

app.post("/api/contact",async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const {name,phone,message}=req.body||{},mail=email(req.body?.email);
  if(!name||!mail||!message)return res.status(400).json({error:"Nome, email e mensagem são obrigatórios"});
  await db.collection("contacts").insertOne({
    name:String(name).trim().slice(0,120),email:mail.slice(0,180),
    phone:String(phone||"").slice(0,40),message:String(message).slice(0,5000),
    createdAt:new Date(),status:"new"
  });
  res.status(201).json({ok:true});
});

app.post("/api/auth/register",async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const name=String(req.body?.name||"").trim(),mail=email(req.body?.email),pass=String(req.body?.password||"");
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)||pass.length<8)
    return res.status(400).json({error:"Dados inválidos"});
  try{
    const r=await db.collection("users").insertOne({
      name,email:mail,passwordHash:await bcrypt.hash(pass,12),role:"user",
      verified:false,createdAt:new Date()
    });
    const u={_id:r.insertedId,name,email:mail,role:"user"};
    res.status(201).json({user:u,token:token(u)});
  }catch(e){
    res.status(e.code===11000?409:500).json({error:e.code===11000?"Email já cadastrado":"Falha ao criar conta"});
  }
});

app.post("/api/auth/login",async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const u=await db.collection("users").findOne({email:email(req.body?.email)});
  if(!u||!(await bcrypt.compare(String(req.body?.password||""),u.passwordHash)))
    return res.status(401).json({error:"Email ou senha inválidos"});
  const safe={_id:u._id,name:u.name,email:u.email,role:u.role};
  res.json({user:safe,token:token(safe)});
});

app.get("/api/quotes",auth,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("quotes").find({userId:req.user.sub}).sort({createdAt:-1}).limit(100).toArray();
  res.json(rows);
});

app.get("/api/orders",auth,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("orders").find({userId:req.user.sub}).sort({createdAt:-1}).limit(100).toArray();
  res.json(rows);
});

app.get("/api/me",auth,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  let id;
  try{id=new ObjectId(req.user.sub)}catch{return res.status(401).json({error:"Sessão inválida"})}
  const u=await db.collection("users").findOne({_id:id},{projection:{passwordHash:0}});
  u?res.json(u):res.status(404).json({error:"Usuário não encontrado"});
});

app.post("/api/quotes",auth,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const productId=String(req.body?.productId||"");
  const message=String(req.body?.message||"").trim();
  if(!products.some(p=>p.id===productId)||!message)return res.status(400).json({error:"Produto e mensagem são obrigatórios"});
  await db.collection("quotes").insertOne({
    userId:req.user.sub,productId,message:message.slice(0,4000),
    status:"pending",createdAt:new Date()
  });
  res.status(201).json({ok:true});
});

app.get("/api/admin/contacts",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  res.json(await db.collection("contacts").find().sort({createdAt:-1}).limit(100).toArray());
});
app.get("/api/admin/quotes",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  res.json(await db.collection("quotes").find().sort({createdAt:-1}).limit(100).toArray());
});

app.post("/api/checkout",auth,async(req,res)=>{
  if(!stripe)return res.status(503).json({error:"Stripe não configurado"});
  const p=products.find(x=>x.id===req.body?.productId);
  const config=p&&commercialProducts[p.id];
  if(!p||!config)return res.status(400).json({error:"Produto não disponível para compra"});
  const line=config.priceId
    ?{price:config.priceId,quantity:1}
    :{price_data:{currency:config.currency,product_data:{name:p.name},unit_amount:config.amount},quantity:1};
  const s=await stripe.checkout.sessions.create({
    mode:"payment",line_items:[line],
    success_url:checkoutBase+"/#/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}",
    cancel_url:checkoutBase+"/#/checkout/cancelado",
    customer_email:req.user.email,
    metadata:{userId:req.user.sub,productId:p.id}
  });
  if(db)await db.collection("orders").insertOne({
    userId:req.user.sub,productId:p.id,sessionId:s.id,status:"checkout_created",
    amount:config.amount,currency:config.currency,createdAt:new Date()
  });
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
    await db.collection("users").createIndex({email:1},{unique:true});
    await db.collection("contacts").createIndex({createdAt:-1});
    await db.collection("quotes").createIndex({createdAt:-1});
    await db.collection("quotes").createIndex({userId:1,createdAt:-1});
    await db.collection("orders").createIndex({userId:1,createdAt:-1});
    await db.collection("orders").createIndex({sessionId:1},{unique:true,sparse:true});
    console.log("MongoDB connected");
  }
  server=app.listen(PORT,()=>console.log(`KZTechSite API listening on ${PORT}`));
}
async function shutdown(signal){
  console.log(`${signal}: shutting down`);
  if(server)await new Promise(resolve=>server.close(resolve));
  if(mongo)await mongo.close();
  process.exit(0);
}
process.on("SIGTERM",()=>shutdown("SIGTERM"));
process.on("SIGINT",()=>shutdown("SIGINT"));
start().catch(e=>{console.error("Startup failed:",e.message);process.exit(1)});