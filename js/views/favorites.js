import { createView } from "../core/createView.js";
import { supabase } from "../services/supabase.js";
import { renderCard } from "../components/card.js";

async function renderFavorites(state) {

  const user = state?.session?.user;

  if (!user) {
    return `
      <section class="page">
        <h2>No has iniciado sesión</h2>
        <button data-view="login">Iniciar sesión</button>
      </section>
    `;
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("ads(*, profiles(name, avatar_url))")
    .eq("user_id", user.id);

  if (error) {
    console.error("Favorites error:", error);
  }

  const ads = data?.map(f => f.ads).filter(Boolean) || [];

  return `
    <section class="page">
      <h2>Favoritos</h2>
      ${
        ads.length === 0
          ? `<p>No tienes favoritos aún</p>`
          : `
            <div class="ads-grid">
              ${ads.map(renderCard).join("")}
            </div>
          `
      }
    </section>
  `;
}

export const FavoritesView = createView(renderFavorites);

