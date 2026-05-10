// js/views/publish.js

import { createView } from "../core/createView.js";
import { categories } from "../data/categories.js";
import { createAd } from "../services/adsService.js";
import { navigate } from "../core/router.js";
import { uploadImage } from "../services/imageService.js";
import { getState } from "../core/state.js";
import {
  carBrands, motoBrands, fuelTypes, transmissionTypes, doorOptions, years,
  propertyTypes, propertyOperations, roomOptions, bathroomOptions,
  jobTypes, contractTypes, scheduleTypes, jobSectors, experienceLevels
} from "../data/filters.js";

let selectedFiles = [];

/* ================= RENDER ================= */

async function renderPublish() {

  return `
    <section class="publish-page">

      <button class="back-btn" id="backBtn">← Volver</button>

      <h2 class="publish-title">Publicar anuncio</h2>

      <div id="publishForm">

        <!-- FOTOS -->
        <div style="margin-bottom:16px;">
          <label style="font-weight:600;display:block;margin-bottom:8px;">
            📷 Fotos (máx. 5)
          </label>

          <div id="photosPreview" style="
            display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;
          "></div>

          <label for="imageInput" style="
            display:inline-block;padding:10px 18px;background:#f1f5f9;
            border-radius:10px;cursor:pointer;font-weight:600;color:#475569;
          ">
            + Añadir foto
          </label>

          <input type="file" id="imageInput" accept="image/*" multiple hidden />
        </div>

        <!-- TÍTULO -->
        <input type="text" placeholder="Título del anuncio" class="input-field" id="titleInput" />

        <!-- DESCRIPCIÓN -->
        <textarea
          placeholder="Descripción del producto..."
          class="input-field"
          id="descInput"
          rows="4"
          style="resize:vertical;"
        ></textarea>

        <!-- CATEGORÍA -->
        <select class="input-field" id="categoryInput">
          <option value="">Categoría</option>
          ${categories.map(cat => `
            <option value="${cat.id}">${cat.name}</option>
          `).join("")}
        </select>

        <!-- SUB -->
        <select class="input-field" id="subCategoryInput" style="display:none;"></select>

        <!-- SUB SUB -->
        <select class="input-field" id="subSubCategoryInput" style="display:none;"></select>

        <!-- CAMPOS DINÁMICOS POR CATEGORÍA -->
        <div id="dynamicFields"></div>

        <!-- PRECIO -->
        <input type="number" placeholder="Precio (€)" class="input-field" id="priceInput" />

        <!-- UBICACIÓN -->
        <input
          type="text"
          placeholder="📍 Detectando ubicación..."
          class="input-field"
          id="locationInput"
          readonly
          style="background:#f8fafc;color:#64748b;"
        />

        <!-- ERROR -->
        <div id="publishError" style="
          display:none;color:#ef4444;background:#fef2f2;
          padding:10px;border-radius:10px;margin-bottom:12px;font-weight:600;
        "></div>

        <!-- BOTÓN -->
        <button class="btn-primary" id="publishBtn">Publicar anuncio</button>

      </div>
    </section>
  `;
}

/* ================= DYNAMIC FIELDS ================= */

