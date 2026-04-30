// js/mappers/adMapper.js

export function mapAd(raw){

  return {
    id: raw.id,
    title: raw.title || "",
    price: Number(raw.price || 0),
    image: raw.image_url || "/img/placeholder.png"
  };

}