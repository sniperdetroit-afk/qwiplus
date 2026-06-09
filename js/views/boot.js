//views/boot.js//

import { createView } from "../core/createView.js";
import { supabase } from "../services/supabase.js";
import { navigate } from "../core/router.js";
import { setState } from "../core/state.js";

/* ================= RENDER ================= */

async function renderBoot(){
  return `
    <section style="
      height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
    ">
      Cargando…
    </section>
  `;
}

/* ================= MOUNT ================= */

async function mountBoot(){

  try {

    const { data:{ session } } = await supabase.auth.getSession();

    if(session?.user){
      setState({ session:{ user: session.user } });
      navigate("home");
    } else {
      navigate("login");
    }

  } catch (err) {
    console.error("Boot error:", err);
    navigate("login");
  }

}

/* ================= EXPORT ================= */

export const BootView = createView(renderBoot, mountBoot);
