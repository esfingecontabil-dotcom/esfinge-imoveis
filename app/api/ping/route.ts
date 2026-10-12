import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_G91IjU8iNkKEUjs6o-FFIA_Z3gqUF8B";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Faz uma consulta real no banco (apenas conta registros, ultra-leve e rápido)
    const { count, error } = await supabase
      .from("imoveis")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { status: "erro", mensagem: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ativo",
      mensagem: "Supabase ativo e respondendo",
      total_imoveis: count,
      horario: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "falha", erro: err?.message || String(err) },
      { status: 500 }
    );
  }
}