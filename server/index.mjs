import express from "express";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {MongoClient,ObjectId} from "mongodb";
import Stripe from "stripe";
import path from "node:path";
import {fileURLToPath} from "node:url";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express(),PORT=process.env.PORT||3000,SECRET=process.env.JWT_SECRET||"dev-change-me";
let db=null; const mongo=process.env.MONGODB_URI?new MongoClient(process.env.MONGODB_URI):null;
const stripe=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
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
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));
app.use(express.json({limit:"100kb"}));
const email=v=>String(v||"").trim().toLowerCase();
const token=u=>jwt.sign({sub:String(u._id),email:u.email,role:u.role||"user"},SECRET,{expiresIn:"7d"});
function auth(req,res,next){try{const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))throw 0;req.user=jwt.verify(h.slice(7),SECRET);next()}catch{res.status(401).json({error:"Não autenticado"})}}
function admin(req,res,next){if(req.user?.role!=="admin")return res.status(403).json({error:"Acesso restrito"});next()}
app.get("/api/health",(req,res)=>res.json({ok:true,database:Boolean(db),stripe:Boolean(stripe),time:new Date().toISOString()}));
app.get("/api/products",(req,res)=>res.json(products));
app.post("/api/contact",async(req,res)=>{const {name,phone,message}=req.body||{},mail=email(req.body?.email);if(!name||!mail||!message)return res.status(400).json({error:"Nome, email e mensagem são obrigatórios"});const d={name:String(name).slice(0,120),email:mail.slice(0,180),phone:String(phone||"").slice(0,40),message:String(message).slice(0,5000),createdAt:new Date(),status:"new"};if(db)await db.collection("contacts").insertOne(d);res.status(201).json({ok:true})});
app.post("/api/auth/register",async(req,res)=>{if(!db)return res.status(503).json({error:"Banco não configurado"});const name=String(req.body?.name||"").trim(),mail=email(req.body?.email),pass=String(req.body?.password||"");if(name.length<2||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(mail)||pass.length<8)return res.status(400).json({error:"Dados inválidos"});try{const r=await db.collection("users").insertOne({name,email:mail,passwordHash:await bcrypt.hash(pass,12),role:"user",verified:false,createdAt:new Date()});const u={_id:r.insertedId,name,email:mail,role:"user"};res.status(201).json({user:u,token:token(u)})}catch(e){res.status(e.code===11000?409:500).json({error:e.code===11000?"Email já cadastrado":"Falha ao criar conta"})}});
app.post("/api/auth/login",async(req,res)=>{if(!db)return res.status(503).json({error:"Banco não configurado"});const u=await db.collection("users").findOne({email:email(req.body?.email)});if(!u||!(await bcrypt.compare(String(req.body?.password||""),u.passwordHash)))return res.status(401).json({error:"Email ou senha inválidos"});const safe={_id:u._id,name:u.name,email:u.email,role:u.role};res.json({user:safe,token:token(safe)})});
app.get("/api/me",auth,async(req,res)=>{if(!db)return res.status(503).json({error:"Banco não configurado"});const u=await db.collection("users").findOne({_id:new ObjectId(req.user.sub)},{projection:{passwordHash:0}});u?res.json(u):res.status(404).json({error:"Usuário não encontrado"})});
app.post("/api/quotes",auth,async(req,res)=>{if(!db)return res.status(503).json({error:"Banco não configurado"});await db.collection("quotes").insertOne({userId:req.user.sub,productId:String(req.body?.productId||""),message:String(req.body?.message||"").slice(0,4000),status:"pending",createdAt:new Date()});res.status(201).json({ok:true})});
app.get("/api/admin/contacts",auth,admin,async(req,res)=>res.json(db?await db.collection("contacts").find().sort({createdAt:-1}).limit(100).toArray():[]));
app.get("/api/admin/quotes",auth,admin,async(req,res)=>res.json(db?await db.collection("quotes").find().sort({createdAt:-1}).limit(100).toArray():[]));
app.post("/api/checkout",auth,async(req,res)=>{if(!stripe)return res.status(503).json({error:"Stripe não configurado"});const p=products.find(x=>x.id===req.body?.productId),amount=Number(req.body?.amount);if(!p||!Number.isFinite(amount)||amount<1)return res.status(400).json({error:"Produto ou valor inválido"});const s=await stripe.checkout.sessions.create({mode:"payment",line_items:[{price_data:{currency:"brl",product_data:{name:p.name},unit_amount:Math.round(amount*100)},quantity:1}],success_url:(process.env.SITE_URL||"http://localhost:3000")+"/#/checkout/sucesso",cancel_url:(process.env.SITE_URL||"http://localhost:3000")+"/#/checkout/cancelado",metadata:{userId:req.user.sub,productId:p.id}});res.json({url:s.url})});
app.use(express.static(path.join(__dirname,"../public")));
app.use((req,res)=>res.sendFile(path.join(__dirname,"../public/index.html")));
async function start(){if(mongo){await mongo.connect();db=mongo.db(process.env.MONGODB_DB||"KZTech");await db.collection("users").createIndex({email:1},{unique:true});await db.collection("contacts").createIndex({createdAt:-1});await db.collection("quotes").createIndex({createdAt:-1})}app.listen(PORT,()=>console.log("KZTechSite "+PORT))}
start().catch(e=>{console.error(e);process.exit(1)});
