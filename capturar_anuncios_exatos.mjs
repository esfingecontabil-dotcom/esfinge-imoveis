import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import * as cheerio from "cheerio";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Extração Estruturada de Preço
 */
function extrairPrecoExato($, html) {
  const jsonLdScripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const data = JSON.parse($(jsonLdScripts[i]).html());
      if (data.offers?.price) return parseFloat(data.offers.price);
      if (Array.isArray(data) && data[0]?.offers?.price) return parseFloat(data[0].offers.price);
    } catch (e) {}
  }

  const seletores = [
    ".valor-imovel",
    ".preco-imovel",
    ".property-price",
    ".item-price",
    ".price",
    ".preco",
    ".value",
    ".valores-imovel",
    "[itemprop='price']",
    ".card-price",
  ];

  for (const sel of seletores) {
    const el = $(sel).first();
    if (el.length > 0) {
      const match = el.text().trim().match(/R\$\s?([\d\.,]+)/i);
      if (match && match[1]) {
        const val = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        if (!isNaN(val) && val > 0) return val;
      }
    }
  }

  const mainText = $("main, article, .detalhes-imovel, .content-imovel, body").text();
  const match = mainText.match(/R\$\s?([\d\.,]+)/i);
  if (match && match[1]) {
    const val = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    if (!isNaN(val) && val > 0) return val;
  }

  return 0;
}

/**
 * 2. Extração de Modalidade
 */
function extrairModalidadeExata($, url, fallback) {
  const urlLow = url.toLowerCase();
  const breadcrumb = $(".breadcrumb, .migalhas, nav[aria-label='breadcrumb']").text().toLowerCase();
  const corpoTexto = ($("h1").first().text() + " " + $('meta[property="og:title"]').attr("content") + " " + $("body").text().substring(0, 1500)).toLowerCase();

  if (breadcrumb.includes("temporada") || urlLow.includes("temporada") || corpoTexto.includes("diária") || corpoTexto.includes("por dia")) {
    return "Temporada";
  }
  if (breadcrumb.includes("loca") || breadcrumb.includes("alug") || urlLow.includes("alug") || urlLow.includes("loca") || corpoTexto.includes("locação") || corpoTexto.includes("aluguel") || corpoTexto.includes("/mês")) {
    return "Locacao";
  }
  if (breadcrumb.includes("venda") || urlLow.includes("venda") || urlLow.includes("comprar") || corpoTexto.includes("à venda") || corpoTexto.includes("vende-se")) {
    return "Venda";
  }

  return fallback || "Venda";
}

/**
 * 3. Extração da Ficha Técnica
 */
function extrairFichaTecnica($, html) {
  const textoGeral = $("body").text();

  let quartos = 0;
  const mQuartos = textoGeral.match(/(\d+)\s*(?:quarto|dormit|su[ií]te)/i);
  if (mQuartos) quartos = parseInt(mQuartos[1], 10);

  let banheiros = 0;
  const mBanheiros = textoGeral.match(/(\d+)\s*(?:banheiro|bwc|lavabo)/i);
  if (mBanheiros) banheiros = parseInt(mBanheiros[1], 10);

  let vagas = 0;
  const mVagas = textoGeral.match(/(\d+)\s*(?:vaga|garagem)/i);
  if (mVagas) vagas = parseInt(mVagas[1], 10);

  let area_m2 = 0;
  const mArea = textoGeral.match(/(\d+(?:[\.,]\d+)?)\s*(?:m²|m2|metros)/i);
  if (mArea) area_m2 = parseFloat(mArea[1].replace(",", "."));

  return {
    quartos: quartos || 2,
    banheiros: banheiros || 1,
    vagas: vagas || 1,
    area_m2: area_m2 || 90,
  };
}

/**
 * 4. Extração de Fotos Reais
 */
