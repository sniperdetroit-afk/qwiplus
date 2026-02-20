// js/views/adDetail.js

export function renderAdDetail(adId) {
  if (!adId) {
    return `
      <div class="card">
        <p>Anuncio no encontrado</p>
        <button class="btn-secondary" data-view="home">Volver</button>
      </div>
    `;
  }

  return `
    <section class="card ad-detail">
      <h3>Anuncio #${adId}</h3>
      <p class="price">Precio visible</p>
      <p class="meta">Ubicación</p>

      <button class="btn-primary" disabled>
        Contactar vendedor
      </button>

      <button class="btn-secondary" data-view="home">
        Volver
      </button>
    </section>
  `;
}