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

      <!-- 🔥 OAUTH -->
      <div class="oauth-section">

        <button id="googleBtn" class="btn-oauth">
          Continuar con Google
        </button>

        <button id="facebookBtn" class="btn-oauth">
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

/* ================= MOUNT ================= */

async function mountLogin(){

  form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");
  const registerBtn = document.getElementById("registerBtn");
  const guestBtn = document.getElementById("guestBtn");

  const googleBtn = document.getElementById("googleBtn");
  const facebookBtn = document.getElementById("facebookBtn");

  if(!form) return;

  /* ================= REDIRECT PRO (FIX) ================= */

  const redirectTo = window.location.origin;

  /* ================= LOGIN ================= */

  form.onsubmit = async (e) => {

    e.preventDefault();
    errorBox.innerText = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try{

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if(error) throw error;

      setState({
        session:{ user:data.user }
      });

      navigate("home");

    }catch(err){
      errorBox.innerText = err.message || "Error login";
    }

  };

  /* ================= REGISTER ================= */

  if(registerBtn){

    registerBtn.onclick = async () => {

      errorBox.innerText = "";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if(!email || !password){
        errorBox.innerText = "Introduce email y contraseña";
        return;
      }

      try{

        const { error } = await supabase.auth.signUp({
          email,
          password
        });

        if(error) throw error;

        errorBox.innerText = "Cuenta creada. Revisa tu email 📩";

      }catch(err){
        errorBox.innerText = err.message || "Error registro";
      }

    };

  }

  /* ================= GOOGLE ================= */

  if(googleBtn){
    googleBtn.onclick = async () => {

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo
        }
      });

      if(error){
        console.error("Google error:", error);
      }
    };
  }

  /* ================= FACEBOOK ================= */

  if(facebookBtn){
    facebookBtn.onclick = async () => {

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo
        }
      });

      if(error){
        console.error("Facebook error:", error);
      }
    };
  }

  /* ================= GUEST ================= */

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
