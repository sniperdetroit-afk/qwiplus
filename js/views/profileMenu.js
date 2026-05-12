// js/views/profileMenu.js

import { navigate } from "../core/router.js";
import { t } from "../services/langService.js";

function renderProfileMenu(){
  return `
  <section style="max-width:480px;margin:0 auto;padding:24px 20px;">

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
      <button id="backProfileMenu" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;padding:4px 8px;border-radius:8px;
      ">←</button>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#111827;">${t("myAccount")}</h2>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;">

      <button class="profile-menu-btn" data-view="profile" style="
        display:flex;align-items:center;gap:12px;
        width:100%;padding:16px 20px;
        background:linear-gradient(90deg,#3b82f6,#22c55e);
        border:none;border-radius:999px;
        font-size:15px;font-weight:700;color:white;
        cursor:pointer;
      ">
        <span style="font-size:18px;">👤</span>
        <span style="flex:1;text-align:center;">${t("viewProfile")}</span>
        <span style="opacity:0.8;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="favorites" style="
        display:flex;align-items:center;gap:12px;
        width:100%;padding:16px 20px;
        background:linear-gradient(90deg,#3b82f6,#22c55e);
        border:none;border-radius:999px;
        font-size:15px;font-weight:700;color:white;
        cursor:pointer;
      ">
        <span style="font-size:18px;">❤️</span>
        <span style="flex:1;text-align:center;">${t("favorites")}</span>
        <span style="opacity:0.8;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="settings" style="
        display:flex;align-items:center;gap:12px;
        width:100%;padding:16px 20px;
        background:linear-gradient(90deg,#3b82f6,#22c55e);
        border:none;border-radius:999px;
        font-size:15px;font-weight:700;color:white;
        cursor:pointer;
      ">
        <span style="font-size:18px;">⚙️</span>
        <span style="flex:1;text-align:center;">${t("config")}</span>
        <span style="opacity:0.8;font-size:18px;">›</span>
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



