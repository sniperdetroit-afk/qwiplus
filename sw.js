// sw.js — Service Worker network-first para Qwiplus
// Objetivo: cumplir requisito PWA para Play Store sin romper auth/Supabase.
// Estrategia: siempre red primero, cache solo como fallback offline.

const CACHE_NAME = "qwiplus-v1";
const OFFLINE_URL = "/offline.html";

// Recursos mínimos a cachear para que offline.html funcione
const PRECACHE = [
  "/offline.html",
  "/img/icon-192.png",
  "/img/icon-512.png"
];

// INSTALL: precachear el offline
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: limpiar caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: network-first, fallback a offline solo para navegación
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo manejamos GET. POST/PUT/DELETE van directo a la red.
  if (req.method !== "GET") return;

  // Nunca interferir con Supabase, APIs, ni websockets
  const url = new URL(req.url);
  if (
    url.hostname.includes("supabase") ||
    url.hostname.includes("mymemory") ||
    url.pathname.startsWith("/api/")
  ) {
    return; // dejamos pasar sin tocar
  }

  // Para navegación (HTML): network-first, offline.html como fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Para todo lo demás (JS, CSS, imgs): network-first sin cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
