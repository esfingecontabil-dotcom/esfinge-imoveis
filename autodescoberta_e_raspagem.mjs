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
  Referer: "https://www.bing.com/",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DOMINIOS_IGNORADOS = [
  "vivareal.com.br",
  "zapimoveis.com.br",
  "olx.com.br",
  "imovelweb.com.br",
  "chavesnamao.com.br",
  "quintoandar.com.br",
  "mercadolivre.com.br",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "linkedin.com",
  "guiamais.com.br",
  "telelistas.net",
  "jusbrasil.com.br",
  "google.com",
  "bing.com",
  "wikipedia.org",
  "tripadvisor.com",
  "airbnb.com",
  "booking.com",
  "casamineira.com.br",
];

/**
 * 1. RADAR: Localiza sites de imobiliárias na web usando Bing Search
 */
async function buscarSitesDeImobiliariasNaWeb(termoBusca, fallbackSites = []) {
  console.log(`🔎 [RADAR] Buscando: "${termoBusca}"...`);
  const dominiosEncontrados = new Set(fallbackSites);

  try {
    const urlBing = `https://www.bing.com/search?q=${encodeURIComponent(
      termoBusca + " imobiliaria -vivareal -zapimoveis -olx -chavesnamao"
    )}&setlang=pt-br`;
    
    const res = await axios.get(urlBing, { headers, timeout: 15000 });
    const $ = cheerio.load(res.data);

    $(".b_algo h2 a, #b_results .b_algo a, .b_algo .b_title a").each((_, el) => {
      let href = $(el).attr("href");
      if (!href || !href.startsWith("http")) return;

      try {
        const parsed = new URL(href);
        const host = parsed.hostname.replace("www.", "").toLowerCase();

        const ehIgnorado = DOMINIOS_IGNORADOS.some((ign) => host.includes(ign));
        if (!ehIgnorado && (host.includes(".com.br") || host.includes(".imb.br") || host.includes(".com"))) {
          dominiosEncontrados.add(`${parsed.protocol}//${parsed.hostname}`);
        }
      } catch (e) {}
    });
  } catch (err) {
    console.warn(`   ⚠️ Erro de conexão no radar: ${err.message}`);
  }

  const lista = Array.from(dominiosEncontrados);
  console.log(`   🌐 ${lista.length} portais identificados para a praça.`);
  return lista;
}

/**
 * 2. SCANNER: Lê a página da imobiliária e extrai Nome, WhatsApp, CRECI e Catálogo
 */
async function escanearDadosDaImobiliaria(dominio, cidade, estado) {
  try {
    const res = await axios.get(dominio, { headers, timeout: 15000 });
    const html = res.data;
    const $ = cheerio.load(html);

    let nome =
      $('meta[property="og:site_name"]').attr("content") ||
      $("title").text().split(/[-|–]/)[0].trim();
    if (!nome || nome.length > 40) {
      nome =
        new URL(dominio).hostname.replace("www.", "").split(".")[0].toUpperCase() + " Imóveis";
    }

    let telefone = "44997278694";
    const textoCompleto = $("body").text();

    let linkWhats = $('a[href*="wa.me"], a[href*="api.whatsapp.com"]').first().attr("href");
    if (linkWhats) {
      const matchWhats = linkWhats.match(/(?:phone=|wa\.me\/|send\?phone=)(\d+)/i);
      if (matchWhats && matchWhats[1].length >= 10) {
        telefone = matchWhats[1];
      }
    } else {
      const matchTel = textoCompleto.match(/(?:\(?([1-9]{2})\)?\s*)?(?:9\d{4}|\d{4})[-\s]?\d{4}/);
      if (matchTel && matchTel[0]) {
        const limpo = matchTel[0].replace(/\D/g, "");
        if (limpo.length >= 10) telefone = limpo;
      }
    }

    let creci = `${estado}-CRECI`;
    const matchCreci = textoCompleto.match(
      /CRECI(?:\s*(?:n[ºo°]|\/?[A-Z]{2})?:?\s*)([0-9\.\-J/F]+)/i
    );
    if (matchCreci && matchCreci[1]) {
      creci = `${estado}-${matchCreci[1].trim()}`;
    }

    const rotasCatalogo = new Set();
    $("a").each((_, el) => {
      let href = $(el).attr("href");
      if (!href) return;
      if (href.startsWith("/")) href = `${dominio}${href}`;

      const low = href.toLowerCase();
      if (
        (low.includes("/imoveis") ||
          low.includes("/venda") ||
          low.includes("/aluguel") ||
          low.includes("/temporada") ||
          low.includes("/comprar") ||
          low.includes("/alugar")) &&
        !low.includes("#") &&
        href.startsWith("http")
      ) {
        rotasCatalogo.add(href);
      }
    });

    const rotas = Array.from(rotasCatalogo);
    if (rotas.length === 0) rotas.push(`${dominio}`);

    const prefixo = new URL(dominio).hostname
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 4)
      .toUpperCase();

    return {
      nome,
      dominio,
      prefixo,
      telefone,
      creci,
      cidade,
      estado,
      rotas: rotas.slice(0, 3),
    };
  } catch (err) {
    return null;
  }
}

