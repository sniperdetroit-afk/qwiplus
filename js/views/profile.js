import { getState } from "../core/state.js";

export function renderProfile() {
  const { user } = getState();

  if (!user) {
    return `
      <div class="profile">
        <h2>No has iniciado sesión</h2>
        <button data-view="login">Iniciar sesión</button>
      </div>
    `;
  }

  return `
    <div class="profile">
      <h2>${user.email}</h2>
      <button id="logoutBtn">Cerrar sesión</button>
    </div>
  `;
}