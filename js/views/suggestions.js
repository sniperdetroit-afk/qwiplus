import { navigate } from "../core/router.js";
import { supabase } from "../services/supabase.js";

function renderSuggestions() {
  return `
  <section style="min-height:100vh;background:linear-gradient(180deg,#0B0F14 0%,#12161D 50%,#1a1f2e 100%);padding:20px;padding-bottom:100px;">
    <div style="max-width:480px;margin:0 auto;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
        <button id="backSuggestions" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:20px;cursor:pointer;color:#F5F7FA;padding:8px 14px;border-radius:12px;">←</button>
        <h2 style="margin:0;font-size:24px;font-weight:800;color:#F5F7FA;">💡 Sugerencias</h2>
      </div>
      <p style="color:#9CA3AF;font-size:15px;margin-bottom:20px;">¿Tienes alguna idea para mejorar Qwiplus? ¡Cuéntanos!</p>
      <textarea id="suggestionText" placeholder="Escribe tu sugerencia aquí..." style="width:100%;min-height:150px;padding:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#F5F7FA;font-size:15px;resize:none;box-sizing:border-box;outline:none;"></textarea>
      <button id="sendSuggestion" style="width:100%;padding:16px;margin-top:16px;background:linear-gradient(135deg,#38BDF8,#6366f1);border:none;border-radius:14px;color:white;font-size:16px;font-weight:700;cursor:pointer;">Enviar sugerencia</button>
      <div id="suggestionFeedback" style="margin-top:12px;text-align:center;color:#38BDF8;font-size:14px;"></div>
    </div>
  </section>
  `;
}

async function mountSuggestions() {
  document.getElementById("backSuggestions").onclick = () => navigate("settings");
  document.getElementById("sendSuggestion").onclick = async () => {
    const content = document.getElementById("suggestionText").value.trim();
    if (!content) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("suggestions").insert({
      user_id: user?.id || null,
      content
    });
    if (error) {
      document.getElementById("suggestionFeedback").textContent = "❌ Error al enviar";
    } else {
      document.getElementById("suggestionText").value = "";
      document.getElementById("suggestionFeedback").textContent = "✅ ¡Gracias por tu sugerencia!";
    }
  };
}

export const SuggestionsView = () => ({
  html: renderSuggestions(),
  mount: mountSuggestions
});
