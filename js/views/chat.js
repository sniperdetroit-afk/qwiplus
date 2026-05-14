// js/views/chat.js

import { createView } from "../core/createView.js";
import { startChatSync, stopChatSync } from "../chat/syncEngine.js";
import { supabase } from "../services/supabase.js";
import { getState, setState } from "../core/state.js";
import { navigate } from "../core/router.js";
import { markConversationRead } from "../services/badgeService.js";
import { translate, detectLanguage, getUserLanguage } from "../services/translatorService.js";

let box;
let alive = false;
let userId;
let conversationId;
let rendered = new Set();
let userLang;

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
  userLang = getUserLanguage();

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
      <div class="chat-ad-mini" data-view="adDetail" data-ad="${ad.id}" style="cursor:pointer;">
        <img src="${ad.image_url}">
        <div>${ad.title}</div>
      </div>
    `;

    document.getElementById("chatSeller").innerHTML = `
      <div class="chat-seller-link" data-view="publicProfile" data-user-id="${ad.user_id}"
 style="cursor:pointer;font-size:13px;color:#6a8dff;padding:4px 8px;">
        Ver perfil del vendedor →
      </div>
    `;

    document.getElementById("backToAd").onclick = () => {
      history.back();
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

  await markConversationRead(conversationId, userId);
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

export const ChatView = createView(render, mount, unmount);



     
     