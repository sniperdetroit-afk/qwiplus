import { subscribe } from "./core/store.js";
import { getState } from "./core/state.js";
import { navigate } from "./core/router.js";

import { renderLogin, initLoginEvents } from "./views/login.js";
import { renderHome } from "./views/home.js";
import { renderPublish } from "./views/publish.js";
import { renderProfile } from "./views/profile.js";
import { renderCategories } from "./views/categories.js";
import { renderFavorites } from "./views/favorites.js";
import { renderAdDetail } from "./views/adDetail.js";

import { initAuth, listenAuth } from "./services/authService.js";

/* ROUTES */

const routes = {
  home: renderHome,
  login: renderLogin,
  publish: renderPublish,
  profile: renderProfile,
  categories: renderCategories,
  favorites: renderFavorites,
  adDetail: renderAdDetail
};

const protectedViews = ["publish", "profile", "favorites"];

/* RENDER */

async function renderApp() {
  const main = document.getElementById("main");
  if (!main) return;

  const { view, user } = getState();

  if (!user && protectedViews.includes(view)) {
    navigate("login");
    return;
  }

  if (user && view === "login") {
    navigate("home");
    return;
  }

  const renderView = routes[view];

  if (!renderView) {
    main.innerHTML = "<p>Vista no encontrada</p>";
    return;
  }

  const content = await renderView();
  main.innerHTML = content;

  if (view === "login") {
    initLoginEvents();
  }
}

/* REACTIVITY */

subscribe(renderApp);

/* NAVIGATION */

document.addEventListener("click", (e) => {
  const element = e.target.closest("[data-view]");
  if (!element) return;

  navigate(element.dataset.view);
});

/* INIT */

(async () => {
  await initAuth();
  listenAuth();
  renderApp();
})();