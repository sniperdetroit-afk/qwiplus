// js/views/editAd.js

import { createView } from "../core/createView.js";
import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";

let formRef = null;

/* ================= RENDER ================= */

async function renderEditAd(state) {

  const id = state?.id;

  if (!id) {
    return `
      <section class="edit-ad-page">
        <p>Anuncio no encontrado</p>
        <button id="backBtn">Volver</button>
      </section>
    `;
  }

  const { data: ad, error } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ad) {

    console.error("Error cargando anuncio:", error);

    return `
      <section class="edit-ad-page">
        <p>Error cargando anuncio</p>
        <button id="backBtn">Volver</button>
      </section>
    `;
  }

  return `
  <section class="edit-ad-page">

    <button class="back-btn" id="backBtn">← Volver</button>

    <h2>Editar anuncio</h2>

    <form class="publish-form" id="editForm">

      <input
        type="text"
        class="input-field"
        id="editTitle"
        value="${ad.title || ""}"
        placeholder="Título del anuncio"
      />

      <input
        type="number"
        class="input-field"
        id="editPrice"
        value="${ad.price || ""}"
        placeholder="Precio (€)"
      />

      <button
        type="submit"
        class="publish-btn"
        id="saveAdBtn"
        data-id="${ad.id}">
        Guardar cambios
      </button>

    </form>

  </section>
  `;
}

/* ================= MOUNT ================= */

function mountEditAd(){

  const backBtn = document.getElementById("backBtn");
  formRef = document.getElementById("editForm");

  if (backBtn) {
    backBtn.onclick = () => navigate("profile");
  }

  if (formRef) {
    formRef.addEventListener("submit", handleSaveAd);
  }
}

/* ================= UNMOUNT ================= */

function unmountEditAd(){

  if(formRef){
    formRef.removeEventListener("submit", handleSaveAd);
  }

  formRef = null;
}

/* ================= SAVE ================= */

async function handleSaveAd(e){

  e.preventDefault();

  const btn = document.getElementById("saveAdBtn");
  btn.disabled = true;

  const id = btn.dataset.id;

  const title = document.getElementById("editTitle").value.trim();
  const price = document.getElementById("editPrice").value;

  if (!title || !price) {
    alert("Completa los campos");
    btn.disabled = false;
    return;
  }

  const { error } = await supabase
    .from("ads")
    .update({
      title,
      price
    })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando anuncio:", error);
    alert("Error guardando cambios");
    btn.disabled = false;
    return;
  }

  navigate("profile");
}

export const EditAdView = createView(
  renderEditAd,
  mountEditAd,
  unmountEditAd
);