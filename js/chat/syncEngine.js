import { supabase } from "../services/supabase.js";

let chatChannel = null;
let inboxChannel = null;
let activeConversation = null;
let rendered = new Set();

/* ================= CHAT ================= */

export function startChatSync(conversationId, userId, onMessage){

  if(activeConversation === conversationId) return;

  stopChatSync(); // ⭐ CRÍTICO

  rendered.clear();
  activeConversation = conversationId;

  chatChannel = supabase
    .channel("chat-"+conversationId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`
      },
      async payload => {

        const msg = payload.new;

        if(rendered.has(msg.id)) return;
        rendered.add(msg.id);

        onMessage(msg);

        if(msg.sender_id !== userId){
          await supabase
            .from("messages")
            .update({ read_at: new Date() })
            .eq("id", msg.id);
        }

      }
    )
    .subscribe();
}

export function stopChatSync(){
  if(!chatChannel) return;

  supabase.removeChannel(chatChannel);
  chatChannel = null;
  activeConversation = null;
}

/* ================= INBOX ================= */

export function startInboxSync(userId, onUpdate){

  if(inboxChannel) return;

  inboxChannel = supabase
    .channel("inbox-"+userId)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations"
      },
      payload => {

        const conv = payload.new;

        if(conv.buyer_id !== userId && conv.seller_id !== userId) return;

        onUpdate(conv);
      }
    )
    .subscribe();
}

export function stopInboxSync(){
  if(!inboxChannel) return;
  supabase.removeChannel(inboxChannel);
  inboxChannel = null;
}