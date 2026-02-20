// js/views/categories.js

const categories = [
  {
    id: "deporte",
    name: "Equipamiento deportivo y ocio",
    sub: ["Ciclismo", "Fútbol", "Pesca", "Buceo", "Camping", "Otros"]
  },
  {
    id: "electronica",
    name: "Electrónica y tecnología",
    sub: ["Teléfonos", "Informática", "Gaming", "Audio", "Otros"]
  },
  {
    id: "vintage",
    name: "Vintage y coleccionismo",
    sub: ["Antigüedades", "Joyería antigua", "Objetos históricos", "Otros"]
  },
  {
    id: "hobby",
    name: "Hobby y entretenimiento",
    sub: ["Juegos", "Música", "Manualidades", "Otros"]
  },
  {
    id: "herramientas",
    name: "Herramientas",
    sub: ["Bricolaje", "Taller", "Otros"]
  },
  {
    id: "agricultura",
    name: "Agricultura y animales",
    sub: ["Agricultura", "Accesorios animales", "Otros"]
  },
  {
    id: "moda",
    name: "Moda y niños",
    sub: ["Mujer", "Hombre", "Niños", "Belleza", "Otros"]
  }
];

export function renderCategories() {
  return `
    <section class="categories">
      ${categories.map(cat => `
        <button class="category-item" data-id="${cat.id}">
          ${cat.name}
        </button>
      `).join("")}
    </section>
  `;
}

export function renderSubcategories(categoryId) {
  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return `
      <section class="subcategories">
        <p>Categoría no encontrada</p>
      </section>
    `;
  }

  return `
    <section class="subcategories">
      <h3>${category.name}</h3>
      <div class="subcategory-grid">
        ${category.sub.map(sub => `
          <button class="subcategory-item">
            ${sub}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}