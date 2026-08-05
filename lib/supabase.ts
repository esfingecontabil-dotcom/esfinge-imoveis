import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "").trim();

const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key-anon";
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, "").trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);