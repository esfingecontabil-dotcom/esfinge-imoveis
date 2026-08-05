import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    if (!client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oohtiefgaelsmvgvtezd.supabase.co";
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaHRpZWZnYWVsc212Z3Z0ZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMDAwMDAsImV4cCI6MTk5MDUwMDAwMH0.placeholder";
      const validUrl = (typeof url === "string" && url.startsWith("http")) ? url : "https://oohtiefgaelsmvgvtezd.supabase.co";
      client = createClient(validUrl, key);
    }
    const val = Reflect.get(client, prop, receiver);
    return typeof val === "function" ? val.bind(client) : val;
  }
});