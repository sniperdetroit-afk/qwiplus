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
    initStatusButtons(data);

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
  const isReservado = ad.status === "reservado";

  const avatar = profile?.avatar_url
    ? `<img src="${profile.avatar_url}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
    : `<div style="width:42px;height:42px;border-radius:50%;background:#10B981;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;flex-shrink:0;">👤</div>`;

  container.innerHTML = `
    <div class="ad-detail">

      <!-- BARRA SUPERIOR -->
      <div class="ad-top" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
        <button id="backBtn" style="background:none;border:none;font-size:22px;cursor:pointer;color:#374151;">←</button>
        <div style="display:flex;align-items:center;gap:14px;">
          ${isOwner ? `
            <button id="editBtn" title="Editar anuncio" style="background:none;border:none;cursor:pointer;font-size:22px;">✏️</button>
          ` : ""}
          <button id="shareBtn" title="Compartir" style="background:none;border:none;cursor:pointer;font-size:22px;">⬆️</button>
        </div>
      </div>

      <!-- IMAGEN CON BADGES -->
<div style="position:relative;">
  <div class="ad-image-wrapper" style="position:relative;overflow:hidden;">
    ${(() => {
      const imgs = (ad.images && ad.images.length > 0) ? ad.images : (ad.image_url ? [ad.image_url] : []);
      if (imgs.length === 0) return `<div style="width:100%;aspect-ratio:1;background:#1a1f2e;"></div>`;
      if (imgs.length === 1) return `<img class="ad-img" src="${imgs[0]}" style="${isVendido ? 'opacity:0.7;' : ''}">`;
      return `
        <div id="imgCarousel" style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-ms-overflow-style:none;">
          <style>#imgCarousel::-webkit-scrollbar{display:none}</style>
          ${imgs.map(url => `
            <div style="min-width:100%;scroll-snap-align:start;">
              <img src="${url}" style="width:100%;aspect-ratio:1;object-fit:cover;${isVendido ? 'opacity:0.7;' : ''}">
            </div>
          `).join("")}
        </div>
        <div style="display:flex;justify-content:center;gap:6px;padding:8px 0;background:rgba(0,0,0,0.3);position:absolute;bottom:0;width:100%;">
          ${imgs.map((_, i) => `
            <div class="img-dot" data-index="${i}" style="
              width:${i === 0 ? '20px' : '8px'};height:8px;
              border-radius:999px;
              background:${i === 0 ? '#38BDF8' : 'rgba(255,255,255,0.4)'};
              transition:all 0.3s;cursor:pointer;
            "></div>
          `).join("")}
        </div>
      `;
    })()}
  </div>
        ${isVendido ? `
          <div style="
            position:absolute;top:12px;left:12px;
            background:#ef4444;color:white;
            padding:6px 14px;border-radius:999px;
            font-size:13px;font-weight:800;
            box-shadow:0 4px 12px rgba(239,68,68,0.4);
          ">VENDIDO</div>
        ` : isReservado ? `
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

        <h2 class="ad-title">${ad.title}</h2>

        <div class="ad-price" style="${isVendido ? "text-decoration:line-through;color:#9ca3af;" : ""}">
          ${ad.price || 0}€
        </div>

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

        <!-- ACCIONES COMPRADOR -->
        ${!isOwner && !isVendido ? `
          <div style="display:flex;gap:10px;margin-top:8px;">
            <button id="buyBtn" style="
              flex:1;padding:14px;border-radius:14px;border:none;
              background:linear-gradient(135deg,#e0e7ff,#c7d2fe);
              color:#4338ca;font-weight:700;font-size:15px;cursor:pointer;
              position:relative;opacity:0.85;
            ">
              🛒 Comprar
              <span style="
                position:absolute;top:-8px;right:-8px;
                background:#6366f1;color:white;
                font-size:10px;font-weight:700;
                padding:2px 7px;border-radius:999px;
              "></span>
            </button>
            <button id="offerBtn" style="
              flex:1;padding:14px;border-radius:14px;border:none;
              background:linear-gradient(135deg,#fef3c7,#fde68a);
              color:#92400e;font-weight:700;font-size:15px;cursor:pointer;
              position:relative;opacity:0.85;
            ">
              🏷️ Hacer oferta
              <span style="
                position:absolute;top:-8px;right:-8px;
                background:#f59e0b;color:white;
                font-size:10px;font-weight:700;
                padding:2px 7px;border-radius:999px;
              "></span>
            </button>
          </div>
        ` : ""}

        <!-- ARTÍCULO VENDIDO -->
        ${isVendido && !isOwner ? `
          <div style="
            width:100%;padding:14px;text-align:center;margin-top:8px;
            background:#fef2f2;border-radius:14px;
            color:#ef4444;font-weight:700;font-size:15px;
          ">
            Este artículo ya está vendido
          </div>
        ` : ""} 

        <!-- AVISO RESERVADO (para otros) -->
        ${!isOwner && isReservado ? `
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

        <!-- BOTONES DEL DUEÑO -->
        ${isOwner ? `
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">

            ${!isVendido && !isReservado ? `
              <button id="reserveBtn" style="
                width:100%;padding:12px;background:#f59e0b;
                border:none;border-radius:14px;color:#fff;
                font-size:14px;font-weight:600;cursor:pointer;">
                🔒 Marcar como reservado
              </button>
              <button id="soldBtn" style="
                width:100%;padding:12px;background:#ef4444;
                border:none;border-radius:14px;color:#fff;
                font-size:14px;font-weight:600;cursor:pointer;">
                ✅ Marcar como vendido
              </button>
            ` : ""}

            ${isReservado ? `
              <button id="unreserveBtn" style="
                width:100%;padding:12px;background:#6b7280;
                border:none;border-radius:14px;color:#fff;
                font-size:14px;font-weight:600;cursor:pointer;">
                🔓 Quitar reserva
              </button>
              <button id="soldBtn" style="
                width:100%;padding:12px;background:#ef4444;
                border:none;border-radius:14px;color:#fff;
                font-size:14px;font-weight:600;cursor:pointer;">
                ✅ Marcar como vendido
              </button>
            ` : ""}

            ${isVendido ? `
              <button id="reactivateBtn" style="
                width:100%;padding:12px;background:#10b981;
                border:none;border-radius:14px;color:#fff;
                font-size:14px;font-weight:600;cursor:pointer;">
                ↩️ Reactivar anuncio
              </button>
            ` : ""}

            <button id="deleteBtn" style="
              width:100%;padding:12px;background:#fef2f2;
              border:1.5px solid #fecaca;border-radius:14px;color:#ef4444;
              font-size:14px;font-weight:600;cursor:pointer;">
              🗑️ Eliminar anuncio
            </button>

          </div>
        ` : ""}

        <div class="ad-desc" style="margin-top:14px;">${ad.description || "Sin descripción"}</div>

        ${!isOwner && !isVendido ? `<button id="chatBtn" class="chat-btn">Enviar mensaje</button>` : ""}

        <!-- REPORTAR -->
        ${!isOwner && currentUser ? `
          <div style="margin-top:10px;">
            <button id="reportBtn" style="
              width:100%;padding:12px;
              background:none;border:1.5px solid #e5e7eb;
              border-radius:14px;color:#9ca3af;
              font-size:14px;font-weight:600;cursor:pointer;">⚑ Reportar anuncio</button>
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
    // Carrusel
  const carousel = document.getElementById("imgCarousel");
  if (carousel) {
    const dots = document.querySelectorAll(".img-dot");
    carousel.addEventListener("scroll", () => {
      const index = Math.round(carousel.scrollLeft / carousel.offsetWidth);
      dots.forEach((dot, i) => {
        dot.style.width = i === index ? "20px" : "8px";
        dot.style.background = i === index ? "#38BDF8" : "rgba(255,255,255,0.4)";
      });
    });
    dots.forEach(dot => {
      dot.onclick = () => {
        carousel.scrollTo({ left: Number(dot.dataset.index) * carousel.offsetWidth, behavior: "smooth" });
      };
    });
  }

  // Toast próximamente
  const showToast = (msg) => {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
      background:#1e1b4b;color:white;padding:12px 24px;
      border-radius:999px;font-size:14px;font-weight:600;
      box-shadow:0 8px 24px rgba(0,0,0,0.2);z-index:9999;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const buyBtn = document.getElementById("buyBtn");
  if(buyBtn) buyBtn.onclick = () => showToast("🚀 Próximamente disponible");

  const offerBtn = document.getElementById("offerBtn");
  if(offerBtn) offerBtn.onclick = () => showToast("🚀 Próximamente disponible");

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
    const reactivateBtn = document.getElementById("reactivateBtn");
  if(reactivateBtn){
    reactivateBtn.onclick = async () => {
      const ok = confirm("¿Reactivar este anuncio? Volverá a estar disponible para la venta.");
      if(!ok) return;
      const { error } = await supabase
        .from("ads")
        .update({ sold: false, sold_to: null, sale_confirmed_by_buyer: false })
        .eq("id", ad.id);
      if(error){ alert("Error: " + error.message); return; }
      alert("✓ Anuncio reactivado. Vuelve a estar disponible.");
      location.reload();
    };
  }

  const reserveBtn = document.getElementById("reserveBtn");
  if(reserveBtn){
    reserveBtn.onclick = async () => {
      const ok = confirm("¿Marcar este anuncio como reservado?");
      if(!ok) return;
      const { error } = await supabase
        .from("ads")
        .update({ reserved: true })
        .eq("id", ad.id);
      if(error){ alert("Error: " + error.message); return; }
      alert("✓ Anuncio marcado como reservado.");
      location.reload();
    };
  }

  const unreserveBtn = document.getElementById("unreserveBtn");
  if(unreserveBtn){
    unreserveBtn.onclick = async () => {
      const ok = confirm("¿Quitar la reserva del anuncio?");
      if(!ok) return;
      const { error } = await supabase
        .from("ads")
        .update({ reserved: false, reserved_by: null })
        .eq("id", ad.id);
      if(error){ alert("Error: " + error.message); return; }
      alert("✓ Reserva eliminada.");
      location.reload();
    };
  }

  const soldBtn = document.getElementById("soldBtn");
  if(soldBtn){
    soldBtn.onclick = async () => {
      const ok = confirm("¿Marcar este anuncio como vendido?\n\nNota: Si lo vendiste a un usuario concreto, es mejor marcarlo desde el chat para que pueda valorarte.");
      if(!ok) return;
      const { error } = await supabase
        .from("ads")
        .update({ sold: true })
        .eq("id", ad.id);
      if(error){ alert("Error: " + error.message); return; }
      alert("✓ Anuncio marcado como vendido.");
      location.reload();
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

/* ================= STATUS BUTTONS ================= */

async function initStatusButtons(ad){

  const reserveBtn = document.getElementById("reserveBtn");
  const unreserveBtn = document.getElementById("unreserveBtn");
  const soldBtn = document.getElementById("soldBtn");
  const reactivateBtn = document.getElementById("reactivateBtn");

  const updateStatus = async (newStatus, confirmMsg) => {
    const ok = confirm(confirmMsg);
    if(!ok) return;

    const { error } = await supabase
      .from("ads")
      .update({ status: newStatus })
      .eq("id", ad.id); 

    if(error){ alert("Error: " + error.message); return; }

    ad.status = newStatus;
    const container = document.getElementById("adContent");

    let profile = null;
    try {
      const { data: p } = await supabase
        .from("profiles").select("*").eq("id", ad.user_id).maybeSingle();
      profile = p;
    } catch(e){}

    renderAd(container, ad, profile);
    initStatusButtons(ad);
    initChatButton(ad);
    initReportButton(ad);
    initShareButton(ad);
  };

  if(reserveBtn){
    reserveBtn.onclick = () => updateStatus("reservado", "¿Marcar este anuncio como reservado?");
  }

  if(unreserveBtn){
    unreserveBtn.onclick = () => updateStatus("activo", "¿Quitar la reserva de este anuncio?");
  }

  if(soldBtn){
    soldBtn.onclick = () => updateStatus("vendido", "¿Marcar este anuncio como VENDIDO? Ya no será visible para compradores.");
  }

  if(reactivateBtn){
    reactivateBtn.onclick = () => updateStatus("activo", "¿Reactivar este anuncio?");
  }
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
        shareBtn.textContent = "✅";
        setTimeout(() => { shareBtn.innerHTML = "⬆️"; }, 2000);
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