/**
 * 3. EXTRATOR: Captura dados precisos, características e fotos de cada anúncio
 */
async function extrairImovelFiel(url, imobInfo) {
  try {
    const res = await axios.get(url, { headers, timeout: 15000 });
    const html = res.data;
    const $ = cheerio.load(html);

    let titulo = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    titulo = titulo.replace(/\s+/g, " ").trim();
    if (!titulo || titulo.length < 5) return null;

    let preco = 0;
    const seletoresPreco = [
      ".valor-imovel",
      ".preco-imovel",
      ".property-price",
      ".item-price",
      ".price",
      ".preco",
      "[itemprop='price']",
    ];

    for (const sel of seletoresPreco) {
      const el = $(sel).first();
      if (el.length > 0) {
        const m = el.text().trim().match(/R\$\s?([\d\.,]+)/i);
        if (m && m[1]) {
          const val = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
          if (!isNaN(val) && val > 0) {
            preco = val;
            break;
          }
        }
      }
    }

    if (!preco) {
      const matchPreco = $("body").text().match(/R\$\s?([\d\.,]+)/i);
      if (matchPreco && matchPreco[1]) {
        preco = parseFloat(matchPreco[1].replace(/\./g, "").replace(",", "."));
      }
    }

    if (!preco || preco < 100) return null;

    let modalidade = "Venda";
    const tLow = (titulo + " " + url).toLowerCase();
    if (tLow.includes("temporada") || (preco <= 5000 && tLow.includes("diaria"))) {
      modalidade = "Temporada";
    } else if (
      tLow.includes("aluguel") ||
      tLow.includes("loca") ||
      (preco <= 25000 && !tLow.includes("venda"))
    ) {
      modalidade = "Locacao";
    } else if (preco > 30000) {
      modalidade = "Venda";
    }

    const textoGeral = $("body").text();
    const mQuartos = textoGeral.match(/(\d+)\s*(?:quarto|dormit|su[ií]te)/i);
    const mBanheiros = textoGeral.match(/(\d+)\s*(?:banheiro|bwc|lavabo)/i);
    const mVagas = textoGeral.match(/(\d+)\s*(?:vaga|garagem)/i);
    const mArea = textoGeral.match(/(\d+(?:[\.,]\d+)?)\s*(?:m²|m2|metros)/i);

    const fotos = new Set();
    const og = $('meta[property="og:image"]').attr("content");
    if (og && og.startsWith("http")) fotos.add(og);

    $("img, a").each((_, el) => {
      const src =
        $(el).attr("data-src") ||
        $(el).attr("data-full") ||
        $(el).attr("data-lazy") ||
        $(el).attr("src") ||
        $(el).attr("href");
      if (src && src.startsWith("http")) {
        const low = src.toLowerCase();
        if (
          (low.includes(".jpg") ||
            low.includes(".jpeg") ||
            low.includes(".webp") ||
            low.includes(".png") ||
            low.includes("/imoveis/") ||
            low.includes("/storage/")) &&
          !low.includes("logo") &&
          !low.includes("icon") &&
          !low.includes("banner")
        ) {
          fotos.add(src);
        }
      }
    });

    const listaFotos = Array.from(fotos).slice(0, 10);
    if (listaFotos.length === 0) return null;

    const slug = url.split("/").filter(Boolean).pop().substring(0, 15).toUpperCase();
    const codigo = `ESF-${imobInfo.prefixo}-${slug}`;

    return {
      codigo,
      titulo,
      descricao: `Imóvel anunciado por ${imobInfo.nome}. Para detalhes, condições e visitas, contate o corretor responsável pelo WhatsApp.`,
      tipo: tLow.includes("apartamento")
        ? "Apartamento"
        : tLow.includes("sobrado")
        ? "Sobrado"
        : tLow.includes("terreno") || tLow.includes("lote")
        ? "Terreno"
        : tLow.includes("comercial") || tLow.includes("sala")
        ? "Comercial"
        : "Casa",
      estado: imobInfo.estado,
      cidade: imobInfo.cidade,
      bairro: "Centro",
      modalidade,
      preco,
      capacidade_pessoas: modalidade === "Temporada" ? 8 : 0,
      quartos: mQuartos ? parseInt(mQuartos[1]) : 2,
      banheiros: mBanheiros ? parseInt(mBanheiros[1]) : 1,
      vagas: mVagas ? parseInt(mVagas[1]) : 1,
      area_m2: mArea ? parseFloat(mArea[1].replace(",", ".")) : 90,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: tLow.includes("piscina"),
      imagens: listaFotos,
      corretor_nome: imobInfo.nome,
      corretor_telefone: imobInfo.telefone,
      corretor_creci: imobInfo.creci,
      imobiliaria_origem: imobInfo.nome,
      link_origem: url,
    };
  } catch (e) {
    return null;
  }
}

