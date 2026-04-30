let listeners = [];
let rendering = false;
let queued = false;

export function subscribe(fn){
  listeners.push(fn);
}

export function notify(){

  if(rendering){
    queued = true;
    return;
  }

  rendering = true;

  Promise.resolve().then(() => {

    listeners.forEach(fn => fn());

    rendering = false;

    if(queued){
      queued = false;
      notify();
    }

  });

}