// js/views/searchResults.js

import { createView } from "../core/createView.js";
import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { renderCard } from "../components/card.js";

async function renderSearchResults(){

  const state = getState();
  const params = state.app?.params || {};
  const category = params.category || "";
  const subcategory = params.subcategory || "";
  const queryText = params.query || "";

  const subtitle = subcategory
    ? subcategory
    : category
    ? category
    : "Todos los anuncios";

  return `
  <section class="search-results-page">

    <div class="search-top">
      <button class="back-btn" id="resultsBackBtn">
        ← Volver
      </button>
    </div>

    <h2 class="search-title">${subtitle}</h2>

    <div id="resultsBox" class="ads-grid">
      <p style="padding:20px;color:#9ca3af;">Cargando...</p>
    </div>

  </section>
  `;
}

async function loadResults(){

  const state = getState();
  const params = state.app?.params || {};
  const category = params.category || "";
  const subcategory = params.subcategory || "";
  const queryText = params.query || "";

  const box = document.getElementById("resultsBox");
  if(!box) return;

  let query = supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  if(category){
    query = query.eq("category", category);
  }

  if(subcategory){
    query = query.eq("subcategory", subcategory);
  }

  if(queryText){
    query = query.or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%`);
  }

  const { data, error } = await query;

  if(error){
    console.error("searchResults error", error);
    box.innerHTML = "<p style='padding:20px;color:#ef4444;'>Error cargando resultados</p>";
    return;
  }

  if(!data || !data.length){
    box.innerHTML = "<p style='padding:20px;color:#9ca3af;'>No hay resultados en esta categoría</p>";
    return;
  }

  box.innerHTML = data.map(renderCard).join("");
}

function mountSearchResults(){

  const backBtn = document.getElementById("resultsBackBtn");
  if(backBtn){
    backBtn.onclick = () => history.back();
  }

  loadResults();
}

export const SearchResultsView = createView(
  renderSearchResults,
  mountSearchResults
);
