// js/views/search.js

import { createView } from "../core/createView.js";
import { categories } from "../data/categories.js";
import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { renderCard } from "../components/card.js";

let alive = false;
let searching = false;
let debounce;

/* =========================
   RENDER
========================= */

async function renderSearch(){
  return `
    <section class="search-page">

      <div class="search-top">
        <button class="back-btn" id="searchBackBtn">
          ← Volver
        </button>
      </div>

      <h2 class="search-title">Búsqueda avanzada</h2>

      <input
        type="text"
        id="searchInput"
        class="input-field"
        placeholder="¿Qué estás buscando?"
      />

      <div class="price-range">

        <input
          type="number"
          id="minPrice"
          class="input-field"
          placeholder="Precio mínimo"
        />

        <input
          type="number"
          id="maxPrice"
          class="input-field"
          placeholder="Precio máximo"
        />

      </div>

      <input
        type="text"
        id="locationInput"
        class="input-field"
        placeholder="Ubicación"
      />

      <select id="categoryFilter" class="input-field">
        <option value="">Todas las categorías</option>
        ${categories.map(cat => `
          <option value="${cat.id}">
            ${cat.name}
          </option>
        `).join("")}
      </select>

      <button class="publish-btn" id="applyFilters">
        Aplicar filtros
      </button>

      <div id="searchResults" class="search-results">
        <p class="search-empty">
          Ajusta los filtros o escribe para buscar.
        </p>
      </div>

    </section>
  `;
}

/* =========================
   SEARCH
========================= */

async function runSearch(){

  if(!alive) return;
  if(searching) return;

  const results = document.getElementById("searchResults");
  if(!results) return;

  searching = true;

  results.innerHTML = `<p class="search-empty">Buscando...</p>`;

  const text = document.getElementById("searchInput")?.value.trim();
  const minPrice = document.getElementById("minPrice")?.value;
  const maxPrice = document.getElementById("maxPrice")?.value;
  const location = document.getElementById("locationInput")?.value.trim();
  const category = document.getElementById("categoryFilter")?.value;

  let query = supabase
    .from("ads")
    .select("*")
    .order("created_at",{ ascending:false });

  if(text){
    query = query.or(
      `title.ilike.%${text}%,description.ilike.%${text}%`
    );
  }

  if(minPrice){
    query = query.gte("price", minPrice);
  }

  if(maxPrice){
    query = query.lte("price", maxPrice);
  }

  if(location){
    query = query.ilike("location", `%${location}%`);
  }

  if(category){
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if(!alive){
    searching = false;
    return;
  }

  if(error){
    console.error("Error buscando anuncios:", error);
    results.innerHTML = "<p>Error en la búsqueda</p>";
    searching = false;
    return;
  }

  if(!data || !data.length){
    results.innerHTML = `
      <p class="search-empty">
        No se encontraron resultados
      </p>
    `;
    searching = false;
    return;
  }

  results.innerHTML = data.map(renderCard).join("");

  searching = false;
}

/* =========================
   MOUNT
========================= */

function mountSearch(){

  alive = true;

  const backBtn = document.getElementById("searchBackBtn");
  if(backBtn){
    backBtn.onclick = () => history.back();
  }

  const applyBtn = document.getElementById("applyFilters");
  if(applyBtn){
    applyBtn.onclick = runSearch;
  }

  const searchInput = document.getElementById("searchInput");

  if(searchInput){
    searchInput.addEventListener("input", ()=>{
      clearTimeout(debounce);
      debounce = setTimeout(runSearch, 400);
    });
  }

  const state = getState();

  const query = state.app?.params?.query || state.app?.query;
if(query){
  if(searchInput) searchInput.value = query;
  runSearch();
}

}

/* =========================
   UNMOUNT
========================= */

function unmountSearch(){
  alive = false;
}

/* =========================
   EXPORT VIEW
========================= */

export const SearchView = createView(
  renderSearch,
  mountSearch,
  unmountSearch
);