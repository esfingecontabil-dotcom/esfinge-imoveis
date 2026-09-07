import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import * as cheerio from "cheerio";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
};

const CONCORRENCIA = 8;
const TIMEOUT_REQ = 10000;

function extrairPreco($, html) {
  const jsonLd = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLd.length; i++) {
    try {
      const d = JSON.parse($(jsonLd[i]).html());
      if (d.offers?.price) return parseFloat(d.offers.price);
      if (Array.isArray(d) && d[0]?.offers?.price) return parseFloat(d[0].offers.price);
    } catch (e) {}
  }

  const seletores = [
    ".valor-imovel",
    ".preco-imovel",
    ".property-price",
    ".price",
    ".preco",
    ".value",
    "[itemprop='price']",
  ];

  for (const s of seletores) {
    const el = $(s).first();
    if (el.length > 0) {
      const m = el.text().trim().match(/R\$\s?([\d\.,]+)/i);
      if (m && m[1]) {
        const v = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
        if (!isNaN(v) && v > 0) return v;
      }
    }
  }

  const m = $("body").text().match(/R\$\s?([\d\.,]+)/i);
  if (m && m[1]) {
    const v = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
    if (!isNaN(v) && v > 0) return v;
  }
  return 0;
}

function extrairFotosProfundo($, html, baseUrl) {
  const fotos = new Set();

  const normalizar = (link) => {
    if (!link) return null;
    let l = link.trim().replace(/\\"/g, "").replace(/\\/g, "");

    if (l.startsWith("//")) {
      l = "https:" + l;
    } else if (l.startsWith("/")) {
      try {
        const u = new URL(baseUrl);
        l = `https://${u.host}${l}`;
      } catch {
        return null;
      }
    } else if (l.startsWith("http://")) {
      // Força HTTPS para evitar Mixed Content no navegador
      l = l.replace("http://", "https://");
    }

    if (!l.startsWith("https://")) return null;

    const low = l.toLowerCase();
    if (
      low.includes("logo") ||
      low.includes("icon") ||
      low.includes("banner") ||
      low.includes("avatar") ||
      low.includes(".svg") ||
      low.includes("wpp-push") ||
      low.includes("back3.png")
    ) {
      return null;
    }

    const ehImagemValida =
      low.includes(".jpg") ||
      low.includes(".jpeg") ||
      low.includes(".webp") ||
      low.includes(".png") ||
      low.includes("/imoveis/") ||
      low.includes("/storage/") ||
      low.includes("/fotos/");

    return ehImagemValida ? l : null;
  };

  const og = normalizar($('meta[property="og:image"]').attr("content"));
  if (og) fotos.add(og);

  $("img, a, div, figure, source").each((_, el) => {
    const src =
      $(el).attr("data-src") ||
      $(el).attr("data-full") ||
      $(el).attr("data-lazy") ||
      $(el).attr("data-lazy-src") ||
      $(el).attr("data-image") ||
      $(el).attr("srcset")?.split(",")[0]?.trim()?.split(" ")[0] ||
      $(el).attr("src") ||
      $(el).attr("href");

    const link = normalizar(src);
    if (link) fotos.add(link);
  });

  return Array.from(fotos).slice(0, 10);
}

async function rasparAnuncioIndividual(url, imob) {
  try {
    const res = await axios.get(url, { headers, timeout: TIMEOUT_REQ });
    const html = res.data;
    const $ = cheerio.load(html);

    let titulo = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    titulo = titulo.replace(/\s+/g, " ").trim();
    if (!titulo || titulo.length < 5) return null;

    let preco = extrairPreco($, html);
    const tLow = (titulo + " " + url).toLowerCase();

    let modalidade = "Venda";
    if (tLow.includes("temporada") || (preco > 0 && preco <= 5000 && tLow.includes("diaria"))) {
      modalidade = "Temporada";
    } else if (
      tLow.includes("aluguel") ||
      tLow.includes("loca") ||
      (preco > 0 && preco <= 25000 && !tLow.includes("venda"))
    ) {
      modalidade = "Locacao";
    } else if (preco > 30000) {
      modalidade = "Venda";
    }

    if (!preco || preco < 100) {
      preco = modalidade === "Temporada" ? 950 : modalidade === "Locacao" ? 2800 : 750000;
    }

    const imagens = extrairFotosProfundo($, html, url);
    if (imagens.length === 0) return null;

    const texto = $("body").text();
    const mQ = texto.match(/(\d+)\s*(?:quarto|dormit|su[ií]te)/i);
    const mB = texto.match(/(\d+)\s*(?:banheiro|bwc|lavabo)/i);
    const mV = texto.match(/(\d+)\s*(?:vaga|garagem)/i);
    const mA = texto.match(/(\d+(?:[\.,]\d+)?)\s*(?:m²|m2|metros)/i);

    const prefixo = new URL(imob.dominio).hostname
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 4)
      .toUpperCase();
    const slug = url.split("/").filter(Boolean).pop().substring(0, 15).toUpperCase();
    const codigo = `ESF-${prefixo}-${slug}`;

    return {
      codigo,
      titulo,
      descricao: `Imóvel anunciado por ${imob.nome} em ${imob.cidade} - ${imob.estado}. Entre em contato para ficha técnica completa e agendamento de visita.`,
      tipo: tLow.includes("apartamento")
        ? "Apartamento"
        : tLow.includes("sobrado")
        ? "Sobrado"
        : tLow.includes("terreno") || tLow.includes("lote")
        ? "Terreno"
        : tLow.includes("comercial") || tLow.includes("sala")
        ? "Comercial"
        : "Casa",
      estado: imob.estado,
      cidade: imob.cidade,
      bairro: "Centro",
      modalidade,
      preco,
      capacidade_pessoas: modalidade === "Temporada" ? 8 : 0,
      quartos: mQ ? parseInt(mQ[1]) : 2,
      banheiros: mB ? parseInt(mB[1]) : 1,
      vagas: mV ? parseInt(mV[1]) : 1,
      area_m2: mA ? parseFloat(mA[1].replace(",", ".")) : 95,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: tLow.includes("piscina"),
      imagens,
      corretor_nome: imob.nome,
      corretor_telefone: imob.telefone,
      corretor_creci: imob.creci || "Credenciado",
      imobiliaria_origem: imob.nome,
      link_origem: url,
    };
  } catch (e) {
    return null;
  }
}

