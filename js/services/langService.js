// js/services/langService.js

import { translations } from "../data/translations.js";

const DEFAULT_LANG = "es";

/* ================= GET / SET ================= */

export function getLang() {
  try {
    return localStorage.getItem("lang") || DEFAULT_LANG;
  } catch {
    return sessionStorage.getItem("lang") || DEFAULT_LANG;
  }
}

export function setLang(lang) {
  try {
    localStorage.setItem("lang", lang);
  } catch {
    sessionStorage.setItem("lang", lang);
  }
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

/* ================= TRANSLATE ================= */

export function t(key) {
  const lang = getLang();
  return translations[lang]?.[key] || translations[DEFAULT_LANG]?.[key] || key;
}

/* ================= UPDATE STATIC UI ================= */

function updateStaticUI() {

  const navItems = {
    home: t("home"),
    favorites: t("favorites"),
    search: t("search"),
    messages: t("messages"),
    profileMenu: t("profile"),
  };

  Object.entries(navItems).forEach(([view, label]) => {
    const btn = document.querySelector(`.nav-item[data-view="${view}"] small`);
    if (btn) btn.textContent = label;
  });

  const searchInput = document.getElementById("globalSearch");
  if (searchInput) {
    searchInput.placeholder = `${t("search")} en Qwiplus`;
  }

  const catBtn = document.querySelector('[data-view="categories"]');
  if (catBtn) catBtn.textContent = t("category");

  const pubBtn = document.querySelector('[data-view="publish"]');
  if (pubBtn) pubBtn.textContent = t("publish");
}

/* ================= INIT ================= */

export function initLang() {

  const lang = getLang();

  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateStaticUI);
  } else {
    updateStaticUI();
  }
}

