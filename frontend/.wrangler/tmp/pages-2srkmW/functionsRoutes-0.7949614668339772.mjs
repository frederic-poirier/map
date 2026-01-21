import { onRequestPost as __auth_logout_js_onRequestPost } from "/home/fp/Documents/code/map/frontend/functions/auth/logout.js"
import { onRequestGet as __auth_me_js_onRequestGet } from "/home/fp/Documents/code/map/frontend/functions/auth/me.js"
import { onRequestOptions as __tiles_montreal_pmtiles_js_onRequestOptions } from "/home/fp/Documents/code/map/frontend/functions/tiles/montreal.pmtiles.js"
import { onRequestGet as __tunnel_sign_js_onRequestGet } from "/home/fp/Documents/code/map/frontend/functions/tunnel/sign.js"
import { onRequest as __auth_callback_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/auth/callback.js"
import { onRequest as __auth_login_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/auth/login.js"
import { onRequest as __tiles_montreal_pmtiles_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/tiles/montreal.pmtiles.js"

export const routes = [
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
      routePath: "/tunnel/sign",
      mountPath: "/tunnel",
      method: "GET",
      middlewares: [],
      modules: [__tunnel_sign_js_onRequestGet],
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