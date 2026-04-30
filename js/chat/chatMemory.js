const memory = new Map();

/*
memory structure

conversationId => {
    messages: Map(messageId -> message),
    ordered: [messageIds]
}
*/

export function initConversationMemory(conversationId){

  if(!memory.has(conversationId)){
    memory.set(conversationId,{
      messages: new Map(),
      ordered: []
    });
  }

}

export function addMemoryMessage(conversationId, msg){

  const conv = memory.get(conversationId);
  if(!conv) return false;

  if(conv.messages.has(msg.id)){
    return false;
  }

  conv.messages.set(msg.id, msg);
  conv.ordered.push(msg.id);

  return true;
}

export function getConversationMessages(conversationId){

  const conv = memory.get(conversationId);
  if(!conv) return [];

  return conv.ordered.map(id => conv.messages.get(id));
}

export function clearConversationMemory(conversationId){
  memory.delete(conversationId);
}