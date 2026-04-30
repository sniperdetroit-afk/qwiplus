const channels = new Map();

export function registerChannel(key, channel){
  channels.set(key, channel);
}

export async function destroyChannel(key){
  const ch = channels.get(key);
  if(!ch) return;

  await ch.unsubscribe();
  channels.delete(key);
}

export async function destroyAllChannels(){
  for(const ch of channels.values()){
    await ch.unsubscribe();
  }
  channels.clear();
}