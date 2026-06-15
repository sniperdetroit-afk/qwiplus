// js/views/protection.js

import { navigate } from "../core/router.js";
import { createView } from "../core/createView.js";

async function renderProtection(){
  return `
  <section style="
    min-height:100vh;
    background: url('/img/escudo.jpg') center center / cover no-repeat;
    position:relative;
    display:flex;align-items:center;justify-content:center;
  ">
    <div style="
      position:absolute;inset:0;
      background:rgba(2,6,23,0.75);
      pointer-events:none;
    "></div>
    <div style="position:relative;z-index:1;padding:24px;max-width:480px;width:100%;text-align:center;">

      <button id="backProtection" style="
        position:absolute;top:0;left:0;
        background:rgba(34,211,238,0.1);
        border:1px solid rgba(34,211,238,0.25);
        color:#22d3ee;font-size:18px;
        padding:6px 12px;border-radius:999px;cursor:pointer;
      ">←</button>

      <div style="font-size:64px;margin-bottom:20px;">🛡️</div>
      <h1 style="margin:0 0 12px;font-size:26px;font-weight:900;color:#f1f5f9;">Protección Qwiplus</h1>
      <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin-bottom:32px;">
        Estamos trabajando en un sistema de protección para compradores y vendedores. Próximamente disponible.
      </p>

      <div style="
        background:rgba(34,211,238,0.08);
        border:1px solid rgba(34,211,238,0.2);
        border-radius:18px;padding:24px;
        backdrop-filter:blur(12px);
      ">
        <p style="margin:0;font-size:13px;color:#64748b;">🔒 Pagos seguros</p>
        <p style="margin:8px 0 0;font-size:13px;color:#64748b;">⚖️ Resolución de disputas</p>
        <p style="margin:8px 0 0;font-size:13px;color:#64748b;">✅ Verificación de usuarios</p>
        <p style="margin:16px 0 0;font-size:12px;font-weight:700;color:#22d3ee;">Próximamente</p>
      </div>

    </div>
  </section>
  `;
}

function mountProtection(){
  document.getElementById("backProtection")
    ?.addEventListener("click", () => navigate("profileMenu"));
}

function unmountProtection(){}

export const ProtectionView = createView(
  renderProtection,
  mountProtection,
  unmountProtection
);