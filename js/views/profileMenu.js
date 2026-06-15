// js/views/profileMenu.js

import { navigate } from "../core/router.js";
import { t } from "../services/langService.js";

function renderProfileMenu(){
  return `
  <section style="
    min-height: 100vh;
    background: #020617;
    background-image: radial-gradient(ellipse at top, #0d1f3c 0%, #020617 60%);
    padding: 24px 20px;
    max-width: 480px;
    margin: 0 auto;
    position: relative;
  ">

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:40px;">
      <button id="backProfileMenu" style="
        background: rgba(34,211,238,0.1);
        border: 1px solid rgba(34,211,238,0.25);
        font-size: 18px;
        cursor: pointer;
        color: #22d3ee;
        padding: 6px 12px;
        border-radius: 999px;
        backdrop-filter: blur(8px);
      ">←</button>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#f1f5f9;">${t("myAccount")}</h2>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px;">

      <button class="profile-menu-btn" data-view="profile">
        <span style="font-size:18px;">👤</span>
        <span style="flex:1;text-align:center;">${t("viewProfile")}</span>
        <span style="opacity:0.6;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="favorites">
        <span style="font-size:18px;">🤍</span>
        <span style="flex:1;text-align:center;">${t("favorites")}</span>
        <span style="opacity:0.6;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="settings">
        <span style="font-size:18px;">⚙️</span>
        <span style="flex:1;text-align:center;">${t("config")}</span>
        <span style="opacity:0.6;font-size:18px;">›</span>
      </button>

    </div>

  </section>
  `;
}

function mountProfileMenu(){
  const back = document.getElementById("backProfileMenu");
  if(back) back.onclick = () => navigate("home");

  document.querySelectorAll(".profile-menu-btn").forEach(btn => {
    btn.onclick = () => {
      const view = btn.dataset.view;
      if(view) navigate(view);
    };
  });
}

export const ProfileMenuView = () => {
  return {
    html: renderProfileMenu(),
    mount: mountProfileMenu
  };
};




