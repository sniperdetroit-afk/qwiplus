//views/inbox.js//

import { supabase } from "../services/supabase.js";
import { startInboxSync, stopInboxSync } from "../chat/syncEngine.js";
import { getState, setState } from "../core/state.js";
import { navigate } from "../core/router.js";
import { createView } from "../core/createView.js";
import { markConversationRead } from "../services/badgeService.js";

let box;
let userId;
let alive = false;
let unreadMap = new Map();
let currentTab = "recibidos"; // recibidos | enviados | archivados | papelera

/* ================= RENDER ================= */

async function renderInbox(){
  return `
  <section style="
    min-height: 100vh;
    background: url('/img/inbox.jpg') center bottom / cover no-repeat;
    position: relative;
  ">
    <!-- overlay -->
    <div style="
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.55) 60%, rgba(2,6,23,0.20) 100%);
      pointer-events: none;
    "></div>

    <!-- contenido -->
    <div style="position: relative; z-index: 1; padding: 24px 16px 100px;">

      <!-- cabecera -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
        <button id="backInbox" style="
          background: rgba(34,211,238,0.1);
          border: 1px solid rgba(34,211,238,0.25);
          color: #22d3ee;
          font-size: 18px;
          padding: 6px 12px;
          border-radius: 999px;
          cursor: pointer;
          backdrop-filter: blur(8px);
        ">←</button>
        <h1 style="margin:0;font-size:24px;font-weight:800;color:#f1f5f9;">Mensajes</h1>
      </div>

      <!-- buzones -->
      <div style="display:flex;flex-direction:column;gap:12px;">

        <div class="inbox-buzon" data-tab="recibidos" style="
          display:flex;align-items:center;gap:14px;
          padding:16px 18px;
          background: rgba(6,11,28,0.65);
          border: 1px solid rgba(34,211,238,0.25);
          border-radius: 18px;
          backdrop-filter: blur(12px);
          cursor: pointer;
          transition: 0.2s;
        ">
          <div style="
            width:46px;height:46px;border-radius:50%;
            background:rgba(34,211,238,0.1);
            border:1px solid rgba(34,211,238,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:20px;flex-shrink:0;
          ">📥</div>
          <div style="flex:1;">
            <div style="font-size:16px;font-weight:700;color:#f1f5f9;">Bandeja de entrada</div>
            <div style="font-size:13px;color:#94a3b8;">Mensajes recibidos</div>
          </div>
          <div id="countRecibidos" style="
            background:#22d3ee;color:#020617;
            font-size:13px;font-weight:800;
            min-width:28px;height:28px;
            border-radius:999px;
            display:flex;align-items:center;justify-content:center;
            padding:0 8px;
          ">0</div>
          <span style="color:#22d3ee;font-size:18px;">›</span>
        </div>

        <div class="inbox-buzon" data-tab="enviados" style="
          display:flex;align-items:center;gap:14px;
          padding:16px 18px;
          background: rgba(6,11,28,0.65);
          border: 1px solid rgba(34,211,238,0.15);
          border-radius: 18px;
          backdrop-filter: blur(12px);
          cursor: pointer;
          transition: 0.2s;
        ">
          <div style="
            width:46px;height:46px;border-radius:50%;
            background:rgba(34,211,238,0.1);
            border:1px solid rgba(34,211,238,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:20px;flex-shrink:0;
          ">📤</div>
          <div style="flex:1;">
            <div style="font-size:16px;font-weight:700;color:#f1f5f9;">Enviados</div>
            <div style="font-size:13px;color:#94a3b8;">Mensajes que has enviado</div>
          </div>
          <div id="countEnviados" style="
            background:#22d3ee;color:#020617;
            font-size:13px;font-weight:800;
            min-width:28px;height:28px;
            border-radius:999px;
            display:flex;align-items:center;justify-content:center;
            padding:0 8px;
          ">0</div>
          <span style="color:#22d3ee;font-size:18px;">›</span>
        </div>

        <div class="inbox-buzon" data-tab="archivados" style="
          display:flex;align-items:center;gap:14px;
          padding:16px 18px;
          background: rgba(6,11,28,0.65);
          border: 1px solid rgba(34,211,238,0.15);
          border-radius: 18px;
          backdrop-filter: blur(12px);
          cursor: pointer;
          transition: 0.2s;
        ">
          <div style="
            width:46px;height:46px;border-radius:50%;
            background:rgba(34,211,238,0.1);
            border:1px solid rgba(34,211,238,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:20px;flex-shrink:0;
          ">🗄️</div>
          <div style="flex:1;">
            <div style="font-size:16px;font-weight:700;color:#f1f5f9;">Archivados</div>
            <div style="font-size:13px;color:#94a3b8;">Mensajes guardados</div>
          </div>
          <div id="countArchivados" style="
            background:#22d3ee;color:#020617;
            font-size:13px;font-weight:800;
            min-width:28px;height:28px;
            border-radius:999px;
            display:flex;align-items:center;justify-content:center;
            padding:0 8px;
          ">0</div>
          <span style="color:#22d3ee;font-size:18px;">›</span>
        </div>

        <div class="inbox-buzon" data-tab="papelera" style="
          display:flex;align-items:center;gap:14px;
          padding:16px 18px;
          background: rgba(6,11,28,0.65);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 18px;
          backdrop-filter: blur(12px);
          cursor: pointer;
          transition: 0.2s;
        ">
          <div style="
            width:46px;height:46px;border-radius:50%;
            background:rgba(239,68,68,0.1);
            border:1px solid rgba(239,68,68,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:20px;flex-shrink:0;
          ">🗑️</div>
          <div style="flex:1;">
            <div style="font-size:16px;font-weight:700;color:#f1f5f9;">Papelera</div>
            <div style="font-size:13px;color:#94a3b8;">Mensajes eliminados</div>
          </div>
          <div id="countPapelera" style="
            background:#ef4444;color:white;
            font-size:13px;font-weight:800;
            min-width:28px;height:28px;
            border-radius:999px;
            display:flex;align-items:center;justify-content:center;
            padding:0 8px;
          ">0</div>
          <span style="color:#ef4444;font-size:18px;">›</span>
        </div>

      </div>

      <!-- lista de conversaciones (oculta hasta pulsar buzón) -->
      <div id="inboxConvPanel" class="hidden" style="margin-top:24px;">
        <div id="inboxPanelTitle" style="
          font-size:18px;font-weight:700;color:#22d3ee;
          margin-bottom:16px;
        "></div>
        <div id="inboxLoading" style="color:#94a3b8;font-size:14px;">Cargando…</div>
        <div id="inboxEmpty" class="hidden" style="color:#94a3b8;font-size:14px;text-align:center;padding:30px 0;">
          No hay conversaciones aquí
        </div>
        <div id="inboxList"></div>
        <button id="backToBuzones" style="
          margin-top:20px;
          background: rgba(34,211,238,0.1);
          border: 1px solid rgba(34,211,238,0.25);
          color: #22d3ee;
          padding: 10px 20px;
          border-radius: 999px;
          cursor: pointer;
          font-size:14px;
          font-weight:600;
        ">← Volver a buzones</button>
      </div>

    </div>
  </section>
  `;
}

