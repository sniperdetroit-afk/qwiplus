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

    <div style="
      background:white;
      border:1px solid #e5e7eb;
      border-radius:16px;
      overflow:hidden;
      box-shadow:0 1px 3px rgba(0,0,0,0.04);
    ">

      <button class="profile-menu-btn" data-view="profile" style="
        display:flex;align-items:center;gap:14px;
        width:100%;padding:16px 18px;
        background:white;border:none;
        border-bottom:1px solid #f3f4f6;
        cursor:pointer;text-align:left;
        transition:background 0.15s;
      " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
        <div style="
          width:36px;height:36px;border-radius:10px;
          background:#eff6ff;color:#3b82f6;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;flex-shrink:0;
        ">👤</div>
        <span style="flex:1;font-size:15px;font-weight:600;color:#111827;">${t("viewProfile")}</span>
        <span style="color:#d1d5db;font-size:20px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="favorites" style="
        display:flex;align-items:center;gap:14px;
        width:100%;padding:16px 18px;
        background:white;border:none;
        border-bottom:1px solid #f3f4f6;
        cursor:pointer;text-align:left;
        transition:background 0.15s;
      " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
        <div style="
          width:36px;height:36px;border-radius:10px;
          background:#fef2f2;color:#ef4444;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;flex-shrink:0;
        ">❤️</div>
        <span style="flex:1;font-size:15px;font-weight:600;color:#111827;">${t("favorites")}</span>
        <span style="color:#d1d5db;font-size:20px;">›</span>
      </button>

      <button class="profile-menu-btn" data-view="settings" style="
        display:flex;align-items:center;gap:14px;
        width:100%;padding:16px 18px;
        background:white;border:none;
        cursor:pointer;text-align:left;
        transition:background 0.15s;
      " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
        <div style="
          width:36px;height:36px;border-radius:10px;
          background:#f0fdf4;color:#10b981;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;flex-shrink:0;
        ">⚙️</div>
        <span style="flex:1;font-size:15px;font-weight:600;color:#111827;">${t("config")}</span>
        <span style="color:#d1d5db;font-size:20px;">›</span>
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



