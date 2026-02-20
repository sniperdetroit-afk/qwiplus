// js/services/adsService.js

import { supabase } from "../services/supabase.js";

export async function getAds() {
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function createAd(ad) {
  const { data, error } = await supabase
    .from("ads")
    .insert([ad])
    .select();

  if (error) {
    console.error(error);
    return null;
  }

  return data[0];
}

