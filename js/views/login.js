// js/views/login.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { setState } from "../core/state.js";

let form;

/* ================= RENDER ================= */

async function renderLogin(){

  return `
  <section class="login-page">

    <div class="login-card">

      <h1>Bienvenido</h1>
      <p class="login-sub">Accede o crea tu cuenta</p>

      <form id="loginForm" class="login-form">
        <input id="email" type="email" placeholder="Email" required>
        <input id="password" type="password" placeholder="Password" required>

        <button type="submit" class="btn-primary">Entrar</button>
      </form>

      <button id="registerBtn" class="btn-secondary">
        Crear cuenta
      </button>

      <div class="oauth-section">

        <button id="googleBtn" class="btn-oauth google">
          Continuar con Google
        </button>

        <button id="facebookBtn" class="btn-oauth facebook">
          Continuar con Facebook
        </button>

      </div>

      <button id="guestBtn" class="btn-ghost">
        Continuar sin registrarse
      </button>

      <div id="loginError" class="login-error"></div>

    </div>

  </section>
  `;
}

/* ================= HELPERS ================= */

const getRedirectTo = () => {
  return `${window.location.origin}/#login`;
};

const setLoading = (loading) => {
  const btn = form?.querySelector("button[type='submit']");
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.innerText = "Entrando...";
  } else {
    btn.disabled = false;
    btn.innerText = "Entrar";
  }
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
        options: {
          redirectTo
        }
      });

      if(error){
        showError("Error con Google");
        console.error(error);
      }
    };
  }

  if(facebookBtn){
    facebookBtn.onclick = async () => {

      clearError();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo
        }
      });

      if(error){
        showError("Error con Facebook");
        console.error(error);
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