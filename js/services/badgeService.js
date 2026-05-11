// js/services/badgeService.js

import { supabase } from "./supabase.js";

let badgeChannel = null;

/* ================= ACTUALIZAR BADGE ================= */

async function updateBadge(userId) {
  const badge = document.getElementById("msgBadge");
  if (!badge || !userId) return;

  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (convError) {
    console.error("BADGE CONVERSATIONS ERROR:", convError);
    return;
  }

  if (!convs?.length) {
    badge.classList.add("hidden");
    badge.textContent = "0";
    return;
  }

  const convIds = convs.map(c => c.id);

  const { count, error: msgError } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", convIds)
    .eq("read", false)
    .neq("sender_id", userId);

  if (msgError) {
    console.error("BADGE MESSAGES ERROR:", msgError);
    return;
  }

  if (!count) {
    badge.classList.add("hidden");
    badge.textContent = "0";
    return;
  }

  badge.textContent = count > 9 ? "9+" : String(count);
  badge.classList.remove("hidden");
}

/* ================= INICIAR ================= */

export function initBadge(userId) {
  if (!userId) return;

  // Evita crear dos canales badge a la vez
  stopBadge();

  updateBadge(userId);

  badgeChannel = supabase
    .channel(`badge-channel-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages"
      },
      () => updateBadge(userId)
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages"
      },
      () => updateBadge(userId)
    )
    .subscribe((status) => {
      console.log("BADGE CHANNEL:", status);
    });
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
  if (!conversationId || !userId) return;

  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .eq("read", false)
    .neq("sender_id", userId);

  if (error) {
    console.error("MARK READ ERROR:", error);
  }
}
