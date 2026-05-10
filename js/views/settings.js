import { navigate } from "../core/router.js";
import { t, getLang, setLang } from "../services/langService.js";

const LANGUAGES = [
  { code: "es", label: "🇪🇸 Español" },
  { code: "en", label: "🇬🇧 English" },
  { code: "ar", label: "🇸🇦 العربية" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "it", label: "🇮🇹 Italiano" },
];

// Vistas que SÍ existen en el router
const EXISTING_VIEWS = ["editProfile"];

// Toast "Próximamente"
function showComingSoon(label) {
  const existing = document.getElementById("qw-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "qw-toast";
  toast.textContent = `${label} — Próximamente 🚧`;
  toast.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    padding: 12px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    transition: opacity 0.3s;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* ================= RENDER ================= */

function renderSettings() {

  const langOptions = LANGUAGES.map(l => `
    <option value="${l.code}" ${getLang() === l.code ? "selected" : ""}>
      ${l.label}
    </option>
  `).join("");

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

    <div class="settings-group">
      <h3>🌐 Idioma</h3>

      <select class="input-field" id="langSelect" style="margin-top:8px;">
        ${langOptions}
      </select>
    </div>

  </section>
  `;
}

/* ================= MOUNT ================= */

function mountSettings() {

  const back = document.getElementById("backSettings");
  if (back) {
    back.onclick = () => navigate("profileMenu");
  }

  const buttons = document.querySelectorAll(".settings-item[data-view]");

  buttons.forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const view = btn.dataset.view;
      if (!view) return;

      if (EXISTING_VIEWS.includes(view)) {
        navigate(view);
      } else {
        const label = btn.textContent.trim();
        showComingSoon(label);
      }
    };
  });

  // IDIOMA
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      setLang(e.target.value);
      window.location.href = "/";
    });
  }
}

/* ================= EXPORT ================= */

export const SettingsView = () => {
  return {
    html: renderSettings(),
    mount: mountSettings
  };
};