// js/ui/nav.js

import { setView } from "../core/state.js";
import { renderApp } from "../app.js";

export function initNav() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;

    const view = btn.dataset.view;

    // 🔒 Quién da más BLOQUEADO en v0.2
    if (view === "auction") {
      alert("⚠️ Quién da más estará disponible en la versión 0.3");
      return;
    }

    setView(view);
    updateBottomNav(view);
    renderApp();
  });
}

function updateBottomNav(activeView) {
  document.querySelectorAll(".bottom-nav button").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.view === activeView)
  );
}