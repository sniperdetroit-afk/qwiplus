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
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    background:rgba(6,11,28,0.95);backdrop-filter:blur(10px);
    color:#22d3ee;padding:12px 20px;border-radius:999px;
    font-size:14px;font-weight:600;z-index:9999;
    box-shadow:0 4px 20px rgba(34,211,238,0.3);
    border:1px solid rgba(34,211,238,0.3);
    opacity:1;transition:opacity 0.3s;
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
      display:flex;align-items:center;gap:14px;
      width:100%;padding:16px 18px;
      background:rgba(6,11,28,0.65);
      border:1px solid rgba(34,211,238,0.15);
      border-radius:14px;font-size:15px;font-weight:500;
      color:#f1f5f9;cursor:pointer;text-align:left;
      backdrop-filter:blur(10px);margin-bottom:10px;
      transition:all 0.2s ease;
    "
    onmouseover="this.style.background='rgba(34,211,238,0.12)';this.style.borderColor='rgba(34,211,238,0.4)';"
    onmouseout="this.style.background='rgba(6,11,28,0.65)';this.style.borderColor='rgba(34,211,238,0.15)';"
    >
      <span style="font-size:20px;width:28px;text-align:center;">${icon}</span>
      <span style="flex:1;">${label}</span>
      <span style="color:#22d3ee;font-size:18px;font-weight:300;">›</span>
    </button>
  `;
}

function sectionTitle(label) {
  return `
    <p style="
      font-size:11px;font-weight:800;color:#22d3ee;
      letter-spacing:0.12em;text-transform:uppercase;
      margin:24px 0 12px 4px;
    ">${label}</p>
  `;
}

function renderSettings() {
  return `
  <section style="
    min-height:100vh;
    background:url('/img/settin.jpg') center center / cover no-repeat;
    position:relative;
  ">
    <div style="
      position:absolute;inset:0;
      background:linear-gradient(to bottom, rgba(2,6,23,0.88) 0%, rgba(2,6,23,0.75) 100%);
      pointer-events:none;
    "></div>

    <div style="position:relative;z-index:1;padding:20px;padding-bottom:100px;">
    <div style="max-width:480px;margin:0 auto;">

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
        <button id="backSettings" style="
          background:rgba(34,211,238,0.1);
          border:1px solid rgba(34,211,238,0.25);
          font-size:18px;cursor:pointer;color:#22d3ee;
          padding:6px 12px;border-radius:999px;
        ">←</button>
        <h2 style="margin:0;font-size:24px;font-weight:800;color:#f1f5f9;">Configuración</h2>
      </div>

      ${sectionTitle("⚡ Cuenta")}
      ${settingsItem("✏️", "Editar perfil", "editProfile")}
      ${settingsItem("✅", "Verificación", "verification")}
      ${settingsItem("🔒", "Seguridad", "security")}

      ${sectionTitle("💳 Pagos")}
      ${settingsItem("📦", "Dirección de envío", "shipping")}
      ${settingsItem("💳", "Métodos de pago", "payments")}

      ${sectionTitle("⚙️ Sistema")}
      ${settingsItem("🔔", "Notificaciones", "notifications")}
      ${settingsItem("💡", "Sugerencias", "suggestions")}

      ${sectionTitle("🌐 Idioma")}
      <div id="langSelector" style="
        background:rgba(6,11,28,0.65);
        border:1px solid rgba(34,211,238,0.15);
        border-radius:14px;padding:16px 18px;
        backdrop-filter:blur(10px);
        display:flex;align-items:center;gap:14px;
        cursor:pointer;transition:all 0.2s;
      "
      onmouseover="this.style.background='rgba(34,211,238,0.12)';this.style.borderColor='rgba(34,211,238,0.4)';"
      onmouseout="this.style.background='rgba(6,11,28,0.65)';this.style.borderColor='rgba(34,211,238,0.15)';"
      >
        <span style="font-size:20px;width:28px;text-align:center;">🌐</span>
        <span style="flex:1;font-size:15px;font-weight:500;color:#f1f5f9;" id="langLabel">
          ${LANGUAGES.find(l => l.code === getLang())?.label || "🇪🇸 Español"}
        </span>
        <span style="color:#22d3ee;font-size:18px;font-weight:300;">›</span>
      </div>

    </div>
    </div>
  </section>
  `;
}

function mountSettings() {
  document.getElementById("backSettings")?.addEventListener("click", () => navigate("profileMenu"));

  document.querySelectorAll(".settings-item[data-view]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const view = btn.dataset.view;
      if (!view) return;
      if (EXISTING_VIEWS.includes(view)) {
        navigate(view);
      } else {
        const label = btn.querySelector("span:nth-child(2)")?.textContent.trim() || "";
        showComingSoon(label);
      }
    };
  });

  document.getElementById("langSelector")?.addEventListener("click", () => openLanguageModal());
}

function openLanguageModal() {
  const currentLang = getLang();

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    z-index:9999;display:flex;align-items:flex-end;justify-content:center;
  `;

  const sheet = document.createElement("div");
  sheet.style.cssText = `
    width:100%;max-width:500px;
    background:#060b1c;border:1px solid rgba(34,211,238,0.2);
    border-radius:20px 20px 0 0;padding:20px 16px 24px;
    box-shadow:0 -8px 32px rgba(0,0,0,0.4);
  `;

  const optionsHTML = LANGUAGES.map(l => `
    <button class="lang-option" data-code="${l.code}" style="
      width:100%;padding:16px 18px;
      background:${l.code === currentLang ? 'rgba(34,211,238,0.12)' : 'transparent'};
      border:1px solid ${l.code === currentLang ? 'rgba(34,211,238,0.3)' : 'transparent'};
      border-radius:12px;margin-bottom:6px;
      display:flex;align-items:center;gap:14px;
      cursor:pointer;color:#f1f5f9;font-size:15px;font-weight:500;
      text-align:left;transition:all 0.15s;
    ">
      <span style="flex:1;">${l.label}</span>
      ${l.code === currentLang ? '<span style="color:#22d3ee;font-size:18px;font-weight:700;">✓</span>' : ''}
    </button>
  `).join("");

  sheet.innerHTML = `
    <div style="width:40px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 20px;"></div>
    <h3 style="margin:0 0 16px 6px;font-size:18px;font-weight:700;color:#f1f5f9;">🌐 Seleccionar idioma</h3>
    <div>${optionsHTML}</div>
    <button id="closeLangModal" style="
      width:100%;margin-top:12px;padding:14px;
      background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
      border-radius:12px;color:#94a3b8;font-size:15px;font-weight:600;cursor:pointer;
    ">Cancelar</button>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
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

export const SettingsView = () => {
  return {
    html: renderSettings(),
    mount: mountSettings
  };
};