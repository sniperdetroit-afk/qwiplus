// js/views/chat.js

import { createView } from "../core/createView.js";
import { startChatSync, stopChatSync } from "../chat/syncEngine.js";
import { supabase } from "../services/supabase.js";
import { getState, setState } from "../core/state.js";
import { navigate } from "../core/router.js";
import { markConversationRead } from "../services/badgeService.js";
import { translate, detectLanguage, getUserLanguage } from "../services/translatorService.js";
import { blockUser, isBlocked } from "../services/blockService.js";
import { reportUser, USER_REPORT_REASONS } from "../services/reportService.js";

let box;
let alive = false;
let userId;
let conversationId;
let rendered = new Set();
let userLang;
let iBlockedOther = false;
let otherBlockedMe = false;

/* ================= AVATAR HELPERS ================= */

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

function avatarHtml(profile, size = 36) {
  if (profile?.avatar_url) {
    return `<img src="${profile.avatar_url}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:50%;">`;
  }
  const name = profile?.name || "?";
  const initials = getInitials(name);
  const color = getColorFromString(name);
  return `
    <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${Math.floor(size * 0.4)}px;font-weight:700;">
      ${initials}
    </div>
  `;
}

/* ================= RENDER ================= */

async function render(){
  return `
  <section class="chat-page">
    <div class="chat-header">
      <button id="backToAd">←</button>
      <div id="chatAdHeader"></div>
      <div id="chatSeller"></div>
      <button id="chatMoreBtn" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;padding:4px 10px;
      ">⋮</button>
    </div>

        <div id="chatMessages" class="chat-messages"></div>

    <div id="chatActions"></div>

    <div class="chat-input">

      <input id="chatText" placeholder="Mensaje">
      <button id="sendMsg">Enviar</button>
    </div>
  </section>
  `;
}

async function mount(){

  alive = true;

  const state = getState();
  const user = state.session?.user;

  if(!user || !state.chat?.conversationId) return;

  userId = user.id;
  conversationId = state.chat.conversationId;
  userLang = getUserLanguage();

  box = document.getElementById("chatMessages");
  if(!box) return;

  rendered = new Set();

    const { data: conv } = await supabase
    .from("conversations")
    .select(`id, buyer_id, seller_id, ads(id,title,image_url,user_id,sold,sold_to,sale_confirmed_by_buyer)`)
    .eq("id", conversationId)
    .single();

  if(!alive) return;

  if(conv?.ads){
    const ad = conv.ads;
    const otherUserId = (userId === conv.seller_id) ? conv.buyer_id : conv.seller_id;

    // COMPROBAR BLOQUEOS (en ambas direcciones)
    iBlockedOther = await isBlocked(userId, otherUserId);
    otherBlockedMe = await isBlocked(otherUserId, userId);

    // CARGAR PERFIL DEL OTRO USUARIO (para mostrar avatar en el header)
    const { data: otherProfile } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", otherUserId)
      .maybeSingle();

        document.getElementById("chatAdHeader").innerHTML = `
      <div id="chatAdMini" class="chat-ad-mini" style="cursor:pointer;">
        <img src="${ad.image_url}">
        <div>${ad.title}</div>
      </div>
    `;

    document.getElementById("chatAdMini").onclick = () => {
      navigate("adDetail", { id: ad.id });
    };

    // AVATAR del otro usuario (clickable, te lleva a su perfil)
    const avatarTitle = (userId === conv.seller_id) ? "Ver perfil del comprador" : "Ver perfil del vendedor";

    document.getElementById("chatSeller").innerHTML = `
      <div id="otherUserAvatar" title="${avatarTitle}" style="
        cursor:pointer;display:flex;align-items:center;
        margin:0 4px;
      ">
        ${avatarHtml(otherProfile, 36)}
      </div>
    `;

    // Click en avatar → ir al perfil público
    const avatarEl = document.getElementById("otherUserAvatar");
    if(avatarEl){
      avatarEl.onclick = () => {
        setState({ app:{ params:{ userId: otherUserId } } });
        navigate("publicProfile");
      };
    }

    document.getElementById("backToAd").onclick = () => {
      history.back();
    };

    // BOTÓN ⋮ - Menú de acciones
    const moreBtn = document.getElementById("chatMoreBtn");
    if(moreBtn){
      moreBtn.onclick = () => openChatMenu(otherUserId);
    }

    // SI BLOQUEO ACTIVO - banner arriba y deshabilitar input
    if(iBlockedOther){
      showBlockBanner("Has bloqueado a este usuario. No puedes enviar ni recibir mensajes.");
      disableInput();
    } else if(otherBlockedMe){
      showBlockBanner("Este usuario te ha bloqueado. No puedes enviarle mensajes.");
      disableInput();
    } else {
      renderSaleActions(conv, ad);
    }
  }

  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");

  if(!alive) return;

  msgs?.forEach(addMessage);

  startChatSync(conversationId, userId, addMessage);

  document.getElementById("sendMsg").onclick = sendMessage;

  await markConversationRead(conversationId, userId);
}

