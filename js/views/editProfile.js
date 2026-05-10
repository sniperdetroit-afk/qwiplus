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
      <section class="edit-profile-page">
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
    ? `<img src="${profile.avatar_url}" id="avatarPreview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<div id="avatarPreview" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;">👤</div>`;

  return `
  <section class="edit-profile-page" style="max-width:480px;margin:0 auto;padding:20px;">

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <button id="backProfile" style="
        background:none;
        border:none;
        font-size:22px;
        cursor:pointer;
        color:#6b7280;
        padding:4px 8px;
        border-radius:8px;
      ">←</button>
      <h2 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Editar perfil</h2>
    </div>

    <!-- AVATAR -->
    <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px;">

      <div style="
        position:relative;
        width:90px;
        height:90px;
        border-radius:50%;
        background:#f3f4f6;
        box-shadow:0 8px 20px rgba(0,0,0,.12);
        overflow:hidden;
        margin-bottom:10px;
      ">
        ${avatarHtml}
      </div>

      <label for="avatarUpload" style="
        display:inline-flex;
        align-items:center;
        gap:6px;
        background:#eff6ff;
        color:#2563eb;
        border:none;
        border-radius:999px;
        padding:8px 16px;
        font-size:13px;
        font-weight:600;
        cursor:pointer;
      ">
        📷 Cambiar foto
      </label>

      <input
        type="file"
        id="avatarUpload"
        accept="image/*"
        style="display:none;"
      >

    </div>

    <!-- CAMPOS -->
    <div style="display:flex;flex-direction:column;gap:14px;">

      <div>
        <label style="font-size:13px;font-weight:600;color:#6b7280;margin-bottom:6px;display:block;">Nombre</label>
        <input
          id="name"
          type="text"
          placeholder="Tu nombre"
          value="${profile.name || ""}"
          style="
            width:100%;
            padding:12px 14px;
            border:1.5px solid #e5e7eb;
            border-radius:12px;
            font-size:15px;
            outline:none;
            box-sizing:border-box;
            background:#fff;
            color:#111827;
            transition:border 0.2s;
          "
        >
      </div>

      <div>
        <label style="font-size:13px;font-weight:600;color:#6b7280;margin-bottom:6px;display:block;">Ubicación</label>
        <input
          id="location"
          type="text"
          placeholder="Tu ciudad"
          value="${profile.location || ""}"
          style="
            width:100%;
            padding:12px 14px;
            border:1.5px solid #e5e7eb;
            border-radius:12px;
            font-size:15px;
            outline:none;
            box-sizing:border-box;
            background:#fff;
            color:#111827;
            transition:border 0.2s;
          "
        >
      </div>

      <div>
        <label style="font-size:13px;font-weight:600;color:#6b7280;margin-bottom:6px;display:block;">Bio</label>
        <textarea
          id="bio"
          placeholder="Cuéntanos algo sobre ti..."
          rows="3"
          style="
            width:100%;
            padding:12px 14px;
            border:1.5px solid #e5e7eb;
            border-radius:12px;
            font-size:15px;
            outline:none;
            box-sizing:border-box;
            background:#fff;
            color:#111827;
            resize:none;
            font-family:inherit;
            transition:border 0.2s;
          "
        >${profile.bio || ""}</textarea>
      </div>

    </div>

    <!-- BOTÓN GUARDAR -->
    <button id="saveProfile" style="
      width:100%;
      margin-top:24px;
      padding:14px;
      background:linear-gradient(135deg,#3b82f6,#6366f1);
      color:white;
      border:none;
      border-radius:14px;
      font-size:16px;
      font-weight:700;
      cursor:pointer;
      box-shadow:0 4px 14px rgba(99,102,241,.35);
    ">
      Guardar cambios
    </button>

  </section>
  `;
}

function mountEditProfile(){

  const save = document.getElementById("saveProfile");
  const back = document.getElementById("backProfile");
  const avatarInput = document.getElementById("avatarUpload");

  avatarInputRef = avatarInput;

  if(back){
    back.onclick = () => history.back();
  }

  if(avatarInput){
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if(!file) return;

      const previewURL = URL.createObjectURL(file);
      const preview = document.getElementById("avatarPreview");

      if(preview){
        if(preview.tagName === "IMG"){
          preview.src = previewURL;
        } else {
          preview.outerHTML = `<img src="${previewURL}" id="avatarPreview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
      }
    });
  }

  if(!save) return;

  save.onclick = async () => {

    save.textContent = "Guardando...";
    save.disabled = true;

    const state = getState();
    const user = state.session?.user;
    if(!user) return;

    const name = document.getElementById("name")?.value || "";
    const location = document.getElementById("location")?.value || "";
    const bio = document.getElementById("bio")?.value || "";

    let avatar_url;

    const file = avatarInputRef?.files?.[0];

    if(file){
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if(uploadError){
        console.error("Avatar upload error:", uploadError);
      } else {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }
    }

    const payload = { id: user.id, name, location, bio };
    if(avatar_url) payload.avatar_url = avatar_url;

    const { error } = await supabase
      .from("profiles")
      .upsert(payload);

    if(error){
      console.error("Error guardando perfil:", error);
      save.textContent = "Guardar cambios";
      save.disabled = false;
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
