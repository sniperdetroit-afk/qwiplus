// js/views/publicProfile.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { getState } from "../core/state.js";

function getInitials(name = "") {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function getColorFromString(str = "") {
  const colors = [
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
    "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
    "#6366F1", "#84CC16", "#06B6D4", "#A855F7"
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function avatarHtml(profile) {
  if (profile?.avatar_url) {
    return `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  }
  const name = profile?.name || "?";
  const initials = getInitials(name);
  const color = getColorFromString(name);
  return `
    <div style="width:100%;height:100%;border-radius:50%;background:${color};
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:32px;font-weight:700;">
      ${initials}
    </div>
  `;
}

/* ================= RENDER ================= */

async function renderPublicProfile() {
  return `
    <section style="max-width:600px;margin:0 auto;padding-bottom:80px;">
      <div id="publicProfileContent">
        <p style="text-align:center;padding:40px;color:#6b7280;">Cargando perfil...</p>
      </div>
    </section>
  `;
}

/* ================= MOUNT ================= */

async function mountPublicProfile() {

  const state = getState();
  const userId = state.app?.params?.userId;
  const container = document.getElementById("publicProfileContent");

  if (!userId || !container) return;

  // Cargar perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  // Cargar anuncios
  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const p = profile || {};
  const name = p.name || "Usuario";
  const location = p.location ? `📍 ${p.location}` : "";
  const adsList = ads || [];

  container.innerHTML = `

    <!-- HEADER -->
    <div style="display:flex;align-items:center;gap:12px;padding:16px;">
      <button id="backPublicProfile" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;
      ">←</button>
    </div>

    <!-- INFO USUARIO -->
    <div style="display:flex;align-items:center;gap:16px;padding:0 20px 20px;">

      <div style="width:72px;height:72px;border-radius:50%;overflow:hidden;flex-shrink:0;
        box-shadow:0 4px 14px rgba(0,0,0,0.12);">
        ${avatarHtml(p)}
      </div>

      <div style="flex:1;">
        <h2 style="margin:0;font-size:20px;font-weight:700;color:#111827;">${name}</h2>
        ${location ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${location}</p>` : ""}
      </div>

    </div>

    <!-- STATS -->
    <div style="
      display:flex;gap:10px;padding:0 20px 20px;
    ">
      <div style="flex:1;background:#f8fafc;border-radius:14px;padding:14px;text-align:center;">
        <strong style="display:block;font-size:20px;color:#111827;">${adsList.length}</strong>
        <span style="font-size:12px;color:#6b7280;">Anuncios</span>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:14px;padding:14px;text-align:center;">
        <strong style="display:block;font-size:20px;color:#111827;">
          ${adsList.reduce((s, a) => s + Number(a.favorites_count || 0), 0)}
        </strong>
        <span style="font-size:12px;color:#6b7280;">Favoritos</span>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:14px;padding:14px;text-align:center;">
        <strong style="display:block;font-size:20px;color:#10b981;">✓</strong>
        <span style="font-size:12px;color:#6b7280;">Verificado</span>
      </div>
    </div>

    <!-- ANUNCIOS -->
    <div style="padding:0 20px;">
      <h3 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;">
        En venta (${adsList.length})
      </h3>

      ${adsList.length === 0 ? `
        <p style="text-align:center;color:#6b7280;padding:30px 0;">
          Este usuario no tiene anuncios activos
        </p>
      ` : `
        <div class="ads-grid">
          ${adsList.map(ad => `
            <div class="card" data-id="${ad.id}" style="cursor:pointer;">
              <div class="card-image">
                <img src="${ad.image_url || "/img/placeholder.png"}" alt="${ad.title || ""}">
              </div>
              <div class="card-info">
                <div class="card-title">${ad.title || ""}</div>
                <div class="price">${ad.price || 0}€</div>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `;

  const backBtn = document.getElementById("backPublicProfile");
  if (backBtn) backBtn.onclick = () => history.back();

  document.querySelectorAll(".card[data-id]").forEach(card => {
    card.onclick = () => navigate("adDetail", { id: card.dataset.id });
  });
}

/* ================= EXPORT ================= */

export const PublicProfileView = async () => {
  const html = await renderPublicProfile();
  return {
    html,
    mount: mountPublicProfile
  };
};