async function unmount(){
  alive = false;
  stopChatSync();
}

/* ================= BLOQUEO / BANNERS ================= */

function showBlockBanner(text){
  const actions = document.getElementById("chatActions");
  if(!actions) return;
  actions.innerHTML = `
    <div style="padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:8px 0;display:flex;align-items:center;gap:10px;">
      <div style="font-size:20px;">🚫</div>
      <div style="flex:1;font-size:13px;color:#991b1b;font-weight:600;">${text}</div>
    </div>
  `;
}

function disableInput(){
  const input = document.getElementById("chatText");
  const sendBtn = document.getElementById("sendMsg");
  if(input){
    input.disabled = true;
    input.placeholder = "No puedes enviar mensajes";
    input.style.opacity = "0.5";
  }
  if(sendBtn){
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";
  }
}

/* ================= MENÚ ⋮ ================= */

function openChatMenu(otherUserId){
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);
    z-index:9999;display:flex;align-items:flex-end;justify-content:center;
  `;

  const sheet = document.createElement("div");
  sheet.style.cssText = `
    width:100%;max-width:500px;background:white;
    border-radius:20px 20px 0 0;padding:20px;
    box-shadow:0 -8px 32px rgba(0,0,0,0.2);
  `;

  sheet.innerHTML = `
    <div style="width:40px;height:4px;background:#e5e7eb;border-radius:2px;margin:0 auto 16px;"></div>

    <button id="goProfileBtn" style="
      width:100%;padding:14px;text-align:left;
      background:none;border:none;
      font-size:15px;color:#374151;font-weight:600;
      cursor:pointer;border-radius:10px;
      display:flex;align-items:center;gap:12px;
    ">
      <span style="font-size:20px;">👤</span>
      Ver perfil del usuario
    </button>

    <button id="reportUserBtn" style="
      width:100%;padding:14px;text-align:left;
      background:none;border:none;
      font-size:15px;color:#374151;font-weight:600;
      cursor:pointer;border-radius:10px;
      display:flex;align-items:center;gap:12px;
    ">
      <span style="font-size:20px;">🚩</span>
      Denunciar usuario
    </button>

    ${!iBlockedOther ? `
      <button id="blockChatBtn" style="
        width:100%;padding:14px;text-align:left;
        background:none;border:none;
        font-size:15px;color:#dc2626;font-weight:700;
        cursor:pointer;border-radius:10px;
        display:flex;align-items:center;gap:12px;
      ">
        <span style="font-size:20px;">🚫</span>
        Bloquear usuario
      </button>
    ` : `
      <div style="padding:14px;color:#9ca3af;font-size:14px;text-align:center;">
        Este usuario ya está bloqueado
      </div>
    `}

    <button id="cancelChatMenu" style="
      width:100%;margin-top:8px;padding:14px;
      background:#f3f4f6;border:none;border-radius:10px;
      font-size:15px;color:#374151;font-weight:600;cursor:pointer;
    ">Cancelar</button>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if(e.target === overlay) overlay.remove();
  };

  sheet.querySelector("#cancelChatMenu").onclick = () => overlay.remove();

  const goProfileBtn = sheet.querySelector("#goProfileBtn");
  if(goProfileBtn){
    goProfileBtn.onclick = () => {
      overlay.remove();
      setState({ app:{ params:{ userId: otherUserId } } });
      navigate("publicProfile");
    };
  }

  const reportUserBtn = sheet.querySelector("#reportUserBtn");
  if(reportUserBtn){
    reportUserBtn.onclick = () => {
      overlay.remove();
      openReportModal(otherUserId);
    };
  }

  const blockChatBtn = sheet.querySelector("#blockChatBtn");
  if(blockChatBtn){
    blockChatBtn.onclick = async () => {
      const ok = confirm("¿Bloquear a este usuario?\n\nNo podrá escribirte más mensajes y no verás sus anuncios.");
      if(!ok) return;

      const { error } = await blockUser(userId, otherUserId);
      if(error){
        alert("Error al bloquear: " + (error.message || error));
        return;
      }

      overlay.remove();
      alert("Usuario bloqueado.");
      location.reload();
    };
  }
}

