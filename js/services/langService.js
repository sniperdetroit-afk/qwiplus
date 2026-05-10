import { translations } from "../data/translations.js";

const DEFAULT_LANG = "es";

export function getLang() {
  return localStorage.getItem("lang") || DEFAULT_LANG;
}

export function setLang(lang) {
  localStorage.setItem("lang", lang);
  // Árabe se lee de derecha a izquierda
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

export function t(key) {
  const lang = getLang();
  return translations[lang]?.[key] || translations[DEFAULT_LANG]?.[key] || key;
}

// Inicializar al cargar
export function initLang() {
  const lang = getLang();
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}
