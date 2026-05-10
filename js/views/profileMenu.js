// js/views/profileMenu.js

import { navigate } from "../core/router.js";
import { t } from "../services/langService.js";

/* ================= RENDER ================= */

function renderProfileMenu(){
  return `
  <section style="max-width:480px;margin:0 auto;padding:20px;">

    <!-- HEADER -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
      <button id="backProfileMenu" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;padding:4px 8px;border-radius:8px;
      ">←</button>
      <h2 style="margin:0;font-size:22px;font-weight:700;color:#111827;">${t("myAccount")}</h2>
    </div>

    <!-- OPCIONES -->
    <div style="display:flex;flex-direction:column;gap:8px;">

      <button class="profile-menu-btn" data-view="profile" style="
        display:flex;align-items:center;gap:14px;
        width:100%;padding:16px;
        background:white;border:none;border-radius:14px;
        font-size:15px;font-weight:500;color:#111827;
        cursor:pointer;text-align:left;
        box-shadow:0 1px 4px rgba(0,0,0,0.06);
      ">
        <span style="font-size:20px;width:28px;text-align:center;">👤</span>
        <span style="flex:1;">${t("viewProfile")}</span>
        <span style="color:#9ca3af;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="favorites" style="
        display:flex;align-items:center;gap:14px;
        width:100%;padding:16px;
        background:white;border:none;border-radius:14px;
        font-size:15px;font-weight:500;color:#111827;
        cursor:pointer;text-align:left;
        box-shadow:0 1px 4px rgba(0,0,0,0.06);
      ">
        <span style="font-size:20px;width:28px;text-align:center;">❤️</span>
        <span style="flex:1;">${t("favorites")}</span>
        <span style="color:#9ca3af;font-size:18px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="settings" style="
        display:flex;align-items:center;gap:14px;
        width:100%;padding:16px;
        background:white;border:none;border-radius:14px;
        font-size:15px;font-weight:500;color:#111827;
        cursor:pointer;text-align:left;
        box-shadow:0 1px 4px rgba(0,0,0,0.06);
      ">
        <span style="font-size:20px;width:28px;text-align:center;">⚙️</span>
        <span style="flex:1;">${t("config")}</span>
        <span style="color:#9ca3af;font-size:18px;">›</span>
      </button>

    </div>

  </section>
  `;
}

/* ================= MOUNT ================= */

function mountProfileMenu(){
  const back = document.getElementById("backProfileMenu");
  if(back){
    back.onclick = () => navigate("home");
  }
}

/* ================= EXPORT ================= */

export const ProfileMenuView = () => {
  return {
    html: renderProfileMenu(),
    mount: mountProfileMenu
  };
};