/* ================= MOUNT ================= */

async function mountInbox(){

  const state = getState();
  const user = state.session?.user;
  if(!user) return;

  alive = true;
  userId = user.id;
  box = document.getElementById("inboxList");

  // back
  document.getElementById("backInbox")?.addEventListener("click", () => navigate("home"));
  document.getElementById("backToBuzones")?.addEventListener("click", showBuzones);

  // cargar contadores
  await loadCounts();

  // buzones click
  document.querySelectorAll(".inbox-buzon").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTab = btn.dataset.tab;
      showConvPanel(currentTab);
    });
  });

  startInboxSync(userId, handleRealtimeUpdate);
}

/* ================= UNMOUNT ================= */

async function unmountInbox(){
  alive = false;
  stopInboxSync();
}

/* ================= CONTADORES ================= */

async function loadCounts(){

  const { data } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, hidden_for_buyer, hidden_for_seller")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if(!data) return;

  let recibidos = 0, enviados = 0, archivados = 0, papelera = 0;

  data.forEach(c => {
    const iAmBuyer = c.buyer_id === userId;
    const iAmSeller = c.seller_id === userId;
    const hiddenForMe = (iAmBuyer && c.hidden_for_buyer) || (iAmSeller && c.hidden_for_seller);

    if(hiddenForMe){
      papelera++;
    } else if(iAmSeller){
      recibidos++;
    } else if(iAmBuyer){
      enviados++;
    }
  });

  document.getElementById("countRecibidos").textContent = recibidos;
  document.getElementById("countEnviados").textContent = enviados;
  document.getElementById("countArchivados").textContent = archivados;
  document.getElementById("countPapelera").textContent = papelera;
}

/* ================= MOSTRAR PANEL ================= */

function showConvPanel(tab){
  document.querySelectorAll(".inbox-buzon").forEach(b => b.style.display = "none");
  document.getElementById("inboxConvPanel").classList.remove("hidden");

  const titles = {
    recibidos: "📥 Bandeja de entrada",
    enviados:  "📤 Enviados",
    archivados:"🗄️ Archivados",
    papelera:  "🗑️ Papelera"
  };
  document.getElementById("inboxPanelTitle").textContent = titles[tab];

  loadInbox(tab);
}

