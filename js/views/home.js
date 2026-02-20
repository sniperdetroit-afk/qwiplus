import { getAds } from "../services/adsService.js";

export async function renderHome() {
  const ads = await getAds();

  return `
    <div class="ads-grid">
      ${ads.map(ad => `
        <div class="card">
          <div class="card-info">
            <div class="price">${ad.price}€</div>
            <div>${ad.title}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}
