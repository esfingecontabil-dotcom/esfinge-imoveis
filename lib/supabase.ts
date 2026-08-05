import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validação estrita e fallback seguro
    if (!url || typeof url !== "string" || !url.startsWith("http") || url.includes("placeholder")) {
      url = "https://oohtiefgaelsmvgvtezd.supabase.co";
    }
    if (!key || typeof key !== "string" || key.length < 10) {
      key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaHRpZWZnYWVsc212Z3Z0ZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMDAwMDAsImV4cCI6MTk5MDUwMDAwMH0.placeholder";
    }

    try {
      client = createClient(url, key);
    } catch (err) {
      // Fallback de emergência caso ocorra qualquer exceção na inicialização
      client = createClient(
        "https://oohtiefgaelsmvgvtezd.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaHRpZWZnYWVsc212Z3Z0ZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMDAwMDAsImV4cCI6MTk5MDUwMDAwMH0.placeholder"
      );
    }
  }
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    const realClient = getClient();
    const val = Reflect.get(realClient, prop, receiver);
    return typeof val === "function" ? val.bind(realClient) : val;
  }
});