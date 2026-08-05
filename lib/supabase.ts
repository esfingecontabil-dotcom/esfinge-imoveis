import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = 
  typeof rawUrl === "string" && rawUrl.startsWith("http")
    ? rawUrl.trim().replace(/^["']|["']$/g, "")
    : "https://oohtiefgaelsmvgvtezd.supabase.co";

const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAnonKey = 
  typeof rawKey === "string" && rawKey.length > 10
    ? rawKey.trim().replace(/^["']|["']$/g, "")
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaHRpZWZnYWVsc212Z3Z0ZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMDAwMDAsImV4cCI6MTk5MDUwMDAwMH0.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});