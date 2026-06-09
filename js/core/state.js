// js/core/state.js

import { notify } from "./store.js";

let state = {

  app: {
    view: "boot",
    params: {}
  },

  session: {
    user: null
  },

  chat: {
    conversationId: null
  }

};

export function getState() {
  return state;
}

export function setState(newState) {

  const prevView = state.app?.view;
  const prevUserId = state.session?.user?.id || null;

  const nextState = mergeDeep(state, newState);

  const nextView = nextState.app?.view;
  const nextUserId = nextState.session?.user?.id || null;

  state = nextState;

  // 🔥 render si cambia la vista O cambia la sesión (login/logout/restore)
  if (prevView !== nextView || prevUserId !== nextUserId) {
    notify();
  }

}

/* =========================
   SAFE DEEP MERGE (PRO)
========================= */

function mergeDeep(target, source){

  const output = { ...target };

  if(isObject(target) && isObject(source)){

    Object.keys(source).forEach(key => {

      if(isObject(source[key])){

        if(!(key in target)){
          output[key] = source[key];
        }else{
          output[key] = mergeDeep(target[key], source[key]);
        }

      }else{
        output[key] = source[key];
      }

    });

  }

  return output;
}

function isObject(item){
  return item && typeof item === "object" && !Array.isArray(item);
}