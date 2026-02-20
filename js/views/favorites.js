import { supabase } from "../services/supabase.js";

/* =========================
   RENDER VIEW
========================= */

export function renderFavorites() {
  return `
    <div class="section">
      <h2>Favoritos</h2>
      <div id="favorites-list">
        <p>Cargando favoritos...</p>
      </div>
    </div>
  `;
}

/* =========================
   TOGGLE FAVORITE
========================= */

export async function toggleFavorite(userId, adId) {
  const { data } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .eq("ad_id", adId);

  if (data.length > 0) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("ad_id", adId);
  } else {
    await supabase
      .from("favorites")
      .insert([{ user_id: userId, ad_id: adId }]);
  }
}