import { onRequest as __edge_otp__path__js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/edge/otp/[path].js"
import { onRequest as __edge_photon__path__js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/edge/photon/[path].js"
import { onRequestPost as __auth_logout_js_onRequestPost } from "/home/fp/Documents/code/map/frontend/functions/auth/logout.js"
import { onRequestGet as __auth_me_js_onRequestGet } from "/home/fp/Documents/code/map/frontend/functions/auth/me.js"
import { onRequestOptions as __tiles_montreal_pmtiles_js_onRequestOptions } from "/home/fp/Documents/code/map/frontend/functions/tiles/montreal.pmtiles.js"
import { onRequest as __auth_callback_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/auth/callback.js"
import { onRequest as __auth_login_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/auth/login.js"
import { onRequest as __tiles_montreal_pmtiles_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/tiles/montreal.pmtiles.js"

export const routes = [
    {
      routePath: "/edge/otp/:path",
      mountPath: "/edge/otp",
      method: "",
      middlewares: [],
      modules: [__edge_otp__path__js_onRequest],
    },
  {
      routePath: "/edge/photon/:path",
      mountPath: "/edge/photon",
      method: "",
      middlewares: [],
      modules: [__edge_photon__path__js_onRequest],
    },
  {
      routePath: "/auth/logout",
      mountPath: "/auth",
      method: "POST",
      middlewares: [],
      modules: [__auth_logout_js_onRequestPost],
    },
  {
      routePath: "/auth/me",
      mountPath: "/auth",
      method: "GET",
      middlewares: [],
      modules: [__auth_me_js_onRequestGet],
    },
  {
      routePath: "/tiles/montreal.pmtiles",
      mountPath: "/tiles",
      method: "OPTIONS",
      middlewares: [],
      modules: [__tiles_montreal_pmtiles_js_onRequestOptions],
    },
  {
      routePath: "/auth/callback",
      mountPath: "/auth",
      method: "",
      middlewares: [],
      modules: [__auth_callback_js_onRequest],
    },
  {
      routePath: "/auth/login",
      mountPath: "/auth",
      method: "",
      middlewares: [],
      modules: [__auth_login_js_onRequest],
    },
  {
      routePath: "/tiles/montreal.pmtiles",
      mountPath: "/tiles",
      method: "",
      middlewares: [],
      modules: [__tiles_montreal_pmtiles_js_onRequest],
    },
  ]