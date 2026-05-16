// js/services/reportService.js

import { supabase } from "./supabase.js";

/**
 * Reporta un USUARIO.
 * @param {string} reporterId - Quien reporta
 * @param {string} reportedUserId - Usuario reportado
 * @param {string} reason - Motivo
 */
export async function reportUser(reporterId, reportedUserId, reason) {
  if (!reporterId || !reportedUserId || !reason) {
    return { error: "Faltan datos" };
  }
  if (reporterId === reportedUserId) {
    return { error: "No puedes reportarte a ti mismo" };
  }

  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason: reason
    });

  return { error };
}

/**
 * Reporta un ANUNCIO.
 */
export async function reportAd(reporterId, adId, reason) {
  if (!reporterId || !adId || !reason) {
    return { error: "Faltan datos" };
  }

  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      ad_id: adId,
      reason: reason
    });

  return { error };
}

/**
 * Motivos disponibles para reportar usuarios
 */
export const USER_REPORT_REASONS = [
  "Estafa o fraude",
  "Acoso o insultos",
  "Suplantación de identidad",
  "Spam o publicidad",
  "Contenido inapropiado",
  "Otro motivo"
];