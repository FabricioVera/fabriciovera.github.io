import { createClient } from "@supabase/supabase-js";

// Idealmente, estas variables de entorno van en tu .env
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
