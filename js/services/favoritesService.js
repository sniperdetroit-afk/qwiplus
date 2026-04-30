import { supabase } from "./supabase.js";

export async function toggleFavorite(user_id, ad_id){

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user_id)
    .eq("ad_id", ad_id)
    .maybeSingle();   // 🔥 FIX REAL

  if(existing){

    await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);

    return false;

  }else{

    await supabase
      .from("favorites")
      .insert({
        user_id,
        ad_id
      });

    return true;

  }

}