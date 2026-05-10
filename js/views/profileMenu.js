// js/views/profileMenu.js

import { navigate } from "../core/router.js";
import { t } from "../services/langService.js";

/* ================= RENDER ================= */

function renderProfileMenu(){

  return `
  <section class="profile-menu">

    <div class="profile-top">
      <button id="backProfileMenu">← ${t("back")}</button>
    </div>

    <h2>${t("myAccount")}</h2>

    <div class="profile-menu-list">

      <button class="profile-menu-btn" data-view="profile">
        👤 ${t("viewProfile")}
      </button><br>

      <button class="profile-menu-btn" data-view="favorites">
        ❤️ ${t("favorites")}
      </button><br>

      <button class="profile-menu-btn" data-view="settings">
        ⚙️ ${t("config")}
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

