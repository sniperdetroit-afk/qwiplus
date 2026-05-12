// js/views/profile.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { getState, setState } from "../core/state.js";

let user = null;

/* ================= HELPERS ================= */

function getUserName(email = "") {
  return email.split("@")[0] || "Usuario";
}

function getInitials(name = "") {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function getColorFromString(str = "") {
  const colors = [
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
    "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
    "#6366F1", "#84CC16", "#06B6D4", "#A855F7"
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getFallbackAvatar(email = "") {
  const name = getUserName(email);
  const initials = getInitials(name);
  const color = getColorFromString(email);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${color}"/>
      <text x="50%" y="50%" dy=".1em"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="90" font-weight="600" fill="white"
        text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getAvatarUrl(user) {
  return user?.user_metadata?.avatar_url || getFallbackAvatar(user?.email || "");
}

/* ================= RENDER ================= */

async function renderProfile(){

  const state = getState();
  user = state.session?.user;

  if(!user){
    return `
      <section class="profile-page">
        <div class="profile-top">
          <button id="backProfileBtn">← Volver</button>
        </div>
        <div class="profile-empty">
          <h1>Perfil</h1>
          <p>No estás logueado</p>
          <button id="goLogin" class="btn-primary">Iniciar sesión</button>
        </div>
      </section>
    `;
  }

  let profile = {};
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = data || {};
  } catch(e) {}

  const displayName = profile.name || getUserName(user.email);
  const avatarUrl = profile.avatar_url || getAvatarUrl(user);
  const location = profile.location ? `📍 ${profile.location}` : "";

  return `
    <section class="profile-page">

      <div class="profile-top">
        <button id="backProfileBtn" class="profile-back">← Volver</button>
      </div>

      <div class="profile-pro-header">

        <button id="avatarUploadBtn" class="profile-avatar avatar-upload-btn" type="button">
          <img id="profileAvatarImg" src="${avatarUrl}" alt="Avatar de ${displayName}">
          <span class="avatar-edit-badge">📷</span>
        </button>

        <input id="avatarInput" type="file" accept="image/*" hidden>

        <div class="profile-user-info">
          <h1>${displayName}</h1>
          ${location ? `<p style="color:#6b7280;font-size:14px;margin:2px 0 8px;">${location}</p>` : ""}
          <div class="profile-badge">
            <span>Verificado por Qwiplus</span>
          </div> <button id="logoutBtn" class="btn-danger">Cerrar sesión</button>
        </div>

      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <strong id="adsCount">0</strong>
          <span>Anuncios</span>
        </div>
        <div class="profile-stat">
          <strong id="likesCount">0</strong>
          <span>Favoritos recibidos</span>
        </div>
        <div class="profile-stat">
          <strong>Activo</strong>
          <span>Estado</span>
        </div>
      </div>

      <div class="profile-actions">
        <button id="editProfile" class="btn-primary">Editar perfil</button>
      </div>

        <div class="my-ads-section">
        <div class="section-title-row">
                  <h2>Mis anuncios</h2>
          <button id="publishFromProfile" class="btn-primary small">Publicar</button>
        </div>
        <div id="myAdsContainer" class="ads-grid"></div>
      </div>

    </section>
  `;
}

/* ================= AVATAR UPLOAD ================= */

async function uploadAvatar(file){

  if(!user || !file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if(!allowedTypes.includes(file.type)){
    alert("Solo puedes subir imágenes JPG, PNG o WEBP");
    return;
  }

  const maxSize = 3 * 1024 * 1024;
  if(file.size > maxSize){
    alert("La imagen es demasiado grande. Máximo 3MB");
    return;
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const avatarImg = document.getElementById("profileAvatarImg");
  const oldSrc = avatarImg?.src;

  if(avatarImg){
    avatarImg.src = URL.createObjectURL(file);
  }

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true
    });

  if(uploadError){
    console.error("AVATAR UPLOAD ERROR:", uploadError);
    alert(uploadError.message);
    if(avatarImg && oldSrc) avatarImg.src = oldSrc;
    return;
  }

  const { data: publicData } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;

  const { data, error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });

  if(updateError){
    console.error("AVATAR UPDATE ERROR:", updateError);
    alert(updateError.message);
    return;
  }

  user = data.user;

  const currentState = getState();
  setState({ ...currentState, session: { user } });

  if(avatarImg) avatarImg.src = publicUrl;

  // ✅ Sincronizar en tabla profiles
  await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      avatar_url: publicUrl
    });
}

