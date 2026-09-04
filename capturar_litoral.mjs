import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oohtiefgaelsmvgvtezd.supabase.co";
const SUPABASE_KEY = "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const imoveisBase = [
  {
    titulo: "Apartamento 3 Quartos com Vista para o Mar em Caiobá",
    descricao: "Excelente apartamento em Caiobá com vista panorâmica, ampla sacada e fino acabamento.",
    tipo: "Apartamento",
    modalidade: "Venda",
    uf: "PR",
    cidade: "Matinhos",
    bairro: "Caiobá",
    bairro_balneario: "Caiobá",
    preco: 890000,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    area_m2: 125,
    com_ar_condicionado: true,
    com_piscina: false,
    com_churrasqueira: true,
    vista_mar: true,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    imagens: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"],
    ativo: true,
    destaque: true,
    status: "Disponível"
  },
  {
    titulo: "Cobertura Duplex com Piscina Privativa em Caiobá",
    descricao: "Cobertura de alto padrão com terraço exclusivo e piscina privativa.",
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
    imagens: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"],
    ativo: true,
    destaque: true,
    status: "Disponível"
  },
  {
    titulo: "Sobrado Alto Padrão em Ipanema com Piscina",
    descricao: "Maravilhoso sobrado contemporâneo com piscina aquecida e suíte master.",
    tipo: "Sobrado",
    modalidade: "Venda",
    uf: "PR",
    cidade: "Pontal do Paraná",
    bairro: "Ipanema",
    bairro_balneario: "Ipanema",
    preco: 750000,
    quartos: 4,
    banheiros: 3,
    vagas: 3,
    area_m2: 180,
    com_ar_condicionado: true,
    com_piscina: true,
    com_churrasqueira: true,
    vista_mar: false,
    aceita_pet: true,
    imagem_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    imagens: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"],
    ativo: true,
    destaque: true,
    status: "Disponível"
  },
  {
    titulo: "Mansão com Vista Panorâmica em Guaratuba",
    descricao: "Exclusiva residência de alto padrão com pier privativo e vista para a baía.",
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
    imagens: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"],
    ativo: true,
    destaque: true,
    status: "Disponível"
  }
];

async function sincronizarTudo() {
  console.log("🚀 [1/2] Normalizando e ativando imóveis existentes...");
  const { data: existentes } = await supabase.from("imoveis").select("id, imagens, imagem_url");
  if (existentes) {
    for (const item of existentes) {
      const foto = (item.imagens && item.imagens[0]) || item.imagem_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";
      await supabase.from("imoveis").update({
        ativo: true,
        destaque: true,
        status: "Disponível",
        imagem_url: foto
      }).eq("id", item.id);
    }
  }

  console.log("🚀 [2/2] Inserindo lote com dados completos...");
  for (const imv of imoveisBase) {
    await supabase.from("imoveis").insert([imv]);
  }

  console.log("🎉 Sincronização concluída com sucesso!");
}

sincronizarTudo();