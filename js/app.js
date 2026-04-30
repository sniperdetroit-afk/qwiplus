// js/app.js

console.log("APP VERSION 153 INIT FIX");

/* ================= IMPORTS ================= */

import { loadView } from "./core/viewEngine.js";
import { subscribe } from "./core/store.js";
import { getState, setState } from "./core/state.js";
import { navigate, resolveRoute } from "./core/router.js";
import { supabase } from "./services/supabase.js";

/* ================= ANTI DOBLE INIT ================= */

if (window.__APP_INIT__) {
  console.warn("App ya inicializada");
} else {
  window.__APP_INIT__ = true;
}

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

/* ================= SAFE VIEW ================= */

function getViewName() {
  const state = getState();
  const view = state.app?.view;
  return routes[view] ? view : "login";
}

/* ================= RENDER ================= */

async function renderApp(){

  if(isRendering) return;

  const state = getState();
  let viewName = state.app?.view;

  // fallback seguro
  if(!routes[viewName]){
    viewName = "login";
  }

  // 🔥 evita renders duplicados
  if(viewName === currentViewName) return;

  isRendering = true;

  try {

    currentViewName = viewName;

    const View = routes[viewName];

    const header = document.getElementById("appHeader");
    const nav = document.getElementById("bottomNav");

    const layoutConfig = {
      boot: { header: false, nav: false },
      login: { header: false, nav: false },

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

    await loadView(View, state);

    if (layout.nav) updateActiveNav(viewName);

    console.log("VIEW OK:", viewName);

  } catch (err) {
    console.error("Render error:", err);
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
    if(!params[k]) delete params[k];
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

    const route = resolveRoute();

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
        view: user ? route.view : "login",
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