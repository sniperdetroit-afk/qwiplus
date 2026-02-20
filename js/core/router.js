// js/core/router.js

import { setState } from "./state.js";

export function navigate(view, params = {}) {
  setState({ view, ...params });

  // Cambia la URL sin recargar
  window.history.pushState({ view }, "", `#${view}`);
}

// Botón atrás del navegador
window.addEventListener("popstate", (event) => {
  const view = event.state?.view || "home";
  setState({ view });
});