async function processarImobiliaria(imob, index, total) {
  const linksImoveis = new Set();

  try {
    const res = await axios.get(imob.dominio, { headers, timeout: TIMEOUT_REQ });
    const $ = cheerio.load(res.data);

    $("a").each((_, el) => {
      let href = $(el).attr("href");
      if (!href) return;
      if (href.startsWith("/")) href = `${imob.dominio}${href}`;
      const low = href.toLowerCase();

      const ehAnuncio =
        (low.includes("/imovel/") ||
          low.includes("/detalhes/") ||
          low.includes("/imoveis/") ||
          low.includes("/apartamento") ||
          low.includes("/casa") ||
          low.includes("/sobrado") ||
          low.includes("/terreno") ||
          low.includes("/comprar/") ||
          low.includes("/alugar/")) &&
        !low.includes("#") &&
        href.startsWith("http");

      if (ehAnuncio) linksImoveis.add(href);
    });
  } catch (err) {
    return 0;
  }

  const lista = Array.from(linksImoveis).slice(0, 4);
  let salvos = 0;

  for (const link of lista) {
    const imovel = await rasparAnuncioIndividual(link, imob);
    if (imovel && imovel.imagens.length > 0) {
      const { error } = await supabase.from("imoveis").upsert(imovel, { onConflict: "codigo" });
      if (!error) salvos++;
    }
  }

  if (salvos > 0) {
    console.log(
      `[${index + 1}/${total}] ✅ ${imob.cidade} - ${imob.estado} | ${imob.nome}: ${salvos} imóveis salvos`
    );
  }

  return salvos;
}

async function executarCrawlerTurbo() {
  console.log("==================================================================");
  console.log("🚀 CRAWLER DINÂMICO TURBO (HTTPS SANITIZADO)");
  console.log("==================================================================\n");

  const { data: imobiliarias, error } = await supabase
    .from("imobiliarias_radar")
    .select("*")
    .eq("ativo", true);

  if (error || !imobiliarias || imobiliarias.length === 0) {
    console.log("⚠️ Nenhuma imobiliária ativa encontrada na tabela 'imobiliarias_radar'.");
    return;
  }

  console.log(`📋 Total de imobiliárias na fila: ${imobiliarias.length}`);
  console.log(`⚡ Concorrência: ${CONCORRENCIA} sites em paralelo\n`);

  let totalImoveis = 0;

  for (let i = 0; i < imobiliarias.length; i += CONCORRENCIA) {
    const lote = imobiliarias.slice(i, i + CONCORRENCIA);
    const promessas = lote.map((imob, idx) =>
      processarImobiliaria(imob, i + idx, imobiliarias.length)
    );

    const resultados = await Promise.all(promessas);
    totalImoveis += resultados.reduce((acc, curr) => acc + curr, 0);
  }

  console.log("\n==================================================================");
  console.log(`🏁 FINALIZADO COM SUCESSO!`);
  console.log(`📊 Total de novos imóveis cadastrados: ${totalImoveis}`);
  console.log("==================================================================");
}

executarCrawlerTurbo();