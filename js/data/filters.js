// js/data/filters.js

/* =========================
   VEHÍCULOS
========================= */

export const carBrands = [
  "Audi", "BMW", "Citroën", "Dacia", "Fiat", "Ford", "Honda",
  "Hyundai", "Jeep", "Kia", "Land Rover", "Lexus", "Mazda",
  "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Opel",
  "Peugeot", "Porsche", "Renault", "Seat", "Škoda", "Subaru",
  "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo", "Otra"
];

export const motoBrands = [
  "Aprilia", "BMW", "Ducati", "Harley-Davidson", "Honda",
  "Husqvarna", "Kawasaki", "KTM", "Kymco", "Piaggio",
  "Royal Enfield", "Suzuki", "SYM", "Triumph", "Vespa",
  "Yamaha", "Otra"
];

export const fuelTypes = [
  "Gasolina",
  "Diésel",
  "Eléctrico",
  "Híbrido",
  "Híbrido enchufable",
  "GLP",
  "GNC"
];

export const transmissionTypes = [
  "Manual",
  "Automático",
  "Semiautomático"
];

export const doorOptions = [2, 3, 4, 5];

// Años desde 1980 hasta el actual
export const years = (() => {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current; y >= 1980; y--) arr.push(y);
  return arr;
})();

/* =========================
   INMUEBLES
========================= */

export const propertyTypes = [
  "Piso",
  "Casa",
  "Chalet",
  "Ático",
  "Dúplex",
  "Estudio",
  "Loft",
  "Habitación",
  "Local comercial",
  "Oficina",
  "Garaje",
  "Trastero",
  "Terreno",
  "Nave industrial"
];

export const propertyOperations = [
  "Venta",
  "Alquiler",
  "Alquiler temporal",
  "Compartir"
];

export const roomOptions = [1, 2, 3, 4, 5, "6+"];
export const bathroomOptions = [1, 2, 3, "4+"];

/* =========================
   EMPLEO
========================= */

export const jobTypes = [
  "Jornada completa",
  "Media jornada",
  "Por horas",
  "Freelance",
  "Prácticas",
  "Voluntariado"
];

export const contractTypes = [
  "Indefinido",
  "Temporal",
  "Por obra",
  "Autónomo",
  "Sin contrato"
];

export const scheduleTypes = [
  "Mañana",
  "Tarde",
  "Noche",
  "Turnos rotativos",
  "Flexible",
  "Fines de semana"
];

export const jobSectors = [
  "Administración",
  "Atención al cliente",
  "Comercio y ventas",
  "Construcción",
  "Educación",
  "Finanzas",
  "Hostelería",
  "Industria",
  "Informática y tecnología",
  "Ingeniería",
  "Limpieza",
  "Logística y transporte",
  "Marketing",
  "Recursos humanos",
  "Salud y sanidad",
  "Seguridad",
  "Servicios sociales",
  "Otros"
];

export const experienceLevels = [
  "Sin experiencia",
  "Menos de 1 año",
  "1-3 años",
  "3-5 años",
  "Más de 5 años"
];

/* =========================
   HELPER
========================= */

export function getBrandsByCategory(category, subcategory) {
  if (category === "vehiculos") {
    if (subcategory === "Coches") return carBrands;
    if (subcategory === "Motos") return motoBrands;
  }
  return [];
}
