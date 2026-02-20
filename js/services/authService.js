import { supabase } from "./supabase.js";
import { setState } from "../core/state.js";

/* =========================
   RECUPERAR SESIÓN INICIAL
========================= */
export async function initAuth() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
    setState({ user: null, authReady: true });
    return;
  }

  const user = data.session?.user ?? null;
  setState({ user, authReady: true }); // 👈 ESTA LÍNEA ES LA CLAVE
}

/* =========================
   ESCUCHAR CAMBIOS DE SESIÓN
========================= */
export function listenAuth() {
  supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ?? null;
    setState({ user });
  });
}

/* =========================
   REGISTER (EMAIL)
========================= */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data.user;
}

/* =========================
   LOGIN (EMAIL)
========================= */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data.user;
}

/* =========================
   FACEBOOK LOGIN
========================= */
export async function signInWithFacebook() {
  await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: "https://sniperdetroit-afk.github.io/qwiplus-legal/"
    }
  });
}
/* =========================
   LOGOUT
========================= */
export async function signOut() {
  await supabase.auth.signOut();
  setState({ user: null });
}