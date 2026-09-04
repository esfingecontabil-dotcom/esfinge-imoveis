import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oohtiefgaelsmvgvtezd.supabase.co";
const SUPABASE_KEY = "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function corrigir() {
  console.log("⚡ Normalizando status e campos de exibição...");
  
  const { data: imoveis } = await supabase.from("imoveis").select("id, imagens, imagem_url");

  for (const imovel of imoveis) {
    const foto = (imovel.imagens && imovel.imagens[0]) || imovel.imagem_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

    await supabase
      .from("imoveis")
      .update({
        ativo: true,
        status: "Disponível",
        destaque: true,
        imagem_url: foto
      })
      .eq("id", imovel.id);
  }

  console.log("✅ Imóveis normalizados para 'Disponível' e 'destaque: true'!");
}

corrigir();