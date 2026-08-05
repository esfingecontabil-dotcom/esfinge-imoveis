import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://oohtiefgaelsmvgvtezd.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

// Remove eventuais aspas e espaços extras das variáveis de ambiente
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "").trim();
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, "").trim();

// Garante que a URL seja válida antes de chamar o createClient
const finalUrl = supabaseUrl.startsWith("http") ? supabaseUrl : defaultUrl;
const finalKey = supabaseAnonKey.length > 0 ? supabaseAnonKey : defaultKey;

export const supabase = createClient(finalUrl, finalKey);