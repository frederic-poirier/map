import { onRequest as __auth_google_callback_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/auth/google/callback.js"
import { onRequest as __auth_google_start_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/auth/google/start.js"
import { onRequest as __api_me_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/api/me.js"
import { onRequest as ___middleware_js_onRequest } from "/home/fp/Documents/code/map/frontend/functions/_middleware.js"

export const routes = [
    {
      routePath: "/auth/google/callback",
      mountPath: "/auth/google",
      method: "",
      middlewares: [],
      modules: [__auth_google_callback_js_onRequest],
    },
  {
      routePath: "/auth/google/start",
      mountPath: "/auth/google",
      method: "",
      middlewares: [],
      modules: [__auth_google_start_js_onRequest],
    },
  {
      routePath: "/api/me",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_me_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]