/* ================= MOUNT ================= */

async function mountProfile(){

  const state = getState();
  user = state.session?.user;

  const backBtn = document.getElementById("backProfileBtn");
  if(backBtn) backBtn.onclick = () => navigate("profileMenu");

  const loginBtn = document.getElementById("goLogin");
  if(loginBtn) loginBtn.onclick = () => navigate("login");

  const editBtn = document.getElementById("editProfile");
  if(editBtn) editBtn.onclick = () => navigate("editProfile");

  const publishBtn = document.getElementById("publishFromProfile");
  if(publishBtn) publishBtn.onclick = () => navigate("publish");

  const avatarBtn = document.getElementById("avatarUploadBtn");
  const avatarInput = document.getElementById("avatarInput");

  if(avatarBtn && avatarInput){
    avatarBtn.onclick = () => avatarInput.click();
    avatarInput.onchange = async () => {
      const file = avatarInput.files?.[0];
      if(!file) return;
      await uploadAvatar(file);
      avatarInput.value = "";
    };
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn){
    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      setState({ session:{ user:null }, guest:false });
      navigate("login");
    };
  }

  const container = document.getElementById("myAdsContainer");
  if(!container || !user) return;

  container.innerHTML = `<p style="text-align:center">Cargando tus anuncios...</p>`;

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending:false });

  if(error){
    console.error("PROFILE ADS ERROR:", error);
    container.innerHTML = "<p>Error cargando tus anuncios</p>";
    return;
  }

  const ads = data || [];

  const adsCount = document.getElementById("adsCount");
  const likesCount = document.getElementById("likesCount");

  if(adsCount) adsCount.textContent = ads.length;

  const totalLikes = ads.reduce((sum, ad) => {
    return sum + Number(ad.favorites_count || 0);
  }, 0);

  if(likesCount) likesCount.textContent = totalLikes;

  if(ads.length === 0){
    container.innerHTML = `
      <div class="profile-no-ads">
        <p>No tienes anuncios todavía</p>
        <button class="btn-primary" data-view="publish">Publicar mi primer anuncio</button>
      </div>
    `;
    return;
  }

  container.innerHTML = ads.map(ad => `
    <div class="card profile-ad-card" data-id="${ad.id}">
      <div class="card-image">
        <img src="${ad.image_url || "/img/placeholder.png"}" alt="${ad.title || "Anuncio"}">
      </div>
      <div class="card-info">
        <div class="card-title">${ad.title || ""}</div>
        <div class="card-bottom">
          <div class="price">${ad.price || 0}€</div>
          <div class="favorite-counter">
            ❤️ <span>${ad.favorites_count || 0}</span>
          </div>
        </div>
      </div>
      <div class="profile-card-actions">
        <button class="editAdBtn" data-id="${ad.id}">Editar</button>
        <button class="deleteAd" data-id="${ad.id}">🗑</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".profile-ad-card").forEach(card => {
    card.onclick = (e) => {
      if(e.target.closest("button")) return;
      navigate("adDetail", { id: card.dataset.id });
    };
  });

  document.querySelectorAll(".editAdBtn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      navigate("editAd", { id: btn.dataset.id });
    };
  });

  document.querySelectorAll(".deleteAd").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const ok = confirm("¿Eliminar este anuncio?");
      if(!ok) return;

      const { error } = await supabase
        .from("ads")
         .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if(error){
        console.error("DELETE AD ERROR:", error);
        alert(error.message);
        return;
      }

      btn.closest(".card").remove();
      const currentAds = Number(adsCount?.textContent || 1);
      if(adsCount) adsCount.textContent = Math.max(currentAds - 1, 0);
    };
  });
}

/* ================= UNMOUNT ================= */

async function unmountProfile(){
  user = null;
}

/* ================= EXPORT ================= */

export const ProfileView = async () => {
  const html = await renderProfile();
  return {
    html,
    mount: mountProfile,
    unmount: unmountProfile
  };
};