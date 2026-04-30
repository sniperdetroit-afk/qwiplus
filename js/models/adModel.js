export function createAdModel(data) {
  return {
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description || "",
    price: Number(data.price),
    image: data.image || null, // 🔥 importante para el diseño
    category: data.category,
    subcategory: data.subcategory || null,
    brand: data.brand || null,
    condition: data.condition,
    location: data.location,
    createdAt: new Date().toISOString()
  };
}