/**
 * 4. MALHA REGIONAL EXPANDIDA COM SEMENTES GARANTIDAS
 */
const buscasAlvo = [
  // === LITORAL DO PARANÁ (PR) ===
  {
    termo: "imobiliaria Caioba Matinhos",
    cidade: "Matinhos",
    estado: "PR",
    sementes: ["https://www.v3imobiliaria.com.br", "https://juremaimoveis.com.br"],
  },
  {
    termo: "imobiliaria Pontal do Parana",
    cidade: "Pontal do Paraná",
    estado: "PR",
    sementes: ["https://www.atlanticosulimoveis.com.br", "https://www.tropicalsulimoveis.com.br"],
  },
  {
    termo: "imobiliaria Guaratuba praia",
    cidade: "Guaratuba",
    estado: "PR",
    sementes: ["https://www.grandeurimoveis.com.br", "https://mafraimoveis.com.br"],
  },
  {
    termo: "imobiliaria Paranagua centro",
    cidade: "Paranaguá",
    estado: "PR",
    sementes: ["https://paranaguaimoveis.com.br"],
  },
  {
    termo: "imobiliaria Antonina",
    cidade: "Antonina",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Morretes",
    cidade: "Morretes",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Guaraquecaba",
    cidade: "Guaraqueçaba",
    estado: "PR",
    sementes: [],
  },

  // === CURITIBA E REGIÃO METROPOLITANA (RMC) ===
  {
    termo: "imobiliaria Curitiba Batel Agua Verde",
    cidade: "Curitiba",
    estado: "PR",
    sementes: ["https://gonzagaimoveis.com.br", "https://www.apolar.com.br"],
  },
  {
    termo: "imobiliaria Sao Jose dos Pinhais",
    cidade: "São José dos Pinhais",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Pinhais",
    cidade: "Pinhais",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Colombo",
    cidade: "Colombo",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Araucaria",
    cidade: "Araucária",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Campo Largo",
    cidade: "Campo Largo",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Fazenda Rio Grande",
    cidade: "Fazenda Rio Grande",
    estado: "PR",
    sementes: [],
  },

  // === POLOS ESTRATÉGICOS DO PARANÁ (PR) ===
  {
    termo: "imobiliaria Maringa aluguel venda",
    cidade: "Maringá",
    estado: "PR",
    sementes: ["https://opcaoimoveis.com.br", "https://leloimoveis.com.br", "https://silvioiwata.com.br"],
  },
  {
    termo: "imobiliaria Londrina Gleba Palhano",
    cidade: "Londrina",
    estado: "PR",
    sementes: ["https://catuaiimoveis.com.br"],
  },
  {
    termo: "imobiliaria Cascavel centro",
    cidade: "Cascavel",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Foz do Iguacu",
    cidade: "Foz do Iguaçu",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Ponta Grossa",
    cidade: "Ponta Grossa",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Campo Mourao",
    cidade: "Campo Mourão",
    estado: "PR",
    sementes: [],
  },
  {
    termo: "imobiliaria Guarapuava",
    cidade: "Guarapuava",
    estado: "PR",
    sementes: [],
  },

  // === LITORAL E VALE DE SANTA CATARINA (SC) ===
  {
    termo: "imobiliaria Itapema Meia Praia",
    cidade: "Itapema",
    estado: "SC",
    sementes: ["https://www.meiapraiaimoveis.com.br"],
  },
  {
    termo: "imobiliaria Balneario Camboriu",
    cidade: "Balneário Camboriú",
    estado: "SC",
    sementes: ["https://sortinvestimentos.com.br"],
  },
  {
    termo: "imobiliaria Bombinhas Bombas",
    cidade: "Bombinhas",
    estado: "SC",
    sementes: [],
  },
  {
    termo: "imobiliaria Penha Beto Carrero",
    cidade: "Penha",
    estado: "SC",
    sementes: [],
  },
  {
    termo: "imobiliaria Sao Francisco do Sul",
    cidade: "São Francisco do Sul",
    estado: "SC",
    sementes: [],
  },
  {
    termo: "imobiliaria Joinville",
    cidade: "Joinville",
    estado: "SC",
    sementes: [],
  },
  {
    termo: "imobiliaria Blumenau",
    cidade: "Blumenau",
    estado: "SC",
    sementes: [],
  },
];

