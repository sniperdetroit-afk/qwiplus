// js/views/searchResults.js

import { createView } from "../core/createView.js";
import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { renderCard } from "../components/card.js";

async function renderSearchResults(){

  return `
  <section class="search-results-page">

    <div class="search-top">
      <button class="back-btn" id="resultsBackBtn">
        ← Volver
      </button>
    </div>

    <h2 class="search-title">Resultados</h2>

    <div id="resultsBox" class="ads-grid"></div>

  </section>
  `;
}

async function loadResults(){

  const state = getState();
  const queryText = state.query || "";

  const box = document.getElementById("resultsBox");

  if(!box) return;

  let query = supabase
    .from("ads")
    .select("*")
    .order("created_at",{ ascending:false });

  if(queryText){
    query = query.or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%`);
  }

  const { data, error } = await query;

  if(error){
    console.error("searchResults error", error);
    box.innerHTML = "<p>Error cargando resultados</p>";
    return;
  }

  if(!data.length){
    box.innerHTML = "<p>No hay resultados</p>";
    return;
  }

  box.innerHTML = data.map(renderCard).join("");
}

function mountSearchResults(){

  const backBtn = document.getElementById("resultsBackBtn");

  if(backBtn){
    backBtn.onclick = ()=> history.back();
  }

  loadResults();
}

export const SearchResultsView = createView(
  renderSearchResults,
  mountSearchResults
);