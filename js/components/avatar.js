export function renderAvatar({
  url = null,
  size = "md"
}){

  const sizeClass = `avatar-${size}`;

  if(url){
    return `
      <div class="avatar ${sizeClass}">
        <img src="${url}" />
      </div>
    `;
  }

  return `
    <div class="avatar ${sizeClass}">
      <div class="avatar-placeholder">👤</div>
    </div>
  `;
}