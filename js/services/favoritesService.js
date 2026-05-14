import { supabase } from "./supabase.js";

export async function toggleFavorite(user_id, ad_id){

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user_id)
    .eq("ad_id", ad_id)
    .maybeSingle();

  if(existing){

    await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);

    // Decrementa contador en ads
    const { data: ad } = await supabase
      .from("ads")
      .select("favorites_count")
      .eq("id", ad_id)
      .single();

    await supabase
      .from("ads")
      .update({ favorites_count: Math.max(0, (ad?.favorites_count || 1) - 1) })
      .eq("id", ad_id);

    return false;

  }else{

    await supabase
      .from("favorites")
      .insert({ user_id, ad_id });

    // Incrementa contador en ads
    const { data: ad } = await supabase
      .from("ads")
      .select("favorites_count")
      .eq("id", ad_id)
      .single();

    await supabase
      .from("ads")
      .update({ favorites_count: (ad?.favorites_count || 0) + 1 })
      .eq("id", ad_id);

    return true;

  }

}



