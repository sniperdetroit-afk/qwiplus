import { supabase } from "../services/supabase.js";
import { safeAsync } from "./safeAsync.js";

const channels = new Map();

export function subscribeChannel(key, config, handler){

  if(channels.has(key)){
    return;
  }

  const channel = supabase
    .channel(key)
    .on(
      "postgres_changes",
      config,
      payload => {
        safeAsync(() => handler(payload), "realtime:"+key);
      }
    )
    .subscribe(status => {
      console.log("REALTIME", key, status);
    });

  channels.set(key, channel);
}

export async function unsubscribeChannel(key){

  const channel = channels.get(key);
  if(!channel) return;

  await channel.unsubscribe();
  await supabase.removeChannel(channel);

  channels.delete(key);
}

export async function unsubscribeAll(){

  for(const [key, channel] of channels){
    await channel.unsubscribe();
    await supabase.removeChannel(channel);
  }

  channels.clear();
}