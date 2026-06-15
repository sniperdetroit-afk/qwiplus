// js/views/search.js

import { createView } from "../core/createView.js";
import { categories } from "./categories.js";
import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { renderCard } from "../components/card.js";

let alive = false;
let searching = false;
let debounce;

const inputStyle = `
  width:100%;
  padding:14px 16px;
  border-radius:12px;
  border:1px solid rgba(34,211,238,0.25);
  background:rgba(6,11,28,0.65);
  backdrop-filter:blur(8px);
  color:#f1f5f9;
  font-size:15px;
  outline:none;
  margin-bottom:12px;
  box-sizing:border-box;
  transition:border-color 0.2s, box-shadow 0.2s;
`;

async function renderSearch(){
  return `
  <section style="
    min-height:100vh;
    background: url('/img/fondo_busquedor.jpg') center bottom / cover no-repeat;
    position:relative;
  ">
    <div style="
      position:absolute;inset:0;
      background:linear-gradient(to bottom, rgba(2,6,23,0.88) 0%, rgba(2,6,23,0.65) 55%, rgba(2,6,23,0.20) 100%);
      pointer-events:none;
    "></div>

    <div style="position:relative;z-index:1;padding:24px 16px 100px;max-width:600px;margin:0 auto;">

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <button id="searchBackBtn" style="
          background:rgba(34,211,238,0.1);
          border:1px solid rgba(34,211,238,0.25);
          color:#22d3ee;font-size:18px;
          padding:6px 12px;border-radius:999px;cursor:pointer;
          backdrop-filter:blur(8px);
        ">←</button>
        <h2 style="margin:0;font-size:22px;font-weight:800;color:#f1f5f9;">Búsqueda avanzada</h2>
      </div>

      <input type="text" id="searchInput" placeholder="¿Qué estás buscando?" style="${inputStyle}"
        onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
        onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
      />

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <input type="number" id="minPrice" placeholder="Precio mínimo" style="${inputStyle}margin-bottom:0;"
          onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
          onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
        />
        <input type="number" id="maxPrice" placeholder="Precio máximo" style="${inputStyle}margin-bottom:0;"
          onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
          onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
        />
      </div>

      <input type="text" id="locationInput" placeholder="Ubicación" style="${inputStyle}"
        onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
        onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
      />

      <select id="categoryFilter" style="${inputStyle}cursor:pointer;"
        onfocus="this.style.borderColor='#22d3ee'"
        onblur="this.style.borderColor='rgba(34,211,238,0.25)'"
      >
        <option value="">Todas las categorías</option>
        ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join("")}
      </select>

      <button id="applyFilters" style="
        width:100%;padding:14px;
        border-radius:999px;
        border:1px solid rgba(34,211,238,0.25);
        background:rgba(34,211,238,0.15);
        color:#22d3ee;font-size:15px;font-weight:700;
        cursor:pointer;margin-bottom:20px;
        transition:0.2s;
      "
        onmouseover="this.style.background='rgba(34,211,238,0.25)';this.style.boxShadow='0 0 20px rgba(34,211,238,0.35)'"
        onmouseout="this.style.background='rgba(34,211,238,0.15)';this.style.boxShadow='none'"
      >Aplicar filtros</button>

      <div id="searchResults" style="margin-top:8px;">
        <p style="color:#94a3b8;text-align:center;font-size:14px;">
          Ajusta los filtros o escribe para buscar.
        </p>
      </div>

    </div>
  </section>
  `;
}

async function runSearch(){
  if(!alive) return;
  if(searching) return;

  const results = document.getElementById("searchResults");
  if(!results) return;

  searching = true;
  results.innerHTML = `<p style="color:#94a3b8;text-align:center;">Buscando...</p>`;

  const text     = document.getElementById("searchInput")?.value.trim();
  const minPrice = document.getElementById("minPrice")?.value;
  const maxPrice = document.getElementById("maxPrice")?.value;
  const location = document.getElementById("locationInput")?.value.trim();
  const category = document.getElementById("categoryFilter")?.value;

  let query = supabase
    .from("ads")
    .select("*, profiles!ads_user_id_fkey(name, avatar_url)")
    .order("created_at", { ascending: false });

  if(text)     query = query.or(`title.ilike.%${text}%,description.ilike.%${text}%`);
  if(minPrice) query = query.gte("price", minPrice);
  if(maxPrice) query = query.lte("price", maxPrice);
  if(location) query = query.ilike("location", `%${location}%`);
  if(category) query = query.eq("category", category);

  const { data, error } = await query;

  if(!alive){ searching = false; return; }

  if(error){
    results.innerHTML = `<p style="color:#ef4444;text-align:center;">Error en la búsqueda</p>`;
    searching = false;
    return;
  }

  if(!data || !data.length){
    results.innerHTML = `<p style="color:#94a3b8;text-align:center;">No se encontraron resultados</p>`;
    searching = false;
    return;
  }

  results.innerHTML = data.map(renderCard).join("");
  searching = false;
}

function mountSearch(){
  alive = true;

  document.getElementById("searchBackBtn")?.addEventListener("click", () => history.back());
  document.getElementById("applyFilters")?.addEventListener("click", runSearch);

  const searchInput = document.getElementById("searchInput");
  if(searchInput){
    searchInput.addEventListener("input", () => {
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

function unmountSearch(){
  alive = false;
}

export const SearchView = createView(
  renderSearch,
  mountSearch,
  unmountSearch
);