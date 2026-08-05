import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://oohtiefgaelsmvgvtezd.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaHRpZWZnYWVsc212Z3Z0ZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMDAwMDAsImV4cCI6MTk5MDUwMDAwMH0.placeholder";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && typeof rawUrl === "string" && rawUrl.startsWith("http")) 
  ? rawUrl.replace(/^["']|["']$/g, "").trim() 
  : DEFAULT_URL;

const supabaseAnonKey = (rawKey && typeof rawKey === "string" && rawKey.length > 10) 
  ? rawKey.replace(/^["']|["']$/g, "").trim() 
  : DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);