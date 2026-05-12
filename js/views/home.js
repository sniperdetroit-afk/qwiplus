// js/views/home.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { getState, setState } from "../core/state.js";

let box;
let offset = 0;
let loading = false;
let alive = false;
let adsChannel = null;

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
   AUTH GUARD
========================= */

async function checkAuth(){

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  const state = getState();
  const isGuest = state.guest === true;

  if(!user && !isGuest){
    navigate("login");
    return null;
  }

  if(user){
    setState({
      session: { user }
    });
  }

  return user;
}

/* =========================
   MOUNT
========================= */

async function mountHome(){

  alive = true;

  const user = await checkAuth();
  if(!user && !getState().guest) return;

  box = document.getElementById("adsList");

  offset = 0;
  loading = false;
  renderedIds.clear();

  box.innerHTML = `<p style="text-align:center">Cargando anuncios...</p>`;

  window.removeEventListener("scroll", onScroll);
  window.addEventListener("scroll", onScroll);

  startRealtime();

  await loadMore();
}

/* =========================
   UNMOUNT
========================= */

async function unmountHome(){
  alive = false;
  loading = false;

  window.removeEventListener("scroll", onScroll);

  if(adsChannel){
    supabase.removeChannel(adsChannel);
    adsChannel = null;
  }
}

/* =========================
   REALTIME
========================= */

function startRealtime(){

  adsChannel = supabase
    .channel("ads-realtime")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "ads"
      },
      (payload) => {

        const ad = payload.new;
        const card = document.querySelector(`[data-id="${ad.id}"]`);

        if(!card) return;

        const count = card.querySelector(".fav-count");
        if(count){
          count.textContent = ad.favorites_count || 0;
        }

        // Actualizar badge de estado en tiempo real
        const badgeWrapper = card.querySelector(".status-badge");
        if(badgeWrapper) badgeWrapper.remove();

        const newBadge = getStatusBadge(ad);
        if(newBadge){
          const imageWrapper = card.querySelector(".card-image");
          imageWrapper.insertAdjacentHTML("afterbegin", newBadge);
        }
      }
    )
    .subscribe();
}

/* =========================
   STATUS BADGE
========================= */

function getStatusBadge(ad){
  if(ad.status === "vendido"){
    return `
      <div class="status-badge" style="
        position:absolute;top:8px;left:8px;z-index:2;
        background:#ef4444;color:white;
        padding:4px 10px;border-radius:999px;
        font-size:11px;font-weight:800;
        box-shadow:0 2px 8px rgba(239,68,68,0.4);
      ">VENDIDO</div>
    `;
  }
  if(ad.status === "reservado"){
    return `
      <div class="status-badge" style="
        position:absolute;top:8px;left:8px;z-index:2;
        background:#f59e0b;color:white;
        padding:4px 10px;border-radius:999px;
        font-size:11px;font-weight:800;
        box-shadow:0 2px 8px rgba(245,158,11,0.4);
      ">RESERVADO</div>
    `;
  }
  return "";
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

  loading = true;
  const myRequest = ++requestId;

  try {

    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("favorites_count", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + 19);

    if(error){
      console.error(error);
      return;
    }

    if(myRequest !== requestId) return;

    if(offset === 0){
      box.innerHTML = "";
    }

    data.forEach(renderAd);

    offset += data.length;

  } catch(err){
    console.error(err);
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
  const isVendido = ad.status === "vendido";

  const div = document.createElement("div");
  div.className = "card";
  div.dataset.id = ad.id;

  const statusBadge = getStatusBadge(ad);

  div.innerHTML = `
    <div class="card-image" style="position:relative;">
      ${statusBadge}
      <img src="${ad.image_url || '/img/placeholder.png'}" style="${isVendido ? 'opacity:0.6;' : ''}">

      ${
        !isMine ? `
        <button class="fav-btn">❤️</button>
        ` : ""
      }
    </div>

    <div class="card-info">
      <div class="card-title">${ad.title}</div>

      <div class="card-bottom">
        <div class="price" style="${isVendido ? 'text-decoration:line-through;color:#9ca3af;' : ''}">${ad.price}€</div>

        <div class="favorite-counter">
          ❤️ <span class="fav-count">${ad.favorites_count || 0}</span>
        </div>
      </div>
    </div>
  `;

  const favBtn = div.querySelector(".fav-btn");

  if(favBtn){

    favBtn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const userId = getState().session?.user?.id;

      if(!userId){
        navigate("login");
        return;
      }

      const countEl = div.querySelector(".fav-count");
      let current = Number(countEl.textContent);

      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("ad_id", ad.id)
        .maybeSingle();

      if(existing){

        await supabase
          .from("favorites")
          .delete()
          .eq("id", existing.id);

        favBtn.textContent = "❤️";
        countEl.textContent = Math.max(current - 1, 0);

      } else {

        await supabase
          .from("favorites")
          .insert([{ user_id: userId, ad_id: ad.id }]);

        favBtn.textContent = "💖";
        countEl.textContent = current + 1;
      }
    });
  }

  div.addEventListener("click", (e) => {
    if(e.target.closest(".fav-btn")) return;
    navigate("adDetail", { id: ad.id });
  });

  box.appendChild(div);
}

/* =========================
   EXPORT
========================= */

export const HomeView = async () => {

  const html = await renderHome();

  return {
    html,
    mount: mountHome,
    unmount: unmountHome
  };
};