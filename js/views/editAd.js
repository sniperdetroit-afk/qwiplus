// js/views/editAd.js

import { createView } from "../core/createView.js";
import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";

let formRef = null;

/* ================= RENDER ================= */

async function renderEditAd(state) {

  const id = state?.app?.params?.id || state?.id;

  if (!id) {
    return `
      <section class="edit-ad-page">
        <p>Anuncio no encontrado</p>
        <button id="backBtn">Volver</button>
      </section>
    `;
  }

  const { data: ad, error } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ad) {
    return `
      <section class="edit-ad-page">
        <p>Error cargando anuncio</p>
        <button id="backBtn">Volver</button>
      </section>
    `;
  }

  const isVendido = ad.status === "vendido";
  const isReserved = ad.reserved === true;

  return `
  <section class="edit-ad-page" style="max-width:480px;margin:0 auto;padding:20px;">

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <button id="backBtn" style="
        background:none;border:none;font-size:22px;
        cursor:pointer;color:#6b7280;
      ">←</button>
      <h2 style="margin:0;font-size:22px;font-weight:700;color:#111827;">Editar anuncio</h2>
    </div>

    <!-- ESTADO ACTUAL -->
    <div style="
      display:flex;align-items:center;gap:10px;
      padding:12px 16px;border-radius:14px;margin-bottom:20px;
      background:${isVendido ? "#f0fdf4" : isReserved ? "#fef9c3" : "#eff6ff"};
      border:1.5px solid ${isVendido ? "#86efac" : isReserved ? "#fde68a" : "#bfdbfe"};
    ">
      <span style="font-size:18px;">${isVendido ? "✅" : isReserved ? "🔒" : "🟢"}</span>
      <span style="font-weight:600;color:${isVendido ? "#16a34a" : isReserved ? "#92400e" : "#1d4ed8"};">
        ${isVendido ? "Vendido" : isReserved ? "Reservado" : "Activo"}
      </span>
    </div>

    <form id="editForm" style="display:flex;flex-direction:column;gap:14px;">

      <div>
        <label style="font-size:13px;font-weight:600;color:#6b7280;margin-bottom:6px;display:block;">Título</label>
        <input
          type="text"
          id="editTitle"
          value="${ad.title || ""}"
          placeholder="Título del anuncio"
          style="
            width:100%;padding:12px 14px;
            border:1.5px solid #e5e7eb;border-radius:12px;
            font-size:15px;outline:none;box-sizing:border-box;
          "
        />
      </div>

      <div>
        <label style="font-size:13px;font-weight:600;color:#6b7280;margin-bottom:6px;display:block;">Precio (€)</label>
        <input
          type="number"
          id="editPrice"
          value="${ad.price || ""}"
          placeholder="Precio"
          style="
            width:100%;padding:12px 14px;
            border:1.5px solid #e5e7eb;border-radius:12px;
            font-size:15px;outline:none;box-sizing:border-box;
          "
        />
      </div>

      <button type="submit" id="saveAdBtn" data-id="${ad.id}" style="
        width:100%;padding:14px;
        background:linear-gradient(135deg,#3b82f6,#6366f1);
        color:white;border:none;border-radius:14px;
        font-size:16px;font-weight:700;cursor:pointer;
        box-shadow:0 4px 14px rgba(99,102,241,.35);
        margin-top:4px;
      ">
        Guardar cambios
      </button>

    </form>

    <!-- RESERVAR -->
    <div style="margin-top:16px;">
      ${isReserved ? `
        <button id="cancelReservaBtn" data-id="${ad.id}" style="
          width:100%;padding:14px;
          background:linear-gradient(135deg,#f59e0b,#d97706);
          color:white;border:none;border-radius:14px;
          font-size:16px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 14px rgba(245,158,11,.35);
        ">
          🔓 Cancelar reserva
        </button>
      ` : !isVendido ? `
        <button id="reservarBtn" data-id="${ad.id}" style="
          width:100%;padding:14px;
          background:linear-gradient(135deg,#f59e0b,#d97706);
          color:white;border:none;border-radius:14px;
          font-size:16px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 14px rgba(245,158,11,.35);
        ">
          🔒 Marcar como reservado
        </button>
      ` : ""}
    </div>

    <!-- MARCAR COMO VENDIDO -->
    <div style="margin-top:12px;">
      ${isVendido ? `
        <button id="reactivarBtn" data-id="${ad.id}" style="
          width:100%;padding:14px;
          background:linear-gradient(135deg,#10b981,#059669);
          color:white;border:none;border-radius:14px;
          font-size:16px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 14px rgba(16,185,129,.35);
        ">
          🔄 Reactivar anuncio
        </button>
      ` : `
        <button id="vendidoBtn" data-id="${ad.id}" style="
          width:100%;padding:14px;
          background:linear-gradient(135deg,#f59e0b,#ef4444);
          color:white;border:none;border-radius:14px;
          font-size:16px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 14px rgba(245,158,11,.35);
        ">
          🏷️ Marcar como vendido
        </button>
      `}
    </div>

  </section>
  `;
}

/* ================= MOUNT ================= */

function mountEditAd() {

  const backBtn = document.getElementById("backBtn");
  formRef = document.getElementById("editForm");

  if(backBtn) backBtn.onclick = () => navigate("profile");
  if(formRef) formRef.addEventListener("submit", handleSaveAd);

  // RESERVAR
  const reservarBtn = document.getElementById("reservarBtn");
  if(reservarBtn){
    reservarBtn.onclick = async () => {
      const id = reservarBtn.dataset.id;
      const ok = confirm("¿Marcar este anuncio como reservado?");
      if(!ok) return;

      reservarBtn.disabled = true;
      reservarBtn.textContent = "Guardando...";

      const { error } = await supabase
        .from("ads")
        .update({ reserved: true })
        .eq("id", id);

      if(error){
        alert("Error: " + error.message);
        reservarBtn.disabled = false;
        reservarBtn.textContent = "🔒 Marcar como reservado";
        return;
      }

      navigate("profile");
    };
  }

  // CANCELAR RESERVA
  const cancelReservaBtn = document.getElementById("cancelReservaBtn");
  if(cancelReservaBtn){
    cancelReservaBtn.onclick = async () => {
      const id = cancelReservaBtn.dataset.id;

      cancelReservaBtn.disabled = true;
      cancelReservaBtn.textContent = "Cancelando...";

      const { error } = await supabase
        .from("ads")
        .update({ reserved: false, reserved_by: null })
        .eq("id", id);

      if(error){
        alert("Error: " + error.message);
        cancelReservaBtn.disabled = false;
        cancelReservaBtn.textContent = "🔓 Cancelar reserva";
        return;
      }

      navigate("profile");
    };
  }

  // MARCAR VENDIDO
  const vendidoBtn = document.getElementById("vendidoBtn");
  if(vendidoBtn){
    vendidoBtn.onclick = async () => {
      const id = vendidoBtn.dataset.id;
      const ok = confirm("¿Marcar este anuncio como vendido?");
      if(!ok) return;

      vendidoBtn.disabled = true;
      vendidoBtn.textContent = "Guardando...";

      const { error } = await supabase
        .from("ads")
        .update({ status: "vendido", reserved: false, reserved_by: null })
        .eq("id", id);

      if(error){
        alert("Error: " + error.message);
        vendidoBtn.disabled = false;
        return;
      }

      navigate("profile");
    };
  }

  // REACTIVAR
  const reactivarBtn = document.getElementById("reactivarBtn");
  if(reactivarBtn){
    reactivarBtn.onclick = async () => {
      const id = reactivarBtn.dataset.id;

      reactivarBtn.disabled = true;
      reactivarBtn.textContent = "Reactivando...";

      const { error } = await supabase
        .from("ads")
        .update({ status: "activo", reserved: false, reserved_by: null })
        .eq("id", id);

      if(error){
        alert("Error: " + error.message);
        reactivarBtn.disabled = false;
        return;
      }

      navigate("profile");
    };
  }
}

/* ================= UNMOUNT ================= */

function unmountEditAd() {
  if(formRef) formRef.removeEventListener("submit", handleSaveAd);
  formRef = null;
}

/* ================= SAVE ================= */

async function handleSaveAd(e) {

  e.preventDefault();

  const btn = document.getElementById("saveAdBtn");
  btn.disabled = true;
  btn.textContent = "Guardando...";

  const id = btn.dataset.id;
  const title = document.getElementById("editTitle").value.trim();
  const price = document.getElementById("editPrice").value;

  if(!title || !price){
    alert("Completa los campos");
    btn.disabled = false;
    btn.textContent = "Guardar cambios";
    return;
  }

  const { error } = await supabase
    .from("ads")
    .update({ title, price })
    .eq("id", id);

  if(error){
    alert("Error guardando cambios");
    btn.disabled = false;
    btn.textContent = "Guardar cambios";
    return;
  }

  navigate("profile");
}

/* ================= EXPORT ================= */

export const EditAdView = createView({
  render: renderEditAd,
  mount: mountEditAd,
  unmount: unmountEditAd
});


