import { supabase } from "./supabase.js";
import { setState } from "../core/state.js";

/* ================= CONFIG ================= */

// 🔥 siempre vuelve al mismo dominio (local o vercel)
const redirectTo = window.location.origin;

/* ================= SIGN UP ================= */

export async function signUp(email, password){

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if(error) throw error;

  if(data?.user){
    setState({
      session: { user: data.user }
    });
  }

  return data;
}

/* ================= SIGN IN ================= */

export async function signIn(email, password){

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if(error) throw error;

  setState({
    session: { user: data.user }
  });

  return data;
}

/* ================= OAUTH ================= */

export async function signInWithProvider(provider){

  try {

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo
      }
    });

    if(error) throw error;

  } catch (err){
    console.error("OAuth error:", err);
    throw err;
  }

}

/* ================= SIGN OUT ================= */

export async function signOut(){

  await supabase.auth.signOut();

  setState({
    session: { user: null }
  });

}

/* ================= RESTORE SESSION ================= */

export async function restoreSession(){

  const { data, error } = await supabase.auth.getSession();

  if(error){
    console.error("Session restore error:", error);
    return;
  }

  setState({
    session: { user: data.session?.user || null }
  });

}

/* ================= LISTENER (AUTO LOGIN) ================= */

// 🔥 opcional pero MUY pro
export function listenAuthChanges(){

  supabase.auth.onAuthStateChange((event, session) => {

    setState({
      session: { user: session?.user || null }
    });

  });

}