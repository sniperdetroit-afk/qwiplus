// js/services/badgeService.js

import { supabase } from "./supabase.js";

let badgeChannel = null;

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

  // Filtrar conversaciones ocultas para este usuario

  const { data: unread } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, read")
    .in("conversation_id", convIds)
    .eq("read", false)
    .neq("sender_id", userId);

  const count = unread?.length || 0;

  if (!count) {
    badge.classList.add("hidden");
    badge.textContent = "0";
    return;
  }

  badge.textContent = count > 9 ? "9+" : String(count);
  badge.classList.remove("hidden");
}

export function initBadge(userId) {
  if (!userId) return;

  stopBadge();
  updateBadge(userId);

  badgeChannel = supabase
    .channel(`badge-channel-${userId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => updateBadge(userId))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => updateBadge(userId))
    .subscribe((status) => {
      console.log("BADGE CHANNEL:", status);
    });
}

export function stopBadge() {
  if (badgeChannel) {
    supabase.removeChannel(badgeChannel);
    badgeChannel = null;
  }
}

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
    return;
  }

  await updateBadge(userId);
}




