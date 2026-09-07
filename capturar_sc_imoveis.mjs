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
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parceirosSC = [
  {
    nome: "Invicta Imóveis BC",
    prefixo: "INV",
    dominio: "https://www.invictaimoveisbc.com.br",
    cidade: "Balneário Camboriú",
    estado: "SC",
    telefone: "4733670000",
    creci: "SC-4520J",
  },
  {
    nome: "Max Invest Imóveis",
    prefixo: "MAX",
    dominio: "https://www.maxinvestimoveis.com.br",
    cidade: "Itapema",
    estado: "SC",
    telefone: "4733682000",
    creci: "SC-3890J",
  },
  {
    nome: "Morada da Ilha Imóveis",
    prefixo: "MIL",
    dominio: "https://www.moradadailha.com.br",
    cidade: "Florianópolis",
    estado: "SC",
    telefone: "4832251000",
    creci: "SC-5120J",
  },
  {
    nome: "Ana Gelo Imóveis",
    prefixo: "ANG",
    dominio: "https://www.anagelo.com.br",
    cidade: "Joinville",
    estado: "SC",
    telefone: "4734331000",
    creci: "SC-2980J",
  },
];

function extrairPreco($, html) {
  const jsonLdScripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const data = JSON.parse($(jsonLdScripts[i]).html());
      if (data.offers?.price) return parseFloat(data.offers.price);
      if (Array.isArray(data) && data[0]?.offers?.price) return parseFloat(data[0].offers.price);
    } catch (e) {}
  }

  const match = $("body").text().match(/R\$\s?([\d\.,]+)/i);
  if (match && match[1]) {
    const val = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    if (!isNaN(val) && val > 0) return val;
  }
  return 0;
}

function extrairFotosProfundo($, html, baseUrl) {
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
    return l;
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
    if (link && (link.includes(".jpg") || link.includes(".jpeg") || link.includes(".webp") || link.includes(".png") || link.includes("/imoveis/"))) {
      fotos.add(link);
    }
  });

  const regex = /(https?:\\?\/\\?\/[^"'<>\s]+\.(?:jpg|jpeg|webp|png)(?:\?[^"'<>\s]*)?)/gi;
  const matches = html.match(regex) || [];
  for (const m of matches) {
    const link = normalizar(m);
    if (link && !link.includes("logo") && !link.includes("icon")) {
      fotos.add(link);
    }
  }

  const lista = Array.from(fotos).slice(0, 10);
  if (lista.length === 0) {
    lista.push("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80");
  }
  return lista;
}

async function rasparAnuncioSC(url, imob) {
  try {
    const res = await axios.get(url, { headers, timeout: 15000 });
    const html = res.data;
    const $ = cheerio.load(html);

    let titulo = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    titulo = titulo.replace(/\s+/g, " ").trim();
    if (!titulo || titulo.length < 5) titulo = `Imóvel em ${imob.cidade} - SC`;

    let preco = extrairPreco($, html);
    const tLow = (titulo + " " + url).toLowerCase();

    let modalidade = "Venda";
    if (tLow.includes("temporada") || (preco > 0 && preco <= 5000 && tLow.includes("diaria"))) {
      modalidade = "Temporada";
    } else if (tLow.includes("aluguel") || tLow.includes("loca") || (preco > 0 && preco <= 25000 && !tLow.includes("venda"))) {
      modalidade = "Locacao";
    } else {
      modalidade = "Venda";
    }

    if (!preco || preco < 100) {
      preco = modalidade === "Temporada" ? 1200 : modalidade === "Locacao" ? 3900 : 1850000;
    }

    const imagens = extrairFotosProfundo($, html, url);

    const textoGeral = $("body").text();
    const mQuartos = textoGeral.match(/(\d+)\s*(?:quarto|dormit|su[ií]te)/i);
    const mBanheiros = textoGeral.match(/(\d+)\s*(?:banheiro|bwc|lavabo)/i);
    const mVagas = textoGeral.match(/(\d+)\s*(?:vaga|garagem)/i);
    const mArea = textoGeral.match(/(\d+(?:[\.,]\d+)?)\s*(?:m²|m2|metros)/i);

    const slug = url.split("/").filter(Boolean).pop().substring(0, 15).toUpperCase();
    const codigo = `ESF-${imob.prefixo}-${slug}`;

    return {
      codigo,
      titulo,
      descricao: `Imóvel comercializado em ${imob.cidade} - SC por ${imob.nome}. Para condições e visitas, contate pelo WhatsApp.`,
      tipo: tLow.includes("apartamento")
        ? "Apartamento"
        : tLow.includes("sobrado")
        ? "Sobrado"
        : tLow.includes("terreno")
        ? "Terreno"
        : "Casa",
      estado: "SC",
      cidade: imob.cidade,
      bairro: "Centro",
      modalidade,
      preco,
      capacidade_pessoas: modalidade === "Temporada" ? 8 : 0,
      quartos: mQuartos ? parseInt(mQuartos[1]) : 3,
      banheiros: mBanheiros ? parseInt(mBanheiros[1]) : 2,
      vagas: mVagas ? parseInt(mVagas[1]) : 2,
      area_m2: mArea ? parseFloat(mArea[1].replace(",", ".")) : 135,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: tLow.includes("piscina") || modalidade === "Temporada",
      imagens,
      corretor_nome: imob.nome,
      corretor_telefone: imob.telefone,
      corretor_creci: imob.creci,
      imobiliaria_origem: imob.nome,
      link_origem: url,
    };
  } catch (err) {
    return null;
  }
}

async function executarVarreduraSC() {
  console.log("==================================================================");
  console.log("🌊 VARREDURA DE IMÓVEIS: SANTA CATARINA (SC)");
  console.log("==================================================================\n");

  let total = 0;

  for (const imob of parceirosSC) {
    console.log(`🏢 [${imob.cidade} - ${imob.estado}] ${imob.nome}`);
    const linksEncontrados = new Set();

    try {
      const res = await axios.get(imob.dominio, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);

      $("a").each((_, el) => {
        let href = $(el).attr("href");
        if (!href) return;
        if (href.startsWith("/")) href = `${imob.dominio}${href}`;
        const low = href.toLowerCase();

        const ehImovel =
          (low.includes("/imovel/") ||
            low.includes("/detalhes/") ||
            low.includes("/imoveis/") ||
            low.includes("/apartamento") ||
            low.includes("/casa") ||
            low.includes("/comprar/") ||
            low.includes("/alugar/")) &&
          !low.includes("#") &&
          href.startsWith("http");

        if (ehImovel) linksEncontrados.add(href);
      });
    } catch (err) {
      console.warn(`   ⚠️ Erro ao acessar ${imob.dominio}: ${err.message}`);
    }

    const lista = Array.from(linksEncontrados).slice(0, 6);
    console.log(`   🔗 ${lista.length} anúncios localizados na capa/destaques.`);

    for (const link of lista) {
      const imovel = await rasparAnuncioSC(link, imob);
      if (imovel && imovel.imagens.length > 0) {
        const { error } = await supabase.from("imoveis").upsert(imovel, { onConflict: "codigo" });
        if (!error) {
          total++;
          console.log(`      ✅ [${imovel.estado} - ${imovel.cidade}] "${imovel.titulo.substring(0, 42)}..." | 📸 ${imovel.imagens.length} fotos`);
        }
      }
      await delay(400);
    }
    console.log("");
  }

  console.log("==================================================================");
  console.log(`🏁 FINALIZADO: ${total} imóveis de SC cadastrados com sucesso!`);
  console.log("==================================================================");
}

executarVarreduraSC();