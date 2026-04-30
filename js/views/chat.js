import { createView } from "../core/createView.js";
import { startChatSync, stopChatSync } from "../chat/syncEngine.js";
import { supabase } from "../services/supabase.js";
import { getState, setState } from "../core/state.js";
import { navigate } from "../core/router.js";

let box;
let alive = false;
let userId;
let conversationId;
let rendered = new Set();

async function render(){
  return `
  <section class="chat-page">
    <div class="chat-header">
      <button id="backToAd">←</button>
      <div id="chatAdHeader"></div>
      <div id="chatSeller"></div>
    </div>

    <div id="chatMessages" class="chat-messages"></div>

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

  box = document.getElementById("chatMessages");
  if(!box) return;

  rendered = new Set();

  const { data: conv } = await supabase
    .from("conversations")
    .select(`id, ads(id,title,image_url,user_id)`)
    .eq("id", conversationId)
    .single();

  if(!alive) return;

  if(conv?.ads){

    const ad = conv.ads;

    document.getElementById("chatAdHeader").innerHTML = `
      <div class="chat-ad-mini">
        <img src="${ad.image_url}">
        <div>${ad.title}</div>
      </div>
    `;

    document.getElementById("backToAd").onclick = () => {
      setState({ adId: ad.id });
      navigate("adDetail");
    };
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
}

async function unmount(){
  alive = false;
  stopChatSync();
}

async function sendMessage(){

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

  if(data){
    addMessage(data);
  }
}

function addMessage(msg){

  if(!alive) return;
  if(rendered.has(msg.id)) return;

  rendered.add(msg.id);

  const mine = msg.sender_id === userId;

  const div = document.createElement("div");
  div.className = mine ? "bubble bubble-me" : "bubble bubble-other";
  div.innerText = msg.text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

export const ChatView = createView(render, mount, unmount);
     
     