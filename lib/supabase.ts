import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://oohtiefgaelsmvgvtezd.supabase.co";
const defaultKey = "placeholder-key-anon";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
const supabaseUrl = typeof rawUrl === "string" && rawUrl.trim().startsWith("http")
  ? rawUrl.replace(/^["']|["']$/g, "").trim()
  : defaultUrl;

const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;
const supabaseAnonKey = typeof rawKey === "string" && rawKey.trim().length > 0
  ? rawKey.replace(/^["']|["']$/g, "").trim()
  : defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);