/* ================= MODAL DENUNCIAR USUARIO ================= */

function openReportModal(reportedUserId){
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:white;border-radius:16px;padding:24px;
    max-width:400px;width:100%;
    box-shadow:0 10px 40px rgba(0,0,0,0.2);
  `;

  const reasonsHTML = USER_REPORT_REASONS.map((reason) => `
    <label style="
      display:flex;align-items:center;gap:10px;
      padding:12px;border:1px solid #e5e7eb;border-radius:10px;
      margin-bottom:8px;cursor:pointer;
      font-size:14px;color:#374151;
    ">
      <input type="radio" name="reportReason" value="${reason}" style="margin:0;">
      <span>${reason}</span>
    </label>
  `).join("");

  modal.innerHTML = `
    <h3 style="margin:0 0 8px;font-size:18px;color:#111;">Denunciar usuario</h3>
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">
      ¿Por qué denuncias a este usuario?
    </p>

    <div id="reasonsList">${reasonsHTML}</div>

    <div style="display:flex;gap:8px;margin-top:16px;">
      <button id="cancelReportBtn" style="
        flex:1;padding:12px;
        background:#f3f4f6;color:#374151;
        border:none;border-radius:10px;
        font-weight:700;font-size:14px;cursor:pointer;
      ">Cancelar</button>
      <button id="submitReportBtn" style="
        flex:1;padding:12px;
        background:linear-gradient(90deg,#dc2626,#ef4444);
        color:white;border:none;border-radius:10px;
        font-weight:700;font-size:14px;cursor:pointer;
        opacity:0.5;
      " disabled>Enviar denuncia</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const radios = modal.querySelectorAll('input[name="reportReason"]');
  const submitBtn = modal.querySelector("#submitReportBtn");

  radios.forEach(radio => {
    radio.onchange = () => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
    };
  });

  overlay.onclick = (e) => {
    if(e.target === overlay) overlay.remove();
  };

  modal.querySelector("#cancelReportBtn").onclick = () => overlay.remove();

  submitBtn.onclick = async () => {
    const selected = modal.querySelector('input[name="reportReason"]:checked');
    if(!selected) return;

    submitBtn.disabled = true;
    submitBtn.innerText = "Enviando...";

    const { error } = await reportUser(userId, reportedUserId, selected.value);

    if(error){
      alert("Error al enviar la denuncia: " + (error.message || error));
      submitBtn.disabled = false;
      submitBtn.innerText = "Enviar denuncia";
      return;
    }

    overlay.remove();
    alert("✓ Denuncia enviada. Nuestro equipo la revisará.");
  };
}

/* ================= VENTAS / VALORACIONES ================= */

