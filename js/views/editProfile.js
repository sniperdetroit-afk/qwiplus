// js/views/editProfile.js

import { createView } from "../core/createView.js";
import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { navigate } from "../core/router.js";

let avatarInputRef = null;

async function renderEditProfile(){

  const state = getState();
  const user = state.session?.user;

  if(!user){
    return `
      <section class="edit-profile">
        <p>No has iniciado sesión</p>
      </section>
    `;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data || {};

  const avatarHtml = profile.avatar_url
    ? `<img src="${profile.avatar_url}" id="avatarPreview">`
    : `<div id="avatarPreview" class="avatar-placeholder">👤</div>`;

  return `
  <section class="edit-profile">

    <button id="backProfile">← Volver</button>

    <h2>Editar perfil</h2>

    <div class="avatar-upload">

      <div class="avatar avatar-lg">
        ${avatarHtml}
      </div>

      <input
        type="file"
        id="avatarUpload"
        accept="image/*"
      >

    </div>

    <input
      id="name"
      class="input-field"
      placeholder="Nombre"
      value="${profile.name || ""}"
    >

    <input
      id="location"
      class="input-field"
      placeholder="Ubicación"
      value="${profile.location || ""}"
    >

    <textarea
      id="bio"
      class="input-field"
      placeholder="Bio"
    >${profile.bio || ""}</textarea>

    <button id="saveProfile" class="publish-btn">
      Guardar
    </button>

  </section>
  `;
}

function mountEditProfile(){

  const save = document.getElementById("saveProfile");
  const back = document.getElementById("backProfile");
  const avatarInput = document.getElementById("avatarUpload");
  const avatarPreview = document.getElementById("avatarPreview");

  avatarInputRef = avatarInput;

  if(back){
    back.onclick = () => history.back();
  }

  if(avatarInput && avatarPreview){

    avatarInput.addEventListener("change", (e)=>{

      const file = e.target.files[0];
      if(!file) return;

      const previewURL = URL.createObjectURL(file);

      if(avatarPreview.tagName === "IMG"){
        avatarPreview.src = previewURL;
      }else{
        avatarPreview.outerHTML = `<img src="${previewURL}" id="avatarPreview">`;
      }

    });

  }

  if(!save) return;

  save.onclick = async () => {

    const state = getState();
    const user = state.session?.user;
    if(!user) return;

    const name = document.getElementById("name").value;
    const location = document.getElementById("location").value;
    const bio = document.getElementById("bio").value;

    let avatar_url;

    const file = avatarInputRef?.files?.[0];

    if(file){

      const ext = file.name.split(".").pop();
      const filePath = `${user.id}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert:true });

      if(error){
        console.error(error);
      }

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatar_url = data.publicUrl;
    }

    const payload = {
      id: user.id,
      name,
      location,
      bio
    };

    if(avatar_url){
      payload.avatar_url = avatar_url;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(payload);

    if(error){
      console.error("Error guardando perfil:", error);
      return;
    }

    navigate("profile");
  };

}

function unmountEditProfile(){
  avatarInputRef = null;
}

export const EditProfileView = createView(
  renderEditProfile,
  mountEditProfile,
  unmountEditProfile
);