// js/core/realtime.js

import { supabase } from "../services/supabase.js";

const channels = new Map();

/* =========================
   SUBSCRIBE
========================= */

export function subscribeChannel(key, config, handler){

  if(!key || !config || !handler){
    console.warn("Realtime subscribe inválido:", { key, config, handler });
    return null;
  }

  // Evita duplicados
  if(channels.has(key)){
    console.log("REALTIME ya activo:", key);
    return channels.get(key);
  }

  const channel = supabase
    .channel(key)
    .on(
      "postgres_changes",
      config,
      handler
    )
    .subscribe((status) => {
      console.log("REALTIME", key, status);
    });

  channels.set(key, channel);

  return channel;
}

/* =========================
   UNSUBSCRIBE ONE
========================= */

export async function unsubscribeChannel(key){

  const channel = channels.get(key);
  if(!channel) return;

  try {
    await supabase.removeChannel(channel);
  } catch (err) {
    console.error("REALTIME unsubscribe error:", key, err);
  }

  channels.delete(key);
}

/* =========================
   UNSUBSCRIBE ALL
========================= */

export async function unsubscribeAll(){

  for(const [key, channel] of channels){

    try {
      await supabase.removeChannel(channel);
    } catch (err) {
      console.error("REALTIME unsubscribe all error:", key, err);
    }

  }

  channels.clear();
}

/* =========================
   DEBUG
========================= */

export function getActiveChannels(){
  return Array.from(channels.keys());
}