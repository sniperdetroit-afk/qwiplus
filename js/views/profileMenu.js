// js/views/profileMenu.js

import { navigate } from "../core/router.js";
import { t } from "../services/langService.js";

function renderProfileMenu(){
  return `
  <section style="
    min-height: 100vh;
    background: url('/img/escudo.jpg') center center / cover no-repeat;
    position: relative;
    max-width: 480px;
    margin: 0 auto;
  ">

    <!-- overlay oscuro para legibilidad -->
    <div style="
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(2,6,23,0.55), rgba(2,6,23,0.75));
    "></div>

    <!-- contenido -->
    <div style="position: relative; z-index: 1; padding: 24px 20px;">

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

        <button class="profile-menu-btn" data-view="reputation">
          <span style="font-size:18px;">⭐</span>
          <span style="flex:1;text-align:center;">Mi reputación</span>
          <span style="opacity:0.6;font-size:18px;">›</span>
        </button>

        <button class="profile-menu-btn" data-view="protection">
          <span style="font-size:18px;">🛡️</span>
          <span style="flex:1;text-align:center;">Protección Qwiplus</span>
          <span style="opacity:0.6;font-size:18px;">›</span>
        </button>

        <button class="profile-menu-btn" data-view="settings">
          <span style="font-size:18px;">⚙️</span>
          <span style="flex:1;text-align:center;">${t("config")}</span>
          <span style="opacity:0.6;font-size:18px;">›</span>
        </button>

      </div>
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





