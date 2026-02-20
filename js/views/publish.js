export function renderPublish() {
  return `
    <div class="publish-page">
      <h2>Publicar anuncio</h2>

      <form id="publish-form">
        <input type="text" name="title" placeholder="Título" required />
        <textarea name="description" placeholder="Descripción" required></textarea>
        <input type="number" name="price" placeholder="Precio" />
        <button type="submit">Publicar</button>
      </form>
    </div>
  `;
}