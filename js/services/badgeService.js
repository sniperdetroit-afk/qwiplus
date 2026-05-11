// js/services/badgeService.js

import { supabase } from "./supabase.js";

let badgeChannel = null;

/* ================= ACTUALIZAR BADGE ================= */

async function updateBadge(userId) {

  const badge = document.getElementById("msgBadge");
  if (!badge) return;

  // Contar mensajes no leídos donde yo soy el receptor
  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (!convs?.length) {
    badge.classList.add("hidden");
    return;
  }

  const convIds = convs.map(c => c.id);

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", convIds)
    .eq("read", false)
    .neq("sender_id", userId);

  if (!count || count === 0) {
    badge.classList.add("hidden");
    badge.textContent = "0";
  } else {
    badge.textContent = count > 9 ? "9+" : count;
    badge.classList.remove("hidden");
  }
}

/* ================= INICIAR ================= */

export function initBadge(userId) {

  updateBadge(userId);

  // Escuchar nuevos mensajes en tiempo real
  badgeChannel = supabase
    .channel("badge-channel")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "messages"
    }, () => {
      updateBadge(userId);
    })
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "messages"
    }, () => {
      updateBadge(userId);
    })
    .subscribe();
}

/* ================= PARAR ================= */

export function stopBadge() {
  if (badgeChannel) {
    supabase.removeChannel(badgeChannel);
    badgeChannel = null;
  }
}

/* ================= MARCAR LEÍDOS ================= */

export async function markConversationRead(conversationId, userId) {
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .eq("read", false)
    .neq("sender_id", userId);
}
