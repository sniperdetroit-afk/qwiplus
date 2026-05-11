// js/views/adDetail.js

import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { navigate } from "../core/router.js";

let alive = false;

async function renderAdDetail(){
  return `
  <section class="ad-page">
    <div id="adContent" class="ad-content"></div>
  </section>
  `;
}

async function mountAdDetail(){

  alive = true;

  const container = document.getElementById("adContent");
  if(!container) return;

  const state = getState();
  let adId = state.app?.params?.id;

  if(!adId){
    const path = window.location.pathname;
    if(path.startsWith("/ad/")) adId = path.split("/ad/")[1];
  }

  if(adId) adId = adId.trim();
  if(!adId){ showError(container, "ID inválido"); return; }

  container.innerHTML = "Cargando...";

  try {

    const { data, error } = await supabase
      .from("ads").select("*").eq("id", adId).maybeSingle();

    if(error) console.error("❌ Supabase error:", error);
    if(!alive) return;

    if(!data){ showNotFound(container); return; }

    let profile = null;
    try{
      const { data: p } = await supabase
        .from("profiles").select("*").eq("id", data.user_id).maybeSingle();
      profile = p;
    }catch(e){}

    renderAd(container, data, profile);
    initChatButton(data);

  } catch(err){
    showError(container, "Error cargando anuncio");
  }
}

function showNotFound(container){
  container.innerHTML = `
    <div style="padding:30px;text-align:center">
      <h3>Este anuncio ya no está disponible</h3>
      <p style="color:#666;margin:10px 0;">Puede haber sido eliminado o no existe.</p>
      <button id="goHomeBtn" class="btn-primary">Volver al inicio</button>
    </div>
  `;
  const btn = document.getElementById("goHomeBtn");
  if(btn) btn.onclick = () => navigate("home");
  setTimeout(() => { if(alive) navigate("home"); }, 2500);
}

function showError(container, message){
  container.innerHTML = `<div style="padding:30px;text-align:center"><p>${message}</p></div>`;
}

async function unmountAdDetail(){ alive = false; }

function renderAd(container, ad, profile){

  const state = getState();
  const currentUser = state.session?.user;
  const isOwner = currentUser && currentUser.id === ad.user_id;
  const isVendido = ad.status === "vendido";

  const avatar = profile?.avatar_url
    ? `<img src="${profile.avatar_url}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
    : `<div style="width:42px;height:42px;border-radius:50%;background:#10B981;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;flex-shrink:0;">👤</div>`;

  container.innerHTML = `
    <div class="ad-detail">

      <div class="ad-top">
        <button id="backBtn">←</button>
      </div>

      <!-- IMAGEN CON BADGE VENDIDO -->
      <div style="position:relative;">
        <div class="ad-image-wrapper">
          <img class="ad-img" src="${ad.image_url || ""}">
        </div>
        ${isVendido ? `
          <div style="
            position:absolute;top:12px;left:12px;
            background:#ef4444;color:white;
            padding:6px 14px;border-radius:999px;
            font-size:13px;font-weight:800;
            box-shadow:0 4px 12px rgba(239,68,68,0.4);
          ">VENDIDO</div>
        ` : ""}
      </div>

      <div class="ad-body">

        <div class="ad-price" style="${isVendido ? "text-decoration:line-through;color:#9ca3af;" : ""}">
          ${ad.price || 0}€
        </div>

        <h2 class="ad-title">${ad.title}</h2>

        <!-- VENDEDOR -->
        <div id="sellerBtn" style="
          display:flex;align-items:center;gap:10px;
          margin:12px 0;padding:12px;
          background:#f8fafc;border-radius:14px;
          cursor:pointer;
        ">
          ${avatar}
          <div style="flex:1;">
            <div style="font-weight:600;font-size:15px;color:#111827;">
              ${profile?.name || "Usuario"}
            </div>
            <div style="font-size:12px;color:#6b7280;">Ver perfil →</div>
          </div>
          <span style="color:#9ca3af;font-size:20px;">›</span>
        </div>

        <div class="ad-actions">
          ${isOwner
            ? `
              <button id="editBtn" class="btn-edit">Editar anuncio</button>
              <button id="deleteBtn" class="btn-delete">Eliminar</button>
            `
            : isVendido
            ? `
              <div style="
                width:100%;padding:14px;text-align:center;
                background:#fef2f2;border-radius:14px;
                color:#ef4444;font-weight:700;font-size:15px;
              ">
                Este artículo ya está vendido
              </div>
            `
            : `
              <button id="buyBtn" class="btn-buy">Comprar</button>
              <button id="offerBtn" class="btn-offer">Hacer oferta</button>
            `
          }
        </div>

        <div class="ad-desc">${ad.description || "Sin descripción"}</div>

        ${isOwner || isVendido ? `` : `<button id="chatBtn" class="chat-btn">Enviar mensaje</button>`}

      </div>
    </div>
  `;

  const backBtn = document.getElementById("backBtn");
  if(backBtn) backBtn.onclick = () => history.back();

  const sellerBtn = document.getElementById("sellerBtn");
  if(sellerBtn) sellerBtn.onclick = () => navigate("publicProfile", { userId: ad.user_id });

  const editBtn = document.getElementById("editBtn");
  if(editBtn) editBtn.onclick = () => navigate("editAd", { id: ad.id });

  const deleteBtn = document.getElementById("deleteBtn");
  if(deleteBtn){
    deleteBtn.onclick = async () => {
      const ok = confirm("¿Eliminar este anuncio?");
      if(!ok) return;
      await supabase.from("ads").delete().eq("id", ad.id);
      navigate("profile");
    };
  }
}

async function initChatButton(ad){

  const btn = document.getElementById("chatBtn");
  if(!btn) return;

  btn.onclick = async () => {

    const state = getState();
    const user = state.session?.user;

    if(!user){ navigate("login"); return; }
    if(user.id === ad.user_id){ alert("No puedes enviarte mensajes a ti mismo"); return; }

    const { data: existing } = await supabase
      .from("conversations").select("*")
      .eq("ad_id", ad.id).eq("buyer_id", user.id).eq("seller_id", ad.user_id)
      .maybeSingle();

    let conversationId;

    if(existing){
      conversationId = existing.id;
    } else {
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          ad_id: ad.id, buyer_id: user.id, seller_id: ad.user_id,
          last_message: "", last_message_at: new Date().toISOString()
        }).select().single();

      if(error){ console.error("❌ Error creando conversación:", error); return; }
      conversationId = newConv.id;
    }

    navigate("chat", { conversationId });
  };
}

export const AdDetailView = async () => {
  const html = await renderAdDetail();
  return { html, mount: mountAdDetail, unmount: unmountAdDetail };
};


