// js/views/publish.js

import { createView } from "../core/createView.js";
import { categories } from "../data/categories.js";
import { createAd } from "../services/adsService.js";
import { navigate } from "../core/router.js";
import { uploadImage } from "../services/imageService.js";
import { getState } from "../core/state.js";

let imageInputRef = null;

/* ================= RENDER ================= */

async function renderPublish() {

  return `
    <section class="publish-page">

      <div class="publish-top">
        <button class="back-btn" id="backBtn">
          ← Volver
        </button>
      </div>

      <h2 class="publish-title">Publicar anuncio</h2>

      <form class="publish-form" id="publishForm">

        <div class="photo-upload">
          <label for="imageInput" class="photo-frame">
            <span id="photoText">📷 Subir foto</span>
            <img id="photoPreview" style="
              display:none;
              width:100%;
              max-height:250px;
              object-fit:cover;
              border-radius:12px;
            ">
          </label>

          <input type="file" id="imageInput" accept="image/*" hidden />
        </div>

        <input 
          type="text"
          placeholder="Título del anuncio"
          class="input-field"
          id="titleInput"
        />

        <select class="input-field" id="categoryInput">
          <option value="">Categoría</option>
          ${categories.map(cat => `
            <option value="${cat.id}">
              ${cat.name}
            </option>
          `).join("")}
        </select>

        <select class="input-field" id="subCategoryInput" style="display:none;"></select>

        <select class="input-field" id="subSubCategoryInput" style="display:none;"></select>

        <input 
          type="number"
          placeholder="Precio (€)"
          class="input-field"
          id="priceInput"
        />

        <button type="button" class="publish-btn" id="publishBtn">
          Publicar
        </button>

      </form>

    </section>
  `;
}

/* ================= MOUNT ================= */

function mountPublish(){

  const state = getState();

  const categorySelect = document.getElementById("categoryInput");
  const subCategorySelect = document.getElementById("subCategoryInput");
  const subSubCategorySelect = document.getElementById("subSubCategoryInput");

  const backBtn = document.getElementById("backBtn");
  const btn = document.getElementById("publishBtn");

  const imageInput = document.getElementById("imageInput");
  const preview = document.getElementById("photoPreview");
  const text = document.getElementById("photoText");

  imageInputRef = imageInput;

  if (!categorySelect || !btn) return;

  /* ================= PREVIEW ================= */

  imageInput?.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    text.style.display = "none";
  });

  /* ================= VOLVER ================= */

  backBtn?.addEventListener("click", () => navigate("home"));

  /* ================= CATEGORY → SUB ================= */

  categorySelect.addEventListener("change", () => {

    const selectedCategory = categories.find(c => c.id === categorySelect.value);

    subCategorySelect.innerHTML = "";
    subSubCategorySelect.innerHTML = "";
    subSubCategorySelect.style.display = "none";

    if (!selectedCategory?.sub) {
      subCategorySelect.style.display = "none";
      return;
    }

    subCategorySelect.innerHTML = `<option value="">Subcategoría</option>`;

    selectedCategory.sub.forEach(sub => {
      const name = typeof sub === "object" ? sub.name : sub;
      subCategorySelect.innerHTML += `<option value="${name}">${name}</option>`;
    });

    subCategorySelect.style.display = "block";
  });

  /* ================= SUB → SUBSUB ================= */

  subCategorySelect.addEventListener("change", () => {

    const selectedCategory = categories.find(c => c.id === categorySelect.value);
    const selectedSub = selectedCategory?.sub.find(
      s => typeof s === "object" && s.name === subCategorySelect.value
    );

    subSubCategorySelect.innerHTML = "";

    if (!selectedSub?.sub) {
      subSubCategorySelect.style.display = "none";
      return;
    }

    subSubCategorySelect.innerHTML = `<option value="">Sub-subcategoría</option>`;

    selectedSub.sub.forEach(item => {
      subSubCategorySelect.innerHTML += `<option value="${item}">${item}</option>`;
    });

    subSubCategorySelect.style.display = "block";
  });

  /* ================= 🔥 AUTO-SELECT DESDE CATEGORÍAS ================= */

  const params = state.app?.params || {};

  const preCategory = params.category;
  const preSub = params.subcategory;
  const preSubSub = params.subsub;

  if (preCategory) {

    categorySelect.value = preCategory;
    categorySelect.dispatchEvent(new Event("change"));

    setTimeout(() => {

      if (preSub) {
        subCategorySelect.value = preSub;
        subCategorySelect.dispatchEvent(new Event("change"));
      }

      setTimeout(() => {

        if (preSubSub) {
          subSubCategorySelect.value = preSubSub;
        }

      }, 50);

    }, 50);
  }

  /* ================= PUBLICAR ================= */

  btn.addEventListener("click", async () => {

    const { session } = getState();
    const user = session?.user;

    if (!user) {
      alert("Debes iniciar sesión");
      navigate("login");
      return;
    }

    const title = document.getElementById("titleInput").value.trim();
    const price = document.getElementById("priceInput").value.trim();

    if (!title || !price) {
      alert("Completa los campos obligatorios");
      return;
    }

    let image_url = null;

    if (imageInputRef?.files?.length > 0) {
      image_url = await uploadImage(imageInputRef.files[0]);
    }

    const newAd = {
      title,
      price: Number(price),
      description: "Descripción pendiente",
      location: "España",
      status: "activo",
      image_url,
      user_id: user.id,
      category: categorySelect.value,
      subcategory: subCategorySelect.value || null,
      subsub: subSubCategorySelect.value || null
    };

    await createAd(newAd);

    alert("Anuncio publicado correctamente");
    navigate("home");
  });

}

/* ================= UNMOUNT ================= */

function unmountPublish(){
  imageInputRef = null;
}

export const PublishView = createView(
  renderPublish,
  mountPublish,
  unmountPublish
);