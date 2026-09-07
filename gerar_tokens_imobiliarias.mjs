import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DOMINIO_PORTAL = "https://portalesfingeimoveis.com.br";

async function atualizarTokens() {
  console.log("==================================================================");
  console.log("🔑 GERANDO TOKENS E LINKS EXCLUSIVOS DE ATIVAÇÃO");
  console.log("==================================================================\n");

  const { data: imobiliarias, error } = await supabase
    .from("imobiliarias_radar")
    .select("id, nome, cidade, estado, telefone, token_ativacao")
    .order("id", { ascending: true });

  if (error || !imobiliarias) {
    console.error("Erro ao consultar imobiliárias:", error?.message);
    return;
  }

  let atualizados = 0;

  for (const imob of imobiliarias) {
    let token = imob.token_ativacao;
    if (!token) {
      token = crypto.randomUUID();
      await supabase
        .from("imobiliarias_radar")
        .update({ token_ativacao: token })
        .eq("id", imob.id);
      atualizados++;
    }
  }

  console.log(`✅ Base conferida: ${imobiliarias.length} imobiliárias com tokens ativos.\n`);
  console.log("📋 EXEMPLOS DE LINKS DE CONVITE PRONTOS PARA DISPARO:\n");

  const exemplos = imobiliarias.slice(0, 5);
  exemplos.forEach((imob, i) => {
    const link = `${DOMINIO_PORTAL}/painel/ativar?token=${imob.token_ativacao}`;
    console.log(`${i + 1}. [${imob.cidade} - ${imob.estado}] ${imob.nome}`);
    console.log(`   📲 WhatsApp: ${imob.telefone}`);
    console.log(`   🔗 Link Único: ${link}\n`);
  });

  console.log("==================================================================");
}

atualizarTokens();