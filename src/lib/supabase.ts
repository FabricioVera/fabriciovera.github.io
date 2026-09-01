import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ [Supabase] Variables de entorno PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY no encontradas.");
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

