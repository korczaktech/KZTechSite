(() => {
  const site = "https://site.korczaktech.com.br/";
  const fallback = {
    title: "Korczak Technologies | Software e soluções digitais",
    description: "Conheça a Korczak Technologies: soluções digitais, desenvolvimento de software, sistemas empresariais e produtos de tecnologia."
  };
  const pages = {
    "/": fallback,
    "/mentoria": { title: "Mentoria | Korczak Technologies", description: "Conheça a mentoria e os serviços de orientação tecnológica da Korczak Technologies." },
    "/comercial": { title: "Soluções comerciais | Korczak Technologies", description: "Conheça as soluções comerciais, serviços e possibilidades de atendimento da Korczak Technologies." },
    "/pre-venda": { title: "Pré-venda | Korczak Technologies", description: "Consulte informações e demonstre interesse nos produtos e soluções da Korczak Technologies." },
    "/institucional": { title: "Sobre a empresa | Korczak Technologies", description: "Conheça a empresa, sua atuação, visão e ecossistema de tecnologia da Korczak Technologies." },
    "/produtos": { title: "Produtos de tecnologia | Korczak Technologies", description: "Explore os produtos digitais, softwares e sistemas desenvolvidos pela Korczak Technologies." },
    "/historia": { title: "Nossa história | Korczak Technologies", description: "Conheça a trajetória e o desenvolvimento da Korczak Technologies." },
    "/visao": { title: "Visão | Korczak Technologies", description: "Conheça a visão e os objetivos de longo prazo da Korczak Technologies." },
    "/valores": { title: "Valores | Korczak Technologies", description: "Conheça os princípios e valores institucionais da Korczak Technologies." },
    "/parcerias": { title: "Parcerias | Korczak Technologies", description: "Saiba mais sobre oportunidades de parceria com a Korczak Technologies." },
    "/carreiras": { title: "Carreiras | Korczak Technologies", description: "Conheça oportunidades profissionais e possibilidades de colaboração com a Korczak Technologies." },
    "/faq": { title: "Perguntas frequentes | Korczak Technologies", description: "Encontre respostas para dúvidas frequentes sobre a Korczak Technologies, seus serviços e produtos." },
    "/contato": { title: "Contato | Korczak Technologies", description: "Entre em contato com a Korczak Technologies para dúvidas, propostas comerciais e informações." },
    "/conta": { title: "Minha conta | Korczak Technologies", description: "Acesse sua conta na plataforma Korczak Technologies." }
  };
  function meta(name, content, property = false) {
    const selector = property ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    let node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(property ? "property" : "name", name);
      document.head.appendChild(node);
    }
    node.setAttribute("content", content);
  }
  function update() {
    const raw = location.hash.startsWith("#/") ? location.hash.slice(1).split("?")[0] : "/";
    const path = raw.startsWith("/produto/") ? "/produto/" : raw;
    const data = pages[path] || (path === "/produto/" ? {
      title: "Produto | Korczak Technologies",
      description: "Conheça os produtos e soluções digitais da Korczak Technologies."
    } : fallback);
    document.title = data.title;
    meta("description", data.description);
    meta("og:title", data.title, true);
    meta("og:description", data.description, true);
    meta("og:url", site, true);
    meta("twitter:title", data.title);
    meta("twitter:description", data.description);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = site;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", update);
  else update();
  window.addEventListener("hashchange", update);
})();
