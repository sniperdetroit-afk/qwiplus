import { navigate } from "../core/router.js";

/* ================= RENDER ================= */

function renderSettings(){

  return `
  <section class="settings-page">

    <div class="profile-top">
      <button id="backSettings">← Volver</button>
    </div>

    <h2>Configuración</h2>

    <div class="settings-group">
      <h3>Cuenta</h3>

      <button class="settings-item" data-view="editProfile">
        Editar perfil
      </button>

      <button class="settings-item" data-view="verification">
        Verificación
      </button>

      <button class="settings-item" data-view="security">
        Seguridad
      </button>
    </div>

    <div class="settings-group">
      <h3>Pagos</h3>

      <button class="settings-item" data-view="shipping">
        Dirección de envío
      </button>

      <button class="settings-item" data-view="payments">
        Métodos de pago
      </button>
    </div>

    <div class="settings-group">
      <h3>Sistema</h3>

      <button class="settings-item" data-view="notifications">
        Notificaciones
      </button>

      <button class="settings-item" data-view="suggestions">
        Sugerencias
      </button>
    </div>

  </section>
  `;
}

/* ================= MOUNT ================= */

function mountSettings(){

  const back = document.getElementById("backSettings");

  if(back){
    back.onclick = () => navigate("profileMenu");
  }

  // 🔥 CLAVE: activar todos los botones automáticamente
  const buttons = document.querySelectorAll(".settings-item[data-view]");

  buttons.forEach(btn => {
    btn.onclick = () => {
      const view = btn.dataset.view;
      if(view) navigate(view);
    };
  });

}

/* ================= EXPORT ================= */

export const SettingsView = () => {
  return {
    html: renderSettings(),
    mount: mountSettings
  };
};