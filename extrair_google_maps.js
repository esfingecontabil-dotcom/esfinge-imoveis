const puppeteer = require('puppeteer');
const fs = require('fs');

const CIDADES_LITORAL = [
  "imobiliaria em Pontal do Parana PR",
  "imobiliaria em Matinhos PR",
  "imobiliaria em Caioba PR",
  "imobiliaria em Guaratuba PR",
  "imobiliaria em Paranagua PR",
  "imobiliaria em Maringa PR"
];

const URL_PORTAL = "https://portalesfingeimoveis.com.br";

async function rasparGoogleMaps() {
  console.log("==========================================================");
  console.log("🏰 PORTAL ESFINGE — EXTRAÇÃO AUTOMÁTICA GOOGLE MAPS");
  console.log("==========================================================\n");

  const browser = await puppeteer.launch({ 
    headless: false, // Abre o navegador para você acompanhar a rolagem ao vivo
    defaultViewport: null 
  });

  const page = await browser.newPage();
  let todosLeads = [];

  for (const busca of CIDADES_LITORAL) {
    console.log(`🔍 Pesquisando: "${busca}"...`);
    const urlBusca = `https://www.google.com/maps/search/${encodeURIComponent(busca)}`;
    await page.goto(urlBusca, { waitUntil: 'networkidle2' });

    // Rola o painel esquerdo do Google Maps para carregar todos os resultados
    try {
      await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
      await page.evaluate(async () => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) {
          for (let i = 0; i < 8; i++) {
            feed.scrollBy(0, 1000);
            await new Promise(r => setTimeout(r, 1200));
          }
        }
      });
    } catch (e) {
      console.log("   ⚠️ Painel de resultados direto carregado.");
    }

    // Extrai dados das imobiliárias encontradas
    const resultados = await page.evaluate(() => {
      const cards = document.querySelectorAll('div[role="article"], a[href*="/maps/place/"]');
      const lista = [];

      cards.forEach(card => {
        const nome = card.querySelector('.qBF1Pd, .fontHeadlineSmall')?.innerText || '';
        const textoGeral = card.innerText || '';
        
        // Puxa telefones com DDD do texto do card
        const matchTel = textoGeral.match(/\((?:41|44)\)\s?9?\d{4}[-\s]?\d{4}/);
        const telefone = matchTel ? matchTel[0] : '';

        if (nome && nome.length > 3) {
          lista.push({ nome, telefone, textoGeral });
        }
      });
      return lista;
    });

    console.log(`   👉 Encontradas ${resultados.length} imobiliárias em: ${busca}`);

    resultados.forEach(item => {
      const telLimpo = item.telefone.replace(/\D/g, '');
      const numWa = telLimpo.length >= 10 ? (telLimpo.startsWith('55') ? telLimpo : '55' + telLimpo) : '';

      const msg = (
        `Olá, equipe da ${item.nome}! Tudo bem?\n\n` +
        `Acompanhamos o destaque de vocês no mercado imobiliário e ` +
        `gostaríamos de convidar sua imobiliária para divulgar sua carteira de imóveis no *Portal Esfinge Imóveis*.\n\n` +
        `🛡️ *Diferenciais para Imobiliárias:*\n` +
        `1. *Zero Taxa de Corretagem:* Somos uma vitrine tecnológica de aproximação. O comprador é 100% seu.\n` +
        `2. *Leads Diretos:* O cliente interessado clica no imóvel e fala direto com o seu corretor no WhatsApp.\n` +
        `3. *Cadastro Ágil:* Basta colar o link do seu anúncio para importar em segundos.\n\n` +
        `Conheça nosso portal oficial: ${URL_PORTAL}\n\n` +
        `"Nós não somos uma imobiliária disputando o seu cliente. O Portal Esfinge é a vitrine tecnológica do Paraná criada para conectar o comprador diretamente ao seu WhatsApp."\n\n` +
        `Podemos agendar uma demonstração rápida sem compromisso?`
      );

      const linkWa = numWa ? `https://wa.me/${numWa}?text=${encodeURIComponent(msg)}` : 'Telefone móvel não identificado';

      todosLeads.push({
        busca: busca.replace('imobiliaria em ', ''),
        nome: item.nome,
        telefone: item.telefone || 'Ver no Google Maps',
        link_wa: linkWa
      });
    });

    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  // Salva resultado consolidado em CSV
  const cabecalho = "Cidade_Busca;Nome_Imobiliaria;Telefone;Link_WhatsApp\n";
  const linhas = todosLeads.map(i => `"${i.busca}";"${i.nome}";"${i.telefone}";"${i.link_wa}"`).join("\n");
  
  fs.writeFileSync("imobiliarias_extraidas_google_maps.csv", "\uFEFF" + cabecalho + linhas);

  console.log("\n==========================================================");
  console.log(`✅ EXTRAÇÃO CONCLUÍDA! Total de ${todosLeads.length} imobiliárias salvas!`);
  console.log("📁 Salvo em: imobiliarias_extraidas_google_maps.csv");
  console.log("==========================================================");
}

rasparGoogleMaps();