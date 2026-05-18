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

const EXISTING_VIEWS = ["editProfile", "suggestions"];


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
      <div id="langSelector" style="
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 16px 18px;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        <span style="font-size:20px;width:28px;text-align:center;">🌐</span>
        <span style="flex:1;font-size:15px;font-weight:500;color:#F5F7FA;" id="langLabel">
          ${LANGUAGES.find(l => l.code === getLang())?.label || "🇪🇸 Español"}
        </span>
        <span style="color:#38BDF8;font-size:18px;font-weight:300;">›</span>
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

  const langSelector = document.getElementById("langSelector");
  if (langSelector) {
    langSelector.onclick = () => openLanguageModal();
  }
}

/* ================= MODAL IDIOMA ================= */

function openLanguageModal() {
  const currentLang = getLang();

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    z-index:9999;display:flex;align-items:flex-end;justify-content:center;
    animation:fadeIn 0.2s ease;
  `;

  const sheet = document.createElement("div");
  sheet.style.cssText = `
    width:100%;max-width:500px;
    background:linear-gradient(180deg, #12161D 0%, #1a1f2e 100%);
    border-radius:20px 20px 0 0;
    padding:20px 16px 24px;
    box-shadow:0 -8px 32px rgba(0,0,0,0.4);
    border-top:1px solid rgba(255,255,255,0.08);
  `;

  const optionsHTML = LANGUAGES.map(l => `
    <button class="lang-option" data-code="${l.code}" style="
      width:100%;padding:16px 18px;
      background:${l.code === currentLang ? 'rgba(56,189,248,0.12)' : 'transparent'};
      border:1px solid ${l.code === currentLang ? 'rgba(56,189,248,0.3)' : 'transparent'};
      border-radius:12px;margin-bottom:6px;
      display:flex;align-items:center;gap:14px;
      cursor:pointer;
      color:#F5F7FA;font-size:15px;font-weight:500;
      text-align:left;
      transition:all 0.15s;
    ">
      <span style="flex:1;">${l.label}</span>
      ${l.code === currentLang ? '<span style="color:#38BDF8;font-size:18px;font-weight:700;">✓</span>' : ''}
    </button>
  `).join("");

  sheet.innerHTML = `
    <div style="width:40px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;margin:0 auto 20px;"></div>

    <h3 style="
      margin:0 0 16px 6px;
      font-size:18px;font-weight:700;color:#F5F7FA;
    ">🌐 Seleccionar idioma</h3>

    <div>${optionsHTML}</div>

    <button id="closeLangModal" style="
      width:100%;margin-top:12px;padding:14px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.1);
      border-radius:12px;
      color:#F5F7FA;font-size:15px;font-weight:600;cursor:pointer;
    ">Cancelar</button>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  sheet.querySelector("#closeLangModal").onclick = () => overlay.remove();

  sheet.querySelectorAll(".lang-option").forEach(btn => {
    btn.onclick = () => {
      const newLang = btn.dataset.code;
      if (newLang !== currentLang) {
        setLang(newLang);
        window.location.href = "/";
      } else {
        overlay.remove();
      }
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