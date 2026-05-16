import { supabase } from "../services/supabase.js";
import { startInboxSync, stopInboxSync } from "../chat/syncEngine.js";
import { getState, setState } from "../core/state.js";
import { navigate } from "../core/router.js";
import { createView } from "../core/createView.js";
import { markConversationRead } from "../services/badgeService.js";

let box;
let userId;
let alive = false;
let unreadMap = new Map(); // conversationId -> número de mensajes sin leer

/* ================= RENDER ================= */

async function renderInbox(){
  return `
  <section class="inbox-page">
    <h1 class="inbox-title">Mensajes</h1>

    <div id="inboxLoading" class="inbox-loading">
      Cargando conversaciones…
    </div>

    <div id="inboxEmpty" class="inbox-empty hidden">
      No tienes conversaciones aún
    </div>

    <div id="inboxList" class="inbox-list"></div>
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

  await loadInbox();

  startInboxSync(userId, handleRealtimeUpdate);
}

/* ================= UNMOUNT ================= */

async function unmountInbox(){
  alive = false;
  stopInboxSync();
}

/* ================= LOAD ================= */

async function loadInbox(){

  const loading = document.getElementById("inboxLoading");
  const empty = document.getElementById("inboxEmpty");

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
      ads (title,image_url,user_id)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at",{ ascending:false });

  if(!alive) return;

  loading.style.display = "none";

  if(error){
    console.error("Inbox error:", error);
    empty.innerText = "Error cargando conversaciones";
    empty.classList.remove("hidden");
    return;
  }

  // Filtrar conversaciones ocultas por mí
  const visible = (data || []).filter(c => {
    const iAmBuyer = (c.buyer_id === userId);
    const iAmSeller = (c.seller_id === userId);
    if(iAmBuyer && c.hidden_for_buyer) return false;
    if(iAmSeller && c.hidden_for_seller) return false;
    return true;
  });

  if(!visible.length){
    empty.classList.remove("hidden");
    box.innerHTML = "";
    return;
  }

  // Cargar conteo de mensajes sin leer por conversación
  await loadUnreadCounts(visible.map(c => c.id));

  renderList(visible);
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
  const titleColor = hasUnread ? "#ffffff" : "#9ca3af";
  const lastWeight = hasUnread ? "600" : "400";
  const lastColor = hasUnread ? "#e5e7eb" : "#6b7280";

  div.innerHTML = `
    <div class="conv-img" style="position:relative;flex-shrink:0;">
      <img src="${c.ads?.image_url || ""}" style="
        width:64px;
        height:64px;
        border-radius:14px;
        object-fit:cover;
      ">
      ${hasUnread ? `
        <div style="
          position:absolute;
          top:-4px;
          right:-4px;
          background:#ef4444;
          color:white;
          font-size:11px;
          font-weight:700;
          min-width:20px;
          height:20px;
          border-radius:10px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0 6px;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${unreadCount > 9 ? "9+" : unreadCount}</div>
      ` : ""}
    </div>

    <div class="conv-info" style="flex:1;min-width:0;">
      <div class="conv-title" style="
        font-weight:${titleWeight};
        color:${titleColor};
        font-size:15px;
        margin-bottom:4px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      ">${c.ads?.title || "Anuncio"}</div>
      <div class="conv-last" style="
        font-weight:${lastWeight};
        color:${lastColor};
        font-size:13px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      ">${c.last_message || ""}</div>
    </div>

    <button class="conv-delete" data-conv-id="${c.id}" style="
      background:transparent;
      border:none;
      color:#6b7280;
      font-size:20px;
      padding:8px;
      cursor:pointer;
      flex-shrink:0;
    " title="Eliminar conversación">✕</button>
  `;

  // Click en la conversación (no en el botón eliminar)
  div.onclick = (e) => {
    if(e.target.closest(".conv-delete")) return; // ignorar si pulsó el ✕
    markConversationRead(c.id, userId);
    setState({ chat:{ conversationId:c.id } });
    navigate("chat");
  };

  // Click en eliminar
  const deleteBtn = div.querySelector(".conv-delete");
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteConversation(c);
  };

  box.appendChild(div);
}

/* ================= DELETE ================= */

async function deleteConversation(c){
  const ok = confirm("¿Eliminar esta conversación? Solo desaparecerá de tu lista, el otro usuario seguirá viéndola.");
  if(!ok) return;

  const iAmBuyer = (c.buyer_id === userId);
  const iAmSeller = (c.seller_id === userId);

  const updateData = {};
  if(iAmBuyer) updateData.hidden_for_buyer = true;
  if(iAmSeller) updateData.hidden_for_seller = true;

  const { error } = await supabase
    .from("conversations")
    .update(updateData)
    .eq("id", c.id);

  if(error){
    alert("Error al eliminar la conversación: " + error.message);
    return;
  }

  // Quitar visualmente
  const card = box.querySelector(`[data-id="${c.id}"]`);
  if(card) card.remove();

  // Si no quedan conversaciones, mostrar mensaje vacío
  if(box.children.length === 0){
    document.getElementById("inboxEmpty").classList.remove("hidden");
  }
}

/* ================= REALTIME ================= */

function handleRealtimeUpdate(conv){

  if(!alive) return;

  // Si la conversación está oculta para mí, no la muestres
  const iAmBuyer = (conv.buyer_id === userId);
  const iAmSeller = (conv.seller_id === userId);
  if(iAmBuyer && conv.hidden_for_buyer) return;
  if(iAmSeller && conv.hidden_for_seller) return;

  // Recargar inbox entero para recalcular contadores
  loadInbox();
}

/* ================= VIEW ENGINE ================= */

export const InboxView = createView(
  renderInbox,
  mountInbox,
  unmountInbox
);