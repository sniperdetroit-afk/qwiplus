// js/app.js

console.log("APP VERSION 157 REGISTER");

/* ================= IMPORTS ================= */

import { loadView } from "./core/viewEngine.js";
import { subscribe } from "./core/store.js";
import { getState, setState } from "./core/state.js";
import { navigate, resolveRoute } from "./core/router.js";
import { supabase } from "./services/supabase.js";
import { initLang } from "./services/langService.js"; // ✅ NUEVO

/* ================= ANTI DOBLE INIT ================= */

if (window.__APP_INIT__) {
  console.warn("App ya inicializada");
} else {
  window.__APP_INIT__ = true;
}

/* ================= LANG ================= */

initLang(); // ✅ NUEVO

/* ================= CONTROL RENDER ================= */

let isRendering = false;
let currentViewName = null;

/* ================= VIEWS ================= */

import { BootView } from "./views/boot.js";
import { HomeView } from "./views/home.js";
import { PublishView } from "./views/publish.js";
import { ProfileView } from "./views/profile.js";
import { ProfileMenuView } from "./views/profileMenu.js";
import { EditProfileView } from "./views/editProfile.js";
import { SettingsView } from "./views/settings.js";
import { LoginView } from "./views/login.js";
import { RegisterView } from "./views/register.js";

import {
  CategoriesView,
  SubcategoriesView,
  SubSubcategoriesView
} from "./views/categories.js";

import { FavoritesView } from "./views/favorites.js";
import { AdDetailView } from "./views/adDetail.js";
import { SearchView } from "./views/search.js";
import { SearchResultsView } from "./views/searchResults.js";
import { EditAdView } from "./views/editAd.js";
import { InboxView } from "./views/inbox.js";
import { ChatView } from "./views/chat.js";

/* ================= ROUTES ================= */

const routes = {
  boot: BootView,
  home: HomeView,
  publish: PublishView,
  profile: ProfileView,
  profileMenu: ProfileMenuView,
  settings: SettingsView,
  login: LoginView,
  register: RegisterView,
  categories: CategoriesView,
  subcategories: SubcategoriesView,
  subsubcategories: SubSubcategoriesView,
  favorites: FavoritesView,
  adDetail: AdDetailView,
  search: SearchView,
  searchResults: SearchResultsView,
  editAd: EditAdView,
  editProfile: EditProfileView,
  messages: InboxView,
  chat: ChatView
};

/* ================= RENDER ================= */

async function renderApp(){

  if (isRendering) return;

  const state = getState();
  let viewName = state.app?.view;

  if (!routes[viewName]) {
    viewName = "login";
  }

  const main = document.getElementById("main");

  if (
    viewName === currentViewName &&
    main &&
    main.innerHTML.trim() !== ""
  ){
    return;
  }

  isRendering = true;

  try {

    currentViewName = viewName;

    const View = routes[viewName];

    const header = document.getElementById("appHeader");
    const nav = document.getElementById("bottomNav");

    const layoutConfig = {
      boot: { header: false, nav: false },
      login: { header: false, nav: false },
      register: { header: false, nav: false },
      home: { header: true, nav: true },
      search: { header: false, nav: true },
      favorites: { header: false, nav: true },
      chat: { header: false, nav: false },
      profileMenu: { header: false, nav: true },
      profile: { header: false, nav: true },
      settings: { header: false, nav: false },
      editProfile: { header: false, nav: false },
      editAd: { header: false, nav: false }
    };

    const layout = layoutConfig[viewName] || { header: false, nav: true };

    if (header) header.style.display = layout.header ? "" : "none";
    if (nav) nav.style.display = layout.nav ? "" : "none";

    if (main) {
      main.innerHTML = "";
    }

    await loadView(View, state);

    if (layout.nav) updateActiveNav(viewName);

    console.log("VIEW OK:", viewName);

  } catch (err) {
    console.error("Render error:", err);

    const main = document.getElementById("main");
    if (main) {
      main.innerHTML = `
        <div style="padding:20px;color:white">
          ⚠️ Error cargando vista
        </div>
      `;
    }

  } finally {
    isRendering = false;
  }
}

/* ================= NAV ================= */

function updateActiveNav(view) {
  document.querySelectorAll(".nav-item")
    .forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
}

/* ================= CLICK ================= */

document.addEventListener("click", async (e) => {

  const el = e.target.closest("[data-view]");
  if (!el) return;

  e.preventDefault();

  const view = el.dataset.view;

  const params = {
    id: el.dataset.id,
    category: el.dataset.category,
    subcategory: el.dataset.subcategory
  };

  Object.keys(params).forEach(k => {
    if (!params[k]) delete params[k];
  });

  const state = getState();
  const user = state.session?.user;
  const current = state.app?.view;

  if (current === view) return;

  if (
    ["publish","favorites","messages","chat","profile","profileMenu"].includes(view)
    && !user
  ){
    navigate("login");
    return;
  }

  navigate(view, params);
});

/* ================= STORE ================= */

subscribe(renderApp);

/* ================= INIT ================= */

async function initApp() {

  try {

    if (window.location.hash.includes("access_token")) {
      await supabase.auth.getSession();
      window.history.replaceState({}, "", "/");
    }

    const route = resolveRoute();
    console.log("ROUTE:", route);

    setState({
      app: {
        view: "boot",
        params: {}
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;

    setState({
      session: { user },
      app: {
        view: user ? "home" : "login",
        params: route.params || {}
      }
    });

  } catch (err){
    console.error("Init error:", err);
  }
}

initApp();

/* ================= AUTH ================= */

supabase.auth.onAuthStateChange((event, session) => {

  const prev = getState();

  setState({
    ...prev,
    session: {
      user: session?.user || null
    }
  });

  if (session?.user && getState().app?.view === "login") {
    navigate("home");
  }

});

/* ================= SW ================= */

// desactivado por ahora



