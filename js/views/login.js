// js/views/login.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { setState } from "../core/state.js";

let form;

/* ================= RENDER ================= */

async function renderLogin(){
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
          width:320px;height:auto;
          margin-bottom:14px;
          object-fit:contain;
        ">
        <p style="margin:6px 0 0;color:#94a3b8;font-size:14px;">Compra y vende lo que quieras</p>
      </div>

      <!-- CARD -->
      <div style="
        background:rgba(255,255,255,0.05);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:24px;
        padding:28px;
        backdrop-filter:blur(12px);
      ">

        <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;">Iniciar sesión</h2>

        <form id="loginForm" style="display:flex;flex-direction:column;gap:12px;">

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">📧</span>
            <input id="email" type="email" placeholder="Email" required style="
              width:100%;height:50px;
              border-radius:14px;border:1.5px solid rgba(255,255,255,0.1);
              padding:0 16px 0 42px;
              font-size:15px;
              background:rgba(255,255,255,0.07);
              color:white;
              outline:none;
              box-sizing:border-box;
              transition:border 0.2s;
            ">
          </div>

          <div style="position:relative;">
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;">🔒</span>
            <input id="password" type="password" placeholder="Contraseña" required style="
              width:100%;height:50px;
              border-radius:14px;border:1.5px solid rgba(255,255,255,0.1);
              padding:0 16px 0 42px;
              font-size:15px;
              background:rgba(255,255,255,0.07);
              color:white;
              outline:none;
              box-sizing:border-box;
              transition:border 0.2s;
            ">
          </div>

          <button type="submit" style="
            height:52px;border:0;border-radius:16px;
            font-weight:800;color:white;font-size:16px;
            background:linear-gradient(90deg,#6DA8FF,#6EE7B7);
            box-shadow:0 6px 20px rgba(109,168,255,0.35);
            cursor:pointer;margin-top:4px;
            transition:opacity 0.2s;
          ">Entrar</button>

        </form>

        <!-- DIVIDER -->
        <div style="display:flex;align-items:center;gap:10px;margin:18px 0;">
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1);"></div>
          <span style="color:#64748b;font-size:12px;">o continúa con</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1);"></div>
        </div>

        <!-- OAUTH -->
        <div style="display:flex;gap:10px;">

          <button id="googleBtn" style="
            flex:1;height:46px;border-radius:14px;border:1.5px solid rgba(255,255,255,0.1);
            background:rgba(255,255,255,0.07);color:white;
            font-weight:700;font-size:14px;cursor:pointer;
            display:flex;align-items:center;justify-content:center;gap:8px;
          ">
            <span style="font-size:18px;">G</span> Google
          </button>

          <button id="facebookBtn" style="
            flex:1;height:46px;border-radius:14px;border:0;
            background:#1877f2;color:white;
            font-weight:700;font-size:14px;cursor:pointer;
            display:flex;align-items:center;justify-content:center;gap:8px;
          ">
            <span style="font-size:18px;">f</span> Facebook
          </button>

        </div>

        <!-- ERROR -->
        <div id="loginError" style="
          display:none;margin-top:14px;
          color:#fca5a5;background:rgba(239,68,68,0.12);
          padding:12px;border-radius:12px;font-size:14px;font-weight:600;
          text-align:center;
        "></div>

      </div>

      <!-- FOOTER LINKS -->
      <div style="text-align:center;margin-top:20px;display:flex;flex-direction:column;gap:10px;">

        <button id="registerBtn" style="
          background:transparent;border:0;
          color:#6DA8FF;font-weight:700;font-size:15px;cursor:pointer;
        ">¿No tienes cuenta? <span style="text-decoration:underline;">Crear cuenta</span></button>

        <button id="guestBtn" style="
          background:transparent;border:0;
          color:#64748b;font-size:13px;cursor:pointer;
        ">Continuar sin registrarse →</button>

      </div>

    </div>

  </section>
  `;
} 

/* ================= HELPERS ================= */

const getRedirectTo = () => window.location.origin;

const forceAuthLayout = () => {
  const header = document.getElementById("appHeader");
  const nav = document.getElementById("bottomNav");
  if(header) header.style.display = "none";
  if(nav) nav.style.display = "none";
  document.body.style.background = "#0f172a";
};

const setLoading = (loading) => {
  const btn = form?.querySelector("button[type='submit']");
  if(!btn) return;
  btn.disabled = loading;
  btn.innerText = loading ? "Entrando..." : "Entrar";
};

const showError = (msg) => {
  const errorBox = document.getElementById("loginError");
  if(!errorBox) return;
  errorBox.innerText = msg;
  errorBox.style.display = "block";
};

const clearError = () => {
  const errorBox = document.getElementById("loginError");
  if(!errorBox) return;
  errorBox.innerText = "";
  errorBox.style.display = "none";
};

/* ================= MOUNT ================= */

async function mountLogin(){

  forceAuthLayout();

  form = document.getElementById("loginForm");
  const registerBtn = document.getElementById("registerBtn");
  const guestBtn = document.getElementById("guestBtn");
  const googleBtn = document.getElementById("googleBtn");
  const facebookBtn = document.getElementById("facebookBtn");

  if(!form) return;

  const { data } = await supabase.auth.getSession();
  if(data.session){
    navigate("home");
    return;
  }

  const redirectTo = getRedirectTo();

  form.onsubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try{
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if(error) throw error;

      setState({ session:{ user:data.user }, guest:false });
      navigate("home");

    }catch(err){
      showError(err.message || "Email o contraseña incorrectos");
    }finally{
      setLoading(false);
    }
  };

  registerBtn?.addEventListener("click", () => navigate("register"));

  if(googleBtn){
    googleBtn.onclick = async () => {
      clearError();
      const { error } = await supabase.auth.signInWithOAuth({
        provider:"google",
        options:{ redirectTo }
      });
      if(error) showError("Error con Google");
    };
  }

  if(facebookBtn){
    facebookBtn.onclick = async () => {
      clearError();
      const { error } = await supabase.auth.signInWithOAuth({
        provider:"facebook",
        options:{ redirectTo }
      });
      if(error) showError("Error con Facebook");
    };
  }

  if(guestBtn){
    guestBtn.onclick = () => {
      setState({ session:{ user:null }, guest:true });
      navigate("home");
    };
  }
}

/* ================= UNMOUNT ================= */

async function unmountLogin(){
  form = null;
}

/* ================= EXPORT ================= */

export const LoginView = async () => {
  const html = await renderLogin();
  return {
    html,
    mount: mountLogin,
    unmount: unmountLogin
  };
};


