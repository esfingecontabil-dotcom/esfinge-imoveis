import { createClient } from "@supabase/supabase-js";

// Fallback ultra-seguro para garantir que nunca seja passado uma URL vazia ou inválida
const FALLBACK_URL = "https://oohtiefgaelsmvgvtezd.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validação estrita para aceitar apenas URLs HTTP/HTTPS válidas
const supabaseUrl = (rawUrl && typeof rawUrl === "string" && rawUrl.trim().startsWith("http"))
  ? rawUrl.replace(/^["']|["']$/g, "").trim()
  : FALLBACK_URL;

const supabaseAnonKey = (rawKey && typeof rawKey === "string" && rawKey.trim().length > 5)
  ? rawKey.replace(/^["']|["']$/g, "").trim()
  : FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);