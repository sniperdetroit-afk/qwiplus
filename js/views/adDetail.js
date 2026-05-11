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
    initReportButton(data);
    initShareButton(data);
    initReserveButton(data);

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
  const isReserved = ad.reserved === true;
  const isReservedByMe = currentUser && ad.reserved_by === currentUser.id;

  const avatar = profile?.avatar_url
    ? `<img src="${profile.avatar_url}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
    : `<div style="width:42px;height:42px;border-radius:50%;background:#10B981;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;flex-shrink:0;">👤</div>`;

  container.innerHTML = `
    <div class="ad-detail">

      <div class="ad-top">
        <button id="backBtn">←</button>
      </div>

      <!-- IMAGEN CON BADGES -->
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
        ` : isReserved ? `
          <div style="
            position:absolute;top:12px;left:12px;
            background:#f59e0b;color:white;
            padding:6px 14px;border-radius:999px;
            font-size:13px;font-weight:800;
            box-shadow:0 4px 12px rgba(245,158,11,0.4);
          ">RESERVADO</div>
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

        <!-- RESERVADO INFO -->
        ${!isOwner && isReserved ? `
          <div style="margin-top:12px;">
            <div style="
              width:100%;padding:12px;text-align:center;
              background:#fef9c3;border-radius:14px;
              color:#92400e;font-weight:600;font-size:14px;
            ">
              🔒 Este anuncio está reservado
            </div>
          </div>
        ` : ""}

        <!-- BOTÓN RESERVAR (solo si no es dueño y no está reservado) -->
        ${!isOwner && !isVendido && !isReserved ? `
          <div style="margin-top:12px;">
            <button id="reserveBtn" data-id="${ad.id}" style="
              width:100%;padding:12px;background:#f59e0b;
              border:none;border-radius:14px;color:#fff;
              font-size:14px;font-weight:600;cursor:pointer;">
              🔒 Reservar
            </button>
          </div>
        ` : ""}

        <!-- BOTÓN CANCELAR RESERVA (solo el comprador que reservó) -->
        ${isReservedByMe ? `
          <div style="margin-top:12px;">
            <button id="cancelReserveBtn" data-id="${ad.id}" style="
              width:100%;padding:12px;background:#ef4444;
              border:none;border-radius:14px;color:#fff;
              font-size:14px;font-weight:600;cursor:pointer;">
              ❌ Cancelar reserva
            </button>
          </div>
        ` : ""}

        <!-- BOTÓN LIBERAR RESERVA (solo el dueño) -->
        ${isOwner && isReserved ? `
          <div style="margin-top:12px;">
            <button id="ownerCancelReserveBtn" data-id="${ad.id}" style="
              width:100%;padding:12px;background:#6b7280;
              border:none;border-radius:14px;color:#fff;
              font-size:14px;font-weight:600;cursor:pointer;">
              🔓 Liberar reserva
            </button>
          </div>
        ` : ""}

        <!-- COMPARTIR -->
        <div style="margin-top:12px;">
          <button id="shareBtn" style="
            width:100%;padding:12px;
            background:none;border:1.5px solid #e5e7eb;
            border-radius:14px;color:#6b7280;
            font-size:14px;font-weight:600;cursor:pointer;
            display:flex;align-items:center;justify-content:center;gap:8px;
          ">
            🔗 Compartir anuncio
          </button>
        </div>

        <!-- REPORTAR -->
        ${!isOwner && currentUser ? `
          <div style="margin-top:10px;">
            <button id="reportBtn" style="
              width:100%;padding:12px;
              background:none;border:1.5px solid #e5e7eb;
              border-radius:14px;color:#9ca3af;
              font-size:14px;font-weight:600;cursor:pointer;
            ">⚑ Reportar anuncio</button>
          </div>

          <div id="reportForm" style="display:none;margin-top:12px;">
            <div style="
              background:#f8fafc;border-radius:16px;padding:20px;
              border:1.5px solid #e5e7eb;
            ">
              <h4 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111827;">
                ¿Por qué reportas este anuncio?
              </h4>

              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                ${["Spam o publicidad", "Fraude o estafa", "Contenido inapropiado", "Precio abusivo", "Producto ilegal", "Otro"].map(reason => `
                  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                    <input type="radio" name="reportReason" value="${reason}" style="width:18px;height:18px;">
                    <span style="font-size:14px;color:#374151;">${reason}</span>
                  </label>
                `).join("")}
              </div>

              <button id="submitReport" style="
                width:100%;padding:12px;
                background:linear-gradient(135deg,#ef4444,#dc2626);
                color:white;border:none;border-radius:12px;
                font-size:15px;font-weight:700;cursor:pointer;
              ">Enviar reporte</button>

              <button id="cancelReport" style="
                width:100%;padding:10px;margin-top:8px;
                background:none;border:none;
                color:#9ca3af;font-size:14px;cursor:pointer;
              ">Cancelar</button>
            </div>
          </div>
        ` : ""}

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

  const reportBtn = document.getElementById("reportBtn");
  const reportForm = document.getElementById("reportForm");
  const cancelReport = document.getElementById("cancelReport");

  if(reportBtn){
    reportBtn.onclick = () => {
      reportForm.style.display = "block";
      reportBtn.style.display = "none";
    };
  }

  if(cancelReport){
    cancelReport.onclick = () => {
      reportForm.style.display = "none";
      reportBtn.style.display = "block";
    };
  }
}

