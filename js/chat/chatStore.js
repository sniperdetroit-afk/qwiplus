let chatState = {
  current: null,
  messages: new Map()
};

export function setCurrentChat(id){
  chatState.current = id;
}

export function addMessage(msg){

  if(!msg?.conversation_id) return;

  if(!chatState.messages.has(msg.conversation_id)){
    chatState.messages.set(msg.conversation_id, new Map());
  }

  const conv = chatState.messages.get(msg.conversation_id);

  if(conv.has(msg.id)) return;   // 🔥 anti duplicados

  conv.set(msg.id, msg);
}

export function getMessages(conversationId){

  const conv = chatState.messages.get(conversationId);
  if(!conv) return [];

  return Array.from(conv.values())
    .sort((a,b)=> new Date(a.created_at) - new Date(b.created_at));
}

export function clearChat(conversationId){
  chatState.messages.delete(conversationId);
}