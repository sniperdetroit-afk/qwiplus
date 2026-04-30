// js/views/profileMenu.js

import { navigate } from "../core/router.js";

/* ================= RENDER ================= */

function renderProfileMenu(){

  return `
  <section class="profile-menu">

    <div class="profile-top">
      <button id="backProfileMenu">← Volver</button>
    </div>

    <h2>Mi cuenta</h2>

    <div class="profile-menu-list">

      <button class="profile-menu-btn" data-view="profile">
        👤 Ver perfil
      </button><br>

      <button class="profile-menu-btn" data-view="favorites">
        ❤️ Favoritos
      </button><br>

      <button class="profile-menu-btn" data-view="settings">
        ⚙️ Configuración
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
