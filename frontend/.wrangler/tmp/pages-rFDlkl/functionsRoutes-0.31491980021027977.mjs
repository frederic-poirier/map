import { onRequestOptions as __tiles_montreal_pmtiles_js_onRequestOptions } from "/home/fp/Documents/code/map/frontend/functions/tiles/montreal.pmtiles.js"
import { onRequest as __tiles_montreal_pmtiles_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/tiles/montreal.pmtiles.js"

export const routes = [
    {
      routePath: "/tiles/montreal.pmtiles",
      mountPath: "/tiles",
      method: "OPTIONS",
      middlewares: [],
      modules: [__tiles_montreal_pmtiles_js_onRequestOptions],
    },
  {
      routePath: "/tiles/montreal.pmtiles",
      mountPath: "/tiles",
      method: "",
      middlewares: [],
      modules: [__tiles_montreal_pmtiles_js_onRequest],
    },
  ]