function renderDynamicFields(category, subcategory) {

  const container = document.getElementById("dynamicFields");
  if (!container) return;

  container.innerHTML = "";

  // VEHÍCULOS
  if (category === "vehiculos") {

    let brandList = [];
    if (subcategory === "Coches") brandList = carBrands;
    else if (subcategory === "Motos") brandList = motoBrands;

    if (brandList.length > 0) {
      container.innerHTML = `
        <select class="input-field" id="brandInput">
          <option value="">Marca</option>
          ${brandList.map(b => `<option value="${b}">${b}</option>`).join("")}
        </select>

        <input type="text" class="input-field" id="modelInput" placeholder="Modelo" />

        <select class="input-field" id="yearInput">
          <option value="">Año</option>
          ${years.map(y => `<option value="${y}">${y}</option>`).join("")}
        </select>

        <select class="input-field" id="fuelInput">
          <option value="">Combustible</option>
          ${fuelTypes.map(f => `<option value="${f}">${f}</option>`).join("")}
        </select>

        <select class="input-field" id="transmissionInput">
          <option value="">Cambio</option>
          ${transmissionTypes.map(t => `<option value="${t}">${t}</option>`).join("")}
        </select>

        <input type="number" class="input-field" id="kmInput" placeholder="Kilómetros" />

        ${subcategory === "Coches" ? `
          <select class="input-field" id="doorsInput">
            <option value="">Puertas</option>
            ${doorOptions.map(d => `<option value="${d}">${d}</option>`).join("")}
          </select>
        ` : ""}
      `;
    }
  }

  // INMUEBLES
  if (category === "inmuebles") {
    container.innerHTML = `
      <select class="input-field" id="propertyTypeInput">
        <option value="">Tipo de inmueble</option>
        ${propertyTypes.map(p => `<option value="${p}">${p}</option>`).join("")}
      </select>

      <select class="input-field" id="operationInput">
        <option value="">Operación</option>
        ${propertyOperations.map(o => `<option value="${o}">${o}</option>`).join("")}
      </select>

      <select class="input-field" id="roomsInput">
        <option value="">Habitaciones</option>
        ${roomOptions.map(r => `<option value="${r}">${r}</option>`).join("")}
      </select>

      <select class="input-field" id="bathroomsInput">
        <option value="">Baños</option>
        ${bathroomOptions.map(b => `<option value="${b}">${b}</option>`).join("")}
      </select>

      <input type="number" class="input-field" id="m2Input" placeholder="Metros cuadrados" />

      <label style="display:flex;align-items:center;gap:8px;margin:8px 0;">
        <input type="checkbox" id="garageInput" />
        <span>Garaje</span>
      </label>

      <label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <input type="checkbox" id="poolInput" />
        <span>Piscina</span>
      </label>
    `;
  }

  // EMPLEO
  if (category === "empleo") {
    container.innerHTML = `
      <select class="input-field" id="jobTypeInput">
        <option value="">Tipo de jornada</option>
        ${jobTypes.map(j => `<option value="${j}">${j}</option>`).join("")}
      </select>

      <select class="input-field" id="contractInput">
        <option value="">Contrato</option>
        ${contractTypes.map(c => `<option value="${c}">${c}</option>`).join("")}
      </select>

      <select class="input-field" id="scheduleInput">
        <option value="">Horario</option>
        ${scheduleTypes.map(s => `<option value="${s}">${s}</option>`).join("")}
      </select>

      <select class="input-field" id="sectorInput">
        <option value="">Sector</option>
        ${jobSectors.map(s => `<option value="${s}">${s}</option>`).join("")}
      </select>

      <select class="input-field" id="experienceInput">
        <option value="">Experiencia</option>
        ${experienceLevels.map(e => `<option value="${e}">${e}</option>`).join("")}
      </select>
    `;
  }
}

/* ================= HELPERS ================= */

function showError(msg) {
  const el = document.getElementById("publishError");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function clearError() {
  const el = document.getElementById("publishError");
  if (el) el.style.display = "none";
}

function setLoading(loading) {
  const btn = document.getElementById("publishBtn");
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Publicando..." : "Publicar anuncio";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function getChecked(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

/* ================= GEOLOCATION ================= */

async function detectLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("España");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "España";
          resolve(city);
        } catch {
          resolve("España");
        }
      },
      () => resolve("España"),
      { timeout: 5000 }
    );
  });
}

/* ================= MOUNT ================= */