async function renderSaleActions(conv, ad){
    const isSeller = (userId === conv.seller_id);
    const isBuyer = (userId === conv.buyer_id);
    const adIsSold = ad.sold === true;
    const saleConfirmed = ad.sale_confirmed_by_buyer === true;
    const iAmTheSoldTo = (ad.sold_to === userId);

    if(isSeller && !adIsSold){
      document.getElementById("chatActions").innerHTML = `
        <button id="markSoldBtn" style="
          width:100%;padding:12px;margin:8px 0;
          background:linear-gradient(90deg,#2ed4a7,#6a8dff);
          color:white;border:none;border-radius:12px;
          font-weight:700;font-size:14px;cursor:pointer;
        ">
          ✓ He vendido esto a este usuario
        </button>
      `;
      document.getElementById("markSoldBtn").onclick = markAsSold;
    }

    if(isBuyer && adIsSold && iAmTheSoldTo && !saleConfirmed){
      document.getElementById("chatActions").innerHTML = `
        <div style="padding:12px;background:#fff8e1;border-radius:12px;margin:8px 0;border:1px solid #ffe082;">
          <div style="font-size:13px;color:#5d4037;margin-bottom:10px;font-weight:600;">
            El vendedor dice que te ha vendido este artículo. ¿Lo confirmas?
          </div>
          <div style="display:flex;gap:8px;">
            <button id="confirmSaleBtn" style="
              flex:1;padding:10px;
              background:linear-gradient(90deg,#2ed4a7,#6a8dff);
              color:white;border:none;border-radius:10px;
              font-weight:700;font-size:13px;cursor:pointer;
            ">✓ Sí, le compré</button>
            <button id="rejectSaleBtn" style="
              flex:1;padding:10px;
              background:#f3f4f6;color:#374151;
              border:none;border-radius:10px;
              font-weight:700;font-size:13px;cursor:pointer;
            ">✗ No, no fue a mí</button>
          </div>
        </div>
      `;

      document.getElementById("confirmSaleBtn").onclick = confirmSale;
      document.getElementById("rejectSaleBtn").onclick = rejectSale;
    }

    if(isSeller && adIsSold && !saleConfirmed){
      document.getElementById("chatActions").innerHTML = `
        <div style="padding:12px;background:#fff8e1;border-radius:12px;margin:8px 0;border:1px solid #ffe082;text-align:center;">
          <div style="font-size:13px;color:#5d4037;font-weight:600;">
            ⏳ Esperando confirmación del comprador
          </div>
        </div>
      `;
    }

    if(adIsSold && saleConfirmed){
      let alreadyReviewed = false;
      if(isBuyer){
        const { data: existing } = await supabase
          .from("reviews")
          .select("id")
          .eq("reviewer_id", userId)
          .eq("ad_id", ad.id)
          .maybeSingle();
        alreadyReviewed = !!existing;
      }

      let actionHTML = `
        <div style="padding:12px;background:#e8f5e9;border-radius:12px;margin:8px 0;border:1px solid #a5d6a7;text-align:center;">
          <div style="font-size:13px;color:#2e7d32;font-weight:600;">
            ✓ Venta confirmada
          </div>
        </div>
      `;

      if(isBuyer && !alreadyReviewed){
        actionHTML += `
          <button id="rateBtn" style="
            width:100%;padding:12px;margin:8px 0;
            background:linear-gradient(90deg,#ffb300,#ff8f00);
            color:white;border:none;border-radius:12px;
            font-weight:700;font-size:14px;cursor:pointer;
          ">
            ⭐ Valorar al vendedor
          </button>
        `;
      } else if(isBuyer && alreadyReviewed){
        actionHTML += `
          <div style="padding:10px;background:#f3f4f6;border-radius:12px;margin:8px 0;text-align:center;">
            <div style="font-size:13px;color:#6b7280;font-weight:600;">
              ✓ Ya has valorado a este vendedor
            </div>
          </div>
        `;
      }

      document.getElementById("chatActions").innerHTML = actionHTML;

      if(isBuyer && !alreadyReviewed){
        document.getElementById("rateBtn").onclick = () => openRatingModal(ad.id, conv.seller_id);
      }
    }
}

async function sendMessage(){

  if(iBlockedOther || otherBlockedMe) return;

  const input = document.getElementById("chatText");
  const text = input.value.trim();
  if(!text) return;

  input.value = "";

  const { data } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      text
    })
    .select()
    .single();

  if(data) addMessage(data);
}

