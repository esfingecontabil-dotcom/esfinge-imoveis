import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const imoveisParaImportar = [
  // ================= PONTAL DO PARANÁ =================
  {
    codigo: "PL-101",
    titulo: "Casa Alto Padrão com Piscina a 100m da Praia",
    descricao: "4 quartos (2 suítes), piscina privativa iluminada, quiosque com churrasqueira a carvão e garagem para 3 veículos.",
    tipo: "Casa",
    cidade: "Pontal do Paraná",
    bairro: "Praia de Leste",
    modalidade: "Temporada",
    preco: 950,
    capacidade_pessoas: 12,
    quartos: 4,
    banheiros: 3,
    vagas: 3,
    area_m2: 210,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Imobiliária Praia de Leste",
    corretor_telefone: "4134581200",
    corretor_creci: "PR-3458J",
    imobiliaria_origem: "Imobiliária Praia de Leste",
    link_origem: "https://praiadelesteimoveis.com.br"
  },
  {
    codigo: "IPN-201",
    titulo: "Sobrado Triplex Moderno com Vista Mar em Ipanema",
    descricao: "Sobrado moderno com 3 suítes, terraço gourmet com vista panorâmica, ar-condicionado e fino acabamento em porcelanato.",
    tipo: "Sobrado",
    cidade: "Pontal do Paraná",
    bairro: "Ipanema",
    modalidade: "Venda",
    preco: 620000,
    quartos: 3,
    banheiros: 4,
    vagas: 2,
    area_m2: 165,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Ipanema Imóveis",
    corretor_telefone: "4134572500",
    corretor_creci: "PR-2500J",
    imobiliaria_origem: "Ipanema Imóveis",
    link_origem: "https://ipanemaimoveislitoral.com.br"
  },
  {
    codigo: "SHG-202",
    titulo: "Casa Aconchegante Próxima ao Calçadão de Shangri-lá",
    descricao: "Excelente imóvel térreo com 3 dormitórios, varanda com rede, churrasqueira coberta e amplo quintal gramado.",
    tipo: "Casa",
    cidade: "Pontal do Paraná",
    bairro: "Shangri-lá",
    modalidade: "Temporada",
    preco: 650,
    capacidade_pessoas: 8,
    quartos: 3,
    banheiros: 2,
    vagas: 3,
    area_m2: 130,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Imobiliária Shangri-lá",
    corretor_telefone: "4134571800",
    corretor_creci: "PR-1800J",
    imobiliaria_origem: "Ilha do Mel Imóveis",
    link_origem: "https://ilhadomelimoveis.com.br"
  },
  {
    codigo: "STH-203",
    titulo: "Residência Espaçosa em Santa Teresinha",
    descricao: "Casa com 4 dormitórios (1 suíte), sala ampla em 2 ambientes, cozinha equipada e área gourmet completa.",
    tipo: "Casa",
    cidade: "Pontal do Paraná",
    bairro: "Santa Teresinha",
    modalidade: "Venda",
    preco: 480000,
    quartos: 4,
    banheiros: 2,
    vagas: 2,
    area_m2: 170,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Imobiliária Santa Teresinha",
    corretor_telefone: "4134583000",
    corretor_creci: "PR-3000J",
    imobiliaria_origem: "Santa Helena Imóveis",
    link_origem: "https://santahelenaimoveis.com.br"
  },
  {
    codigo: "PTS-204",
    titulo: "Chácara / Refúgio Ecológico em Pontal do Sul",
    descricao: "Propriedade arborizada a poucos minutos do embarque para a Ilha do Mel. Espaço para lazer, descanso e pesca esportiva.",
    tipo: "Chácara",
    cidade: "Pontal do Paraná",
    bairro: "Pontal do Sul",
    modalidade: "Venda",
    preco: 750000,
    quartos: 4,
    banheiros: 3,
    vagas: 6,
    area_m2: 850,
    aceita_pet: true,
    ar_condicionado: false,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Pontal do Sul Imóveis",
    corretor_telefone: "4134551010",
    corretor_creci: "PR-1010J",
    imobiliaria_origem: "Pontal do Sul Imóveis",
    link_origem: "https://pontalimoveis.com.br"
  },

  // ================= MATINHOS & CAIOBÁ =================
  {
    codigo: "CB-301",
    titulo: "Apartamento Frente para o Mar na Praia Mansa de Caiobá",
    descricao: "Edifício exclusivo, sacada ampla com churrasqueira e vista espetacular para a baía, 3 suítes climatizadas e 2 vagas.",
    tipo: "Apartamento",
    cidade: "Matinhos",
    bairro: "Caiobá",
    modalidade: "Venda",
    preco: 1450000,
    quartos: 3,
    banheiros: 3,
    vagas: 2,
    area_m2: 142,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Caiobá Imóveis",
    corretor_telefone: "4134522020",
    corretor_creci: "PR-2020J",
    imobiliaria_origem: "Caiobá Imóveis",
    link_origem: "https://caiobaimoveis.com.br"
  },
  {
    codigo: "CB-302",
    titulo: "Cobertura Duplex com Piscina Privativa na Praia Brava",
    descricao: "Cobertura de alto padrão em Caiobá com piscina privativa, espaço gourmet, 4 suítes e 3 vagas de garagem.",
    tipo: "Apartamento",
    cidade: "Matinhos",
    bairro: "Caiobá",
    modalidade: "Temporada",
    preco: 1600,
    capacidade_pessoas: 10,
    quartos: 4,
    banheiros: 5,
    vagas: 3,
    area_m2: 240,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Vianna Imóveis Litoral",
    corretor_telefone: "4134532200",
    corretor_creci: "PR-2200J",
    imobiliaria_origem: "Vianna Imóveis Litoral",
    link_origem: "https://viannaimoveislitoral.com.br"
  },
  {
    codigo: "MAT-303",
    titulo: "Casa Térrea no Centro de Matinhos com Amplo Quintal",
    descricao: "Imóvel residencial ideal para locação anual ou moradia definitiva, próximo a mercados, farmácias e comércios.",
    tipo: "Casa",
    cidade: "Matinhos",
    bairro: "Centro",
    modalidade: "Locação Anual",
    preco: 2800,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    area_m2: 140,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Imobiliária Matinhos",
    corretor_telefone: "4134531500",
    corretor_creci: "PR-1500J",
    imobiliaria_origem: "Imobiliária Matinhos",
    link_origem: "https://imobiliariamatinhos.com.br"
  },
  {
    codigo: "STZ-304",
    titulo: "Sobrado com Área Gourmet em Sertãozinho",
    descricao: "Excelente relação custo-benefício em Matinhos, imóvel novo com 2 suítes, sala integrada e churrasqueira.",
    tipo: "Sobrado",
    cidade: "Matinhos",
    bairro: "Sertãozinho",
    modalidade: "Venda",
    preco: 360000,
    quartos: 2,
    banheiros: 3,
    vagas: 1,
    area_m2: 105,
    aceita_pet: true,
    ar_condicionado: false,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Litoral Sul Imóveis",
    corretor_telefone: "4134533300",
    corretor_creci: "PR-3300J",
    imobiliaria_origem: "Litoral Sul Imóveis",
    link_origem: "https://litoralsulimoveis.com.br"
  },

  // ================= GUARATUBA =================
  {
    codigo: "GUA-401",
    titulo: "Casa de Praia no Brejatuba Próxima ao Morro do Cristo",
    descricao: "Imóvel amplo para temporada com piscina, mesa de jogos, 4 dormitórios e acomodação confortável para grandes grupos.",
    tipo: "Casa",
    cidade: "Guaratuba",
    bairro: "Brejatuba",
    modalidade: "Temporada",
    preco: 1100,
    capacidade_pessoas: 14,
    quartos: 4,
    banheiros: 4,
    vagas: 4,
    area_m2: 260,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Mafra Imóveis",
    corretor_telefone: "4134432020",
    corretor_creci: "PR-4432J",
    imobiliaria_origem: "Mafra Imóveis",
    link_origem: "https://mafraimoveis.com.br"
  },
  {
    codigo: "GUA-402",
    titulo: "Apartamento Frente Mar na Praia Central de Guaratuba",
    descricao: "Vista total para a orla, prédio com elevador, sacada com churrasqueira integrada e 3 dormitórios (1 suíte).",
    tipo: "Apartamento",
    cidade: "Guaratuba",
    bairro: "Centro",
    modalidade: "Venda",
    preco: 890000,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    area_m2: 125,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Guaratuba Imóveis",
    corretor_telefone: "4134421500",
    corretor_creci: "PR-1500J",
    imobiliaria_origem: "Guaratuba Imóveis",
    link_origem: "https://guaratubaimoveis.com.br"
  },
  {
    codigo: "GUA-403",
    titulo: "Sobrado Alto Padrão no Costa do Sol",
    descricao: "Residência com piscina privativa, fino acabamento, churrasqueira e ambientes 100% integrados.",
    tipo: "Sobrado",
    cidade: "Guaratuba",
    bairro: "Brejatuba",
    modalidade: "Venda",
    preco: 780000,
    quartos: 3,
    banheiros: 3,
    vagas: 2,
    area_m2: 150,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Costa do Sol Imóveis",
    corretor_telefone: "4134423300",
    corretor_creci: "PR-3300J",
    imobiliaria_origem: "Costa do Sol Imóveis",
    link_origem: "https://costadosolguaratuba.com.br"
  },

  // ================= PARANAGUÁ =================
  {
    codigo: "PNG-501",
    titulo: "Casarão Reformado no Centro Histórico de Paranaguá",
    descricao: "Imóvel com valor arquitetônico único, ideal para escritórios, comércio ou moradia no coração histórico da cidade.",
    tipo: "Casa",
    cidade: "Paranaguá",
    bairro: "Centro Histórico",
    modalidade: "Venda",
    preco: 690000,
    quartos: 4,
    banheiros: 3,
    vagas: 2,
    area_m2: 280,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Paranaguá Imóveis",
    corretor_telefone: "4134231000",
    corretor_creci: "PR-1000J",
    imobiliaria_origem: "Paranaguá Imóveis",
    link_origem: "https://paranaguaimoveis.com.br"
  },
  {
    codigo: "PNG-502",
    titulo: "Apartamento Moderno no Bairro João Gualberto",
    descricao: "2 dormitórios (1 suíte), sacada com churrasqueira, vaga coberta e condomínio seguro com portaria.",
    tipo: "Apartamento",
    cidade: "Paranaguá",
    bairro: "João Gualberto",
    modalidade: "Locação Anual",
    preco: 2200,
    quartos: 2,
    banheiros: 2,
    vagas: 1,
    area_m2: 78,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Aliança Imóveis Paranaguá",
    corretor_telefone: "4134224040",
    corretor_creci: "PR-4040J",
    imobiliaria_origem: "Aliança Imóveis",
    link_origem: "https://aliancaparanagua.com.br"
  },

  // ================= MARINGÁ =================
  {
    codigo: "MGA-601",
    titulo: "Apartamento de Alto Padrão na Zona 01 Próximo ao Parque do Ingá",
    descricao: "Edifício nobre com 3 suítes, varanda gourmet espaçosa, lazer completo com piscina aquecida e academia.",
    tipo: "Apartamento",
    cidade: "Maringá",
    bairro: "Zona 01",
    modalidade: "Locação Anual",
    preco: 4500,
    quartos: 3,
    banheiros: 4,
    vagas: 2,
    area_m2: 175,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Silvio Iwata Imóveis",
    corretor_telefone: "4440092000",
    corretor_creci: "PR-4009J",
    imobiliaria_origem: "Silvio Iwata Imóveis",
    link_origem: "https://silvioiwata.com.br"
  },
  {
    codigo: "MGA-602",
    titulo: "Studio Mobiliado e Decorado na Zona 07",
    descricao: "Studio inteligente com mobília planejada, ar-condicionado inverter, sacada e infraestrutura completa para locação.",
    tipo: "Studio",
    cidade: "Maringá",
    bairro: "Zona 07",
    modalidade: "Locação Anual",
    preco: 1900,
    quartos: 1,
    banheiros: 1,
    vagas: 1,
    area_m2: 45,
    aceita_pet: false,
    ar_condicionado: true,
    com_piscina: true,
    imagens: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Opção Imóveis",
    corretor_telefone: "4430321300",
    corretor_creci: "PR-3032J",
    imobiliaria_origem: "Opção Imóveis",
    link_origem: "https://opcaoimoveis.com.br"
  },
  {
    codigo: "MGA-603",
    titulo: "Residência Moderna em Bairro Nobre na Zona 07",
    descricao: "Casa com arquitetura contemporânea, 3 suítes, pé direito duplo, espaço gourmet integrado e excelente acabamento.",
    tipo: "Casa",
    cidade: "Maringá",
    bairro: "Zona 07",
    modalidade: "Venda",
    preco: 1150000,
    quartos: 3,
    banheiros: 4,
    vagas: 3,
    area_m2: 220,
    aceita_pet: true,
    ar_condicionado: true,
    com_piscina: false,
    imagens: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    corretor_nome: "Imobiliária Lélo",
    corretor_telefone: "4432255000",
    corretor_creci: "PR-3225J",
    imobiliaria_origem: "Imobiliária Lélo",
    link_origem: "https://leloimoveis.com.br"
  }
];

async function executarCarga() {
  console.log(`🚀 Sincronizando ${imoveisParaImportar.length} imóveis no Supabase...`);

  for (const item of imoveisParaImportar) {
    const { error } = await supabase
      .from("imoveis")
      .upsert(item, { onConflict: "codigo" });

    if (error) {
      console.error(`❌ Erro no imóvel ${item.codigo}:`, error.message);
    } else {
      console.log(`✅ [${item.cidade} - ${item.bairro}] ${item.titulo} -> ${item.corretor_nome} (${item.corretor_telefone})`);
    }
  }

  console.log("🏁 Sincronização concluída com sucesso!");
}

executarCarga();