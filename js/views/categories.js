import { createView } from "../core/createView.js";

/* ================= DATA ================= */

export const categories = [
  {
    id: "vehiculos",
    name: "Vehículos",
    sub: [
      "Coches",
      "Motos",
      "Embarcaciones",
      "Bicicletas",
      "Patines",
      "Drones",
      "Otros"
    ]
  },
  {
    id: "inmuebles",
    name: "Inmuebles",
    sub: [
      "Pisos",
      "Casas y chalets",
      "Habitaciones",
      "Locales comerciales",
      "Oficinas",
      "Garajes",
      "Trasteros",
      "Terrenos",
      "Naves industriales",
      "Otros"
    ]
  },
  {
    id: "empleo",
    name: "Empleo",
    sub: [
      "Ofertas de trabajo",
      "Busco trabajo",
      "Prácticas",
      "Freelance",
      "Voluntariado",
      "Otros"
    ]
  },
  {
    id: "moda",
    name: "Moda y accesorios",
    sub: [
      { name: "Accesorios y joyería", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Complementos", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Calzado", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Lujo y diseño", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Casual", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Deportiva", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Formal y fiesta", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Ceremonia y trajes", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Moda de baño", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Ropa de hogar", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Ropa íntima", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Disfraces y eventos", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Laboral y seguridad", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Vintage", sub: ["Mujer","Hombre","Unisex"] },
      { name: "Otros", sub: ["Mujer","Hombre","Unisex"] }
    ]
  },
  {
    id: "infantil",
    name: "Infantil y bebé",
    sub: [
      { name: "Accesorios", sub: ["Niña","Niño","Bebé"] },
      { name: "Puericultura", sub: ["Niña","Niño","Bebé"] },
      { name: "Ceremonias y eventos", sub: ["Niña","Niño","Bebé"] },
      { name: "Moda infantil", sub: ["Niña","Niño","Bebé"] },
      { name: "Disfraces", sub: ["Niña","Niño","Bebé"] },
      { name: "Ropa interior y baño", sub: ["Niña","Niño","Bebé"] },
      { name: "Hogar infantil", sub: ["Niña","Niño","Bebé"] },
      { name: "Calzado", sub: ["Niña","Niño","Bebé"] },
      { name: "Educación", sub: ["Niña","Niño","Bebé"] },
      { name: "Juguetes y juegos", sub: ["Niña","Niño","Bebé"] },
      { name: "Movilidad infantil", sub: ["Niña","Niño","Bebé"] }
    ]
  },
  {
    id: "belleza",
    name: "Belleza y cuidado personal",
    sub: [
      { name: "Perfumes", sub: ["Fragancias","Aceites","Ambientación","Otros"] },
      { name: "Cosmética y maquillaje", sub: ["Rostro","Ojos","Labios","Uñas","Capilar","Corporal"] },
      { name: "Aparatos de belleza", sub: ["Secadores","Planchas","Dispositivos faciales","Depiladoras","Otros"] },
      { name: "Higiene", sub: ["Corporal","Facial","Capilar","Oral","Íntima","Otros"] },
      { name: "Tratamientos", sub: ["Facial","Capilar","Corporal"] },
      { name: "Accesorios", sub: ["Brochas","Espejos","Organizadores","Otros"] },
      "Otros"
    ]
  },
  {
    id: "hogar",
    name: "Hogar y decoración",
    sub: [
      "Cocina",
      "Iluminación",
      "Decoración",
      "Textil",
      "Almacenaje",
      "Baño",
      "Utilidades",
      "Otros"
    ]
  },
  {
    id: "animales",
    name: "Accesorios para animales",
    sub: [
      "Mascotas",
      "Granja",
      "Aves",
      "Reptiles",
      "Acuarios",
      "Otros"
    ]
  },
  {
    id: "electronica",
    name: "Electrónica",
    sub: [
      "Teléfonos",
      "Ordenadores",
      "Gaming",
      "Imagen y sonido",
      "Wearables",
      "Otros"
    ]
  },
  {
    id: "deporte",
    name: "Equipamiento deportivo",
    sub: [
      { name: "Individual", sub: [
        "Running",
        "Ciclismo",
        "Fitness y gimnasio",
        "Yoga y pilates",
        "Atletismo",
        "Patinaje",
        "Skate",
        "Golf",
        "Tenis",
        "Pádel",
        "Bádminton",
        "Tiro con arco",
        "Otros"
      ]},
      { name: "Equipo", sub: [
        "Fútbol",
        "Baloncesto",
        "Voleibol",
        "Balonmano",
        "Rugby",
        "Béisbol",
        "Hockey",
        "Otros"
      ]},
      { name: "Combate", sub: [
        "Boxeo",
        "Karate",
        "Judo",
        "Taekwondo",
        "Jiu-jitsu",
        "MMA",
        "Kickboxing",
        "Esgrima",
        "Otros"
      ]},
      { name: "Invierno", sub: [
        "Esquí",
        "Snowboard",
        "Patinaje sobre hielo",
        "Hockey sobre hielo",
        "Ropa térmica",
        "Otros"
      ]},
      { name: "Urbano", sub: [
        "BMX",
        "Skate",
        "Longboard",
        "Patines en línea",
        "Parkour",
        "Otros"
      ]},
      { name: "Náuticos", sub: [
        "Surf",
        "Windsurf",
        "Kitesurf",
        "Paddle surf",
        "Vela",
        "Buceo",
        "Snorkel",
        "Natación",
        "Pesca",
        "Otros"
      ]},
      { name: "Motor", sub: [
        "Motocross",
        "Quads",
        "Karts",
        "Trial",
        "Enduro",
        "Otros"
      ]},
      { name: "Camping", sub: [
        "Tiendas de campaña",
        "Sacos de dormir",
        "Mochilas",
        "Hornillos y cocina",
        "Linternas",
        "Senderismo",
        "Escalada",
        "Otros"
      ]},
      "Otros"
    ]
  },
  {
    id: "coleccionismo",
    name: "Coleccionismo y antiguedades",
    sub: [
      "Juegos",
      "Libros",
      "hobby",
      "Modelismo",
      "Figuras",
      "accesorios",
      "divisas",
      "artesania",
      "Manualidades",
      "Coleccionables",
      "Otros"
    ]
  },
  {
    id: "herramientas",
    name: "Herramientas",
    sub: [
      "Electrónicas",
      "Mecánicas",
      "Agrícolas",
      "Manuales",
      "Médicas",
      "Otros"
    ]
  },
  {
    id: "botanica",
    name: "Jardinería",
    sub: [
      "Semillas",
      "Fertilizantes",
      "Árboles",
      "Huerto",
      "Macetas",
      "Bonsai",
      "Riego",
      "Otros"
    ]
  },
  {
    id: "digitales",
    name: "tecnologia digital",
    sub: [
      "Software",
      "Plantillas",
      "Plugins",
      "Apps",
      "Diseño",
      "Servicios",
      "Programación",
      "Dominios",
      "Otros"
    ]
  },
  {
    id: "servicios",
    name: "Servicios en mi zona",
    sub: [
      "Fontanero",
      "Electricista",
      "Mudanzas",
      "Limpieza",
      "clases y formacion",
      "reparaciones",
      "eventos",
      "cuidado personal",
      "Otros"
    ]
  }
];

/* ================= CATEGORIES ================= */

async function renderCategories(){

  const images = {
    vehiculos: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200",
    inmuebles: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200",
    empleo: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200",
    moda: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200",
    infantil: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200",
    belleza: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200",
    hogar: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200",
    electronica: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200",
    servicios: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200",
    herramientas: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=1200",
    digitales: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
    animales: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=1200",
    botanica: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200",
    deporte: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200",
    coleccionismo: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?q=80&w=1200"
  };


  return `
  <section class="categories-grid">
    ${categories.map(cat => `
      <button 
        class="category-card"
        data-view="subcategories"
        data-category="${cat.id}"
      >
        <img src="${images[cat.id] || images.moda}" loading="lazy" />
        <div class="category-overlay"></div>
        <span>${cat.name}</span>
      </button>
    `).join("")}
  </section>
  `;
}

export const CategoriesView = createView(renderCategories);

/* ================= SUBCATEGORIES ================= */

async function renderSubcategories(state){

  let categoryId = state.category;

  if(!categoryId){
    const params = new URLSearchParams(window.location.search);
    categoryId = params.get("category");
  }

  if(!categoryId){
    const path = window.location.pathname.split("/").filter(Boolean);
    if(path.length >= 1){
      categoryId = path[0];
    }
  }

  const category = categories.find(c => c.id === categoryId);
  if(!category) return `<p>Error categoría</p>`;

  return `
  <section class="subcategories">

    <button class="back-btn" data-view="categories">← Volver</button>

    <h3>${category.name}</h3>

    <div class="subcategory-grid">
      ${category.sub.map(sub => {

        if(typeof sub === "object" && sub.sub){
          return `
            <button 
              class="subcategory-item"
              data-view="subsubcategories"
              data-category="${category.id}"
              data-subcategory="${sub.name}"
            >
              ${sub.name}
            </button>
          `;
        }

        return `
          <button class="subcategory-item">
            ${typeof sub === "object" ? sub.name : sub}
          </button>
        `;

      }).join("")}
    </div>

  </section>
  `;
}
export const SubSubcategoriesView = createView(renderSubSubcategories);
