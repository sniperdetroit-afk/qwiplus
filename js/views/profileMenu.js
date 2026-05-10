// js/views/profileMenu.js

import { navigate } from "../core/router.js";
import { t } from "../services/langService.js";

function renderProfileMenu(){
  return `
  <section style="max-width:480px;margin:0 auto;padding:24px 20px;">

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
      <button id="backProfileMenu" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;padding:4px 8px;border-radius:8px;
      ">←</button>
      <h2 style="margin:0;font-size:24px;font-weight:800;color:#111827;">${t("myAccount")}</h2>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;">

      <button class="profile-menu-btn" data-view="profile" style="
        display:flex;align-items:center;gap:12px;
        width:100%;padding:12px 16px;
        background:linear-gradient(135deg,#3b82f6,#6366f1);
        border:none;border-radius:14px;
        font-size:14px;font-weight:700;color:white;
        cursor:pointer;text-align:left;
        box-shadow:0 4px 14px rgba(99,102,241,0.35);
      ">
        <span style="font-size:18px;">👤</span>
        <span style="flex:1;">${t("viewProfile")}</span>
        <span style="opacity:0.7;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="favorites" style="
        display:flex;align-items:center;gap:12px;
        width:100%;padding:12px 16px;
        background:linear-gradient(135deg,#ec4899,#f43f5e);
        border:none;border-radius:14px;
        font-size:14px;font-weight:700;color:white;
        cursor:pointer;text-align:left;
        box-shadow:0 4px 14px rgba(244,63,94,0.35);
      ">
        <span style="font-size:18px;">❤️</span>
        <span style="flex:1;">${t("favorites")}</span>
        <span style="opacity:0.7;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="settings" style="
        display:flex;align-items:center;gap:12px;
        width:100%;padding:12px 16px;
        background:linear-gradient(135deg,#10b981,#059669);
        border:none;border-radius:14px;
        font-size:14px;font-weight:700;color:white;
        cursor:pointer;text-align:left;
        box-shadow:0 4px 14px rgba(16,185,129,0.35);
      ">
        <span style="font-size:18px;">⚙️</span>
        <span style="flex:1;">${t("config")}</span>
        <span style="opacity:0.7;font-size:18px;">›</span>
      </button>

    </div>

  </section>
  `;
}

function mountProfileMenu(){
  const back = document.getElementById("backProfileMenu");
  if(back) back.onclick = () => navigate("home");
}

export const ProfileMenuView = () => {
  return {
    html: renderProfileMenu(),
    mount: mountProfileMenu
  };
};