function addMessage(msg){

  if(!alive) return;
  if(rendered.has(msg.id)) return;

  rendered.add(msg.id);

  const mine = msg.sender_id === userId;
  const wrapper = document.createElement("div");
  wrapper.className = "bubble-wrapper";
  wrapper.style.cssText = `
    display:flex;flex-direction:column;
    align-items:${mine ? "flex-end" : "flex-start"};
    gap:4px;
  `;

  const bubble = document.createElement("div");
  bubble.className = mine ? "bubble bubble-me" : "bubble bubble-other";
  bubble.innerText = msg.text;

  if(!mine){
    bubble.style.background = "linear-gradient(90deg,#2ed4a7,#6a8dff)";
    bubble.style.color = "white";
  }

  wrapper.appendChild(bubble);

  if(!mine){
    const detected = detectLanguage(msg.text);

    if(detected !== userLang){
      const translateBtn = document.createElement("button");
      translateBtn.innerText = "🌐 Traducir";
      translateBtn.style.cssText = `
        background:none;border:none;
        color:#6b7280;font-size:12px;
        cursor:pointer;padding:2px 6px;
        margin-left:4px;
      `;

      let translatedBox = null;

      translateBtn.onclick = async () => {

        if(translatedBox){
          translatedBox.remove();
          translatedBox = null;
          translateBtn.innerText = "🌐 Traducir";
          return;
        }

        translateBtn.innerText = "Traduciendo...";
        translateBtn.disabled = true;

        const result = await translate(msg.text, detected, userLang);

        translateBtn.disabled = false;

        if(!result){
          translateBtn.innerText = "❌ No disponible";
          setTimeout(() => {
            translateBtn.innerText = "🌐 Traducir";
          }, 2000);
          return;
        }

        translatedBox = document.createElement("div");
        translatedBox.innerText = result;
        translatedBox.style.cssText = `
          max-width:70%;
          padding:8px 12px;
          border-radius:14px;
          background:#f3f4f6;
          color:#374151;
          font-size:13px;
          font-style:italic;
          align-self:${mine ? "flex-end" : "flex-start"};
        `;

        wrapper.insertBefore(translatedBox, translateBtn);
        translateBtn.innerText = "✕ Ocultar traducción";
      };

      wrapper.appendChild(translateBtn);
    }
  }

  box.appendChild(wrapper);
  box.scrollTop = box.scrollHeight;
}

async function markAsSold(){
  const ok = confirm("¿Confirmas que has vendido este artículo a este usuario? El comprador tendrá que confirmarlo y luego podrá valorarte.");
  if(!ok) return;

  const { data: conv } = await supabase
    .from("conversations")
    .select("ad_id, buyer_id, seller_id")
    .eq("id", conversationId)
    .single();

  if(!conv) return;

  const { error } = await supabase
    .from("ads")
    .update({ sold: true, sold_to: conv.buyer_id })
    .eq("id", conv.ad_id);

  if(error){
    alert("Error al marcar como vendido: " + error.message);
    return;
  }

  alert("✓ Anuncio marcado como vendido. Esperando confirmación del comprador.");
  location.reload();
}

async function confirmSale(){
  const ok = confirm("¿Confirmas que has comprado este artículo a este vendedor? Después de confirmar, podrás valorarlo.");
  if(!ok) return;

  const { data: conv } = await supabase
    .from("conversations")
    .select("ad_id")
    .eq("id", conversationId)
    .single();

  if(!conv) return;

  const { error } = await supabase
    .from("ads")
    .update({ sale_confirmed_by_buyer: true })
    .eq("id", conv.ad_id);

  if(error){
    alert("Error al confirmar la venta: " + error.message);
    return;
  }

  alert("✓ Venta confirmada. Ya puedes valorar al vendedor.");
  location.reload();
}

async function rejectSale(){
  const ok = confirm("¿Rechazas esta venta? El vendedor podrá marcar el anuncio como vendido a otro usuario.");
  if(!ok) return;

  const { data: conv } = await supabase
    .from("conversations")
    .select("ad_id")
    .eq("id", conversationId)
    .single();

  if(!conv) return;

  const { error } = await supabase
    .from("ads")
    .update({ sold: false, sold_to: null })
    .eq("id", conv.ad_id);

  if(error){
    alert("Error al rechazar la venta: " + error.message);
    return;
  }

  alert("Has rechazado la venta. El anuncio vuelve a estar disponible.");
  location.reload();
}

