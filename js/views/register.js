// js/views/register.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { createView } from "../core/createView.js";

/* ================= RENDER ================= */

async function renderRegister() {
  return `
  <section style="
    min-height:100vh;
    width:100%;
    background:#020617;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
    box-sizing:border-box;
  ">
    <div style="
      width:100%;
      max-width:420px;
      background:rgba(15,23,42,.92);
      border-radius:28px;
      padding:30px;
      box-shadow:0 30px 80px rgba(0,0,0,.45);
      color:white;
      box-sizing:border-box;
    ">

      <button id="backBtn" style="
        background:none;
        border:none;
        color:#94a3b8;
        font-size:14px;
        cursor:pointer;
        margin-bottom:16px;
        padding:0;
      ">← Volver</button>

      <h1 style="margin:0 0 6px;font-size:30px;font-weight:800;">Crear cuenta</h1>
      <p style="margin:0 0 24px;color:#cbd5e1;">Únete a Qwiplus</p>

      <div style="display:flex;flex-direction:column;gap:12px;">

        <input id="emailInput" type="email" placeholder="Email" style="
          height:48px;
          border-radius:14px;
          border:0;
          padding:0 16px;
          font-size:16px;
          box-sizing:border-box;
          width:100%;
        ">

        <input id="passwordInput" type="password" placeholder="Contraseña (mín. 6 caracteres)" style="
          height:48px;
          border-radius:14px;
          border:0;
          padding:0 16px;
          font-size:16px;
          box-sizing:border-box;
          width:100%;
        ">

        <input id="confirmInput" type="password" placeholder="Confirmar contraseña" style="
          height:48px;
          border-radius:14px;
          border:0;
          padding:0 16px;
          font-size:16px;
          box-sizing:border-box;
          width:100%;
        ">

        <button id="registerBtn" style="
          height:50px;
          border:0;
          border-radius:16px;
          font-weight:800;
          color:white;
          background:linear-gradient(90deg,#60a5fa,#22c55e);
          font-size:16px;
          cursor:pointer;
          width:100%;
        ">Crear cuenta</button>

      </div>

      <div id="registerError" style="
        display:none;
        margin-top:14px;
        color:#fecaca;
        background:rgba(239,68,68,.16);
        padding:12px;
        border-radius:12px;
        font-weight:700;
      "></div>

      <div id="registerSuccess" style="
        display:none;
        margin-top:14px;
        color:#bbf7d0;
        background:rgba(34,197,94,.16);
        padding:12px;
        border-radius:12px;
        font-weight:700;
      "></div>

    </div>
  </section>
  `;
}

/* ================= HELPERS ================= */

function showError(msg) {
  const el = document.getElementById("registerError");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  const s = document.getElementById("registerSuccess");
  if (s) s.style.display = "none";
}

function showSuccess(msg) {
  const el = document.getElementById("registerSuccess");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  const e = document.getElementById("registerError");
  if (e) e.style.display = "none";
}

function setLoading(loading) {
  const btn = document.getElementById("registerBtn");
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Creando cuenta..." : "Crear cuenta";
}

/* ================= MOUNT ================= */

async function mountRegister() {

  const backBtn = document.getElementById("backBtn");
  const registerBtn = document.getElementById("registerBtn");

  backBtn?.addEventListener("click", () => navigate("login"));

  registerBtn?.addEventListener("click", async () => {

    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value;
    const confirm = document.getElementById("confirmInput").value;

    if (!email || !password || !confirm) {
      showError("Completa todos los campos");
      return;
    }

    if (password.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirm) {
      showError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      showSuccess("✅ Cuenta creada. Revisa tu email para confirmarla 📩");

      setTimeout(() => navigate("login"), 3000);

    } catch (err) {
      showError(err.message || "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  });
}

/* ================= UNMOUNT ================= */

function unmountRegister() {}

export const RegisterView = createView(
  renderRegister,
  mountRegister,
  unmountRegister
);
