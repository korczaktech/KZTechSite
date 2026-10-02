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
const FRONTEND_URLS=(process.env.FRONTEND_URL||"").split(",").map(v=>v.trim().replace(/\/$/,"")).filter(Boolean);
const FRONTEND_ORIGINS=FRONTEND_URLS.map(v=>{try{return new URL(v).origin}catch{return v}}).filter(Boolean);
const ALLOWED_ORIGINS=[...new Set([...DEFAULT_FRONTEND_ORIGINS,...FRONTEND_ORIGINS,SITE_URL,"https://kztechsite.onrender.com"].filter(Boolean))];

if(isProd&&(!SECRET||SECRET.length<32))throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
if(isProd&&!SITE_URL)throw new Error("SITE_URL must be configured in production.");
if(isProd&&!FRONTEND_URLS.length)throw new Error("FRONTEND_URL must be configured in production.");

let db=null;
const mongo=process.env.MONGODB_URI?new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000}):null;
const stripe=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
const FRONTEND_URL=FRONTEND_URLS[0]||"";
const checkoutBase=FRONTEND_URL||SITE_URL||"http://localhost:3000";
const commercialProducts=Object.fromEntries([
  ["korczak-ai",{amount:4990,currency:"brl",priceId:process.env.STRIPE_PRICE_KORCZAK_AI||""}],
  ["workspace",{amount:6990,currency:"brl",priceId:process.env.STRIPE_PRICE_WORKSPACE||""}],
  ["ide",{amount:3990,currency:"brl",priceId:process.env.STRIPE_PRICE_IDE||""}],
  ["morok",{amount:2990,currency:"brl",priceId:process.env.STRIPE_PRICE_MOROK||""}],
  ["erp",{amount:9990,currency:"brl",priceId:process.env.STRIPE_PRICE_ERP||""}],
  ["flow",{amount:3990,currency:"brl",priceId:process.env.STRIPE_PRICE_FLOW||""}],
  ["documents",{amount:2490,currency:"brl",priceId:process.env.STRIPE_PRICE_DOCUMENTS||""}],
  ["vision",{amount:3990,currency:"brl",priceId:process.env.STRIPE_PRICE_VISION||""}],
  ["ops",{amount:4990,currency:"brl",priceId:process.env.STRIPE_PRICE_OPS||""}],
  ["connect",{amount:2990,currency:"brl",priceId:process.env.STRIPE_PRICE_CONNECT||""}],
  ["mobile",{amount:2990,currency:"brl",priceId:process.env.STRIPE_PRICE_MOBILE||""}]
]);

const products=[
["korczak-ai","KORCZAK AI","Inteligência","Camada de inteligência para assistência, análise e automação.","Em evolução"],
["workspace","Korczak Workspace","Workspace","Ambiente unificado para reunir produtos, documentos, operações e fluxos.","Em evolução"],
["ide","Korczak IDE","Desenvolvimento","Ambiente para criar, testar, organizar e evoluir software.","Em desenvolvimento"],
["morok","MOROK","Assistente","Assistente pessoal e operacional com interface web, desktop e mobile.","Em desenvolvimento"],
["erp","KORCZAK ERP","Gestão","Núcleo de gestão para organizar clientes, operações, financeiro e processos.","Em desenvolvimento"],
["flow","KORCZAK FLOW","Automação","Criação e acompanhamento de fluxos, tarefas e automações.","Em evolução"],
["documents","KORCZAK DOCUMENTS","Documentos","Criação, organização, consulta e gestão do ciclo de documentos.","Em evolução"],
["vision","KORCZAK VISION","Inteligência operacional","Painéis e visão operacional para acompanhar informação e contexto.","Em evolução"],
["ops","KORCZAK OPS","Operações","Controle técnico e operacional do ecossistema Korczak.","Em evolução"],
["connect","KORCZAK CONNECT","Conectividade","Integração entre pessoas, produtos, serviços e canais.","Planejado"],
["mobile","KORCZAK MOBILE","Mobile","Experiência móvel para acessar e operar o ecossistema.","Planejado"]
].map(x=>({id:x[0],name:x[1],type:x[2],description:x[3],status:x[4]}));

