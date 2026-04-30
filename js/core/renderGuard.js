let rendering = false;
let queued = false;

/* =========================
   CAN RENDER
========================= */

export function canRender(){

  if(rendering){
    queued = true;
    return false;
  }

  rendering = true;
  return true;
}

/* =========================
   RENDER DONE
========================= */

export function renderDone(){

  rendering = false;

  if(queued){
    queued = false;
    requestAnimationFrame(() => {
      window.__appRender?.();
    });
  }

}