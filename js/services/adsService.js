import { supabase } from "./supabase.js";
import { apiFetch } from "../api/client.js";

/* =========================
   CONFIG
========================= */

// 🔥 cambiar a true cuando tengas backend Node
const USE_API = false;

/* =========================
   CREATE AD
========================= */

export async function createAd(data) {

  if (USE_API) {
    return apiFetch("/api/ads", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  const { data: inserted, error } = await supabase
    .from("ads")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creando anuncio:", error.message);
    return { data: null, error };
  }

  console.log("✅ Anuncio creado:", inserted);

  return { data: inserted, error: null };
}

/* =========================
   GET ADS
========================= */

export async function getAds(offset = 0, limit = 20) {

  if (USE_API) {
    return apiFetch(`/api/ads?offset=${offset}&limit=${limit}`);
  }

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("❌ Error obteniendo anuncios:", error.message);
    return [];
  }

  console.log("📦 Ads cargados:", data);

  return Array.isArray(data) ? data : [];
}

/* =========================
   GET AD BY ID
========================= */

export async function getAdById(id) {

  if (USE_API) {
    return apiFetch(`/api/ads/${id}`);
  }

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ Error obteniendo anuncio:", error);
    return null;
  }

  return data;
}

/* =========================
   SEARCH ADS
========================= */

export async function searchAds(query) {

  if (!query) return [];

  if (USE_API) {
    return apiFetch(`/api/ads/search?q=${encodeURIComponent(query)}`);
  }

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error buscando anuncios:", error.message);
    return [];
  }

  return Array.isArray(data) ? data : [];
}


