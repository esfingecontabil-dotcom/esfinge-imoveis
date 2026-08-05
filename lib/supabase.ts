import { createClient } from "@supabase/supabase-js";

// Garante uma URL válida em qualquer cenário (mesmo durante o build estático da Vercel)
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" && 
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://oohtiefgaelsmvgvtezd.supabase.co";

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 10
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaHRpZWZnYWVsc212Z3Z0ZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMDAwMDAsImV4cCI6MTk5MDUwMDAwMH0.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});