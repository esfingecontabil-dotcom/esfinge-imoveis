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

/**
 * Validação e normalização de URLs de fotos
 */
function normalizarLinkImagem(link, baseUrl) {
  if (!link) return null;
  let limpo = link.trim().replace(/\\"/g, "").replace(/\\/g, "");
  if (limpo.startsWith("//")) limpo = "https:" + limpo;
  else if (limpo.startsWith("/")) {
    try {
      const u = new URL(baseUrl);
      limpo = `${u.protocol}//${u.host}${limpo}`;
    } catch {
      return null;
    }
  }
  if (!limpo.startsWith("http")) return null;

  const low = limpo.toLowerCase();
  const ehLixo =
    low.includes("logo") ||
    low.includes("icon") ||
    low.includes("avatar") ||
    low.includes("banner") ||
    low.includes("whatsapp") ||
    low.includes("facebook") ||
    low.includes("pixel") ||
    low.includes(".svg");

  if (ehLixo) return null;

  const ehFoto =
    low.includes(".jpg") ||
    low.includes(".jpeg") ||
    low.includes(".webp") ||
    low.includes(".png") ||
    low.includes("/imoveis/") ||
    low.includes("/fotos/") ||
    low.includes("/galeria/") ||
    low.includes("/storage/") ||
    low.includes("/uploads/");

  return ehFoto ? limpo : null;
}

/**
 * Extração de todas as fotos reais da galeria
 */
function extrairFotosReais(html, urlAnuncio) {
  const $ = cheerio.load(html);
  const fotos = new Set();

  const ogImg = normalizarLinkImagem($('meta[property="og:image"]').attr("content"), urlAnuncio);
  if (ogImg) fotos.add(ogImg);

  $("a, div, li").each((_, el) => {
    const href = $(el).attr("href") || $(el).attr("data-src") || $(el).attr("data-image");
    const link = normalizarLinkImagem(href, urlAnuncio);
    if (link) fotos.add(link);
  });

  $("img").each((_, el) => {
    const src =
      $(el).attr("data-zoom-image") ||
      $(el).attr("data-large") ||
      $(el).attr("data-full") ||
      $(el).attr("data-src") ||
      $(el).attr("data-lazy") ||
      $(el).attr("data-original") ||
      $(el).attr("src");
    const link = normalizarLinkImagem(src, urlAnuncio);
    if (link) fotos.add(link);
  });

  const regex = /(https?:\\?\/\\?\/[^"'<>\s]+\.(?:jpg|jpeg|webp|png)(?:\?[^"'<>\s]*)?)/gi;
  const matches = html.match(regex) || [];
  for (const m of matches) {
    const link = normalizarLinkImagem(m, urlAnuncio);
    if (link) fotos.add(link);
  }

  return Array.from(fotos);
}

/**
 * Tenta extrair o preço real direto do texto da página
 */
function extrairPrecoDaPagina($, fallbackPreco) {
  const texto = $("body").text();
  const matchPreco = texto.match(/R\$\s?([\d\.,]+)/i);
  if (matchPreco && matchPreco[1]) {
    const valorNum = parseFloat(matchPreco[1].replace(/\./g, "").replace(",", "."));
    if (!isNaN(valorNum) && valorNum > 50) return valorNum;
  }
  return fallbackPreco;
}

/**
 * Descobre links de imóveis dentro do catálogo
 */
async function descobrirLinks(catalogoUrl, padrao, maximo = 6) {
  try {
    const res = await axios.get(catalogoUrl, { headers, timeout: 20000 });
    const $ = cheerio.load(res.data);
    const encontrados = new Set();

    $("a").each((_, el) => {
      let href = $(el).attr("href");
      if (href) {
        if (href.startsWith("/")) {
          const u = new URL(catalogoUrl);
          href = `${u.protocol}//${u.host}${href}`;
        }
        if (href.includes(padrao) && !href.includes("#") && href.startsWith("http")) {
          encontrados.add(href);
        }
      }
    });

    return Array.from(encontrados).slice(0, maximo);
  } catch (err) {
    console.warn(`   ⚠️ Erro ao listar ${catalogoUrl}: ${err.message}`);
    return [];
  }
}

/**
 * Raspa e formata o imóvel com sua modalidade correspondente
 */
async function rasparImovel(url, imob) {
  try {
    const res = await axios.get(url, { headers, timeout: 20000 });
    const html = res.data;
    const $ = cheerio.load(html);

    let titulo = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    titulo = titulo.replace(/\s+/g, " ").trim();
    if (!titulo || titulo.length < 5) titulo = `${imob.tipoPadrao || "Imóvel"} em ${imob.cidade}`;

    const fotos = extrairFotosReais(html, url);
    if (fotos.length === 0) return null;

    const tLow = titulo.toLowerCase();
    const tipo = tLow.includes("apartamento")
      ? "Apartamento"
      : tLow.includes("sobrado")
      ? "Sobrado"
      : tLow.includes("terreno") || tLow.includes("lote")
      ? "Terreno"
      : tLow.includes("studio")
      ? "Studio"
      : tLow.includes("chácara") || tLow.includes("chacara")
      ? "Chácara"
      : imob.tipoPadrao || "Casa";

    const preco = extrairPrecoDaPagina($, imob.precoBase);
    const slug = url.split("/").filter(Boolean).pop().substring(0, 15).toUpperCase();
    const codigo = `ESF-${imob.prefixo}-${slug}`;

    return {
      codigo,
      titulo,
      descricao: `Imóvel anunciado por ${imob.nome} na modalidade ${imob.modalidade}. Consulte disponibilidade e agendamento de visitas pelo WhatsApp.`,
      tipo,
      estado: imob.estado,
      cidade: imob.cidade,
      bairro: imob.bairro,
      modalidade: imob.modalidade, // "Temporada", "Locacao" ou "Venda"
      preco,
      capacidade_pessoas: imob.modalidade === "Temporada" ? 8 : 0,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      area_m2: imob.modalidade === "Temporada" ? 120 : 140,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: tLow.includes("piscina") || imob.modalidade === "Temporada",
      imagens: fotos.slice(0, 10),
      corretor_nome: imob.nome,
      corretor_telefone: imob.telefone,
      corretor_creci: imob.creci,
      imobiliaria_origem: imob.nome,
      link_origem: url,
    };
  } catch (err) {
    console.warn(`   ⚠️ Erro ao raspar anúncio ${url}: ${err.message}`);
    return null;
  }
}

// Catálogos divididos por Modalidade (Temporada, Locação e Venda)
const fontesPorModalidade = [
  // ================= TEMPORADA =================
  {
    nome: "Jurema Imóveis",
    modalidade: "Temporada",
    prefixo: "JUR-TEMP",
    catalogoUrl: "https://juremaimoveis.com.br",
    padrao: "/imovel/",
    cidade: "Matinhos",
    bairro: "Caiobá",
    estado: "PR",
    telefone: "4134732351",
    creci: "PR-4320J",
    precoBase: 850,
    tipoPadrao: "Apartamento",
    limite: 6,
  },
  {
    nome: "Atlântico Sul Imóveis",
    modalidade: "Temporada",
    prefixo: "ATS-TEMP",
    catalogoUrl: "https://www.atlanticosulimoveis.com.br/oportunidades",
    padrao: "/imovel/",
    cidade: "Pontal do Paraná",
    bairro: "Praia de Leste",
    estado: "PR",
    telefone: "4134581111",
    creci: "PR-3458J",
    precoBase: 750,
    tipoPadrao: "Casa",
    limite: 6,
  },

  // ================= LOCAÇÃO ANUAL =================
  {
    nome: "Opção Imóveis",
    modalidade: "Locacao",
    prefixo: "OPC-LOC",
    catalogoUrl: "https://opcaoimoveis.com.br",
    padrao: "/imovel/",
    cidade: "Maringá",
    bairro: "Zona 07",
    estado: "PR",
    telefone: "4430321300",
    creci: "PR-3032J",
    precoBase: 2400,
    tipoPadrao: "Apartamento",
    limite: 6,
  },
  {
    nome: "Grandeur Imóveis",
    modalidade: "Locacao",
    prefixo: "GND-LOC",
    catalogoUrl: "https://www.grandeurimoveis.com.br",
    padrao: "/imovel/",
    cidade: "Guaratuba",
    bairro: "Brejatuba",
    estado: "PR",
    telefone: "4134722014",
    creci: "PR-9658J",
    precoBase: 3100,
    tipoPadrao: "Sobrado",
    limite: 6,
  },

  // ================= VENDA =================
  {
    nome: "V3 Imóveis Caiobá",
    modalidade: "Venda",
    prefixo: "V3-VEN",
    catalogoUrl: "https://www.v3imobiliaria.com.br/imoveis",
    padrao: "/imovel/",
    cidade: "Matinhos",
    bairro: "Caiobá",
    estado: "PR",
    telefone: "4134732081",
    creci: "PR-5906J",
    precoBase: 1250000,
    tipoPadrao: "Apartamento",
    limite: 6,
  },
  {
    nome: "Tropical Sul Imóveis",
    modalidade: "Venda",
    prefixo: "TPS-VEN",
    catalogoUrl: "https://www.tropicalsulimoveis.com.br",
    padrao: "/imovel/",
    cidade: "Pontal do Paraná",
    bairro: "Shangri-lá",
    estado: "PR",
    telefone: "41995149306",
    creci: "PR-5931J",
    precoBase: 520000,
    tipoPadrao: "Casa",
    limite: 6,
  }
];

async function executarCargaCompleta() {
  console.log("==================================================================");
  console.log("🚀 INICIANDO SINCRONIZAÇÃO MULTIMODAL: TEMPORADA, LOCAÇÃO E VENDA");
  console.log("==================================================================\n");

  let totalGeral = 0;

  for (const fonte of fontesPorModalidade) {
    console.log(`📡 [${fonte.modalidade.toUpperCase()}] ${fonte.nome} (${fonte.cidade} - ${fonte.estado})...`);
    const links = await descobrirLinks(fonte.catalogoUrl, fonte.padrao, fonte.limite);
    console.log(`   🔗 ${links.length} anúncios localizados.`);

    for (const link of links) {
      const imovel = await rasparImovel(link, fonte);
      if (imovel && imovel.imagens.length > 0) {
        const { error } = await supabase.from("imoveis").upsert(imovel, { onConflict: "codigo" });
        if (!error) {
          totalGeral++;
          console.log(`   ✅ [${imovel.modalidade}] ${imovel.titulo.substring(0, 50)}...`);
          console.log(`      💰 R$ ${imovel.preco.toLocaleString("pt-BR")} | 📸 ${imovel.imagens.length} fotos | 📲 ${imovel.corretor_nome}`);
        }
      }
    }
    console.log("");
  }

  console.log("==================================================================");
  console.log(`🏁 SINCRONIZAÇÃO CONCLUÍDA: ${totalGeral} anúncios distribuídos entre Temporada, Locação e Venda!`);
  console.log("==================================================================");
}

executarCargaCompleta();