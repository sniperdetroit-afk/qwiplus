// js/views/reputation.js

import { supabase } from "../services/supabase.js";
import { getState } from "../core/state.js";
import { navigate } from "../core/router.js";
import { createView } from "../core/createView.js";
import { escapeHtml } from "../core/escapeHtml.js";

async function renderReputation(){
 return `
 <section style="
   min-height:100vh;
   background: url('/img/escudo.jpg') center bottom / cover no-repeat;
   position:relative;
 ">
   <div style="
     position:absolute;inset:0;
     background:linear-gradient(to bottom, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.65) 100%);
     pointer-events:none;
   "></div>
   <div style="position:relative;z-index:1;padding:24px 16px 100px;max-width:600px;margin:0 auto;">

     <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
       <button id="backReputation" style="
         background:rgba(34,211,238,0.1);
         border:1px solid rgba(34,211,238,0.25);
         color:#22d3ee;font-size:18px;
         padding:6px 12px;border-radius:999px;cursor:pointer;
       ">←</button>
       <h1 style="margin:0;font-size:22px;font-weight:800;color:#f1f5f9;">Mi Reputación</h1>
     </div>

     <div style="display:flex;gap:10px;margin-bottom:24px;">
       <button id="tabVentas" style="
         flex:1;padding:12px;border-radius:999px;
         background:rgba(34,211,238,0.15);
         border:1px solid rgba(34,211,238,0.4);
         color:#22d3ee;font-weight:700;font-size:14px;cursor:pointer;
       ">⭐ Ventas</button>
       <button id="tabCompras" style="
         flex:1;padding:12px;border-radius:999px;
         background:rgba(6,11,28,0.65);
         border:1px solid rgba(34,211,238,0.15);
         color:#94a3b8;font-weight:700;font-size:14px;cursor:pointer;
       ">🛒 Compras</button>
     </div>

     <div id="reputationSummary" style="
       background:rgba(6,11,28,0.65);
       border:1px solid rgba(34,211,238,0.2);
       border-radius:18px;padding:20px;
       backdrop-filter:blur(12px);
       margin-bottom:20px;
       text-align:center;
     ">
       <div id="summaryContent">Cargando...</div>
     </div>

     <div id="reputationList"></div>

   </div>
 </section>
 `;
}

async function mountReputation(){
 const state = getState();
 const userId = state.session?.user?.id;
 if(!userId) return;

 document.getElementById("backReputation")
   ?.addEventListener("click", () => navigate("profileMenu"));

 async function loadTab(tab){

   const tabV = document.getElementById("tabVentas");
   const tabC = document.getElementById("tabCompras");

   if(tab === "ventas"){
     tabV.style.background = "rgba(34,211,238,0.15)";
     tabV.style.borderColor = "rgba(34,211,238,0.4)";
     tabV.style.color = "#22d3ee";
     tabC.style.background = "rgba(6,11,28,0.65)";
     tabC.style.borderColor = "rgba(34,211,238,0.15)";
     tabC.style.color = "#94a3b8";
   } else {
     tabC.style.background = "rgba(34,211,238,0.15)";
     tabC.style.borderColor = "rgba(34,211,238,0.4)";
     tabC.style.color = "#22d3ee";
     tabV.style.background = "rgba(6,11,28,0.65)";
     tabV.style.borderColor = "rgba(34,211,238,0.15)";
     tabV.style.color = "#94a3b8";
   }

   let list = [];

   if(tab === "ventas"){
     const { data } = await supabase
       .rpc("get_reviews_with_reviewer", { p_reviewed_id: userId });
     list = data || [];
   } else {
  const { data } = await supabase
    .rpc("get_reviews_as_buyer", { p_reviewer_id: userId });
  list = data || [];
}


   const avg = list.length
     ? (list.reduce((s,r) => s + r.rating, 0) / list.length).toFixed(1)
     : 0;

   document.getElementById("summaryContent").innerHTML = `
     <div style="font-size:48px;font-weight:900;color:#22d3ee;">${avg}</div>
     <div style="display:flex;justify-content:center;gap:4px;margin:8px 0;">
       ${Array.from({length:5},(_,i) => `
         <span style="font-size:24px;color:${i < Math.round(avg) ? '#f59e0b' : 'rgba(255,255,255,0.2)'};">★</span>
       `).join("")}
     </div>
     <div style="color:#94a3b8;font-size:14px;">${list.length} valoracion${list.length !== 1 ? "es" : ""} como ${tab === "ventas" ? "vendedor" : "comprador"}</div>
   `;

   const listEl = document.getElementById("reputationList");

   if(!list.length){
     listEl.innerHTML = `
       <div style="text-align:center;padding:40px;color:#94a3b8;">
         No tienes valoraciones como ${tab === "ventas" ? "vendedor" : "comprador"} aún
       </div>
     `;
     return;
   }

    listEl.innerHTML = list.map(r => {
     const name = escapeHtml(
    (tab === "ventas" ? r.reviewer_name : r.reviewed_name) || "Usuario"
    );
     const initial = name.charAt(0).toUpperCase();
     const avatarUrl = tab === "ventas" ? r.reviewer_avatar : r.reviewed_avatar;
     const avatar = avatarUrl

       ? `<img src="${avatarUrl}" alt="${name} profile picture" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`
       : `<div style="width:44px;height:44px;border-radius:50%;background:rgba(34,211,238,0.2);border:1px solid rgba(34,211,238,0.3);display:flex;align-items:center;justify-content:center;color:#22d3ee;font-weight:700;font-size:16px;" aria-label="${name} profile initial">${initial}</div>`;

     const stars = Array.from({length:5},(_,i) =>
       `<span style="color:${i<r.rating?"#f59e0b":"rgba(255,255,255,0.2)"};font-size:16px;">★</span>`
     ).join("");

     const date = new Date(r.created_at).toLocaleDateString("es-ES");

     return `
       <div style="
         background:rgba(6,11,28,0.65);
         border:1px solid rgba(34,211,238,0.15);
         border-radius:16px;padding:16px;
         backdrop-filter:blur(8px);
         margin-bottom:12px;
       ">
         <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
           ${avatar}
           <div style="flex:1;">
             <div style="font-weight:700;font-size:15px;color:#f1f5f9;">${name}</div>
             <div style="display:flex;gap:2px;margin-top:2px;">${stars}</div>
           </div>
           <div style="font-size:12px;color:#64748b;">${date}</div>
         </div>
         ${r.comment ? `<p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.5;">${escapeHtml(r.comment)}</p>` : ""}
       </div>
     `;
   }).join("");
 }

 document.getElementById("tabVentas")?.addEventListener("click", () => loadTab("ventas"));
 document.getElementById("tabCompras")?.addEventListener("click", () => loadTab("compras"));

 loadTab("ventas");
}

function unmountReputation(){}

export const ReputationView = createView(
 renderReputation,
 mountReputation,
 unmountReputation
);

