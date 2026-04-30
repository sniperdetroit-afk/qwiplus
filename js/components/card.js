import { getState } from "../core/state.js";
import { navigate } from "../core/router.js";

export function renderCard(ad) {

  const state = getState();
  const user = state.session?.user;

  const isOwner = user && user.id === ad.user_id;

  const sellerName = ad.profiles?.name || "Usuario";
  const sellerAvatar = ad.profiles?.avatar_url || null;

  const favCount = ad.favorites_count || 0;

  const imageHtml = ad.image_url
    ? `<img src="${ad.image_url}">`
    : `<div class="card-img-empty"></div>`;

  return `
   ><div 
  class="card" 
 <div class="card" data-ad="${ad.id}">

      <div class="card-image">
        ${imageHtml}

        ${
          !isOwner
            ? `<button 
  class="fav-btn" 
  data-id="${ad.id}" 
  data-fav="0"
>
  ❤ ${favCount}
</button>`
            : ""
        }
      </div>

      <div class="card-info">

        <h3 class="card-title">${ad.title || ""}</h3>

        <div class="price">${ad.price || 0}€</div>

        <div class="card-seller" data-user="${ad.user_id}">
          ${
            sellerAvatar
              ? `<img class="avatar avatar-sm" src="${sellerAvatar}">`
              : `<div class="avatar avatar-sm avatar-placeholder">👤</div>`
          }
          <span>${sellerName}</span>
        </div>

      </div>

    </div>
  `;
}

    
