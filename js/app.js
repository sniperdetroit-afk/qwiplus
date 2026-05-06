// js/views/login.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { setState } from "../core/state.js";

let form;

/* ================= RENDER ================= */

async function renderLogin(){

  return `
  <section class="login-page" style="
    min-height:100vh;
    width:100%;
    background:#020617;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
    box-sizing:border-box;
  ">

    <div class="login-card" style="
      width:100%;
      max-width:420px;
      background:rgba(15,23,42,.92);
      border-radius:28px;
      padding:30px;
      box-shadow:0 30px 80px rgba(0,0,0,.45);
      color:white;
      box-sizing:border-box;
    ">

      <h1 style="margin:0 0 6px;font-size:34px;font-weight:800;">Bienvenido</h1>
      <p style="margin:0 0 22px;color:#cbd5e1;">Accede o crea tu cuenta</p>

      <form id="loginForm" style="display:flex;flex-direction:column;gap:12px;">
        <input id="email" type="email" placeholder="Email" required style="
          height:48px;
          border-radius:14px;
          border:0;
          padding:0 16px;
          font-size:16px;
        ">

        <input id="password" type="password" placeholder="Password" required style="
          height:48px;
          border-radius:14px;
          border:0;
          padding:0 16px;
          font-size:16px;
        ">

        <button type="submit" style="
          height:50px;
          border:0;
          border-radius:16px;
          font-weight:800;
          color:white;
          background:linear-gradient(90deg,#60a5fa,#22c55e);
          font-size:16px;
        ">Entrar</button>
      </form>

      <button id="registerBtn" style="
        margin-top:18px;
        width:100%;
        background:transparent;
        border:0;
        color:#e5e7eb;
        font-weight:700;
        height:42px;
      ">Crear cuenta</button>

      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">

        <button id="googleBtn" style="
          height:46px;
          border-radius:14px;
          border:0;
          background:white;
          color:#111827;
          font-weight:800;
        ">Continuar con Google</button>

        <button id="facebookBtn" style="
          height:46px;
          border-radius:14px;
          border:0;
          background:#1877f2;
          color:white;
          font-weight:800;
        ">Continuar con Facebook</button>

      </div>

      <button id="guestBtn" style="
        margin-top:16px;
        width:100%;
        height:44px;
        border:0;
        background:transparent;
        color:white;
        font-weight:800;
      ">Continuar sin registrarse</button>

      <div id="loginError" style="
        display:none;
        margin-top:14px;
        color:#fecaca;
        background:rgba(239,68,68,.16);
        padding:12px;
        border-radius:12px;
        font-weight:700;
      "></div>

    </div>

  </section>
  `;
}

/* ================= HELPERS ================= */

const getRedirectTo = () => {
  return `${window.location.origin}/#home`;
};

const forceAuthLayout = () => {
  const header = document.getElementById("appHeader");
  const nav = document.getElementById("bottomNav");

  if(header) header.style.display = "none";
  if(nav) nav.style.display = "none";

  document.body.style.background = "#020617";
};

const setLoading = (loading) => {
  const btn = form?.querySelector("button[type='submit']");
  if (!btn) return;

  btn.disabled = loading;
  btn.innerText = loading ? "Entrando..." : "Entrar";
};

const showError = (msg) => {
  const errorBox = document.getElementById("loginError");
  if (!errorBox) return;

  errorBox.innerText = msg;
  errorBox.style.display = "block";
};

const clearError = () => {
  const errorBox = document.getElementById("loginError");
  if (!errorBox) return;

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

  if (data.session) {
    navigate("home");
    return;
  }

  const redirectTo = getRedirectTo();

  form.onsubmit = async (e) => {
    e.preventDefault();

    clearError();
    setLoading(true);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try{
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if(error) throw error;

      setState({
        session:{ user:data.user },
        guest:false
      });

      navigate("home");

    }catch(err){
      showError(err.message || "Error login");
    }finally{
      setLoading(false);
    }
  };

  if(registerBtn){
    registerBtn.onclick = async () => {
      clearError();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if(!email || !password){
        showError("Introduce email y contraseña");
        return;
      }

      try{
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo
          }
        });

        if(error) throw error;

        showError("Cuenta creada. Revisa tu email 📩");

      }catch(err){
        showError(err.message || "Error registro");
      }
    };
  }

  if(googleBtn){
    googleBtn.onclick = async () => {
      clearError();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });

      if(error){
        console.error(error);
        showError("Error con Google");
      }
    };
  }

  if(facebookBtn){
    facebookBtn.onclick = async () => {
      clearError();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo }
      });

      if(error){
        console.error(error);
        showError("Error con Facebook");
      }
    };
  }

  if(guestBtn){
    guestBtn.onclick = () => {
      setState({
        session:{ user:null },
        guest:true
      });

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