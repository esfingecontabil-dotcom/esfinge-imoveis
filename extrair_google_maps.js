import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PORTAIS_IGNORADOS = [
  "vivareal.com.br",
  "zapimoveis.com.br",
  "olx.com.br",
  "imovelweb.com.br",
  "chavesnamao.com.br",
  "quintoandar.com.br",
  "mercadolivre.com.br",
  "facebook.com",
  "instagram.com",
  "google.com",
  "airbnb.com",
  "booking.com",
  "casamineira.com.br",
];

const cidadesAlvo = [
  // Litoral do PR
  { cidade: "Matinhos", estado: "PR", query: "imobiliaria em Matinhos PR" },
  { cidade: "Pontal do Paraná", estado: "PR", query: "imobiliaria em Pontal do Parana PR" },
  { cidade: "Guaratuba", estado: "PR", query: "imobiliaria em Guaratuba PR" },
  { cidade: "Paranaguá", estado: "PR", query: "imobiliaria em Paranagua PR" },

  // Curitiba e RMC
  { cidade: "Curitiba", estado: "PR", query: "imobiliaria em Curitiba PR" },
  { cidade: "São José dos Pinhais", estado: "PR", query: "imobiliaria em Sao Jose dos Pinhais PR" },
  { cidade: "Pinhais", estado: "PR", query: "imobiliaria em Pinhais PR" },
  { cidade: "Colombo", estado: "PR", query: "imobiliaria em Colombo PR" },
  { cidade: "Araucária", estado: "PR", query: "imobiliaria em Araucaria PR" },
  { cidade: "Campo Largo", estado: "PR", query: "imobiliaria em Campo Largo PR" },
  { cidade: "Fazenda Rio Grande", estado: "PR", query: "imobiliaria em Fazenda Rio Grande PR" },

  // Polos do PR
  { cidade: "Maringá", estado: "PR", query: "imobiliaria em Maringa PR" },
  { cidade: "Londrina", estado: "PR", query: "imobiliaria em Londrina PR" },
  { cidade: "Cascavel", estado: "PR", query: "imobiliaria em Cascavel PR" },
  { cidade: "Foz do Iguaçu", estado: "PR", query: "imobiliaria em Foz do Iguacu PR" },
  { cidade: "Ponta Grossa", estado: "PR", query: "imobiliaria em Ponta Grossa PR" },

  // Santa Catarina (SC)
  { cidade: "Balneário Camboriú", estado: "SC", query: "imobiliaria em Balneario Camboriu SC" },
  { cidade: "Itapema", estado: "SC", query: "imobiliaria em Itapema SC" },
  { cidade: "Bombinhas", estado: "SC", query: "imobiliaria em Bombinhas SC" },
  { cidade: "Joinville", estado: "SC", query: "imobiliaria em Joinville SC" },
  { cidade: "Florianópolis", estado: "SC", query: "imobiliaria em Florianopolis SC" },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function limparDominio(urlBruta) {
  try {
    let u = urlBruta.trim();
    if (!u.startsWith("http")) u = "https://" + u;
    const p = new URL(u);
    const host = p.hostname.replace("www.", "").toLowerCase();

    if (PORTAIS_IGNORADOS.some((ign) => host.includes(ign))) return null;
    if (!host.includes(".")) return null;

    return `${p.protocol}//${p.hostname}`;
  } catch {
    return null;
  }
}

async function rasparGoogleMapsPorCidade(browser, item) {
  console.log(`📍 [${item.estado} - ${item.cidade}] Abrindo Google Maps: "${item.query}"...`);
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1366, height: 768 });

  let salvas = 0;

  try {
    const urlBusca = `https://www.google.com.br/maps/search/${encodeURIComponent(item.query)}`;
    await page.goto(urlBusca, { waitUntil: "networkidle2", timeout: 30000 });

    // Aguarda o painel de resultados carregar
    await page.waitForSelector('div[role="feed"], div[role="main"]', { timeout: 10000 }).catch(() => {});

    // Rola o feed continuamente até atingir o fim da lista ou forçar carregamento massivo
    await page.evaluate(async () => {
      const feed = document.querySelector('div[role="feed"]');
      if (!feed) return;

      let scrollAnterior = 0;
      let tentativasSemNovos = 0;

      // Limite de 25 rolagens para evitar loops infinitos, suficiente para carregar 100+ imobiliárias
      for (let i = 0; i < 25; i++) {
        feed.scrollBy(0, 4000);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (feed.scrollTop === scrollAnterior) {
          tentativasSemNovos++;
          if (tentativasSemNovos >= 2) break; // Chegou ao fim real da lista do Maps
        } else {
          tentativasSemNovos = 0;
          scrollAnterior = feed.scrollTop;
        }

        if (document.body.innerText.includes("Você chegou ao final da lista")) {
          break;
        }
      }
    });

    // Extrai os cards de imobiliárias
    const imobiliariasEncontradas = await page.evaluate(() => {
      const lista = [];
      const cards = document.querySelectorAll('div[role="article"], .Nv2PK');

      cards.forEach((card) => {
        const nomeEl = card.querySelector(".qBF1Pd, .fontHeadlineSmall");
        const linkEl = card.querySelector('a[data-value="Website"], a[aria-label*="website"], a[aria-label*="site"]');
        const phoneEl = card.querySelector('button[data-tooltip*="telefone"], button[data-value*="telefone"], .UsdlK');

        const nome = nomeEl ? nomeEl.textContent.trim() : null;
        const site = linkEl ? linkEl.getAttribute("href") : null;
        const telefone = phoneEl ? phoneEl.textContent.trim() : null;

        if (nome) {
          lista.push({ nome, site, telefone });
        }
      });

      return lista;
    });

    // Processa e salva no banco de dados
    for (const imob of imobiliariasEncontradas) {
      if (!imob.site) continue;

      const dominio = limparDominio(imob.site);
      if (!dominio) continue;

      const telLimpo = imob.telefone ? imob.telefone.replace(/\D/g, "") : "44997278694";

      const registro = {
        nome: imob.nome,
        dominio,
        telefone: telLimpo.length >= 10 ? telLimpo : "44997278694",
        cidade: item.cidade,
        estado: item.estado,
        creci: `${item.estado}-CRECI`,
        ativo: true,
      };

      const { error } = await supabase
        .from("imobiliarias_radar")
        .upsert(registro, { onConflict: "dominio" });

      if (!error) {
        salvas++;
        console.log(`   🏢 [GMaps] ${registro.nome} | 🌐 ${registro.dominio} | 📲 ${registro.telefone}`);
      }
    }
  } catch (err) {
    console.warn(`   ⚠️ Erro ao consultar ${item.cidade} no Maps: ${err.message}`);
  } finally {
    await page.close();
  }

  console.log(`   ✨ ${salvas} imobiliárias reais salvas para ${item.cidade}.\n`);
}

async function executarExtratorGoogleMaps() {
  console.log("==================================================================");
  console.log("🗺️ MOTOR DE BUSCA (SEM LIMITE DE 20): GOOGLE MAPS VIA PUPPETEER");
  console.log("==================================================================\n");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  for (const item of cidadesAlvo) {
    await rasparGoogleMapsPorCidade(browser, item);
    await delay(1000);
  }

  await browser.close();

  const { count } = await supabase
    .from("imobiliarias_radar")
    .select("*", { count: "exact", head: true });

  console.log("==================================================================");
  console.log(`🏁 MAPEAMENTO CONCLUÍDO! Total de imobiliárias no radar: ${count}`);
  console.log("==================================================================");
}

executarExtratorGoogleMaps();