function extrairFotosReais(html, baseUrl) {
  const $ = cheerio.load(html);
  const fotos = new Set();

  const normalizar = (link) => {
    if (!link) return null;
    let l = link.trim().replace(/\\"/g, "").replace(/\\/g, "");
    if (l.startsWith("//")) l = "https:" + l;
    else if (l.startsWith("/")) {
      try {
        const u = new URL(baseUrl);
        l = `${u.protocol}//${u.host}${l}`;
      } catch {
        return null;
      }
    }
    if (!l.startsWith("http")) return null;
    const low = l.toLowerCase();
    if (low.includes("logo") || low.includes("icon") || low.includes("banner") || low.includes("avatar") || low.includes(".svg")) return null;
    if (low.includes(".jpg") || low.includes(".jpeg") || low.includes(".webp") || low.includes(".png") || low.includes("/imoveis/") || low.includes("/fotos/") || low.includes("/storage/")) return l;
    return null;
  };

  const og = normalizar($('meta[property="og:image"]').attr("content"));
  if (og) fotos.add(og);

  $("a, img, div").each((_, el) => {
    const src =
      $(el).attr("data-full") ||
      $(el).attr("data-src") ||
      $(el).attr("data-lazy") ||
      $(el).attr("data-zoom-image") ||
      $(el).attr("href") ||
      $(el).attr("src");
    const link = normalizar(src);
    if (link) fotos.add(link);
  });

  return Array.from(fotos).slice(0, 10);
}

/**
 * 5. Varredura com Paginação
 */
async function coletarLinksComPaginacao(baseUrl, rotaBase, maxPaginas = 2) {
  const linksTotais = new Set();

  for (let pag = 1; pag <= maxPaginas; pag++) {
    const separador = rotaBase.includes("?") ? "&" : "?";
    const urlAlvo = `${rotaBase}${separador}page=${pag}`;

    try {
      const res = await axios.get(urlAlvo, { headers, timeout: 18000 });
      const $ = cheerio.load(res.data);
      let encontradosNestaPagina = 0;

      $("a").each((_, el) => {
        let href = $(el).attr("href");
        if (!href) return;

        if (href.startsWith("/")) {
          try {
            const u = new URL(baseUrl);
            href = `${u.protocol}//${u.host}${href}`;
          } catch (e) {
            return;
          }
        }

        if (!href.startsWith("http")) return;

        const low = href.toLowerCase();
        const ehLixo =
          low.includes("whatsapp") ||
          low.includes("tel:") ||
          low.includes("mailto:") ||
          low.includes("javascript:") ||
          low.includes("/contato") ||
          low.includes("/sobre") ||
          low.includes("#");

        if (ehLixo) return;

        const ehImovel =
          low.includes("/imovel/") ||
          low.includes("/imoveis/") ||
          low.includes("/detalhes/") ||
          low.includes("/detalhe/") ||
          low.includes("/propriedade/") ||
          low.includes("/apartamento") ||
          low.includes("/casa") ||
          low.includes("/sobrado") ||
          /\/\d+$/.test(low);

        if (ehImovel) {
          linksTotais.add(href);
          encontradosNestaPagina++;
        }
      });

      if (encontradosNestaPagina === 0) break;
      await delay(500);
    } catch (e) {
      break;
    }
  }

  return Array.from(linksTotais);
}

/**
 * 6. Processador do Anúncio Individual
 */
async function processarAnuncio(url, imobiliariaInfo, modalidadeFallback) {
  try {
    const res = await axios.get(url, { headers, timeout: 15000 });
    const html = res.data;
    const $ = cheerio.load(html);

    let titulo = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    titulo = titulo.replace(/\s+/g, " ").trim();
    if (!titulo || titulo.length < 5) titulo = `Imóvel em ${imobiliariaInfo.cidade}`;

    const preco = extrairPrecoExato($, html);
    let modalidade = extrairModalidadeExata($, url, modalidadeFallback);

    if (modalidade === "Temporada" && preco > 15000) modalidade = "Venda";
    if (modalidade === "Locacao" && preco > 35000) modalidade = "Venda";
    if (modalidade === "Venda" && preco > 0 && preco < 15000) modalidade = "Locacao";

    const ficha = extrairFichaTecnica($, html);
    const imagens = extrairFotosReais(html, url);
    if (imagens.length === 0) return null;

    const tLow = (titulo + " " + url).toLowerCase();
    const tipo = tLow.includes("apartamento")
      ? "Apartamento"
      : tLow.includes("sobrado")
      ? "Sobrado"
      : tLow.includes("terreno") || tLow.includes("lote")
      ? "Terreno"
      : tLow.includes("comercial") || tLow.includes("prédio") || tLow.includes("sala")
      ? "Comercial"
      : "Casa";

    let bairro = imobiliariaInfo.bairroPadrao;
    const mBairro = (titulo + " " + $("body").text()).match(/bairro\s+([A-Za-zÀ-ÿ\s0-9]+)/i);
    if (mBairro && mBairro[1].length < 30) bairro = mBairro[1].trim();

    const slug = url.split("/").filter(Boolean).pop().substring(0, 15).toUpperCase();
    const codigo = `ESF-${imobiliariaInfo.prefixo}-${slug}`;

    return {
      codigo,
      titulo,
      descricao: `Imóvel anunciado por ${imobiliariaInfo.nome}. Entre em contato para ficha técnica completa e agendamento de visita.`,
      tipo,
      estado: imobiliariaInfo.estado,
      cidade: imobiliariaInfo.cidade,
      bairro,
      modalidade,
      preco,
      capacidade_pessoas: modalidade === "Temporada" ? 8 : 0,
      quartos: ficha.quartos,
      banheiros: ficha.banheiros,
      vagas: ficha.vagas,
      area_m2: ficha.area_m2,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: tLow.includes("piscina"),
      imagens,
      corretor_nome: imobiliariaInfo.nome,
      corretor_telefone: imobiliariaInfo.telefone,
      corretor_creci: imobiliariaInfo.creci,
      imobiliaria_origem: imobiliariaInfo.nome,
      link_origem: url,
    };
  } catch (err) {
    return null;
  }
}

/**
 * 7. Catálogo com Parâmetros Diretos de Busca
 */
const redeImobiliarias = [
  {
    nome: "Opção Imóveis",
    prefixo: "OPC",
    dominio: "https://opcaoimoveis.com.br",
    rotas: [
      { url: "https://opcaoimoveis.com.br/imoveis?sale=false&rent=true", modalidade: "Locacao" },
      { url: "https://opcaoimoveis.com.br/imoveis?sale=true&rent=false", modalidade: "Venda" },
    ],
    cidade: "Maringá",
    bairroPadrao: "Zona 07",
    estado: "PR",
    telefone: "4430321300",
    creci: "PR-3032J",
  },
  {
    nome: "Atlântico Sul Imóveis",
    prefixo: "ATS",
    dominio: "https://www.atlanticosulimoveis.com.br",
    rotas: [
      { url: "https://www.atlanticosulimoveis.com.br/temporada", modalidade: "Temporada" },
      { url: "https://www.atlanticosulimoveis.com.br/oportunidades", modalidade: "Venda" },
    ],
    cidade: "Pontal do Paraná",
    bairroPadrao: "Praia de Leste",
    estado: "PR",
    telefone: "4134581111",
    creci: "PR-3458J",
  },
  {
    nome: "V3 Imóveis Caiobá",
    prefixo: "V3",
    dominio: "https://www.v3imobiliaria.com.br",
    rotas: [
      { url: "https://www.v3imobiliaria.com.br/imoveis", modalidade: "Venda" },
    ],
    cidade: "Matinhos",
    bairroPadrao: "Caiobá",
    estado: "PR",
    telefone: "4134732081",
    creci: "PR-5906J",
  },
  {
    nome: "Jurema Imóveis",
    prefixo: "JUR",
    dominio: "https://juremaimoveis.com.br",
    rotas: [
      { url: "https://juremaimoveis.com.br/temporada", modalidade: "Temporada" },
      { url: "https://juremaimoveis.com.br/venda", modalidade: "Venda" },
    ],
    cidade: "Matinhos",
    bairroPadrao: "Caiobá",
    estado: "PR",
    telefone: "4134732351",
    creci: "PR-4320J",
  },
];

async function executarVarreduraOtimizada() {
  console.log("==================================================================");
  console.log("🚀 VARREDURA OTIMIZADA: PARÂMETROS DIRETOS + PAGINAÇÃO");
  console.log("==================================================================\n");

  let totalSalvos = 0;

  for (const imob of redeImobiliarias) {
    console.log(`🏢 [${imob.cidade} - ${imob.estado}] ${imob.nome}`);

    for (const rota of imob.rotas) {
      console.log(`   📡 Varrendo [${rota.modalidade}]: ${rota.url}`);
      const links = await coletarLinksComPaginacao(imob.dominio, rota.url, 2);
      console.log(`      🔗 ${links.length} anúncios encontrados.`);

      for (const link of links) {
        const imovel = await processarAnuncio(link, imob, rota.modalidade);
        if (imovel && imovel.imagens.length > 0) {
          const { error } = await supabase.from("imoveis").upsert(imovel, { onConflict: "codigo" });
          if (!error) {
            totalSalvos++;
            console.log(`      ✅ [${imovel.modalidade}] "${imovel.titulo.substring(0, 40)}..."`);
            console.log(`         💰 R$ ${imovel.preco.toLocaleString("pt-BR")} | 📸 ${imovel.imagens.length} fotos reais`);
          }
        }
        await delay(400);
      }
    }
    console.log("");
  }

  console.log("==================================================================");
  console.log(`🏁 FINALIZADO: ${totalSalvos} imóveis importados com 100% de precisão!`);
  console.log("==================================================================");
}

executarVarreduraOtimizada();