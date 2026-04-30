import { setState, getState } from "./state.js";

/* ================= GUARDS ================= */

function guard(view){

  const state = getState();
  const user = state.session?.user;
  const isGuest = state.guest === true;

  if(!user && !isGuest && view !== "login" && view !== "boot"){
    return "login";
  }

  if(view === "chat" && !state.chat?.conversationId){
    return "messages";
  }

  return view;
}

/* ================= BUILD URL ================= */

function buildUrl(view, params){

  if(view === "home") return "/";
  if(view === "login") return "/login";

  // 🔥 URL PRO

  if(view === "subcategories"){
    return `/${params.category}`;
  }

  if(view === "subsubcategories"){
    return `/${params.category}/${encodeURIComponent(params.subcategory)}`;
  }

  if(view === "adDetail" && params.id){
    return `/ad/${params.id}`;
  }

  if(view === "chat" && params.conversationId){
    return `/chat/${params.conversationId}`;
  }

  return `/${view}`;
}

/* ================= NAVIGATE ================= */

export function navigate(view, params = {}){

  const state = getState();
  const safeView = guard(view);

  if(state.app?.view === safeView) return;

  setState({
    app: {
      view: safeView,
      params: { ...params }
    }
  });

  if(params.conversationId){
    setState({
      chat: {
        conversationId: params.conversationId
      }
    });
  }

  const url = buildUrl(safeView, params);

  window.history.pushState(
    { view: safeView, params },
    "",
    url
  );
}

/* ================= RESOLVE ROUTE (PRO) ================= */

export function resolveRoute(){

  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);

  // HOME
  if(parts.length === 0){
    return { view: "home", params: {} };
  }

  // LOGIN
  if(parts[0] === "login"){
    return { view: "login", params: {} };
  }

  // AD
  if(parts[0] === "ad"){
    return { view: "adDetail", params: { id: parts[1] } };
  }

  // CHAT
  if(parts[0] === "chat"){
    return { view: "chat", params: { conversationId: parts[1] } };
  }

  // 🔥 CATEGORÍAS PRO

  const category = parts[0];
  const subcategory = parts[1] ? decodeURIComponent(parts[1]) : null;

  if(parts.length === 1){
    return {
      view: "subcategories",
      params: { category }
    };
  }

  if(parts.length === 2){
    return {
      view: "subsubcategories",
      params: { category, subcategory }
    };
  }

  return { view: "home", params: {} };
}

/* ================= BACK ================= */

window.addEventListener("popstate", (e)=>{

  if(e.state){

    setState({
      app: {
        view: e.state.view,
        params: e.state.params || {}
      }
    });

  } else {

    const route = resolveRoute();

    setState({
      app: {
        view: route.view,
        params: route.params || {}
      }
    });

  }

});