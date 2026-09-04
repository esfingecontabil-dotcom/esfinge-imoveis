import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oohtiefgaelsmvgvtezd.supabase.co";
const SUPABASE_KEY = "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const imoveisBase = [
  // --- LOCAÇÃO VERANEIO / TEMPORADA ---
  {
    titulo: "Apartamento Frente para o Mar com Sacada Gourmet em Caiobá",
    descricao: "Excelente para férias em família! A 50m da Praia Brava, com ar-condicionado em todos os quartos e churrasqueira na sacada.",
    tipo: "Apartamento",
    modalidade: "Temporada",
    uf: "PR",
    cidade: "Matinhos",
    bairro: "Caiobá",
    bairro_balneario: "Caiobá",
    preco: 650,
    preco_alta_temporada: 950,
    taxa_limpeza: 200,
    capacidade_pessoas: 8,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    area_m2: 110,
    com_ar_condicionado: true,
    com_piscina: false,
    com_churrasqueira: true,
    vista_mar: true,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    ativo: true,
    status: "disponivel"
  },
  {
    titulo: "Sobrado com Piscina Privativa para Temporada em Ipanema",
    descricao: "Espaço gourmet completo, piscina grande com cascata, ideal para grupos e temporadas de verão.",
    tipo: "Sobrado",
    modalidade: "Temporada",
    uf: "PR",
    cidade: "Pontal do Paraná",
    bairro: "Ipanema",
    bairro_balneario: "Ipanema",
    preco: 800,
    preco_alta_temporada: 1300,
    taxa_limpeza: 250,
    capacidade_pessoas: 12,
    quartos: 4,
    banheiros: 3,
    vagas: 4,
    area_m2: 200,
    com_ar_condicionado: true,
    com_piscina: true,
    com_churrasqueira: true,
    vista_mar: false,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
    ],
    ativo: true,
    status: "disponivel"
  },
  {
    titulo: "Casa Térrea Pé na Areia no Brejatuba",
    descricao: "Pé na areia em Guaratuba, varanda ampla com rede, churrasqueira e saída direta para a praia.",
    tipo: "Casa",
    modalidade: "Temporada",
    uf: "PR",
    cidade: "Guaratuba",
    bairro: "Brejatuba",
    bairro_balneario: "Brejatuba",
    preco: 550,
    preco_alta_temporada: 850,
    taxa_limpeza: 180,
    capacidade_pessoas: 6,
    quartos: 2,
    banheiros: 2,
    vagas: 2,
    area_m2: 95,
    com_ar_condicionado: true,
    com_piscina: false,
    com_churrasqueira: true,
    vista_mar: true,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ],
    ativo: true,
    status: "disponivel"
  },

  // --- LOCAÇÃO INTEGRAL / ANUAL ---
  {
    titulo: "Apartamento 2 Quartos para Locação Anual no Centro de Matinhos",
    descricao: "Apartamento semimobiliado no centro de Matinhos, próximo a bancos, mercados e colégios. Contrato anual.",
    tipo: "Apartamento",
    modalidade: "Locação Anual",
    uf: "PR",
    cidade: "Matinhos",
    bairro: "Centro",
    bairro_balneario: "Matinhos Centro",
    preco: 1850,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    area_m2: 68,
    com_ar_condicionado: false,
    com_piscina: false,
    com_churrasqueira: false,
    vista_mar: false,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=1200&q=80"
    ],
    ativo: true,
    status: "disponivel"
  },
  {
    titulo: "Sobrado Residencial Seguro em Praia de Leste (Locação Anual)",
    descricao: "Sobrado em condomínio fechado, bairro tranquilo com moradores fixos. Excelente opção para residência fixa.",
    tipo: "Sobrado",
    modalidade: "Locação Anual",
    uf: "PR",
    cidade: "Pontal do Paraná",
    bairro: "Praia de Leste",
    bairro_balneario: "Praia de Leste",
    preco: 2400,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    area_m2: 120,
    com_ar_condicionado: true,
    com_piscina: false,
    com_churrasqueira: true,
    vista_mar: false,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80"
    ],
    ativo: true,
    status: "disponivel"
  },

  // --- VENDA ---
  {
    titulo: "Cobertura Duplex com Piscina Privativa em Caiobá",
    descricao: "Cobertura de altíssimo padrão com terraço exclusivo e vista espetacular para o mar de Caiobá.",
    tipo: "Apartamento",
    modalidade: "Venda",
    uf: "PR",
    cidade: "Matinhos",
    bairro: "Caiobá",
    bairro_balneario: "Caiobá",
    preco: 1650000,
    quartos: 4,
    banheiros: 4,
    vagas: 3,
    area_m2: 240,
    com_ar_condicionado: true,
    com_piscina: true,
    com_churrasqueira: true,
    vista_mar: true,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    ativo: true,
    status: "disponivel"
  },
  {
    titulo: "Mansão com Vista Panorâmica para a Baía de Guaratuba",
    descricao: "Exclusiva residência de alto padrão com pier privativo e vista panorâmica.",
    tipo: "Casa",
    modalidade: "Venda",
    uf: "PR",
    cidade: "Guaratuba",
    bairro: "Centro",
    bairro_balneario: "Centro",
    preco: 1850000,
    quartos: 5,
    banheiros: 5,
    vagas: 4,
    area_m2: 380,
    com_ar_condicionado: true,
    com_piscina: true,
    com_churrasqueira: true,
    vista_mar: true,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    imagens: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    ativo: true,
    status: "disponivel"
  }
];

async function sincronizarTudo() {
  console.log("🚀 Sincronizando imóveis (Venda, Locação Anual e Temporada)...");

  for (const imv of imoveisBase) {
    const { error } = await supabase.from("imoveis").insert([imv]);
    if (error) {
      console.log(`⚠️ Erro ao cadastrar ${imv.titulo}: ${error.message}`);
    } else {
      console.log(`✅ [${imv.modalidade.toUpperCase()}] ${imv.titulo} (${imv.cidade})`);
    }
  }

  console.log("\n🎉 Sincronização finalizada com sucesso!");
}

sincronizarTudo();