function showBuzones(){
  document.querySelectorAll(".inbox-buzon").forEach(b => b.style.display = "flex");
  document.getElementById("inboxConvPanel").classList.add("hidden");
  document.getElementById("inboxList").innerHTML = "";
  loadCounts();
}

/* ================= LOAD ================= */

async function loadInbox(tab){

  const loading = document.getElementById("inboxLoading");
  const empty = document.getElementById("inboxEmpty");
  box = document.getElementById("inboxList");

  loading.style.display = "block";
  empty.classList.add("hidden");
  box.innerHTML = "";

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      buyer_id,
      seller_id,
      last_message,
      last_message_at,
      hidden_for_buyer,
      hidden_for_seller,
      ads (title, image_url, user_id)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if(!alive) return;
  loading.style.display = "none";

  if(error){
    empty.textContent = "Error cargando conversaciones";
    empty.classList.remove("hidden");
    return;
  }

  const filtered = (data || []).filter(c => {
    const iAmBuyer  = c.buyer_id  === userId;
    const iAmSeller = c.seller_id === userId;
    const hiddenForMe = (iAmBuyer && c.hidden_for_buyer) || (iAmSeller && c.hidden_for_seller);

    if(tab === "papelera")   return hiddenForMe;
    if(tab === "recibidos")  return !hiddenForMe && iAmSeller;
    if(tab === "enviados")   return !hiddenForMe && iAmBuyer;
    if(tab === "archivados") return false; // futuro
    return false;
  });

  if(!filtered.length){
    empty.classList.remove("hidden");
    return;
  }

  await loadUnreadCounts(filtered.map(c => c.id));
  renderList(filtered);
}

/* ================= UNREAD COUNTS ================= */

async function loadUnreadCounts(convIds){
  unreadMap = new Map();
  if(!convIds.length) return;

  const { data: unread } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", convIds)
    .eq("read", false)
    .neq("sender_id", userId);

  (unread || []).forEach(m => {
    const current = unreadMap.get(m.conversation_id) || 0;
    unreadMap.set(m.conversation_id, current + 1);
  });
}

/* ================= RENDER LIST ================= */

function renderList(list){
  box.innerHTML = "";
  list.forEach(renderConversation);
}

/* ================= CARD ================= */

function renderConversation(c){

  const unreadCount = unreadMap.get(c.id) || 0;
  const hasUnread = unreadCount > 0;

  const div = document.createElement("div");
  div.className = "conversation" + (hasUnread ? " has-unread" : "");
  div.dataset.id = c.id;
  div.style.cssText = `
    display:flex;
    align-items:center;
    gap:12px;
    padding:12px;
    border-bottom:1px solid rgba(255,255,255,0.08);
    cursor:pointer;
    position:relative;
  `;

  const titleWeight = hasUnread ? "700" : "500";
  const titleColor  = hasUnread ? "#ffffff" : "#9ca3af";
  const lastWeight  = hasUnread ? "600" : "400";
  const lastColor   = hasUnread ? "#e5e7eb" : "#6b7280";

  div.innerHTML = `
    <div class="conv-img" style="position:relative;flex-shrink:0;">
      <img src="${c.ads?.image_url || ""}" style="
        width:64px;height:64px;border-radius:14px;object-fit:cover;
      ">
      ${hasUnread ? `
        <div style="
          position:absolute;top:-4px;right:-4px;
          background:#ef4444;color:white;
          font-size:11px;font-weight:700;
          min-width:20px;height:20px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          padding:0 6px;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${unreadCount > 9 ? "9+" : unreadCount}</div>
      ` : ""}
    </div>
    <div class="conv-info" style="flex:1;min-width:0;">
      <div style="
        font-weight:${titleWeight};color:${titleColor};
        font-size:15px;margin-bottom:4px;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      ">${c.ads?.title || "Anuncio"}</div>
      <div style="
        font-weight:${lastWeight};color:${lastColor};
        font-size:13px;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      ">${c.last_message || ""}</div>
    </div>
  `;

  div.onclick = (e) => {
    if(e.target.closest(".conv-delete")) return;
    markConversationRead(c.id, userId);
    setState({ chat: { conversationId: c.id } });
    navigate("chat");
  };

  box.appendChild(div);
}

/* ================= REALTIME ================= */

function handleRealtimeUpdate(conv){
  if(!alive) return;
  const iAmBuyer  = conv.buyer_id  === userId;
  const iAmSeller = conv.seller_id === userId;
  if(iAmBuyer  && conv.hidden_for_buyer)  return;
  if(iAmSeller && conv.hidden_for_seller) return;
  loadCounts();
  if(!document.getElementById("inboxConvPanel")?.classList.contains("hidden")){
    loadInbox(currentTab);
  }
}

/* ================= VIEW ENGINE ================= */

export const InboxView = createView(
  renderInbox,
  mountInbox,
  unmountInbox
);