// js/services/blockService.js

import { supabase } from "./supabase.js";

/**
 * Bloquea a un usuario.
 * @param {string} blockerId - ID del usuario que bloquea (yo)
 * @param {string} blockedId - ID del usuario bloqueado
 * @returns {Promise<{error: any}>}
 */
export async function blockUser(blockerId, blockedId) {
  if (!blockerId || !blockedId) {
    return { error: "Faltan datos" };
  }
  if (blockerId === blockedId) {
    return { error: "No puedes bloquearte a ti mismo" };
  }

  const { error } = await supabase
    .from("blocked_users")
    .insert({ blocker_id: blockerId, blocked_id: blockedId });

  // Si ya estaba bloqueado, Supabase devuelve error de duplicado. Eso no es problema.
  if (error && error.code === "23505") {
    return { error: null };
  }

  return { error };
}

/**
 * Desbloquea a un usuario.
 */
export async function unblockUser(blockerId, blockedId) {
  if (!blockerId || !blockedId) {
    return { error: "Faltan datos" };
  }

  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);

  return { error };
}

/**
 * Comprueba si he bloqueado a un usuario.
 */
export async function isBlocked(blockerId, blockedId) {
  if (!blockerId || !blockedId) return false;

  const { data } = await supabase
    .from("blocked_users")
    .select("id")
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId)
    .maybeSingle();

  return !!data;
}

/**
 * Devuelve los IDs de usuarios que he bloqueado.
 */
export async function getMyBlockedUserIds(userId) {
  if (!userId) return [];

  const { data } = await supabase
    .from("blocked_users")
    .select("blocked_id")
    .eq("blocker_id", userId);

  return (data || []).map(b => b.blocked_id);
}

/**
 * Devuelve los IDs de usuarios que me han bloqueado a mí.
 */
export async function getUsersWhoBlockedMe(userId) {
  if (!userId) return [];

  const { data } = await supabase
    .from("blocked_users")
    .select("blocker_id")
    .eq("blocked_id", userId);

  return (data || []).map(b => b.blocker_id);
}