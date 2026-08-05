import { createClient } from "@supabase/supabase-js";

// Busca as variáveis de ambiente ou utiliza fallbacks para não travar a aplicação localmente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);