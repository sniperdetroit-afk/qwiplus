// js/views/publicProfile.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { getState } from "../core/state.js";
import { blockUser, unblockUser, isBlocked } from "../services/blockService.js";

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

function starsHtml(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? "#f59e0b" : "#d1d5db"};font-size:16px;">★</span>`
  ).join("");
}

function avgRating(reviews) {
  if (!reviews.length) return 0;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
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
  const userId = state.app?.params?.userId || state.app?.params?.user || state.user;
  const currentUser = state.session?.user;
  const container = document.getElementById("publicProfileContent");

  if (!userId || !container) return;

  // Cargar datos en paralelo
  const [profileRes, adsRes, reviewsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("ads").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("reviews").select("*, profiles(name, avatar_url)").eq("reviewed_id", userId).order("created_at", { ascending: false })
  ]);

  const p = profileRes.data || {};
  const name = p.name || "Usuario";
  const location = p.location ? `📍 ${p.location}` : "";
  const adsList = adsRes.data || [];
  const reviewsList = reviewsRes.data || [];
  const avg = avgRating(reviewsList);

  // ¿Es otro usuario? (no yo mismo)
  const isOtherUser = currentUser && currentUser.id !== userId;

  // ¿Ya lo tengo bloqueado?
  let blocked = false;
  if (isOtherUser) {
    blocked = await isBlocked(currentUser.id, userId);
  }

  // ¿Puede valorar? Solo si es otro usuario y tiene conversación con él
  let canReview = false;
  let alreadyReviewed = false;

  if (currentUser && currentUser.id !== userId) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .maybeSingle();

    canReview = !!conv;

    if (canReview) {
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("reviewer_id", currentUser.id)
        .eq("reviewed_id", userId)
        .maybeSingle();
      alreadyReviewed = !!existing;
    }
  }

  container.innerHTML = `

    <!-- HEADER -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;">
      <button id="backPublicProfile" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;
      ">←</button>
      ${isOtherUser ? `
        <button id="moreBtn" style="
          background:none;border:none;font-size:22px;
          cursor:pointer;color:#6b7280;padding:4px 10px;
        ">⋮</button>
      ` : ""}
    </div>

    <!-- INFO USUARIO -->
    <div style="display:flex;align-items:center;gap:16px;padding:0 20px 16px;">
      <div style="width:72px;height:72px;border-radius:50%;overflow:hidden;flex-shrink:0;
        box-shadow:0 4px 14px rgba(0,0,0,0.12);">
        ${avatarHtml(p)}
      </div>
      <div style="flex:1;">
        <h2 style="margin:0;font-size:20px;font-weight:700;color:#111827;">${name}</h2>
        ${location ? `<p style="margin:4px 0 2px;font-size:13px;color:#6b7280;">${location}</p>` : ""}
        ${reviewsList.length > 0 ? `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
            ${starsHtml(Math.round(avg))}
            <span style="font-size:13px;font-weight:700;color:#111827;">${avg}</span>
            <span style="font-size:12px;color:#6b7280;">(${reviewsList.length})</span>
          </div>
        ` : `<p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Sin valoraciones aún</p>`}
      </div>
    </div>

    ${blocked ? `
      <!-- BANNER USUARIO BLOQUEADO -->
      <div style="margin:0 20px 16px;padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;display:flex;align-items:center;gap:10px;">
        <div style="font-size:20px;">🚫</div>
        <div style="flex:1;font-size:13px;color:#991b1b;font-weight:600;">
          Has bloqueado a este usuario
        </div>
        <button id="unblockBtn" style="
          background:#dc2626;color:white;border:none;
          padding:6px 12px;border-radius:8px;
          font-size:12px;font-weight:700;cursor:pointer;
        ">Desbloquear</button>
      </div>
    ` : ""}

    <!-- STATS -->
    <div style="display:flex;gap:10px;padding:0 20px 16px;">
      <div style="flex:1;background:#f8fafc;border-radius:14px;padding:14px;text-align:center;">
        <strong style="display:block;font-size:20px;color:#111827;">${adsList.length}</strong>
        <span style="font-size:12px;color:#6b7280;">Anuncios</span>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:14px;padding:14px;text-align:center;">
        <strong style="display:block;font-size:20px;color:#111827;">${reviewsList.length}</strong>
        <span style="font-size:12px;color:#6b7280;">Valoraciones</span>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:14px;padding:14px;text-align:center;">
        <strong style="display:block;font-size:20px;color:#10b981;">✓</strong>
        <span style="font-size:12px;color:#6b7280;">Verificado</span>
      </div>
    </div>

    <!-- PESTAÑAS -->
    <div style="display:flex;border-bottom:2px solid #f1f5f9;margin:0 20px 16px;">
      <button id="tabAds" style="
        flex:1;padding:12px;border:none;background:none;
        font-weight:700;font-size:14px;color:#6DA8FF;
        border-bottom:2px solid #6DA8FF;margin-bottom:-2px;cursor:pointer;
      ">En venta (${adsList.length})</button>
      <button id="tabReviews" style="
        flex:1;padding:12px;border:none;background:none;
        font-weight:700;font-size:14px;color:#9ca3af;cursor:pointer;
      ">Valoraciones (${reviewsList.length})</button>
    </div>

    <!-- CONTENIDO PESTAÑAS -->
    <div id="tabContent" style="padding:0 20px;"></div>

    <!-- BOTÓN VALORAR -->
    ${canReview && !alreadyReviewed && !blocked ? `
      <div style="padding:16px 20px;">
        <button id="openReviewBtn" style="
          width:100%;padding:14px;
          background:linear-gradient(135deg,#f59e0b,#f97316);
          color:white;border:none;border-radius:14px;
          font-size:15px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 14px rgba(245,158,11,0.35);
        ">⭐ Valorar a ${name}</button>
      </div>
    ` : ""}

    <!-- FORM VALORACIÓN (oculto) -->
    <div id="reviewForm" style="display:none;padding:0 20px 20px;">
      <div style="background:#f8fafc;border-radius:16px;padding:20px;">
        <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;">Tu valoración</h3>

        <div style="display:flex;gap:8px;margin-bottom:16px;" id="starPicker">
          ${[1,2,3,4,5].map(n => `
            <button data-star="${n}" style="
              font-size:28px;background:none;border:none;cursor:pointer;
              color:#d1d5db;transition:color 0.15s;
            ">★</button>
          `).join("")}
        </div>

        <textarea id="reviewComment" placeholder="Cuéntanos tu experiencia..." rows="3" style="
          width:100%;padding:12px;border:1.5px solid #e5e7eb;
          border-radius:12px;font-size:14px;resize:none;
          box-sizing:border-box;outline:none;font-family:inherit;
        "></textarea>

        <button id="submitReview" style="
          width:100%;margin-top:12px;padding:12px;
          background:linear-gradient(135deg,#3b82f6,#6366f1);
          color:white;border:none;border-radius:12px;
          font-size:15px;font-weight:700;cursor:pointer;
        ">Enviar valoración</button>
      </div>
    </div>
  `;

  // Renderizar pestaña inicial
  renderTabAds(adsList);

  // Tabs
  const tabAds = document.getElementById("tabAds");
  const tabReviews = document.getElementById("tabReviews");

  tabAds.onclick = () => {
    tabAds.style.color = "#6DA8FF";
    tabAds.style.borderBottom = "2px solid #6DA8FF";
    tabReviews.style.color = "#9ca3af";
    tabReviews.style.borderBottom = "none";
    renderTabAds(adsList);
  };

  tabReviews.onclick = () => {
    tabReviews.style.color = "#6DA8FF";
    tabReviews.style.borderBottom = "2px solid #6DA8FF";
    tabAds.style.color = "#9ca3af";
    tabAds.style.borderBottom = "none";
    renderTabReviews(reviewsList);
  };

  // Botón valorar
  const openReviewBtn = document.getElementById("openReviewBtn");
  const reviewForm = document.getElementById("reviewForm");

  if (openReviewBtn) {
    openReviewBtn.onclick = () => {
      reviewForm.style.display = "block";
      openReviewBtn.style.display = "none";
    };
  }

  // Star picker
  let selectedRating = 0;
  const starPicker = document.getElementById("starPicker");
  if (starPicker) {
    starPicker.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        selectedRating = Number(btn.dataset.star);
        starPicker.querySelectorAll("button").forEach((b, i) => {
          b.style.color = i < selectedRating ? "#f59e0b" : "#d1d5db";
        });
      };
    });
  }

  // Enviar valoración
  const submitReview = document.getElementById("submitReview");
  if (submitReview) {
    submitReview.onclick = async () => {
      if (!selectedRating) { alert("Selecciona una puntuación"); return; }

      const comment = document.getElementById("reviewComment").value.trim();

      submitReview.disabled = true;
      submitReview.textContent = "Enviando...";

      const { error } = await supabase.from("reviews").insert({
        reviewer_id: currentUser.id,
        reviewed_id: userId,
        rating: selectedRating,
        comment: comment || null
      });

      if (error) {
        alert("Error: " + error.message);
        submitReview.disabled = false;
        submitReview.textContent = "Enviar valoración";
        return;
      }

      reviewForm.innerHTML = `
        <div style="background:#f0fdf4;border-radius:16px;padding:20px;text-align:center;">
          <div style="font-size:32px;">✅</div>
          <p style="font-weight:700;color:#16a34a;margin:8px 0 0;">¡Valoración enviada!</p>
        </div>
      `;
      reviewForm.style.display = "block";
    };
  }

  const backBtn = document.getElementById("backPublicProfile");
  if (backBtn) backBtn.onclick = () => history.back();

  // Menú ⋮ (bloquear)
  const moreBtn = document.getElementById("moreBtn");
  if (moreBtn) {
    moreBtn.onclick = () => openBlockMenu(currentUser.id, userId, name);
  }

  // Desbloquear
  const unblockBtn = document.getElementById("unblockBtn");
  if (unblockBtn) {
    unblockBtn.onclick = async () => {
      const ok = confirm(`¿Desbloquear a ${name}?`);
      if (!ok) return;

      const { error } = await unblockUser(currentUser.id, userId);
      if (error) {
        alert("Error al desbloquear: " + (error.message || error));
        return;
      }
      alert(`${name} ya no está bloqueado.`);
      location.reload();
    };
  }
}

