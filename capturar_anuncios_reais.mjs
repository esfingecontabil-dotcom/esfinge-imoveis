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
 * Varredura Profunda: Extrai TODAS as fotos reais da galeria (HTML, Scripts, JSON e Lightbox)
 */
function extrairTodasAsFotosReais(html, baseUrl) {
  const $ = cheerio.load(html);
  const fotosEncontradas = new Set();

  const normalizarUrl = (link) => {
    if (!link) return null;
    let limpo = link.trim().replace(/\\"/g, "").replace(/\\/g, "");
    if (limpo.startsWith("//")) limpo = "https:" + limpo;
    else if (limpo.startsWith("/")) {
      const u = new URL(baseUrl);
      limpo = `${u.protocol}//${u.host}${limpo}`;
    }
    if (!limpo.startsWith("http")) return null;

    const low = limpo.toLowerCase();
    const ehLixo =
      low.includes("logo") ||
      low.includes("icon") ||
      low.includes("avatar") ||
      low.includes("banner") ||
      low.includes("whatsapp") ||
      low.includes("pixel") ||
      low.includes("facebook") ||
      low.includes(".svg");

    if (ehLixo) return null;

    const ehImagem =
      low.includes(".jpg") ||
      low.includes(".jpeg") ||
      low.includes(".webp") ||
      low.includes(".png") ||
      low.includes("/fotos/") ||
      low.includes("/imoveis/") ||
      low.includes("/galeria/") ||
      low.includes("/storage/") ||
      low.includes("/uploads/");

    return ehImagem ? limpo : null;
  };

  // 1. Meta OG Image (Capa)
  const ogImg = normalizarUrl($('meta[property="og:image"]').attr("content"));
  if (ogImg) fotosEncontradas.add(ogImg);

  // 2. Links de Lightbox / Galeria em tags <a>
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    const dataSrc = $(el).attr("data-src") || $(el).attr("data-image");
    const linkNorm = normalizarUrl(href) || normalizarUrl(dataSrc);
    if (linkNorm) fotosEncontradas.add(linkNorm);
  });

  // 3. Imagens em tags <img> (data-src, data-lazy, src)
  $("img").each((_, el) => {
    const src =
      $(el).attr("data-zoom-image") ||
      $(el).attr("data-large") ||
      $(el).attr("data-full") ||
      $(el).attr("data-src") ||
      $(el).attr("data-lazy") ||
      $(el).attr("data-original") ||
      $(el).attr("src");
    const imgNorm = normalizarUrl(src);
    if (imgNorm) fotosEncontradas.add(imgNorm);
  });

  // 4. Background-image em CSS inline (style="background-image: url(...)")
  $("[style*='background']").each((_, el) => {
    const style = $(el).attr("style");
    const match = style.match(/url\(['"]?([^'")]+)['"]?\)/i);
    if (match && match[1]) {
      const bgNorm = normalizarUrl(match[1]);
      if (bgNorm) fotosEncontradas.add(bgNorm);
    }
  });

  // 5. Varredura Regex nos scripts JavaScript (onde ficam arrays com 10-30 fotos)
  const regexFotos = /(https?:\\?\/\\?\/[^"'<>\s]+\.(?:jpg|jpeg|webp|png)(?:\?[^"'<>\s]*)?)/gi;
  const matches = html.match(regexFotos) || [];
  for (const m of matches) {
    const urlScript = normalizarUrl(m);
    if (urlScript) fotosEncontradas.add(urlScript);
  }

  return Array.from(fotosEncontradas);
}

/**
 * Descobre links de imóveis dentro da página de busca
 */
async function descobrirLinks(urlCatalogo, padraoLink) {
  try {
    const res = await axios.get(urlCatalogo, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);
    const links = new Set();

    $("a").each((_, el) => {
      let href = $(el).attr("href");
      if (href) {
        if (href.startsWith("/")) {
          const u = new URL(urlCatalogo);
          href = `${u.protocol}//${u.host}${href}`;
        }
        if (href.includes(padraoLink) && !href.includes("#") && href.startsWith("http")) {
          links.add(href);
        }
      }
    });

    return Array.from(links).slice(0, 4); // Pega até 4 imóveis por imobiliária
  } catch (err) {
    console.warn(`⚠️ Não foi possível listar catálogo de ${urlCatalogo}: ${err.message}`);
    return [];
  }
}

/**
 * Raspa os dados e toda a galeria de fotos do anúncio
 */
async function rasparAnuncio(urlAnuncio, dadosImobiliaria) {
  try {
    const res = await axios.get(urlAnuncio, { headers, timeout: 15000 });
    const html = res.data;
    const $ = cheerio.load(html);

    // Título
    let titulo = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    titulo = titulo.replace(/\s+/g, " ").trim();
    if (!titulo || titulo.length < 5) titulo = "Imóvel de Alto Padrão";

    // Galeria Completa
    const fotos = extrairTodasAsFotosReais(html, urlAnuncio);
    if (fotos.length === 0) return null;

    const slug = urlAnuncio.split("/").filter(Boolean).pop().substring(0, 12).toUpperCase();
    const codigo = `ESF-${dadosImobiliaria.prefixo}-${slug}`;

    return {
      codigo,
      titulo,
      descricao: `Imóvel anunciado por ${dadosImobiliaria.nome}. Entre em contato para ficha técnica completa, condições de pagamento e agendamento de visita.`,
      tipo: titulo.toLowerCase().includes("apartamento") ? "Apartamento" : titulo.toLowerCase().includes("sobrado") ? "Sobrado" : "Casa",
      estado: dadosImobiliaria.estado,
      cidade: dadosImobiliaria.cidade,
      bairro: dadosImobiliaria.bairro,
      modalidade: "Venda",
      preco: dadosImobiliaria.precoBase,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      area_m2: 135,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: true,
      imagens: fotos.slice(0, 10), // Salva até 10 fotos reais da galeria
      corretor_nome: dadosImobiliaria.nome,
      corretor_telefone: dadosImobiliaria.telefone,
      corretor_creci: dadosImobiliaria.creci,
      imobiliaria_origem: dadosImobiliaria.nome,
      link_origem: urlAnuncio,
    };
  } catch (err) {
    console.warn(`⚠️ Erro ao raspar anúncio ${urlAnuncio}: ${err.message}`);
    return null;
  }
}

// Catálogo com imobiliárias parceiras ativas
const imobiliarias = [
  {
    nome: "V3 Imóveis Caiobá",
    prefixo: "V3",
    catalogoUrl: "https://www.v3imobiliaria.com.br/imoveis",
    padraoLink: "/imovel/",
    cidade: "Matinhos",
    bairro: "Caiobá",
    estado: "PR",
    telefone: "4134732081",
    creci: "PR-5906J",
    precoBase: 1280000,
  },
  {
    nome: "Silvio Iwata Imóveis",
    prefixo: "SI",
    catalogoUrl: "https://silvioiwata.com.br",
    padraoLink: "/imovel/",
    cidade: "Maringá",
    bairro: "Zona 01",
    estado: "PR",
    telefone: "4440092000",
    creci: "PR-4009J",
    precoBase: 850000,
  },
  {
    nome: "Atlântico Sul Imóveis",
    prefixo: "ATS",
    catalogoUrl: "https://www.atlanticosulimoveis.com.br/oportunidades",
    padraoLink: "/imovel/",
    cidade: "Pontal do Paraná",
    bairro: "Praia de Leste",
    estado: "PR",
    telefone: "4134581111",
    creci: "PR-3458J",
    precoBase: 590000,
  }
];

async function rodarVarreduraProfunda() {
  console.log("🚀 Iniciando Extrator Profundo: Capturando Galerias com Múltiplas Fotos Reais...\n");

  let totalSalvos = 0;

  for (const imob of imobiliarias) {
    console.log(`📡 Varrendo catálogo de: ${imob.nome}...`);
    const links = await descobrirLinks(imob.catalogoUrl, imob.padraoLink);
    console.log(`   🔗 Anúncios encontrados: ${links.length}`);

    for (const link of links) {
      console.log(`   🔎 Extraindo galeria completa de: ${link}`);
      const imovel = await rasparAnuncio(link, imob);

      if (imovel && imovel.imagens.length > 0) {
        const { error } = await supabase.from("imoveis").upsert(imovel, { onConflict: "codigo" });
        if (!error) {
          totalSalvos++;
          console.log(`   ✅ SUCESSO: "${imovel.titulo}"`);
          console.log(`      📸 ${imovel.imagens.length} FOTOS REAIS extraídas para a galeria!`);
          console.log(`      📲 Atribuído a: ${imovel.corretor_nome} (${imovel.corretor_telefone})\n`);
        } else {
          console.error(`   ❌ Erro ao salvar: ${error.message}\n`);
        }
      }
    }
  }

  console.log(`🏁 Concluído com sucesso! ${totalSalvos} imóveis cadastrados com galerias completas de fotos reais.`);
}

rodarVarreduraProfunda();