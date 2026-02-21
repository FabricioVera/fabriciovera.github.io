import { createClient } from "@supabase/supabase-js";

// Idealmente, estas variables de entorno van en tu .env
const supabaseUrl = "https://lruaxrwfrbeztixxrhai.supabase.co";
const supabaseKey = "sb_publishable_pAaeFqxedGHBzQlVwBaruQ_Fii_jJ44";
export const supabase = createClient(supabaseUrl, supabaseKey);