/* ================= MENÚ ⋮ BLOQUEAR ================= */

function openBlockMenu(currentUserId, targetUserId, targetName) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);
    z-index:9999;display:flex;align-items:flex-end;justify-content:center;
  `;

  const sheet = document.createElement("div");
  sheet.style.cssText = `
    width:100%;max-width:500px;background:white;
    border-radius:20px 20px 0 0;padding:20px;
    box-shadow:0 -8px 32px rgba(0,0,0,0.2);
  `;

  sheet.innerHTML = `
    <div style="width:40px;height:4px;background:#e5e7eb;border-radius:2px;margin:0 auto 16px;"></div>

    <button id="blockBtnAction" style="
      width:100%;padding:14px;text-align:left;
      background:none;border:none;
      font-size:15px;color:#dc2626;font-weight:700;
      cursor:pointer;border-radius:10px;
      display:flex;align-items:center;gap:12px;
    ">
      <span style="font-size:20px;">🚫</span>
      Bloquear a ${targetName}
    </button>

    <button id="cancelBlock" style="
      width:100%;margin-top:8px;padding:14px;
      background:#f3f4f6;border:none;border-radius:10px;
      font-size:15px;color:#374151;font-weight:600;cursor:pointer;
    ">Cancelar</button>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  sheet.querySelector("#cancelBlock").onclick = () => overlay.remove();

  sheet.querySelector("#blockBtnAction").onclick = async () => {
    const ok = confirm(`¿Bloquear a ${targetName}?\n\nNo podrá escribirte mensajes y no verás sus anuncios.`);
    if (!ok) return;

    const { error } = await blockUser(currentUserId, targetUserId);
    if (error) {
      alert("Error al bloquear: " + (error.message || error));
      return;
    }

    overlay.remove();
    alert(`${targetName} ha sido bloqueado.`);
    location.reload();
  };
}

