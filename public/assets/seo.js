(() => {
  const site = "https://site.korczaktech.com.br/";
  const brand = "Korczak Tecnologies";
  const image = site + "assets/mark.svg";
  const fallback = {
    title: "Korczak Tecnologies | Software e soluções digitais",
    description: "Conheça a Korczak Tecnologies: software, sistemas empresariais e produtos digitais."
  };
  const pages = {
    "/": fallback,
    "/mentoria": { title: "Mentoria em tecnologia | Korczak Tecnologies", description: "Conheça a mentoria da Korczak Tecnologies para orientação tecnológica, planejamento e desenvolvimento de soluções digitais." },
    "/comercial": { title: "Soluções comerciais | Korczak Tecnologies", description: "Conheça as soluções comerciais e os serviços de tecnologia da Korczak Tecnologies e entre em contato para discutir seu projeto." },
    "/pre-venda": { title: "Pré-venda de produtos | Korczak Tecnologies", description: "Consulte informações e manifeste interesse nos produtos e soluções digitais da Korczak Tecnologies." },
    "/institucional": { title: "Sobre a Korczak Tecnologies", description: "Conheça a Korczak Tecnologies, sua atuação em software, sistemas empresariais e produtos digitais." },
    "/produtos": { title: "Produtos de tecnologia | Korczak Tecnologies", description: "Explore os produtos, softwares e sistemas digitais da Korczak Tecnologies e conheça o ecossistema de soluções." },
    "/historia": { title: "Nossa história | Korczak Tecnologies", description: "Conheça a trajetória e o desenvolvimento da Korczak Tecnologies e de seu ecossistema de produtos digitais." },
    "/visao": { title: "Visão da empresa | Korczak Tecnologies", description: "Conheça a visão e os objetivos de longo prazo da Korczak Tecnologies no desenvolvimento de tecnologia e software." },
    "/valores": { title: "Valores institucionais | Korczak Tecnologies", description: "Conheça os valores e princípios institucionais da Korczak Tecnologies." },
    "/parcerias": { title: "Parcerias | Korczak Tecnologies", description: "Conheça oportunidades de parceria com a Korczak Tecnologies para iniciativas, produtos e soluções de tecnologia." },
    "/carreiras": { title: "Carreiras e oportunidades | Korczak Tecnologies", description: "Consulte informações sobre carreiras e possibilidades de colaboração com a Korczak Tecnologies." },
    "/faq": { title: "Perguntas frequentes | Korczak Tecnologies", description: "Encontre respostas para dúvidas frequentes sobre a Korczak Tecnologies, seus produtos e suas soluções digitais." },
    "/contato": { title: "Contato | Korczak Tecnologies", description: "Entre em contato com a Korczak Tecnologies para dúvidas, informações sobre produtos e propostas comerciais." },
    "/conta": { title: "Minha conta | Korczak Tecnologies", description: "Acesse sua conta na plataforma Korczak Tecnologies." }
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
      title: "Produtos de tecnologia | Korczak Tecnologies",
      description: "Conheça os produtos e soluções digitais da Korczak Tecnologies."
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
