// js/core/state.js

import { notify } from "./store.js";

/* =========================
   GLOBAL STATE
========================= */

let state = {
  view: "home",
  user: null,
  authReady: false
};

/* =========================
   GET STATE
========================= */

export function getState() {
  return state;
}

/* =========================
   SET STATE (reactivo)
========================= */

export function setState(newState) {
  state = { ...state, ...newState };
  notify(); // 🔥 Dispara re-render automáticamente
}