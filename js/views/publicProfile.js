// js/views/publicProfile.js

import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { getState } from "../core/state.js";
import { blockUser, unblockUser, isBlocked } from "../services/blockService.js";
import { escapeHtml } from "../core/escapeHtml.js";

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
  const url = profile?.avatar_url || "";
  // Ignorar avatares de dicebear (no son pro)
  const isDicebear = url.includes("dicebear") || url.includes("api.dicebear");
  if (url && !isDicebear) {
    return `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  }
  const name = profile?.name || "?";
  const initials = getInitials(name);
  const color = getColorFromString(name);
  return `
    <div style="width:100%;height:100%;border-radius:50%;background:${color};
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:28px;font-weight:800;">
      ${initials}
    </div>
  `;
}

function starsHtml(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? "#f59e0b" : "rgba(255,255,255,0.2)"};font-size:16px;">★</span>`
  ).join("");
}

function avgRating(reviews) {
  if (!reviews.length) return 0;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

/* ================= RENDER ================= */

async function renderPublicProfile() {
  return `
    <section style="
      max-width:600px;margin:0 auto;padding-bottom:80px;
      min-height:100vh;background:#020617;color:#f1f5f9;
    ">
      <div id="publicProfileContent">
        <p style="text-align:center;padding:40px;color:#94a3b8;">Cargando perfil...</p>
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

  const [profileRes, adsRes, reviewsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("ads").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("reviews").select("*").eq("reviewed_id", userId).order("created_at", { ascending: false })
  ]);

  const p = profileRes.data || {};
  const name = escapeHtml(p.name || "Usuario");
  const location = p.location ? `📍 ${escapeHtml(p.location)}` : "";
  const adsList = adsRes.data || [];
  const reviewsList = reviewsRes.data || [];
  const avg = avgRating(reviewsList);

  const isOtherUser = currentUser && currentUser.id !== userId;

  let blocked = false;
  if (isOtherUser) {
    blocked = await isBlocked(currentUser.id, userId);
  }

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
        background:rgba(34,211,238,0.1);
        border:1px solid rgba(34,211,238,0.25);
        color:#22d3ee;font-size:18px;
        padding:6px 12px;border-radius:999px;cursor:pointer;
      ">←</button>
      ${isOtherUser ? `
        <button id="moreBtn" style="
          background:none;border:none;font-size:22px;
          cursor:pointer;color:#94a3b8;padding:4px 10px;
        ">⋮</button>
      ` : ""}
    </div>

    <!-- INFO USUARIO -->
    <div style="display:flex;align-items:center;gap:16px;padding:0 20px 16px;">
      <div style="width:72px;height:72px;border-radius:50%;overflow:hidden;flex-shrink:0;
        box-shadow:0 0 20px rgba(34,211,238,0.3);border:2px solid rgba(34,211,238,0.3);">
        ${avatarHtml(p)}
      </div>
      <div style="flex:1;">
        <h2 style="margin:0;font-size:20px;font-weight:700;color:#f1f5f9;">${name}</h2>
        ${location ? `<p style="margin:4px 0 2px;font-size:13px;color:#94a3b8;">${location}</p>` : ""}
        ${reviewsList.length > 0 ? `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
            ${starsHtml(Math.round(avg))}
            <span style="font-size:13px;font-weight:700;color:#22d3ee;">${avg}</span>
            <span style="font-size:12px;color:#94a3b8;">(${reviewsList.length})</span>
          </div>
        ` : `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">Sin valoraciones aún</p>`}
      </div>
    </div>

    <!-- BOTÓN REPUTACIÓN -->
    <div style="padding:0 20px 16px;">
      <button id="reputationBtn" style="
        width:100%;padding:12px;
        background:rgba(34,211,238,0.1);
        border:1px solid rgba(34,211,238,0.25);
        color:#22d3ee;font-size:14px;font-weight:700;
        border-radius:999px;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:8px;
        transition:0.2s;
      ">⭐ Ver reputación</button>
    </div>

    ${blocked ? `
      <div style="margin:0 20px 16px;padding:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;display:flex;align-items:center;gap:10px;">
        <div style="font-size:20px;">🚫</div>
        <div style="flex:1;font-size:13px;color:#fca5a5;font-weight:600;">Has bloqueado a este usuario</div>
        <button id="unblockBtn" style="
          background:#ef4444;color:white;border:none;
          padding:6px 12px;border-radius:8px;
          font-size:12px;font-weight:700;cursor:pointer;
        ">Desbloquear</button>
      </div>
    ` : ""}

    <!-- STATS -->
    <div style="display:flex;gap:10px;padding:0 20px 16px;">
      <div style="flex:1;background:rgba(6,11,28,0.65);border:1px solid rgba(34,211,238,0.15);border-radius:14px;padding:14px;text-align:center;backdrop-filter:blur(8px);">
        <strong style="display:block;font-size:20px;color:#22d3ee;">${adsList.length}</strong>
        <span style="font-size:12px;color:#94a3b8;">Anuncios</span>
      </div>
      <div style="flex:1;background:rgba(6,11,28,0.65);border:1px solid rgba(34,211,238,0.15);border-radius:14px;padding:14px;text-align:center;backdrop-filter:blur(8px);">
        <strong style="display:block;font-size:20px;color:#22d3ee;">${reviewsList.length}</strong>
        <span style="font-size:12px;color:#94a3b8;">Valoraciones</span>
      </div>
      <div style="flex:1;background:rgba(6,11,28,0.65);border:1px solid rgba(34,211,238,0.15);border-radius:14px;padding:14px;text-align:center;backdrop-filter:blur(8px);">
        <strong style="display:block;font-size:20px;color:#22d3ee;">✓</strong>
        <span style="font-size:12px;color:#94a3b8;">Verificado</span>
      </div>
    </div>

    <!-- PESTAÑAS -->
    <div style="display:flex;border-bottom:1px solid rgba(34,211,238,0.15);margin:0 20px 16px;">
      <button id="tabAds" style="
        flex:1;padding:12px;border:none;background:none;
        font-weight:700;font-size:14px;color:#22d3ee;
        border-bottom:2px solid #22d3ee;margin-bottom:-1px;cursor:pointer;
      ">En venta (${adsList.length})</button>
      <button id="tabReviews" style="
        flex:1;padding:12px;border:none;background:none;
        font-weight:700;font-size:14px;color:#94a3b8;cursor:pointer;
      ">Valoraciones (${reviewsList.length})</button>
    </div>

    <!-- CONTENIDO PESTAÑAS -->
    <div id="tabContent" style="padding:0 20px;"></div>

    <!-- BOTÓN VALORAR -->
    ${canReview && !alreadyReviewed && !blocked ? `
      <div style="padding:16px 20px;">
        <button id="openReviewBtn" style="
          width:100%;padding:14px;
          background:rgba(245,158,11,0.15);
          border:1px solid rgba(245,158,11,0.4);
          color:#f59e0b;border:none;border-radius:14px;
          font-size:15px;font-weight:700;cursor:pointer;
        ">⭐ Valorar a ${name}</button>
      </div>
    ` : ""}

    <!-- FORM VALORACIÓN -->
    <div id="reviewForm" style="display:none;padding:0 20px 20px;">
      <div style="background:rgba(6,11,28,0.65);border:1px solid rgba(34,211,238,0.2);border-radius:16px;padding:20px;backdrop-filter:blur(12px);">
        <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#f1f5f9;">Tu valoración</h3>

        <div style="display:flex;gap:8px;margin-bottom:16px;" id="starPicker">
          ${[1,2,3,4,5].map(n => `
            <button data-star="${n}" style="
              font-size:28px;background:none;border:none;cursor:pointer;
              color:rgba(255,255,255,0.2);transition:color 0.15s;
            ">★</button>
          `).join("")}
        </div>

        <textarea id="reviewComment" placeholder="Cuéntanos tu experiencia..." rows="3" style="
          width:100%;padding:12px;
          border:1px solid rgba(34,211,238,0.25);
          border-radius:12px;font-size:14px;resize:none;
          box-sizing:border-box;outline:none;font-family:inherit;
          background:rgba(2,6,23,0.65);color:#f1f5f9;
        "></textarea>

        <button id="submitReview" style="
          width:100%;margin-top:12px;padding:12px;
          background:#22d3ee;color:#020617;
          border:none;border-radius:12px;
          font-size:15px;font-weight:700;cursor:pointer;
        ">Enviar valoración</button>
      </div>
    </div>
  `;

  renderTabAds(adsList);

  const tabAds = document.getElementById("tabAds");
  const tabReviews = document.getElementById("tabReviews");

  tabAds.onclick = () => {
    tabAds.style.color = "#22d3ee";
    tabAds.style.borderBottom = "2px solid #22d3ee";
    tabReviews.style.color = "#94a3b8";
    tabReviews.style.borderBottom = "none";
    renderTabAds(adsList);
  };

  tabReviews.onclick = () => {
    tabReviews.style.color = "#22d3ee";
    tabReviews.style.borderBottom = "2px solid #22d3ee";
    tabAds.style.color = "#94a3b8";
    tabAds.style.borderBottom = "none";
    renderTabReviews(reviewsList);
  };

  // Botón reputación
  document.getElementById("reputationBtn")?.addEventListener("click", () => {
    navigate("reputation", { userId });
  });

  const openReviewBtn = document.getElementById("openReviewBtn");
  const reviewForm = document.getElementById("reviewForm");

  if (openReviewBtn) {
    openReviewBtn.onclick = () => {
      reviewForm.style.display = "block";
      openReviewBtn.style.display = "none";
    };
  }

  let selectedRating = 0;
  const starPicker = document.getElementById("starPicker");
  if (starPicker) {
    starPicker.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        selectedRating = Number(btn.dataset.star);
        starPicker.querySelectorAll("button").forEach((b, i) => {
          b.style.color = i < selectedRating ? "#f59e0b" : "rgba(255,255,255,0.2)";
        });
      };
    });
  }

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
        <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:16px;padding:20px;text-align:center;">
          <div style="font-size:32px;">✅</div>
          <p style="font-weight:700;color:#86efac;margin:8px 0 0;">¡Valoración enviada!</p>
        </div>
      `;
      reviewForm.style.display = "block";
    };
  }

  document.getElementById("backPublicProfile")?.addEventListener("click", () => history.back());

  const moreBtn = document.getElementById("moreBtn");
  if (moreBtn) {
    moreBtn.onclick = () => openBlockMenu(currentUser.id, userId, name);
  }

  const unblockBtn = document.getElementById("unblockBtn");
  if (unblockBtn) {
    unblockBtn.onclick = async () => {
      const ok = confirm(`¿Desbloquear a ${name}?`);
      if (!ok) return;
      const { error } = await unblockUser(currentUser.id, userId);
      if (error) { alert("Error al desbloquear: " + (error.message || error)); return; }
      alert(`${name} ya no está bloqueado.`);
      location.reload();
    };
  }
}

