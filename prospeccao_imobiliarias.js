const fs = require('fs');
const https = require('https');

// ==============================================================================
// CONFIGURAÇÕES
// ==============================================================================
// Cole aqui sua chave da Google Places API
const GOOGLE_API_KEY = "SUA_CHAVE_GOOGLE_PLACES_AQUI";

const CIDADES = [
  "Pontal do Paraná, PR",
  "Matinhos, PR",
  "Guaratuba, PR",
  "Paranaguá, PR",
  "Maringá, PR"
];

const URL_PORTAL = "https://esfinge-imoveis.vercel.app";

async function buscarImobiliariasGoogle(cidade) {
  console.log(`🔍 Buscando imobiliárias no Google Maps em: ${cidade}...`);
  
  const query = encodeURIComponent(`imobiliaria em ${cidade}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}&language=pt-BR`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function executar() {
  if (GOOGLE_API_KEY === "SUA_CHAVE_GOOGLE_PLACES_AQUI") {
    console.log("=========================================================================");
    console.log("⚠️ CHAVE DA GOOGLE PLACES API NÃO CONFIGURADA");
    console.log("=========================================================================");
    console.log("Para buscar centenas de imobiliárias direto do Google Maps:");
    console.log("1. Cole sua chave na variável GOOGLE_API_KEY no topo do script.");
    console.log("2. Ou utilize a extensão 'Instant Data Scraper' no Google Maps para exportar o CSV em 1 clique.\n");
    return;
  }

  let listaFinal = [];

  for (const cidade of CIDADES) {
    const locais = await buscarImobiliariasGoogle(cidade);
    console.log(` -> Encontradas ${locais.length} imobiliárias em ${cidade}`);

    locais.forEach(place => {
      const nome = place.name;
      const endereco = place.formatted_address || '';
      
      const msg = (
        `Olá, equipe da ${nome}! Tudo bem?\n\n` +
        `Acompanhamos o trabalho de vocês no mercado imobiliário de ${cidade} e ` +
        `gostaríamos de convidar sua imobiliária para divulgar sua carteira de imóveis na plataforma *Esfinge Imóveis*.\n\n` +
        `🛡️ *Vantagens Exclusivas para Imobiliárias:*\n` +
        `1. *Zero Taxa de Corretagem:* Somos exclusivamente uma vitrine tecnológica de aproximação.\n` +
        `2. *Leads Diretos no Seu WhatsApp:* O comprador clica e entra em contato direto com o seu corretor.\n` +
        `3. *Cadastro via Importador:* Cole o link do anúncio no painel e cadastre em segundos.\n\n` +
        `Acesse nossa vitrine oficial: ${URL_PORTAL}\n\n` +
        `Podemos agendar uma demonstração sem compromisso?`
      );

      listaFinal.push({
        municipio: cidade,
        nome: nome,
        endereco: endereco,
        mensagem: msg
      });
    });
  }

  const cabecalho = "Municipio;Nome_Imobiliaria;Endereco;Mensagem_WhatsApp\n";
  const linhas = listaFinal.map(i => `"${i.municipio}";"${i.nome}";"${i.endereco}";"${i.mensagem}"`).join("\n");
  
  fs.writeFileSync("imobiliarias_google_maps.csv", "\uFEFF" + cabecalho + linhas);
  console.log(`\n✅ Sucesso! Planilha gerada com ${listaFinal.length} imobiliárias reais do Google Maps.`);
}

executar();