import { supabase } from "./supabase.js";

export async function uploadImage(file) {

  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase
    .storage
    .from("ads-images")
    .upload(fileName, file);

  if (error) {
    console.error("Error subiendo imagen:", error);
    return null;
  }

  const { data: publicUrl } = supabase
    .storage
    .from("ads-images")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}