/* ================= MENÚ BLOQUEAR ================= */

function openBlockMenu(currentUserId, targetUserId, targetName) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    z-index:9999;display:flex;align-items:flex-end;justify-content:center;
  `;

  const sheet = document.createElement("div");
  sheet.style.cssText = `
    width:100%;max-width:500px;
    background:#060b1c;border:1px solid rgba(34,211,238,0.2);
    border-radius:20px 20px 0 0;padding:20px;
  `;

  sheet.innerHTML = `
    <div style="width:40px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 16px;"></div>
    <button id="blockBtnAction" style="
      width:100%;padding:14px;text-align:left;
      background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
      border-radius:12px;
      font-size:15px;color:#fca5a5;font-weight:700;
      cursor:pointer;display:flex;align-items:center;gap:12px;margin-bottom:10px;
    ">
      <span style="font-size:20px;">🚫</span>
      Bloquear a ${targetName}
    </button>
    <button id="cancelBlock" style="
      width:100%;padding:14px;
      background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
      border-radius:12px;
      font-size:15px;color:#94a3b8;font-weight:600;cursor:pointer;
    ">Cancelar</button>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  sheet.querySelector("#cancelBlock").onclick = () => overlay.remove();

  sheet.querySelector("#blockBtnAction").onclick = async () => {
    const ok = confirm(`¿Bloquear a ${targetName}?`);
    if (!ok) return;
    const { error } = await blockUser(currentUserId, targetUserId);
    if (error) { alert("Error al bloquear: " + (error.message || error)); return; }
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
    content.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:30px 0;">Sin anuncios activos</p>`;
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
    content.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:30px 0;">Sin valoraciones aún</p>`;
    return;
  }

  content.innerHTML = reviewsList.map(r => {
    const stars = Array.from({length:5},(_,i) =>
      `<span style="color:${i<r.rating?"#f59e0b":"rgba(255,255,255,0.2)"};font-size:14px;">★</span>`
    ).join("");
    const date = new Date(r.created_at).toLocaleDateString("es-ES");

    return `
      <div style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:40px;height:40px;border-radius:50%;background:rgba(34,211,238,0.2);border:1px solid rgba(34,211,238,0.3);display:flex;align-items:center;justify-content:center;color:#22d3ee;font-weight:700;">U</div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:14px;color:#f1f5f9;">Usuario</div>
            <div style="display:flex;gap:2px;">${stars}</div>
          </div>
          <div style="font-size:12px;color:#64748b;">${date}</div>
        </div>
        ${r.comment ? `<p style="margin:0;font-size:14px;color:#94a3b8;">${escapeHtml(r.comment)}</p>` : ""}
      </div>
    `;
  }).join("");
}

/* ================= EXPORT ================= */

export const PublicProfileView = async () => {
  const html = await renderPublicProfile();
  return { html, mount: mountPublicProfile };
};