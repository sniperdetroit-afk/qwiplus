// js/views/settings.js

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

const EXISTING_VIEWS = ["editProfile"];

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
    opacity: 1;
    transition: opacity 0.3s;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function settingsItem(icon, label, view) {
  return `
    <button class="settings-item" data-view="${view}" style="
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 14px 16px;
      background: white;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 500;
      color: #111827;
      cursor: pointer;
      text-align: left;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      margin-bottom: 8px;
      transition: background 0.15s;
    ">
      <span style="font-size:20px;width:28px;text-align:center;">${icon}</span>
      <span style="flex:1;">${label}</span>
      <span style="color:#9ca3af;font-size:18px;">›</span>
    </button>
  `;
}

/* ================= RENDER ================= */

function renderSettings() {

  const langOptions = LANGUAGES.map(l => `
    <option value="${l.code}" ${getLang() === l.code ? "selected" : ""}>
      ${l.label}
    </option>
  `).join("");

  return `
  <section style="max-width:480px;margin:0 auto;padding:20px;padding-bottom:40px;">

    <!-- HEADER -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
      <button id="backSettings" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;padding:4px 8px;border-radius:8px;
      ">←</button>
      <h2 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Configuración</h2>
    </div>

    <!-- CUENTA -->
    <p style="font-size:12px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px 4px;">Cuenta</p>
    ${settingsItem("✏️", "Editar perfil", "editProfile")}
    ${settingsItem("✅", "Verificación", "verification")}
    ${settingsItem("🔒", "Seguridad", "security")}

    <!-- PAGOS -->
    <p style="font-size:12px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin:20px 0 10px 4px;">Pagos</p>
    ${settingsItem("📦", "Dirección de envío", "shipping")}
    ${settingsItem("💳", "Métodos de pago", "payments")}

    <!-- SISTEMA -->
    <p style="font-size:12px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin:20px 0 10px 4px;">Sistema</p>
    ${settingsItem("🔔", "Notificaciones", "notifications")}
    ${settingsItem("💡", "Sugerencias", "suggestions")}

    <!-- IDIOMA -->
    <p style="font-size:12px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin:20px 0 10px 4px;">🌐 Idioma</p>
    <div style="
      background:white;
      border-radius:14px;
      padding:4px 16px;
      box-shadow:0 1px 4px rgba(0,0,0,0.06);
    ">
      <select id="langSelect" style="
        width:100%;
        padding:14px 0;
        border:none;
        background:transparent;
        font-size:15px;
        font-weight:500;
        color:#111827;
        outline:none;
        cursor:pointer;
      ">
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
        const label = btn.querySelector("span:nth-child(2)")?.textContent.trim() || btn.textContent.trim();
        showComingSoon(label);
      }
    };
  });

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
