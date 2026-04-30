import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://nsxbrrocytxthqnltrjg.supabase.co";
const supabaseKey = "sb_publishable_k2htxSm1QZ-qTRuj5evLvQ_fSMM_iji";

export const supabase = createClient(supabaseUrl, supabaseKey);