// js/core/viewEngine.js

let currentView = null;
let renderId = 0;

export async function loadView(View, state){

  const main = document.getElementById("main");

  if (!main) {
    console.error("Main container not found");
    return;
  }

  const myRenderId = ++renderId;

  let view;

  /* ================= CREATE VIEW ================= */

  try {
    view = await View(state);
  } catch (err) {
    console.error("View crash:", err);
    main.innerHTML = `
      <div style="padding:20px">
        Error cargando vista
      </div>
    `;
    return;
  }

  // 🔥 cancelar render antiguo
  if (myRenderId !== renderId) return;

  if (!view || !view.html) {
    console.error("invalid view");
    main.innerHTML = `
      <div style="padding:20px">
        Vista inválida
      </div>
    `;
    return;
  }

  /* ================= UNMOUNT ================= */

  if (currentView && currentView.unmount) {
    try {
      await currentView.unmount();
    } catch (e) {
      console.error("unmount error", e);
    }
  }

  /* ================= RENDER ================= */

  try {
    main.innerHTML = view.html;
  } catch (err) {
    console.error("render error:", err);
    return;
  }

  /* ================= SCROLL ================= */

  try {
    window.scrollTo(0, 0);
  } catch (e) {
    console.warn("scroll error", e);
  }

  /* ================= MOUNT ================= */

  if (view.mount) {
    try {
      await view.mount();
    } catch (e) {
      console.error("mount error", e);
    }
  }

  currentView = view;
}