async function mountPublish() {

  selectedFiles = [];

  const backBtn = document.getElementById("backBtn");
  const btn = document.getElementById("publishBtn");
  const imageInput = document.getElementById("imageInput");
  const photosPreview = document.getElementById("photosPreview");
  const categorySelect = document.getElementById("categoryInput");
  const subCategorySelect = document.getElementById("subCategoryInput");
  const subSubCategorySelect = document.getElementById("subSubCategoryInput");
  const locationInput = document.getElementById("locationInput");

  if (!btn) return;

  /* VOLVER */
  backBtn?.addEventListener("click", () => navigate("home"));

  /* UBICACIÓN */
  detectLocation().then(city => {
    if (locationInput) {
      locationInput.value = city;
      locationInput.style.color = "#0f172a";
    }
  });

  /* FOTOS */
  imageInput?.addEventListener("change", () => {
    const files = Array.from(imageInput.files);
    files.forEach(file => {
      if (selectedFiles.length >= 5) return;
      if (selectedFiles.find(f => f.name === file.name)) return;
      selectedFiles.push(file);
    });
    renderPreviews();
    imageInput.value = "";
  });

  function renderPreviews() {
    photosPreview.innerHTML = "";
    selectedFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `position:relative;width:80px;height:80px;`;
      wrapper.innerHTML = `
        <img src="${url}" style="
          width:80px;height:80px;object-fit:cover;border-radius:10px;
        " />
        <button data-index="${index}" style="
          position:absolute;top:-6px;right:-6px;background:#ef4444;
          color:white;border:none;border-radius:50%;
          width:20px;height:20px;cursor:pointer;
        ">×</button>
      `;
      wrapper.querySelector("button").addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderPreviews();
      });
      photosPreview.appendChild(wrapper);
    });
  }

  /* CATEGORY */
  categorySelect.addEventListener("change", () => {
    const selectedCategory = categories.find(c => c.id === categorySelect.value);

    subCategorySelect.innerHTML = "";
    subSubCategorySelect.innerHTML = "";
    subSubCategorySelect.style.display = "none";

    // Limpiar campos dinámicos
    renderDynamicFields(categorySelect.value, "");

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

  /* SUBCATEGORY */
  subCategorySelect.addEventListener("change", () => {
    const selectedCategory = categories.find(c => c.id === categorySelect.value);
    const selectedSub = selectedCategory?.sub.find(
      s => typeof s === "object" && s.name === subCategorySelect.value
    );

    subSubCategorySelect.innerHTML = "";

    // Renderizar campos dinámicos cuando cambia subcategoría
    renderDynamicFields(categorySelect.value, subCategorySelect.value);

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

  /* PUBLICAR */
  btn.addEventListener("click", async () => {

    clearError();

    const { session } = getState();
    const user = session?.user;

    if (!user) {
      navigate("login");
      return;
    }

    const title = getValue("titleInput");
    const description = getValue("descInput");
    const price = getValue("priceInput");
    const location = locationInput?.value || "España";
if (!title) return showError("El título es obligatorio");
    if (!price) return showError("El precio es obligatorio");
    if (!categorySelect.value) return showError("Selecciona una categoría");

    setLoading(true);

    try {

      /* SUBIR IMÁGENES */
      const imageUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }

      /* NUEVO ANUNCIO */
      const newAd = {
        title,
        description: description || "Sin descripción",
        price: Number(price),
        location,
        status: "activo",
        image_url: imageUrls[0] || null,
        images: imageUrls,
        user_id: user.id,
        category: categorySelect.value,
        subcategory: subCategorySelect.value || null,
        subsub: subSubCategorySelect.value || null,
        favorites_count: 0,
        views_count: 0
      };

      /* CAMPOS ESPECÍFICOS POR CATEGORÍA */

      // VEHÍCULOS
      if (categorySelect.value === "vehiculos") {
        newAd.brand = getValue("brandInput") || null;
        newAd.model = getValue("modelInput") || null;
        newAd.year = getValue("yearInput") ? Number(getValue("yearInput")) : null;
        newAd.fuel = getValue("fuelInput") || null;
        newAd.transmission = getValue("transmissionInput") || null;
        newAd.km = getValue("kmInput") ? Number(getValue("kmInput")) : null;
        newAd.doors = getValue("doorsInput") ? Number(getValue("doorsInput")) : null;
      }

      // INMUEBLES
      if (categorySelect.value === "inmuebles") {
        newAd.property_type = getValue("propertyTypeInput") || null;
        newAd.rooms = getValue("roomsInput") ? Number(getValue("roomsInput")) : null;
        newAd.bathrooms = getValue("bathroomsInput") ? Number(getValue("bathroomsInput")) : null;
        newAd.m2 = getValue("m2Input") ? Number(getValue("m2Input")) : null;
        newAd.has_garage = getChecked("garageInput");
        newAd.has_pool = getChecked("poolInput");
      }

      // EMPLEO
      if (categorySelect.value === "empleo") {
        newAd.job_type = getValue("jobTypeInput") || null;
        newAd.contract = getValue("contractInput") || null;
        newAd.schedule = getValue("scheduleInput") || null;
        newAd.sector = getValue("sectorInput") || null;
        newAd.experience = getValue("experienceInput") || null;
      }

      console.log("NEW AD:", newAd);

      const { error } = await createAd(newAd);

      if (error) {
        console.error("PUBLISH ERROR:", error);
        showError(error.message || "Error al publicar.");
        return;
      }

      navigate("home");

    } catch (err) {
      console.error("PUBLISH CATCH ERROR:", err);
      showError(err.message || "Error al publicar.");
    } finally {
      setLoading(false);
    }
  });
}

/* ================= UNMOUNT ================= */

async function unmountPublish() {
  selectedFiles = [];
}

/* ================= EXPORT ================= */

export const PublishView = createView({
  render: renderPublish,
  mount: mountPublish,
  unmount: unmountPublish
});