async function initReserveButton(ad){

  const state = getState();
  const user = state.session?.user;
  if(!user) return;

  const reserveBtn = document.getElementById("reserveBtn");
  const cancelReserveBtn = document.getElementById("cancelReserveBtn");
  const ownerCancelReserveBtn = document.getElementById("ownerCancelReserveBtn");

  if(reserveBtn){
    reserveBtn.onclick = async () => {
      const ok = confirm("¿Reservar este anuncio?");
      if(!ok) return;

      reserveBtn.disabled = true;
      reserveBtn.textContent = "Reservando...";

      const { error } = await supabase
        .from("ads")
        .update({ reserved: true, reserved_by: user.id })
        .eq("id", ad.id);

      if(error){
        alert("Error: " + error.message);
        reserveBtn.disabled = false;
        reserveBtn.textContent = "🔒 Reservar";
        return;
      }

      navigate("adDetail", { id: ad.id });
    };
  }

  const cancelReserve = async () => {
    const { error } = await supabase
      .from("ads")
      .update({ reserved: false, reserved_by: null })
      .eq("id", ad.id);

    if(error){ alert("Error: " + error.message); return; }
    navigate("adDetail", { id: ad.id });
  };

  if(cancelReserveBtn) cancelReserveBtn.onclick = cancelReserve;
  if(ownerCancelReserveBtn) ownerCancelReserveBtn.onclick = cancelReserve;
}

function initShareButton(ad){
  const shareBtn = document.getElementById("shareBtn");
  if(!shareBtn) return;

  shareBtn.onclick = async () => {
    const url = `https://qwiplus.vercel.app/ad/${ad.id}`;
    const title = ad.title || "Mira este anuncio en Qwiplus";
    const text = `${title} — ${ad.price || 0}€`;

    if(navigator.share){
      try {
        await navigator.share({ title, text, url });
      } catch(e) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        shareBtn.textContent = "✅ Enlace copiado";
        setTimeout(() => { shareBtn.innerHTML = "🔗 Compartir anuncio"; }, 2000);
      } catch(e) {
        alert("Copia este enlace: " + url);
      }
    }
  };
}

async function initReportButton(ad){

  const submitReport = document.getElementById("submitReport");
  if(!submitReport) return;

  const state = getState();
  const user = state.session?.user;
  if(!user) return;

  submitReport.onclick = async () => {

    const selected = document.querySelector('input[name="reportReason"]:checked');
    if(!selected){ alert("Selecciona un motivo"); return; }

    submitReport.disabled = true;
    submitReport.textContent = "Enviando...";

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      ad_id: ad.id,
      reason: selected.value
    });

    if(error){
      if(error.code === "23505"){
        document.getElementById("reportForm").innerHTML = `
          <div style="padding:16px;text-align:center;background:#fef2f2;border-radius:14px;">
            <p style="color:#ef4444;font-weight:600;">Ya has reportado este anuncio anteriormente.</p>
          </div>
        `;
      } else {
        alert("Error: " + error.message);
        submitReport.disabled = false;
        submitReport.textContent = "Enviar reporte";
      }
      return;
    }

    document.getElementById("reportForm").innerHTML = `
      <div style="padding:16px;text-align:center;background:#f0fdf4;border-radius:14px;">
        <div style="font-size:28px;">✅</div>
        <p style="color:#16a34a;font-weight:700;margin:8px 0 0;">Reporte enviado. Lo revisaremos pronto.</p>
      </div>
    `;
  };
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


async function initReportButton(ad){

  const submitReport = document.getElementById("submitReport");
  if(!submitReport) return;

  const state = getState();
  const user = state.session?.user;
  if(!user) return;

  submitReport.onclick = async () => {

    const selected = document.querySelector('input[name="reportReason"]:checked');
    if(!selected){ alert("Selecciona un motivo"); return; }

    submitReport.disabled = true;
    submitReport.textContent = "Enviando...";

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      ad_id: ad.id,
      reason: selected.value
    });

    if(error){
      if(error.code === "23505"){
        document.getElementById("reportForm").innerHTML = `
          <div style="padding:16px;text-align:center;background:#fef2f2;border-radius:14px;">
            <p style="color:#ef4444;font-weight:600;">Ya has reportado este anuncio anteriormente.</p>
          </div>
        `;
      } else {
        alert("Error: " + error.message);
        submitReport.disabled = false;
        submitReport.textContent = "Enviar reporte";
      }
      return;
    }

    document.getElementById("reportForm").innerHTML = `
      <div style="padding:16px;text-align:center;background:#f0fdf4;border-radius:14px;">
        <div style="font-size:28px;">✅</div>
        <p style="color:#16a34a;font-weight:700;margin:8px 0 0;">Reporte enviado. Lo revisaremos pronto.</p>
      </div>
    `;
  };
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