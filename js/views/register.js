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
    background:linear-gradient(160deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
    box-sizing:border-box;
  ">

    <div style="
      width:100%;
      max-width:400px;
      color:white;
      box-sizing:border-box;
    ">

      <!-- LOGO -->
      <div style="text-align:center;margin-bottom:32px;">
        <img src="/img/logo-qwiplus.png" style="
          width:260px;height:auto;
          margin-bottom:14px;
          object-fit:contain;
          mix-blend-mode:lighten;
        ">
        <p style="margin:6px 0 0;color:#94a3b8;font-size:14px;">Crea tu cuenta gratis</p>
      </div>

      <!-- CARD -->
      <div style="
        background:rgba(255,255,255,0.05);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:24px;
        padding:28px;
        backdrop-filter:blur(12px);
      ">

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
          <button id="backBtn" style="
            background:none;border:none;
            color:#94a3b8;font-size:20px;cursor:pointer;
          ">←</button>
          <h2 style="margin:0;font-size:20px;font-weight:700;">Crear cuenta</h2>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;">

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">📧</span>
            <input id="emailInput" type="email" placeholder="Email" style="
              width:100%;height:50px;
              border-radius:14px;border:1.5px solid rgba(255,255,255,0.1);
              padding:0 16px 0 42px;font-size:15px;
              background:rgba(255,255,255,0.07);color:white;
              outline:none;box-sizing:border-box;
            ">
          </div>

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">🔒</span>
            <input id="passwordInput" type="password" placeholder="Contraseña (mín. 6 caracteres)" style="
              width:100%;height:50px;
              border-radius:14px;border:1.5px solid rgba(255,255,255,0.1);
              padding:0 16px 0 42px;font-size:15px;
              background:rgba(255,255,255,0.07);color:white;
              outline:none;box-sizing:border-box;
            ">
          </div>

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">🔒</span>
            <input id="confirmInput" type="password" placeholder="Confirmar contraseña" style="
              width:100%;height:50px;
              border-radius:14px;border:1.5px solid rgba(255,255,255,0.1);
              padding:0 16px 0 42px;font-size:15px;
              background:rgba(255,255,255,0.07);color:white;
              outline:none;box-sizing:border-box;
            ">
          </div>

          <button id="registerBtn" style="
            height:52px;border:0;border-radius:16px;
            font-weight:800;color:white;font-size:16px;
            background:linear-gradient(90deg,#6DA8FF,#6EE7B7);
            box-shadow:0 6px 20px rgba(109,168,255,0.35);
            cursor:pointer;margin-top:4px;width:100%;
          ">Crear cuenta</button>

        </div>

        <!-- ERROR -->
        <div id="registerError" style="
          display:none;margin-top:14px;
          color:#fca5a5;background:rgba(239,68,68,0.12);
          padding:12px;border-radius:12px;
          font-size:14px;font-weight:600;text-align:center;
        "></div>

        <!-- ÉXITO -->
        <div id="registerSuccess" style="
          display:none;margin-top:14px;
          color:#86efac;background:rgba(34,197,94,0.12);
          padding:12px;border-radius:12px;
          font-size:14px;font-weight:600;text-align:center;
        "></div>

      </div>

      <!-- FOOTER -->
      <div style="text-align:center;margin-top:20px;">
        <button id="goLoginBtn" style="
          background:transparent;border:0;
          color:#6DA8FF;font-weight:700;font-size:15px;cursor:pointer;
        ">¿Ya tienes cuenta? <span style="text-decoration:underline;">Iniciar sesión</span></button>
      </div>

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
  const goLoginBtn = document.getElementById("goLoginBtn");
  const registerBtn = document.getElementById("registerBtn");

  backBtn?.addEventListener("click", () => navigate("login"));
  goLoginBtn?.addEventListener("click", () => navigate("login"));

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

