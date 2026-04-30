import { canRender, renderDone } from "./renderGuard.js";

let renderQueue = false;

export async function runRender(renderFn){

  if(!canRender()){
    renderQueue = true;
    return;
  }

  try{

    await renderFn();

  }catch(e){

    console.error("Render crash:", e);

  }

  renderDone();

  if(renderQueue){
    renderQueue = false;
    runRender(renderFn);
  }

}