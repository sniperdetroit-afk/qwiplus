// js/views/adDetail.js

import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { navigate } from "../core/router.js";

let alive = false;

/* ================= RENDER ================= */

async function renderAdDetail(){
  return `
  <section class="ad-page">
    <div id="adContent" class="ad-content"></div>
  </section>
  `;
}

/* ================= MOUNT ================= */

async function mountAdDetail(){

  alive = true;

  const container = document.getElementById("adContent");

  if(!container){
    console.error("❌ adContent not found");
    return;
  }

  const state = getState();

  // ================= GET ID =================

  let adId = state.app?.params?.id;

  if(!adId){
    const path = window.location.pathname;
    if(path.startsWith("/ad/")){
      adId = path.split("/ad/")[1];
    }
  }

  if(adId){
    adId = adId.trim();
  }

  console.log("🔎 AD ID:", adId);

  if(!adId){
    showError(container, "ID inválido");
    return;
  }

  container.innerHTML = "Cargando...";

  try {

    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("id", adId)
      .maybeSingle();

    if(error){
      console.error("❌ Supabase error:", error);
    }

    if(!alive) return;

    // ================= NO EXISTE =================

    if(!data){
      console.warn("⚠️ Anuncio no encontrado:", adId);
      showNotFound(container);
      return;
    }

    console.log("✅ AD LOADED:", data);

    // ================= PROFILE =================

    let profile = null;

    try{
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user_id)
        .maybeSingle();

      profile = p;

    }catch(e){
      console.warn("⚠️ Profile load fail", e);
    }

    renderAd(container, data, profile);
    initChatButton(data);

  } catch (err){
    console.error("💥 AdDetail crash:", err);
    showError(container, "Error cargando anuncio");
  }
}

/* ================= UI STATES ================= */

function showNotFound(container){

  container.innerHTML = `
    <div style="padding:30px;text-align:center">
      <h3>Este anuncio ya no está disponible</h3>
      <p style="color:#666;margin:10px 0;">
        Puede haber sido eliminado o no existe.
      </p>

      <button id="goHomeBtn" class="btn-primary">
        Volver al inicio
      </button>
    </div>
  `;

  const btn = document.getElementById("goHomeBtn");

  if(btn){
    btn.onclick = () => {
      console.log("↩️ Redirect → home");
      navigate("home");
    };
  }

  setTimeout(() => {
    if(alive){
      console.log("⏱ Auto redirect → home");
      navigate("home");
    }
  }, 2500);
}

function showError(container, message){
  container.innerHTML = `
    <div style="padding:30px;text-align:center">
      <p>${message}</p>
    </div>
  `;
}

/* ================= UNMOUNT ================= */

async function unmountAdDetail(){
  alive = false;
}

/* ================= RENDER AD ================= */

function renderAd(container, ad, profile){

  const state = getState();
  const currentUser = state.session?.user;

  const isOwner = currentUser && currentUser.id === ad.user_id;

  const avatar = profile?.avatar_url
    ? `<img src="${profile.avatar_url}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
    : `<div style="width:42px;height:42px;border-radius:50%;background:#10B981;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;flex-shrink:0;">👤</div>`;

  container.innerHTML = `
    <div class="ad-detail">

      <div class="ad-top">
        <button id="backBtn">←</button>
      </div>

      <div class="ad-image-wrapper">
        <img class="ad-img" src="${ad.image_url || ""}">
      </div>

      <div class="ad-body">

        <div class="ad-price">${ad.price || 0}€</div>

        <h2 class="ad-title">${ad.title}</h2>

        <div class="ad-seller" style="display:flex;align-items:center;gap:10px;margin:12px 0;">
          ${avatar}
          <span>${profile?.name || "Usuario"}</span>
        </div>

        <div class="ad-actions">
          ${
            isOwner
              ? `
                <button id="editBtn" class="btn-edit">Editar anuncio</button>
                <button id="deleteBtn" class="btn-delete">Eliminar</button>
              `
              : `
                <button id="buyBtn" class="btn-buy">Comprar</button>
                <button id="offerBtn" class="btn-offer">Hacer oferta</button>
              `
          }
        </div>

        <div class="ad-desc">
          ${ad.description || "Sin descripción"}
        </div>

        ${
          isOwner
            ? ``
            : `<button id="chatBtn" class="chat-btn">Enviar mensaje</button>`
        }

      </div>

    </div>
  `;

  const backBtn = document.getElementById("backBtn");
  if(backBtn) backBtn.onclick = () => history.back();
}

/* ================= CHAT ================= */

async function initChatButton(ad){

  const btn = document.getElementById("chatBtn");
  if(!btn) return;

  btn.onclick = async () => {

    const state = getState();
    const user = state.session?.user;

    if(!user){
      navigate("login");
      return;
    }

    if(user.id === ad.user_id){
      alert("No puedes enviarte mensajes a ti mismo");
      return;
    }

    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("ad_id", ad.id)
      .eq("buyer_id", user.id)
      .eq("seller_id", ad.user_id)
      .maybeSingle();

    let conversationId;

    if(existing){
      conversationId = existing.id;
    } else {

      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          ad_id: ad.id,
          buyer_id: user.id,
          seller_id: ad.user_id,
          last_message: "",
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if(error){
        console.error("❌ Error creando conversación:", error);
        return;
      }

      conversationId = newConv.id;
    }

    navigate("chat", { conversationId });

  };
}

/* ================= EXPORT ================= */

export const AdDetailView = async () => {

  const html = await renderAdDetail();

  return {
    html,
    mount: mountAdDetail,
    unmount: unmountAdDetail
  };

};
