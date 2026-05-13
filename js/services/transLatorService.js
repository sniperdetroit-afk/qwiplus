// js/services/translatorService.js
//
// Traductor gratuito usando MyMemory API
// - Sin API key ni registro
// - 1000 palabras/día por IP gratis
// - Caché en memoria para no traducir 2 veces lo mismo

const cache = new Map();

/**
 * Detecta el idioma del usuario actual
 * Lee de localStorage la preferencia o usa el del navegador
 */
export function getUserLanguage(){
  const saved = localStorage.getItem("qwiplus_lang");
  if(saved) return saved.toLowerCase().slice(0, 2);

  const nav = navigator.language || "es";
  return nav.toLowerCase().slice(0, 2);
}

/**
 * Detecta idioma aproximado de un texto
 * Heurística simple basada en caracteres y palabras comunes
 */
export function detectLanguage(text){

  if(!text) return "es";

  // Árabe
  if(/[\u0600-\u06FF]/.test(text)) return "ar";

  // Chino
  if(/[\u4e00-\u9fff]/.test(text)) return "zh";

  // Cirílico (ruso)
  if(/[\u0400-\u04FF]/.test(text)) return "ru";

  const t = text.toLowerCase();

  // Palabras comunes en español
  const es = /\b(hola|gracias|por|favor|que|donde|cuanto|esta|estoy|tengo|quiero|tienes|sigue|disponible)\b/;
  if(es.test(t)) return "es";

  // Inglés
  const en = /\b(hello|hi|thanks|please|what|where|how|much|available|interested|good|day)\b/;
  if(en.test(t)) return "en";

  // Francés
  const fr = /\b(bonjour|merci|sil|vous|plait|combien|disponible|cest|jai|tres)\b/;
  if(fr.test(t)) return "fr";

  // Por defecto, asumimos español (idioma principal de la app)
  return "es";
}

/**
 * Traduce un texto desde el idioma origen al idioma destino
 *
 * @param {string} text - Texto a traducir
 * @param {string} from - Código de idioma origen (ej: "es")
 * @param {string} to - Código de idioma destino (ej: "en")
 * @returns {Promise<string>} Texto traducido o null si falla
 */
export async function translate(text, from, to){

  if(!text || !text.trim()) return null;
  if(from === to) return text;

  const key = `${from}|${to}|${text}`;
  if(cache.has(key)) return cache.get(key);

  try {

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;

    const res = await fetch(url);
    if(!res.ok) throw new Error("Network");

    const data = await res.json();

    const translated = data?.responseData?.translatedText;
    if(!translated) return null;

    // Filtrar cuotas excedidas
    if(translated.includes("MYMEMORY WARNING") || translated.includes("QUERY LENGTH LIMIT")){
      console.warn("⚠️ Traductor: límite alcanzado");
      return null;
    }

    cache.set(key, translated);
    return translated;

  } catch(err){
    console.error("Translator error:", err);
    return null;
  }
}

/**
 * Traduce automáticamente si los idiomas no coinciden
 *
 * @param {string} text - Texto original
 * @param {string} userLang - Idioma del usuario que lee
 * @returns {Promise<{translated:string|null, from:string}>}
 */
export async function autoTranslate(text, userLang){

  const from = detectLanguage(text);

  if(from === userLang){
    return { translated: null, from };
  }

  const translated = await translate(text, from, userLang);
  return { translated, from };
}