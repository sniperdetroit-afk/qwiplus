// js/views/user.js

import { supabase } from "../services/supabase.js";
import { renderCard } from "../components/card.js";

export async function renderUser(state){

  const userId = state?.params?.id;

  if(!userId){
    return `<section class="profile-page">Usuario no encontrado</section>`;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending:false });

  let avatarHtml;

  if(profile?.avatar_url){
    avatarHtml = `
      <div class="avatar avatar-lg">
        <img src="${profile.avatar_url}">
      </div>
    `;
  }else{
    avatarHtml = `
      <div class="avatar avatar-lg">
        <div class="avatar-placeholder">👤</div>
      </div>
    `;
  }

  return `
    <section class="profile-page">

      ${avatarHtml}

      <h2>${profile?.name || "Usuario"}</h2>

      <div class="ads-grid">
        ${(ads || []).map(renderCard).join("")}
      </div>

    </section>
  `;
}

export function initUser(){}