function openRatingModal(adId, sellerId){
  const overlay = document.createElement("div");
  overlay.id = "ratingOverlay";
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.6);
    z-index:9999;display:flex;
    align-items:center;justify-content:center;padding:20px;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:white;border-radius:16px;padding:24px;
    max-width:400px;width:100%;
    box-shadow:0 10px 40px rgba(0,0,0,0.2);
  `;

  modal.innerHTML = `
    <h3 style="margin:0 0 8px;font-size:18px;color:#111;">Valorar al vendedor</h3>
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">
      ¿Cómo fue tu experiencia con este vendedor?
    </p>

    <div id="starsContainer" style="display:flex;justify-content:center;gap:8px;margin-bottom:16px;">
      ${[1,2,3,4,5].map(n => `
        <button class="star-btn" data-rating="${n}" style="
          background:none;border:none;
          font-size:36px;cursor:pointer;padding:4px;
          color:#d1d5db;transition:color 0.2s;
        ">★</button>
      `).join("")}
    </div>

    <textarea id="ratingComment" placeholder="Escribe un comentario (opcional)" style="
      width:100%;min-height:80px;padding:10px;
      border:1px solid #e5e7eb;border-radius:10px;
      font-family:inherit;font-size:13px;resize:vertical;
      box-sizing:border-box;margin-bottom:16px;
    "></textarea>

    <div style="display:flex;gap:8px;">
      <button id="cancelRatingBtn" style="
        flex:1;padding:12px;
        background:#f3f4f6;color:#374151;
        border:none;border-radius:10px;
        font-weight:700;font-size:14px;cursor:pointer;
      ">Cancelar</button>
      <button id="submitRatingBtn" style="
        flex:1;padding:12px;
        background:linear-gradient(90deg,#ffb300,#ff8f00);
        color:white;border:none;border-radius:10px;
        font-weight:700;font-size:14px;cursor:pointer;
        opacity:0.5;
      " disabled>Enviar valoración</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  let selectedRating = 0;
  const stars = modal.querySelectorAll(".star-btn");
  const submitBtn = modal.querySelector("#submitRatingBtn");

  stars.forEach(star => {
    star.onclick = () => {
      selectedRating = parseInt(star.dataset.rating);
      stars.forEach((s, i) => {
        s.style.color = (i < selectedRating) ? "#ffb300" : "#d1d5db";
      });
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
    };

    star.onmouseenter = () => {
      const hoverRating = parseInt(star.dataset.rating);
      stars.forEach((s, i) => {
        s.style.color = (i < hoverRating) ? "#ffb300" : "#d1d5db";
      });
    };
  });

  modal.querySelector("#starsContainer").onmouseleave = () => {
    stars.forEach((s, i) => {
      s.style.color = (i < selectedRating) ? "#ffb300" : "#d1d5db";
    });
  };

  modal.querySelector("#cancelRatingBtn").onclick = () => {
    overlay.remove();
  };

  overlay.onclick = (e) => {
    if(e.target === overlay) overlay.remove();
  };

  submitBtn.onclick = async () => {
    if(selectedRating === 0) return;

    submitBtn.disabled = true;
    submitBtn.innerText = "Enviando...";

    const comment = modal.querySelector("#ratingComment").value.trim();

    const { error } = await supabase
      .from("reviews")
      .insert({
        reviewer_id: userId,
        reviewed_id: sellerId,
        ad_id: adId,
        rating: selectedRating,
        comment: comment || null
      });

    if(error){
      alert("Error al enviar la valoración: " + error.message);
      submitBtn.disabled = false;
      submitBtn.innerText = "Enviar valoración";
      return;
    }

    overlay.remove();
    alert("✓ ¡Gracias por tu valoración!");
    location.reload();
  };
}

export const ChatView = createView(render, mount, unmount);