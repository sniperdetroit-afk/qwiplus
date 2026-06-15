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
   return `<section style="padding:20px;color:#f1f5f9;"><p>No has iniciado sesión</p></section>`;
 }

 const { data } = await supabase
   .from("profiles")
   .select("*")
   .eq("id", user.id)
   .maybeSingle();

 const profile = data || {};

 const avatarHtml = profile.avatar_url && !profile.avatar_url.includes("dicebear")
   ? `<img src="${profile.avatar_url}" id="avatarPreview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
   : `<div id="avatarPreview" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;color:#22d3ee;font-weight:800;">${(profile.name || "?").charAt(0).toUpperCase()}</div>`;

 const inputStyle = `
   width:100%;padding:14px;
   border:1px solid rgba(34,211,238,0.25);
   border-radius:12px;font-size:15px;
   outline:none;box-sizing:border-box;
   background:rgba(6,11,28,0.65);
   color:#f1f5f9;
   backdrop-filter:blur(8px);
   transition:border 0.2s;
   font-family:inherit;
 `;

 return `
 <section style="
   min-height:100vh;
   background:#020617;
   padding:20px;padding-bottom:100px;
 ">
   <div style="max-width:480px;margin:0 auto;">

     <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
       <button id="backProfile" style="
         background:rgba(34,211,238,0.1);
         border:1px solid rgba(34,211,238,0.25);
         font-size:18px;cursor:pointer;color:#22d3ee;
         padding:6px 12px;border-radius:999px;
       ">←</button>
       <h2 style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;">Editar perfil</h2>
     </div>

     <!-- AVATAR -->
     <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px;">
       <div style="
         position:relative;width:90px;height:90px;
         border-radius:50%;
         background:rgba(34,211,238,0.1);
         border:2px solid rgba(34,211,238,0.3);
         box-shadow:0 0 20px rgba(34,211,238,0.2);
         overflow:hidden;margin-bottom:12px;
       ">
         ${avatarHtml}
       </div>

       <label for="avatarUpload" style="
         display:inline-flex;align-items:center;gap:6px;
         background:rgba(34,211,238,0.1);
         color:#22d3ee;
         border:1px solid rgba(34,211,238,0.25);
         border-radius:999px;padding:8px 16px;
         font-size:13px;font-weight:600;cursor:pointer;
       ">
         📷 Cambiar foto
       </label>
       <input type="file" id="avatarUpload" accept="image/*" style="display:none;">
     </div>

     <!-- CAMPOS -->
     <div style="display:flex;flex-direction:column;gap:16px;">

       <div>
         <label style="font-size:13px;font-weight:600;color:#94a3b8;margin-bottom:6px;display:block;">Nombre</label>
         <input id="name" type="text" placeholder="Tu nombre" value="${profile.name || ""}"
           style="${inputStyle}"
           onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
           onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
         >
       </div>

       <div>
         <label style="font-size:13px;font-weight:600;color:#94a3b8;margin-bottom:6px;display:block;">Ubicación</label>
         <input id="location" type="text" placeholder="Tu ciudad" value="${profile.location || ""}"
           style="${inputStyle}"
           onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
           onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
         >
       </div>

       <div>
         <label style="font-size:13px;font-weight:600;color:#94a3b8;margin-bottom:6px;display:block;">Bio</label>
         <textarea id="bio" placeholder="Cuéntanos algo sobre ti..." rows="3"
           style="${inputStyle}resize:none;"
           onfocus="this.style.borderColor='#22d3ee';this.style.boxShadow='0 0 0 2px rgba(34,211,238,0.15)'"
           onblur="this.style.borderColor='rgba(34,211,238,0.25)';this.style.boxShadow='none'"
         >${profile.bio || ""}</textarea>
       </div>

     </div>

     <!-- BOTÓN GUARDAR -->
     <button id="saveProfile" style="
       width:100%;margin-top:24px;padding:14px;
       background:#22d3ee;color:#020617;
       border:none;border-radius:14px;
       font-size:16px;font-weight:700;cursor:pointer;
       box-shadow:0 0 20px rgba(34,211,238,0.35);
       transition:0.2s;
     "
       onmouseover="this.style.boxShadow='0 0 30px rgba(34,211,238,0.6)'"
       onmouseout="this.style.boxShadow='0 0 20px rgba(34,211,238,0.35)'"
     >Guardar cambios</button>

   </div>
 </section>
 `;
}

function mountEditProfile(){

 const save = document.getElementById("saveProfile");
 const back = document.getElementById("backProfile");
 const avatarInput = document.getElementById("avatarUpload");

 avatarInputRef = avatarInput;

 if(back) back.onclick = () => history.back();

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

   const name     = document.getElementById("name")?.value || "";
   const location = document.getElementById("location")?.value || "";
   const bio      = document.getElementById("bio")?.value || "";

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
       const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
       avatar_url = data.publicUrl;
     }
   }

   const payload = { id: user.id, name, location, bio };
   if(avatar_url) payload.avatar_url = avatar_url;

   const { error } = await supabase.from("profiles").upsert(payload);

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