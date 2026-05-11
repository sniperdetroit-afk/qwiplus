import { supabase } from "../services/supabase.js";
import { startInboxSync, stopInboxSync } from "../chat/syncEngine.js";
import { getState, setState } from "../core/state.js";
import { navigate } from "../core/router.js";
import { createView } from "../core/createView.js";
import { markConversationRead } from "../services/badgeService.js";

let box;
let userId;
let alive = false;

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

  if(!data?.length){
    empty.classList.remove("hidden");
    return;
  }

  renderList(data);
}

/* ================= RENDER LIST ================= */

function renderList(list){
  box.innerHTML = "";
  list.forEach(renderConversation);
}

/* ================= CARD ================= */

function renderConversation(c){

  const div = document.createElement("div");
  div.className = "conversation";
  div.dataset.id = c.id;

  div.innerHTML = `
    <div class="conv-img">
      <img src="${c.ads?.image_url || ""}">
    </div>

    <div class="conv-info">
      <div class="conv-title">${c.ads?.title || "Anuncio"}</div>
      <div class="conv-last">${c.last_message || ""}</div>
    </div>
  `;

  div.onclick = () => {
    markConversationRead(c.id, userId);
    setState({ chat:{ conversationId:c.id } });
    navigate("chat");
  };

  box.appendChild(div);
}

/* ================= REALTIME ================= */

function handleRealtimeUpdate(conv){

  if(!alive) return;

  const found = box.querySelector(`[data-id="${conv.id}"]`);
  if(found) found.remove();

  renderConversation(conv);

  box.prepend(box.lastChild);
}

/* ================= VIEW ENGINE ================= */

export const InboxView = createView(
  renderInbox,
  mountInbox,
  unmountInbox
);
