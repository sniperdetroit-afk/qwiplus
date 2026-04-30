export function createView(renderFn, initFn, destroyFn){

  return async function(state){

    const html = await renderFn(state);

    return {

      html,

      async mount(){
        if(initFn) await initFn(state);
      },

      async unmount(){
        if(destroyFn) await destroyFn(state);
      }

    };

  };

}