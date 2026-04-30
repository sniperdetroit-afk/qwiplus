// js/views/profile.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { getState, setState } from "../core/state.js";

let user = null;

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

        <h1>Perfil</h1>

        <div class="profile-empty">
          <p>No estás logueado</p>
          <button id="goLogin" class="btn-primary">Iniciar sesión</button>
        </div>

      </section>
    `;
  }

  return `
  <section class="profile-page">

    <div class="profile-top">
      <button id="backProfileBtn">← Volver</button>
    </div>

    <div class="profile-header">
      <div class="avatar avatar-lg">
        <div class="avatar-placeholder">👤</div>
      </div>
      <h2>${user.email}</h2>
    </div>

    <div class="profile-card">
      <span>Email</span>
      <strong>${user.email}</strong>
    </div>

    <div class="profile-actions">
      <button id="editProfile" class="btn-primary">Editar perfil</button>
      <button id="logoutBtn" class="btn-danger">Cerrar sesión</button>
    </div>

    <!-- 🔥 MIS ANUNCIOS -->
    <div class="my-ads-section">
      <h3>Mis anuncios</h3>

      <div id="myAdsContainer" class="ads-grid"></div>

    </div>

  </section>
  `;
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

  const logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn){
    logoutBtn.onclick = async () => {

      await supabase.auth.signOut();

      setState({
        session:{ user:null }
      });

      navigate("home");
    };
  }

  /* ================= MIS ANUNCIOS ================= */

  const container = document.getElementById("myAdsContainer");

  // ⏳ esperar a que el user esté listo
  let attempts = 0;
  let userReady = null;

  while(attempts < 10){
    const state = getState();
    userReady = state.session?.user;

    if(userReady) break;

    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  if(!userReady){
    console.log("❌ user no disponible");
    return;
  }

  if(!container) return;

  // ✅ query segura
  const { data } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", userReady.id)
    .order("created_at", { ascending:false });

  // 🔍 DEBUG
  console.log("USER ID:", userReady.id);
  console.log("ADS:", data);

  if(!data || data.length === 0){
    container.innerHTML = "<p>No tienes anuncios</p>";
    return;
  }

  container.innerHTML = data.map(ad => `
    <div class="card" data-id="${ad.id}">

      <div class="card-image">
        <img src="${ad.image_url || ""}">
      </div>

      <div class="card-info">
        <div class="card-title">${ad.title || ""}</div>
        <div class="price">${ad.price || ""}€</div>
      </div>

      <button class="deleteAd" data-id="${ad.id}">
        🗑
      </button>

    </div>
  `).join("");

  /* DELETE */

  document.querySelectorAll(".deleteAd").forEach(btn => {
    btn.onclick = async (e) => {

      e.stopPropagation();

      const id = btn.dataset.id;

      await supabase
        .from("ads")
        .delete()
        .eq("id", id);

      btn.closest(".card").remove();
    };
  });

}

/* ================= UNMOUNT ================= */

async function unmountProfile(){
  user = null;
}

/* ================= EXPORT ================= */

export const ProfileView = async (state) => {

  const html = await renderProfile(state);

  return {
    html,
    mount: mountProfile,
    unmount: unmountProfile
  };

};