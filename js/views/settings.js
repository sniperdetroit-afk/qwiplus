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
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    color: white;
    padding: 12px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
    border: 1px solid rgba(56, 189, 248, 0.3);
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
      padding: 16px 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      font-size: 15px;
      font-weight: 500;
      color: #F5F7FA;
      cursor: pointer;
      text-align: left;
      backdrop-filter: blur(10px);
      margin-bottom: 10px;
      transition: all 0.2s ease;
    "
    onmouseover="this.style.background='rgba(56, 189, 248, 0.12)';this.style.borderColor='rgba(56, 189, 248, 0.4)';"
    onmouseout="this.style.background='rgba(255, 255, 255, 0.05)';this.style.borderColor='rgba(255, 255, 255, 0.08)';"
    >
      <span style="font-size:20px;width:28px;text-align:center;">${icon}</span>
      <span style="flex:1;">${label}</span>
      <span style="color:#38BDF8;font-size:18px;font-weight:300;">›</span>
    </button>
  `;
}

/* ================= RENDER ================= */

function renderSettings() {

  const langOptions = LANGUAGES.map(l => `
    <option value="${l.code}" ${getLang() === l.code ? "selected" : ""} style="background:#0B0F14;color:#F5F7FA;">
      ${l.label}
    </option>
  `).join("");

  return `
  <section style="
    min-height: 100vh;
    background: linear-gradient(180deg, #0B0F14 0%, #12161D 50%, #1a1f2e 100%);
    padding: 20px;
    padding-bottom: 100px;
  ">
    <div style="max-width:480px;margin:0 auto;">

      <!-- HEADER -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
        <button id="backSettings" style="
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 20px;
          cursor: pointer;
          color: #F5F7FA;
          padding: 8px 14px;
          border-radius: 12px;
          transition: all 0.2s;
        "
        onmouseover="this.style.background='rgba(56, 189, 248, 0.15)';"
        onmouseout="this.style.background='rgba(255, 255, 255, 0.05)';"
        >←</button>
        <h2 style="
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          color: #F5F7FA;
          letter-spacing: -0.02em;
        ">Configuración</h2>
      </div>

      <!-- CUENTA -->
      <p style="
        font-size: 11px;
        font-weight: 800;
        color: #F5B942;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin: 0 0 12px 4px;
      ">⚡ Cuenta</p>
      ${settingsItem("✏️", "Editar perfil", "editProfile")}
      ${settingsItem("✅", "Verificación", "verification")}
      ${settingsItem("🔒", "Seguridad", "security")}

      <!-- PAGOS -->
      <p style="
        font-size: 11px;
        font-weight: 800;
        color: #F5B942;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin: 24px 0 12px 4px;
      ">💳 Pagos</p>
      ${settingsItem("📦", "Dirección de envío", "shipping")}
      ${settingsItem("💳", "Métodos de pago", "payments")}

      <!-- SISTEMA -->
      <p style="
        font-size: 11px;
        font-weight: 800;
        color: #F5B942;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin: 24px 0 12px 4px;
      ">⚙️ Sistema</p>
      ${settingsItem("🔔", "Notificaciones", "notifications")}
      ${settingsItem("💡", "Sugerencias", "suggestions")}

      <!-- IDIOMA -->
      <p style="
        font-size: 11px;
        font-weight: 800;
        color: #F5B942;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin: 24px 0 12px 4px;
      ">🌐 Idioma</p>
      <div style="
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 4px 16px;
        backdrop-filter: blur(10px);
        transition: all 0.2s;
      ">
        <select id="langSelect" style="
          width: 100%;
          padding: 14px 0;
          border: none;
          background: transparent;
          font-size: 15px;
          font-weight: 500;
          color: #F5F7FA;
          outline: none;
          cursor: pointer;
        ">
          ${langOptions}
        </select>
      </div>

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
