import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oohtiefgaelsmvgvtezd.supabase.co";
const SUPABASE_KEY = "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function diagnosticar() {
  console.log("🔍 Testando o que o site/visitante consegue ler no Supabase...");
  
  const { data, error } = await supabase.from("imoveis").select("*");

  if (error) {
    console.log("❌ Erro de permissão ao ler:", error.message);
    return;
  }

  console.log(`✅ O visitante consegue ver ${data.length} imóveis no banco!`);
  if (data.length > 0) {
    console.log("Campos gravados no 1º imóvel:", Object.keys(data[0]));
    console.log("Status gravado:", data[0].status);
  }
}

diagnosticar();