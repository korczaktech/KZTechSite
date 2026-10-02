const A="https://kztechsite.onrender.com/api",E=id=>document.getElementById(id);
async function entrar(e){
  e.preventDefault();
  const form=E("lf"),msg=E("m"),btn=form.querySelector("button");
  const email=E("e").value.trim(),password=E("s").value;
  if(!email||!password){msg.textContent="Informe e-mail e senha.";return}
  btn.disabled=true;btn.textContent="Entrando…";msg.textContent="Conectando ao servidor…";
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
    const r=await fetch(A+"/auth/login",{method:"POST",signal:controller.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||"Não foi possível entrar.");
    if(d?.user?.role!=="admin")throw Error("Conta sem permissão de administrador.");
    if(!d.token)throw Error("O servidor não retornou uma sessão.");
    sessionStorage.setItem("adm",d.token);
    location.href="./dashboard.html";
  }catch(x){
    msg.textContent=x?.name==="AbortError"?"O servidor demorou demais para responder.":(x?.message||"Erro ao entrar.");
  }finally{
    clearTimeout(timer);btn.disabled=false;btn.textContent="Entrar";
  }
}
E("lf").addEventListener("submit",entrar);