/* ================= TAB ADS ================= */

function renderTabAds(adsList) {
  const content = document.getElementById("tabContent");
  if (!content) return;

  if (adsList.length === 0) {
    content.innerHTML = `<p style="text-align:center;color:#6b7280;padding:30px 0;">Sin anuncios activos</p>`;
    return;
  }

  content.innerHTML = `
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
  `;

  content.querySelectorAll(".card[data-id]").forEach(card => {
    card.onclick = () => navigate("adDetail", { id: card.dataset.id });
  });
}

/* ================= TAB REVIEWS ================= */

function renderTabReviews(reviewsList) {
  const content = document.getElementById("tabContent");
  if (!content) return;

  if (reviewsList.length === 0) {
    content.innerHTML = `<p style="text-align:center;color:#6b7280;padding:30px 0;">Sin valoraciones aún</p>`;
    return;
  }

  content.innerHTML = reviewsList.map(r => {
    const reviewerName = r.profiles?.name || "Usuario";
    const reviewerAvatar = r.profiles?.avatar_url
      ? `<img src="${r.profiles.avatar_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`
      : `<div style="width:40px;height:40px;border-radius:50%;background:#6DA8FF;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;">${reviewerName.charAt(0).toUpperCase()}</div>`;

    return `
      <div style="padding:16px 0;border-bottom:1px solid #f1f5f9;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          ${reviewerAvatar}
          <div>
            <div style="font-weight:600;font-size:14px;color:#111827;">${reviewerName}</div>
            <div style="display:flex;gap:2px;">
              ${Array.from({length:5},(_,i) => `<span style="color:${i<r.rating?"#f59e0b":"#d1d5db"};font-size:14px;">★</span>`).join("")}
            </div>
          </div>
        </div>
        ${r.comment ? `<p style="margin:0;font-size:14px;color:#374151;">${r.comment}</p>` : ""}
      </div>
    `;
  }).join("");
}

/* ================= EXPORT ================= */

export const PublicProfileView = async () => {
  const html = await renderPublicProfile();
  return { html, mount: mountPublicProfile };
};