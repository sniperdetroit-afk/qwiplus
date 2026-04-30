import { supabase } from "./supabase.js";
import { navigate } from "../core/router.js";

export async function openChat(adId, sellerId, userId){

  if(!adId || !sellerId || !userId){
    console.error("openChat missing params");
    return;
  }

  if(userId === sellerId){
    console.error("seller cannot chat himself");
    return;
  }

  const { data: existing, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("ad_id", adId)
    .eq("buyer_id", userId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if(error){
    console.error("find conversation error", error);
    return;
  }

  let conversation = existing;

  if(!conversation){

    const { data, error: insertError } = await supabase
      .from("conversations")
      .insert({
        ad_id: adId,
        buyer_id: userId,
        seller_id: sellerId,
        last_message: "",
        last_message_at: new Date()
      })
      .select()
      .single();

    if(insertError){
      console.error("create conversation error", insertError);
      return;
    }

    conversation = data;
  }

  navigate("chat", {
    conversationId: conversation.id
  });
}
