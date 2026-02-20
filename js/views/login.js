// js/views/login.js

import {
  signIn,
  signUp,
  signInWithFacebook
} from "../services/authService.js";

/* =========================
   RENDER
========================= */

export function renderLogin() {
  return `
    <div class="auth-page">
      <h2>Acceso</h2>

      <form id="login-form">
        <input type="email" name="email" placeholder="Correo" required />
        <input type="password" name="password" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>

      <button id="registerBtn">Crear cuenta</button>

      <hr />

      <button id="facebookBtn">Entrar con Facebook</button>
    </div>
  `;
}

/* =========================
   EVENTS
========================= */

export function initLoginEvents() {
  const form = document.getElementById("login-form");
  const registerBtn = document.getElementById("registerBtn");
  const facebookBtn = document.getElementById("facebookBtn");

  // LOGIN EMAIL
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      await signIn(
        formData.get("email"),
        formData.get("password")
      );
    } catch (err) {
      alert(err.message);
    }
  });

  // REGISTER EMAIL
  registerBtn?.addEventListener("click", async () => {
    const email = prompt("Correo:");
    const password = prompt("Contraseña:");
    if (!email || !password) return;

    try {
      await signUp(email, password);
      alert("Cuenta creada. Revisa tu correo.");
    } catch (err) {
      alert(err.message);
    }
  });

  // FACEBOOK LOGIN
  facebookBtn?.addEventListener("click", async () => {
    try {
      await signInWithFacebook();
    } catch (err) {
      alert(err.message);
    }
  });
}