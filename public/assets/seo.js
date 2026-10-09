(() => {
  const site = "https://site.korczaktech.com.br/";
  const brand = "Korczak Technologies";
  const image = site + "assets/mark.svg";
  const fallback = {
    title: "Korczak Technologies | Software e soluções digitais",
    description: "Conheça a Korczak Technologies: software, sistemas empresariais e produtos digitais."
  };
  const pages = {
    "/": fallback,
    "/mentoria": { title: "Mentoria em tecnologia | Korczak Technologies", description: "Conheça a mentoria da Korczak Technologies para orientação tecnológica, planejamento e desenvolvimento de soluções digitais." },
    "/comercial": { title: "Soluções comerciais | Korczak Technologies", description: "Conheça as soluções comerciais e os serviços de tecnologia da Korczak Technologies e entre em contato para discutir seu projeto." },
    "/pre-venda": { title: "Pré-venda de produtos | Korczak Technologies", description: "Consulte informações e manifeste interesse nos produtos e soluções digitais da Korczak Technologies." },
    "/institucional": { title: "Sobre a Korczak Technologies", description: "Conheça a Korczak Technologies, sua atuação em software, sistemas empresariais e produtos digitais." },
    "/produtos": { title: "Produtos de tecnologia | Korczak Technologies", description: "Explore os produtos, softwares e sistemas digitais da Korczak Technologies e conheça o ecossistema de soluções." },
    "/historia": { title: "Nossa história | Korczak Technologies", description: "Conheça a trajetória e o desenvolvimento da Korczak Technologies e de seu ecossistema de produtos digitais." },
    "/visao": { title: "Visão da empresa | Korczak Technologies", description: "Conheça a visão e os objetivos de longo prazo da Korczak Technologies no desenvolvimento de tecnologia e software." },
    "/valores": { title: "Valores institucionais | Korczak Technologies", description: "Conheça os valores e princípios institucionais da Korczak Technologies." },
    "/parcerias": { title: "Parcerias | Korczak Technologies", description: "Conheça oportunidades de parceria com a Korczak Technologies para iniciativas, produtos e soluções de tecnologia." },
    "/carreiras": { title: "Carreiras e oportunidades | Korczak Technologies", description: "Consulte informações sobre carreiras e possibilidades de colaboração com a Korczak Technologies." },
    "/faq": { title: "Perguntas frequentes | Korczak Technologies", description: "Encontre respostas para dúvidas frequentes sobre a Korczak Technologies, seus produtos e suas soluções digitais." },
    "/contato": { title: "Contato | Korczak Technologies", description: "Entre em contato com a Korczak Technologies para dúvidas, informações sobre produtos e propostas comerciais." },
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
      title: "Produtos de tecnologia | Korczak Technologies",
      description: "Conheça os produtos e soluções digitais da Korczak Technologies."
    } : fallback);
    document.title = data.title;
    meta("description", data.description);
    meta("og:title", data.title, true);
    meta("og:description", data.description, true);
    meta("og:url", site, true);
    meta("og:image", image, true);
    meta("twitter:title", data.title);
    meta("twitter:description", data.description);
    meta("twitter:image", image);
    // Rotas por fragmento não são URLs canônicas independentes; a página canônica é a raiz.
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = site;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", update);
  else update();
  window.addEventListener("hashchange", update);
})();