app.disable("x-powered-by");
app.set("trust proxy",1);
app.use(helmet({
  contentSecurityPolicy:{
    directives:{
      defaultSrc:["'self'"],
      scriptSrc:["'self'"],
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
const emailValida=v=>/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(v||"").trim());
function idMongo(v){try{return new ObjectId(v)}catch{return null}}
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

app.post("/api/analiticas/evento",async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const b=req.body||{},pagina=String(b.pagina||"/").slice(0,300),tipo=String(b.tipo||"visualizacao").slice(0,60);
  if(!pagina)return res.status(400).json({error:"Página inválida"});
  await db.collection("analiticas").insertOne({
    pagina,tipo,
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
  const [total,unicos,paginas,dispositivos,navegadores,tipos,diarios,ultimos]=await Promise.all([
    db.collection("analiticas").countDocuments({criadoEm:{$gte:desde}}),
    db.collection("analiticas").aggregate([
      {$match:{criadoEm:{$gte:desde},tipo:"visualizacao"}},
      {$group:{_id:"$referencia"}},{$count:"total"}
    ]).toArray(),
    db.collection("analiticas").aggregate([
      {$match:{criadoEm:{$gte:desde},tipo:"visualizacao"}},
      {$group:{_id:"$pagina",total:{$sum:1}}},{$sort:{total:-1}},{$limit:12}
    ]).toArray(),
    db.collection("analiticas").aggregate([
      {$match:{criadoEm:{$gte:desde}}},
      {$group:{_id:"$dispositivo",total:{$sum:1}}},{$sort:{total:-1}}
    ]).toArray(),
    db.collection("analiticas").aggregate([
      {$match:{criadoEm:{$gte:desde}}},
      {$group:{_id:"$navegador",total:{$sum:1}}},{$sort:{total:-1}},{$limit:8}
    ]).toArray(),
    db.collection("analiticas").aggregate([
      {$match:{criadoEm:{$gte:desde}}},
      {$group:{_id:"$tipo",total:{$sum:1}}},{$sort:{total:-1}}
    ]).toArray(),
    db.collection("analiticas").aggregate([
      {$match:{criadoEm:{$gte:desde}}},
      {$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$criadoEm"}},total:{$sum:1}}},
      {$sort:{_id:1}}
    ]).toArray(),
    db.collection("analiticas").find({}).sort({criadoEm:-1}).limit(20).project({referencia:1,pagina:1,tipo:1,evento:1,dispositivo:1,criadoEm:1}).toArray()
  ]);
  res.json({dias,total,visitantes:(unicos[0]?.total||0),paginas,dispositivos,navegadores,tipos,diarios,ultimos});
});
app.get("/api/admin/resumo",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const [conteudo,midias,admins,auditoria,usuarios,contatos,orcamentos,pedidos]=await Promise.all([
    db.collection("conteudo").countDocuments(),
    db.collection("midias").countDocuments(),
    db.collection("usuarios_administradores").countDocuments(),
    db.collection("auditoria").countDocuments(),
    db.collection("users").countDocuments(),
    db.collection("contacts").countDocuments(),
    db.collection("quotes").countDocuments(),
    db.collection("orders").countDocuments()
  ]);
  res.json({"Regras de conteúdo":conteudo,"Mídias":midias,"Administradores":admins,"Registros de auditoria":auditoria,"Usuários":usuarios,"Contatos":contatos,"Orçamentos":orcamentos,"Pedidos":pedidos});
});
app.get("/api/admin/conteudo",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("conteudo").find().sort({atualizadoEm:-1}).limit(1000).toArray();
  res.json(rows.map(r=>({...r,_id:String(r._id)})));
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

app.get("/api/admin/midias",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("midias").find({}, {projection:{dados:0}}).sort({criadoEm:-1}).limit(300).toArray();
  res.json(rows.map(r=>({...r,_id:String(r._id),url:`/api/midia/${r._id}`})));
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
    const r=await db.collection("users").insertOne({name:nome,email:mail,passwordHash:await bcrypt.hash(senha,12),role:"admin",verified:true,createdAt:agora});
    await db.collection("usuarios_administradores").insertOne({usuarioId:String(r.insertedId),nome,email:mail,papel:"administrador",criadoEm:agora,criadoPor:req.user.email});
    await registrarAuditoria(req,"criar_administrador",`Administrador ${mail} criado`);
    res.status(201).json({ok:true});
  }catch(e){res.status(e.code===11000?409:500).json({error:e.code===11000?"E-mail já cadastrado":"Falha ao criar administrador"})}
});
app.get("/api/admin/auditoria",auth,admin,async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const rows=await db.collection("auditoria").find().sort({criadoEm:-1}).limit(300).toArray();
  res.json(rows.map(r=>({...r,_id:String(r._id)})));
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

app.get("/health",(req,res)=>res.status(200).json({
  ok:true,service:"kztechsite",database:Boolean(db),stripe:Boolean(stripe),
  environment:process.env.NODE_ENV||"development",time:new Date().toISOString()
}));
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
  const cleanName=String(name||"").trim(),cleanMessage=String(message||"").trim(),cleanPhone=String(phone||"").trim();
  if(cleanName.length<2||cleanName.length>120||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(mail)||cleanMessage.length<1||cleanMessage.length>5000||cleanPhone.length>40)
    return res.status(400).json({error:"Dados de contato inválidos"});
  await db.collection("contacts").insertOne({
    name:cleanName,email:mail.slice(0,180),
    phone:cleanPhone,message:cleanMessage,
    createdAt:new Date(),status:"new"
  });
  res.status(201).json({ok:true});
});

app.post("/api/auth/register",async(req,res)=>{
  if(!db)return res.status(503).json({error:"Banco não configurado"});
  const name=String(req.body?.name||"").trim(),mail=email(req.body?.email),pass=String(req.body?.password||"");
  if(name.length<2||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)||pass.length<8||pass.length>128)
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
    await db.collection("conteudo").createIndex({publicado:1,pagina:1,ordem:1});
  await db.collection("analiticas").createIndex({criadoEm:-1});
  await db.collection("analiticas").createIndex({pagina:1,criadoEm:-1});
    await db.collection("conteudo").createIndex({seletor:1,pagina:1},{unique:true});
    await db.collection("midias").createIndex({criadoEm:-1});
    await db.collection("usuarios_administradores").createIndex({email:1},{unique:true});
    await db.collection("auditoria").createIndex({criadoEm:-1});
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