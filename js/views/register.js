// js/views/register.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { createView } from "../core/createView.js";

async function renderRegister() {
  return `
  <section style="
    min-height:100vh;
    width:100%;
    background: url('/img/inicio.jpg') center center / cover no-repeat;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
    box-sizing:border-box;
    position:relative;
  ">
    <div style="
      position:absolute;inset:0;
      background:rgba(2,6,23,0.55);
      pointer-events:none;
    "></div>

    <div style="
      position:relative;z-index:1;
      width:100%;max-width:400px;
      color:white;box-sizing:border-box;
    ">

      <!-- LOGO -->
      <div style="text-align:center;margin-bottom:32px;">
        <img src="/img/logo-qwiplus.png" style="
          width:260px;height:auto;
          margin-bottom:14px;object-fit:contain;
        ">
        <p style="margin:6px 0 0;color:#94a3b8;font-size:14px;">Crea tu cuenta gratis</p>
      </div>

      <!-- CARD -->
      <div style="
        background:rgba(6,11,28,0.70);
        border:1px solid rgba(34,211,238,0.20);
        border-radius:24px;
        padding:28px;
        backdrop-filter:blur(16px);
      ">

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
          <button id="backBtn" style="
            background:rgba(34,211,238,0.1);
            border:1px solid rgba(34,211,238,0.25);
            color:#22d3ee;font-size:18px;
            padding:4px 10px;border-radius:999px;cursor:pointer;
          ">←</button>
          <h2 style="margin:0;font-size:20px;font-weight:700;color:#f1f5f9;">Crear cuenta</h2>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;">

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">📧</span>
            <input id="emailInput" type="email" placeholder="Email" style="
              width:100%;height:50px;border-radius:14px;
              border:1px solid rgba(34,211,238,0.25);
              padding:0 16px 0 42px;font-size:15px;
              background:rgba(6,11,28,0.65);color:white;
              outline:none;box-sizing:border-box;transition:border 0.2s;
            "
              onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
              onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
            >
          </div>

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">🔒</span>
            <input id="passwordInput" type="password" placeholder="Contraseña (mín. 6)" style="
              width:100%;height:50px;border-radius:14px;
              border:1px solid rgba(34,211,238,0.25);
              padding:0 16px 0 42px;font-size:15px;
              background:rgba(6,11,28,0.65);color:white;
              outline:none;box-sizing:border-box;transition:border 0.2s;
            "
              onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
              onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
            >
          </div>

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">🔒</span>
            <input id="confirmInput" type="password" placeholder="Confirmar contraseña" style="
              width:100%;height:50px;border-radius:14px;
              border:1px solid rgba(34,211,238,0.25);
              padding:0 16px 0 42px;font-size:15px;
              background:rgba(6,11,28,0.65);color:white;
              outline:none;box-sizing:border-box;transition:border 0.2s;
            "
              onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
              onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
            >
          </div>

          <button id="registerBtn" style="
            height:52px;border:none;border-radius:16px;
            font-weight:800;color:#020617;font-size:16px;
            background:#22d3ee;
            box-shadow:0 0 20px rgba(34,211,238,0.35);
            cursor:pointer;margin-top:4px;width:100%;
            transition:0.2s;
          "
            onmouseover="this.style.boxShadow='0 0 30px rgba(34,211,238,0.6)'"
            onmouseout="this.style.boxShadow='0 0 20px rgba(34,211,238,0.35)'"
          >Crear cuenta</button>

        </div>

        <div id="registerError" style="
          display:none;margin-top:14px;
          color:#fca5a5;background:rgba(239,68,68,0.12);
          padding:12px;border-radius:12px;
          font-size:14px;font-weight:600;text-align:center;
        "></div>

        <div id="registerSuccess" style="
          display:none;margin-top:14px;
          color:#86efac;background:rgba(34,197,94,0.12);
          padding:12px;border-radius:12px;
          font-size:14px;font-weight:600;text-align:center;
        "></div>

      </div>

      <div style="text-align:center;margin-top:20px;">
        <button id="goLoginBtn" style="
          background:transparent;border:0;
          color:#22d3ee;font-weight:700;font-size:15px;cursor:pointer;
        ">¿Ya tienes cuenta? <span style="text-decoration:underline;">Iniciar sesión</span></button>
      </div>

    </div>
  </section>
  `;
}

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

    if (!email || !password || !confirm) { showError("Completa todos los campos"); return; }
    if (password.length < 6) { showError("La contraseña debe tener al menos 6 caracteres"); return; }
    if (password !== confirm) { showError("Las contraseñas no coinciden"); return; }

    setLoading(true);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });

      if (error) throw error;

      if(signUpData?.user){
        const userId = signUpData.user.id;
        const avatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${userId}`;
        await supabase.from("profiles").upsert({ id: userId, avatar_url: avatarUrl });
      }

      showSuccess("✅ Cuenta creada. Revisa tu email para confirmarla 📩");
      setTimeout(() => navigate("login"), 3000);

    } catch (err) {
      showError(err.message || "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  });
}

function unmountRegister() {}

export const RegisterView = createView(
  renderRegister,
  mountRegister,
  unmountRegister
);