/**
 * 5. EXECUÇÃO PRINCIPAL DO ROBÔ
 */
async function executarAutoDescobertaECaptacao() {
  console.log("==================================================================");
  console.log("🚀 MOTOR DE AUTODESCOBERTA E CAPTAÇÃO: PARANÁ & SANTA CATARINA");
  console.log("==================================================================\n");

  let totalImoveisCaptados = 0;

  for (const alvo of buscasAlvo) {
    const sites = await buscarSitesDeImobiliariasNaWeb(alvo.termo, alvo.sementes);

    for (const site of sites) {
      console.log(`\n🏢 Escaneando imobiliária: ${site}...`);
      const imobInfo = await escanearDadosDaImobiliaria(site, alvo.cidade, alvo.estado);

      if (!imobInfo) {
        console.log(`   ⚠️ Não foi possível mapear ${site}`);
        continue;
      }

      console.log(
        `   ✅ Identificada: ${imobInfo.nome} | 📲 WhatsApp: ${imobInfo.telefone} | 📜 ${imobInfo.creci}`
      );

      for (const rota of imobInfo.rotas) {
        try {
          const res = await axios.get(rota, { headers, timeout: 15000 });
          const $ = cheerio.load(res.data);
          const linksAnuncios = new Set();

          $("a").each((_, el) => {
            let href = $(el).attr("href");
            if (!href) return;
            if (href.startsWith("/")) href = `${imobInfo.dominio}${href}`;
            const low = href.toLowerCase();
            if (
              (low.includes("/imovel/") ||
                low.includes("/detalhes/") ||
                low.includes("/imoveis/")) &&
              !low.includes("#") &&
              href.startsWith("http")
            ) {
              linksAnuncios.add(href);
            }
          });

          const listaLinks = Array.from(linksAnuncios).slice(0, 4);
          for (const link of listaLinks) {
            const imovel = await extrairImovelFiel(link, imobInfo);
            if (imovel && imovel.imagens.length > 0) {
              const { error } = await supabase
                .from("imoveis")
                .upsert(imovel, { onConflict: "codigo" });
              if (!error) {
                totalImoveisCaptados++;
                console.log(
                  `      🎯 Salvo: [${imovel.modalidade}] "${imovel.titulo.substring(
                    0,
                    40
                  )}..." (📸 ${imovel.imagens.length} fotos)`
                );
              }
            }
            await delay(400);
          }
        } catch (e) {}
      }
      await delay(800);
    }
  }

  console.log("\n==================================================================");
  console.log(
    `🏁 RADAR CONCLUÍDO: ${totalImoveisCaptados} novos anúncios captados via busca orgânica!`
  );
  console.log("==================================================================");
}

executarAutoDescobertaECaptacao();