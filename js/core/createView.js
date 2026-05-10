// js/core/createView.js

export function createView(config, initFn, destroyFn){

  // ✅ Nuevo formato:
  // createView({ render, mount, unmount })
  if (typeof config === "object" && config !== null) {

    const renderFn = config.render;
    const mountFn = config.mount;
    const unmountFn = config.unmount;

    return async function(state){

      const html = await renderFn(state);

      return {
        html,

        async mount(){
          if(mountFn) await mountFn(state);
        },

        async unmount(){
          if(unmountFn) await unmountFn(state);
        }
      };

    };

  }

  // ✅ Formato antiguo:
  // createView(renderFn, initFn, destroyFn)
  const renderFn = config;

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