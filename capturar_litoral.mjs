import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função modelo de salvamento no Supabase
 * @param {Object} imovel - Dados do imóvel e contato do corretor de origem
 */
async function salvarImovel(imovel) {
  // Limpeza e padronização do telefone (somente números)
  const telefoneLimpo = imovel.corretor_telefone
    ? imovel.corretor_telefone.replace(/\D/g, "")
    : "";

  const payload = {
    codigo: imovel.codigo,
    titulo: imovel.titulo,
    descricao: imovel.descricao || "",
    tipo: imovel.tipo || "Casa",
    cidade: imovel.cidade || "Matinhos",
    bairro: imovel.bairro || "Centro",
    modalidade: imovel.modalidade || "Venda", // Venda, Locação Anual ou Temporada
    preco: Number(imovel.preco) || 0,
    quartos: Number(imovel.quartos) || 0,
    banheiros: Number(imovel.banheiros) || 0,
    vagas: Number(imovel.vagas) || 0,
    area_m2: Number(imovel.area_m2) || 0,
    aceita_pet: imovel.aceita_pet ?? true,
    ar_condicionado: imovel.ar_condicionado ?? false,
    com_piscina: imovel.com_piscina ?? false,
    imagens: imovel.imagens || [],
    // DADOS OBRIGATÓRIOS DO CORRETOR / IMOBILIÁRIA DE ORIGEM:
    corretor_nome: imovel.corretor_nome || "Corretor Parceiro",
    corretor_telefone: telefoneLimpo,
    corretor_creci: imovel.corretor_creci || "Credenciado",
    imobiliaria_origem: imovel.imobiliaria_origem || "Imobiliária Parceira",
    link_origem: imovel.link_origem || ""
  };

  const { data, error } = await supabase
    .from("imoveis")
    .upsert(payload, { onConflict: "codigo" });

  if (error) {
    console.error(`❌ Erro ao salvar imóvel ${imovel.codigo}:`, error.message);
  } else {
    console.log(`✅ Imóvel ${imovel.codigo} salvo com sucesso! Corretor: ${payload.corretor_nome} (${payload.corretor_telefone})`);
  }
}

async function executarImportacao() {
  console.log("🚀 Iniciando importação com atribuição direta aos corretores...");

  // Exemplo de imóveis capturados com os dados dos corretores de origem:
  const imoveisExemplo = [
    {
      codigo: "MAT-101",
      titulo: "Casa de Praia com Piscina e Churrasqueira em Caiobá",
      descricao: "Linda casa a 150m do mar, área gourmet completa, ar-condicionado em todos os quartos.",
      tipo: "Casa",
      cidade: "Matinhos",
      bairro: "Caiobá",
      modalidade: "Temporada",
      preco: 850,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      area_m2: 180,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: true,
      imagens: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
      ],
      corretor_nome: "Carlos Eduardo",
      corretor_telefone: "41998887766",
      corretor_creci: "PR-38491",
      imobiliaria_origem: "Litoral Imóveis Caiobá",
      link_origem: "https://exemplo-imobiliaria.com.br/imovel/101"
    },
    {
      codigo: "PNT-202",
      titulo: "Sobrado Moderno Alto Padrão em Ipanema",
      descricao: "Excelente sobrado novo, fino acabamento, próximo ao calçadão.",
      tipo: "Sobrado",
      cidade: "Pontal do Paraná",
      bairro: "Ipanema",
      modalidade: "Venda",
      preco: 620000,
      quartos: 3,
      banheiros: 3,
      vagas: 2,
      area_m2: 145,
      aceita_pet: true,
      ar_condicionado: true,
      com_piscina: false,
      imagens: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ],
      corretor_nome: "Juliana Mendes",
      corretor_telefone: "41991112233",
      corretor_creci: "PR-42150",
      imobiliaria_origem: "Pontal Sul Negócios",
      link_origem: "https://exemplo-imobiliaria.com.br/imovel/202"
    }
  ];

  for (const imovel of imoveisExemplo) {
    await salvarImovel(imovel);
  }

  console.log("🏁 Importação finalizada!");
}

executarImportacao();