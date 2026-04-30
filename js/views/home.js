// js/views/home.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { getState } from "../core/state.js";

let box;
let offset = 0;
let loading = false;
let alive = false;

let renderedIds = new Set();
let requestId = 0;

/* =========================
   RENDER
========================= */

async function renderHome(){
  return `
    <section class="home-page">
      <div id="adsList" class="ads-grid"></div>
    </section>
  `;
}

/* =========================
   MOUNT
========================= */

async function mountHome(){

  alive = true;

  const state = getState();
  const params = state.app?.params || {};

  box = document.getElementById("adsList");
  if(!box){
    console.error("adsList not found");
    return;
  }

  offset = 0;
  loading = false;
  renderedIds.clear();

  let usedCache = false;

  /* 🔥 KEY DINÁMICA */
  const cacheKey = `ads_cache_${params.category || "all"}_${params.subcategory || "all"}_${params.subsub || "all"}`;

  /* ================= CACHE ================= */

  try {
    const cache = localStorage.getItem(cacheKey);

    if(cache){
      const ads = JSON.parse(cache);

      if(ads.length > 0){
        box.innerHTML = "";
        ads.forEach(renderAd);

        offset = ads.length;
        usedCache = true;

        console.log("⚡ Ads desde cache filtrado");
      }
    }

  } catch(e){
    console.warn("Cache read error", e);
  }

  if(!usedCache){
    box.innerHTML = "Cargando...";
  }

  window.removeEventListener("scroll", onScroll);
  window.addEventListener("scroll", onScroll);

  await loadMore();
}

/* =========================
   UNMOUNT
========================= */

async function unmountHome(){
  alive = false;
  loading = false;
  window.removeEventListener("scroll", onScroll);
}

/* =========================
   SCROLL
========================= */

async function onScroll(){

  if(!alive || loading) return;

  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

  if(nearBottom){
    await loadMore();
  }
}

/* =========================
   LOAD ADS
========================= */

async function loadMore(){

  if(loading || !alive) return;

  const state = getState();
  const params = state.app?.params || {};

  loading = true;
  const myRequest = ++requestId;

  try {

    /* 🔥 QUERY DINÁMICA */
    let query = supabase
      .from("ads")
      .select("*")
      .order("created_at",{ ascending:false });

    if (params.category) {
      query = query.eq("category", params.category);
    }

    if (params.subcategory) {
      query = query.eq("subcategory", params.subcategory);
    }

    if (params.subsub) {
      query = query.eq("subsub", params.subsub);
    }

    const { data, error } = await query.range(offset, offset + 19);

    console.log("ADS DATA:", data, error);

    if(error){
      console.error("SUPABASE ERROR:", error);
      if(offset === 0){
        box.innerHTML = "Error cargando anuncios";
      }
      return;
    }

    if(myRequest !== requestId) return;
    if(!alive) return;

    if(!data || data.length === 0){

      if(offset === 0){
        box.innerHTML = "<p style='text-align:center'>No hay anuncios</p>";
      }

      return;
    }

    if(offset === 0){
      box.innerHTML = "";
    }

    data.forEach(renderAd);

    /* ================= CACHE ================= */

    if(offset === 0){

      const cacheKey = `ads_cache_${params.category || "all"}_${params.subcategory || "all"}_${params.subsub || "all"}`;

      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log("💾 Cache filtrado actualizado");
      } catch(e){
        console.warn("Cache save error", e);
      }
    }

    offset += data.length;

  } catch (err){
    console.error("Error loading ads:", err);
    if(offset === 0){
      box.innerHTML = "Error cargando anuncios";
    }
  } finally {
    loading = false;
  }
}

/* =========================
   CARD
========================= */

function renderAd(ad){

  if(renderedIds.has(ad.id)) return;
  renderedIds.add(ad.id);

  const state = getState();
  const userId = state.session?.user?.id;
  const isMine = ad.user_id === userId;

  const div = document.createElement("div");
  div.className = "card";
  div.dataset.id = ad.id;

  div.innerHTML = `
    <div class="card-image">
      <img src="${ad.image_url || '/img/placeholder.png'}">

      ${
        !isMine ? `
        <button class="fav-btn" data-id="${ad.id}">
          ❤️
        </button>
        ` : ""
      }
    </div>

    <div class="card-info">
      <div class="card-title">${ad.title || ""}</div>
      <div class="price">${ad.price || 0}€</div>
    </div>
  `;

  div.addEventListener("click", (e) => {

    if(e.target.closest(".fav-btn")) return;

    navigate("adDetail", { id: ad.id });

  });

  box.appendChild(div);
}

/* =========================
   VIEW EXPORT
========================= */

export const HomeView = async () => {

  const html = await renderHome();

  return {
    html,
    mount: mountHome,
    unmount: unmountHome
  };

};