import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://sieqpkxbkfekprjgmgsv.supabase.co";
const supabaseKey = "sb_publishable_jSLNITGhjKPgPRK6SOIbxw_DrQ-T9jF";

export const supabase = createClient(supabaseUrl, supabaseKey);