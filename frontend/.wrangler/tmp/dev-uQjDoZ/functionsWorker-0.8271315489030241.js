var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-zfpkW7/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-Y5luYW/functionsWorker-0.8271315489030241.mjs
var __defProp2 = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
var urls2;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-T6Y7q1/checked-fetch.js"() {
    urls2 = /* @__PURE__ */ new Set();
    __name2(checkURL2, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL2(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});
async function getSession(sessionId, env) {
  const now = Math.floor(Date.now() / 1e3);
  return env.DB.prepare(`
      SELECT
        s.id,
        s.user_id,
        s.expires_at,
        u.email,
        u.name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > ?
    `).bind(sessionId, now).first();
}
__name(getSession, "getSession");
async function refreshSession(sessionId, newExpiresAt, env) {
  await env.DB.prepare(`UPDATE sessions SET expires_at = ? WHERE id = ?`).bind(newExpiresAt, sessionId).run();
}
__name(refreshSession, "refreshSession");
async function createSession(userId, expiresAt, env) {
  const sessionId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`
  ).bind(sessionId, userId, expiresAt).run();
  return sessionId;
}
__name(createSession, "createSession");
async function deleteSession(sessionId, env) {
  await env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(sessionId).run();
}
__name(deleteSession, "deleteSession");
var init_sessionStore = __esm({
  "utils/db/sessionStore.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(getSession, "getSession");
    __name2(refreshSession, "refreshSession");
    __name2(createSession, "createSession");
    __name2(deleteSession, "deleteSession");
  }
});
var SESSION_DURATION;
var REFRESH_THRESHOLD;
var SESSION_COOKIE;
var init_constants = __esm({
  "utils/auth/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SESSION_DURATION = 60 * 60 * 24 * 7;
    REFRESH_THRESHOLD = 60 * 60 * 24;
    SESSION_COOKIE = "session";
  }
});
function isSecureRequest(request) {
  return request.url.startsWith("https://");
}
__name(isSecureRequest, "isSecureRequest");
function buildOAuthStateCookie(state, request) {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax${secure}`;
}
__name(buildOAuthStateCookie, "buildOAuthStateCookie");
function clearOAuthStateCookie() {
  return "oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax";
}
__name(clearOAuthStateCookie, "clearOAuthStateCookie");
function buildSessionCookie(sessionId, request, maxAge = SESSION_DURATION) {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}
__name(buildSessionCookie, "buildSessionCookie");
function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match2 = cookie.split("; ").find((c2) => c2.startsWith(name + "="));
  return match2 ? decodeURIComponent(match2.split("=")[1]) : null;
}
__name(getCookie, "getCookie");
var init_cookies = __esm({
  "utils/auth/cookies.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants();
    __name2(isSecureRequest, "isSecureRequest");
    __name2(buildOAuthStateCookie, "buildOAuthStateCookie");
    __name2(clearOAuthStateCookie, "clearOAuthStateCookie");
    __name2(buildSessionCookie, "buildSessionCookie");
    __name2(getCookie, "getCookie");
  }
});
async function onRequestPost({ request, env }) {
  const sessionId = getCookie(request, "session");
  if (sessionId) await deleteSession(sessionId, env);
  return new Response(JSON.stringify({
    success: true,
    message: "D\xE9connect\xE9 avec succ\xE8s"
  }, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": [
        `session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
      ].join("; ")
    }
  }));
}
__name(onRequestPost, "onRequestPost");
var init_logout = __esm({
  "auth/logout.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_sessionStore();
    init_cookies();
    __name2(onRequestPost, "onRequestPost");
  }
});
async function authenticateUser(request, env) {
  let refreshed = true;
  const sessionId = getCookie(request, SESSION_COOKIE);
  if (!sessionId) return null;
  const row = await getSession(sessionId, env);
  if (!row) return null;
  const now = Math.floor(Date.now() / 1e3);
  const timeLeft = row.expires_at - now;
  refreshed = false;
  let expiresAt = row.expires_at;
  if (timeLeft < REFRESH_THRESHOLD) {
    expiresAt = now + SESSION_DURATION;
    await refreshSession(sessionId, expiresAt, env);
  }
  return {
    sessionId,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    expiresAt,
    refreshed
  };
}
__name(authenticateUser, "authenticateUser");
var init_authenticate = __esm({
  "utils/auth/authenticate.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_cookies();
    init_sessionStore();
    init_constants();
    __name2(authenticateUser, "authenticateUser");
  }
});
async function requireAuth(request, env) {
  const auth = await authenticateUser(request, env);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Non autoris\xE9" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "private, no-cache"
  });
  if (auth.refreshed) {
    headers.append("Set-Cookie", buildSessionCookie(auth.sessionId));
  }
  return { auth, headers };
}
__name(requireAuth, "requireAuth");
var init_requireAuth = __esm({
  "utils/auth/requireAuth.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_authenticate();
    init_cookies();
    __name2(requireAuth, "requireAuth");
  }
});
async function onRequestGet({ request, env }) {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;
  const { auth, headers } = result;
  return new Response(JSON.stringify({
    id: auth.userId,
    email: auth.email,
    name: auth.name,
    sessionExpiresAt: auth.expiresAt
  }), { status: 200, headers });
}
__name(onRequestGet, "onRequestGet");
var init_me = __esm({
  "auth/me.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_requireAuth();
    __name2(onRequestGet, "onRequestGet");
  }
});
var getHttpHandlerExtensionConfiguration;
var resolveHttpHandlerRuntimeConfig;
var init_httpExtensionConfiguration = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/extensions/httpExtensionConfiguration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getHttpHandlerExtensionConfiguration = /* @__PURE__ */ __name2((runtimeConfig) => {
      return {
        setHttpHandler(handler) {
          runtimeConfig.httpHandler = handler;
        },
        httpHandler() {
          return runtimeConfig.httpHandler;
        },
        updateHttpClientConfig(key, value) {
          runtimeConfig.httpHandler?.updateHttpClientConfig(key, value);
        },
        httpHandlerConfigs() {
          return runtimeConfig.httpHandler.httpHandlerConfigs();
        }
      };
    }, "getHttpHandlerExtensionConfiguration");
    resolveHttpHandlerRuntimeConfig = /* @__PURE__ */ __name2((httpHandlerExtensionConfiguration) => {
      return {
        httpHandler: httpHandlerExtensionConfiguration.httpHandler()
      };
    }, "resolveHttpHandlerRuntimeConfig");
  }
});
var init_extensions = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/extensions/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_httpExtensionConfiguration();
  }
});
var init_abort = __esm({
  "../node_modules/@smithy/types/dist-es/abort.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var HttpAuthLocation;
var init_auth = __esm({
  "../node_modules/@smithy/types/dist-es/auth/auth.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(HttpAuthLocation2) {
      HttpAuthLocation2["HEADER"] = "header";
      HttpAuthLocation2["QUERY"] = "query";
    })(HttpAuthLocation || (HttpAuthLocation = {}));
  }
});
var HttpApiKeyAuthLocation;
var init_HttpApiKeyAuth = __esm({
  "../node_modules/@smithy/types/dist-es/auth/HttpApiKeyAuth.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(HttpApiKeyAuthLocation2) {
      HttpApiKeyAuthLocation2["HEADER"] = "header";
      HttpApiKeyAuthLocation2["QUERY"] = "query";
    })(HttpApiKeyAuthLocation || (HttpApiKeyAuthLocation = {}));
  }
});
var init_HttpAuthScheme = __esm({
  "../node_modules/@smithy/types/dist-es/auth/HttpAuthScheme.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_HttpAuthSchemeProvider = __esm({
  "../node_modules/@smithy/types/dist-es/auth/HttpAuthSchemeProvider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_HttpSigner = __esm({
  "../node_modules/@smithy/types/dist-es/auth/HttpSigner.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_IdentityProviderConfig = __esm({
  "../node_modules/@smithy/types/dist-es/auth/IdentityProviderConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_auth2 = __esm({
  "../node_modules/@smithy/types/dist-es/auth/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_auth();
    init_HttpApiKeyAuth();
    init_HttpAuthScheme();
    init_HttpAuthSchemeProvider();
    init_HttpSigner();
    init_IdentityProviderConfig();
  }
});
var init_blob_payload_input_types = __esm({
  "../node_modules/@smithy/types/dist-es/blob/blob-payload-input-types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_checksum = __esm({
  "../node_modules/@smithy/types/dist-es/checksum.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_client = __esm({
  "../node_modules/@smithy/types/dist-es/client.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_command = __esm({
  "../node_modules/@smithy/types/dist-es/command.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_config = __esm({
  "../node_modules/@smithy/types/dist-es/connection/config.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_manager = __esm({
  "../node_modules/@smithy/types/dist-es/connection/manager.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_pool = __esm({
  "../node_modules/@smithy/types/dist-es/connection/pool.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_connection = __esm({
  "../node_modules/@smithy/types/dist-es/connection/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_config();
    init_manager();
    init_pool();
  }
});
var init_crypto = __esm({
  "../node_modules/@smithy/types/dist-es/crypto.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_encode = __esm({
  "../node_modules/@smithy/types/dist-es/encode.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var EndpointURLScheme;
var init_endpoint = __esm({
  "../node_modules/@smithy/types/dist-es/endpoint.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(EndpointURLScheme2) {
      EndpointURLScheme2["HTTP"] = "http";
      EndpointURLScheme2["HTTPS"] = "https";
    })(EndpointURLScheme || (EndpointURLScheme = {}));
  }
});
var init_EndpointRuleObject = __esm({
  "../node_modules/@smithy/types/dist-es/endpoints/EndpointRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_ErrorRuleObject = __esm({
  "../node_modules/@smithy/types/dist-es/endpoints/ErrorRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_RuleSetObject = __esm({
  "../node_modules/@smithy/types/dist-es/endpoints/RuleSetObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_shared = __esm({
  "../node_modules/@smithy/types/dist-es/endpoints/shared.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_TreeRuleObject = __esm({
  "../node_modules/@smithy/types/dist-es/endpoints/TreeRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_endpoints = __esm({
  "../node_modules/@smithy/types/dist-es/endpoints/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EndpointRuleObject();
    init_ErrorRuleObject();
    init_RuleSetObject();
    init_shared();
    init_TreeRuleObject();
  }
});
var init_eventStream = __esm({
  "../node_modules/@smithy/types/dist-es/eventStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var AlgorithmId;
var init_checksum2 = __esm({
  "../node_modules/@smithy/types/dist-es/extensions/checksum.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(AlgorithmId2) {
      AlgorithmId2["MD5"] = "md5";
      AlgorithmId2["CRC32"] = "crc32";
      AlgorithmId2["CRC32C"] = "crc32c";
      AlgorithmId2["SHA1"] = "sha1";
      AlgorithmId2["SHA256"] = "sha256";
    })(AlgorithmId || (AlgorithmId = {}));
  }
});
var init_defaultClientConfiguration = __esm({
  "../node_modules/@smithy/types/dist-es/extensions/defaultClientConfiguration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_defaultExtensionConfiguration = __esm({
  "../node_modules/@smithy/types/dist-es/extensions/defaultExtensionConfiguration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_extensions2 = __esm({
  "../node_modules/@smithy/types/dist-es/extensions/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_defaultClientConfiguration();
    init_defaultExtensionConfiguration();
    init_checksum2();
  }
});
var init_feature_ids = __esm({
  "../node_modules/@smithy/types/dist-es/feature-ids.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var FieldPosition;
var init_http = __esm({
  "../node_modules/@smithy/types/dist-es/http.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(FieldPosition2) {
      FieldPosition2[FieldPosition2["HEADER"] = 0] = "HEADER";
      FieldPosition2[FieldPosition2["TRAILER"] = 1] = "TRAILER";
    })(FieldPosition || (FieldPosition = {}));
  }
});
var init_httpHandlerInitialization = __esm({
  "../node_modules/@smithy/types/dist-es/http/httpHandlerInitialization.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_apiKeyIdentity = __esm({
  "../node_modules/@smithy/types/dist-es/identity/apiKeyIdentity.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_awsCredentialIdentity = __esm({
  "../node_modules/@smithy/types/dist-es/identity/awsCredentialIdentity.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_identity = __esm({
  "../node_modules/@smithy/types/dist-es/identity/identity.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_tokenIdentity = __esm({
  "../node_modules/@smithy/types/dist-es/identity/tokenIdentity.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_identity2 = __esm({
  "../node_modules/@smithy/types/dist-es/identity/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_apiKeyIdentity();
    init_awsCredentialIdentity();
    init_identity();
    init_tokenIdentity();
  }
});
var init_logger = __esm({
  "../node_modules/@smithy/types/dist-es/logger.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var SMITHY_CONTEXT_KEY;
var init_middleware = __esm({
  "../node_modules/@smithy/types/dist-es/middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SMITHY_CONTEXT_KEY = "__smithy_context";
  }
});
var init_pagination = __esm({
  "../node_modules/@smithy/types/dist-es/pagination.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var IniSectionType;
var init_profile = __esm({
  "../node_modules/@smithy/types/dist-es/profile.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(IniSectionType2) {
      IniSectionType2["PROFILE"] = "profile";
      IniSectionType2["SSO_SESSION"] = "sso-session";
      IniSectionType2["SERVICES"] = "services";
    })(IniSectionType || (IniSectionType = {}));
  }
});
var init_response = __esm({
  "../node_modules/@smithy/types/dist-es/response.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_retry = __esm({
  "../node_modules/@smithy/types/dist-es/retry.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_schema = __esm({
  "../node_modules/@smithy/types/dist-es/schema/schema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_traits = __esm({
  "../node_modules/@smithy/types/dist-es/schema/traits.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_schema_deprecated = __esm({
  "../node_modules/@smithy/types/dist-es/schema/schema-deprecated.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_sentinels = __esm({
  "../node_modules/@smithy/types/dist-es/schema/sentinels.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_static_schemas = __esm({
  "../node_modules/@smithy/types/dist-es/schema/static-schemas.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_serde = __esm({
  "../node_modules/@smithy/types/dist-es/serde.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_shapes = __esm({
  "../node_modules/@smithy/types/dist-es/shapes.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_signature = __esm({
  "../node_modules/@smithy/types/dist-es/signature.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_stream = __esm({
  "../node_modules/@smithy/types/dist-es/stream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_streaming_blob_common_types = __esm({
  "../node_modules/@smithy/types/dist-es/streaming-payload/streaming-blob-common-types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_streaming_blob_payload_input_types = __esm({
  "../node_modules/@smithy/types/dist-es/streaming-payload/streaming-blob-payload-input-types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_streaming_blob_payload_output_types = __esm({
  "../node_modules/@smithy/types/dist-es/streaming-payload/streaming-blob-payload-output-types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var RequestHandlerProtocol;
var init_transfer = __esm({
  "../node_modules/@smithy/types/dist-es/transfer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(RequestHandlerProtocol2) {
      RequestHandlerProtocol2["HTTP_0_9"] = "http/0.9";
      RequestHandlerProtocol2["HTTP_1_0"] = "http/1.0";
      RequestHandlerProtocol2["TDS_8_0"] = "tds/8.0";
    })(RequestHandlerProtocol || (RequestHandlerProtocol = {}));
  }
});
var init_client_payload_blob_type_narrow = __esm({
  "../node_modules/@smithy/types/dist-es/transform/client-payload-blob-type-narrow.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_mutable = __esm({
  "../node_modules/@smithy/types/dist-es/transform/mutable.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_no_undefined = __esm({
  "../node_modules/@smithy/types/dist-es/transform/no-undefined.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_type_transform = __esm({
  "../node_modules/@smithy/types/dist-es/transform/type-transform.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_uri = __esm({
  "../node_modules/@smithy/types/dist-es/uri.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_util = __esm({
  "../node_modules/@smithy/types/dist-es/util.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_waiter = __esm({
  "../node_modules/@smithy/types/dist-es/waiter.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es = __esm({
  "../node_modules/@smithy/types/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_abort();
    init_auth2();
    init_blob_payload_input_types();
    init_checksum();
    init_client();
    init_command();
    init_connection();
    init_crypto();
    init_encode();
    init_endpoint();
    init_endpoints();
    init_eventStream();
    init_extensions2();
    init_feature_ids();
    init_http();
    init_httpHandlerInitialization();
    init_identity2();
    init_logger();
    init_middleware();
    init_pagination();
    init_profile();
    init_response();
    init_retry();
    init_schema();
    init_traits();
    init_schema_deprecated();
    init_sentinels();
    init_static_schemas();
    init_serde();
    init_shapes();
    init_signature();
    init_stream();
    init_streaming_blob_common_types();
    init_streaming_blob_payload_input_types();
    init_streaming_blob_payload_output_types();
    init_transfer();
    init_client_payload_blob_type_narrow();
    init_mutable();
    init_no_undefined();
    init_type_transform();
    init_uri();
    init_util();
    init_waiter();
  }
});
var init_Field = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/Field.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_Fields = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/Fields.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_httpHandler = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/httpHandler.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
function cloneQuery(query) {
  return Object.keys(query).reduce((carry, paramName) => {
    const param = query[paramName];
    return {
      ...carry,
      [paramName]: Array.isArray(param) ? [...param] : param
    };
  }, {});
}
__name(cloneQuery, "cloneQuery");
var HttpRequest;
var init_httpRequest = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/httpRequest.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    HttpRequest = class _HttpRequest {
      static {
        __name(this, "_HttpRequest");
      }
      static {
        __name2(this, "HttpRequest");
      }
      method;
      protocol;
      hostname;
      port;
      path;
      query;
      headers;
      username;
      password;
      fragment;
      body;
      constructor(options) {
        this.method = options.method || "GET";
        this.hostname = options.hostname || "localhost";
        this.port = options.port;
        this.query = options.query || {};
        this.headers = options.headers || {};
        this.body = options.body;
        this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
        this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
        this.username = options.username;
        this.password = options.password;
        this.fragment = options.fragment;
      }
      static clone(request) {
        const cloned = new _HttpRequest({
          ...request,
          headers: { ...request.headers }
        });
        if (cloned.query) {
          cloned.query = cloneQuery(cloned.query);
        }
        return cloned;
      }
      static isInstance(request) {
        if (!request) {
          return false;
        }
        const req = request;
        return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
      }
      clone() {
        return _HttpRequest.clone(this);
      }
    };
    __name2(cloneQuery, "cloneQuery");
  }
});
var HttpResponse;
var init_httpResponse = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/httpResponse.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    HttpResponse = class {
      static {
        __name(this, "HttpResponse");
      }
      static {
        __name2(this, "HttpResponse");
      }
      statusCode;
      reason;
      headers;
      body;
      constructor(options) {
        this.statusCode = options.statusCode;
        this.reason = options.reason;
        this.headers = options.headers || {};
        this.body = options.body;
      }
      static isInstance(response) {
        if (!response)
          return false;
        const resp = response;
        return typeof resp.statusCode === "number" && typeof resp.headers === "object";
      }
    };
  }
});
var init_isValidHostname = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/isValidHostname.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_types = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es2 = __esm({
  "../node_modules/@smithy/protocol-http/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_extensions();
    init_Field();
    init_Fields();
    init_httpHandler();
    init_httpRequest();
    init_httpResponse();
    init_isValidHostname();
    init_types();
  }
});
function addExpectContinueMiddleware(options) {
  return (next) => async (args) => {
    const { request } = args;
    if (options.expectContinueHeader !== false && HttpRequest.isInstance(request) && request.body && options.runtime === "node" && options.requestHandler?.constructor?.name !== "FetchHttpHandler") {
      let sendHeader = true;
      if (typeof options.expectContinueHeader === "number") {
        try {
          const bodyLength = Number(request.headers?.["content-length"]) ?? options.bodyLengthChecker?.(request.body) ?? Infinity;
          sendHeader = bodyLength >= options.expectContinueHeader;
        } catch (e2) {
        }
      } else {
        sendHeader = !!options.expectContinueHeader;
      }
      if (sendHeader) {
        request.headers.Expect = "100-continue";
      }
    }
    return next({
      ...args,
      request
    });
  };
}
__name(addExpectContinueMiddleware, "addExpectContinueMiddleware");
var addExpectContinueMiddlewareOptions;
var getAddExpectContinuePlugin;
var init_dist_es3 = __esm({
  "../node_modules/@aws-sdk/middleware-expect-continue/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    __name2(addExpectContinueMiddleware, "addExpectContinueMiddleware");
    addExpectContinueMiddlewareOptions = {
      step: "build",
      tags: ["SET_EXPECT_HEADER", "EXPECT_HEADER"],
      name: "addExpectContinueMiddleware",
      override: true
    };
    getAddExpectContinuePlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(addExpectContinueMiddleware(options), addExpectContinueMiddlewareOptions);
      }, "applyToStack")
    }), "getAddExpectContinuePlugin");
  }
});
var RequestChecksumCalculation;
var DEFAULT_REQUEST_CHECKSUM_CALCULATION;
var ResponseChecksumValidation;
var DEFAULT_RESPONSE_CHECKSUM_VALIDATION;
var ChecksumAlgorithm;
var ChecksumLocation;
var DEFAULT_CHECKSUM_ALGORITHM;
var init_constants2 = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    RequestChecksumCalculation = {
      WHEN_SUPPORTED: "WHEN_SUPPORTED",
      WHEN_REQUIRED: "WHEN_REQUIRED"
    };
    DEFAULT_REQUEST_CHECKSUM_CALCULATION = RequestChecksumCalculation.WHEN_SUPPORTED;
    ResponseChecksumValidation = {
      WHEN_SUPPORTED: "WHEN_SUPPORTED",
      WHEN_REQUIRED: "WHEN_REQUIRED"
    };
    DEFAULT_RESPONSE_CHECKSUM_VALIDATION = RequestChecksumCalculation.WHEN_SUPPORTED;
    (function(ChecksumAlgorithm2) {
      ChecksumAlgorithm2["MD5"] = "MD5";
      ChecksumAlgorithm2["CRC32"] = "CRC32";
      ChecksumAlgorithm2["CRC32C"] = "CRC32C";
      ChecksumAlgorithm2["CRC64NVME"] = "CRC64NVME";
      ChecksumAlgorithm2["SHA1"] = "SHA1";
      ChecksumAlgorithm2["SHA256"] = "SHA256";
    })(ChecksumAlgorithm || (ChecksumAlgorithm = {}));
    (function(ChecksumLocation2) {
      ChecksumLocation2["HEADER"] = "header";
      ChecksumLocation2["TRAILER"] = "trailer";
    })(ChecksumLocation || (ChecksumLocation = {}));
    DEFAULT_CHECKSUM_ALGORITHM = ChecksumAlgorithm.CRC32;
  }
});
var init_NODE_REQUEST_CHECKSUM_CALCULATION_CONFIG_OPTIONS = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/NODE_REQUEST_CHECKSUM_CALCULATION_CONFIG_OPTIONS.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_NODE_RESPONSE_CHECKSUM_VALIDATION_CONFIG_OPTIONS = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/NODE_RESPONSE_CHECKSUM_VALIDATION_CONFIG_OPTIONS.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_emitWarningIfUnsupportedVersion = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/client/emitWarningIfUnsupportedVersion.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
function setCredentialFeature(credentials, feature, value) {
  if (!credentials.$source) {
    credentials.$source = {};
  }
  credentials.$source[feature] = value;
  return credentials;
}
__name(setCredentialFeature, "setCredentialFeature");
var init_setCredentialFeature = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(setCredentialFeature, "setCredentialFeature");
  }
});
function setFeature(context, feature, value) {
  if (!context.__aws_sdk_context) {
    context.__aws_sdk_context = {
      features: {}
    };
  } else if (!context.__aws_sdk_context.features) {
    context.__aws_sdk_context.features = {};
  }
  context.__aws_sdk_context.features[feature] = value;
}
__name(setFeature, "setFeature");
var init_setFeature = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/client/setFeature.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(setFeature, "setFeature");
  }
});
var init_setTokenFeature = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/client/setTokenFeature.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_client2 = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/client/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_emitWarningIfUnsupportedVersion();
    init_setCredentialFeature();
    init_setFeature();
    init_setTokenFeature();
  }
});
var getDateHeader;
var init_getDateHeader = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getDateHeader.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    getDateHeader = /* @__PURE__ */ __name2((response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : void 0, "getDateHeader");
  }
});
var getSkewCorrectedDate;
var init_getSkewCorrectedDate = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getSkewCorrectedDate.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getSkewCorrectedDate = /* @__PURE__ */ __name2((systemClockOffset) => new Date(Date.now() + systemClockOffset), "getSkewCorrectedDate");
  }
});
var isClockSkewed;
var init_isClockSkewed = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/isClockSkewed.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_getSkewCorrectedDate();
    isClockSkewed = /* @__PURE__ */ __name2((clockTime, systemClockOffset) => Math.abs(getSkewCorrectedDate(systemClockOffset).getTime() - clockTime) >= 3e5, "isClockSkewed");
  }
});
var getUpdatedSystemClockOffset;
var init_getUpdatedSystemClockOffset = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getUpdatedSystemClockOffset.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_isClockSkewed();
    getUpdatedSystemClockOffset = /* @__PURE__ */ __name2((clockTime, currentSystemClockOffset) => {
      const clockTimeInMs = Date.parse(clockTime);
      if (isClockSkewed(clockTimeInMs, currentSystemClockOffset)) {
        return clockTimeInMs - Date.now();
      }
      return currentSystemClockOffset;
    }, "getUpdatedSystemClockOffset");
  }
});
var init_utils = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_getDateHeader();
    init_getSkewCorrectedDate();
    init_getUpdatedSystemClockOffset();
  }
});
var throwSigningPropertyError;
var validateSigningProperties;
var AwsSdkSigV4Signer;
var init_AwsSdkSigV4Signer = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_utils();
    throwSigningPropertyError = /* @__PURE__ */ __name2((name, property) => {
      if (!property) {
        throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
      }
      return property;
    }, "throwSigningPropertyError");
    validateSigningProperties = /* @__PURE__ */ __name2(async (signingProperties) => {
      const context = throwSigningPropertyError("context", signingProperties.context);
      const config = throwSigningPropertyError("config", signingProperties.config);
      const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
      const signerFunction = throwSigningPropertyError("signer", config.signer);
      const signer = await signerFunction(authScheme);
      const signingRegion = signingProperties?.signingRegion;
      const signingRegionSet = signingProperties?.signingRegionSet;
      const signingName = signingProperties?.signingName;
      return {
        config,
        signer,
        signingRegion,
        signingRegionSet,
        signingName
      };
    }, "validateSigningProperties");
    AwsSdkSigV4Signer = class {
      static {
        __name(this, "AwsSdkSigV4Signer");
      }
      static {
        __name2(this, "AwsSdkSigV4Signer");
      }
      async sign(httpRequest, identity, signingProperties) {
        if (!HttpRequest.isInstance(httpRequest)) {
          throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
        }
        const validatedProps = await validateSigningProperties(signingProperties);
        const { config, signer } = validatedProps;
        let { signingRegion, signingName } = validatedProps;
        const handlerExecutionContext = signingProperties.context;
        if (handlerExecutionContext?.authSchemes?.length ?? 0 > 1) {
          const [first, second] = handlerExecutionContext.authSchemes;
          if (first?.name === "sigv4a" && second?.name === "sigv4") {
            signingRegion = second?.signingRegion ?? signingRegion;
            signingName = second?.signingName ?? signingName;
          }
        }
        const signedRequest = await signer.sign(httpRequest, {
          signingDate: getSkewCorrectedDate(config.systemClockOffset),
          signingRegion,
          signingService: signingName
        });
        return signedRequest;
      }
      errorHandler(signingProperties) {
        return (error) => {
          const serverTime = error.ServerTime ?? getDateHeader(error.$response);
          if (serverTime) {
            const config = throwSigningPropertyError("config", signingProperties.config);
            const initialSystemClockOffset = config.systemClockOffset;
            config.systemClockOffset = getUpdatedSystemClockOffset(serverTime, config.systemClockOffset);
            const clockSkewCorrected = config.systemClockOffset !== initialSystemClockOffset;
            if (clockSkewCorrected && error.$metadata) {
              error.$metadata.clockSkewCorrected = true;
            }
          }
          throw error;
        };
      }
      successHandler(httpResponse, signingProperties) {
        const dateHeader = getDateHeader(httpResponse);
        if (dateHeader) {
          const config = throwSigningPropertyError("config", signingProperties.config);
          config.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config.systemClockOffset);
        }
      }
    };
  }
});
var AwsSdkSigV4ASigner;
var init_AwsSdkSigV4ASigner = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4ASigner.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_utils();
    init_AwsSdkSigV4Signer();
    AwsSdkSigV4ASigner = class extends AwsSdkSigV4Signer {
      static {
        __name(this, "AwsSdkSigV4ASigner");
      }
      static {
        __name2(this, "AwsSdkSigV4ASigner");
      }
      async sign(httpRequest, identity, signingProperties) {
        if (!HttpRequest.isInstance(httpRequest)) {
          throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
        }
        const { config, signer, signingRegion, signingRegionSet, signingName } = await validateSigningProperties(signingProperties);
        const configResolvedSigningRegionSet = await config.sigv4aSigningRegionSet?.();
        const multiRegionOverride = (configResolvedSigningRegionSet ?? signingRegionSet ?? [signingRegion]).join(",");
        const signedRequest = await signer.sign(httpRequest, {
          signingDate: getSkewCorrectedDate(config.systemClockOffset),
          signingRegion: multiRegionOverride,
          signingService: signingName
        });
        return signedRequest;
      }
    };
  }
});
var init_getBearerTokenEnvKey = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getBearerTokenEnvKey.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/NODE_AUTH_SCHEME_PREFERENCE_OPTIONS.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_getSmithyContext = __esm({
  "../node_modules/@smithy/core/dist-es/getSmithyContext.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var getSmithyContext;
var init_getSmithyContext2 = __esm({
  "../node_modules/@smithy/util-middleware/dist-es/getSmithyContext.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es();
    getSmithyContext = /* @__PURE__ */ __name2((context) => context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {}), "getSmithyContext");
  }
});
var normalizeProvider;
var init_normalizeProvider = __esm({
  "../node_modules/@smithy/util-middleware/dist-es/normalizeProvider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    normalizeProvider = /* @__PURE__ */ __name2((input) => {
      if (typeof input === "function")
        return input;
      const promisified = Promise.resolve(input);
      return () => promisified;
    }, "normalizeProvider");
  }
});
var init_dist_es4 = __esm({
  "../node_modules/@smithy/util-middleware/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_getSmithyContext2();
    init_normalizeProvider();
  }
});
var resolveAuthOptions;
var init_resolveAuthOptions = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/resolveAuthOptions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    resolveAuthOptions = /* @__PURE__ */ __name2((candidateAuthOptions, authSchemePreference) => {
      if (!authSchemePreference || authSchemePreference.length === 0) {
        return candidateAuthOptions;
      }
      const preferredAuthOptions = [];
      for (const preferredSchemeName of authSchemePreference) {
        for (const candidateAuthOption of candidateAuthOptions) {
          const candidateAuthSchemeName = candidateAuthOption.schemeId.split("#")[1];
          if (candidateAuthSchemeName === preferredSchemeName) {
            preferredAuthOptions.push(candidateAuthOption);
          }
        }
      }
      for (const candidateAuthOption of candidateAuthOptions) {
        if (!preferredAuthOptions.find(({ schemeId }) => schemeId === candidateAuthOption.schemeId)) {
          preferredAuthOptions.push(candidateAuthOption);
        }
      }
      return preferredAuthOptions;
    }, "resolveAuthOptions");
  }
});
function convertHttpAuthSchemesToMap(httpAuthSchemes) {
  const map = /* @__PURE__ */ new Map();
  for (const scheme of httpAuthSchemes) {
    map.set(scheme.schemeId, scheme);
  }
  return map;
}
__name(convertHttpAuthSchemesToMap, "convertHttpAuthSchemesToMap");
var httpAuthSchemeMiddleware;
var init_httpAuthSchemeMiddleware = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/httpAuthSchemeMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es4();
    init_resolveAuthOptions();
    __name2(convertHttpAuthSchemesToMap, "convertHttpAuthSchemesToMap");
    httpAuthSchemeMiddleware = /* @__PURE__ */ __name2((config, mwOptions) => (next, context) => async (args) => {
      const options = config.httpAuthSchemeProvider(await mwOptions.httpAuthSchemeParametersProvider(config, context, args.input));
      const authSchemePreference = config.authSchemePreference ? await config.authSchemePreference() : [];
      const resolvedOptions = resolveAuthOptions(options, authSchemePreference);
      const authSchemes = convertHttpAuthSchemesToMap(config.httpAuthSchemes);
      const smithyContext = getSmithyContext(context);
      const failureReasons = [];
      for (const option of resolvedOptions) {
        const scheme = authSchemes.get(option.schemeId);
        if (!scheme) {
          failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
          continue;
        }
        const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config));
        if (!identityProvider) {
          failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
          continue;
        }
        const { identityProperties = {}, signingProperties = {} } = option.propertiesExtractor?.(config, context) || {};
        option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
        option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);
        smithyContext.selectedHttpAuthScheme = {
          httpAuthOption: option,
          identity: await identityProvider(option.identityProperties),
          signer: scheme.signer
        };
        break;
      }
      if (!smithyContext.selectedHttpAuthScheme) {
        throw new Error(failureReasons.join("\n"));
      }
      return next(args);
    }, "httpAuthSchemeMiddleware");
  }
});
var httpAuthSchemeEndpointRuleSetMiddlewareOptions;
var getHttpAuthSchemeEndpointRuleSetPlugin;
var init_getHttpAuthSchemeEndpointRuleSetPlugin = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_httpAuthSchemeMiddleware();
    httpAuthSchemeEndpointRuleSetMiddlewareOptions = {
      step: "serialize",
      tags: ["HTTP_AUTH_SCHEME"],
      name: "httpAuthSchemeMiddleware",
      override: true,
      relation: "before",
      toMiddleware: "endpointV2Middleware"
    };
    getHttpAuthSchemeEndpointRuleSetPlugin = /* @__PURE__ */ __name2((config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.addRelativeTo(httpAuthSchemeMiddleware(config, {
          httpAuthSchemeParametersProvider,
          identityProviderConfigProvider
        }), httpAuthSchemeEndpointRuleSetMiddlewareOptions);
      }, "applyToStack")
    }), "getHttpAuthSchemeEndpointRuleSetPlugin");
  }
});
var init_deserializerMiddleware = __esm({
  "../node_modules/@smithy/middleware-serde/dist-es/deserializerMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_serializerMiddleware = __esm({
  "../node_modules/@smithy/middleware-serde/dist-es/serializerMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var serializerMiddlewareOption;
var init_serdePlugin = __esm({
  "../node_modules/@smithy/middleware-serde/dist-es/serdePlugin.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    serializerMiddlewareOption = {
      name: "serializerMiddleware",
      step: "serialize",
      tags: ["SERIALIZER"],
      override: true
    };
  }
});
var init_dist_es5 = __esm({
  "../node_modules/@smithy/middleware-serde/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_deserializerMiddleware();
    init_serdePlugin();
    init_serializerMiddleware();
  }
});
var httpAuthSchemeMiddlewareOptions;
var init_getHttpAuthSchemePlugin = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/getHttpAuthSchemePlugin.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es5();
    httpAuthSchemeMiddlewareOptions = {
      step: "serialize",
      tags: ["HTTP_AUTH_SCHEME"],
      name: "httpAuthSchemeMiddleware",
      override: true,
      relation: "before",
      toMiddleware: serializerMiddlewareOption.name
    };
  }
});
var init_middleware_http_auth_scheme = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_httpAuthSchemeMiddleware();
    init_getHttpAuthSchemeEndpointRuleSetPlugin();
    init_getHttpAuthSchemePlugin();
  }
});
var defaultErrorHandler;
var defaultSuccessHandler;
var httpSigningMiddleware;
var init_httpSigningMiddleware = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-signing/httpSigningMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_dist_es4();
    defaultErrorHandler = /* @__PURE__ */ __name2((signingProperties) => (error) => {
      throw error;
    }, "defaultErrorHandler");
    defaultSuccessHandler = /* @__PURE__ */ __name2((httpResponse, signingProperties) => {
    }, "defaultSuccessHandler");
    httpSigningMiddleware = /* @__PURE__ */ __name2((config) => (next, context) => async (args) => {
      if (!HttpRequest.isInstance(args.request)) {
        return next(args);
      }
      const smithyContext = getSmithyContext(context);
      const scheme = smithyContext.selectedHttpAuthScheme;
      if (!scheme) {
        throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
      }
      const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
      const output = await next({
        ...args,
        request: await signer.sign(args.request, identity, signingProperties)
      }).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
      (signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
      return output;
    }, "httpSigningMiddleware");
  }
});
var httpSigningMiddlewareOptions;
var getHttpSigningPlugin;
var init_getHttpSigningMiddleware = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-signing/getHttpSigningMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_httpSigningMiddleware();
    httpSigningMiddlewareOptions = {
      step: "finalizeRequest",
      tags: ["HTTP_SIGNING"],
      name: "httpSigningMiddleware",
      aliases: ["apiKeyMiddleware", "tokenMiddleware", "awsAuthMiddleware"],
      override: true,
      relation: "after",
      toMiddleware: "retryMiddleware"
    };
    getHttpSigningPlugin = /* @__PURE__ */ __name2((config) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.addRelativeTo(httpSigningMiddleware(config), httpSigningMiddlewareOptions);
      }, "applyToStack")
    }), "getHttpSigningPlugin");
  }
});
var init_middleware_http_signing = __esm({
  "../node_modules/@smithy/core/dist-es/middleware-http-signing/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_httpSigningMiddleware();
    init_getHttpSigningMiddleware();
  }
});
var normalizeProvider2;
var init_normalizeProvider2 = __esm({
  "../node_modules/@smithy/core/dist-es/normalizeProvider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    normalizeProvider2 = /* @__PURE__ */ __name2((input) => {
      if (typeof input === "function")
        return input;
      const promisified = Promise.resolve(input);
      return () => promisified;
    }, "normalizeProvider");
  }
});
function createPaginator(ClientCtor, CommandCtor, inputTokenName, outputTokenName, pageSizeTokenName) {
  return /* @__PURE__ */ __name2(/* @__PURE__ */ __name(async function* paginateOperation(config, input, ...additionalArguments) {
    const _input = input;
    let token = config.startingToken ?? _input[inputTokenName];
    let hasNext = true;
    let page;
    while (hasNext) {
      _input[inputTokenName] = token;
      if (pageSizeTokenName) {
        _input[pageSizeTokenName] = _input[pageSizeTokenName] ?? config.pageSize;
      }
      if (config.client instanceof ClientCtor) {
        page = await makePagedClientRequest(CommandCtor, config.client, input, config.withCommand, ...additionalArguments);
      } else {
        throw new Error(`Invalid client, expected instance of ${ClientCtor.name}`);
      }
      yield page;
      const prevToken = token;
      token = get(page, outputTokenName);
      hasNext = !!(token && (!config.stopOnSameToken || token !== prevToken));
    }
    return void 0;
  }, "paginateOperation"), "paginateOperation");
}
__name(createPaginator, "createPaginator");
var makePagedClientRequest;
var get;
var init_createPaginator = __esm({
  "../node_modules/@smithy/core/dist-es/pagination/createPaginator.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    makePagedClientRequest = /* @__PURE__ */ __name2(async (CommandCtor, client, input, withCommand = (_) => _, ...args) => {
      let command = new CommandCtor(input);
      command = withCommand(command) ?? command;
      return await client.send(command, ...args);
    }, "makePagedClientRequest");
    __name2(createPaginator, "createPaginator");
    get = /* @__PURE__ */ __name2((fromObject, path) => {
      let cursor = fromObject;
      const pathComponents = path.split(".");
      for (const step of pathComponents) {
        if (!cursor || typeof cursor !== "object") {
          return void 0;
        }
        cursor = cursor[step];
      }
      return cursor;
    }, "get");
  }
});
var chars;
var alphabetByEncoding;
var alphabetByValue;
var bitsPerLetter;
var bitsPerByte;
var maxLetterValue;
var init_constants_browser = __esm({
  "../node_modules/@smithy/util-base64/dist-es/constants.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
    alphabetByEncoding = Object.entries(chars).reduce((acc, [i2, c2]) => {
      acc[c2] = Number(i2);
      return acc;
    }, {});
    alphabetByValue = chars.split("");
    bitsPerLetter = 6;
    bitsPerByte = 8;
    maxLetterValue = 63;
  }
});
var fromBase64;
var init_fromBase64_browser = __esm({
  "../node_modules/@smithy/util-base64/dist-es/fromBase64.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants_browser();
    fromBase64 = /* @__PURE__ */ __name2((input) => {
      let totalByteLength = input.length / 4 * 3;
      if (input.slice(-2) === "==") {
        totalByteLength -= 2;
      } else if (input.slice(-1) === "=") {
        totalByteLength--;
      }
      const out = new ArrayBuffer(totalByteLength);
      const dataView = new DataView(out);
      for (let i2 = 0; i2 < input.length; i2 += 4) {
        let bits = 0;
        let bitLength = 0;
        for (let j2 = i2, limit = i2 + 3; j2 <= limit; j2++) {
          if (input[j2] !== "=") {
            if (!(input[j2] in alphabetByEncoding)) {
              throw new TypeError(`Invalid character ${input[j2]} in base64 string.`);
            }
            bits |= alphabetByEncoding[input[j2]] << (limit - j2) * bitsPerLetter;
            bitLength += bitsPerLetter;
          } else {
            bits >>= bitsPerLetter;
          }
        }
        const chunkOffset = i2 / 4 * 3;
        bits >>= bitLength % bitsPerByte;
        const byteLength = Math.floor(bitLength / bitsPerByte);
        for (let k2 = 0; k2 < byteLength; k2++) {
          const offset = (byteLength - k2 - 1) * bitsPerByte;
          dataView.setUint8(chunkOffset + k2, (bits & 255 << offset) >> offset);
        }
      }
      return new Uint8Array(out);
    }, "fromBase64");
  }
});
var fromUtf8;
var init_fromUtf8_browser = __esm({
  "../node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    fromUtf8 = /* @__PURE__ */ __name2((input) => new TextEncoder().encode(input), "fromUtf8");
  }
});
var toUint8Array;
var init_toUint8Array = __esm({
  "../node_modules/@smithy/util-utf8/dist-es/toUint8Array.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fromUtf8_browser();
    toUint8Array = /* @__PURE__ */ __name2((data) => {
      if (typeof data === "string") {
        return fromUtf8(data);
      }
      if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
      }
      return new Uint8Array(data);
    }, "toUint8Array");
  }
});
var toUtf8;
var init_toUtf8_browser = __esm({
  "../node_modules/@smithy/util-utf8/dist-es/toUtf8.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    toUtf8 = /* @__PURE__ */ __name2((input) => {
      if (typeof input === "string") {
        return input;
      }
      if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
        throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
      }
      return new TextDecoder("utf-8").decode(input);
    }, "toUtf8");
  }
});
var init_dist_es6 = __esm({
  "../node_modules/@smithy/util-utf8/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fromUtf8_browser();
    init_toUint8Array();
    init_toUtf8_browser();
  }
});
function toBase64(_input) {
  let input;
  if (typeof _input === "string") {
    input = fromUtf8(_input);
  } else {
    input = _input;
  }
  const isArrayLike = typeof input === "object" && typeof input.length === "number";
  const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
  if (!isArrayLike && !isUint8Array) {
    throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
  }
  let str = "";
  for (let i2 = 0; i2 < input.length; i2 += 3) {
    let bits = 0;
    let bitLength = 0;
    for (let j2 = i2, limit = Math.min(i2 + 3, input.length); j2 < limit; j2++) {
      bits |= input[j2] << (limit - j2 - 1) * bitsPerByte;
      bitLength += bitsPerByte;
    }
    const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
    bits <<= bitClusterCount * bitsPerLetter - bitLength;
    for (let k2 = 1; k2 <= bitClusterCount; k2++) {
      const offset = (bitClusterCount - k2) * bitsPerLetter;
      str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
    }
    str += "==".slice(0, 4 - bitClusterCount);
  }
  return str;
}
__name(toBase64, "toBase64");
var init_toBase64_browser = __esm({
  "../node_modules/@smithy/util-base64/dist-es/toBase64.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es6();
    init_constants_browser();
    __name2(toBase64, "toBase64");
  }
});
var init_dist_es7 = __esm({
  "../node_modules/@smithy/util-base64/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fromBase64_browser();
    init_toBase64_browser();
  }
});
var Uint8ArrayBlobAdapter;
var init_Uint8ArrayBlobAdapter = __esm({
  "../node_modules/@smithy/util-stream/dist-es/blob/Uint8ArrayBlobAdapter.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es7();
    init_dist_es6();
    Uint8ArrayBlobAdapter = class _Uint8ArrayBlobAdapter extends Uint8Array {
      static {
        __name(this, "_Uint8ArrayBlobAdapter");
      }
      static {
        __name2(this, "Uint8ArrayBlobAdapter");
      }
      static fromString(source, encoding = "utf-8") {
        if (typeof source === "string") {
          if (encoding === "base64") {
            return _Uint8ArrayBlobAdapter.mutate(fromBase64(source));
          }
          return _Uint8ArrayBlobAdapter.mutate(fromUtf8(source));
        }
        throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
      }
      static mutate(source) {
        Object.setPrototypeOf(source, _Uint8ArrayBlobAdapter.prototype);
        return source;
      }
      transformToString(encoding = "utf-8") {
        if (encoding === "base64") {
          return toBase64(this);
        }
        return toUtf8(this);
      }
    };
  }
});
var ReadableStreamRef;
var ChecksumStream;
var init_ChecksumStream_browser = __esm({
  "../node_modules/@smithy/util-stream/dist-es/checksum/ChecksumStream.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    ReadableStreamRef = typeof ReadableStream === "function" ? ReadableStream : function() {
    };
    ChecksumStream = class extends ReadableStreamRef {
      static {
        __name(this, "ChecksumStream");
      }
      static {
        __name2(this, "ChecksumStream");
      }
    };
  }
});
var isReadableStream;
var init_stream_type_check = __esm({
  "../node_modules/@smithy/util-stream/dist-es/stream-type-check.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    isReadableStream = /* @__PURE__ */ __name2((stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream), "isReadableStream");
  }
});
var createChecksumStream;
var init_createChecksumStream_browser = __esm({
  "../node_modules/@smithy/util-stream/dist-es/checksum/createChecksumStream.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es7();
    init_stream_type_check();
    init_ChecksumStream_browser();
    createChecksumStream = /* @__PURE__ */ __name2(({ expectedChecksum, checksum, source, checksumSourceLocation, base64Encoder }) => {
      if (!isReadableStream(source)) {
        throw new Error(`@smithy/util-stream: unsupported source type ${source?.constructor?.name ?? source} in ChecksumStream.`);
      }
      const encoder = base64Encoder ?? toBase64;
      if (typeof TransformStream !== "function") {
        throw new Error("@smithy/util-stream: unable to instantiate ChecksumStream because API unavailable: ReadableStream/TransformStream.");
      }
      const transform = new TransformStream({
        start() {
        },
        async transform(chunk, controller) {
          checksum.update(chunk);
          controller.enqueue(chunk);
        },
        async flush(controller) {
          const digest = await checksum.digest();
          const received = encoder(digest);
          if (expectedChecksum !== received) {
            const error = new Error(`Checksum mismatch: expected "${expectedChecksum}" but received "${received}" in response header "${checksumSourceLocation}".`);
            controller.error(error);
          } else {
            controller.terminate();
          }
        }
      });
      source.pipeThrough(transform);
      const readable = transform.readable;
      Object.setPrototypeOf(readable, ChecksumStream.prototype);
      return readable;
    }, "createChecksumStream");
  }
});
var ByteArrayCollector;
var init_ByteArrayCollector = __esm({
  "../node_modules/@smithy/util-stream/dist-es/ByteArrayCollector.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    ByteArrayCollector = class {
      static {
        __name(this, "ByteArrayCollector");
      }
      static {
        __name2(this, "ByteArrayCollector");
      }
      allocByteArray;
      byteLength = 0;
      byteArrays = [];
      constructor(allocByteArray) {
        this.allocByteArray = allocByteArray;
      }
      push(byteArray) {
        this.byteArrays.push(byteArray);
        this.byteLength += byteArray.byteLength;
      }
      flush() {
        if (this.byteArrays.length === 1) {
          const bytes = this.byteArrays[0];
          this.reset();
          return bytes;
        }
        const aggregation = this.allocByteArray(this.byteLength);
        let cursor = 0;
        for (let i2 = 0; i2 < this.byteArrays.length; ++i2) {
          const bytes = this.byteArrays[i2];
          aggregation.set(bytes, cursor);
          cursor += bytes.byteLength;
        }
        this.reset();
        return aggregation;
      }
      reset() {
        this.byteArrays = [];
        this.byteLength = 0;
      }
    };
  }
});
function createBufferedReadableStream(upstream, size, logger2) {
  const reader = upstream.getReader();
  let streamBufferingLoggedWarning = false;
  let bytesSeen = 0;
  const buffers = ["", new ByteArrayCollector((size2) => new Uint8Array(size2))];
  let mode = -1;
  const pull = /* @__PURE__ */ __name2(async (controller) => {
    const { value, done } = await reader.read();
    const chunk = value;
    if (done) {
      if (mode !== -1) {
        const remainder = flush(buffers, mode);
        if (sizeOf(remainder) > 0) {
          controller.enqueue(remainder);
        }
      }
      controller.close();
    } else {
      const chunkMode = modeOf(chunk, false);
      if (mode !== chunkMode) {
        if (mode >= 0) {
          controller.enqueue(flush(buffers, mode));
        }
        mode = chunkMode;
      }
      if (mode === -1) {
        controller.enqueue(chunk);
        return;
      }
      const chunkSize = sizeOf(chunk);
      bytesSeen += chunkSize;
      const bufferSize = sizeOf(buffers[mode]);
      if (chunkSize >= size && bufferSize === 0) {
        controller.enqueue(chunk);
      } else {
        const newSize = merge(buffers, mode, chunk);
        if (!streamBufferingLoggedWarning && bytesSeen > size * 2) {
          streamBufferingLoggedWarning = true;
          logger2?.warn(`@smithy/util-stream - stream chunk size ${chunkSize} is below threshold of ${size}, automatically buffering.`);
        }
        if (newSize >= size) {
          controller.enqueue(flush(buffers, mode));
        } else {
          await pull(controller);
        }
      }
    }
  }, "pull");
  return new ReadableStream({
    pull
  });
}
__name(createBufferedReadableStream, "createBufferedReadableStream");
function merge(buffers, mode, chunk) {
  switch (mode) {
    case 0:
      buffers[0] += chunk;
      return sizeOf(buffers[0]);
    case 1:
    case 2:
      buffers[mode].push(chunk);
      return sizeOf(buffers[mode]);
  }
}
__name(merge, "merge");
function flush(buffers, mode) {
  switch (mode) {
    case 0:
      const s2 = buffers[0];
      buffers[0] = "";
      return s2;
    case 1:
    case 2:
      return buffers[mode].flush();
  }
  throw new Error(`@smithy/util-stream - invalid index ${mode} given to flush()`);
}
__name(flush, "flush");
function sizeOf(chunk) {
  return chunk?.byteLength ?? chunk?.length ?? 0;
}
__name(sizeOf, "sizeOf");
function modeOf(chunk, allowBuffer = true) {
  if (allowBuffer && typeof Buffer !== "undefined" && chunk instanceof Buffer) {
    return 2;
  }
  if (chunk instanceof Uint8Array) {
    return 1;
  }
  if (typeof chunk === "string") {
    return 0;
  }
  return -1;
}
__name(modeOf, "modeOf");
var createBufferedReadable;
var init_createBufferedReadableStream = __esm({
  "../node_modules/@smithy/util-stream/dist-es/createBufferedReadableStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_ByteArrayCollector();
    __name2(createBufferedReadableStream, "createBufferedReadableStream");
    createBufferedReadable = createBufferedReadableStream;
    __name2(merge, "merge");
    __name2(flush, "flush");
    __name2(sizeOf, "sizeOf");
    __name2(modeOf, "modeOf");
  }
});
var getAwsChunkedEncodingStream;
var init_getAwsChunkedEncodingStream_browser = __esm({
  "../node_modules/@smithy/util-stream/dist-es/getAwsChunkedEncodingStream.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getAwsChunkedEncodingStream = /* @__PURE__ */ __name2((readableStream, options) => {
      const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
      const checksumRequired = base64Encoder !== void 0 && bodyLengthChecker !== void 0 && checksumAlgorithmFn !== void 0 && checksumLocationName !== void 0 && streamHasher !== void 0;
      const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readableStream) : void 0;
      const reader = readableStream.getReader();
      return new ReadableStream({
        async pull(controller) {
          const { value, done } = await reader.read();
          if (done) {
            controller.enqueue(`0\r
`);
            if (checksumRequired) {
              const checksum = base64Encoder(await digest);
              controller.enqueue(`${checksumLocationName}:${checksum}\r
`);
              controller.enqueue(`\r
`);
            }
            controller.close();
          } else {
            controller.enqueue(`${(bodyLengthChecker(value) || 0).toString(16)}\r
${value}\r
`);
          }
        }
      });
    }, "getAwsChunkedEncodingStream");
  }
});
async function headStream(stream, bytes) {
  let byteLengthCounter = 0;
  const chunks = [];
  const reader = stream.getReader();
  let isDone = false;
  while (!isDone) {
    const { done, value } = await reader.read();
    if (value) {
      chunks.push(value);
      byteLengthCounter += value?.byteLength ?? 0;
    }
    if (byteLengthCounter >= bytes) {
      break;
    }
    isDone = done;
  }
  reader.releaseLock();
  const collected = new Uint8Array(Math.min(bytes, byteLengthCounter));
  let offset = 0;
  for (const chunk of chunks) {
    if (chunk.byteLength > collected.byteLength - offset) {
      collected.set(chunk.subarray(0, collected.byteLength - offset), offset);
      break;
    } else {
      collected.set(chunk, offset);
    }
    offset += chunk.length;
  }
  return collected;
}
__name(headStream, "headStream");
var init_headStream_browser = __esm({
  "../node_modules/@smithy/util-stream/dist-es/headStream.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(headStream, "headStream");
  }
});
var escapeUri;
var hexEncode;
var init_escape_uri = __esm({
  "../node_modules/@smithy/util-uri-escape/dist-es/escape-uri.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    escapeUri = /* @__PURE__ */ __name2((uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode), "escapeUri");
    hexEncode = /* @__PURE__ */ __name2((c2) => `%${c2.charCodeAt(0).toString(16).toUpperCase()}`, "hexEncode");
  }
});
var init_escape_uri_path = __esm({
  "../node_modules/@smithy/util-uri-escape/dist-es/escape-uri-path.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es8 = __esm({
  "../node_modules/@smithy/util-uri-escape/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_escape_uri();
    init_escape_uri_path();
  }
});
function buildQueryString(query) {
  const parts = [];
  for (let key of Object.keys(query).sort()) {
    const value = query[key];
    key = escapeUri(key);
    if (Array.isArray(value)) {
      for (let i2 = 0, iLen = value.length; i2 < iLen; i2++) {
        parts.push(`${key}=${escapeUri(value[i2])}`);
      }
    } else {
      let qsEntry = key;
      if (value || typeof value === "string") {
        qsEntry += `=${escapeUri(value)}`;
      }
      parts.push(qsEntry);
    }
  }
  return parts.join("&");
}
__name(buildQueryString, "buildQueryString");
var init_dist_es9 = __esm({
  "../node_modules/@smithy/querystring-builder/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es8();
    __name2(buildQueryString, "buildQueryString");
  }
});
function createRequest(url, requestOptions) {
  return new Request(url, requestOptions);
}
__name(createRequest, "createRequest");
var init_create_request = __esm({
  "../node_modules/@smithy/fetch-http-handler/dist-es/create-request.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(createRequest, "createRequest");
  }
});
function requestTimeout(timeoutInMs = 0) {
  return new Promise((resolve, reject) => {
    if (timeoutInMs) {
      setTimeout(() => {
        const timeoutError = new Error(`Request did not complete within ${timeoutInMs} ms`);
        timeoutError.name = "TimeoutError";
        reject(timeoutError);
      }, timeoutInMs);
    }
  });
}
__name(requestTimeout, "requestTimeout");
var init_request_timeout = __esm({
  "../node_modules/@smithy/fetch-http-handler/dist-es/request-timeout.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(requestTimeout, "requestTimeout");
  }
});
var keepAliveSupport;
var FetchHttpHandler;
var init_fetch_http_handler = __esm({
  "../node_modules/@smithy/fetch-http-handler/dist-es/fetch-http-handler.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_dist_es9();
    init_create_request();
    init_request_timeout();
    keepAliveSupport = {
      supported: void 0
    };
    FetchHttpHandler = class _FetchHttpHandler {
      static {
        __name(this, "_FetchHttpHandler");
      }
      static {
        __name2(this, "FetchHttpHandler");
      }
      config;
      configProvider;
      static create(instanceOrOptions) {
        if (typeof instanceOrOptions?.handle === "function") {
          return instanceOrOptions;
        }
        return new _FetchHttpHandler(instanceOrOptions);
      }
      constructor(options) {
        if (typeof options === "function") {
          this.configProvider = options().then((opts) => opts || {});
        } else {
          this.config = options ?? {};
          this.configProvider = Promise.resolve(this.config);
        }
        if (keepAliveSupport.supported === void 0) {
          keepAliveSupport.supported = Boolean(typeof Request !== "undefined" && "keepalive" in createRequest("https://[::1]"));
        }
      }
      destroy() {
      }
      async handle(request, { abortSignal, requestTimeout: requestTimeout2 } = {}) {
        if (!this.config) {
          this.config = await this.configProvider;
        }
        const requestTimeoutInMs = requestTimeout2 ?? this.config.requestTimeout;
        const keepAlive = this.config.keepAlive === true;
        const credentials = this.config.credentials;
        if (abortSignal?.aborted) {
          const abortError = new Error("Request aborted");
          abortError.name = "AbortError";
          return Promise.reject(abortError);
        }
        let path = request.path;
        const queryString = buildQueryString(request.query || {});
        if (queryString) {
          path += `?${queryString}`;
        }
        if (request.fragment) {
          path += `#${request.fragment}`;
        }
        let auth = "";
        if (request.username != null || request.password != null) {
          const username = request.username ?? "";
          const password = request.password ?? "";
          auth = `${username}:${password}@`;
        }
        const { port, method } = request;
        const url = `${request.protocol}//${auth}${request.hostname}${port ? `:${port}` : ""}${path}`;
        const body = method === "GET" || method === "HEAD" ? void 0 : request.body;
        const requestOptions = {
          body,
          headers: new Headers(request.headers),
          method,
          credentials
        };
        if (this.config?.cache) {
          requestOptions.cache = this.config.cache;
        }
        if (body) {
          requestOptions.duplex = "half";
        }
        if (typeof AbortController !== "undefined") {
          requestOptions.signal = abortSignal;
        }
        if (keepAliveSupport.supported) {
          requestOptions.keepalive = keepAlive;
        }
        if (typeof this.config.requestInit === "function") {
          Object.assign(requestOptions, this.config.requestInit(request));
        }
        let removeSignalEventListener = /* @__PURE__ */ __name2(() => {
        }, "removeSignalEventListener");
        const fetchRequest = createRequest(url, requestOptions);
        const raceOfPromises = [
          fetch(fetchRequest).then((response) => {
            const fetchHeaders = response.headers;
            const transformedHeaders = {};
            for (const pair of fetchHeaders.entries()) {
              transformedHeaders[pair[0]] = pair[1];
            }
            const hasReadableStream = response.body != void 0;
            if (!hasReadableStream) {
              return response.blob().then((body2) => ({
                response: new HttpResponse({
                  headers: transformedHeaders,
                  reason: response.statusText,
                  statusCode: response.status,
                  body: body2
                })
              }));
            }
            return {
              response: new HttpResponse({
                headers: transformedHeaders,
                reason: response.statusText,
                statusCode: response.status,
                body: response.body
              })
            };
          }),
          requestTimeout(requestTimeoutInMs)
        ];
        if (abortSignal) {
          raceOfPromises.push(new Promise((resolve, reject) => {
            const onAbort = /* @__PURE__ */ __name2(() => {
              const abortError = new Error("Request aborted");
              abortError.name = "AbortError";
              reject(abortError);
            }, "onAbort");
            if (typeof abortSignal.addEventListener === "function") {
              const signal = abortSignal;
              signal.addEventListener("abort", onAbort, { once: true });
              removeSignalEventListener = /* @__PURE__ */ __name2(() => signal.removeEventListener("abort", onAbort), "removeSignalEventListener");
            } else {
              abortSignal.onabort = onAbort;
            }
          }));
        }
        return Promise.race(raceOfPromises).finally(removeSignalEventListener);
      }
      updateHttpClientConfig(key, value) {
        this.config = void 0;
        this.configProvider = this.configProvider.then((config) => {
          config[key] = value;
          return config;
        });
      }
      httpHandlerConfigs() {
        return this.config ?? {};
      }
    };
  }
});
async function collectBlob(blob) {
  const base64 = await readToBase64(blob);
  const arrayBuffer = fromBase64(base64);
  return new Uint8Array(arrayBuffer);
}
__name(collectBlob, "collectBlob");
async function collectStream(stream) {
  const chunks = [];
  const reader = stream.getReader();
  let isDone = false;
  let length = 0;
  while (!isDone) {
    const { done, value } = await reader.read();
    if (value) {
      chunks.push(value);
      length += value.length;
    }
    isDone = done;
  }
  const collected = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    collected.set(chunk, offset);
    offset += chunk.length;
  }
  return collected;
}
__name(collectStream, "collectStream");
function readToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== 2) {
        return reject(new Error("Reader aborted too early"));
      }
      const result = reader.result ?? "";
      const commaIndex = result.indexOf(",");
      const dataOffset = commaIndex > -1 ? commaIndex + 1 : result.length;
      resolve(result.substring(dataOffset));
    };
    reader.onabort = () => reject(new Error("Read aborted"));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
__name(readToBase64, "readToBase64");
var streamCollector;
var init_stream_collector = __esm({
  "../node_modules/@smithy/fetch-http-handler/dist-es/stream-collector.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es7();
    streamCollector = /* @__PURE__ */ __name2(async (stream) => {
      if (typeof Blob === "function" && stream instanceof Blob || stream.constructor?.name === "Blob") {
        if (Blob.prototype.arrayBuffer !== void 0) {
          return new Uint8Array(await stream.arrayBuffer());
        }
        return collectBlob(stream);
      }
      return collectStream(stream);
    }, "streamCollector");
    __name2(collectBlob, "collectBlob");
    __name2(collectStream, "collectStream");
    __name2(readToBase64, "readToBase64");
  }
});
var init_dist_es10 = __esm({
  "../node_modules/@smithy/fetch-http-handler/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fetch_http_handler();
    init_stream_collector();
  }
});
function fromHex(encoded) {
  if (encoded.length % 2 !== 0) {
    throw new Error("Hex encoded strings must have an even number length");
  }
  const out = new Uint8Array(encoded.length / 2);
  for (let i2 = 0; i2 < encoded.length; i2 += 2) {
    const encodedByte = encoded.slice(i2, i2 + 2).toLowerCase();
    if (encodedByte in HEX_TO_SHORT) {
      out[i2 / 2] = HEX_TO_SHORT[encodedByte];
    } else {
      throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
    }
  }
  return out;
}
__name(fromHex, "fromHex");
function toHex(bytes) {
  let out = "";
  for (let i2 = 0; i2 < bytes.byteLength; i2++) {
    out += SHORT_TO_HEX[bytes[i2]];
  }
  return out;
}
__name(toHex, "toHex");
var SHORT_TO_HEX;
var HEX_TO_SHORT;
var init_dist_es11 = __esm({
  "../node_modules/@smithy/util-hex-encoding/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SHORT_TO_HEX = {};
    HEX_TO_SHORT = {};
    for (let i2 = 0; i2 < 256; i2++) {
      let encodedByte = i2.toString(16).toLowerCase();
      if (encodedByte.length === 1) {
        encodedByte = `0${encodedByte}`;
      }
      SHORT_TO_HEX[i2] = encodedByte;
      HEX_TO_SHORT[encodedByte] = i2;
    }
    __name2(fromHex, "fromHex");
    __name2(toHex, "toHex");
  }
});
var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED;
var sdkStreamMixin;
var isBlobInstance;
var init_sdk_stream_mixin_browser = __esm({
  "../node_modules/@smithy/util-stream/dist-es/sdk-stream-mixin.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es10();
    init_dist_es7();
    init_dist_es11();
    init_dist_es6();
    init_stream_type_check();
    ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
    sdkStreamMixin = /* @__PURE__ */ __name2((stream) => {
      if (!isBlobInstance(stream) && !isReadableStream(stream)) {
        const name = stream?.__proto__?.constructor?.name || stream;
        throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
      }
      let transformed = false;
      const transformToByteArray = /* @__PURE__ */ __name2(async () => {
        if (transformed) {
          throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
        }
        transformed = true;
        return await streamCollector(stream);
      }, "transformToByteArray");
      const blobToWebStream = /* @__PURE__ */ __name2((blob) => {
        if (typeof blob.stream !== "function") {
          throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\nIf you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
        }
        return blob.stream();
      }, "blobToWebStream");
      return Object.assign(stream, {
        transformToByteArray,
        transformToString: /* @__PURE__ */ __name2(async (encoding) => {
          const buf = await transformToByteArray();
          if (encoding === "base64") {
            return toBase64(buf);
          } else if (encoding === "hex") {
            return toHex(buf);
          } else if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") {
            return toUtf8(buf);
          } else if (typeof TextDecoder === "function") {
            return new TextDecoder(encoding).decode(buf);
          } else {
            throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
          }
        }, "transformToString"),
        transformToWebStream: /* @__PURE__ */ __name2(() => {
          if (transformed) {
            throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
          }
          transformed = true;
          if (isBlobInstance(stream)) {
            return blobToWebStream(stream);
          } else if (isReadableStream(stream)) {
            return stream;
          } else {
            throw new Error(`Cannot transform payload to web stream, got ${stream}`);
          }
        }, "transformToWebStream")
      });
    }, "sdkStreamMixin");
    isBlobInstance = /* @__PURE__ */ __name2((stream) => typeof Blob === "function" && stream instanceof Blob, "isBlobInstance");
  }
});
async function splitStream(stream) {
  if (typeof stream.stream === "function") {
    stream = stream.stream();
  }
  const readableStream = stream;
  return readableStream.tee();
}
__name(splitStream, "splitStream");
var init_splitStream_browser = __esm({
  "../node_modules/@smithy/util-stream/dist-es/splitStream.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(splitStream, "splitStream");
  }
});
var init_dist_es12 = __esm({
  "../node_modules/@smithy/util-stream/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Uint8ArrayBlobAdapter();
    init_ChecksumStream_browser();
    init_createChecksumStream_browser();
    init_createBufferedReadableStream();
    init_getAwsChunkedEncodingStream_browser();
    init_headStream_browser();
    init_sdk_stream_mixin_browser();
    init_splitStream_browser();
  }
});
var collectBody;
var init_collect_stream_body = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/collect-stream-body.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es12();
    collectBody = /* @__PURE__ */ __name2(async (streamBody = new Uint8Array(), context) => {
      if (streamBody instanceof Uint8Array) {
        return Uint8ArrayBlobAdapter.mutate(streamBody);
      }
      if (!streamBody) {
        return Uint8ArrayBlobAdapter.mutate(new Uint8Array());
      }
      const fromContext = context.streamCollector(streamBody);
      return Uint8ArrayBlobAdapter.mutate(await fromContext);
    }, "collectBody");
  }
});
function extendedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c2) {
    return "%" + c2.charCodeAt(0).toString(16).toUpperCase();
  });
}
__name(extendedEncodeURIComponent, "extendedEncodeURIComponent");
var init_extended_encode_uri_component = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(extendedEncodeURIComponent, "extendedEncodeURIComponent");
  }
});
var deref;
var init_deref = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/deref.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    deref = /* @__PURE__ */ __name2((schemaRef) => {
      if (typeof schemaRef === "function") {
        return schemaRef();
      }
      return schemaRef;
    }, "deref");
  }
});
var operation;
var init_operation = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/operation.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    operation = /* @__PURE__ */ __name2((namespace, name, traits, input, output) => ({
      name,
      namespace,
      traits,
      input,
      output
    }), "operation");
  }
});
var schemaDeserializationMiddleware;
var findHeader;
var init_schemaDeserializationMiddleware = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaDeserializationMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_dist_es4();
    init_operation();
    schemaDeserializationMiddleware = /* @__PURE__ */ __name2((config) => (next, context) => async (args) => {
      const { response } = await next(args);
      const { operationSchema } = getSmithyContext(context);
      const [, ns, n2, t8, i2, o2] = operationSchema ?? [];
      try {
        const parsed = await config.protocol.deserializeResponse(operation(ns, n2, t8, i2, o2), {
          ...config,
          ...context
        }, response);
        return {
          response,
          output: parsed
        };
      } catch (error) {
        Object.defineProperty(error, "$response", {
          value: response,
          enumerable: false,
          writable: false,
          configurable: false
        });
        if (!("$metadata" in error)) {
          const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
          try {
            error.message += "\n  " + hint;
          } catch (e2) {
            if (!context.logger || context.logger?.constructor?.name === "NoOpLogger") {
              console.warn(hint);
            } else {
              context.logger?.warn?.(hint);
            }
          }
          if (typeof error.$responseBodyText !== "undefined") {
            if (error.$response) {
              error.$response.body = error.$responseBodyText;
            }
          }
          try {
            if (HttpResponse.isInstance(response)) {
              const { headers = {} } = response;
              const headerEntries = Object.entries(headers);
              error.$metadata = {
                httpStatusCode: response.statusCode,
                requestId: findHeader(/^x-[\w-]+-request-?id$/, headerEntries),
                extendedRequestId: findHeader(/^x-[\w-]+-id-2$/, headerEntries),
                cfId: findHeader(/^x-[\w-]+-cf-id$/, headerEntries)
              };
            }
          } catch (e2) {
          }
        }
        throw error;
      }
    }, "schemaDeserializationMiddleware");
    findHeader = /* @__PURE__ */ __name2((pattern, headers) => {
      return (headers.find(([k2]) => {
        return k2.match(pattern);
      }) || [void 0, void 0])[1];
    }, "findHeader");
  }
});
var schemaSerializationMiddleware;
var init_schemaSerializationMiddleware = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaSerializationMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es4();
    init_operation();
    schemaSerializationMiddleware = /* @__PURE__ */ __name2((config) => (next, context) => async (args) => {
      const { operationSchema } = getSmithyContext(context);
      const [, ns, n2, t8, i2, o2] = operationSchema ?? [];
      const endpoint = context.endpointV2?.url && config.urlParser ? async () => config.urlParser(context.endpointV2.url) : config.endpoint;
      const request = await config.protocol.serializeRequest(operation(ns, n2, t8, i2, o2), args.input, {
        ...config,
        ...context,
        endpoint
      });
      return next({
        ...args,
        request
      });
    }, "schemaSerializationMiddleware");
  }
});
function getSchemaSerdePlugin(config) {
  return {
    applyToStack: /* @__PURE__ */ __name2((commandStack) => {
      commandStack.add(schemaSerializationMiddleware(config), serializerMiddlewareOption2);
      commandStack.add(schemaDeserializationMiddleware(config), deserializerMiddlewareOption);
      config.protocol.setSerdeContext(config);
    }, "applyToStack")
  };
}
__name(getSchemaSerdePlugin, "getSchemaSerdePlugin");
var deserializerMiddlewareOption;
var serializerMiddlewareOption2;
var init_getSchemaSerdePlugin = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/middleware/getSchemaSerdePlugin.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schemaDeserializationMiddleware();
    init_schemaSerializationMiddleware();
    deserializerMiddlewareOption = {
      name: "deserializerMiddleware",
      step: "deserialize",
      tags: ["DESERIALIZER"],
      override: true
    };
    serializerMiddlewareOption2 = {
      name: "serializerMiddleware",
      step: "serialize",
      tags: ["SERIALIZER"],
      override: true
    };
    __name2(getSchemaSerdePlugin, "getSchemaSerdePlugin");
  }
});
var Schema;
var init_Schema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/Schema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    Schema = class {
      static {
        __name(this, "Schema");
      }
      static {
        __name2(this, "Schema");
      }
      name;
      namespace;
      traits;
      static assign(instance, values) {
        const schema = Object.assign(instance, values);
        return schema;
      }
      static [Symbol.hasInstance](lhs) {
        const isPrototype = this.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
          const list = lhs;
          return list.symbol === this.symbol;
        }
        return isPrototype;
      }
      getName() {
        return this.namespace + "#" + this.name;
      }
    };
  }
});
var ListSchema;
var init_ListSchema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/ListSchema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Schema();
    ListSchema = class _ListSchema extends Schema {
      static {
        __name(this, "_ListSchema");
      }
      static {
        __name2(this, "ListSchema");
      }
      static symbol = Symbol.for("@smithy/lis");
      name;
      traits;
      valueSchema;
      symbol = _ListSchema.symbol;
    };
  }
});
var MapSchema;
var init_MapSchema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/MapSchema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Schema();
    MapSchema = class _MapSchema extends Schema {
      static {
        __name(this, "_MapSchema");
      }
      static {
        __name2(this, "MapSchema");
      }
      static symbol = Symbol.for("@smithy/map");
      name;
      traits;
      keySchema;
      valueSchema;
      symbol = _MapSchema.symbol;
    };
  }
});
var OperationSchema;
var init_OperationSchema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/OperationSchema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Schema();
    OperationSchema = class _OperationSchema extends Schema {
      static {
        __name(this, "_OperationSchema");
      }
      static {
        __name2(this, "OperationSchema");
      }
      static symbol = Symbol.for("@smithy/ope");
      name;
      traits;
      input;
      output;
      symbol = _OperationSchema.symbol;
    };
  }
});
var StructureSchema;
var init_StructureSchema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/StructureSchema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Schema();
    StructureSchema = class _StructureSchema extends Schema {
      static {
        __name(this, "_StructureSchema");
      }
      static {
        __name2(this, "StructureSchema");
      }
      static symbol = Symbol.for("@smithy/str");
      name;
      traits;
      memberNames;
      memberList;
      symbol = _StructureSchema.symbol;
    };
  }
});
var ErrorSchema;
var init_ErrorSchema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/ErrorSchema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_StructureSchema();
    ErrorSchema = class _ErrorSchema extends StructureSchema {
      static {
        __name(this, "_ErrorSchema");
      }
      static {
        __name2(this, "ErrorSchema");
      }
      static symbol = Symbol.for("@smithy/err");
      ctor;
      symbol = _ErrorSchema.symbol;
    };
  }
});
function translateTraits(indicator) {
  if (typeof indicator === "object") {
    return indicator;
  }
  indicator = indicator | 0;
  const traits = {};
  let i2 = 0;
  for (const trait of [
    "httpLabel",
    "idempotent",
    "idempotencyToken",
    "sensitive",
    "httpPayload",
    "httpResponseCode",
    "httpQueryParams"
  ]) {
    if ((indicator >> i2++ & 1) === 1) {
      traits[trait] = 1;
    }
  }
  return traits;
}
__name(translateTraits, "translateTraits");
var init_translateTraits = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/translateTraits.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(translateTraits, "translateTraits");
  }
});
function member(memberSchema, memberName) {
  if (memberSchema instanceof NormalizedSchema) {
    return Object.assign(memberSchema, {
      memberName,
      _isMemberSchema: true
    });
  }
  const internalCtorAccess = NormalizedSchema;
  return new internalCtorAccess(memberSchema, memberName);
}
__name(member, "member");
var anno;
var NormalizedSchema;
var isMemberSchema;
var isStaticSchema;
var init_NormalizedSchema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/NormalizedSchema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_deref();
    init_translateTraits();
    anno = {
      it: Symbol.for("@smithy/nor-struct-it")
    };
    NormalizedSchema = class _NormalizedSchema {
      static {
        __name(this, "_NormalizedSchema");
      }
      static {
        __name2(this, "NormalizedSchema");
      }
      ref;
      memberName;
      static symbol = Symbol.for("@smithy/nor");
      symbol = _NormalizedSchema.symbol;
      name;
      schema;
      _isMemberSchema;
      traits;
      memberTraits;
      normalizedTraits;
      constructor(ref, memberName) {
        this.ref = ref;
        this.memberName = memberName;
        const traitStack = [];
        let _ref = ref;
        let schema = ref;
        this._isMemberSchema = false;
        while (isMemberSchema(_ref)) {
          traitStack.push(_ref[1]);
          _ref = _ref[0];
          schema = deref(_ref);
          this._isMemberSchema = true;
        }
        if (traitStack.length > 0) {
          this.memberTraits = {};
          for (let i2 = traitStack.length - 1; i2 >= 0; --i2) {
            const traitSet = traitStack[i2];
            Object.assign(this.memberTraits, translateTraits(traitSet));
          }
        } else {
          this.memberTraits = 0;
        }
        if (schema instanceof _NormalizedSchema) {
          const computedMemberTraits = this.memberTraits;
          Object.assign(this, schema);
          this.memberTraits = Object.assign({}, computedMemberTraits, schema.getMemberTraits(), this.getMemberTraits());
          this.normalizedTraits = void 0;
          this.memberName = memberName ?? schema.memberName;
          return;
        }
        this.schema = deref(schema);
        if (isStaticSchema(this.schema)) {
          this.name = `${this.schema[1]}#${this.schema[2]}`;
          this.traits = this.schema[3];
        } else {
          this.name = this.memberName ?? String(schema);
          this.traits = 0;
        }
        if (this._isMemberSchema && !memberName) {
          throw new Error(`@smithy/core/schema - NormalizedSchema member init ${this.getName(true)} missing member name.`);
        }
      }
      static [Symbol.hasInstance](lhs) {
        const isPrototype = this.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
          const ns = lhs;
          return ns.symbol === this.symbol;
        }
        return isPrototype;
      }
      static of(ref) {
        const sc = deref(ref);
        if (sc instanceof _NormalizedSchema) {
          return sc;
        }
        if (isMemberSchema(sc)) {
          const [ns, traits] = sc;
          if (ns instanceof _NormalizedSchema) {
            Object.assign(ns.getMergedTraits(), translateTraits(traits));
            return ns;
          }
          throw new Error(`@smithy/core/schema - may not init unwrapped member schema=${JSON.stringify(ref, null, 2)}.`);
        }
        return new _NormalizedSchema(sc);
      }
      getSchema() {
        const sc = this.schema;
        if (sc[0] === 0) {
          return sc[4];
        }
        return sc;
      }
      getName(withNamespace = false) {
        const { name } = this;
        const short = !withNamespace && name && name.includes("#");
        return short ? name.split("#")[1] : name || void 0;
      }
      getMemberName() {
        return this.memberName;
      }
      isMemberSchema() {
        return this._isMemberSchema;
      }
      isListSchema() {
        const sc = this.getSchema();
        return typeof sc === "number" ? sc >= 64 && sc < 128 : sc[0] === 1;
      }
      isMapSchema() {
        const sc = this.getSchema();
        return typeof sc === "number" ? sc >= 128 && sc <= 255 : sc[0] === 2;
      }
      isStructSchema() {
        const sc = this.getSchema();
        const id = sc[0];
        return id === 3 || id === -3 || id === 4;
      }
      isUnionSchema() {
        const sc = this.getSchema();
        return sc[0] === 4;
      }
      isBlobSchema() {
        const sc = this.getSchema();
        return sc === 21 || sc === 42;
      }
      isTimestampSchema() {
        const sc = this.getSchema();
        return typeof sc === "number" && sc >= 4 && sc <= 7;
      }
      isUnitSchema() {
        return this.getSchema() === "unit";
      }
      isDocumentSchema() {
        return this.getSchema() === 15;
      }
      isStringSchema() {
        return this.getSchema() === 0;
      }
      isBooleanSchema() {
        return this.getSchema() === 2;
      }
      isNumericSchema() {
        return this.getSchema() === 1;
      }
      isBigIntegerSchema() {
        return this.getSchema() === 17;
      }
      isBigDecimalSchema() {
        return this.getSchema() === 19;
      }
      isStreaming() {
        const { streaming } = this.getMergedTraits();
        return !!streaming || this.getSchema() === 42;
      }
      isIdempotencyToken() {
        return !!this.getMergedTraits().idempotencyToken;
      }
      getMergedTraits() {
        return this.normalizedTraits ?? (this.normalizedTraits = {
          ...this.getOwnTraits(),
          ...this.getMemberTraits()
        });
      }
      getMemberTraits() {
        return translateTraits(this.memberTraits);
      }
      getOwnTraits() {
        return translateTraits(this.traits);
      }
      getKeySchema() {
        const [isDoc, isMap] = [this.isDocumentSchema(), this.isMapSchema()];
        if (!isDoc && !isMap) {
          throw new Error(`@smithy/core/schema - cannot get key for non-map: ${this.getName(true)}`);
        }
        const schema = this.getSchema();
        const memberSchema = isDoc ? 15 : schema[4] ?? 0;
        return member([memberSchema, 0], "key");
      }
      getValueSchema() {
        const sc = this.getSchema();
        const [isDoc, isMap, isList] = [this.isDocumentSchema(), this.isMapSchema(), this.isListSchema()];
        const memberSchema = typeof sc === "number" ? 63 & sc : sc && typeof sc === "object" && (isMap || isList) ? sc[3 + sc[0]] : isDoc ? 15 : void 0;
        if (memberSchema != null) {
          return member([memberSchema, 0], isMap ? "value" : "member");
        }
        throw new Error(`@smithy/core/schema - ${this.getName(true)} has no value member.`);
      }
      getMemberSchema(memberName) {
        const struct = this.getSchema();
        if (this.isStructSchema() && struct[4].includes(memberName)) {
          const i2 = struct[4].indexOf(memberName);
          const memberSchema = struct[5][i2];
          return member(isMemberSchema(memberSchema) ? memberSchema : [memberSchema, 0], memberName);
        }
        if (this.isDocumentSchema()) {
          return member([15, 0], memberName);
        }
        throw new Error(`@smithy/core/schema - ${this.getName(true)} has no no member=${memberName}.`);
      }
      getMemberSchemas() {
        const buffer = {};
        try {
          for (const [k2, v2] of this.structIterator()) {
            buffer[k2] = v2;
          }
        } catch (ignored) {
        }
        return buffer;
      }
      getEventStreamMember() {
        if (this.isStructSchema()) {
          for (const [memberName, memberSchema] of this.structIterator()) {
            if (memberSchema.isStreaming() && memberSchema.isStructSchema()) {
              return memberName;
            }
          }
        }
        return "";
      }
      *structIterator() {
        if (this.isUnitSchema()) {
          return;
        }
        if (!this.isStructSchema()) {
          throw new Error("@smithy/core/schema - cannot iterate non-struct schema.");
        }
        const struct = this.getSchema();
        const z2 = struct[4].length;
        let it = struct[anno.it];
        if (it && z2 === it.length) {
          yield* it;
          return;
        }
        it = Array(z2);
        for (let i2 = 0; i2 < z2; ++i2) {
          const k2 = struct[4][i2];
          const v2 = member([struct[5][i2], 0], k2);
          yield it[i2] = [k2, v2];
        }
        struct[anno.it] = it;
      }
    };
    __name2(member, "member");
    isMemberSchema = /* @__PURE__ */ __name2((sc) => Array.isArray(sc) && sc.length === 2, "isMemberSchema");
    isStaticSchema = /* @__PURE__ */ __name2((sc) => Array.isArray(sc) && sc.length >= 5, "isStaticSchema");
  }
});
var SimpleSchema;
var init_SimpleSchema = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/SimpleSchema.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Schema();
    SimpleSchema = class _SimpleSchema extends Schema {
      static {
        __name(this, "_SimpleSchema");
      }
      static {
        __name2(this, "SimpleSchema");
      }
      static symbol = Symbol.for("@smithy/sim");
      name;
      schemaRef;
      traits;
      symbol = _SimpleSchema.symbol;
    };
  }
});
var init_sentinels2 = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/schemas/sentinels.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var TypeRegistry;
var init_TypeRegistry = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    TypeRegistry = class _TypeRegistry {
      static {
        __name(this, "_TypeRegistry");
      }
      static {
        __name2(this, "TypeRegistry");
      }
      namespace;
      schemas;
      exceptions;
      static registries = /* @__PURE__ */ new Map();
      constructor(namespace, schemas = /* @__PURE__ */ new Map(), exceptions = /* @__PURE__ */ new Map()) {
        this.namespace = namespace;
        this.schemas = schemas;
        this.exceptions = exceptions;
      }
      static for(namespace) {
        if (!_TypeRegistry.registries.has(namespace)) {
          _TypeRegistry.registries.set(namespace, new _TypeRegistry(namespace));
        }
        return _TypeRegistry.registries.get(namespace);
      }
      register(shapeId, schema) {
        const qualifiedName = this.normalizeShapeId(shapeId);
        const registry = _TypeRegistry.for(qualifiedName.split("#")[0]);
        registry.schemas.set(qualifiedName, schema);
      }
      getSchema(shapeId) {
        const id = this.normalizeShapeId(shapeId);
        if (!this.schemas.has(id)) {
          throw new Error(`@smithy/core/schema - schema not found for ${id}`);
        }
        return this.schemas.get(id);
      }
      registerError(es, ctor) {
        const $error = es;
        const registry = _TypeRegistry.for($error[1]);
        registry.schemas.set($error[1] + "#" + $error[2], $error);
        registry.exceptions.set($error, ctor);
      }
      getErrorCtor(es) {
        const $error = es;
        const registry = _TypeRegistry.for($error[1]);
        return registry.exceptions.get($error);
      }
      getBaseException() {
        for (const exceptionKey of this.exceptions.keys()) {
          if (Array.isArray(exceptionKey)) {
            const [, ns, name] = exceptionKey;
            const id = ns + "#" + name;
            if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) {
              return exceptionKey;
            }
          }
        }
        return void 0;
      }
      find(predicate) {
        return [...this.schemas.values()].find(predicate);
      }
      clear() {
        this.schemas.clear();
        this.exceptions.clear();
      }
      normalizeShapeId(shapeId) {
        if (shapeId.includes("#")) {
          return shapeId;
        }
        return this.namespace + "#" + shapeId;
      }
    };
  }
});
var init_schema2 = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/schema/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_deref();
    init_getSchemaSerdePlugin();
    init_ListSchema();
    init_MapSchema();
    init_OperationSchema();
    init_operation();
    init_ErrorSchema();
    init_NormalizedSchema();
    init_Schema();
    init_SimpleSchema();
    init_StructureSchema();
    init_sentinels2();
    init_translateTraits();
    init_TypeRegistry();
  }
});
var init_copyDocumentWithTransform = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/copyDocumentWithTransform.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var expectNumber;
var MAX_FLOAT;
var expectFloat32;
var expectLong;
var expectShort;
var expectByte;
var expectSizedInt;
var castInt;
var strictParseFloat32;
var NUMBER_REGEX;
var parseNumber;
var strictParseShort;
var strictParseByte;
var stackTraceWarning;
var logger;
var init_parse_utils = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/parse-utils.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    expectNumber = /* @__PURE__ */ __name2((value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (!Number.isNaN(parsed)) {
          if (String(parsed) !== String(value)) {
            logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
          }
          return parsed;
        }
      }
      if (typeof value === "number") {
        return value;
      }
      throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
    }, "expectNumber");
    MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
    expectFloat32 = /* @__PURE__ */ __name2((value) => {
      const expected = expectNumber(value);
      if (expected !== void 0 && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
        if (Math.abs(expected) > MAX_FLOAT) {
          throw new TypeError(`Expected 32-bit float, got ${value}`);
        }
      }
      return expected;
    }, "expectFloat32");
    expectLong = /* @__PURE__ */ __name2((value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      if (Number.isInteger(value) && !Number.isNaN(value)) {
        return value;
      }
      throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
    }, "expectLong");
    expectShort = /* @__PURE__ */ __name2((value) => expectSizedInt(value, 16), "expectShort");
    expectByte = /* @__PURE__ */ __name2((value) => expectSizedInt(value, 8), "expectByte");
    expectSizedInt = /* @__PURE__ */ __name2((value, size) => {
      const expected = expectLong(value);
      if (expected !== void 0 && castInt(expected, size) !== expected) {
        throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
      }
      return expected;
    }, "expectSizedInt");
    castInt = /* @__PURE__ */ __name2((value, size) => {
      switch (size) {
        case 32:
          return Int32Array.of(value)[0];
        case 16:
          return Int16Array.of(value)[0];
        case 8:
          return Int8Array.of(value)[0];
      }
    }, "castInt");
    strictParseFloat32 = /* @__PURE__ */ __name2((value) => {
      if (typeof value == "string") {
        return expectFloat32(parseNumber(value));
      }
      return expectFloat32(value);
    }, "strictParseFloat32");
    NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
    parseNumber = /* @__PURE__ */ __name2((value) => {
      const matches = value.match(NUMBER_REGEX);
      if (matches === null || matches[0].length !== value.length) {
        throw new TypeError(`Expected real number, got implicit NaN`);
      }
      return parseFloat(value);
    }, "parseNumber");
    strictParseShort = /* @__PURE__ */ __name2((value) => {
      if (typeof value === "string") {
        return expectShort(parseNumber(value));
      }
      return expectShort(value);
    }, "strictParseShort");
    strictParseByte = /* @__PURE__ */ __name2((value) => {
      if (typeof value === "string") {
        return expectByte(parseNumber(value));
      }
      return expectByte(value);
    }, "strictParseByte");
    stackTraceWarning = /* @__PURE__ */ __name2((message) => {
      return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s2) => !s2.includes("stackTraceWarning")).join("\n");
    }, "stackTraceWarning");
    logger = {
      warn: console.warn
    };
  }
});
function dateToUtcString(date2) {
  const year2 = date2.getUTCFullYear();
  const month = date2.getUTCMonth();
  const dayOfWeek = date2.getUTCDay();
  const dayOfMonthInt = date2.getUTCDate();
  const hoursInt = date2.getUTCHours();
  const minutesInt = date2.getUTCMinutes();
  const secondsInt = date2.getUTCSeconds();
  const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
  const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
  const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
  const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
  return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year2} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
__name(dateToUtcString, "dateToUtcString");
var DAYS;
var MONTHS;
var RFC3339;
var RFC3339_WITH_OFFSET;
var IMF_FIXDATE;
var RFC_850_DATE;
var ASC_TIME;
var parseRfc7231DateTime;
var buildDate;
var parseTwoDigitYear;
var FIFTY_YEARS_IN_MILLIS;
var adjustRfc850Year;
var parseMonthByShortName;
var DAYS_IN_MONTH;
var validateDayOfMonth;
var isLeapYear;
var parseDateValue;
var parseMilliseconds;
var stripLeadingZeroes;
var init_date_utils = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_parse_utils();
    DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    __name2(dateToUtcString, "dateToUtcString");
    RFC3339 = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
    RFC3339_WITH_OFFSET = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}\:\d{2})|[zZ])$/);
    IMF_FIXDATE = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
    RFC_850_DATE = new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
    ASC_TIME = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
    parseRfc7231DateTime = /* @__PURE__ */ __name2((value) => {
      if (value === null || value === void 0) {
        return void 0;
      }
      if (typeof value !== "string") {
        throw new TypeError("RFC-7231 date-times must be expressed as strings");
      }
      let match2 = IMF_FIXDATE.exec(value);
      if (match2) {
        const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match2;
        return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
      }
      match2 = RFC_850_DATE.exec(value);
      if (match2) {
        const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match2;
        return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
          hours,
          minutes,
          seconds,
          fractionalMilliseconds
        }));
      }
      match2 = ASC_TIME.exec(value);
      if (match2) {
        const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match2;
        return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
      }
      throw new TypeError("Invalid RFC-7231 date-time value");
    }, "parseRfc7231DateTime");
    buildDate = /* @__PURE__ */ __name2((year2, month, day, time2) => {
      const adjustedMonth = month - 1;
      validateDayOfMonth(year2, adjustedMonth, day);
      return new Date(Date.UTC(year2, adjustedMonth, day, parseDateValue(time2.hours, "hour", 0, 23), parseDateValue(time2.minutes, "minute", 0, 59), parseDateValue(time2.seconds, "seconds", 0, 60), parseMilliseconds(time2.fractionalMilliseconds)));
    }, "buildDate");
    parseTwoDigitYear = /* @__PURE__ */ __name2((value) => {
      const thisYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
      const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
      if (valueInThisCentury < thisYear) {
        return valueInThisCentury + 100;
      }
      return valueInThisCentury;
    }, "parseTwoDigitYear");
    FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1e3;
    adjustRfc850Year = /* @__PURE__ */ __name2((input) => {
      if (input.getTime() - (/* @__PURE__ */ new Date()).getTime() > FIFTY_YEARS_IN_MILLIS) {
        return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
      }
      return input;
    }, "adjustRfc850Year");
    parseMonthByShortName = /* @__PURE__ */ __name2((value) => {
      const monthIdx = MONTHS.indexOf(value);
      if (monthIdx < 0) {
        throw new TypeError(`Invalid month: ${value}`);
      }
      return monthIdx + 1;
    }, "parseMonthByShortName");
    DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    validateDayOfMonth = /* @__PURE__ */ __name2((year2, month, day) => {
      let maxDays = DAYS_IN_MONTH[month];
      if (month === 1 && isLeapYear(year2)) {
        maxDays = 29;
      }
      if (day > maxDays) {
        throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year2}: ${day}`);
      }
    }, "validateDayOfMonth");
    isLeapYear = /* @__PURE__ */ __name2((year2) => {
      return year2 % 4 === 0 && (year2 % 100 !== 0 || year2 % 400 === 0);
    }, "isLeapYear");
    parseDateValue = /* @__PURE__ */ __name2((value, type, lower, upper) => {
      const dateVal = strictParseByte(stripLeadingZeroes(value));
      if (dateVal < lower || dateVal > upper) {
        throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
      }
      return dateVal;
    }, "parseDateValue");
    parseMilliseconds = /* @__PURE__ */ __name2((value) => {
      if (value === null || value === void 0) {
        return 0;
      }
      return strictParseFloat32("0." + value) * 1e3;
    }, "parseMilliseconds");
    stripLeadingZeroes = /* @__PURE__ */ __name2((value) => {
      let idx = 0;
      while (idx < value.length - 1 && value.charAt(idx) === "0") {
        idx++;
      }
      if (idx === 0) {
        return value;
      }
      return value.slice(idx);
    }, "stripLeadingZeroes");
  }
});
var randomUUID;
var init_randomUUID_browser = __esm({
  "../node_modules/@smithy/uuid/dist-es/randomUUID.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  }
});
var decimalToHex;
var v4;
var init_v4 = __esm({
  "../node_modules/@smithy/uuid/dist-es/v4.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_randomUUID_browser();
    decimalToHex = Array.from({ length: 256 }, (_, i2) => i2.toString(16).padStart(2, "0"));
    v4 = /* @__PURE__ */ __name2(() => {
      if (randomUUID) {
        return randomUUID();
      }
      const rnds = new Uint8Array(16);
      crypto.getRandomValues(rnds);
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      return decimalToHex[rnds[0]] + decimalToHex[rnds[1]] + decimalToHex[rnds[2]] + decimalToHex[rnds[3]] + "-" + decimalToHex[rnds[4]] + decimalToHex[rnds[5]] + "-" + decimalToHex[rnds[6]] + decimalToHex[rnds[7]] + "-" + decimalToHex[rnds[8]] + decimalToHex[rnds[9]] + "-" + decimalToHex[rnds[10]] + decimalToHex[rnds[11]] + decimalToHex[rnds[12]] + decimalToHex[rnds[13]] + decimalToHex[rnds[14]] + decimalToHex[rnds[15]];
    }, "v4");
  }
});
var init_dist_es13 = __esm({
  "../node_modules/@smithy/uuid/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_v4();
  }
});
var init_generateIdempotencyToken = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/generateIdempotencyToken.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es13();
  }
});
var LazyJsonString;
var init_lazy_json = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/lazy-json.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    LazyJsonString = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function LazyJsonString2(val) {
      const str = Object.assign(new String(val), {
        deserializeJSON() {
          return JSON.parse(String(val));
        },
        toString() {
          return String(val);
        },
        toJSON() {
          return String(val);
        }
      });
      return str;
    }, "LazyJsonString2"), "LazyJsonString");
    LazyJsonString.from = (object) => {
      if (object && typeof object === "object" && (object instanceof LazyJsonString || "deserializeJSON" in object)) {
        return object;
      } else if (typeof object === "string" || Object.getPrototypeOf(object) === String.prototype) {
        return LazyJsonString(String(object));
      }
      return LazyJsonString(JSON.stringify(object));
    };
    LazyJsonString.fromObject = LazyJsonString.from;
  }
});
function quoteHeader(part) {
  if (part.includes(",") || part.includes('"')) {
    part = `"${part.replace(/"/g, '\\"')}"`;
  }
  return part;
}
__name(quoteHeader, "quoteHeader");
var init_quote_header = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/quote-header.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(quoteHeader, "quoteHeader");
  }
});
function range(v2, min, max) {
  const _v = Number(v2);
  if (_v < min || _v > max) {
    throw new Error(`Value ${_v} out of range [${min}, ${max}]`);
  }
}
__name(range, "range");
var ddd;
var mmm;
var time;
var date;
var year;
var RFC3339_WITH_OFFSET2;
var IMF_FIXDATE2;
var RFC_850_DATE2;
var ASC_TIME2;
var months;
var _parseEpochTimestamp;
var _parseRfc3339DateTimeWithOffset;
var _parseRfc7231DateTime;
var init_schema_date_utils = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/schema-serde-lib/schema-date-utils.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    ddd = `(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:[ne|u?r]?s?day)?`;
    mmm = `(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)`;
    time = `(\\d?\\d):(\\d{2}):(\\d{2})(?:\\.(\\d+))?`;
    date = `(\\d?\\d)`;
    year = `(\\d{4})`;
    RFC3339_WITH_OFFSET2 = new RegExp(/^(\d{4})-(\d\d)-(\d\d)[tT](\d\d):(\d\d):(\d\d)(\.(\d+))?(([-+]\d\d:\d\d)|[zZ])$/);
    IMF_FIXDATE2 = new RegExp(`^${ddd}, ${date} ${mmm} ${year} ${time} GMT$`);
    RFC_850_DATE2 = new RegExp(`^${ddd}, ${date}-${mmm}-(\\d\\d) ${time} GMT$`);
    ASC_TIME2 = new RegExp(`^${ddd} ${mmm} ( [1-9]|\\d\\d) ${time} ${year}$`);
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    _parseEpochTimestamp = /* @__PURE__ */ __name2((value) => {
      if (value == null) {
        return void 0;
      }
      let num = NaN;
      if (typeof value === "number") {
        num = value;
      } else if (typeof value === "string") {
        if (!/^-?\d*\.?\d+$/.test(value)) {
          throw new TypeError(`parseEpochTimestamp - numeric string invalid.`);
        }
        num = Number.parseFloat(value);
      } else if (typeof value === "object" && value.tag === 1) {
        num = value.value;
      }
      if (isNaN(num) || Math.abs(num) === Infinity) {
        throw new TypeError("Epoch timestamps must be valid finite numbers.");
      }
      return new Date(Math.round(num * 1e3));
    }, "_parseEpochTimestamp");
    _parseRfc3339DateTimeWithOffset = /* @__PURE__ */ __name2((value) => {
      if (value == null) {
        return void 0;
      }
      if (typeof value !== "string") {
        throw new TypeError("RFC3339 timestamps must be strings");
      }
      const matches = RFC3339_WITH_OFFSET2.exec(value);
      if (!matches) {
        throw new TypeError(`Invalid RFC3339 timestamp format ${value}`);
      }
      const [, yearStr, monthStr, dayStr, hours, minutes, seconds, , ms, offsetStr] = matches;
      range(monthStr, 1, 12);
      range(dayStr, 1, 31);
      range(hours, 0, 23);
      range(minutes, 0, 59);
      range(seconds, 0, 60);
      const date2 = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr), Number(hours), Number(minutes), Number(seconds), Number(ms) ? Math.round(parseFloat(`0.${ms}`) * 1e3) : 0));
      date2.setUTCFullYear(Number(yearStr));
      if (offsetStr.toUpperCase() != "Z") {
        const [, sign2, offsetH, offsetM] = /([+-])(\d\d):(\d\d)/.exec(offsetStr) || [void 0, "+", 0, 0];
        const scalar = sign2 === "-" ? 1 : -1;
        date2.setTime(date2.getTime() + scalar * (Number(offsetH) * 60 * 60 * 1e3 + Number(offsetM) * 60 * 1e3));
      }
      return date2;
    }, "_parseRfc3339DateTimeWithOffset");
    _parseRfc7231DateTime = /* @__PURE__ */ __name2((value) => {
      if (value == null) {
        return void 0;
      }
      if (typeof value !== "string") {
        throw new TypeError("RFC7231 timestamps must be strings.");
      }
      let day;
      let month;
      let year2;
      let hour;
      let minute;
      let second;
      let fraction;
      let matches;
      if (matches = IMF_FIXDATE2.exec(value)) {
        [, day, month, year2, hour, minute, second, fraction] = matches;
      } else if (matches = RFC_850_DATE2.exec(value)) {
        [, day, month, year2, hour, minute, second, fraction] = matches;
        year2 = (Number(year2) + 1900).toString();
      } else if (matches = ASC_TIME2.exec(value)) {
        [, month, day, hour, minute, second, fraction, year2] = matches;
      }
      if (year2 && second) {
        const timestamp = Date.UTC(Number(year2), months.indexOf(month), Number(day), Number(hour), Number(minute), Number(second), fraction ? Math.round(parseFloat(`0.${fraction}`) * 1e3) : 0);
        range(day, 1, 31);
        range(hour, 0, 23);
        range(minute, 0, 59);
        range(second, 0, 60);
        const date2 = new Date(timestamp);
        date2.setUTCFullYear(Number(year2));
        return date2;
      }
      throw new TypeError(`Invalid RFC7231 date-time value ${value}.`);
    }, "_parseRfc7231DateTime");
    __name2(range, "range");
  }
});
function splitEvery(value, delimiter, numDelimiters) {
  if (numDelimiters <= 0 || !Number.isInteger(numDelimiters)) {
    throw new Error("Invalid number of delimiters (" + numDelimiters + ") for splitEvery.");
  }
  const segments = value.split(delimiter);
  if (numDelimiters === 1) {
    return segments;
  }
  const compoundSegments = [];
  let currentSegment = "";
  for (let i2 = 0; i2 < segments.length; i2++) {
    if (currentSegment === "") {
      currentSegment = segments[i2];
    } else {
      currentSegment += delimiter + segments[i2];
    }
    if ((i2 + 1) % numDelimiters === 0) {
      compoundSegments.push(currentSegment);
      currentSegment = "";
    }
  }
  if (currentSegment !== "") {
    compoundSegments.push(currentSegment);
  }
  return compoundSegments;
}
__name(splitEvery, "splitEvery");
var init_split_every = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/split-every.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(splitEvery, "splitEvery");
  }
});
var splitHeader;
var init_split_header = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/split-header.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    splitHeader = /* @__PURE__ */ __name2((value) => {
      const z2 = value.length;
      const values = [];
      let withinQuotes = false;
      let prevChar = void 0;
      let anchor = 0;
      for (let i2 = 0; i2 < z2; ++i2) {
        const char = value[i2];
        switch (char) {
          case `"`:
            if (prevChar !== "\\") {
              withinQuotes = !withinQuotes;
            }
            break;
          case ",":
            if (!withinQuotes) {
              values.push(value.slice(anchor, i2));
              anchor = i2 + 1;
            }
            break;
          default:
        }
        prevChar = char;
      }
      values.push(value.slice(anchor));
      return values.map((v2) => {
        v2 = v2.trim();
        const z3 = v2.length;
        if (z3 < 2) {
          return v2;
        }
        if (v2[0] === `"` && v2[z3 - 1] === `"`) {
          v2 = v2.slice(1, z3 - 1);
        }
        return v2.replace(/\\"/g, '"');
      });
    }, "splitHeader");
  }
});
var format;
var NumericValue;
var init_NumericValue = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/value/NumericValue.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    format = /^-?\d*(\.\d+)?$/;
    NumericValue = class _NumericValue {
      static {
        __name(this, "_NumericValue");
      }
      static {
        __name2(this, "NumericValue");
      }
      string;
      type;
      constructor(string, type) {
        this.string = string;
        this.type = type;
        if (!format.test(string)) {
          throw new Error(`@smithy/core/serde - NumericValue must only contain [0-9], at most one decimal point ".", and an optional negation prefix "-".`);
        }
      }
      toString() {
        return this.string;
      }
      static [Symbol.hasInstance](object) {
        if (!object || typeof object !== "object") {
          return false;
        }
        const _nv = object;
        return _NumericValue.prototype.isPrototypeOf(object) || _nv.type === "bigDecimal" && format.test(_nv.string);
      }
    };
  }
});
var init_serde2 = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/serde/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_copyDocumentWithTransform();
    init_date_utils();
    init_generateIdempotencyToken();
    init_lazy_json();
    init_parse_utils();
    init_quote_header();
    init_schema_date_utils();
    init_split_every();
    init_split_header();
    init_NumericValue();
  }
});
var SerdeContext;
var init_SerdeContext = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/SerdeContext.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SerdeContext = class {
      static {
        __name(this, "SerdeContext");
      }
      static {
        __name2(this, "SerdeContext");
      }
      serdeContext;
      setSerdeContext(serdeContext) {
        this.serdeContext = serdeContext;
      }
    };
  }
});
var EventStreamSerde;
var init_EventStreamSerde = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/event-streams/EventStreamSerde.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es6();
    EventStreamSerde = class {
      static {
        __name(this, "EventStreamSerde");
      }
      static {
        __name2(this, "EventStreamSerde");
      }
      marshaller;
      serializer;
      deserializer;
      serdeContext;
      defaultContentType;
      constructor({ marshaller, serializer, deserializer, serdeContext, defaultContentType }) {
        this.marshaller = marshaller;
        this.serializer = serializer;
        this.deserializer = deserializer;
        this.serdeContext = serdeContext;
        this.defaultContentType = defaultContentType;
      }
      async serializeEventStream({ eventStream, requestSchema, initialRequest }) {
        const marshaller = this.marshaller;
        const eventStreamMember = requestSchema.getEventStreamMember();
        const unionSchema = requestSchema.getMemberSchema(eventStreamMember);
        const serializer = this.serializer;
        const defaultContentType = this.defaultContentType;
        const initialRequestMarker = Symbol("initialRequestMarker");
        const eventStreamIterable = {
          async *[Symbol.asyncIterator]() {
            if (initialRequest) {
              const headers = {
                ":event-type": { type: "string", value: "initial-request" },
                ":message-type": { type: "string", value: "event" },
                ":content-type": { type: "string", value: defaultContentType }
              };
              serializer.write(requestSchema, initialRequest);
              const body = serializer.flush();
              yield {
                [initialRequestMarker]: true,
                headers,
                body
              };
            }
            for await (const page of eventStream) {
              yield page;
            }
          }
        };
        return marshaller.serialize(eventStreamIterable, (event) => {
          if (event[initialRequestMarker]) {
            return {
              headers: event.headers,
              body: event.body
            };
          }
          const unionMember = Object.keys(event).find((key) => {
            return key !== "__type";
          }) ?? "";
          const { additionalHeaders, body, eventType, explicitPayloadContentType } = this.writeEventBody(unionMember, unionSchema, event);
          const headers = {
            ":event-type": { type: "string", value: eventType },
            ":message-type": { type: "string", value: "event" },
            ":content-type": { type: "string", value: explicitPayloadContentType ?? defaultContentType },
            ...additionalHeaders
          };
          return {
            headers,
            body
          };
        });
      }
      async deserializeEventStream({ response, responseSchema, initialResponseContainer }) {
        const marshaller = this.marshaller;
        const eventStreamMember = responseSchema.getEventStreamMember();
        const unionSchema = responseSchema.getMemberSchema(eventStreamMember);
        const memberSchemas = unionSchema.getMemberSchemas();
        const initialResponseMarker = Symbol("initialResponseMarker");
        const asyncIterable = marshaller.deserialize(response.body, async (event) => {
          const unionMember = Object.keys(event).find((key) => {
            return key !== "__type";
          }) ?? "";
          const body = event[unionMember].body;
          if (unionMember === "initial-response") {
            const dataObject = await this.deserializer.read(responseSchema, body);
            delete dataObject[eventStreamMember];
            return {
              [initialResponseMarker]: true,
              ...dataObject
            };
          } else if (unionMember in memberSchemas) {
            const eventStreamSchema = memberSchemas[unionMember];
            if (eventStreamSchema.isStructSchema()) {
              const out = {};
              let hasBindings = false;
              for (const [name, member2] of eventStreamSchema.structIterator()) {
                const { eventHeader, eventPayload } = member2.getMergedTraits();
                hasBindings = hasBindings || Boolean(eventHeader || eventPayload);
                if (eventPayload) {
                  if (member2.isBlobSchema()) {
                    out[name] = body;
                  } else if (member2.isStringSchema()) {
                    out[name] = (this.serdeContext?.utf8Encoder ?? toUtf8)(body);
                  } else if (member2.isStructSchema()) {
                    out[name] = await this.deserializer.read(member2, body);
                  }
                } else if (eventHeader) {
                  const value = event[unionMember].headers[name]?.value;
                  if (value != null) {
                    if (member2.isNumericSchema()) {
                      if (value && typeof value === "object" && "bytes" in value) {
                        out[name] = BigInt(value.toString());
                      } else {
                        out[name] = Number(value);
                      }
                    } else {
                      out[name] = value;
                    }
                  }
                }
              }
              if (hasBindings) {
                return {
                  [unionMember]: out
                };
              }
              if (body.byteLength === 0) {
                return {
                  [unionMember]: {}
                };
              }
            }
            return {
              [unionMember]: await this.deserializer.read(eventStreamSchema, body)
            };
          } else {
            return {
              $unknown: event
            };
          }
        });
        const asyncIterator = asyncIterable[Symbol.asyncIterator]();
        const firstEvent = await asyncIterator.next();
        if (firstEvent.done) {
          return asyncIterable;
        }
        if (firstEvent.value?.[initialResponseMarker]) {
          if (!responseSchema) {
            throw new Error("@smithy::core/protocols - initial-response event encountered in event stream but no response schema given.");
          }
          for (const [key, value] of Object.entries(firstEvent.value)) {
            initialResponseContainer[key] = value;
          }
        }
        return {
          async *[Symbol.asyncIterator]() {
            if (!firstEvent?.value?.[initialResponseMarker]) {
              yield firstEvent.value;
            }
            while (true) {
              const { done, value } = await asyncIterator.next();
              if (done) {
                break;
              }
              yield value;
            }
          }
        };
      }
      writeEventBody(unionMember, unionSchema, event) {
        const serializer = this.serializer;
        let eventType = unionMember;
        let explicitPayloadMember = null;
        let explicitPayloadContentType;
        const isKnownSchema = (() => {
          const struct = unionSchema.getSchema();
          return struct[4].includes(unionMember);
        })();
        const additionalHeaders = {};
        if (!isKnownSchema) {
          const [type, value] = event[unionMember];
          eventType = type;
          serializer.write(15, value);
        } else {
          const eventSchema = unionSchema.getMemberSchema(unionMember);
          if (eventSchema.isStructSchema()) {
            for (const [memberName, memberSchema] of eventSchema.structIterator()) {
              const { eventHeader, eventPayload } = memberSchema.getMergedTraits();
              if (eventPayload) {
                explicitPayloadMember = memberName;
              } else if (eventHeader) {
                const value = event[unionMember][memberName];
                let type = "binary";
                if (memberSchema.isNumericSchema()) {
                  if ((-2) ** 31 <= value && value <= 2 ** 31 - 1) {
                    type = "integer";
                  } else {
                    type = "long";
                  }
                } else if (memberSchema.isTimestampSchema()) {
                  type = "timestamp";
                } else if (memberSchema.isStringSchema()) {
                  type = "string";
                } else if (memberSchema.isBooleanSchema()) {
                  type = "boolean";
                }
                if (value != null) {
                  additionalHeaders[memberName] = {
                    type,
                    value
                  };
                  delete event[unionMember][memberName];
                }
              }
            }
            if (explicitPayloadMember !== null) {
              const payloadSchema = eventSchema.getMemberSchema(explicitPayloadMember);
              if (payloadSchema.isBlobSchema()) {
                explicitPayloadContentType = "application/octet-stream";
              } else if (payloadSchema.isStringSchema()) {
                explicitPayloadContentType = "text/plain";
              }
              serializer.write(payloadSchema, event[unionMember][explicitPayloadMember]);
            } else {
              serializer.write(eventSchema, event[unionMember]);
            }
          } else {
            throw new Error("@smithy/core/event-streams - non-struct member not supported in event stream union.");
          }
        }
        const messageSerialization = serializer.flush();
        const body = typeof messageSerialization === "string" ? (this.serdeContext?.utf8Decoder ?? fromUtf8)(messageSerialization) : messageSerialization;
        return {
          body,
          eventType,
          explicitPayloadContentType,
          additionalHeaders
        };
      }
    };
  }
});
var event_streams_exports = {};
__export(event_streams_exports, {
  EventStreamSerde: /* @__PURE__ */ __name(() => EventStreamSerde, "EventStreamSerde")
});
var init_event_streams = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/event-streams/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EventStreamSerde();
  }
});
var HttpProtocol;
var init_HttpProtocol = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/HttpProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_dist_es2();
    init_SerdeContext();
    HttpProtocol = class extends SerdeContext {
      static {
        __name(this, "HttpProtocol");
      }
      static {
        __name2(this, "HttpProtocol");
      }
      options;
      constructor(options) {
        super();
        this.options = options;
      }
      getRequestType() {
        return HttpRequest;
      }
      getResponseType() {
        return HttpResponse;
      }
      setSerdeContext(serdeContext) {
        this.serdeContext = serdeContext;
        this.serializer.setSerdeContext(serdeContext);
        this.deserializer.setSerdeContext(serdeContext);
        if (this.getPayloadCodec()) {
          this.getPayloadCodec().setSerdeContext(serdeContext);
        }
      }
      updateServiceEndpoint(request, endpoint) {
        if ("url" in endpoint) {
          request.protocol = endpoint.url.protocol;
          request.hostname = endpoint.url.hostname;
          request.port = endpoint.url.port ? Number(endpoint.url.port) : void 0;
          request.path = endpoint.url.pathname;
          request.fragment = endpoint.url.hash || void 0;
          request.username = endpoint.url.username || void 0;
          request.password = endpoint.url.password || void 0;
          if (!request.query) {
            request.query = {};
          }
          for (const [k2, v2] of endpoint.url.searchParams.entries()) {
            request.query[k2] = v2;
          }
          return request;
        } else {
          request.protocol = endpoint.protocol;
          request.hostname = endpoint.hostname;
          request.port = endpoint.port ? Number(endpoint.port) : void 0;
          request.path = endpoint.path;
          request.query = {
            ...endpoint.query
          };
          return request;
        }
      }
      setHostPrefix(request, operationSchema, input) {
        if (this.serdeContext?.disableHostPrefix) {
          return;
        }
        const inputNs = NormalizedSchema.of(operationSchema.input);
        const opTraits = translateTraits(operationSchema.traits ?? {});
        if (opTraits.endpoint) {
          let hostPrefix = opTraits.endpoint?.[0];
          if (typeof hostPrefix === "string") {
            const hostLabelInputs = [...inputNs.structIterator()].filter(([, member2]) => member2.getMergedTraits().hostLabel);
            for (const [name] of hostLabelInputs) {
              const replacement = input[name];
              if (typeof replacement !== "string") {
                throw new Error(`@smithy/core/schema - ${name} in input must be a string as hostLabel.`);
              }
              hostPrefix = hostPrefix.replace(`{${name}}`, replacement);
            }
            request.hostname = hostPrefix + request.hostname;
          }
        }
      }
      deserializeMetadata(output) {
        return {
          httpStatusCode: output.statusCode,
          requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
          extendedRequestId: output.headers["x-amz-id-2"],
          cfId: output.headers["x-amz-cf-id"]
        };
      }
      async serializeEventStream({ eventStream, requestSchema, initialRequest }) {
        const eventStreamSerde = await this.loadEventStreamCapability();
        return eventStreamSerde.serializeEventStream({
          eventStream,
          requestSchema,
          initialRequest
        });
      }
      async deserializeEventStream({ response, responseSchema, initialResponseContainer }) {
        const eventStreamSerde = await this.loadEventStreamCapability();
        return eventStreamSerde.deserializeEventStream({
          response,
          responseSchema,
          initialResponseContainer
        });
      }
      async loadEventStreamCapability() {
        const { EventStreamSerde: EventStreamSerde2 } = await Promise.resolve().then(() => (init_event_streams(), event_streams_exports));
        return new EventStreamSerde2({
          marshaller: this.getEventStreamMarshaller(),
          serializer: this.serializer,
          deserializer: this.deserializer,
          serdeContext: this.serdeContext,
          defaultContentType: this.getDefaultContentType()
        });
      }
      getDefaultContentType() {
        throw new Error(`@smithy/core/protocols - ${this.constructor.name} getDefaultContentType() implementation missing.`);
      }
      async deserializeHttpMessage(schema, context, response, arg4, arg5) {
        void schema;
        void context;
        void response;
        void arg4;
        void arg5;
        return [];
      }
      getEventStreamMarshaller() {
        const context = this.serdeContext;
        if (!context.eventStreamMarshaller) {
          throw new Error("@smithy/core - HttpProtocol: eventStreamMarshaller missing in serdeContext.");
        }
        return context.eventStreamMarshaller;
      }
    };
  }
});
var HttpBindingProtocol;
var init_HttpBindingProtocol = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/HttpBindingProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_serde2();
    init_dist_es2();
    init_dist_es12();
    init_collect_stream_body();
    init_extended_encode_uri_component();
    init_HttpProtocol();
    HttpBindingProtocol = class extends HttpProtocol {
      static {
        __name(this, "HttpBindingProtocol");
      }
      static {
        __name2(this, "HttpBindingProtocol");
      }
      async serializeRequest(operationSchema, _input, context) {
        const input = {
          ..._input ?? {}
        };
        const serializer = this.serializer;
        const query = {};
        const headers = {};
        const endpoint = await context.endpoint();
        const ns = NormalizedSchema.of(operationSchema?.input);
        const schema = ns.getSchema();
        let hasNonHttpBindingMember = false;
        let payload;
        const request = new HttpRequest({
          protocol: "",
          hostname: "",
          port: void 0,
          path: "",
          fragment: void 0,
          query,
          headers,
          body: void 0
        });
        if (endpoint) {
          this.updateServiceEndpoint(request, endpoint);
          this.setHostPrefix(request, operationSchema, input);
          const opTraits = translateTraits(operationSchema.traits);
          if (opTraits.http) {
            request.method = opTraits.http[0];
            const [path, search] = opTraits.http[1].split("?");
            if (request.path == "/") {
              request.path = path;
            } else {
              request.path += path;
            }
            const traitSearchParams = new URLSearchParams(search ?? "");
            Object.assign(query, Object.fromEntries(traitSearchParams));
          }
        }
        for (const [memberName, memberNs] of ns.structIterator()) {
          const memberTraits = memberNs.getMergedTraits() ?? {};
          const inputMemberValue = input[memberName];
          if (inputMemberValue == null && !memberNs.isIdempotencyToken()) {
            if (memberTraits.httpLabel) {
              if (request.path.includes(`{${memberName}+}`) || request.path.includes(`{${memberName}}`)) {
                throw new Error(`No value provided for input HTTP label: ${memberName}.`);
              }
            }
            continue;
          }
          if (memberTraits.httpPayload) {
            const isStreaming2 = memberNs.isStreaming();
            if (isStreaming2) {
              const isEventStream = memberNs.isStructSchema();
              if (isEventStream) {
                if (input[memberName]) {
                  payload = await this.serializeEventStream({
                    eventStream: input[memberName],
                    requestSchema: ns
                  });
                }
              } else {
                payload = inputMemberValue;
              }
            } else {
              serializer.write(memberNs, inputMemberValue);
              payload = serializer.flush();
            }
            delete input[memberName];
          } else if (memberTraits.httpLabel) {
            serializer.write(memberNs, inputMemberValue);
            const replacement = serializer.flush();
            if (request.path.includes(`{${memberName}+}`)) {
              request.path = request.path.replace(`{${memberName}+}`, replacement.split("/").map(extendedEncodeURIComponent).join("/"));
            } else if (request.path.includes(`{${memberName}}`)) {
              request.path = request.path.replace(`{${memberName}}`, extendedEncodeURIComponent(replacement));
            }
            delete input[memberName];
          } else if (memberTraits.httpHeader) {
            serializer.write(memberNs, inputMemberValue);
            headers[memberTraits.httpHeader.toLowerCase()] = String(serializer.flush());
            delete input[memberName];
          } else if (typeof memberTraits.httpPrefixHeaders === "string") {
            for (const [key, val] of Object.entries(inputMemberValue)) {
              const amalgam = memberTraits.httpPrefixHeaders + key;
              serializer.write([memberNs.getValueSchema(), { httpHeader: amalgam }], val);
              headers[amalgam.toLowerCase()] = serializer.flush();
            }
            delete input[memberName];
          } else if (memberTraits.httpQuery || memberTraits.httpQueryParams) {
            this.serializeQuery(memberNs, inputMemberValue, query);
            delete input[memberName];
          } else {
            hasNonHttpBindingMember = true;
          }
        }
        if (hasNonHttpBindingMember && input) {
          serializer.write(schema, input);
          payload = serializer.flush();
        }
        request.headers = headers;
        request.query = query;
        request.body = payload;
        return request;
      }
      serializeQuery(ns, data, query) {
        const serializer = this.serializer;
        const traits = ns.getMergedTraits();
        if (traits.httpQueryParams) {
          for (const [key, val] of Object.entries(data)) {
            if (!(key in query)) {
              const valueSchema = ns.getValueSchema();
              Object.assign(valueSchema.getMergedTraits(), {
                ...traits,
                httpQuery: key,
                httpQueryParams: void 0
              });
              this.serializeQuery(valueSchema, val, query);
            }
          }
          return;
        }
        if (ns.isListSchema()) {
          const sparse = !!ns.getMergedTraits().sparse;
          const buffer = [];
          for (const item of data) {
            serializer.write([ns.getValueSchema(), traits], item);
            const serializable = serializer.flush();
            if (sparse || serializable !== void 0) {
              buffer.push(serializable);
            }
          }
          query[traits.httpQuery] = buffer;
        } else {
          serializer.write([ns, traits], data);
          query[traits.httpQuery] = serializer.flush();
        }
      }
      async deserializeResponse(operationSchema, context, response) {
        const deserializer = this.deserializer;
        const ns = NormalizedSchema.of(operationSchema.output);
        const dataObject = {};
        if (response.statusCode >= 300) {
          const bytes = await collectBody(response.body, context);
          if (bytes.byteLength > 0) {
            Object.assign(dataObject, await deserializer.read(15, bytes));
          }
          await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
          throw new Error("@smithy/core/protocols - HTTP Protocol error handler failed to throw.");
        }
        for (const header in response.headers) {
          const value = response.headers[header];
          delete response.headers[header];
          response.headers[header.toLowerCase()] = value;
        }
        const nonHttpBindingMembers = await this.deserializeHttpMessage(ns, context, response, dataObject);
        if (nonHttpBindingMembers.length) {
          const bytes = await collectBody(response.body, context);
          if (bytes.byteLength > 0) {
            const dataFromBody = await deserializer.read(ns, bytes);
            for (const member2 of nonHttpBindingMembers) {
              dataObject[member2] = dataFromBody[member2];
            }
          }
        } else if (nonHttpBindingMembers.discardResponseBody) {
          await collectBody(response.body, context);
        }
        dataObject.$metadata = this.deserializeMetadata(response);
        return dataObject;
      }
      async deserializeHttpMessage(schema, context, response, arg4, arg5) {
        let dataObject;
        if (arg4 instanceof Set) {
          dataObject = arg5;
        } else {
          dataObject = arg4;
        }
        let discardResponseBody = true;
        const deserializer = this.deserializer;
        const ns = NormalizedSchema.of(schema);
        const nonHttpBindingMembers = [];
        for (const [memberName, memberSchema] of ns.structIterator()) {
          const memberTraits = memberSchema.getMemberTraits();
          if (memberTraits.httpPayload) {
            discardResponseBody = false;
            const isStreaming2 = memberSchema.isStreaming();
            if (isStreaming2) {
              const isEventStream = memberSchema.isStructSchema();
              if (isEventStream) {
                dataObject[memberName] = await this.deserializeEventStream({
                  response,
                  responseSchema: ns
                });
              } else {
                dataObject[memberName] = sdkStreamMixin(response.body);
              }
            } else if (response.body) {
              const bytes = await collectBody(response.body, context);
              if (bytes.byteLength > 0) {
                dataObject[memberName] = await deserializer.read(memberSchema, bytes);
              }
            }
          } else if (memberTraits.httpHeader) {
            const key = String(memberTraits.httpHeader).toLowerCase();
            const value = response.headers[key];
            if (null != value) {
              if (memberSchema.isListSchema()) {
                const headerListValueSchema = memberSchema.getValueSchema();
                headerListValueSchema.getMergedTraits().httpHeader = key;
                let sections;
                if (headerListValueSchema.isTimestampSchema() && headerListValueSchema.getSchema() === 4) {
                  sections = splitEvery(value, ",", 2);
                } else {
                  sections = splitHeader(value);
                }
                const list = [];
                for (const section of sections) {
                  list.push(await deserializer.read(headerListValueSchema, section.trim()));
                }
                dataObject[memberName] = list;
              } else {
                dataObject[memberName] = await deserializer.read(memberSchema, value);
              }
            }
          } else if (memberTraits.httpPrefixHeaders !== void 0) {
            dataObject[memberName] = {};
            for (const [header, value] of Object.entries(response.headers)) {
              if (header.startsWith(memberTraits.httpPrefixHeaders)) {
                const valueSchema = memberSchema.getValueSchema();
                valueSchema.getMergedTraits().httpHeader = header;
                dataObject[memberName][header.slice(memberTraits.httpPrefixHeaders.length)] = await deserializer.read(valueSchema, value);
              }
            }
          } else if (memberTraits.httpResponseCode) {
            dataObject[memberName] = response.statusCode;
          } else {
            nonHttpBindingMembers.push(memberName);
          }
        }
        nonHttpBindingMembers.discardResponseBody = discardResponseBody;
        return nonHttpBindingMembers;
      }
    };
  }
});
var init_RpcProtocol = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/RpcProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_resolve_path = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/resolve-path.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_requestBuilder = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/requestBuilder.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
function determineTimestampFormat(ns, settings) {
  if (settings.timestampFormat.useTrait) {
    if (ns.isTimestampSchema() && (ns.getSchema() === 5 || ns.getSchema() === 6 || ns.getSchema() === 7)) {
      return ns.getSchema();
    }
  }
  const { httpLabel, httpPrefixHeaders, httpHeader, httpQuery } = ns.getMergedTraits();
  const bindingFormat = settings.httpBindings ? typeof httpPrefixHeaders === "string" || Boolean(httpHeader) ? 6 : Boolean(httpQuery) || Boolean(httpLabel) ? 5 : void 0 : void 0;
  return bindingFormat ?? settings.timestampFormat.default;
}
__name(determineTimestampFormat, "determineTimestampFormat");
var init_determineTimestampFormat = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/serde/determineTimestampFormat.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(determineTimestampFormat, "determineTimestampFormat");
  }
});
var FromStringShapeDeserializer;
var init_FromStringShapeDeserializer = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/serde/FromStringShapeDeserializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_serde2();
    init_dist_es7();
    init_dist_es6();
    init_SerdeContext();
    init_determineTimestampFormat();
    FromStringShapeDeserializer = class extends SerdeContext {
      static {
        __name(this, "FromStringShapeDeserializer");
      }
      static {
        __name2(this, "FromStringShapeDeserializer");
      }
      settings;
      constructor(settings) {
        super();
        this.settings = settings;
      }
      read(_schema, data) {
        const ns = NormalizedSchema.of(_schema);
        if (ns.isListSchema()) {
          return splitHeader(data).map((item) => this.read(ns.getValueSchema(), item));
        }
        if (ns.isBlobSchema()) {
          return (this.serdeContext?.base64Decoder ?? fromBase64)(data);
        }
        if (ns.isTimestampSchema()) {
          const format2 = determineTimestampFormat(ns, this.settings);
          switch (format2) {
            case 5:
              return _parseRfc3339DateTimeWithOffset(data);
            case 6:
              return _parseRfc7231DateTime(data);
            case 7:
              return _parseEpochTimestamp(data);
            default:
              console.warn("Missing timestamp format, parsing value with Date constructor:", data);
              return new Date(data);
          }
        }
        if (ns.isStringSchema()) {
          const mediaType = ns.getMergedTraits().mediaType;
          let intermediateValue = data;
          if (mediaType) {
            if (ns.getMergedTraits().httpHeader) {
              intermediateValue = this.base64ToUtf8(intermediateValue);
            }
            const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
            if (isJson) {
              intermediateValue = LazyJsonString.from(intermediateValue);
            }
            return intermediateValue;
          }
        }
        if (ns.isNumericSchema()) {
          return Number(data);
        }
        if (ns.isBigIntegerSchema()) {
          return BigInt(data);
        }
        if (ns.isBigDecimalSchema()) {
          return new NumericValue(data, "bigDecimal");
        }
        if (ns.isBooleanSchema()) {
          return String(data).toLowerCase() === "true";
        }
        return data;
      }
      base64ToUtf8(base64String) {
        return (this.serdeContext?.utf8Encoder ?? toUtf8)((this.serdeContext?.base64Decoder ?? fromBase64)(base64String));
      }
    };
  }
});
var HttpInterceptingShapeDeserializer;
var init_HttpInterceptingShapeDeserializer = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeDeserializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_dist_es6();
    init_SerdeContext();
    init_FromStringShapeDeserializer();
    HttpInterceptingShapeDeserializer = class extends SerdeContext {
      static {
        __name(this, "HttpInterceptingShapeDeserializer");
      }
      static {
        __name2(this, "HttpInterceptingShapeDeserializer");
      }
      codecDeserializer;
      stringDeserializer;
      constructor(codecDeserializer, codecSettings) {
        super();
        this.codecDeserializer = codecDeserializer;
        this.stringDeserializer = new FromStringShapeDeserializer(codecSettings);
      }
      setSerdeContext(serdeContext) {
        this.stringDeserializer.setSerdeContext(serdeContext);
        this.codecDeserializer.setSerdeContext(serdeContext);
        this.serdeContext = serdeContext;
      }
      read(schema, data) {
        const ns = NormalizedSchema.of(schema);
        const traits = ns.getMergedTraits();
        const toString = this.serdeContext?.utf8Encoder ?? toUtf8;
        if (traits.httpHeader || traits.httpResponseCode) {
          return this.stringDeserializer.read(ns, toString(data));
        }
        if (traits.httpPayload) {
          if (ns.isBlobSchema()) {
            const toBytes = this.serdeContext?.utf8Decoder ?? fromUtf8;
            if (typeof data === "string") {
              return toBytes(data);
            }
            return data;
          } else if (ns.isStringSchema()) {
            if ("byteLength" in data) {
              return toString(data);
            }
            return data;
          }
        }
        return this.codecDeserializer.read(ns, data);
      }
    };
  }
});
var ToStringShapeSerializer;
var init_ToStringShapeSerializer = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/serde/ToStringShapeSerializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_serde2();
    init_dist_es7();
    init_SerdeContext();
    init_determineTimestampFormat();
    ToStringShapeSerializer = class extends SerdeContext {
      static {
        __name(this, "ToStringShapeSerializer");
      }
      static {
        __name2(this, "ToStringShapeSerializer");
      }
      settings;
      stringBuffer = "";
      constructor(settings) {
        super();
        this.settings = settings;
      }
      write(schema, value) {
        const ns = NormalizedSchema.of(schema);
        switch (typeof value) {
          case "object":
            if (value === null) {
              this.stringBuffer = "null";
              return;
            }
            if (ns.isTimestampSchema()) {
              if (!(value instanceof Date)) {
                throw new Error(`@smithy/core/protocols - received non-Date value ${value} when schema expected Date in ${ns.getName(true)}`);
              }
              const format2 = determineTimestampFormat(ns, this.settings);
              switch (format2) {
                case 5:
                  this.stringBuffer = value.toISOString().replace(".000Z", "Z");
                  break;
                case 6:
                  this.stringBuffer = dateToUtcString(value);
                  break;
                case 7:
                  this.stringBuffer = String(value.getTime() / 1e3);
                  break;
                default:
                  console.warn("Missing timestamp format, using epoch seconds", value);
                  this.stringBuffer = String(value.getTime() / 1e3);
              }
              return;
            }
            if (ns.isBlobSchema() && "byteLength" in value) {
              this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64)(value);
              return;
            }
            if (ns.isListSchema() && Array.isArray(value)) {
              let buffer = "";
              for (const item of value) {
                this.write([ns.getValueSchema(), ns.getMergedTraits()], item);
                const headerItem = this.flush();
                const serialized = ns.getValueSchema().isTimestampSchema() ? headerItem : quoteHeader(headerItem);
                if (buffer !== "") {
                  buffer += ", ";
                }
                buffer += serialized;
              }
              this.stringBuffer = buffer;
              return;
            }
            this.stringBuffer = JSON.stringify(value, null, 2);
            break;
          case "string":
            const mediaType = ns.getMergedTraits().mediaType;
            let intermediateValue = value;
            if (mediaType) {
              const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
              if (isJson) {
                intermediateValue = LazyJsonString.from(intermediateValue);
              }
              if (ns.getMergedTraits().httpHeader) {
                this.stringBuffer = (this.serdeContext?.base64Encoder ?? toBase64)(intermediateValue.toString());
                return;
              }
            }
            this.stringBuffer = value;
            break;
          default:
            if (ns.isIdempotencyToken()) {
              this.stringBuffer = v4();
            } else {
              this.stringBuffer = String(value);
            }
        }
      }
      flush() {
        const buffer = this.stringBuffer;
        this.stringBuffer = "";
        return buffer;
      }
    };
  }
});
var HttpInterceptingShapeSerializer;
var init_HttpInterceptingShapeSerializer = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeSerializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_ToStringShapeSerializer();
    HttpInterceptingShapeSerializer = class {
      static {
        __name(this, "HttpInterceptingShapeSerializer");
      }
      static {
        __name2(this, "HttpInterceptingShapeSerializer");
      }
      codecSerializer;
      stringSerializer;
      buffer;
      constructor(codecSerializer, codecSettings, stringSerializer = new ToStringShapeSerializer(codecSettings)) {
        this.codecSerializer = codecSerializer;
        this.stringSerializer = stringSerializer;
      }
      setSerdeContext(serdeContext) {
        this.codecSerializer.setSerdeContext(serdeContext);
        this.stringSerializer.setSerdeContext(serdeContext);
      }
      write(schema, value) {
        const ns = NormalizedSchema.of(schema);
        const traits = ns.getMergedTraits();
        if (traits.httpHeader || traits.httpLabel || traits.httpQuery) {
          this.stringSerializer.write(ns, value);
          this.buffer = this.stringSerializer.flush();
          return;
        }
        return this.codecSerializer.write(ns, value);
      }
      flush() {
        if (this.buffer !== void 0) {
          const buffer = this.buffer;
          this.buffer = void 0;
          return buffer;
        }
        return this.codecSerializer.flush();
      }
    };
  }
});
var init_protocols = __esm({
  "../node_modules/@smithy/core/dist-es/submodules/protocols/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_collect_stream_body();
    init_extended_encode_uri_component();
    init_HttpBindingProtocol();
    init_HttpProtocol();
    init_RpcProtocol();
    init_requestBuilder();
    init_resolve_path();
    init_FromStringShapeDeserializer();
    init_HttpInterceptingShapeDeserializer();
    init_HttpInterceptingShapeSerializer();
    init_ToStringShapeSerializer();
    init_determineTimestampFormat();
    init_SerdeContext();
  }
});
var init_requestBuilder2 = __esm({
  "../node_modules/@smithy/core/dist-es/request-builder/requestBuilder.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
function setFeature2(context, feature, value) {
  if (!context.__smithy_context) {
    context.__smithy_context = {
      features: {}
    };
  } else if (!context.__smithy_context.features) {
    context.__smithy_context.features = {};
  }
  context.__smithy_context.features[feature] = value;
}
__name(setFeature2, "setFeature2");
var init_setFeature2 = __esm({
  "../node_modules/@smithy/core/dist-es/setFeature.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(setFeature2, "setFeature");
  }
});
var DefaultIdentityProviderConfig;
var init_DefaultIdentityProviderConfig = __esm({
  "../node_modules/@smithy/core/dist-es/util-identity-and-auth/DefaultIdentityProviderConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    DefaultIdentityProviderConfig = class {
      static {
        __name(this, "DefaultIdentityProviderConfig");
      }
      static {
        __name2(this, "DefaultIdentityProviderConfig");
      }
      authSchemes = /* @__PURE__ */ new Map();
      constructor(config) {
        for (const [key, value] of Object.entries(config)) {
          if (value !== void 0) {
            this.authSchemes.set(key, value);
          }
        }
      }
      getIdentityProvider(schemeId) {
        return this.authSchemes.get(schemeId);
      }
    };
  }
});
var init_httpApiKeyAuth = __esm({
  "../node_modules/@smithy/core/dist-es/util-identity-and-auth/httpAuthSchemes/httpApiKeyAuth.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_httpBearerAuth = __esm({
  "../node_modules/@smithy/core/dist-es/util-identity-and-auth/httpAuthSchemes/httpBearerAuth.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_noAuth = __esm({
  "../node_modules/@smithy/core/dist-es/util-identity-and-auth/httpAuthSchemes/noAuth.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_httpAuthSchemes = __esm({
  "../node_modules/@smithy/core/dist-es/util-identity-and-auth/httpAuthSchemes/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_httpApiKeyAuth();
    init_httpBearerAuth();
    init_noAuth();
  }
});
var createIsIdentityExpiredFunction;
var EXPIRATION_MS;
var isIdentityExpired;
var doesIdentityRequireRefresh;
var memoizeIdentityProvider;
var init_memoizeIdentityProvider = __esm({
  "../node_modules/@smithy/core/dist-es/util-identity-and-auth/memoizeIdentityProvider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    createIsIdentityExpiredFunction = /* @__PURE__ */ __name2((expirationMs) => /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function isIdentityExpired2(identity) {
      return doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;
    }, "isIdentityExpired2"), "isIdentityExpired"), "createIsIdentityExpiredFunction");
    EXPIRATION_MS = 3e5;
    isIdentityExpired = createIsIdentityExpiredFunction(EXPIRATION_MS);
    doesIdentityRequireRefresh = /* @__PURE__ */ __name2((identity) => identity.expiration !== void 0, "doesIdentityRequireRefresh");
    memoizeIdentityProvider = /* @__PURE__ */ __name2((provider, isExpired, requiresRefresh) => {
      if (provider === void 0) {
        return void 0;
      }
      const normalizedProvider = typeof provider !== "function" ? async () => Promise.resolve(provider) : provider;
      let resolved;
      let pending;
      let hasResult;
      let isConstant = false;
      const coalesceProvider = /* @__PURE__ */ __name2(async (options) => {
        if (!pending) {
          pending = normalizedProvider(options);
        }
        try {
          resolved = await pending;
          hasResult = true;
          isConstant = false;
        } finally {
          pending = void 0;
        }
        return resolved;
      }, "coalesceProvider");
      if (isExpired === void 0) {
        return async (options) => {
          if (!hasResult || options?.forceRefresh) {
            resolved = await coalesceProvider(options);
          }
          return resolved;
        };
      }
      return async (options) => {
        if (!hasResult || options?.forceRefresh) {
          resolved = await coalesceProvider(options);
        }
        if (isConstant) {
          return resolved;
        }
        if (!requiresRefresh(resolved)) {
          isConstant = true;
          return resolved;
        }
        if (isExpired(resolved)) {
          await coalesceProvider(options);
          return resolved;
        }
        return resolved;
      };
    }, "memoizeIdentityProvider");
  }
});
var init_util_identity_and_auth = __esm({
  "../node_modules/@smithy/core/dist-es/util-identity-and-auth/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_DefaultIdentityProviderConfig();
    init_httpAuthSchemes();
    init_memoizeIdentityProvider();
  }
});
var init_dist_es14 = __esm({
  "../node_modules/@smithy/core/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_getSmithyContext();
    init_middleware_http_auth_scheme();
    init_middleware_http_signing();
    init_normalizeProvider2();
    init_createPaginator();
    init_requestBuilder2();
    init_setFeature2();
    init_util_identity_and_auth();
  }
});
var init_ProviderError = __esm({
  "../node_modules/@smithy/property-provider/dist-es/ProviderError.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_CredentialsProviderError = __esm({
  "../node_modules/@smithy/property-provider/dist-es/CredentialsProviderError.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_TokenProviderError = __esm({
  "../node_modules/@smithy/property-provider/dist-es/TokenProviderError.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_chain = __esm({
  "../node_modules/@smithy/property-provider/dist-es/chain.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_fromStatic = __esm({
  "../node_modules/@smithy/property-provider/dist-es/fromStatic.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var memoize;
var init_memoize = __esm({
  "../node_modules/@smithy/property-provider/dist-es/memoize.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    memoize = /* @__PURE__ */ __name2((provider, isExpired, requiresRefresh) => {
      let resolved;
      let pending;
      let hasResult;
      let isConstant = false;
      const coalesceProvider = /* @__PURE__ */ __name2(async () => {
        if (!pending) {
          pending = provider();
        }
        try {
          resolved = await pending;
          hasResult = true;
          isConstant = false;
        } finally {
          pending = void 0;
        }
        return resolved;
      }, "coalesceProvider");
      if (isExpired === void 0) {
        return async (options) => {
          if (!hasResult || options?.forceRefresh) {
            resolved = await coalesceProvider();
          }
          return resolved;
        };
      }
      return async (options) => {
        if (!hasResult || options?.forceRefresh) {
          resolved = await coalesceProvider();
        }
        if (isConstant) {
          return resolved;
        }
        if (requiresRefresh && !requiresRefresh(resolved)) {
          isConstant = true;
          return resolved;
        }
        if (isExpired(resolved)) {
          await coalesceProvider();
          return resolved;
        }
        return resolved;
      };
    }, "memoize");
  }
});
var init_dist_es15 = __esm({
  "../node_modules/@smithy/property-provider/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_CredentialsProviderError();
    init_ProviderError();
    init_TokenProviderError();
    init_chain();
    init_fromStatic();
    init_memoize();
  }
});
var resolveAwsSdkSigV4AConfig;
var init_resolveAwsSdkSigV4AConfig = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4AConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    resolveAwsSdkSigV4AConfig = /* @__PURE__ */ __name2((config) => {
      config.sigv4aSigningRegionSet = normalizeProvider2(config.sigv4aSigningRegionSet);
      return config;
    }, "resolveAwsSdkSigV4AConfig");
  }
});
var ALGORITHM_QUERY_PARAM;
var CREDENTIAL_QUERY_PARAM;
var AMZ_DATE_QUERY_PARAM;
var SIGNED_HEADERS_QUERY_PARAM;
var EXPIRES_QUERY_PARAM;
var SIGNATURE_QUERY_PARAM;
var TOKEN_QUERY_PARAM;
var AUTH_HEADER;
var AMZ_DATE_HEADER;
var DATE_HEADER;
var GENERATED_HEADERS;
var SIGNATURE_HEADER;
var SHA256_HEADER;
var TOKEN_HEADER;
var ALWAYS_UNSIGNABLE_HEADERS;
var PROXY_HEADER_PATTERN;
var SEC_HEADER_PATTERN;
var ALGORITHM_IDENTIFIER;
var EVENT_ALGORITHM_IDENTIFIER;
var UNSIGNED_PAYLOAD;
var MAX_CACHE_SIZE;
var KEY_TYPE_IDENTIFIER;
var MAX_PRESIGNED_TTL;
var init_constants3 = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
    CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
    AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
    SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
    EXPIRES_QUERY_PARAM = "X-Amz-Expires";
    SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
    TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
    AUTH_HEADER = "authorization";
    AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
    DATE_HEADER = "date";
    GENERATED_HEADERS = [AUTH_HEADER, AMZ_DATE_HEADER, DATE_HEADER];
    SIGNATURE_HEADER = SIGNATURE_QUERY_PARAM.toLowerCase();
    SHA256_HEADER = "x-amz-content-sha256";
    TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
    ALWAYS_UNSIGNABLE_HEADERS = {
      authorization: true,
      "cache-control": true,
      connection: true,
      expect: true,
      from: true,
      "keep-alive": true,
      "max-forwards": true,
      pragma: true,
      referer: true,
      te: true,
      trailer: true,
      "transfer-encoding": true,
      upgrade: true,
      "user-agent": true,
      "x-amzn-trace-id": true
    };
    PROXY_HEADER_PATTERN = /^proxy-/;
    SEC_HEADER_PATTERN = /^sec-/;
    ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
    EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
    UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
    MAX_CACHE_SIZE = 50;
    KEY_TYPE_IDENTIFIER = "aws4_request";
    MAX_PRESIGNED_TTL = 60 * 60 * 24 * 7;
  }
});
var signingKeyCache;
var cacheQueue;
var createScope;
var getSigningKey;
var hmac;
var init_credentialDerivation = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/credentialDerivation.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es11();
    init_dist_es6();
    init_constants3();
    signingKeyCache = {};
    cacheQueue = [];
    createScope = /* @__PURE__ */ __name2((shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`, "createScope");
    getSigningKey = /* @__PURE__ */ __name2(async (sha256Constructor, credentials, shortDate, region, service) => {
      const credsHash = await hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId);
      const cacheKey = `${shortDate}:${region}:${service}:${toHex(credsHash)}:${credentials.sessionToken}`;
      if (cacheKey in signingKeyCache) {
        return signingKeyCache[cacheKey];
      }
      cacheQueue.push(cacheKey);
      while (cacheQueue.length > MAX_CACHE_SIZE) {
        delete signingKeyCache[cacheQueue.shift()];
      }
      let key = `AWS4${credentials.secretAccessKey}`;
      for (const signable of [shortDate, region, service, KEY_TYPE_IDENTIFIER]) {
        key = await hmac(sha256Constructor, key, signable);
      }
      return signingKeyCache[cacheKey] = key;
    }, "getSigningKey");
    hmac = /* @__PURE__ */ __name2((ctor, secret, data) => {
      const hash = new ctor(secret);
      hash.update(toUint8Array(data));
      return hash.digest();
    }, "hmac");
  }
});
var getCanonicalHeaders;
var init_getCanonicalHeaders = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/getCanonicalHeaders.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants3();
    getCanonicalHeaders = /* @__PURE__ */ __name2(({ headers }, unsignableHeaders, signableHeaders) => {
      const canonical = {};
      for (const headerName of Object.keys(headers).sort()) {
        if (headers[headerName] == void 0) {
          continue;
        }
        const canonicalHeaderName = headerName.toLowerCase();
        if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
          if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) {
            continue;
          }
        }
        canonical[canonicalHeaderName] = headers[headerName].trim().replace(/\s+/g, " ");
      }
      return canonical;
    }, "getCanonicalHeaders");
  }
});
var isArrayBuffer;
var init_dist_es16 = __esm({
  "../node_modules/@smithy/is-array-buffer/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    isArrayBuffer = /* @__PURE__ */ __name2((arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]", "isArrayBuffer");
  }
});
var getPayloadHash;
var init_getPayloadHash = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/getPayloadHash.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es16();
    init_dist_es11();
    init_dist_es6();
    init_constants3();
    getPayloadHash = /* @__PURE__ */ __name2(async ({ headers, body }, hashConstructor) => {
      for (const headerName of Object.keys(headers)) {
        if (headerName.toLowerCase() === SHA256_HEADER) {
          return headers[headerName];
        }
      }
      if (body == void 0) {
        return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      } else if (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body)) {
        const hashCtor = new hashConstructor();
        hashCtor.update(toUint8Array(body));
        return toHex(await hashCtor.digest());
      }
      return UNSIGNED_PAYLOAD;
    }, "getPayloadHash");
  }
});
function negate(bytes) {
  for (let i2 = 0; i2 < 8; i2++) {
    bytes[i2] ^= 255;
  }
  for (let i2 = 7; i2 > -1; i2--) {
    bytes[i2]++;
    if (bytes[i2] !== 0)
      break;
  }
}
__name(negate, "negate");
var HeaderFormatter;
var HEADER_VALUE_TYPE;
var UUID_PATTERN;
var Int64;
var init_HeaderFormatter = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/HeaderFormatter.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es11();
    init_dist_es6();
    HeaderFormatter = class {
      static {
        __name(this, "HeaderFormatter");
      }
      static {
        __name2(this, "HeaderFormatter");
      }
      format(headers) {
        const chunks = [];
        for (const headerName of Object.keys(headers)) {
          const bytes = fromUtf8(headerName);
          chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
        }
        const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
        let position = 0;
        for (const chunk of chunks) {
          out.set(chunk, position);
          position += chunk.byteLength;
        }
        return out;
      }
      formatHeaderValue(header) {
        switch (header.type) {
          case "boolean":
            return Uint8Array.from([header.value ? 0 : 1]);
          case "byte":
            return Uint8Array.from([2, header.value]);
          case "short":
            const shortView = new DataView(new ArrayBuffer(3));
            shortView.setUint8(0, 3);
            shortView.setInt16(1, header.value, false);
            return new Uint8Array(shortView.buffer);
          case "integer":
            const intView = new DataView(new ArrayBuffer(5));
            intView.setUint8(0, 4);
            intView.setInt32(1, header.value, false);
            return new Uint8Array(intView.buffer);
          case "long":
            const longBytes = new Uint8Array(9);
            longBytes[0] = 5;
            longBytes.set(header.value.bytes, 1);
            return longBytes;
          case "binary":
            const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
            binView.setUint8(0, 6);
            binView.setUint16(1, header.value.byteLength, false);
            const binBytes = new Uint8Array(binView.buffer);
            binBytes.set(header.value, 3);
            return binBytes;
          case "string":
            const utf8Bytes = fromUtf8(header.value);
            const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
            strView.setUint8(0, 7);
            strView.setUint16(1, utf8Bytes.byteLength, false);
            const strBytes = new Uint8Array(strView.buffer);
            strBytes.set(utf8Bytes, 3);
            return strBytes;
          case "timestamp":
            const tsBytes = new Uint8Array(9);
            tsBytes[0] = 8;
            tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
            return tsBytes;
          case "uuid":
            if (!UUID_PATTERN.test(header.value)) {
              throw new Error(`Invalid UUID received: ${header.value}`);
            }
            const uuidBytes = new Uint8Array(17);
            uuidBytes[0] = 9;
            uuidBytes.set(fromHex(header.value.replace(/\-/g, "")), 1);
            return uuidBytes;
        }
      }
    };
    (function(HEADER_VALUE_TYPE3) {
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
    })(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
    UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
    Int64 = class _Int64 {
      static {
        __name(this, "_Int64");
      }
      static {
        __name2(this, "Int64");
      }
      bytes;
      constructor(bytes) {
        this.bytes = bytes;
        if (bytes.byteLength !== 8) {
          throw new Error("Int64 buffers must be exactly 8 bytes");
        }
      }
      static fromNumber(number) {
        if (number > 9223372036854776e3 || number < -9223372036854776e3) {
          throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
        }
        const bytes = new Uint8Array(8);
        for (let i2 = 7, remaining = Math.abs(Math.round(number)); i2 > -1 && remaining > 0; i2--, remaining /= 256) {
          bytes[i2] = remaining;
        }
        if (number < 0) {
          negate(bytes);
        }
        return new _Int64(bytes);
      }
      valueOf() {
        const bytes = this.bytes.slice(0);
        const negative = bytes[0] & 128;
        if (negative) {
          negate(bytes);
        }
        return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
      }
      toString() {
        return String(this.valueOf());
      }
    };
    __name2(negate, "negate");
  }
});
var hasHeader;
var init_headerUtil = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/headerUtil.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    hasHeader = /* @__PURE__ */ __name2((soughtHeader, headers) => {
      soughtHeader = soughtHeader.toLowerCase();
      for (const headerName of Object.keys(headers)) {
        if (soughtHeader === headerName.toLowerCase()) {
          return true;
        }
      }
      return false;
    }, "hasHeader");
  }
});
var moveHeadersToQuery;
var init_moveHeadersToQuery = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/moveHeadersToQuery.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    moveHeadersToQuery = /* @__PURE__ */ __name2((request, options = {}) => {
      const { headers, query = {} } = HttpRequest.clone(request);
      for (const name of Object.keys(headers)) {
        const lname = name.toLowerCase();
        if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname) || options.hoistableHeaders?.has(lname)) {
          query[name] = headers[name];
          delete headers[name];
        }
      }
      return {
        ...request,
        headers,
        query
      };
    }, "moveHeadersToQuery");
  }
});
var prepareRequest;
var init_prepareRequest = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/prepareRequest.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_constants3();
    prepareRequest = /* @__PURE__ */ __name2((request) => {
      request = HttpRequest.clone(request);
      for (const headerName of Object.keys(request.headers)) {
        if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) {
          delete request.headers[headerName];
        }
      }
      return request;
    }, "prepareRequest");
  }
});
var getCanonicalQuery;
var init_getCanonicalQuery = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es8();
    init_constants3();
    getCanonicalQuery = /* @__PURE__ */ __name2(({ query = {} }) => {
      const keys = [];
      const serialized = {};
      for (const key of Object.keys(query)) {
        if (key.toLowerCase() === SIGNATURE_HEADER) {
          continue;
        }
        const encodedKey = escapeUri(key);
        keys.push(encodedKey);
        const value = query[key];
        if (typeof value === "string") {
          serialized[encodedKey] = `${encodedKey}=${escapeUri(value)}`;
        } else if (Array.isArray(value)) {
          serialized[encodedKey] = value.slice(0).reduce((encoded, value2) => encoded.concat([`${encodedKey}=${escapeUri(value2)}`]), []).sort().join("&");
        }
      }
      return keys.sort().map((key) => serialized[key]).filter((serialized2) => serialized2).join("&");
    }, "getCanonicalQuery");
  }
});
var iso8601;
var toDate;
var init_utilDate = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/utilDate.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    iso8601 = /* @__PURE__ */ __name2((time2) => toDate(time2).toISOString().replace(/\.\d{3}Z$/, "Z"), "iso8601");
    toDate = /* @__PURE__ */ __name2((time2) => {
      if (typeof time2 === "number") {
        return new Date(time2 * 1e3);
      }
      if (typeof time2 === "string") {
        if (Number(time2)) {
          return new Date(Number(time2) * 1e3);
        }
        return new Date(time2);
      }
      return time2;
    }, "toDate");
  }
});
var SignatureV4Base;
var init_SignatureV4Base = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/SignatureV4Base.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es11();
    init_dist_es4();
    init_dist_es8();
    init_dist_es6();
    init_getCanonicalQuery();
    init_utilDate();
    SignatureV4Base = class {
      static {
        __name(this, "SignatureV4Base");
      }
      static {
        __name2(this, "SignatureV4Base");
      }
      service;
      regionProvider;
      credentialProvider;
      sha256;
      uriEscapePath;
      applyChecksum;
      constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
        this.service = service;
        this.sha256 = sha256;
        this.uriEscapePath = uriEscapePath;
        this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
        this.regionProvider = normalizeProvider(region);
        this.credentialProvider = normalizeProvider(credentials);
      }
      createCanonicalRequest(request, canonicalHeaders, payloadHash) {
        const sortedHeaders = Object.keys(canonicalHeaders).sort();
        return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join("\n")}

${sortedHeaders.join(";")}
${payloadHash}`;
      }
      async createStringToSign(longDate, credentialScope, canonicalRequest, algorithmIdentifier) {
        const hash = new this.sha256();
        hash.update(toUint8Array(canonicalRequest));
        const hashedRequest = await hash.digest();
        return `${algorithmIdentifier}
${longDate}
${credentialScope}
${toHex(hashedRequest)}`;
      }
      getCanonicalPath({ path }) {
        if (this.uriEscapePath) {
          const normalizedPathSegments = [];
          for (const pathSegment of path.split("/")) {
            if (pathSegment?.length === 0)
              continue;
            if (pathSegment === ".")
              continue;
            if (pathSegment === "..") {
              normalizedPathSegments.pop();
            } else {
              normalizedPathSegments.push(pathSegment);
            }
          }
          const normalizedPath = `${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`;
          const doubleEncoded = escapeUri(normalizedPath);
          return doubleEncoded.replace(/%2F/g, "/");
        }
        return path;
      }
      validateResolvedCredentials(credentials) {
        if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") {
          throw new Error("Resolved credential object is not valid");
        }
      }
      formatDate(now) {
        const longDate = iso8601(now).replace(/[\-:]/g, "");
        return {
          longDate,
          shortDate: longDate.slice(0, 8)
        };
      }
      getCanonicalHeaderList(headers) {
        return Object.keys(headers).sort().join(";");
      }
    };
  }
});
var SignatureV4;
var init_SignatureV4 = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/SignatureV4.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es11();
    init_dist_es6();
    init_constants3();
    init_credentialDerivation();
    init_getCanonicalHeaders();
    init_getPayloadHash();
    init_HeaderFormatter();
    init_headerUtil();
    init_moveHeadersToQuery();
    init_prepareRequest();
    init_SignatureV4Base();
    SignatureV4 = class extends SignatureV4Base {
      static {
        __name(this, "SignatureV4");
      }
      static {
        __name2(this, "SignatureV4");
      }
      headerFormatter = new HeaderFormatter();
      constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
        super({
          applyChecksum,
          credentials,
          region,
          service,
          sha256,
          uriEscapePath
        });
      }
      async presign(originalRequest, options = {}) {
        const { signingDate = /* @__PURE__ */ new Date(), expiresIn = 3600, unsignableHeaders, unhoistableHeaders, signableHeaders, hoistableHeaders, signingRegion, signingService } = options;
        const credentials = await this.credentialProvider();
        this.validateResolvedCredentials(credentials);
        const region = signingRegion ?? await this.regionProvider();
        const { longDate, shortDate } = this.formatDate(signingDate);
        if (expiresIn > MAX_PRESIGNED_TTL) {
          return Promise.reject("Signature version 4 presigned URLs must have an expiration date less than one week in the future");
        }
        const scope = createScope(shortDate, region, signingService ?? this.service);
        const request = moveHeadersToQuery(prepareRequest(originalRequest), { unhoistableHeaders, hoistableHeaders });
        if (credentials.sessionToken) {
          request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
        }
        request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
        request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
        request.query[AMZ_DATE_QUERY_PARAM] = longDate;
        request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
        const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
        request.query[SIGNED_HEADERS_QUERY_PARAM] = this.getCanonicalHeaderList(canonicalHeaders);
        request.query[SIGNATURE_QUERY_PARAM] = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, await getPayloadHash(originalRequest, this.sha256)));
        return request;
      }
      async sign(toSign, options) {
        if (typeof toSign === "string") {
          return this.signString(toSign, options);
        } else if (toSign.headers && toSign.payload) {
          return this.signEvent(toSign, options);
        } else if (toSign.message) {
          return this.signMessage(toSign, options);
        } else {
          return this.signRequest(toSign, options);
        }
      }
      async signEvent({ headers, payload }, { signingDate = /* @__PURE__ */ new Date(), priorSignature, signingRegion, signingService }) {
        const region = signingRegion ?? await this.regionProvider();
        const { shortDate, longDate } = this.formatDate(signingDate);
        const scope = createScope(shortDate, region, signingService ?? this.service);
        const hashedPayload = await getPayloadHash({ headers: {}, body: payload }, this.sha256);
        const hash = new this.sha256();
        hash.update(headers);
        const hashedHeaders = toHex(await hash.digest());
        const stringToSign = [
          EVENT_ALGORITHM_IDENTIFIER,
          longDate,
          scope,
          priorSignature,
          hashedHeaders,
          hashedPayload
        ].join("\n");
        return this.signString(stringToSign, { signingDate, signingRegion: region, signingService });
      }
      async signMessage(signableMessage, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService }) {
        const promise = this.signEvent({
          headers: this.headerFormatter.format(signableMessage.message.headers),
          payload: signableMessage.message.body
        }, {
          signingDate,
          signingRegion,
          signingService,
          priorSignature: signableMessage.priorSignature
        });
        return promise.then((signature) => {
          return { message: signableMessage.message, signature };
        });
      }
      async signString(stringToSign, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService } = {}) {
        const credentials = await this.credentialProvider();
        this.validateResolvedCredentials(credentials);
        const region = signingRegion ?? await this.regionProvider();
        const { shortDate } = this.formatDate(signingDate);
        const hash = new this.sha256(await this.getSigningKey(credentials, region, shortDate, signingService));
        hash.update(toUint8Array(stringToSign));
        return toHex(await hash.digest());
      }
      async signRequest(requestToSign, { signingDate = /* @__PURE__ */ new Date(), signableHeaders, unsignableHeaders, signingRegion, signingService } = {}) {
        const credentials = await this.credentialProvider();
        this.validateResolvedCredentials(credentials);
        const region = signingRegion ?? await this.regionProvider();
        const request = prepareRequest(requestToSign);
        const { longDate, shortDate } = this.formatDate(signingDate);
        const scope = createScope(shortDate, region, signingService ?? this.service);
        request.headers[AMZ_DATE_HEADER] = longDate;
        if (credentials.sessionToken) {
          request.headers[TOKEN_HEADER] = credentials.sessionToken;
        }
        const payloadHash = await getPayloadHash(request, this.sha256);
        if (!hasHeader(SHA256_HEADER, request.headers) && this.applyChecksum) {
          request.headers[SHA256_HEADER] = payloadHash;
        }
        const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
        const signature = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
        request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${this.getCanonicalHeaderList(canonicalHeaders)}, Signature=${signature}`;
        return request;
      }
      async getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
        const stringToSign = await this.createStringToSign(longDate, credentialScope, canonicalRequest, ALGORITHM_IDENTIFIER);
        const hash = new this.sha256(await keyPromise);
        hash.update(toUint8Array(stringToSign));
        return toHex(await hash.digest());
      }
      getSigningKey(credentials, region, shortDate, service) {
        return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
      }
    };
  }
});
var signatureV4aContainer;
var init_signature_v4a_container = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/signature-v4a-container.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    signatureV4aContainer = {
      SignatureV4a: null
    };
  }
});
var init_dist_es17 = __esm({
  "../node_modules/@smithy/signature-v4/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_SignatureV4();
    init_constants3();
    init_credentialDerivation();
    init_signature_v4a_container();
  }
});
function normalizeCredentialProvider(config, { credentials, credentialDefaultProvider }) {
  let credentialsProvider;
  if (credentials) {
    if (!credentials?.memoized) {
      credentialsProvider = memoizeIdentityProvider(credentials, isIdentityExpired, doesIdentityRequireRefresh);
    } else {
      credentialsProvider = credentials;
    }
  } else {
    if (credentialDefaultProvider) {
      credentialsProvider = normalizeProvider2(credentialDefaultProvider(Object.assign({}, config, {
        parentClientConfig: config
      })));
    } else {
      credentialsProvider = /* @__PURE__ */ __name2(async () => {
        throw new Error("@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.");
      }, "credentialsProvider");
    }
  }
  credentialsProvider.memoized = true;
  return credentialsProvider;
}
__name(normalizeCredentialProvider, "normalizeCredentialProvider");
function bindCallerConfig(config, credentialsProvider) {
  if (credentialsProvider.configBound) {
    return credentialsProvider;
  }
  const fn = /* @__PURE__ */ __name2(async (options) => credentialsProvider({ ...options, callerClientConfig: config }), "fn");
  fn.memoized = credentialsProvider.memoized;
  fn.configBound = true;
  return fn;
}
__name(bindCallerConfig, "bindCallerConfig");
var resolveAwsSdkSigV4Config;
var init_resolveAwsSdkSigV4Config = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4Config.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_client2();
    init_dist_es14();
    init_dist_es17();
    resolveAwsSdkSigV4Config = /* @__PURE__ */ __name2((config) => {
      let inputCredentials = config.credentials;
      let isUserSupplied = !!config.credentials;
      let resolvedCredentials = void 0;
      Object.defineProperty(config, "credentials", {
        set(credentials) {
          if (credentials && credentials !== inputCredentials && credentials !== resolvedCredentials) {
            isUserSupplied = true;
          }
          inputCredentials = credentials;
          const memoizedProvider = normalizeCredentialProvider(config, {
            credentials: inputCredentials,
            credentialDefaultProvider: config.credentialDefaultProvider
          });
          const boundProvider = bindCallerConfig(config, memoizedProvider);
          if (isUserSupplied && !boundProvider.attributed) {
            const isCredentialObject = typeof inputCredentials === "object" && inputCredentials !== null;
            resolvedCredentials = /* @__PURE__ */ __name2(async (options) => {
              const creds = await boundProvider(options);
              const attributedCreds = creds;
              if (isCredentialObject && (!attributedCreds.$source || Object.keys(attributedCreds.$source).length === 0)) {
                return setCredentialFeature(attributedCreds, "CREDENTIALS_CODE", "e");
              }
              return attributedCreds;
            }, "resolvedCredentials");
            resolvedCredentials.memoized = boundProvider.memoized;
            resolvedCredentials.configBound = boundProvider.configBound;
            resolvedCredentials.attributed = true;
          } else {
            resolvedCredentials = boundProvider;
          }
        },
        get() {
          return resolvedCredentials;
        },
        enumerable: true,
        configurable: true
      });
      config.credentials = inputCredentials;
      const { signingEscapePath = true, systemClockOffset = config.systemClockOffset || 0, sha256 } = config;
      let signer;
      if (config.signer) {
        signer = normalizeProvider2(config.signer);
      } else if (config.regionInfoProvider) {
        signer = /* @__PURE__ */ __name2(() => normalizeProvider2(config.region)().then(async (region) => [
          await config.regionInfoProvider(region, {
            useFipsEndpoint: await config.useFipsEndpoint(),
            useDualstackEndpoint: await config.useDualstackEndpoint()
          }) || {},
          region
        ]).then(([regionInfo, region]) => {
          const { signingRegion, signingService } = regionInfo;
          config.signingRegion = config.signingRegion || signingRegion || region;
          config.signingName = config.signingName || signingService || config.serviceId;
          const params = {
            ...config,
            credentials: config.credentials,
            region: config.signingRegion,
            service: config.signingName,
            sha256,
            uriEscapePath: signingEscapePath
          };
          const SignerCtor = config.signerConstructor || SignatureV4;
          return new SignerCtor(params);
        }), "signer");
      } else {
        signer = /* @__PURE__ */ __name2(async (authScheme) => {
          authScheme = Object.assign({}, {
            name: "sigv4",
            signingName: config.signingName || config.defaultSigningName,
            signingRegion: await normalizeProvider2(config.region)(),
            properties: {}
          }, authScheme);
          const signingRegion = authScheme.signingRegion;
          const signingService = authScheme.signingName;
          config.signingRegion = config.signingRegion || signingRegion;
          config.signingName = config.signingName || signingService || config.serviceId;
          const params = {
            ...config,
            credentials: config.credentials,
            region: config.signingRegion,
            service: config.signingName,
            sha256,
            uriEscapePath: signingEscapePath
          };
          const SignerCtor = config.signerConstructor || SignatureV4;
          return new SignerCtor(params);
        }, "signer");
      }
      const resolvedConfig = Object.assign(config, {
        systemClockOffset,
        signingEscapePath,
        signer
      });
      return resolvedConfig;
    }, "resolveAwsSdkSigV4Config");
    __name2(normalizeCredentialProvider, "normalizeCredentialProvider");
    __name2(bindCallerConfig, "bindCallerConfig");
  }
});
var init_aws_sdk = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_AwsSdkSigV4Signer();
    init_AwsSdkSigV4ASigner();
    init_NODE_AUTH_SCHEME_PREFERENCE_OPTIONS();
    init_resolveAwsSdkSigV4AConfig();
    init_resolveAwsSdkSigV4Config();
  }
});
var init_httpAuthSchemes2 = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_aws_sdk();
    init_getBearerTokenEnvKey();
  }
});
var TEXT_ENCODER;
var calculateBodyLength;
var init_calculateBodyLength = __esm({
  "../node_modules/@smithy/util-body-length-browser/dist-es/calculateBodyLength.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    TEXT_ENCODER = typeof TextEncoder == "function" ? new TextEncoder() : null;
    calculateBodyLength = /* @__PURE__ */ __name2((body) => {
      if (typeof body === "string") {
        if (TEXT_ENCODER) {
          return TEXT_ENCODER.encode(body).byteLength;
        }
        let len = body.length;
        for (let i2 = len - 1; i2 >= 0; i2--) {
          const code = body.charCodeAt(i2);
          if (code > 127 && code <= 2047)
            len++;
          else if (code > 2047 && code <= 65535)
            len += 2;
          if (code >= 56320 && code <= 57343)
            i2--;
        }
        return len;
      } else if (typeof body.byteLength === "number") {
        return body.byteLength;
      } else if (typeof body.size === "number") {
        return body.size;
      }
      throw new Error(`Body Length computation failed for ${body}`);
    }, "calculateBodyLength");
  }
});
var init_dist_es18 = __esm({
  "../node_modules/@smithy/util-body-length-browser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_calculateBodyLength();
  }
});
var getAllAliases;
var getMiddlewareNameWithAliases;
var constructStack;
var stepWeights;
var priorityWeights;
var init_MiddlewareStack = __esm({
  "../node_modules/@smithy/middleware-stack/dist-es/MiddlewareStack.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getAllAliases = /* @__PURE__ */ __name2((name, aliases) => {
      const _aliases = [];
      if (name) {
        _aliases.push(name);
      }
      if (aliases) {
        for (const alias of aliases) {
          _aliases.push(alias);
        }
      }
      return _aliases;
    }, "getAllAliases");
    getMiddlewareNameWithAliases = /* @__PURE__ */ __name2((name, aliases) => {
      return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
    }, "getMiddlewareNameWithAliases");
    constructStack = /* @__PURE__ */ __name2(() => {
      let absoluteEntries = [];
      let relativeEntries = [];
      let identifyOnResolve = false;
      const entriesNameSet = /* @__PURE__ */ new Set();
      const sort = /* @__PURE__ */ __name2((entries) => entries.sort((a2, b2) => stepWeights[b2.step] - stepWeights[a2.step] || priorityWeights[b2.priority || "normal"] - priorityWeights[a2.priority || "normal"]), "sort");
      const removeByName = /* @__PURE__ */ __name2((toRemove) => {
        let isRemoved = false;
        const filterCb = /* @__PURE__ */ __name2((entry) => {
          const aliases = getAllAliases(entry.name, entry.aliases);
          if (aliases.includes(toRemove)) {
            isRemoved = true;
            for (const alias of aliases) {
              entriesNameSet.delete(alias);
            }
            return false;
          }
          return true;
        }, "filterCb");
        absoluteEntries = absoluteEntries.filter(filterCb);
        relativeEntries = relativeEntries.filter(filterCb);
        return isRemoved;
      }, "removeByName");
      const removeByReference = /* @__PURE__ */ __name2((toRemove) => {
        let isRemoved = false;
        const filterCb = /* @__PURE__ */ __name2((entry) => {
          if (entry.middleware === toRemove) {
            isRemoved = true;
            for (const alias of getAllAliases(entry.name, entry.aliases)) {
              entriesNameSet.delete(alias);
            }
            return false;
          }
          return true;
        }, "filterCb");
        absoluteEntries = absoluteEntries.filter(filterCb);
        relativeEntries = relativeEntries.filter(filterCb);
        return isRemoved;
      }, "removeByReference");
      const cloneTo = /* @__PURE__ */ __name2((toStack) => {
        absoluteEntries.forEach((entry) => {
          toStack.add(entry.middleware, { ...entry });
        });
        relativeEntries.forEach((entry) => {
          toStack.addRelativeTo(entry.middleware, { ...entry });
        });
        toStack.identifyOnResolve?.(stack.identifyOnResolve());
        return toStack;
      }, "cloneTo");
      const expandRelativeMiddlewareList = /* @__PURE__ */ __name2((from) => {
        const expandedMiddlewareList = [];
        from.before.forEach((entry) => {
          if (entry.before.length === 0 && entry.after.length === 0) {
            expandedMiddlewareList.push(entry);
          } else {
            expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
          }
        });
        expandedMiddlewareList.push(from);
        from.after.reverse().forEach((entry) => {
          if (entry.before.length === 0 && entry.after.length === 0) {
            expandedMiddlewareList.push(entry);
          } else {
            expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
          }
        });
        return expandedMiddlewareList;
      }, "expandRelativeMiddlewareList");
      const getMiddlewareList = /* @__PURE__ */ __name2((debug = false) => {
        const normalizedAbsoluteEntries = [];
        const normalizedRelativeEntries = [];
        const normalizedEntriesNameMap = {};
        absoluteEntries.forEach((entry) => {
          const normalizedEntry = {
            ...entry,
            before: [],
            after: []
          };
          for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
            normalizedEntriesNameMap[alias] = normalizedEntry;
          }
          normalizedAbsoluteEntries.push(normalizedEntry);
        });
        relativeEntries.forEach((entry) => {
          const normalizedEntry = {
            ...entry,
            before: [],
            after: []
          };
          for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
            normalizedEntriesNameMap[alias] = normalizedEntry;
          }
          normalizedRelativeEntries.push(normalizedEntry);
        });
        normalizedRelativeEntries.forEach((entry) => {
          if (entry.toMiddleware) {
            const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
            if (toMiddleware === void 0) {
              if (debug) {
                return;
              }
              throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
            }
            if (entry.relation === "after") {
              toMiddleware.after.push(entry);
            }
            if (entry.relation === "before") {
              toMiddleware.before.push(entry);
            }
          }
        });
        const mainChain = sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((wholeList, expandedMiddlewareList) => {
          wholeList.push(...expandedMiddlewareList);
          return wholeList;
        }, []);
        return mainChain;
      }, "getMiddlewareList");
      const stack = {
        add: /* @__PURE__ */ __name2((middleware, options = {}) => {
          const { name, override, aliases: _aliases } = options;
          const entry = {
            step: "initialize",
            priority: "normal",
            middleware,
            ...options
          };
          const aliases = getAllAliases(name, _aliases);
          if (aliases.length > 0) {
            if (aliases.some((alias) => entriesNameSet.has(alias))) {
              if (!override)
                throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
              for (const alias of aliases) {
                const toOverrideIndex = absoluteEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a2) => a2 === alias));
                if (toOverrideIndex === -1) {
                  continue;
                }
                const toOverride = absoluteEntries[toOverrideIndex];
                if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
                  throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`);
                }
                absoluteEntries.splice(toOverrideIndex, 1);
              }
            }
            for (const alias of aliases) {
              entriesNameSet.add(alias);
            }
          }
          absoluteEntries.push(entry);
        }, "add"),
        addRelativeTo: /* @__PURE__ */ __name2((middleware, options) => {
          const { name, override, aliases: _aliases } = options;
          const entry = {
            middleware,
            ...options
          };
          const aliases = getAllAliases(name, _aliases);
          if (aliases.length > 0) {
            if (aliases.some((alias) => entriesNameSet.has(alias))) {
              if (!override)
                throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
              for (const alias of aliases) {
                const toOverrideIndex = relativeEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a2) => a2 === alias));
                if (toOverrideIndex === -1) {
                  continue;
                }
                const toOverride = relativeEntries[toOverrideIndex];
                if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
                  throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`);
                }
                relativeEntries.splice(toOverrideIndex, 1);
              }
            }
            for (const alias of aliases) {
              entriesNameSet.add(alias);
            }
          }
          relativeEntries.push(entry);
        }, "addRelativeTo"),
        clone: /* @__PURE__ */ __name2(() => cloneTo(constructStack()), "clone"),
        use: /* @__PURE__ */ __name2((plugin) => {
          plugin.applyToStack(stack);
        }, "use"),
        remove: /* @__PURE__ */ __name2((toRemove) => {
          if (typeof toRemove === "string")
            return removeByName(toRemove);
          else
            return removeByReference(toRemove);
        }, "remove"),
        removeByTag: /* @__PURE__ */ __name2((toRemove) => {
          let isRemoved = false;
          const filterCb = /* @__PURE__ */ __name2((entry) => {
            const { tags, name, aliases: _aliases } = entry;
            if (tags && tags.includes(toRemove)) {
              const aliases = getAllAliases(name, _aliases);
              for (const alias of aliases) {
                entriesNameSet.delete(alias);
              }
              isRemoved = true;
              return false;
            }
            return true;
          }, "filterCb");
          absoluteEntries = absoluteEntries.filter(filterCb);
          relativeEntries = relativeEntries.filter(filterCb);
          return isRemoved;
        }, "removeByTag"),
        concat: /* @__PURE__ */ __name2((from) => {
          const cloned = cloneTo(constructStack());
          cloned.use(from);
          cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || (from.identifyOnResolve?.() ?? false));
          return cloned;
        }, "concat"),
        applyToStack: cloneTo,
        identify: /* @__PURE__ */ __name2(() => {
          return getMiddlewareList(true).map((mw) => {
            const step = mw.step ?? mw.relation + " " + mw.toMiddleware;
            return getMiddlewareNameWithAliases(mw.name, mw.aliases) + " - " + step;
          });
        }, "identify"),
        identifyOnResolve(toggle) {
          if (typeof toggle === "boolean")
            identifyOnResolve = toggle;
          return identifyOnResolve;
        },
        resolve: /* @__PURE__ */ __name2((handler, context) => {
          for (const middleware of getMiddlewareList().map((entry) => entry.middleware).reverse()) {
            handler = middleware(handler, context);
          }
          if (identifyOnResolve) {
            console.log(stack.identify());
          }
          return handler;
        }, "resolve")
      };
      return stack;
    }, "constructStack");
    stepWeights = {
      initialize: 5,
      serialize: 4,
      build: 3,
      finalizeRequest: 2,
      deserialize: 1
    };
    priorityWeights = {
      high: 3,
      normal: 2,
      low: 1
    };
  }
});
var init_dist_es19 = __esm({
  "../node_modules/@smithy/middleware-stack/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_MiddlewareStack();
  }
});
var Client;
var init_client3 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/client.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es19();
    Client = class {
      static {
        __name(this, "Client");
      }
      static {
        __name2(this, "Client");
      }
      config;
      middlewareStack = constructStack();
      initConfig;
      handlers;
      constructor(config) {
        this.config = config;
        const { protocol, protocolSettings } = config;
        if (protocolSettings) {
          if (typeof protocol === "function") {
            config.protocol = new protocol(protocolSettings);
          }
        }
      }
      send(command, optionsOrCb, cb2) {
        const options = typeof optionsOrCb !== "function" ? optionsOrCb : void 0;
        const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb2;
        const useHandlerCache = options === void 0 && this.config.cacheMiddleware === true;
        let handler;
        if (useHandlerCache) {
          if (!this.handlers) {
            this.handlers = /* @__PURE__ */ new WeakMap();
          }
          const handlers = this.handlers;
          if (handlers.has(command.constructor)) {
            handler = handlers.get(command.constructor);
          } else {
            handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
            handlers.set(command.constructor, handler);
          }
        } else {
          delete this.handlers;
          handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
        }
        if (callback) {
          handler(command).then((result) => callback(null, result.output), (err) => callback(err)).catch(() => {
          });
        } else {
          return handler(command).then((result) => result.output);
        }
      }
      destroy() {
        this.config?.requestHandler?.destroy?.();
        delete this.handlers;
      }
    };
  }
});
var init_collect_stream_body2 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/collect-stream-body.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
function schemaLogFilter(schema, data) {
  if (data == null) {
    return data;
  }
  const ns = NormalizedSchema.of(schema);
  if (ns.getMergedTraits().sensitive) {
    return SENSITIVE_STRING;
  }
  if (ns.isListSchema()) {
    const isSensitive = !!ns.getValueSchema().getMergedTraits().sensitive;
    if (isSensitive) {
      return SENSITIVE_STRING;
    }
  } else if (ns.isMapSchema()) {
    const isSensitive = !!ns.getKeySchema().getMergedTraits().sensitive || !!ns.getValueSchema().getMergedTraits().sensitive;
    if (isSensitive) {
      return SENSITIVE_STRING;
    }
  } else if (ns.isStructSchema() && typeof data === "object") {
    const object = data;
    const newObject = {};
    for (const [member2, memberNs] of ns.structIterator()) {
      if (object[member2] != null) {
        newObject[member2] = schemaLogFilter(memberNs, object[member2]);
      }
    }
    return newObject;
  }
  return data;
}
__name(schemaLogFilter, "schemaLogFilter");
var SENSITIVE_STRING;
var init_schemaLogFilter = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/schemaLogFilter.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    SENSITIVE_STRING = "***SensitiveInformation***";
    __name2(schemaLogFilter, "schemaLogFilter");
  }
});
var Command;
var ClassBuilder;
var init_command2 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/command.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es19();
    init_dist_es();
    init_schemaLogFilter();
    Command = class {
      static {
        __name(this, "Command");
      }
      static {
        __name2(this, "Command");
      }
      middlewareStack = constructStack();
      schema;
      static classBuilder() {
        return new ClassBuilder();
      }
      resolveMiddlewareWithContext(clientStack, configuration, options, { middlewareFn, clientName, commandName, inputFilterSensitiveLog, outputFilterSensitiveLog, smithyContext, additionalContext, CommandCtor }) {
        for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
          this.middlewareStack.use(mw);
        }
        const stack = clientStack.concat(this.middlewareStack);
        const { logger: logger2 } = configuration;
        const handlerExecutionContext = {
          logger: logger2,
          clientName,
          commandName,
          inputFilterSensitiveLog,
          outputFilterSensitiveLog,
          [SMITHY_CONTEXT_KEY]: {
            commandInstance: this,
            ...smithyContext
          },
          ...additionalContext
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
      }
    };
    ClassBuilder = class {
      static {
        __name(this, "ClassBuilder");
      }
      static {
        __name2(this, "ClassBuilder");
      }
      _init = /* @__PURE__ */ __name2(() => {
      }, "_init");
      _ep = {};
      _middlewareFn = /* @__PURE__ */ __name2(() => [], "_middlewareFn");
      _commandName = "";
      _clientName = "";
      _additionalContext = {};
      _smithyContext = {};
      _inputFilterSensitiveLog = void 0;
      _outputFilterSensitiveLog = void 0;
      _serializer = null;
      _deserializer = null;
      _operationSchema;
      init(cb2) {
        this._init = cb2;
      }
      ep(endpointParameterInstructions) {
        this._ep = endpointParameterInstructions;
        return this;
      }
      m(middlewareSupplier) {
        this._middlewareFn = middlewareSupplier;
        return this;
      }
      s(service, operation2, smithyContext = {}) {
        this._smithyContext = {
          service,
          operation: operation2,
          ...smithyContext
        };
        return this;
      }
      c(additionalContext = {}) {
        this._additionalContext = additionalContext;
        return this;
      }
      n(clientName, commandName) {
        this._clientName = clientName;
        this._commandName = commandName;
        return this;
      }
      f(inputFilter = (_) => _, outputFilter = (_) => _) {
        this._inputFilterSensitiveLog = inputFilter;
        this._outputFilterSensitiveLog = outputFilter;
        return this;
      }
      ser(serializer) {
        this._serializer = serializer;
        return this;
      }
      de(deserializer) {
        this._deserializer = deserializer;
        return this;
      }
      sc(operation2) {
        this._operationSchema = operation2;
        this._smithyContext.operationSchema = operation2;
        return this;
      }
      build() {
        const closure = this;
        let CommandRef;
        return CommandRef = class extends Command {
          static {
            __name(this, "CommandRef");
          }
          static {
            __name2(this, "CommandRef");
          }
          input;
          static getEndpointParameterInstructions() {
            return closure._ep;
          }
          constructor(...[input]) {
            super();
            this.input = input ?? {};
            closure._init(this);
            this.schema = closure._operationSchema;
          }
          resolveMiddleware(stack, configuration, options) {
            const op = closure._operationSchema;
            const input = op?.[4] ?? op?.input;
            const output = op?.[5] ?? op?.output;
            return this.resolveMiddlewareWithContext(stack, configuration, options, {
              CommandCtor: CommandRef,
              middlewareFn: closure._middlewareFn,
              clientName: closure._clientName,
              commandName: closure._commandName,
              inputFilterSensitiveLog: closure._inputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, input) : (_) => _),
              outputFilterSensitiveLog: closure._outputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, output) : (_) => _),
              smithyContext: closure._smithyContext,
              additionalContext: closure._additionalContext
            });
          }
          serialize = closure._serializer;
          deserialize = closure._deserializer;
        };
      }
    };
  }
});
var init_constants4 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var createAggregatedClient;
var init_create_aggregated_client = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/create-aggregated-client.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    createAggregatedClient = /* @__PURE__ */ __name2((commands2, Client2) => {
      for (const command of Object.keys(commands2)) {
        const CommandCtor = commands2[command];
        const methodImpl = /* @__PURE__ */ __name2(async function(args, optionsOrCb, cb2) {
          const command2 = new CommandCtor(args);
          if (typeof optionsOrCb === "function") {
            this.send(command2, optionsOrCb);
          } else if (typeof cb2 === "function") {
            if (typeof optionsOrCb !== "object")
              throw new Error(`Expected http options but got ${typeof optionsOrCb}`);
            this.send(command2, optionsOrCb || {}, cb2);
          } else {
            return this.send(command2, optionsOrCb);
          }
        }, "methodImpl");
        const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
        Client2.prototype[methodName] = methodImpl;
      }
    }, "createAggregatedClient");
  }
});
var ServiceException;
var decorateServiceException;
var init_exceptions = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/exceptions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    ServiceException = class _ServiceException extends Error {
      static {
        __name(this, "_ServiceException");
      }
      static {
        __name2(this, "ServiceException");
      }
      $fault;
      $response;
      $retryable;
      $metadata;
      constructor(options) {
        super(options.message);
        Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype);
        this.name = options.name;
        this.$fault = options.$fault;
        this.$metadata = options.$metadata;
      }
      static isInstance(value) {
        if (!value)
          return false;
        const candidate = value;
        return _ServiceException.prototype.isPrototypeOf(candidate) || Boolean(candidate.$fault) && Boolean(candidate.$metadata) && (candidate.$fault === "client" || candidate.$fault === "server");
      }
      static [Symbol.hasInstance](instance) {
        if (!instance)
          return false;
        const candidate = instance;
        if (this === _ServiceException) {
          return _ServiceException.isInstance(instance);
        }
        if (_ServiceException.isInstance(instance)) {
          if (candidate.name && this.name) {
            return this.prototype.isPrototypeOf(instance) || candidate.name === this.name;
          }
          return this.prototype.isPrototypeOf(instance);
        }
        return false;
      }
    };
    decorateServiceException = /* @__PURE__ */ __name2((exception, additions = {}) => {
      Object.entries(additions).filter(([, v2]) => v2 !== void 0).forEach(([k2, v2]) => {
        if (exception[k2] == void 0 || exception[k2] === "") {
          exception[k2] = v2;
        }
      });
      const message = exception.message || exception.Message || "UnknownError";
      exception.message = message;
      delete exception.Message;
      return exception;
    }, "decorateServiceException");
  }
});
var init_default_error_handler = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/default-error-handler.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var loadConfigsForDefaultMode;
var init_defaults_mode = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/defaults-mode.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    loadConfigsForDefaultMode = /* @__PURE__ */ __name2((mode) => {
      switch (mode) {
        case "standard":
          return {
            retryMode: "standard",
            connectionTimeout: 3100
          };
        case "in-region":
          return {
            retryMode: "standard",
            connectionTimeout: 1100
          };
        case "cross-region":
          return {
            retryMode: "standard",
            connectionTimeout: 3100
          };
        case "mobile":
          return {
            retryMode: "standard",
            connectionTimeout: 3e4
          };
        default:
          return {};
      }
    }, "loadConfigsForDefaultMode");
  }
});
var init_emitWarningIfUnsupportedVersion2 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/emitWarningIfUnsupportedVersion.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_extended_encode_uri_component2 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/extended-encode-uri-component.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var getChecksumConfiguration;
var resolveChecksumRuntimeConfig;
var init_checksum3 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/extensions/checksum.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es();
    getChecksumConfiguration = /* @__PURE__ */ __name2((runtimeConfig) => {
      const checksumAlgorithms = [];
      for (const id in AlgorithmId) {
        const algorithmId = AlgorithmId[id];
        if (runtimeConfig[algorithmId] === void 0) {
          continue;
        }
        checksumAlgorithms.push({
          algorithmId: /* @__PURE__ */ __name2(() => algorithmId, "algorithmId"),
          checksumConstructor: /* @__PURE__ */ __name2(() => runtimeConfig[algorithmId], "checksumConstructor")
        });
      }
      return {
        addChecksumAlgorithm(algo) {
          checksumAlgorithms.push(algo);
        },
        checksumAlgorithms() {
          return checksumAlgorithms;
        }
      };
    }, "getChecksumConfiguration");
    resolveChecksumRuntimeConfig = /* @__PURE__ */ __name2((clientConfig) => {
      const runtimeConfig = {};
      clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
        runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
      });
      return runtimeConfig;
    }, "resolveChecksumRuntimeConfig");
  }
});
var getRetryConfiguration;
var resolveRetryRuntimeConfig;
var init_retry2 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/extensions/retry.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getRetryConfiguration = /* @__PURE__ */ __name2((runtimeConfig) => {
      return {
        setRetryStrategy(retryStrategy) {
          runtimeConfig.retryStrategy = retryStrategy;
        },
        retryStrategy() {
          return runtimeConfig.retryStrategy;
        }
      };
    }, "getRetryConfiguration");
    resolveRetryRuntimeConfig = /* @__PURE__ */ __name2((retryStrategyConfiguration) => {
      const runtimeConfig = {};
      runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
      return runtimeConfig;
    }, "resolveRetryRuntimeConfig");
  }
});
var getDefaultExtensionConfiguration;
var resolveDefaultRuntimeConfig;
var init_defaultExtensionConfiguration2 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/extensions/defaultExtensionConfiguration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_checksum3();
    init_retry2();
    getDefaultExtensionConfiguration = /* @__PURE__ */ __name2((runtimeConfig) => {
      return Object.assign(getChecksumConfiguration(runtimeConfig), getRetryConfiguration(runtimeConfig));
    }, "getDefaultExtensionConfiguration");
    resolveDefaultRuntimeConfig = /* @__PURE__ */ __name2((config) => {
      return Object.assign(resolveChecksumRuntimeConfig(config), resolveRetryRuntimeConfig(config));
    }, "resolveDefaultRuntimeConfig");
  }
});
var init_extensions3 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/extensions/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_defaultExtensionConfiguration2();
  }
});
var init_get_array_if_single_item = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/get-array-if-single-item.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var getValueFromTextNode;
var init_get_value_from_text_node = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/get-value-from-text-node.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getValueFromTextNode = /* @__PURE__ */ __name2((obj) => {
      const textNodeName = "#text";
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key][textNodeName] !== void 0) {
          obj[key] = obj[key][textNodeName];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          obj[key] = getValueFromTextNode(obj[key]);
        }
      }
      return obj;
    }, "getValueFromTextNode");
  }
});
var init_is_serializable_header_value = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/is-serializable-header-value.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var NoOpLogger;
var init_NoOpLogger = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/NoOpLogger.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    NoOpLogger = class {
      static {
        __name(this, "NoOpLogger");
      }
      static {
        __name2(this, "NoOpLogger");
      }
      trace() {
      }
      debug() {
      }
      info() {
      }
      warn() {
      }
      error() {
      }
    };
  }
});
var init_object_mapping = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/object-mapping.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_resolve_path2 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/resolve-path.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_ser_utils = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/ser-utils.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_serde_json = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/serde-json.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es20 = __esm({
  "../node_modules/@smithy/smithy-client/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_client3();
    init_collect_stream_body2();
    init_command2();
    init_constants4();
    init_create_aggregated_client();
    init_default_error_handler();
    init_defaults_mode();
    init_emitWarningIfUnsupportedVersion2();
    init_exceptions();
    init_extended_encode_uri_component2();
    init_extensions3();
    init_get_array_if_single_item();
    init_get_value_from_text_node();
    init_is_serializable_header_value();
    init_NoOpLogger();
    init_object_mapping();
    init_resolve_path2();
    init_ser_utils();
    init_serde_json();
    init_serde2();
  }
});
var ProtocolLib;
var init_ProtocolLib = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/ProtocolLib.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_dist_es20();
    ProtocolLib = class {
      static {
        __name(this, "ProtocolLib");
      }
      static {
        __name2(this, "ProtocolLib");
      }
      queryCompat;
      constructor(queryCompat = false) {
        this.queryCompat = queryCompat;
      }
      resolveRestContentType(defaultContentType, inputSchema) {
        const members = inputSchema.getMemberSchemas();
        const httpPayloadMember = Object.values(members).find((m2) => {
          return !!m2.getMergedTraits().httpPayload;
        });
        if (httpPayloadMember) {
          const mediaType = httpPayloadMember.getMergedTraits().mediaType;
          if (mediaType) {
            return mediaType;
          } else if (httpPayloadMember.isStringSchema()) {
            return "text/plain";
          } else if (httpPayloadMember.isBlobSchema()) {
            return "application/octet-stream";
          } else {
            return defaultContentType;
          }
        } else if (!inputSchema.isUnitSchema()) {
          const hasBody = Object.values(members).find((m2) => {
            const { httpQuery, httpQueryParams, httpHeader, httpLabel, httpPrefixHeaders } = m2.getMergedTraits();
            const noPrefixHeaders = httpPrefixHeaders === void 0;
            return !httpQuery && !httpQueryParams && !httpHeader && !httpLabel && noPrefixHeaders;
          });
          if (hasBody) {
            return defaultContentType;
          }
        }
      }
      async getErrorSchemaOrThrowBaseException(errorIdentifier, defaultNamespace, response, dataObject, metadata, getErrorSchema) {
        let namespace = defaultNamespace;
        let errorName = errorIdentifier;
        if (errorIdentifier.includes("#")) {
          [namespace, errorName] = errorIdentifier.split("#");
        }
        const errorMetadata = {
          $metadata: metadata,
          $fault: response.statusCode < 500 ? "client" : "server"
        };
        const registry = TypeRegistry.for(namespace);
        try {
          const errorSchema = getErrorSchema?.(registry, errorName) ?? registry.getSchema(errorIdentifier);
          return { errorSchema, errorMetadata };
        } catch (e2) {
          dataObject.message = dataObject.message ?? dataObject.Message ?? "UnknownError";
          const synthetic = TypeRegistry.for("smithy.ts.sdk.synthetic." + namespace);
          const baseExceptionSchema = synthetic.getBaseException();
          if (baseExceptionSchema) {
            const ErrorCtor = synthetic.getErrorCtor(baseExceptionSchema) ?? Error;
            throw this.decorateServiceException(Object.assign(new ErrorCtor({ name: errorName }), errorMetadata), dataObject);
          }
          throw this.decorateServiceException(Object.assign(new Error(errorName), errorMetadata), dataObject);
        }
      }
      decorateServiceException(exception, additions = {}) {
        if (this.queryCompat) {
          const msg = exception.Message ?? additions.Message;
          const error = decorateServiceException(exception, additions);
          if (msg) {
            error.message = msg;
          }
          error.Error = {
            ...error.Error,
            Type: error.Error.Type,
            Code: error.Error.Code,
            Message: error.Error.message ?? error.Error.Message ?? msg
          };
          const reqId = error.$metadata.requestId;
          if (reqId) {
            error.RequestId = reqId;
          }
          return error;
        }
        return decorateServiceException(exception, additions);
      }
      setQueryCompatError(output, response) {
        const queryErrorHeader = response.headers?.["x-amzn-query-error"];
        if (output !== void 0 && queryErrorHeader != null) {
          const [Code, Type] = queryErrorHeader.split(";");
          const entries = Object.entries(output);
          const Error2 = {
            Code,
            Type
          };
          Object.assign(output, Error2);
          for (const [k2, v2] of entries) {
            Error2[k2 === "message" ? "Message" : k2] = v2;
          }
          delete Error2.__type;
          output.Error = Error2;
        }
      }
      queryCompatOutput(queryCompatErrorData, errorData) {
        if (queryCompatErrorData.Error) {
          errorData.Error = queryCompatErrorData.Error;
        }
        if (queryCompatErrorData.Type) {
          errorData.Type = queryCompatErrorData.Type;
        }
        if (queryCompatErrorData.Code) {
          errorData.Code = queryCompatErrorData.Code;
        }
      }
      findQueryCompatibleError(registry, errorName) {
        try {
          return registry.getSchema(errorName);
        } catch (e2) {
          return registry.find((schema) => NormalizedSchema.of(schema).getMergedTraits().awsQueryError?.[0] === errorName);
        }
      }
    };
  }
});
var init_AwsSmithyRpcV2CborProtocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/cbor/AwsSmithyRpcV2CborProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_coercing_serializers = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/coercing-serializers.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var SerdeContextConfig;
var init_ConfigurableSerdeContext = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/ConfigurableSerdeContext.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SerdeContextConfig = class {
      static {
        __name(this, "SerdeContextConfig");
      }
      static {
        __name2(this, "SerdeContextConfig");
      }
      serdeContext;
      setSerdeContext(serdeContext) {
        this.serdeContext = serdeContext;
      }
    };
  }
});
function* serializingStructIterator(ns, sourceObject) {
  if (ns.isUnitSchema()) {
    return;
  }
  const struct = ns.getSchema();
  for (let i2 = 0; i2 < struct[4].length; ++i2) {
    const key = struct[4][i2];
    const memberSchema = struct[5][i2];
    const memberNs = new NormalizedSchema([memberSchema, 0], key);
    if (!(key in sourceObject) && !memberNs.isIdempotencyToken()) {
      continue;
    }
    yield [key, memberNs];
  }
}
__name(serializingStructIterator, "serializingStructIterator");
var init_structIterator = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/structIterator.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    __name2(serializingStructIterator, "serializingStructIterator");
  }
});
var UnionSerde;
var init_UnionSerde = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/UnionSerde.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    UnionSerde = class {
      static {
        __name(this, "UnionSerde");
      }
      static {
        __name2(this, "UnionSerde");
      }
      from;
      to;
      keys;
      constructor(from, to) {
        this.from = from;
        this.to = to;
        this.keys = new Set(Object.keys(this.from).filter((k2) => k2 !== "__type"));
      }
      mark(key) {
        this.keys.delete(key);
      }
      hasUnknown() {
        return this.keys.size === 1 && Object.keys(this.to).length === 0;
      }
      writeUnknown() {
        if (this.hasUnknown()) {
          const k2 = this.keys.values().next().value;
          const v2 = this.from[k2];
          this.to.$unknown = [k2, v2];
        }
      }
    };
  }
});
var init_parseJsonBody = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/parseJsonBody.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_JsonShapeDeserializer = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/JsonShapeDeserializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_JsonShapeSerializer = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/JsonShapeSerializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_JsonCodec = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/JsonCodec.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_AwsJsonRpcProtocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsJsonRpcProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_AwsJson1_0Protocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsJson1_0Protocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_AwsJson1_1Protocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsJson1_1Protocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_AwsRestJsonProtocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsRestJsonProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_awsExpectUnion = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/awsExpectUnion.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(escapeAttribute, "escapeAttribute");
var init_escape_attribute = __esm({
  "../node_modules/@aws-sdk/xml-builder/dist-es/escape-attribute.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(escapeAttribute, "escapeAttribute");
  }
});
function escapeElement(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#x0D;").replace(/\n/g, "&#x0A;").replace(/\u0085/g, "&#x85;").replace(/\u2028/, "&#x2028;");
}
__name(escapeElement, "escapeElement");
var init_escape_element = __esm({
  "../node_modules/@aws-sdk/xml-builder/dist-es/escape-element.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(escapeElement, "escapeElement");
  }
});
var XmlText;
var init_XmlText = __esm({
  "../node_modules/@aws-sdk/xml-builder/dist-es/XmlText.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_escape_element();
    XmlText = class {
      static {
        __name(this, "XmlText");
      }
      static {
        __name2(this, "XmlText");
      }
      value;
      constructor(value) {
        this.value = value;
      }
      toString() {
        return escapeElement("" + this.value);
      }
    };
  }
});
var XmlNode;
var init_XmlNode = __esm({
  "../node_modules/@aws-sdk/xml-builder/dist-es/XmlNode.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_escape_attribute();
    init_XmlText();
    XmlNode = class _XmlNode {
      static {
        __name(this, "_XmlNode");
      }
      static {
        __name2(this, "XmlNode");
      }
      name;
      children;
      attributes = {};
      static of(name, childText, withName) {
        const node = new _XmlNode(name);
        if (childText !== void 0) {
          node.addChildNode(new XmlText(childText));
        }
        if (withName !== void 0) {
          node.withName(withName);
        }
        return node;
      }
      constructor(name, children = []) {
        this.name = name;
        this.children = children;
      }
      withName(name) {
        this.name = name;
        return this;
      }
      addAttribute(name, value) {
        this.attributes[name] = value;
        return this;
      }
      addChildNode(child) {
        this.children.push(child);
        return this;
      }
      removeAttribute(name) {
        delete this.attributes[name];
        return this;
      }
      n(name) {
        this.name = name;
        return this;
      }
      c(child) {
        this.children.push(child);
        return this;
      }
      a(name, value) {
        if (value != null) {
          this.attributes[name] = value;
        }
        return this;
      }
      cc(input, field, withName = field) {
        if (input[field] != null) {
          const node = _XmlNode.of(field, input[field]).withName(withName);
          this.c(node);
        }
      }
      l(input, listName, memberName, valueProvider) {
        if (input[listName] != null) {
          const nodes = valueProvider();
          nodes.map((node) => {
            node.withName(memberName);
            this.c(node);
          });
        }
      }
      lc(input, listName, memberName, valueProvider) {
        if (input[listName] != null) {
          const nodes = valueProvider();
          const containerNode = new _XmlNode(memberName);
          nodes.map((node) => {
            containerNode.c(node);
          });
          this.c(containerNode);
        }
      }
      toString() {
        const hasChildren = Boolean(this.children.length);
        let xmlText = `<${this.name}`;
        const attributes = this.attributes;
        for (const attributeName of Object.keys(attributes)) {
          const attribute = attributes[attributeName];
          if (attribute != null) {
            xmlText += ` ${attributeName}="${escapeAttribute("" + attribute)}"`;
          }
        }
        return xmlText += !hasChildren ? "/>" : `>${this.children.map((c2) => c2.toString()).join("")}</${this.name}>`;
      }
    };
  }
});
function parseXML(xmlString) {
  if (!parser) {
    parser = new DOMParser();
  }
  const xmlDocument = parser.parseFromString(xmlString, "application/xml");
  if (xmlDocument.getElementsByTagName("parsererror").length > 0) {
    throw new Error("DOMParser XML parsing error.");
  }
  const xmlToObj = /* @__PURE__ */ __name2((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) {
        return node.textContent;
      }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node;
      if (element.attributes.length === 0 && element.childNodes.length === 0) {
        return "";
      }
      const obj = {};
      const attributes = Array.from(element.attributes);
      for (const attr of attributes) {
        obj[`${attr.name}`] = attr.value;
      }
      const childNodes = Array.from(element.childNodes);
      for (const child of childNodes) {
        const childResult = xmlToObj(child);
        if (childResult != null) {
          const childName = child.nodeName;
          if (childNodes.length === 1 && attributes.length === 0 && childName === "#text") {
            return childResult;
          }
          if (obj[childName]) {
            if (Array.isArray(obj[childName])) {
              obj[childName].push(childResult);
            } else {
              obj[childName] = [obj[childName], childResult];
            }
          } else {
            obj[childName] = childResult;
          }
        } else if (childNodes.length === 1 && attributes.length === 0) {
          return element.textContent;
        }
      }
      return obj;
    }
    return null;
  }, "xmlToObj");
  return {
    [xmlDocument.documentElement.nodeName]: xmlToObj(xmlDocument.documentElement)
  };
}
__name(parseXML, "parseXML");
var parser;
var init_xml_parser_browser = __esm({
  "../node_modules/@aws-sdk/xml-builder/dist-es/xml-parser.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(parseXML, "parseXML");
  }
});
var init_dist_es21 = __esm({
  "../node_modules/@aws-sdk/xml-builder/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_XmlNode();
    init_XmlText();
    init_xml_parser_browser();
  }
});
var XmlShapeDeserializer;
var init_XmlShapeDeserializer = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/XmlShapeDeserializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es21();
    init_protocols();
    init_schema2();
    init_dist_es20();
    init_dist_es6();
    init_ConfigurableSerdeContext();
    init_UnionSerde();
    XmlShapeDeserializer = class extends SerdeContextConfig {
      static {
        __name(this, "XmlShapeDeserializer");
      }
      static {
        __name2(this, "XmlShapeDeserializer");
      }
      settings;
      stringDeserializer;
      constructor(settings) {
        super();
        this.settings = settings;
        this.stringDeserializer = new FromStringShapeDeserializer(settings);
      }
      setSerdeContext(serdeContext) {
        this.serdeContext = serdeContext;
        this.stringDeserializer.setSerdeContext(serdeContext);
      }
      read(schema, bytes, key) {
        const ns = NormalizedSchema.of(schema);
        const memberSchemas = ns.getMemberSchemas();
        const isEventPayload = ns.isStructSchema() && ns.isMemberSchema() && !!Object.values(memberSchemas).find((memberNs) => {
          return !!memberNs.getMemberTraits().eventPayload;
        });
        if (isEventPayload) {
          const output = {};
          const memberName = Object.keys(memberSchemas)[0];
          const eventMemberSchema = memberSchemas[memberName];
          if (eventMemberSchema.isBlobSchema()) {
            output[memberName] = bytes;
          } else {
            output[memberName] = this.read(memberSchemas[memberName], bytes);
          }
          return output;
        }
        const xmlString = (this.serdeContext?.utf8Encoder ?? toUtf8)(bytes);
        const parsedObject = this.parseXml(xmlString);
        return this.readSchema(schema, key ? parsedObject[key] : parsedObject);
      }
      readSchema(_schema, value) {
        const ns = NormalizedSchema.of(_schema);
        if (ns.isUnitSchema()) {
          return;
        }
        const traits = ns.getMergedTraits();
        if (ns.isListSchema() && !Array.isArray(value)) {
          return this.readSchema(ns, [value]);
        }
        if (value == null) {
          return value;
        }
        if (typeof value === "object") {
          const sparse = !!traits.sparse;
          const flat = !!traits.xmlFlattened;
          if (ns.isListSchema()) {
            const listValue = ns.getValueSchema();
            const buffer2 = [];
            const sourceKey = listValue.getMergedTraits().xmlName ?? "member";
            const source = flat ? value : (value[0] ?? value)[sourceKey];
            const sourceArray = Array.isArray(source) ? source : [source];
            for (const v2 of sourceArray) {
              if (v2 != null || sparse) {
                buffer2.push(this.readSchema(listValue, v2));
              }
            }
            return buffer2;
          }
          const buffer = {};
          if (ns.isMapSchema()) {
            const keyNs = ns.getKeySchema();
            const memberNs = ns.getValueSchema();
            let entries;
            if (flat) {
              entries = Array.isArray(value) ? value : [value];
            } else {
              entries = Array.isArray(value.entry) ? value.entry : [value.entry];
            }
            const keyProperty = keyNs.getMergedTraits().xmlName ?? "key";
            const valueProperty = memberNs.getMergedTraits().xmlName ?? "value";
            for (const entry of entries) {
              const key = entry[keyProperty];
              const value2 = entry[valueProperty];
              if (value2 != null || sparse) {
                buffer[key] = this.readSchema(memberNs, value2);
              }
            }
            return buffer;
          }
          if (ns.isStructSchema()) {
            const union = ns.isUnionSchema();
            let unionSerde;
            if (union) {
              unionSerde = new UnionSerde(value, buffer);
            }
            for (const [memberName, memberSchema] of ns.structIterator()) {
              const memberTraits = memberSchema.getMergedTraits();
              const xmlObjectKey = !memberTraits.httpPayload ? memberSchema.getMemberTraits().xmlName ?? memberName : memberTraits.xmlName ?? memberSchema.getName();
              if (union) {
                unionSerde.mark(xmlObjectKey);
              }
              if (value[xmlObjectKey] != null) {
                buffer[memberName] = this.readSchema(memberSchema, value[xmlObjectKey]);
              }
            }
            if (union) {
              unionSerde.writeUnknown();
            }
            return buffer;
          }
          if (ns.isDocumentSchema()) {
            return value;
          }
          throw new Error(`@aws-sdk/core/protocols - xml deserializer unhandled schema type for ${ns.getName(true)}`);
        }
        if (ns.isListSchema()) {
          return [];
        }
        if (ns.isMapSchema() || ns.isStructSchema()) {
          return {};
        }
        return this.stringDeserializer.read(ns, value);
      }
      parseXml(xml) {
        if (xml.length) {
          let parsedObj;
          try {
            parsedObj = parseXML(xml);
          } catch (e2) {
            if (e2 && typeof e2 === "object") {
              Object.defineProperty(e2, "$responseBodyText", {
                value: xml
              });
            }
            throw e2;
          }
          const textNodeName = "#text";
          const key = Object.keys(parsedObj)[0];
          const parsedObjToReturn = parsedObj[key];
          if (parsedObjToReturn[textNodeName]) {
            parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
            delete parsedObjToReturn[textNodeName];
          }
          return getValueFromTextNode(parsedObjToReturn);
        }
        return {};
      }
    };
  }
});
var init_AwsQueryProtocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/query/AwsQueryProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_AwsEc2QueryProtocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/query/AwsEc2QueryProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var loadRestXmlErrorCode;
var init_parseXmlBody = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/parseXmlBody.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    loadRestXmlErrorCode = /* @__PURE__ */ __name2((output, data) => {
      if (data?.Error?.Code !== void 0) {
        return data.Error.Code;
      }
      if (data?.Code !== void 0) {
        return data.Code;
      }
      if (output.statusCode == 404) {
        return "NotFound";
      }
    }, "loadRestXmlErrorCode");
  }
});
var XmlShapeSerializer;
var init_XmlShapeSerializer = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/XmlShapeSerializer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es21();
    init_protocols();
    init_schema2();
    init_serde2();
    init_dist_es20();
    init_dist_es7();
    init_ConfigurableSerdeContext();
    init_structIterator();
    XmlShapeSerializer = class extends SerdeContextConfig {
      static {
        __name(this, "XmlShapeSerializer");
      }
      static {
        __name2(this, "XmlShapeSerializer");
      }
      settings;
      stringBuffer;
      byteBuffer;
      buffer;
      constructor(settings) {
        super();
        this.settings = settings;
      }
      write(schema, value) {
        const ns = NormalizedSchema.of(schema);
        if (ns.isStringSchema() && typeof value === "string") {
          this.stringBuffer = value;
        } else if (ns.isBlobSchema()) {
          this.byteBuffer = "byteLength" in value ? value : (this.serdeContext?.base64Decoder ?? fromBase64)(value);
        } else {
          this.buffer = this.writeStruct(ns, value, void 0);
          const traits = ns.getMergedTraits();
          if (traits.httpPayload && !traits.xmlName) {
            this.buffer.withName(ns.getName());
          }
        }
      }
      flush() {
        if (this.byteBuffer !== void 0) {
          const bytes = this.byteBuffer;
          delete this.byteBuffer;
          return bytes;
        }
        if (this.stringBuffer !== void 0) {
          const str = this.stringBuffer;
          delete this.stringBuffer;
          return str;
        }
        const buffer = this.buffer;
        if (this.settings.xmlNamespace) {
          if (!buffer?.attributes?.["xmlns"]) {
            buffer.addAttribute("xmlns", this.settings.xmlNamespace);
          }
        }
        delete this.buffer;
        return buffer.toString();
      }
      writeStruct(ns, value, parentXmlns) {
        const traits = ns.getMergedTraits();
        const name = ns.isMemberSchema() && !traits.httpPayload ? ns.getMemberTraits().xmlName ?? ns.getMemberName() : traits.xmlName ?? ns.getName();
        if (!name || !ns.isStructSchema()) {
          throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write struct with empty name or non-struct, schema=${ns.getName(true)}.`);
        }
        const structXmlNode = XmlNode.of(name);
        const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
        for (const [memberName, memberSchema] of serializingStructIterator(ns, value)) {
          const val = value[memberName];
          if (val != null || memberSchema.isIdempotencyToken()) {
            if (memberSchema.getMergedTraits().xmlAttribute) {
              structXmlNode.addAttribute(memberSchema.getMergedTraits().xmlName ?? memberName, this.writeSimple(memberSchema, val));
              continue;
            }
            if (memberSchema.isListSchema()) {
              this.writeList(memberSchema, val, structXmlNode, xmlns);
            } else if (memberSchema.isMapSchema()) {
              this.writeMap(memberSchema, val, structXmlNode, xmlns);
            } else if (memberSchema.isStructSchema()) {
              structXmlNode.addChildNode(this.writeStruct(memberSchema, val, xmlns));
            } else {
              const memberNode = XmlNode.of(memberSchema.getMergedTraits().xmlName ?? memberSchema.getMemberName());
              this.writeSimpleInto(memberSchema, val, memberNode, xmlns);
              structXmlNode.addChildNode(memberNode);
            }
          }
        }
        const { $unknown } = value;
        if ($unknown && ns.isUnionSchema() && Array.isArray($unknown) && Object.keys(value).length === 1) {
          const [k2, v2] = $unknown;
          const node = XmlNode.of(k2);
          if (typeof v2 !== "string") {
            if (value instanceof XmlNode || value instanceof XmlText) {
              structXmlNode.addChildNode(value);
            } else {
              throw new Error(`@aws-sdk - $unknown union member in XML requires value of type string, @aws-sdk/xml-builder::XmlNode or XmlText.`);
            }
          }
          this.writeSimpleInto(0, v2, node, xmlns);
          structXmlNode.addChildNode(node);
        }
        if (xmlns) {
          structXmlNode.addAttribute(xmlnsAttr, xmlns);
        }
        return structXmlNode;
      }
      writeList(listMember, array, container, parentXmlns) {
        if (!listMember.isMemberSchema()) {
          throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member list: ${listMember.getName(true)}`);
        }
        const listTraits = listMember.getMergedTraits();
        const listValueSchema = listMember.getValueSchema();
        const listValueTraits = listValueSchema.getMergedTraits();
        const sparse = !!listValueTraits.sparse;
        const flat = !!listTraits.xmlFlattened;
        const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(listMember, parentXmlns);
        const writeItem = /* @__PURE__ */ __name2((container2, value) => {
          if (listValueSchema.isListSchema()) {
            this.writeList(listValueSchema, Array.isArray(value) ? value : [value], container2, xmlns);
          } else if (listValueSchema.isMapSchema()) {
            this.writeMap(listValueSchema, value, container2, xmlns);
          } else if (listValueSchema.isStructSchema()) {
            const struct = this.writeStruct(listValueSchema, value, xmlns);
            container2.addChildNode(struct.withName(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member"));
          } else {
            const listItemNode = XmlNode.of(flat ? listTraits.xmlName ?? listMember.getMemberName() : listValueTraits.xmlName ?? "member");
            this.writeSimpleInto(listValueSchema, value, listItemNode, xmlns);
            container2.addChildNode(listItemNode);
          }
        }, "writeItem");
        if (flat) {
          for (const value of array) {
            if (sparse || value != null) {
              writeItem(container, value);
            }
          }
        } else {
          const listNode = XmlNode.of(listTraits.xmlName ?? listMember.getMemberName());
          if (xmlns) {
            listNode.addAttribute(xmlnsAttr, xmlns);
          }
          for (const value of array) {
            if (sparse || value != null) {
              writeItem(listNode, value);
            }
          }
          container.addChildNode(listNode);
        }
      }
      writeMap(mapMember, map, container, parentXmlns, containerIsMap = false) {
        if (!mapMember.isMemberSchema()) {
          throw new Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member map: ${mapMember.getName(true)}`);
        }
        const mapTraits = mapMember.getMergedTraits();
        const mapKeySchema = mapMember.getKeySchema();
        const mapKeyTraits = mapKeySchema.getMergedTraits();
        const keyTag = mapKeyTraits.xmlName ?? "key";
        const mapValueSchema = mapMember.getValueSchema();
        const mapValueTraits = mapValueSchema.getMergedTraits();
        const valueTag = mapValueTraits.xmlName ?? "value";
        const sparse = !!mapValueTraits.sparse;
        const flat = !!mapTraits.xmlFlattened;
        const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(mapMember, parentXmlns);
        const addKeyValue = /* @__PURE__ */ __name2((entry, key, val) => {
          const keyNode = XmlNode.of(keyTag, key);
          const [keyXmlnsAttr, keyXmlns] = this.getXmlnsAttribute(mapKeySchema, xmlns);
          if (keyXmlns) {
            keyNode.addAttribute(keyXmlnsAttr, keyXmlns);
          }
          entry.addChildNode(keyNode);
          let valueNode = XmlNode.of(valueTag);
          if (mapValueSchema.isListSchema()) {
            this.writeList(mapValueSchema, val, valueNode, xmlns);
          } else if (mapValueSchema.isMapSchema()) {
            this.writeMap(mapValueSchema, val, valueNode, xmlns, true);
          } else if (mapValueSchema.isStructSchema()) {
            valueNode = this.writeStruct(mapValueSchema, val, xmlns);
          } else {
            this.writeSimpleInto(mapValueSchema, val, valueNode, xmlns);
          }
          entry.addChildNode(valueNode);
        }, "addKeyValue");
        if (flat) {
          for (const [key, val] of Object.entries(map)) {
            if (sparse || val != null) {
              const entry = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
              addKeyValue(entry, key, val);
              container.addChildNode(entry);
            }
          }
        } else {
          let mapNode;
          if (!containerIsMap) {
            mapNode = XmlNode.of(mapTraits.xmlName ?? mapMember.getMemberName());
            if (xmlns) {
              mapNode.addAttribute(xmlnsAttr, xmlns);
            }
            container.addChildNode(mapNode);
          }
          for (const [key, val] of Object.entries(map)) {
            if (sparse || val != null) {
              const entry = XmlNode.of("entry");
              addKeyValue(entry, key, val);
              (containerIsMap ? container : mapNode).addChildNode(entry);
            }
          }
        }
      }
      writeSimple(_schema, value) {
        if (null === value) {
          throw new Error("@aws-sdk/core/protocols - (XML serializer) cannot write null value.");
        }
        const ns = NormalizedSchema.of(_schema);
        let nodeContents = null;
        if (value && typeof value === "object") {
          if (ns.isBlobSchema()) {
            nodeContents = (this.serdeContext?.base64Encoder ?? toBase64)(value);
          } else if (ns.isTimestampSchema() && value instanceof Date) {
            const format2 = determineTimestampFormat(ns, this.settings);
            switch (format2) {
              case 5:
                nodeContents = value.toISOString().replace(".000Z", "Z");
                break;
              case 6:
                nodeContents = dateToUtcString(value);
                break;
              case 7:
                nodeContents = String(value.getTime() / 1e3);
                break;
              default:
                console.warn("Missing timestamp format, using http date", value);
                nodeContents = dateToUtcString(value);
                break;
            }
          } else if (ns.isBigDecimalSchema() && value) {
            if (value instanceof NumericValue) {
              return value.string;
            }
            return String(value);
          } else if (ns.isMapSchema() || ns.isListSchema()) {
            throw new Error("@aws-sdk/core/protocols - xml serializer, cannot call _write() on List/Map schema, call writeList or writeMap() instead.");
          } else {
            throw new Error(`@aws-sdk/core/protocols - xml serializer, unhandled schema type for object value and schema: ${ns.getName(true)}`);
          }
        }
        if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isBigIntegerSchema() || ns.isBigDecimalSchema()) {
          nodeContents = String(value);
        }
        if (ns.isStringSchema()) {
          if (value === void 0 && ns.isIdempotencyToken()) {
            nodeContents = v4();
          } else {
            nodeContents = String(value);
          }
        }
        if (nodeContents === null) {
          throw new Error(`Unhandled schema-value pair ${ns.getName(true)}=${value}`);
        }
        return nodeContents;
      }
      writeSimpleInto(_schema, value, into, parentXmlns) {
        const nodeContents = this.writeSimple(_schema, value);
        const ns = NormalizedSchema.of(_schema);
        const content = new XmlText(nodeContents);
        const [xmlnsAttr, xmlns] = this.getXmlnsAttribute(ns, parentXmlns);
        if (xmlns) {
          into.addAttribute(xmlnsAttr, xmlns);
        }
        into.addChildNode(content);
      }
      getXmlnsAttribute(ns, parentXmlns) {
        const traits = ns.getMergedTraits();
        const [prefix, xmlns] = traits.xmlNamespace ?? [];
        if (xmlns && xmlns !== parentXmlns) {
          return [prefix ? `xmlns:${prefix}` : "xmlns", xmlns];
        }
        return [void 0, void 0];
      }
    };
  }
});
var XmlCodec;
var init_XmlCodec = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/XmlCodec.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_ConfigurableSerdeContext();
    init_XmlShapeDeserializer();
    init_XmlShapeSerializer();
    XmlCodec = class extends SerdeContextConfig {
      static {
        __name(this, "XmlCodec");
      }
      static {
        __name2(this, "XmlCodec");
      }
      settings;
      constructor(settings) {
        super();
        this.settings = settings;
      }
      createSerializer() {
        const serializer = new XmlShapeSerializer(this.settings);
        serializer.setSerdeContext(this.serdeContext);
        return serializer;
      }
      createDeserializer() {
        const deserializer = new XmlShapeDeserializer(this.settings);
        deserializer.setSerdeContext(this.serdeContext);
        return deserializer;
      }
    };
  }
});
var AwsRestXmlProtocol;
var init_AwsRestXmlProtocol = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/AwsRestXmlProtocol.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_protocols();
    init_schema2();
    init_ProtocolLib();
    init_parseXmlBody();
    init_XmlCodec();
    AwsRestXmlProtocol = class extends HttpBindingProtocol {
      static {
        __name(this, "AwsRestXmlProtocol");
      }
      static {
        __name2(this, "AwsRestXmlProtocol");
      }
      codec;
      serializer;
      deserializer;
      mixin = new ProtocolLib();
      constructor(options) {
        super(options);
        const settings = {
          timestampFormat: {
            useTrait: true,
            default: 5
          },
          httpBindings: true,
          xmlNamespace: options.xmlNamespace,
          serviceNamespace: options.defaultNamespace
        };
        this.codec = new XmlCodec(settings);
        this.serializer = new HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
        this.deserializer = new HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
      }
      getPayloadCodec() {
        return this.codec;
      }
      getShapeId() {
        return "aws.protocols#restXml";
      }
      async serializeRequest(operationSchema, input, context) {
        const request = await super.serializeRequest(operationSchema, input, context);
        const inputSchema = NormalizedSchema.of(operationSchema.input);
        if (!request.headers["content-type"]) {
          const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
          if (contentType) {
            request.headers["content-type"] = contentType;
          }
        }
        if (typeof request.body === "string" && request.headers["content-type"] === this.getDefaultContentType() && !request.body.startsWith("<?xml ") && !this.hasUnstructuredPayloadBinding(inputSchema)) {
          request.body = '<?xml version="1.0" encoding="UTF-8"?>' + request.body;
        }
        return request;
      }
      async deserializeResponse(operationSchema, context, response) {
        return super.deserializeResponse(operationSchema, context, response);
      }
      async handleError(operationSchema, context, response, dataObject, metadata) {
        const errorIdentifier = loadRestXmlErrorCode(response, dataObject) ?? "Unknown";
        const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
        const ns = NormalizedSchema.of(errorSchema);
        const message = dataObject.Error?.message ?? dataObject.Error?.Message ?? dataObject.message ?? dataObject.Message ?? "Unknown";
        const ErrorCtor = TypeRegistry.for(errorSchema[1]).getErrorCtor(errorSchema) ?? Error;
        const exception = new ErrorCtor(message);
        await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
        const output = {};
        for (const [name, member2] of ns.structIterator()) {
          const target = member2.getMergedTraits().xmlName ?? name;
          const value = dataObject.Error?.[target] ?? dataObject[target];
          output[name] = this.codec.createDeserializer().readSchema(member2, value);
        }
        throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
          $fault: ns.getMergedTraits().error,
          message
        }, output), dataObject);
      }
      getDefaultContentType() {
        return "application/xml";
      }
      hasUnstructuredPayloadBinding(ns) {
        for (const [, member2] of ns.structIterator()) {
          if (member2.getMergedTraits().httpPayload) {
            return !(member2.isStructSchema() || member2.isMapSchema() || member2.isListSchema());
          }
        }
        return false;
      }
    };
  }
});
var init_protocols2 = __esm({
  "../node_modules/@aws-sdk/core/dist-es/submodules/protocols/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_AwsSmithyRpcV2CborProtocol();
    init_coercing_serializers();
    init_AwsJson1_0Protocol();
    init_AwsJson1_1Protocol();
    init_AwsJsonRpcProtocol();
    init_AwsRestJsonProtocol();
    init_JsonCodec();
    init_JsonShapeDeserializer();
    init_JsonShapeSerializer();
    init_awsExpectUnion();
    init_parseJsonBody();
    init_AwsEc2QueryProtocol();
    init_AwsQueryProtocol();
    init_AwsRestXmlProtocol();
    init_XmlCodec();
    init_XmlShapeDeserializer();
    init_XmlShapeSerializer();
    init_parseXmlBody();
  }
});
var init_dist_es22 = __esm({
  "../node_modules/@aws-sdk/core/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_client2();
    init_httpAuthSchemes2();
    init_protocols2();
  }
});
var CLIENT_SUPPORTED_ALGORITHMS;
var PRIORITY_ORDER_ALGORITHMS;
var init_types2 = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants2();
    CLIENT_SUPPORTED_ALGORITHMS = [
      ChecksumAlgorithm.CRC32,
      ChecksumAlgorithm.CRC32C,
      ChecksumAlgorithm.CRC64NVME,
      ChecksumAlgorithm.SHA1,
      ChecksumAlgorithm.SHA256
    ];
    PRIORITY_ORDER_ALGORITHMS = [
      ChecksumAlgorithm.SHA256,
      ChecksumAlgorithm.SHA1,
      ChecksumAlgorithm.CRC32,
      ChecksumAlgorithm.CRC32C,
      ChecksumAlgorithm.CRC64NVME
    ];
  }
});
var getChecksumAlgorithmForRequest;
var init_getChecksumAlgorithmForRequest = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumAlgorithmForRequest.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants2();
    init_types2();
    getChecksumAlgorithmForRequest = /* @__PURE__ */ __name2((input, { requestChecksumRequired, requestAlgorithmMember, requestChecksumCalculation }) => {
      if (!requestAlgorithmMember) {
        return requestChecksumCalculation === RequestChecksumCalculation.WHEN_SUPPORTED || requestChecksumRequired ? DEFAULT_CHECKSUM_ALGORITHM : void 0;
      }
      if (!input[requestAlgorithmMember]) {
        return void 0;
      }
      const checksumAlgorithm = input[requestAlgorithmMember];
      if (!CLIENT_SUPPORTED_ALGORITHMS.includes(checksumAlgorithm)) {
        throw new Error(`The checksum algorithm "${checksumAlgorithm}" is not supported by the client. Select one of ${CLIENT_SUPPORTED_ALGORITHMS}.`);
      }
      return checksumAlgorithm;
    }, "getChecksumAlgorithmForRequest");
  }
});
var getChecksumLocationName;
var init_getChecksumLocationName = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumLocationName.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants2();
    getChecksumLocationName = /* @__PURE__ */ __name2((algorithm) => algorithm === ChecksumAlgorithm.MD5 ? "content-md5" : `x-amz-checksum-${algorithm.toLowerCase()}`, "getChecksumLocationName");
  }
});
var hasHeader2;
var init_hasHeader = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/hasHeader.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    hasHeader2 = /* @__PURE__ */ __name2((header, headers) => {
      const soughtHeader = header.toLowerCase();
      for (const headerName of Object.keys(headers)) {
        if (soughtHeader === headerName.toLowerCase()) {
          return true;
        }
      }
      return false;
    }, "hasHeader");
  }
});
var hasHeaderWithPrefix;
var init_hasHeaderWithPrefix = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/hasHeaderWithPrefix.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    hasHeaderWithPrefix = /* @__PURE__ */ __name2((headerPrefix, headers) => {
      const soughtHeaderPrefix = headerPrefix.toLowerCase();
      for (const headerName of Object.keys(headers)) {
        if (headerName.toLowerCase().startsWith(soughtHeaderPrefix)) {
          return true;
        }
      }
      return false;
    }, "hasHeaderWithPrefix");
  }
});
var isStreaming;
var init_isStreaming = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/isStreaming.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es16();
    isStreaming = /* @__PURE__ */ __name2((body) => body !== void 0 && typeof body !== "string" && !ArrayBuffer.isView(body) && !isArrayBuffer(body), "isStreaming");
  }
});
function __awaiter(thisArg, _arguments, P2, generator) {
  function adopt(value) {
    return value instanceof P2 ? value : new P2(function(resolve) {
      resolve(value);
    });
  }
  __name(adopt, "adopt");
  __name2(adopt, "adopt");
  return new (P2 || (P2 = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    __name(fulfilled, "fulfilled");
    __name2(fulfilled, "fulfilled");
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    __name(rejected, "rejected");
    __name2(rejected, "rejected");
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    __name(step, "step");
    __name2(step, "step");
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
__name(__awaiter, "__awaiter");
function __generator(thisArg, body) {
  var _ = { label: 0, sent: /* @__PURE__ */ __name2(function() {
    if (t8[0] & 1) throw t8[1];
    return t8[1];
  }, "sent"), trys: [], ops: [] }, f2, y2, t8, g2 = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g2.next = verb(0), g2["throw"] = verb(1), g2["return"] = verb(2), typeof Symbol === "function" && (g2[Symbol.iterator] = function() {
    return this;
  }), g2;
  function verb(n2) {
    return function(v2) {
      return step([n2, v2]);
    };
  }
  __name(verb, "verb");
  __name2(verb, "verb");
  function step(op) {
    if (f2) throw new TypeError("Generator is already executing.");
    while (g2 && (g2 = 0, op[0] && (_ = 0)), _) try {
      if (f2 = 1, y2 && (t8 = op[0] & 2 ? y2["return"] : op[0] ? y2["throw"] || ((t8 = y2["return"]) && t8.call(y2), 0) : y2.next) && !(t8 = t8.call(y2, op[1])).done) return t8;
      if (y2 = 0, t8) op = [op[0] & 2, t8.value];
      switch (op[0]) {
        case 0:
        case 1:
          t8 = op;
          break;
        case 4:
          _.label++;
          return { value: op[1], done: false };
        case 5:
          _.label++;
          y2 = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t8 = _.trys, t8 = t8.length > 0 && t8[t8.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t8 || op[1] > t8[0] && op[1] < t8[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t8[1]) {
            _.label = t8[1];
            t8 = op;
            break;
          }
          if (t8 && _.label < t8[2]) {
            _.label = t8[2];
            _.ops.push(op);
            break;
          }
          if (t8[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e2) {
      op = [6, e2];
      y2 = 0;
    } finally {
      f2 = t8 = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
  __name(step, "step");
  __name2(step, "step");
}
__name(__generator, "__generator");
function __values(o2) {
  var s2 = typeof Symbol === "function" && Symbol.iterator, m2 = s2 && o2[s2], i2 = 0;
  if (m2) return m2.call(o2);
  if (o2 && typeof o2.length === "number") return {
    next: /* @__PURE__ */ __name2(function() {
      if (o2 && i2 >= o2.length) o2 = void 0;
      return { value: o2 && o2[i2++], done: !o2 };
    }, "next")
  };
  throw new TypeError(s2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
__name(__values, "__values");
var init_tslib_es6 = __esm({
  "../node_modules/tslib/tslib.es6.mjs"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(__awaiter, "__awaiter");
    __name2(__generator, "__generator");
    __name2(__values, "__values");
  }
});
var fromUtf82;
var init_fromUtf8_browser2 = __esm({
  "../node_modules/@aws-crypto/util/node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    fromUtf82 = /* @__PURE__ */ __name2((input) => new TextEncoder().encode(input), "fromUtf8");
  }
});
var init_toUint8Array2 = __esm({
  "../node_modules/@aws-crypto/util/node_modules/@smithy/util-utf8/dist-es/toUint8Array.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fromUtf8_browser2();
  }
});
var init_toUtf8_browser2 = __esm({
  "../node_modules/@aws-crypto/util/node_modules/@smithy/util-utf8/dist-es/toUtf8.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es23 = __esm({
  "../node_modules/@aws-crypto/util/node_modules/@smithy/util-utf8/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fromUtf8_browser2();
    init_toUint8Array2();
    init_toUtf8_browser2();
  }
});
function convertToBuffer(data) {
  if (data instanceof Uint8Array)
    return data;
  if (typeof data === "string") {
    return fromUtf83(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}
__name(convertToBuffer, "convertToBuffer");
var fromUtf83;
var init_convertToBuffer = __esm({
  "../node_modules/@aws-crypto/util/build/module/convertToBuffer.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es23();
    fromUtf83 = typeof Buffer !== "undefined" && Buffer.from ? function(input) {
      return Buffer.from(input, "utf8");
    } : fromUtf82;
    __name2(convertToBuffer, "convertToBuffer");
  }
});
function isEmptyData(data) {
  if (typeof data === "string") {
    return data.length === 0;
  }
  return data.byteLength === 0;
}
__name(isEmptyData, "isEmptyData");
var init_isEmptyData = __esm({
  "../node_modules/@aws-crypto/util/build/module/isEmptyData.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(isEmptyData, "isEmptyData");
  }
});
function numToUint8(num) {
  return new Uint8Array([
    (num & 4278190080) >> 24,
    (num & 16711680) >> 16,
    (num & 65280) >> 8,
    num & 255
  ]);
}
__name(numToUint8, "numToUint8");
var init_numToUint8 = __esm({
  "../node_modules/@aws-crypto/util/build/module/numToUint8.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(numToUint8, "numToUint8");
  }
});
function uint32ArrayFrom(a_lookUpTable2) {
  if (!Uint32Array.from) {
    var return_array = new Uint32Array(a_lookUpTable2.length);
    var a_index = 0;
    while (a_index < a_lookUpTable2.length) {
      return_array[a_index] = a_lookUpTable2[a_index];
      a_index += 1;
    }
    return return_array;
  }
  return Uint32Array.from(a_lookUpTable2);
}
__name(uint32ArrayFrom, "uint32ArrayFrom");
var init_uint32ArrayFrom = __esm({
  "../node_modules/@aws-crypto/util/build/module/uint32ArrayFrom.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(uint32ArrayFrom, "uint32ArrayFrom");
  }
});
var init_module = __esm({
  "../node_modules/@aws-crypto/util/build/module/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_convertToBuffer();
    init_isEmptyData();
    init_numToUint8();
    init_uint32ArrayFrom();
  }
});
var AwsCrc32c;
var init_aws_crc32c = __esm({
  "../node_modules/@aws-crypto/crc32c/build/module/aws_crc32c.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_tslib_es6();
    init_module();
    init_module2();
    AwsCrc32c = /** @class */
    function() {
      function AwsCrc32c2() {
        this.crc32c = new Crc32c();
      }
      __name(AwsCrc32c2, "AwsCrc32c2");
      __name2(AwsCrc32c2, "AwsCrc32c");
      AwsCrc32c2.prototype.update = function(toHash) {
        if (isEmptyData(toHash))
          return;
        this.crc32c.update(convertToBuffer(toHash));
      };
      AwsCrc32c2.prototype.digest = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, numToUint8(this.crc32c.digest())];
          });
        });
      };
      AwsCrc32c2.prototype.reset = function() {
        this.crc32c = new Crc32c();
      };
      return AwsCrc32c2;
    }();
  }
});
var Crc32c;
var a_lookupTable;
var lookupTable;
var init_module2 = __esm({
  "../node_modules/@aws-crypto/crc32c/build/module/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_tslib_es6();
    init_module();
    init_aws_crc32c();
    Crc32c = /** @class */
    function() {
      function Crc32c2() {
        this.checksum = 4294967295;
      }
      __name(Crc32c2, "Crc32c2");
      __name2(Crc32c2, "Crc32c");
      Crc32c2.prototype.update = function(data) {
        var e_1, _a;
        try {
          for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var byte = data_1_1.value;
            this.checksum = this.checksum >>> 8 ^ lookupTable[(this.checksum ^ byte) & 255];
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return this;
      };
      Crc32c2.prototype.digest = function() {
        return (this.checksum ^ 4294967295) >>> 0;
      };
      return Crc32c2;
    }();
    a_lookupTable = [
      0,
      4067132163,
      3778769143,
      324072436,
      3348797215,
      904991772,
      648144872,
      3570033899,
      2329499855,
      2024987596,
      1809983544,
      2575936315,
      1296289744,
      3207089363,
      2893594407,
      1578318884,
      274646895,
      3795141740,
      4049975192,
      51262619,
      3619967088,
      632279923,
      922689671,
      3298075524,
      2592579488,
      1760304291,
      2075979607,
      2312596564,
      1562183871,
      2943781820,
      3156637768,
      1313733451,
      549293790,
      3537243613,
      3246849577,
      871202090,
      3878099393,
      357341890,
      102525238,
      4101499445,
      2858735121,
      1477399826,
      1264559846,
      3107202533,
      1845379342,
      2677391885,
      2361733625,
      2125378298,
      820201905,
      3263744690,
      3520608582,
      598981189,
      4151959214,
      85089709,
      373468761,
      3827903834,
      3124367742,
      1213305469,
      1526817161,
      2842354314,
      2107672161,
      2412447074,
      2627466902,
      1861252501,
      1098587580,
      3004210879,
      2688576843,
      1378610760,
      2262928035,
      1955203488,
      1742404180,
      2511436119,
      3416409459,
      969524848,
      714683780,
      3639785095,
      205050476,
      4266873199,
      3976438427,
      526918040,
      1361435347,
      2739821008,
      2954799652,
      1114974503,
      2529119692,
      1691668175,
      2005155131,
      2247081528,
      3690758684,
      697762079,
      986182379,
      3366744552,
      476452099,
      3993867776,
      4250756596,
      255256311,
      1640403810,
      2477592673,
      2164122517,
      1922457750,
      2791048317,
      1412925310,
      1197962378,
      3037525897,
      3944729517,
      427051182,
      170179418,
      4165941337,
      746937522,
      3740196785,
      3451792453,
      1070968646,
      1905808397,
      2213795598,
      2426610938,
      1657317369,
      3053634322,
      1147748369,
      1463399397,
      2773627110,
      4215344322,
      153784257,
      444234805,
      3893493558,
      1021025245,
      3467647198,
      3722505002,
      797665321,
      2197175160,
      1889384571,
      1674398607,
      2443626636,
      1164749927,
      3070701412,
      2757221520,
      1446797203,
      137323447,
      4198817972,
      3910406976,
      461344835,
      3484808360,
      1037989803,
      781091935,
      3705997148,
      2460548119,
      1623424788,
      1939049696,
      2180517859,
      1429367560,
      2807687179,
      3020495871,
      1180866812,
      410100952,
      3927582683,
      4182430767,
      186734380,
      3756733383,
      763408580,
      1053836080,
      3434856499,
      2722870694,
      1344288421,
      1131464017,
      2971354706,
      1708204729,
      2545590714,
      2229949006,
      1988219213,
      680717673,
      3673779818,
      3383336350,
      1002577565,
      4010310262,
      493091189,
      238226049,
      4233660802,
      2987750089,
      1082061258,
      1395524158,
      2705686845,
      1972364758,
      2279892693,
      2494862625,
      1725896226,
      952904198,
      3399985413,
      3656866545,
      731699698,
      4283874585,
      222117402,
      510512622,
      3959836397,
      3280807620,
      837199303,
      582374963,
      3504198960,
      68661723,
      4135334616,
      3844915500,
      390545967,
      1230274059,
      3141532936,
      2825850620,
      1510247935,
      2395924756,
      2091215383,
      1878366691,
      2644384480,
      3553878443,
      565732008,
      854102364,
      3229815391,
      340358836,
      3861050807,
      4117890627,
      119113024,
      1493875044,
      2875275879,
      3090270611,
      1247431312,
      2660249211,
      1828433272,
      2141937292,
      2378227087,
      3811616794,
      291187481,
      34330861,
      4032846830,
      615137029,
      3603020806,
      3314634738,
      939183345,
      1776939221,
      2609017814,
      2295496738,
      2058945313,
      2926798794,
      1545135305,
      1330124605,
      3173225534,
      4084100981,
      17165430,
      307568514,
      3762199681,
      888469610,
      3332340585,
      3587147933,
      665062302,
      2042050490,
      2346497209,
      2559330125,
      1793573966,
      3190661285,
      1279665062,
      1595330642,
      2910671697
    ];
    lookupTable = uint32ArrayFrom(a_lookupTable);
  }
});
var generateCRC64NVMETable;
var CRC64_NVME_REVERSED_TABLE;
var t0;
var t1;
var t2;
var t3;
var t4;
var t5;
var t6;
var t7;
var ensureTablesInitialized;
var Crc64Nvme;
var init_Crc64Nvme = __esm({
  "../node_modules/@aws-sdk/crc64-nvme/dist-es/Crc64Nvme.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    generateCRC64NVMETable = /* @__PURE__ */ __name2(() => {
      const sliceLength = 8;
      const tables = new Array(sliceLength);
      for (let slice = 0; slice < sliceLength; slice++) {
        const table = new Array(512);
        for (let i2 = 0; i2 < 256; i2++) {
          let crc = BigInt(i2);
          for (let j2 = 0; j2 < 8 * (slice + 1); j2++) {
            if (crc & 1n) {
              crc = crc >> 1n ^ 0x9a6c9329ac4bc9b5n;
            } else {
              crc = crc >> 1n;
            }
          }
          table[i2 * 2] = Number(crc >> 32n & 0xffffffffn);
          table[i2 * 2 + 1] = Number(crc & 0xffffffffn);
        }
        tables[slice] = new Uint32Array(table);
      }
      return tables;
    }, "generateCRC64NVMETable");
    ensureTablesInitialized = /* @__PURE__ */ __name2(() => {
      if (!CRC64_NVME_REVERSED_TABLE) {
        CRC64_NVME_REVERSED_TABLE = generateCRC64NVMETable();
        [t0, t1, t2, t3, t4, t5, t6, t7] = CRC64_NVME_REVERSED_TABLE;
      }
    }, "ensureTablesInitialized");
    Crc64Nvme = class {
      static {
        __name(this, "Crc64Nvme");
      }
      static {
        __name2(this, "Crc64Nvme");
      }
      c1 = 0;
      c2 = 0;
      constructor() {
        ensureTablesInitialized();
        this.reset();
      }
      update(data) {
        const len = data.length;
        let i2 = 0;
        let crc1 = this.c1;
        let crc2 = this.c2;
        while (i2 + 8 <= len) {
          const idx0 = ((crc2 ^ data[i2++]) & 255) << 1;
          const idx1 = ((crc2 >>> 8 ^ data[i2++]) & 255) << 1;
          const idx2 = ((crc2 >>> 16 ^ data[i2++]) & 255) << 1;
          const idx3 = ((crc2 >>> 24 ^ data[i2++]) & 255) << 1;
          const idx4 = ((crc1 ^ data[i2++]) & 255) << 1;
          const idx5 = ((crc1 >>> 8 ^ data[i2++]) & 255) << 1;
          const idx6 = ((crc1 >>> 16 ^ data[i2++]) & 255) << 1;
          const idx7 = ((crc1 >>> 24 ^ data[i2++]) & 255) << 1;
          crc1 = t7[idx0] ^ t6[idx1] ^ t5[idx2] ^ t4[idx3] ^ t3[idx4] ^ t2[idx5] ^ t1[idx6] ^ t0[idx7];
          crc2 = t7[idx0 + 1] ^ t6[idx1 + 1] ^ t5[idx2 + 1] ^ t4[idx3 + 1] ^ t3[idx4 + 1] ^ t2[idx5 + 1] ^ t1[idx6 + 1] ^ t0[idx7 + 1];
        }
        while (i2 < len) {
          const idx = ((crc2 ^ data[i2]) & 255) << 1;
          crc2 = (crc2 >>> 8 | (crc1 & 255) << 24) >>> 0;
          crc1 = crc1 >>> 8 ^ t0[idx];
          crc2 ^= t0[idx + 1];
          i2++;
        }
        this.c1 = crc1;
        this.c2 = crc2;
      }
      async digest() {
        const c1 = this.c1 ^ 4294967295;
        const c2 = this.c2 ^ 4294967295;
        return new Uint8Array([
          c1 >>> 24,
          c1 >>> 16 & 255,
          c1 >>> 8 & 255,
          c1 & 255,
          c2 >>> 24,
          c2 >>> 16 & 255,
          c2 >>> 8 & 255,
          c2 & 255
        ]);
      }
      reset() {
        this.c1 = 4294967295;
        this.c2 = 4294967295;
      }
    };
  }
});
var crc64NvmeCrtContainer;
var init_crc64_nvme_crt_container = __esm({
  "../node_modules/@aws-sdk/crc64-nvme/dist-es/crc64-nvme-crt-container.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    crc64NvmeCrtContainer = {
      CrtCrc64Nvme: null
    };
  }
});
var init_dist_es24 = __esm({
  "../node_modules/@aws-sdk/crc64-nvme/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Crc64Nvme();
    init_crc64_nvme_crt_container();
  }
});
var AwsCrc32;
var init_aws_crc32 = __esm({
  "../node_modules/@aws-crypto/crc32/build/module/aws_crc32.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_tslib_es6();
    init_module();
    init_module3();
    AwsCrc32 = /** @class */
    function() {
      function AwsCrc322() {
        this.crc32 = new Crc32();
      }
      __name(AwsCrc322, "AwsCrc322");
      __name2(AwsCrc322, "AwsCrc32");
      AwsCrc322.prototype.update = function(toHash) {
        if (isEmptyData(toHash))
          return;
        this.crc32.update(convertToBuffer(toHash));
      };
      AwsCrc322.prototype.digest = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, numToUint8(this.crc32.digest())];
          });
        });
      };
      AwsCrc322.prototype.reset = function() {
        this.crc32 = new Crc32();
      };
      return AwsCrc322;
    }();
  }
});
var Crc32;
var a_lookUpTable;
var lookupTable2;
var init_module3 = __esm({
  "../node_modules/@aws-crypto/crc32/build/module/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_tslib_es6();
    init_module();
    init_aws_crc32();
    Crc32 = /** @class */
    function() {
      function Crc322() {
        this.checksum = 4294967295;
      }
      __name(Crc322, "Crc322");
      __name2(Crc322, "Crc32");
      Crc322.prototype.update = function(data) {
        var e_1, _a;
        try {
          for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var byte = data_1_1.value;
            this.checksum = this.checksum >>> 8 ^ lookupTable2[(this.checksum ^ byte) & 255];
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return this;
      };
      Crc322.prototype.digest = function() {
        return (this.checksum ^ 4294967295) >>> 0;
      };
      return Crc322;
    }();
    a_lookUpTable = [
      0,
      1996959894,
      3993919788,
      2567524794,
      124634137,
      1886057615,
      3915621685,
      2657392035,
      249268274,
      2044508324,
      3772115230,
      2547177864,
      162941995,
      2125561021,
      3887607047,
      2428444049,
      498536548,
      1789927666,
      4089016648,
      2227061214,
      450548861,
      1843258603,
      4107580753,
      2211677639,
      325883990,
      1684777152,
      4251122042,
      2321926636,
      335633487,
      1661365465,
      4195302755,
      2366115317,
      997073096,
      1281953886,
      3579855332,
      2724688242,
      1006888145,
      1258607687,
      3524101629,
      2768942443,
      901097722,
      1119000684,
      3686517206,
      2898065728,
      853044451,
      1172266101,
      3705015759,
      2882616665,
      651767980,
      1373503546,
      3369554304,
      3218104598,
      565507253,
      1454621731,
      3485111705,
      3099436303,
      671266974,
      1594198024,
      3322730930,
      2970347812,
      795835527,
      1483230225,
      3244367275,
      3060149565,
      1994146192,
      31158534,
      2563907772,
      4023717930,
      1907459465,
      112637215,
      2680153253,
      3904427059,
      2013776290,
      251722036,
      2517215374,
      3775830040,
      2137656763,
      141376813,
      2439277719,
      3865271297,
      1802195444,
      476864866,
      2238001368,
      4066508878,
      1812370925,
      453092731,
      2181625025,
      4111451223,
      1706088902,
      314042704,
      2344532202,
      4240017532,
      1658658271,
      366619977,
      2362670323,
      4224994405,
      1303535960,
      984961486,
      2747007092,
      3569037538,
      1256170817,
      1037604311,
      2765210733,
      3554079995,
      1131014506,
      879679996,
      2909243462,
      3663771856,
      1141124467,
      855842277,
      2852801631,
      3708648649,
      1342533948,
      654459306,
      3188396048,
      3373015174,
      1466479909,
      544179635,
      3110523913,
      3462522015,
      1591671054,
      702138776,
      2966460450,
      3352799412,
      1504918807,
      783551873,
      3082640443,
      3233442989,
      3988292384,
      2596254646,
      62317068,
      1957810842,
      3939845945,
      2647816111,
      81470997,
      1943803523,
      3814918930,
      2489596804,
      225274430,
      2053790376,
      3826175755,
      2466906013,
      167816743,
      2097651377,
      4027552580,
      2265490386,
      503444072,
      1762050814,
      4150417245,
      2154129355,
      426522225,
      1852507879,
      4275313526,
      2312317920,
      282753626,
      1742555852,
      4189708143,
      2394877945,
      397917763,
      1622183637,
      3604390888,
      2714866558,
      953729732,
      1340076626,
      3518719985,
      2797360999,
      1068828381,
      1219638859,
      3624741850,
      2936675148,
      906185462,
      1090812512,
      3747672003,
      2825379669,
      829329135,
      1181335161,
      3412177804,
      3160834842,
      628085408,
      1382605366,
      3423369109,
      3138078467,
      570562233,
      1426400815,
      3317316542,
      2998733608,
      733239954,
      1555261956,
      3268935591,
      3050360625,
      752459403,
      1541320221,
      2607071920,
      3965973030,
      1969922972,
      40735498,
      2617837225,
      3943577151,
      1913087877,
      83908371,
      2512341634,
      3803740692,
      2075208622,
      213261112,
      2463272603,
      3855990285,
      2094854071,
      198958881,
      2262029012,
      4057260610,
      1759359992,
      534414190,
      2176718541,
      4139329115,
      1873836001,
      414664567,
      2282248934,
      4279200368,
      1711684554,
      285281116,
      2405801727,
      4167216745,
      1634467795,
      376229701,
      2685067896,
      3608007406,
      1308918612,
      956543938,
      2808555105,
      3495958263,
      1231636301,
      1047427035,
      2932959818,
      3654703836,
      1088359270,
      936918e3,
      2847714899,
      3736837829,
      1202900863,
      817233897,
      3183342108,
      3401237130,
      1404277552,
      615818150,
      3134207493,
      3453421203,
      1423857449,
      601450431,
      3009837614,
      3294710456,
      1567103746,
      711928724,
      3020668471,
      3272380065,
      1510334235,
      755167117
    ];
    lookupTable2 = uint32ArrayFrom(a_lookUpTable);
  }
});
var getCrc32ChecksumAlgorithmFunction;
var init_getCrc32ChecksumAlgorithmFunction_browser = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getCrc32ChecksumAlgorithmFunction.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_module3();
    getCrc32ChecksumAlgorithmFunction = /* @__PURE__ */ __name2(() => AwsCrc32, "getCrc32ChecksumAlgorithmFunction");
  }
});
var selectChecksumAlgorithmFunction;
var init_selectChecksumAlgorithmFunction = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/selectChecksumAlgorithmFunction.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_module2();
    init_dist_es24();
    init_constants2();
    init_getCrc32ChecksumAlgorithmFunction_browser();
    selectChecksumAlgorithmFunction = /* @__PURE__ */ __name2((checksumAlgorithm, config) => {
      switch (checksumAlgorithm) {
        case ChecksumAlgorithm.MD5:
          return config.md5;
        case ChecksumAlgorithm.CRC32:
          return getCrc32ChecksumAlgorithmFunction();
        case ChecksumAlgorithm.CRC32C:
          return AwsCrc32c;
        case ChecksumAlgorithm.CRC64NVME:
          if (typeof crc64NvmeCrtContainer.CrtCrc64Nvme !== "function") {
            return Crc64Nvme;
          }
          return crc64NvmeCrtContainer.CrtCrc64Nvme;
        case ChecksumAlgorithm.SHA1:
          return config.sha1;
        case ChecksumAlgorithm.SHA256:
          return config.sha256;
        default:
          throw new Error(`Unsupported checksum algorithm: ${checksumAlgorithm}`);
      }
    }, "selectChecksumAlgorithmFunction");
  }
});
var stringHasher;
var init_stringHasher = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/stringHasher.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es6();
    stringHasher = /* @__PURE__ */ __name2((checksumAlgorithmFn, body) => {
      const hash = new checksumAlgorithmFn();
      hash.update(toUint8Array(body || ""));
      return hash.digest();
    }, "stringHasher");
  }
});
var flexibleChecksumsMiddlewareOptions;
var flexibleChecksumsMiddleware;
var init_flexibleChecksumsMiddleware = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/flexibleChecksumsMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es22();
    init_dist_es2();
    init_dist_es12();
    init_constants2();
    init_getChecksumAlgorithmForRequest();
    init_getChecksumLocationName();
    init_hasHeader();
    init_hasHeaderWithPrefix();
    init_isStreaming();
    init_selectChecksumAlgorithmFunction();
    init_stringHasher();
    flexibleChecksumsMiddlewareOptions = {
      name: "flexibleChecksumsMiddleware",
      step: "build",
      tags: ["BODY_CHECKSUM"],
      override: true
    };
    flexibleChecksumsMiddleware = /* @__PURE__ */ __name2((config, middlewareConfig) => (next, context) => async (args) => {
      if (!HttpRequest.isInstance(args.request)) {
        return next(args);
      }
      if (hasHeaderWithPrefix("x-amz-checksum-", args.request.headers)) {
        return next(args);
      }
      const { request, input } = args;
      const { body: requestBody, headers } = request;
      const { base64Encoder, streamHasher } = config;
      const { requestChecksumRequired, requestAlgorithmMember } = middlewareConfig;
      const requestChecksumCalculation = await config.requestChecksumCalculation();
      const requestAlgorithmMemberName = requestAlgorithmMember?.name;
      const requestAlgorithmMemberHttpHeader = requestAlgorithmMember?.httpHeader;
      if (requestAlgorithmMemberName && !input[requestAlgorithmMemberName]) {
        if (requestChecksumCalculation === RequestChecksumCalculation.WHEN_SUPPORTED || requestChecksumRequired) {
          input[requestAlgorithmMemberName] = DEFAULT_CHECKSUM_ALGORITHM;
          if (requestAlgorithmMemberHttpHeader) {
            headers[requestAlgorithmMemberHttpHeader] = DEFAULT_CHECKSUM_ALGORITHM;
          }
        }
      }
      const checksumAlgorithm = getChecksumAlgorithmForRequest(input, {
        requestChecksumRequired,
        requestAlgorithmMember: requestAlgorithmMember?.name,
        requestChecksumCalculation
      });
      let updatedBody = requestBody;
      let updatedHeaders = headers;
      if (checksumAlgorithm) {
        switch (checksumAlgorithm) {
          case ChecksumAlgorithm.CRC32:
            setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_CRC32", "U");
            break;
          case ChecksumAlgorithm.CRC32C:
            setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_CRC32C", "V");
            break;
          case ChecksumAlgorithm.CRC64NVME:
            setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_CRC64", "W");
            break;
          case ChecksumAlgorithm.SHA1:
            setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_SHA1", "X");
            break;
          case ChecksumAlgorithm.SHA256:
            setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_SHA256", "Y");
            break;
        }
        const checksumLocationName = getChecksumLocationName(checksumAlgorithm);
        const checksumAlgorithmFn = selectChecksumAlgorithmFunction(checksumAlgorithm, config);
        if (isStreaming(requestBody)) {
          const { getAwsChunkedEncodingStream: getAwsChunkedEncodingStream2, bodyLengthChecker } = config;
          updatedBody = getAwsChunkedEncodingStream2(typeof config.requestStreamBufferSize === "number" && config.requestStreamBufferSize >= 8 * 1024 ? createBufferedReadable(requestBody, config.requestStreamBufferSize, context.logger) : requestBody, {
            base64Encoder,
            bodyLengthChecker,
            checksumLocationName,
            checksumAlgorithmFn,
            streamHasher
          });
          updatedHeaders = {
            ...headers,
            "content-encoding": headers["content-encoding"] ? `${headers["content-encoding"]},aws-chunked` : "aws-chunked",
            "transfer-encoding": "chunked",
            "x-amz-decoded-content-length": headers["content-length"],
            "x-amz-content-sha256": "STREAMING-UNSIGNED-PAYLOAD-TRAILER",
            "x-amz-trailer": checksumLocationName
          };
          delete updatedHeaders["content-length"];
        } else if (!hasHeader2(checksumLocationName, headers)) {
          const rawChecksum = await stringHasher(checksumAlgorithmFn, requestBody);
          updatedHeaders = {
            ...headers,
            [checksumLocationName]: base64Encoder(rawChecksum)
          };
        }
      }
      try {
        const result = await next({
          ...args,
          request: {
            ...request,
            headers: updatedHeaders,
            body: updatedBody
          }
        });
        return result;
      } catch (e2) {
        if (e2 instanceof Error && e2.name === "InvalidChunkSizeError") {
          try {
            if (!e2.message.endsWith(".")) {
              e2.message += ".";
            }
            e2.message += " Set [requestStreamBufferSize=number e.g. 65_536] in client constructor to instruct AWS SDK to buffer your input stream.";
          } catch (ignored) {
          }
        }
        throw e2;
      }
    }, "flexibleChecksumsMiddleware");
  }
});
var flexibleChecksumsInputMiddlewareOptions;
var flexibleChecksumsInputMiddleware;
var init_flexibleChecksumsInputMiddleware = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/flexibleChecksumsInputMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es22();
    init_constants2();
    flexibleChecksumsInputMiddlewareOptions = {
      name: "flexibleChecksumsInputMiddleware",
      toMiddleware: "serializerMiddleware",
      relation: "before",
      tags: ["BODY_CHECKSUM"],
      override: true
    };
    flexibleChecksumsInputMiddleware = /* @__PURE__ */ __name2((config, middlewareConfig) => (next, context) => async (args) => {
      const input = args.input;
      const { requestValidationModeMember } = middlewareConfig;
      const requestChecksumCalculation = await config.requestChecksumCalculation();
      const responseChecksumValidation = await config.responseChecksumValidation();
      switch (requestChecksumCalculation) {
        case RequestChecksumCalculation.WHEN_REQUIRED:
          setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_WHEN_REQUIRED", "a");
          break;
        case RequestChecksumCalculation.WHEN_SUPPORTED:
          setFeature(context, "FLEXIBLE_CHECKSUMS_REQ_WHEN_SUPPORTED", "Z");
          break;
      }
      switch (responseChecksumValidation) {
        case ResponseChecksumValidation.WHEN_REQUIRED:
          setFeature(context, "FLEXIBLE_CHECKSUMS_RES_WHEN_REQUIRED", "c");
          break;
        case ResponseChecksumValidation.WHEN_SUPPORTED:
          setFeature(context, "FLEXIBLE_CHECKSUMS_RES_WHEN_SUPPORTED", "b");
          break;
      }
      if (requestValidationModeMember && !input[requestValidationModeMember]) {
        if (responseChecksumValidation === ResponseChecksumValidation.WHEN_SUPPORTED) {
          input[requestValidationModeMember] = "ENABLED";
        }
      }
      return next(args);
    }, "flexibleChecksumsInputMiddleware");
  }
});
var getChecksumAlgorithmListForResponse;
var init_getChecksumAlgorithmListForResponse = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumAlgorithmListForResponse.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types2();
    getChecksumAlgorithmListForResponse = /* @__PURE__ */ __name2((responseAlgorithms = []) => {
      const validChecksumAlgorithms = [];
      for (const algorithm of PRIORITY_ORDER_ALGORITHMS) {
        if (!responseAlgorithms.includes(algorithm) || !CLIENT_SUPPORTED_ALGORITHMS.includes(algorithm)) {
          continue;
        }
        validChecksumAlgorithms.push(algorithm);
      }
      return validChecksumAlgorithms;
    }, "getChecksumAlgorithmListForResponse");
  }
});
var isChecksumWithPartNumber;
var init_isChecksumWithPartNumber = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/isChecksumWithPartNumber.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    isChecksumWithPartNumber = /* @__PURE__ */ __name2((checksum) => {
      const lastHyphenIndex = checksum.lastIndexOf("-");
      if (lastHyphenIndex !== -1) {
        const numberPart = checksum.slice(lastHyphenIndex + 1);
        if (!numberPart.startsWith("0")) {
          const number = parseInt(numberPart, 10);
          if (!isNaN(number) && number >= 1 && number <= 1e4) {
            return true;
          }
        }
      }
      return false;
    }, "isChecksumWithPartNumber");
  }
});
var getChecksum;
var init_getChecksum = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksum.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_stringHasher();
    getChecksum = /* @__PURE__ */ __name2(async (body, { checksumAlgorithmFn, base64Encoder }) => base64Encoder(await stringHasher(checksumAlgorithmFn, body)), "getChecksum");
  }
});
var validateChecksumFromResponse;
var init_validateChecksumFromResponse = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/validateChecksumFromResponse.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es12();
    init_constants2();
    init_getChecksum();
    init_getChecksumAlgorithmListForResponse();
    init_getChecksumLocationName();
    init_isStreaming();
    init_selectChecksumAlgorithmFunction();
    validateChecksumFromResponse = /* @__PURE__ */ __name2(async (response, { config, responseAlgorithms, logger: logger2 }) => {
      const checksumAlgorithms = getChecksumAlgorithmListForResponse(responseAlgorithms);
      const { body: responseBody, headers: responseHeaders } = response;
      for (const algorithm of checksumAlgorithms) {
        const responseHeader = getChecksumLocationName(algorithm);
        const checksumFromResponse = responseHeaders[responseHeader];
        if (checksumFromResponse) {
          let checksumAlgorithmFn;
          try {
            checksumAlgorithmFn = selectChecksumAlgorithmFunction(algorithm, config);
          } catch (error) {
            if (algorithm === ChecksumAlgorithm.CRC64NVME) {
              logger2?.warn(`Skipping ${ChecksumAlgorithm.CRC64NVME} checksum validation: ${error.message}`);
              continue;
            }
            throw error;
          }
          const { base64Encoder } = config;
          if (isStreaming(responseBody)) {
            response.body = createChecksumStream({
              expectedChecksum: checksumFromResponse,
              checksumSourceLocation: responseHeader,
              checksum: new checksumAlgorithmFn(),
              source: responseBody,
              base64Encoder
            });
            return;
          }
          const checksum = await getChecksum(responseBody, { checksumAlgorithmFn, base64Encoder });
          if (checksum === checksumFromResponse) {
            break;
          }
          throw new Error(`Checksum mismatch: expected "${checksum}" but received "${checksumFromResponse}" in response header "${responseHeader}".`);
        }
      }
    }, "validateChecksumFromResponse");
  }
});
var flexibleChecksumsResponseMiddlewareOptions;
var flexibleChecksumsResponseMiddleware;
var init_flexibleChecksumsResponseMiddleware = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/flexibleChecksumsResponseMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_getChecksumAlgorithmListForResponse();
    init_getChecksumLocationName();
    init_isChecksumWithPartNumber();
    init_validateChecksumFromResponse();
    flexibleChecksumsResponseMiddlewareOptions = {
      name: "flexibleChecksumsResponseMiddleware",
      toMiddleware: "deserializerMiddleware",
      relation: "after",
      tags: ["BODY_CHECKSUM"],
      override: true
    };
    flexibleChecksumsResponseMiddleware = /* @__PURE__ */ __name2((config, middlewareConfig) => (next, context) => async (args) => {
      if (!HttpRequest.isInstance(args.request)) {
        return next(args);
      }
      const input = args.input;
      const result = await next(args);
      const response = result.response;
      const { requestValidationModeMember, responseAlgorithms } = middlewareConfig;
      if (requestValidationModeMember && input[requestValidationModeMember] === "ENABLED") {
        const { clientName, commandName } = context;
        const isS3WholeObjectMultipartGetResponseChecksum = clientName === "S3Client" && commandName === "GetObjectCommand" && getChecksumAlgorithmListForResponse(responseAlgorithms).every((algorithm) => {
          const responseHeader = getChecksumLocationName(algorithm);
          const checksumFromResponse = response.headers[responseHeader];
          return !checksumFromResponse || isChecksumWithPartNumber(checksumFromResponse);
        });
        if (isS3WholeObjectMultipartGetResponseChecksum) {
          return result;
        }
        await validateChecksumFromResponse(response, {
          config,
          responseAlgorithms,
          logger: context.logger
        });
      }
      return result;
    }, "flexibleChecksumsResponseMiddleware");
  }
});
var getFlexibleChecksumsPlugin;
var init_getFlexibleChecksumsPlugin = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getFlexibleChecksumsPlugin.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_flexibleChecksumsInputMiddleware();
    init_flexibleChecksumsMiddleware();
    init_flexibleChecksumsResponseMiddleware();
    getFlexibleChecksumsPlugin = /* @__PURE__ */ __name2((config, middlewareConfig) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(flexibleChecksumsMiddleware(config, middlewareConfig), flexibleChecksumsMiddlewareOptions);
        clientStack.addRelativeTo(flexibleChecksumsInputMiddleware(config, middlewareConfig), flexibleChecksumsInputMiddlewareOptions);
        clientStack.addRelativeTo(flexibleChecksumsResponseMiddleware(config, middlewareConfig), flexibleChecksumsResponseMiddlewareOptions);
      }, "applyToStack")
    }), "getFlexibleChecksumsPlugin");
  }
});
var resolveFlexibleChecksumsConfig;
var init_resolveFlexibleChecksumsConfig = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/resolveFlexibleChecksumsConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es4();
    init_constants2();
    resolveFlexibleChecksumsConfig = /* @__PURE__ */ __name2((input) => {
      const { requestChecksumCalculation, responseChecksumValidation, requestStreamBufferSize } = input;
      return Object.assign(input, {
        requestChecksumCalculation: normalizeProvider(requestChecksumCalculation ?? DEFAULT_REQUEST_CHECKSUM_CALCULATION),
        responseChecksumValidation: normalizeProvider(responseChecksumValidation ?? DEFAULT_RESPONSE_CHECKSUM_VALIDATION),
        requestStreamBufferSize: Number(requestStreamBufferSize ?? 0)
      });
    }, "resolveFlexibleChecksumsConfig");
  }
});
var init_dist_es25 = __esm({
  "../node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_NODE_REQUEST_CHECKSUM_CALCULATION_CONFIG_OPTIONS();
    init_NODE_RESPONSE_CHECKSUM_VALIDATION_CONFIG_OPTIONS();
    init_constants2();
    init_flexibleChecksumsMiddleware();
    init_getFlexibleChecksumsPlugin();
    init_resolveFlexibleChecksumsConfig();
  }
});
function resolveHostHeaderConfig(input) {
  return input;
}
__name(resolveHostHeaderConfig, "resolveHostHeaderConfig");
var hostHeaderMiddleware;
var hostHeaderMiddlewareOptions;
var getHostHeaderPlugin;
var init_dist_es26 = __esm({
  "../node_modules/@aws-sdk/middleware-host-header/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    __name2(resolveHostHeaderConfig, "resolveHostHeaderConfig");
    hostHeaderMiddleware = /* @__PURE__ */ __name2((options) => (next) => async (args) => {
      if (!HttpRequest.isInstance(args.request))
        return next(args);
      const { request } = args;
      const { handlerProtocol = "" } = options.requestHandler.metadata || {};
      if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
        delete request.headers["host"];
        request.headers[":authority"] = request.hostname + (request.port ? ":" + request.port : "");
      } else if (!request.headers["host"]) {
        let host = request.hostname;
        if (request.port != null)
          host += `:${request.port}`;
        request.headers["host"] = host;
      }
      return next(args);
    }, "hostHeaderMiddleware");
    hostHeaderMiddlewareOptions = {
      name: "hostHeaderMiddleware",
      step: "build",
      priority: "low",
      tags: ["HOST"],
      override: true
    };
    getHostHeaderPlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
      }, "applyToStack")
    }), "getHostHeaderPlugin");
  }
});
var loggerMiddleware;
var loggerMiddlewareOptions;
var getLoggerPlugin;
var init_loggerMiddleware = __esm({
  "../node_modules/@aws-sdk/middleware-logger/dist-es/loggerMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    loggerMiddleware = /* @__PURE__ */ __name2(() => (next, context) => async (args) => {
      try {
        const response = await next(args);
        const { clientName, commandName, logger: logger2, dynamoDbDocumentClientOptions = {} } = context;
        const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
        const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
        const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
        const { $metadata, ...outputWithoutMetadata } = response.output;
        logger2?.info?.({
          clientName,
          commandName,
          input: inputFilterSensitiveLog(args.input),
          output: outputFilterSensitiveLog(outputWithoutMetadata),
          metadata: $metadata
        });
        return response;
      } catch (error) {
        const { clientName, commandName, logger: logger2, dynamoDbDocumentClientOptions = {} } = context;
        const { overrideInputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
        const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
        logger2?.error?.({
          clientName,
          commandName,
          input: inputFilterSensitiveLog(args.input),
          error,
          metadata: error.$metadata
        });
        throw error;
      }
    }, "loggerMiddleware");
    loggerMiddlewareOptions = {
      name: "loggerMiddleware",
      tags: ["LOGGER"],
      step: "initialize",
      override: true
    };
    getLoggerPlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
      }, "applyToStack")
    }), "getLoggerPlugin");
  }
});
var init_dist_es27 = __esm({
  "../node_modules/@aws-sdk/middleware-logger/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_loggerMiddleware();
  }
});
var recursionDetectionMiddlewareOptions;
var init_configuration = __esm({
  "../node_modules/@aws-sdk/middleware-recursion-detection/dist-es/configuration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    recursionDetectionMiddlewareOptions = {
      step: "build",
      tags: ["RECURSION_DETECTION"],
      name: "recursionDetectionMiddleware",
      override: true,
      priority: "low"
    };
  }
});
var recursionDetectionMiddleware;
var init_recursionDetectionMiddleware_browser = __esm({
  "../node_modules/@aws-sdk/middleware-recursion-detection/dist-es/recursionDetectionMiddleware.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    recursionDetectionMiddleware = /* @__PURE__ */ __name2(() => (next) => async (args) => next(args), "recursionDetectionMiddleware");
  }
});
var getRecursionDetectionPlugin;
var init_getRecursionDetectionPlugin = __esm({
  "../node_modules/@aws-sdk/middleware-recursion-detection/dist-es/getRecursionDetectionPlugin.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_configuration();
    init_recursionDetectionMiddleware_browser();
    getRecursionDetectionPlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(recursionDetectionMiddleware(), recursionDetectionMiddlewareOptions);
      }, "applyToStack")
    }), "getRecursionDetectionPlugin");
  }
});
var init_dist_es28 = __esm({
  "../node_modules/@aws-sdk/middleware-recursion-detection/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_getRecursionDetectionPlugin();
    init_recursionDetectionMiddleware_browser();
  }
});
function checkContentLengthHeader() {
  return (next, context) => async (args) => {
    const { request } = args;
    if (HttpRequest.isInstance(request)) {
      if (!(CONTENT_LENGTH_HEADER in request.headers) && !(DECODED_CONTENT_LENGTH_HEADER in request.headers)) {
        const message = `Are you using a Stream of unknown length as the Body of a PutObject request? Consider using Upload instead from @aws-sdk/lib-storage.`;
        if (typeof context?.logger?.warn === "function" && !(context.logger instanceof NoOpLogger)) {
          context.logger.warn(message);
        } else {
          console.warn(message);
        }
      }
    }
    return next({ ...args });
  };
}
__name(checkContentLengthHeader, "checkContentLengthHeader");
var CONTENT_LENGTH_HEADER;
var DECODED_CONTENT_LENGTH_HEADER;
var checkContentLengthHeaderMiddlewareOptions;
var getCheckContentLengthHeaderPlugin;
var init_check_content_length_header = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/check-content-length-header.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_dist_es20();
    CONTENT_LENGTH_HEADER = "content-length";
    DECODED_CONTENT_LENGTH_HEADER = "x-amz-decoded-content-length";
    __name2(checkContentLengthHeader, "checkContentLengthHeader");
    checkContentLengthHeaderMiddlewareOptions = {
      step: "finalizeRequest",
      tags: ["CHECK_CONTENT_LENGTH_HEADER"],
      name: "getCheckContentLengthHeaderPlugin",
      override: true
    };
    getCheckContentLengthHeaderPlugin = /* @__PURE__ */ __name2((unused) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(checkContentLengthHeader(), checkContentLengthHeaderMiddlewareOptions);
      }, "applyToStack")
    }), "getCheckContentLengthHeaderPlugin");
  }
});
var regionRedirectEndpointMiddleware;
var regionRedirectEndpointMiddlewareOptions;
var init_region_redirect_endpoint_middleware = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-endpoint-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    regionRedirectEndpointMiddleware = /* @__PURE__ */ __name2((config) => {
      return (next, context) => async (args) => {
        const originalRegion = await config.region();
        const regionProviderRef = config.region;
        let unlock = /* @__PURE__ */ __name2(() => {
        }, "unlock");
        if (context.__s3RegionRedirect) {
          Object.defineProperty(config, "region", {
            writable: false,
            value: /* @__PURE__ */ __name2(async () => {
              return context.__s3RegionRedirect;
            }, "value")
          });
          unlock = /* @__PURE__ */ __name2(() => Object.defineProperty(config, "region", {
            writable: true,
            value: regionProviderRef
          }), "unlock");
        }
        try {
          const result = await next(args);
          if (context.__s3RegionRedirect) {
            unlock();
            const region = await config.region();
            if (originalRegion !== region) {
              throw new Error("Region was not restored following S3 region redirect.");
            }
          }
          return result;
        } catch (e2) {
          unlock();
          throw e2;
        }
      };
    }, "regionRedirectEndpointMiddleware");
    regionRedirectEndpointMiddlewareOptions = {
      tags: ["REGION_REDIRECT", "S3"],
      name: "regionRedirectEndpointMiddleware",
      override: true,
      relation: "before",
      toMiddleware: "endpointV2Middleware"
    };
  }
});
function regionRedirectMiddleware(clientConfig) {
  return (next, context) => async (args) => {
    try {
      return await next(args);
    } catch (err) {
      if (clientConfig.followRegionRedirects) {
        const statusCode = err?.$metadata?.httpStatusCode;
        const isHeadBucket = context.commandName === "HeadBucketCommand";
        const bucketRegionHeader = err?.$response?.headers?.["x-amz-bucket-region"];
        if (bucketRegionHeader) {
          if (statusCode === 301 || statusCode === 400 && (err?.name === "IllegalLocationConstraintException" || isHeadBucket)) {
            try {
              const actualRegion = bucketRegionHeader;
              context.logger?.debug(`Redirecting from ${await clientConfig.region()} to ${actualRegion}`);
              context.__s3RegionRedirect = actualRegion;
            } catch (e2) {
              throw new Error("Region redirect failed: " + e2);
            }
            return next(args);
          }
        }
      }
      throw err;
    }
  };
}
__name(regionRedirectMiddleware, "regionRedirectMiddleware");
var regionRedirectMiddlewareOptions;
var getRegionRedirectMiddlewarePlugin;
var init_region_redirect_middleware = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_region_redirect_endpoint_middleware();
    __name2(regionRedirectMiddleware, "regionRedirectMiddleware");
    regionRedirectMiddlewareOptions = {
      step: "initialize",
      tags: ["REGION_REDIRECT", "S3"],
      name: "regionRedirectMiddleware",
      override: true
    };
    getRegionRedirectMiddlewarePlugin = /* @__PURE__ */ __name2((clientConfig) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(regionRedirectMiddleware(clientConfig), regionRedirectMiddlewareOptions);
        clientStack.addRelativeTo(regionRedirectEndpointMiddleware(clientConfig), regionRedirectEndpointMiddlewareOptions);
      }, "applyToStack")
    }), "getRegionRedirectMiddlewarePlugin");
  }
});
var s3ExpiresMiddleware;
var s3ExpiresMiddlewareOptions;
var getS3ExpiresMiddlewarePlugin;
var init_s3_expires_middleware = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-expires-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_dist_es20();
    s3ExpiresMiddleware = /* @__PURE__ */ __name2((config) => {
      return (next, context) => async (args) => {
        const result = await next(args);
        const { response } = result;
        if (HttpResponse.isInstance(response)) {
          if (response.headers.expires) {
            response.headers.expiresstring = response.headers.expires;
            try {
              parseRfc7231DateTime(response.headers.expires);
            } catch (e2) {
              context.logger?.warn(`AWS SDK Warning for ${context.clientName}::${context.commandName} response parsing (${response.headers.expires}): ${e2}`);
              delete response.headers.expires;
            }
          }
        }
        return result;
      };
    }, "s3ExpiresMiddleware");
    s3ExpiresMiddlewareOptions = {
      tags: ["S3"],
      name: "s3ExpiresMiddleware",
      override: true,
      relation: "after",
      toMiddleware: "deserializerMiddleware"
    };
    getS3ExpiresMiddlewarePlugin = /* @__PURE__ */ __name2((clientConfig) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.addRelativeTo(s3ExpiresMiddleware(clientConfig), s3ExpiresMiddlewareOptions);
      }, "applyToStack")
    }), "getS3ExpiresMiddlewarePlugin");
  }
});
var S3ExpressIdentityCache;
var init_S3ExpressIdentityCache = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityCache.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    S3ExpressIdentityCache = class _S3ExpressIdentityCache {
      static {
        __name(this, "_S3ExpressIdentityCache");
      }
      static {
        __name2(this, "S3ExpressIdentityCache");
      }
      data;
      lastPurgeTime = Date.now();
      static EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS = 3e4;
      constructor(data = {}) {
        this.data = data;
      }
      get(key) {
        const entry = this.data[key];
        if (!entry) {
          return;
        }
        return entry;
      }
      set(key, entry) {
        this.data[key] = entry;
        return entry;
      }
      delete(key) {
        delete this.data[key];
      }
      async purgeExpired() {
        const now = Date.now();
        if (this.lastPurgeTime + _S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS > now) {
          return;
        }
        for (const key in this.data) {
          const entry = this.data[key];
          if (!entry.isRefreshing) {
            const credential = await entry.identity;
            if (credential.expiration) {
              if (credential.expiration.getTime() < now) {
                delete this.data[key];
              }
            }
          }
        }
      }
    };
  }
});
var S3ExpressIdentityCacheEntry;
var init_S3ExpressIdentityCacheEntry = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityCacheEntry.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    S3ExpressIdentityCacheEntry = class {
      static {
        __name(this, "S3ExpressIdentityCacheEntry");
      }
      static {
        __name2(this, "S3ExpressIdentityCacheEntry");
      }
      _identity;
      isRefreshing;
      accessed;
      constructor(_identity, isRefreshing = false, accessed = Date.now()) {
        this._identity = _identity;
        this.isRefreshing = isRefreshing;
        this.accessed = accessed;
      }
      get identity() {
        this.accessed = Date.now();
        return this._identity;
      }
    };
  }
});
var S3ExpressIdentityProviderImpl;
var init_S3ExpressIdentityProviderImpl = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityProviderImpl.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_S3ExpressIdentityCache();
    init_S3ExpressIdentityCacheEntry();
    S3ExpressIdentityProviderImpl = class _S3ExpressIdentityProviderImpl {
      static {
        __name(this, "_S3ExpressIdentityProviderImpl");
      }
      static {
        __name2(this, "S3ExpressIdentityProviderImpl");
      }
      createSessionFn;
      cache;
      static REFRESH_WINDOW_MS = 6e4;
      constructor(createSessionFn, cache2 = new S3ExpressIdentityCache()) {
        this.createSessionFn = createSessionFn;
        this.cache = cache2;
      }
      async getS3ExpressIdentity(awsIdentity, identityProperties) {
        const key = identityProperties.Bucket;
        const { cache: cache2 } = this;
        const entry = cache2.get(key);
        if (entry) {
          return entry.identity.then((identity) => {
            const isExpired = (identity.expiration?.getTime() ?? 0) < Date.now();
            if (isExpired) {
              return cache2.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
            }
            const isExpiringSoon = (identity.expiration?.getTime() ?? 0) < Date.now() + _S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS;
            if (isExpiringSoon && !entry.isRefreshing) {
              entry.isRefreshing = true;
              this.getIdentity(key).then((id) => {
                cache2.set(key, new S3ExpressIdentityCacheEntry(Promise.resolve(id)));
              });
            }
            return identity;
          });
        }
        return cache2.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
      }
      async getIdentity(key) {
        await this.cache.purgeExpired().catch((error) => {
          console.warn("Error while clearing expired entries in S3ExpressIdentityCache: \n" + error);
        });
        const session = await this.createSessionFn(key);
        if (!session.Credentials?.AccessKeyId || !session.Credentials?.SecretAccessKey) {
          throw new Error("s3#createSession response credential missing AccessKeyId or SecretAccessKey.");
        }
        const identity = {
          accessKeyId: session.Credentials.AccessKeyId,
          secretAccessKey: session.Credentials.SecretAccessKey,
          sessionToken: session.Credentials.SessionToken,
          expiration: session.Credentials.Expiration ? new Date(session.Credentials.Expiration) : void 0
        };
        return identity;
      }
    };
  }
});
var S3_EXPRESS_BUCKET_TYPE;
var S3_EXPRESS_BACKEND;
var S3_EXPRESS_AUTH_SCHEME;
var SESSION_TOKEN_QUERY_PARAM;
var SESSION_TOKEN_HEADER;
var init_constants5 = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    S3_EXPRESS_BUCKET_TYPE = "Directory";
    S3_EXPRESS_BACKEND = "S3Express";
    S3_EXPRESS_AUTH_SCHEME = "sigv4-s3express";
    SESSION_TOKEN_QUERY_PARAM = "X-Amz-S3session-Token";
    SESSION_TOKEN_HEADER = SESSION_TOKEN_QUERY_PARAM.toLowerCase();
  }
});
var s3ExpressMiddleware;
var s3ExpressMiddlewareOptions;
var getS3ExpressPlugin;
var init_s3ExpressMiddleware = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/s3ExpressMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es22();
    init_dist_es2();
    init_constants5();
    s3ExpressMiddleware = /* @__PURE__ */ __name2((options) => {
      return (next, context) => async (args) => {
        if (context.endpointV2) {
          const endpoint = context.endpointV2;
          const isS3ExpressAuth = endpoint.properties?.authSchemes?.[0]?.name === S3_EXPRESS_AUTH_SCHEME;
          const isS3ExpressBucket = endpoint.properties?.backend === S3_EXPRESS_BACKEND || endpoint.properties?.bucketType === S3_EXPRESS_BUCKET_TYPE;
          if (isS3ExpressBucket) {
            setFeature(context, "S3_EXPRESS_BUCKET", "J");
            context.isS3ExpressBucket = true;
          }
          if (isS3ExpressAuth) {
            const requestBucket = args.input.Bucket;
            if (requestBucket) {
              const s3ExpressIdentity = await options.s3ExpressIdentityProvider.getS3ExpressIdentity(await options.credentials(), {
                Bucket: requestBucket
              });
              context.s3ExpressIdentity = s3ExpressIdentity;
              if (HttpRequest.isInstance(args.request) && s3ExpressIdentity.sessionToken) {
                args.request.headers[SESSION_TOKEN_HEADER] = s3ExpressIdentity.sessionToken;
              }
            }
          }
        }
        return next(args);
      };
    }, "s3ExpressMiddleware");
    s3ExpressMiddlewareOptions = {
      name: "s3ExpressMiddleware",
      step: "build",
      tags: ["S3", "S3_EXPRESS"],
      override: true
    };
    getS3ExpressPlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(s3ExpressMiddleware(options), s3ExpressMiddlewareOptions);
      }, "applyToStack")
    }), "getS3ExpressPlugin");
  }
});
var signS3Express;
var init_signS3Express = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/signS3Express.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    signS3Express = /* @__PURE__ */ __name2(async (s3ExpressIdentity, signingOptions, request, sigV4MultiRegionSigner) => {
      const signedRequest = await sigV4MultiRegionSigner.signWithCredentials(request, s3ExpressIdentity, {});
      if (signedRequest.headers["X-Amz-Security-Token"] || signedRequest.headers["x-amz-security-token"]) {
        throw new Error("X-Amz-Security-Token must not be set for s3-express requests.");
      }
      return signedRequest;
    }, "signS3Express");
  }
});
var defaultErrorHandler2;
var defaultSuccessHandler2;
var s3ExpressHttpSigningMiddleware;
var getS3ExpressHttpSigningPlugin;
var init_s3ExpressHttpSigningMiddleware = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/s3ExpressHttpSigningMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    init_dist_es2();
    init_dist_es4();
    init_signS3Express();
    defaultErrorHandler2 = /* @__PURE__ */ __name2((signingProperties) => (error) => {
      throw error;
    }, "defaultErrorHandler");
    defaultSuccessHandler2 = /* @__PURE__ */ __name2((httpResponse, signingProperties) => {
    }, "defaultSuccessHandler");
    s3ExpressHttpSigningMiddleware = /* @__PURE__ */ __name2((config) => (next, context) => async (args) => {
      if (!HttpRequest.isInstance(args.request)) {
        return next(args);
      }
      const smithyContext = getSmithyContext(context);
      const scheme = smithyContext.selectedHttpAuthScheme;
      if (!scheme) {
        throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
      }
      const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
      let request;
      if (context.s3ExpressIdentity) {
        request = await signS3Express(context.s3ExpressIdentity, signingProperties, args.request, await config.signer());
      } else {
        request = await signer.sign(args.request, identity, signingProperties);
      }
      const output = await next({
        ...args,
        request
      }).catch((signer.errorHandler || defaultErrorHandler2)(signingProperties));
      (signer.successHandler || defaultSuccessHandler2)(output.response, signingProperties);
      return output;
    }, "s3ExpressHttpSigningMiddleware");
    getS3ExpressHttpSigningPlugin = /* @__PURE__ */ __name2((config) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.addRelativeTo(s3ExpressHttpSigningMiddleware(config), httpSigningMiddlewareOptions);
      }, "applyToStack")
    }), "getS3ExpressHttpSigningPlugin");
  }
});
var init_s3_express = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_S3ExpressIdentityProviderImpl();
    init_s3ExpressMiddleware();
    init_s3ExpressHttpSigningMiddleware();
  }
});
var resolveS3Config;
var init_s3Configuration = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3Configuration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_s3_express();
    resolveS3Config = /* @__PURE__ */ __name2((input, { session }) => {
      const [s3ClientProvider, CreateSessionCommandCtor] = session;
      const { forcePathStyle, useAccelerateEndpoint, disableMultiregionAccessPoints, followRegionRedirects, s3ExpressIdentityProvider, bucketEndpoint, expectContinueHeader } = input;
      return Object.assign(input, {
        forcePathStyle: forcePathStyle ?? false,
        useAccelerateEndpoint: useAccelerateEndpoint ?? false,
        disableMultiregionAccessPoints: disableMultiregionAccessPoints ?? false,
        followRegionRedirects: followRegionRedirects ?? false,
        s3ExpressIdentityProvider: s3ExpressIdentityProvider ?? new S3ExpressIdentityProviderImpl(async (key) => s3ClientProvider().send(new CreateSessionCommandCtor({
          Bucket: key
        }))),
        bucketEndpoint: bucketEndpoint ?? false,
        expectContinueHeader: expectContinueHeader ?? 2097152
      });
    }, "resolveS3Config");
  }
});
var THROW_IF_EMPTY_BODY;
var MAX_BYTES_TO_INSPECT;
var throw200ExceptionsMiddleware;
var collectBody2;
var throw200ExceptionsMiddlewareOptions;
var getThrow200ExceptionsPlugin;
var init_throw_200_exceptions = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/throw-200-exceptions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_dist_es12();
    THROW_IF_EMPTY_BODY = {
      CopyObjectCommand: true,
      UploadPartCopyCommand: true,
      CompleteMultipartUploadCommand: true
    };
    MAX_BYTES_TO_INSPECT = 3e3;
    throw200ExceptionsMiddleware = /* @__PURE__ */ __name2((config) => (next, context) => async (args) => {
      const result = await next(args);
      const { response } = result;
      if (!HttpResponse.isInstance(response)) {
        return result;
      }
      const { statusCode, body: sourceBody } = response;
      if (statusCode < 200 || statusCode >= 300) {
        return result;
      }
      const isSplittableStream = typeof sourceBody?.stream === "function" || typeof sourceBody?.pipe === "function" || typeof sourceBody?.tee === "function";
      if (!isSplittableStream) {
        return result;
      }
      let bodyCopy = sourceBody;
      let body = sourceBody;
      if (sourceBody && typeof sourceBody === "object" && !(sourceBody instanceof Uint8Array)) {
        [bodyCopy, body] = await splitStream(sourceBody);
      }
      response.body = body;
      const bodyBytes = await collectBody2(bodyCopy, {
        streamCollector: /* @__PURE__ */ __name2(async (stream) => {
          return headStream(stream, MAX_BYTES_TO_INSPECT);
        }, "streamCollector")
      });
      if (typeof bodyCopy?.destroy === "function") {
        bodyCopy.destroy();
      }
      const bodyStringTail = config.utf8Encoder(bodyBytes.subarray(bodyBytes.length - 16));
      if (bodyBytes.length === 0 && THROW_IF_EMPTY_BODY[context.commandName]) {
        const err = new Error("S3 aborted request");
        err.name = "InternalError";
        throw err;
      }
      if (bodyStringTail && bodyStringTail.endsWith("</Error>")) {
        response.statusCode = 400;
      }
      return result;
    }, "throw200ExceptionsMiddleware");
    collectBody2 = /* @__PURE__ */ __name2((streamBody = new Uint8Array(), context) => {
      if (streamBody instanceof Uint8Array) {
        return Promise.resolve(streamBody);
      }
      return context.streamCollector(streamBody) || Promise.resolve(new Uint8Array());
    }, "collectBody");
    throw200ExceptionsMiddlewareOptions = {
      relation: "after",
      toMiddleware: "deserializerMiddleware",
      tags: ["THROW_200_EXCEPTIONS", "S3"],
      name: "throw200ExceptionsMiddleware",
      override: true
    };
    getThrow200ExceptionsPlugin = /* @__PURE__ */ __name2((config) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.addRelativeTo(throw200ExceptionsMiddleware(config), throw200ExceptionsMiddlewareOptions);
      }, "applyToStack")
    }), "getThrow200ExceptionsPlugin");
  }
});
var validate;
var init_dist_es29 = __esm({
  "../node_modules/@aws-sdk/util-arn-parser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    validate = /* @__PURE__ */ __name2((str) => typeof str === "string" && str.indexOf("arn:") === 0 && str.split(":").length >= 6, "validate");
  }
});
function bucketEndpointMiddleware(options) {
  return (next, context) => async (args) => {
    if (options.bucketEndpoint) {
      const endpoint = context.endpointV2;
      if (endpoint) {
        const bucket = args.input.Bucket;
        if (typeof bucket === "string") {
          try {
            const bucketEndpointUrl = new URL(bucket);
            context.endpointV2 = {
              ...endpoint,
              url: bucketEndpointUrl
            };
          } catch (e2) {
            const warning = `@aws-sdk/middleware-sdk-s3: bucketEndpoint=true was set but Bucket=${bucket} could not be parsed as URL.`;
            if (context.logger?.constructor?.name === "NoOpLogger") {
              console.warn(warning);
            } else {
              context.logger?.warn?.(warning);
            }
            throw e2;
          }
        }
      }
    }
    return next(args);
  };
}
__name(bucketEndpointMiddleware, "bucketEndpointMiddleware");
var bucketEndpointMiddlewareOptions;
var init_bucket_endpoint_middleware = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/bucket-endpoint-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(bucketEndpointMiddleware, "bucketEndpointMiddleware");
    bucketEndpointMiddlewareOptions = {
      name: "bucketEndpointMiddleware",
      override: true,
      relation: "after",
      toMiddleware: "endpointV2Middleware"
    };
  }
});
function validateBucketNameMiddleware({ bucketEndpoint }) {
  return (next) => async (args) => {
    const { input: { Bucket } } = args;
    if (!bucketEndpoint && typeof Bucket === "string" && !validate(Bucket) && Bucket.indexOf("/") >= 0) {
      const err = new Error(`Bucket name shouldn't contain '/', received '${Bucket}'`);
      err.name = "InvalidBucketName";
      throw err;
    }
    return next({ ...args });
  };
}
__name(validateBucketNameMiddleware, "validateBucketNameMiddleware");
var validateBucketNameMiddlewareOptions;
var getValidateBucketNamePlugin;
var init_validate_bucket_name = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/validate-bucket-name.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es29();
    init_bucket_endpoint_middleware();
    __name2(validateBucketNameMiddleware, "validateBucketNameMiddleware");
    validateBucketNameMiddlewareOptions = {
      step: "initialize",
      tags: ["VALIDATE_BUCKET_NAME"],
      name: "validateBucketNameMiddleware",
      override: true
    };
    getValidateBucketNamePlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(validateBucketNameMiddleware(options), validateBucketNameMiddlewareOptions);
        clientStack.addRelativeTo(bucketEndpointMiddleware(options), bucketEndpointMiddlewareOptions);
      }, "applyToStack")
    }), "getValidateBucketNamePlugin");
  }
});
var init_dist_es30 = __esm({
  "../node_modules/@aws-sdk/middleware-sdk-s3/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_check_content_length_header();
    init_region_redirect_endpoint_middleware();
    init_region_redirect_middleware();
    init_s3_expires_middleware();
    init_s3_express();
    init_s3Configuration();
    init_throw_200_exceptions();
    init_validate_bucket_name();
  }
});
function isValidUserAgentAppId(appId) {
  if (appId === void 0) {
    return true;
  }
  return typeof appId === "string" && appId.length <= 50;
}
__name(isValidUserAgentAppId, "isValidUserAgentAppId");
function resolveUserAgentConfig(input) {
  const normalizedAppIdProvider = normalizeProvider2(input.userAgentAppId ?? DEFAULT_UA_APP_ID);
  const { customUserAgent } = input;
  return Object.assign(input, {
    customUserAgent: typeof customUserAgent === "string" ? [[customUserAgent]] : customUserAgent,
    userAgentAppId: /* @__PURE__ */ __name2(async () => {
      const appId = await normalizedAppIdProvider();
      if (!isValidUserAgentAppId(appId)) {
        const logger2 = input.logger?.constructor?.name === "NoOpLogger" || !input.logger ? console : input.logger;
        if (typeof appId !== "string") {
          logger2?.warn("userAgentAppId must be a string or undefined.");
        } else if (appId.length > 50) {
          logger2?.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
        }
      }
      return appId;
    }, "userAgentAppId")
  });
}
__name(resolveUserAgentConfig, "resolveUserAgentConfig");
var DEFAULT_UA_APP_ID;
var init_configurations = __esm({
  "../node_modules/@aws-sdk/middleware-user-agent/dist-es/configurations.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    DEFAULT_UA_APP_ID = void 0;
    __name2(isValidUserAgentAppId, "isValidUserAgentAppId");
    __name2(resolveUserAgentConfig, "resolveUserAgentConfig");
  }
});
var EndpointCache;
var init_EndpointCache = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/cache/EndpointCache.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    EndpointCache = class {
      static {
        __name(this, "EndpointCache");
      }
      static {
        __name2(this, "EndpointCache");
      }
      capacity;
      data = /* @__PURE__ */ new Map();
      parameters = [];
      constructor({ size, params }) {
        this.capacity = size ?? 50;
        if (params) {
          this.parameters = params;
        }
      }
      get(endpointParams, resolver) {
        const key = this.hash(endpointParams);
        if (key === false) {
          return resolver();
        }
        if (!this.data.has(key)) {
          if (this.data.size > this.capacity + 10) {
            const keys = this.data.keys();
            let i2 = 0;
            while (true) {
              const { value, done } = keys.next();
              this.data.delete(value);
              if (done || ++i2 > 10) {
                break;
              }
            }
          }
          this.data.set(key, resolver());
        }
        return this.data.get(key);
      }
      size() {
        return this.data.size;
      }
      hash(endpointParams) {
        let buffer = "";
        const { parameters } = this;
        if (parameters.length === 0) {
          return false;
        }
        for (const param of parameters) {
          const val = String(endpointParams[param] ?? "");
          if (val.includes("|;")) {
            return false;
          }
          buffer += val + "|;";
        }
        return buffer;
      }
    };
  }
});
var IP_V4_REGEX;
var isIpAddress;
var init_isIpAddress = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/isIpAddress.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    IP_V4_REGEX = new RegExp(`^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$`);
    isIpAddress = /* @__PURE__ */ __name2((value) => IP_V4_REGEX.test(value) || value.startsWith("[") && value.endsWith("]"), "isIpAddress");
  }
});
var VALID_HOST_LABEL_REGEX;
var isValidHostLabel;
var init_isValidHostLabel = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/isValidHostLabel.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
    isValidHostLabel = /* @__PURE__ */ __name2((value, allowSubDomains = false) => {
      if (!allowSubDomains) {
        return VALID_HOST_LABEL_REGEX.test(value);
      }
      const labels = value.split(".");
      for (const label of labels) {
        if (!isValidHostLabel(label)) {
          return false;
        }
      }
      return true;
    }, "isValidHostLabel");
  }
});
var customEndpointFunctions;
var init_customEndpointFunctions = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/customEndpointFunctions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    customEndpointFunctions = {};
  }
});
var debugId;
var init_debugId = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/debug/debugId.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    debugId = "endpoints";
  }
});
function toDebugString(input) {
  if (typeof input !== "object" || input == null) {
    return input;
  }
  if ("ref" in input) {
    return `$${toDebugString(input.ref)}`;
  }
  if ("fn" in input) {
    return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
  }
  return JSON.stringify(input, null, 2);
}
__name(toDebugString, "toDebugString");
var init_toDebugString = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/debug/toDebugString.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(toDebugString, "toDebugString");
  }
});
var init_debug = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/debug/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_debugId();
    init_toDebugString();
  }
});
var EndpointError;
var init_EndpointError = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/EndpointError.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    EndpointError = class extends Error {
      static {
        __name(this, "EndpointError");
      }
      static {
        __name2(this, "EndpointError");
      }
      constructor(message) {
        super(message);
        this.name = "EndpointError";
      }
    };
  }
});
var init_EndpointFunctions = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/EndpointFunctions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_EndpointRuleObject2 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/EndpointRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_ErrorRuleObject2 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/ErrorRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_RuleSetObject2 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/RuleSetObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_TreeRuleObject2 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/TreeRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_shared2 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/shared.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_types3 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/types/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EndpointError();
    init_EndpointFunctions();
    init_EndpointRuleObject2();
    init_ErrorRuleObject2();
    init_RuleSetObject2();
    init_TreeRuleObject2();
    init_shared2();
  }
});
var booleanEquals;
var init_booleanEquals = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/booleanEquals.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    booleanEquals = /* @__PURE__ */ __name2((value1, value2) => value1 === value2, "booleanEquals");
  }
});
var getAttrPathList;
var init_getAttrPathList = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/getAttrPathList.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    getAttrPathList = /* @__PURE__ */ __name2((path) => {
      const parts = path.split(".");
      const pathList = [];
      for (const part of parts) {
        const squareBracketIndex = part.indexOf("[");
        if (squareBracketIndex !== -1) {
          if (part.indexOf("]") !== part.length - 1) {
            throw new EndpointError(`Path: '${path}' does not end with ']'`);
          }
          const arrayIndex = part.slice(squareBracketIndex + 1, -1);
          if (Number.isNaN(parseInt(arrayIndex))) {
            throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
          }
          if (squareBracketIndex !== 0) {
            pathList.push(part.slice(0, squareBracketIndex));
          }
          pathList.push(arrayIndex);
        } else {
          pathList.push(part);
        }
      }
      return pathList;
    }, "getAttrPathList");
  }
});
var getAttr;
var init_getAttr = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/getAttr.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    init_getAttrPathList();
    getAttr = /* @__PURE__ */ __name2((value, path) => getAttrPathList(path).reduce((acc, index) => {
      if (typeof acc !== "object") {
        throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
      } else if (Array.isArray(acc)) {
        return acc[parseInt(index)];
      }
      return acc[index];
    }, value), "getAttr");
  }
});
var isSet;
var init_isSet = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/isSet.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    isSet = /* @__PURE__ */ __name2((value) => value != null, "isSet");
  }
});
var not;
var init_not = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/not.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    not = /* @__PURE__ */ __name2((value) => !value, "not");
  }
});
var DEFAULT_PORTS;
var parseURL;
var init_parseURL = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/parseURL.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es();
    init_isIpAddress();
    DEFAULT_PORTS = {
      [EndpointURLScheme.HTTP]: 80,
      [EndpointURLScheme.HTTPS]: 443
    };
    parseURL = /* @__PURE__ */ __name2((value) => {
      const whatwgURL = (() => {
        try {
          if (value instanceof URL) {
            return value;
          }
          if (typeof value === "object" && "hostname" in value) {
            const { hostname: hostname2, port, protocol: protocol2 = "", path = "", query = {} } = value;
            const url = new URL(`${protocol2}//${hostname2}${port ? `:${port}` : ""}${path}`);
            url.search = Object.entries(query).map(([k2, v2]) => `${k2}=${v2}`).join("&");
            return url;
          }
          return new URL(value);
        } catch (error) {
          return null;
        }
      })();
      if (!whatwgURL) {
        console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
        return null;
      }
      const urlString = whatwgURL.href;
      const { host, hostname, pathname, protocol, search } = whatwgURL;
      if (search) {
        return null;
      }
      const scheme = protocol.slice(0, -1);
      if (!Object.values(EndpointURLScheme).includes(scheme)) {
        return null;
      }
      const isIp = isIpAddress(hostname);
      const inputContainsDefaultPort = urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`);
      const authority = `${host}${inputContainsDefaultPort ? `:${DEFAULT_PORTS[scheme]}` : ``}`;
      return {
        scheme,
        authority,
        path: pathname,
        normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
        isIp
      };
    }, "parseURL");
  }
});
var stringEquals;
var init_stringEquals = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/stringEquals.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    stringEquals = /* @__PURE__ */ __name2((value1, value2) => value1 === value2, "stringEquals");
  }
});
var substring;
var init_substring = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/substring.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    substring = /* @__PURE__ */ __name2((input, start, stop, reverse) => {
      if (start >= stop || input.length < stop) {
        return null;
      }
      if (!reverse) {
        return input.substring(start, stop);
      }
      return input.substring(input.length - stop, input.length - start);
    }, "substring");
  }
});
var uriEncode;
var init_uriEncode = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/uriEncode.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    uriEncode = /* @__PURE__ */ __name2((value) => encodeURIComponent(value).replace(/[!*'()]/g, (c2) => `%${c2.charCodeAt(0).toString(16).toUpperCase()}`), "uriEncode");
  }
});
var init_lib = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/lib/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_booleanEquals();
    init_getAttr();
    init_isSet();
    init_isValidHostLabel();
    init_not();
    init_parseURL();
    init_stringEquals();
    init_substring();
    init_uriEncode();
  }
});
var endpointFunctions;
var init_endpointFunctions = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/endpointFunctions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_lib();
    endpointFunctions = {
      booleanEquals,
      getAttr,
      isSet,
      isValidHostLabel,
      not,
      parseURL,
      stringEquals,
      substring,
      uriEncode
    };
  }
});
var evaluateTemplate;
var init_evaluateTemplate = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/evaluateTemplate.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_lib();
    evaluateTemplate = /* @__PURE__ */ __name2((template, options) => {
      const evaluatedTemplateArr = [];
      const templateContext = {
        ...options.endpointParams,
        ...options.referenceRecord
      };
      let currentIndex = 0;
      while (currentIndex < template.length) {
        const openingBraceIndex = template.indexOf("{", currentIndex);
        if (openingBraceIndex === -1) {
          evaluatedTemplateArr.push(template.slice(currentIndex));
          break;
        }
        evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
        const closingBraceIndex = template.indexOf("}", openingBraceIndex);
        if (closingBraceIndex === -1) {
          evaluatedTemplateArr.push(template.slice(openingBraceIndex));
          break;
        }
        if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
          evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
          currentIndex = closingBraceIndex + 2;
        }
        const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
        if (parameterName.includes("#")) {
          const [refName, attrName] = parameterName.split("#");
          evaluatedTemplateArr.push(getAttr(templateContext[refName], attrName));
        } else {
          evaluatedTemplateArr.push(templateContext[parameterName]);
        }
        currentIndex = closingBraceIndex + 1;
      }
      return evaluatedTemplateArr.join("");
    }, "evaluateTemplate");
  }
});
var getReferenceValue;
var init_getReferenceValue = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/getReferenceValue.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getReferenceValue = /* @__PURE__ */ __name2(({ ref }, options) => {
      const referenceRecord = {
        ...options.endpointParams,
        ...options.referenceRecord
      };
      return referenceRecord[ref];
    }, "getReferenceValue");
  }
});
var evaluateExpression;
var callFunction;
var group;
var init_evaluateExpression = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/evaluateExpression.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    init_customEndpointFunctions();
    init_endpointFunctions();
    init_evaluateTemplate();
    init_getReferenceValue();
    evaluateExpression = /* @__PURE__ */ __name2((obj, keyName, options) => {
      if (typeof obj === "string") {
        return evaluateTemplate(obj, options);
      } else if (obj["fn"]) {
        return group.callFunction(obj, options);
      } else if (obj["ref"]) {
        return getReferenceValue(obj, options);
      }
      throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
    }, "evaluateExpression");
    callFunction = /* @__PURE__ */ __name2(({ fn, argv }, options) => {
      const evaluatedArgs = argv.map((arg) => ["boolean", "number"].includes(typeof arg) ? arg : group.evaluateExpression(arg, "arg", options));
      const fnSegments = fn.split(".");
      if (fnSegments[0] in customEndpointFunctions && fnSegments[1] != null) {
        return customEndpointFunctions[fnSegments[0]][fnSegments[1]](...evaluatedArgs);
      }
      return endpointFunctions[fn](...evaluatedArgs);
    }, "callFunction");
    group = {
      evaluateExpression,
      callFunction
    };
  }
});
var init_callFunction = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/callFunction.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_evaluateExpression();
  }
});
var evaluateCondition;
var init_evaluateCondition = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/evaluateCondition.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_debug();
    init_types3();
    init_callFunction();
    evaluateCondition = /* @__PURE__ */ __name2(({ assign, ...fnArgs }, options) => {
      if (assign && assign in options.referenceRecord) {
        throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
      }
      const value = callFunction(fnArgs, options);
      options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(fnArgs)} = ${toDebugString(value)}`);
      return {
        result: value === "" ? true : !!value,
        ...assign != null && { toAssign: { name: assign, value } }
      };
    }, "evaluateCondition");
  }
});
var evaluateConditions;
var init_evaluateConditions = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/evaluateConditions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_debug();
    init_evaluateCondition();
    evaluateConditions = /* @__PURE__ */ __name2((conditions = [], options) => {
      const conditionsReferenceRecord = {};
      for (const condition of conditions) {
        const { result, toAssign } = evaluateCondition(condition, {
          ...options,
          referenceRecord: {
            ...options.referenceRecord,
            ...conditionsReferenceRecord
          }
        });
        if (!result) {
          return { result };
        }
        if (toAssign) {
          conditionsReferenceRecord[toAssign.name] = toAssign.value;
          options.logger?.debug?.(`${debugId} assign: ${toAssign.name} := ${toDebugString(toAssign.value)}`);
        }
      }
      return { result: true, referenceRecord: conditionsReferenceRecord };
    }, "evaluateConditions");
  }
});
var getEndpointHeaders;
var init_getEndpointHeaders = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointHeaders.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    init_evaluateExpression();
    getEndpointHeaders = /* @__PURE__ */ __name2((headers, options) => Object.entries(headers).reduce((acc, [headerKey, headerVal]) => ({
      ...acc,
      [headerKey]: headerVal.map((headerValEntry) => {
        const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
        if (typeof processedExpr !== "string") {
          throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
        }
        return processedExpr;
      })
    }), {}), "getEndpointHeaders");
  }
});
var getEndpointProperties;
var getEndpointProperty;
var group2;
var init_getEndpointProperties = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointProperties.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    init_evaluateTemplate();
    getEndpointProperties = /* @__PURE__ */ __name2((properties, options) => Object.entries(properties).reduce((acc, [propertyKey, propertyVal]) => ({
      ...acc,
      [propertyKey]: group2.getEndpointProperty(propertyVal, options)
    }), {}), "getEndpointProperties");
    getEndpointProperty = /* @__PURE__ */ __name2((property, options) => {
      if (Array.isArray(property)) {
        return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
      }
      switch (typeof property) {
        case "string":
          return evaluateTemplate(property, options);
        case "object":
          if (property === null) {
            throw new EndpointError(`Unexpected endpoint property: ${property}`);
          }
          return group2.getEndpointProperties(property, options);
        case "boolean":
          return property;
        default:
          throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
      }
    }, "getEndpointProperty");
    group2 = {
      getEndpointProperty,
      getEndpointProperties
    };
  }
});
var getEndpointUrl;
var init_getEndpointUrl = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointUrl.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    init_evaluateExpression();
    getEndpointUrl = /* @__PURE__ */ __name2((endpointUrl, options) => {
      const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
      if (typeof expression === "string") {
        try {
          return new URL(expression);
        } catch (error) {
          console.error(`Failed to construct URL with ${expression}`, error);
          throw error;
        }
      }
      throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
    }, "getEndpointUrl");
  }
});
var evaluateEndpointRule;
var init_evaluateEndpointRule = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/evaluateEndpointRule.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_debug();
    init_evaluateConditions();
    init_getEndpointHeaders();
    init_getEndpointProperties();
    init_getEndpointUrl();
    evaluateEndpointRule = /* @__PURE__ */ __name2((endpointRule, options) => {
      const { conditions, endpoint } = endpointRule;
      const { result, referenceRecord } = evaluateConditions(conditions, options);
      if (!result) {
        return;
      }
      const endpointRuleOptions = {
        ...options,
        referenceRecord: { ...options.referenceRecord, ...referenceRecord }
      };
      const { url, properties, headers } = endpoint;
      options.logger?.debug?.(`${debugId} Resolving endpoint from template: ${toDebugString(endpoint)}`);
      return {
        ...headers != void 0 && {
          headers: getEndpointHeaders(headers, endpointRuleOptions)
        },
        ...properties != void 0 && {
          properties: getEndpointProperties(properties, endpointRuleOptions)
        },
        url: getEndpointUrl(url, endpointRuleOptions)
      };
    }, "evaluateEndpointRule");
  }
});
var evaluateErrorRule;
var init_evaluateErrorRule = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/evaluateErrorRule.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    init_evaluateConditions();
    init_evaluateExpression();
    evaluateErrorRule = /* @__PURE__ */ __name2((errorRule, options) => {
      const { conditions, error } = errorRule;
      const { result, referenceRecord } = evaluateConditions(conditions, options);
      if (!result) {
        return;
      }
      throw new EndpointError(evaluateExpression(error, "Error", {
        ...options,
        referenceRecord: { ...options.referenceRecord, ...referenceRecord }
      }));
    }, "evaluateErrorRule");
  }
});
var evaluateRules;
var evaluateTreeRule;
var group3;
var init_evaluateRules = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/evaluateRules.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_types3();
    init_evaluateConditions();
    init_evaluateEndpointRule();
    init_evaluateErrorRule();
    evaluateRules = /* @__PURE__ */ __name2((rules, options) => {
      for (const rule of rules) {
        if (rule.type === "endpoint") {
          const endpointOrUndefined = evaluateEndpointRule(rule, options);
          if (endpointOrUndefined) {
            return endpointOrUndefined;
          }
        } else if (rule.type === "error") {
          evaluateErrorRule(rule, options);
        } else if (rule.type === "tree") {
          const endpointOrUndefined = group3.evaluateTreeRule(rule, options);
          if (endpointOrUndefined) {
            return endpointOrUndefined;
          }
        } else {
          throw new EndpointError(`Unknown endpoint rule: ${rule}`);
        }
      }
      throw new EndpointError(`Rules evaluation failed`);
    }, "evaluateRules");
    evaluateTreeRule = /* @__PURE__ */ __name2((treeRule, options) => {
      const { conditions, rules } = treeRule;
      const { result, referenceRecord } = evaluateConditions(conditions, options);
      if (!result) {
        return;
      }
      return group3.evaluateRules(rules, {
        ...options,
        referenceRecord: { ...options.referenceRecord, ...referenceRecord }
      });
    }, "evaluateTreeRule");
    group3 = {
      evaluateRules,
      evaluateTreeRule
    };
  }
});
var init_utils2 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/utils/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_customEndpointFunctions();
    init_evaluateRules();
  }
});
var resolveEndpoint;
var init_resolveEndpoint = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/resolveEndpoint.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_debug();
    init_types3();
    init_utils2();
    resolveEndpoint = /* @__PURE__ */ __name2((ruleSetObject, options) => {
      const { endpointParams, logger: logger2 } = options;
      const { parameters, rules } = ruleSetObject;
      options.logger?.debug?.(`${debugId} Initial EndpointParams: ${toDebugString(endpointParams)}`);
      const paramsWithDefault = Object.entries(parameters).filter(([, v2]) => v2.default != null).map(([k2, v2]) => [k2, v2.default]);
      if (paramsWithDefault.length > 0) {
        for (const [paramKey, paramDefaultValue] of paramsWithDefault) {
          endpointParams[paramKey] = endpointParams[paramKey] ?? paramDefaultValue;
        }
      }
      const requiredParams = Object.entries(parameters).filter(([, v2]) => v2.required).map(([k2]) => k2);
      for (const requiredParam of requiredParams) {
        if (endpointParams[requiredParam] == null) {
          throw new EndpointError(`Missing required parameter: '${requiredParam}'`);
        }
      }
      const endpoint = evaluateRules(rules, { endpointParams, logger: logger2, referenceRecord: {} });
      options.logger?.debug?.(`${debugId} Resolved endpoint: ${toDebugString(endpoint)}`);
      return endpoint;
    }, "resolveEndpoint");
  }
});
var init_dist_es31 = __esm({
  "../node_modules/@smithy/util-endpoints/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EndpointCache();
    init_isIpAddress();
    init_isValidHostLabel();
    init_customEndpointFunctions();
    init_resolveEndpoint();
    init_types3();
  }
});
var init_isIpAddress2 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/lib/isIpAddress.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es31();
  }
});
var isVirtualHostableS3Bucket;
var init_isVirtualHostableS3Bucket = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/isVirtualHostableS3Bucket.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es31();
    init_isIpAddress2();
    isVirtualHostableS3Bucket = /* @__PURE__ */ __name2((value, allowSubDomains = false) => {
      if (allowSubDomains) {
        for (const label of value.split(".")) {
          if (!isVirtualHostableS3Bucket(label)) {
            return false;
          }
        }
        return true;
      }
      if (!isValidHostLabel(value)) {
        return false;
      }
      if (value.length < 3 || value.length > 63) {
        return false;
      }
      if (value !== value.toLowerCase()) {
        return false;
      }
      if (isIpAddress(value)) {
        return false;
      }
      return true;
    }, "isVirtualHostableS3Bucket");
  }
});
var ARN_DELIMITER;
var RESOURCE_DELIMITER;
var parseArn;
var init_parseArn = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/parseArn.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    ARN_DELIMITER = ":";
    RESOURCE_DELIMITER = "/";
    parseArn = /* @__PURE__ */ __name2((value) => {
      const segments = value.split(ARN_DELIMITER);
      if (segments.length < 6)
        return null;
      const [arn, partition2, service, region, accountId, ...resourcePath] = segments;
      if (arn !== "arn" || partition2 === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "")
        return null;
      const resourceId = resourcePath.map((resource) => resource.split(RESOURCE_DELIMITER)).flat();
      return {
        partition: partition2,
        service,
        region,
        accountId,
        resourceId
      };
    }, "parseArn");
  }
});
var partitions_default;
var init_partitions = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/partitions.json"() {
    partitions_default = {
      partitions: [{
        id: "aws",
        outputs: {
          dnsSuffix: "amazonaws.com",
          dualStackDnsSuffix: "api.aws",
          implicitGlobalRegion: "us-east-1",
          name: "aws",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
        regions: {
          "af-south-1": {
            description: "Africa (Cape Town)"
          },
          "ap-east-1": {
            description: "Asia Pacific (Hong Kong)"
          },
          "ap-east-2": {
            description: "Asia Pacific (Taipei)"
          },
          "ap-northeast-1": {
            description: "Asia Pacific (Tokyo)"
          },
          "ap-northeast-2": {
            description: "Asia Pacific (Seoul)"
          },
          "ap-northeast-3": {
            description: "Asia Pacific (Osaka)"
          },
          "ap-south-1": {
            description: "Asia Pacific (Mumbai)"
          },
          "ap-south-2": {
            description: "Asia Pacific (Hyderabad)"
          },
          "ap-southeast-1": {
            description: "Asia Pacific (Singapore)"
          },
          "ap-southeast-2": {
            description: "Asia Pacific (Sydney)"
          },
          "ap-southeast-3": {
            description: "Asia Pacific (Jakarta)"
          },
          "ap-southeast-4": {
            description: "Asia Pacific (Melbourne)"
          },
          "ap-southeast-5": {
            description: "Asia Pacific (Malaysia)"
          },
          "ap-southeast-6": {
            description: "Asia Pacific (New Zealand)"
          },
          "ap-southeast-7": {
            description: "Asia Pacific (Thailand)"
          },
          "aws-global": {
            description: "aws global region"
          },
          "ca-central-1": {
            description: "Canada (Central)"
          },
          "ca-west-1": {
            description: "Canada West (Calgary)"
          },
          "eu-central-1": {
            description: "Europe (Frankfurt)"
          },
          "eu-central-2": {
            description: "Europe (Zurich)"
          },
          "eu-north-1": {
            description: "Europe (Stockholm)"
          },
          "eu-south-1": {
            description: "Europe (Milan)"
          },
          "eu-south-2": {
            description: "Europe (Spain)"
          },
          "eu-west-1": {
            description: "Europe (Ireland)"
          },
          "eu-west-2": {
            description: "Europe (London)"
          },
          "eu-west-3": {
            description: "Europe (Paris)"
          },
          "il-central-1": {
            description: "Israel (Tel Aviv)"
          },
          "me-central-1": {
            description: "Middle East (UAE)"
          },
          "me-south-1": {
            description: "Middle East (Bahrain)"
          },
          "mx-central-1": {
            description: "Mexico (Central)"
          },
          "sa-east-1": {
            description: "South America (Sao Paulo)"
          },
          "us-east-1": {
            description: "US East (N. Virginia)"
          },
          "us-east-2": {
            description: "US East (Ohio)"
          },
          "us-west-1": {
            description: "US West (N. California)"
          },
          "us-west-2": {
            description: "US West (Oregon)"
          }
        }
      }, {
        id: "aws-cn",
        outputs: {
          dnsSuffix: "amazonaws.com.cn",
          dualStackDnsSuffix: "api.amazonwebservices.com.cn",
          implicitGlobalRegion: "cn-northwest-1",
          name: "aws-cn",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^cn\\-\\w+\\-\\d+$",
        regions: {
          "aws-cn-global": {
            description: "aws-cn global region"
          },
          "cn-north-1": {
            description: "China (Beijing)"
          },
          "cn-northwest-1": {
            description: "China (Ningxia)"
          }
        }
      }, {
        id: "aws-eusc",
        outputs: {
          dnsSuffix: "amazonaws.eu",
          dualStackDnsSuffix: "api.amazonwebservices.eu",
          implicitGlobalRegion: "eusc-de-east-1",
          name: "aws-eusc",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^eusc\\-(de)\\-\\w+\\-\\d+$",
        regions: {
          "eusc-de-east-1": {
            description: "AWS European Sovereign Cloud (Germany)"
          }
        }
      }, {
        id: "aws-iso",
        outputs: {
          dnsSuffix: "c2s.ic.gov",
          dualStackDnsSuffix: "api.aws.ic.gov",
          implicitGlobalRegion: "us-iso-east-1",
          name: "aws-iso",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-iso\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-global": {
            description: "aws-iso global region"
          },
          "us-iso-east-1": {
            description: "US ISO East"
          },
          "us-iso-west-1": {
            description: "US ISO WEST"
          }
        }
      }, {
        id: "aws-iso-b",
        outputs: {
          dnsSuffix: "sc2s.sgov.gov",
          dualStackDnsSuffix: "api.aws.scloud",
          implicitGlobalRegion: "us-isob-east-1",
          name: "aws-iso-b",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-isob\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-b-global": {
            description: "aws-iso-b global region"
          },
          "us-isob-east-1": {
            description: "US ISOB East (Ohio)"
          },
          "us-isob-west-1": {
            description: "US ISOB West"
          }
        }
      }, {
        id: "aws-iso-e",
        outputs: {
          dnsSuffix: "cloud.adc-e.uk",
          dualStackDnsSuffix: "api.cloud-aws.adc-e.uk",
          implicitGlobalRegion: "eu-isoe-west-1",
          name: "aws-iso-e",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^eu\\-isoe\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-e-global": {
            description: "aws-iso-e global region"
          },
          "eu-isoe-west-1": {
            description: "EU ISOE West"
          }
        }
      }, {
        id: "aws-iso-f",
        outputs: {
          dnsSuffix: "csp.hci.ic.gov",
          dualStackDnsSuffix: "api.aws.hci.ic.gov",
          implicitGlobalRegion: "us-isof-south-1",
          name: "aws-iso-f",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-isof\\-\\w+\\-\\d+$",
        regions: {
          "aws-iso-f-global": {
            description: "aws-iso-f global region"
          },
          "us-isof-east-1": {
            description: "US ISOF EAST"
          },
          "us-isof-south-1": {
            description: "US ISOF SOUTH"
          }
        }
      }, {
        id: "aws-us-gov",
        outputs: {
          dnsSuffix: "amazonaws.com",
          dualStackDnsSuffix: "api.aws",
          implicitGlobalRegion: "us-gov-west-1",
          name: "aws-us-gov",
          supportsDualStack: true,
          supportsFIPS: true
        },
        regionRegex: "^us\\-gov\\-\\w+\\-\\d+$",
        regions: {
          "aws-us-gov-global": {
            description: "aws-us-gov global region"
          },
          "us-gov-east-1": {
            description: "AWS GovCloud (US-East)"
          },
          "us-gov-west-1": {
            description: "AWS GovCloud (US-West)"
          }
        }
      }],
      version: "1.1"
    };
  }
});
var selectedPartitionsInfo;
var selectedUserAgentPrefix;
var partition;
var getUserAgentPrefix;
var init_partition = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/partition.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_partitions();
    selectedPartitionsInfo = partitions_default;
    selectedUserAgentPrefix = "";
    partition = /* @__PURE__ */ __name2((value) => {
      const { partitions } = selectedPartitionsInfo;
      for (const partition2 of partitions) {
        const { regions, outputs } = partition2;
        for (const [region, regionData] of Object.entries(regions)) {
          if (region === value) {
            return {
              ...outputs,
              ...regionData
            };
          }
        }
      }
      for (const partition2 of partitions) {
        const { regionRegex, outputs } = partition2;
        if (new RegExp(regionRegex).test(value)) {
          return {
            ...outputs
          };
        }
      }
      const DEFAULT_PARTITION = partitions.find((partition2) => partition2.id === "aws");
      if (!DEFAULT_PARTITION) {
        throw new Error("Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.");
      }
      return {
        ...DEFAULT_PARTITION.outputs
      };
    }, "partition");
    getUserAgentPrefix = /* @__PURE__ */ __name2(() => selectedUserAgentPrefix, "getUserAgentPrefix");
  }
});
var awsEndpointFunctions;
var init_aws = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/aws.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es31();
    init_isVirtualHostableS3Bucket();
    init_parseArn();
    init_partition();
    awsEndpointFunctions = {
      isVirtualHostableS3Bucket,
      parseArn,
      partition
    };
    customEndpointFunctions.aws = awsEndpointFunctions;
  }
});
function parseQueryString(querystring) {
  const query = {};
  querystring = querystring.replace(/^\?/, "");
  if (querystring) {
    for (const pair of querystring.split("&")) {
      let [key, value = null] = pair.split("=");
      key = decodeURIComponent(key);
      if (value) {
        value = decodeURIComponent(value);
      }
      if (!(key in query)) {
        query[key] = value;
      } else if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    }
  }
  return query;
}
__name(parseQueryString, "parseQueryString");
var init_dist_es32 = __esm({
  "../node_modules/@smithy/querystring-parser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(parseQueryString, "parseQueryString");
  }
});
var parseUrl;
var init_dist_es33 = __esm({
  "../node_modules/@smithy/url-parser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es32();
    parseUrl = /* @__PURE__ */ __name2((url) => {
      if (typeof url === "string") {
        return parseUrl(new URL(url));
      }
      const { hostname, pathname, port, protocol, search } = url;
      let query;
      if (search) {
        query = parseQueryString(search);
      }
      return {
        hostname,
        port: port ? parseInt(port) : void 0,
        protocol,
        path: pathname,
        query
      };
    }, "parseUrl");
  }
});
var init_resolveDefaultAwsRegionalEndpointsConfig = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/resolveDefaultAwsRegionalEndpointsConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_resolveEndpoint2 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/resolveEndpoint.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_EndpointError2 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/types/EndpointError.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_EndpointRuleObject3 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/types/EndpointRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_ErrorRuleObject3 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/types/ErrorRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_RuleSetObject3 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/types/RuleSetObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_TreeRuleObject3 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/types/TreeRuleObject.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_shared3 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/types/shared.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_types4 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/types/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EndpointError2();
    init_EndpointRuleObject3();
    init_ErrorRuleObject3();
    init_RuleSetObject3();
    init_TreeRuleObject3();
    init_shared3();
  }
});
var init_dist_es34 = __esm({
  "../node_modules/@aws-sdk/util-endpoints/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_aws();
    init_partition();
    init_isIpAddress2();
    init_resolveDefaultAwsRegionalEndpointsConfig();
    init_resolveEndpoint2();
    init_types4();
  }
});
async function checkFeatures(context, config, args) {
  const request = args.request;
  if (request?.headers?.["smithy-protocol"] === "rpc-v2-cbor") {
    setFeature(context, "PROTOCOL_RPC_V2_CBOR", "M");
  }
  if (typeof config.retryStrategy === "function") {
    const retryStrategy = await config.retryStrategy();
    if (typeof retryStrategy.acquireInitialRetryToken === "function") {
      if (retryStrategy.constructor?.name?.includes("Adaptive")) {
        setFeature(context, "RETRY_MODE_ADAPTIVE", "F");
      } else {
        setFeature(context, "RETRY_MODE_STANDARD", "E");
      }
    } else {
      setFeature(context, "RETRY_MODE_LEGACY", "D");
    }
  }
  if (typeof config.accountIdEndpointMode === "function") {
    const endpointV2 = context.endpointV2;
    if (String(endpointV2?.url?.hostname).match(ACCOUNT_ID_ENDPOINT_REGEX)) {
      setFeature(context, "ACCOUNT_ID_ENDPOINT", "O");
    }
    switch (await config.accountIdEndpointMode?.()) {
      case "disabled":
        setFeature(context, "ACCOUNT_ID_MODE_DISABLED", "Q");
        break;
      case "preferred":
        setFeature(context, "ACCOUNT_ID_MODE_PREFERRED", "P");
        break;
      case "required":
        setFeature(context, "ACCOUNT_ID_MODE_REQUIRED", "R");
        break;
    }
  }
  const identity = context.__smithy_context?.selectedHttpAuthScheme?.identity;
  if (identity?.$source) {
    const credentials = identity;
    if (credentials.accountId) {
      setFeature(context, "RESOLVED_ACCOUNT_ID", "T");
    }
    for (const [key, value] of Object.entries(credentials.$source ?? {})) {
      setFeature(context, key, value);
    }
  }
}
__name(checkFeatures, "checkFeatures");
var ACCOUNT_ID_ENDPOINT_REGEX;
var init_check_features = __esm({
  "../node_modules/@aws-sdk/middleware-user-agent/dist-es/check-features.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es22();
    ACCOUNT_ID_ENDPOINT_REGEX = /\d{12}\.ddb/;
    __name2(checkFeatures, "checkFeatures");
  }
});
var USER_AGENT;
var X_AMZ_USER_AGENT;
var SPACE;
var UA_NAME_SEPARATOR;
var UA_NAME_ESCAPE_REGEX;
var UA_VALUE_ESCAPE_REGEX;
var UA_ESCAPE_CHAR;
var init_constants6 = __esm({
  "../node_modules/@aws-sdk/middleware-user-agent/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    USER_AGENT = "user-agent";
    X_AMZ_USER_AGENT = "x-amz-user-agent";
    SPACE = " ";
    UA_NAME_SEPARATOR = "/";
    UA_NAME_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w]/g;
    UA_VALUE_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w#]/g;
    UA_ESCAPE_CHAR = "-";
  }
});
function encodeFeatures(features) {
  let buffer = "";
  for (const key in features) {
    const val = features[key];
    if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
      if (buffer.length) {
        buffer += "," + val;
      } else {
        buffer += val;
      }
      continue;
    }
    break;
  }
  return buffer;
}
__name(encodeFeatures, "encodeFeatures");
var BYTE_LIMIT;
var init_encode_features = __esm({
  "../node_modules/@aws-sdk/middleware-user-agent/dist-es/encode-features.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    BYTE_LIMIT = 1024;
    __name2(encodeFeatures, "encodeFeatures");
  }
});
var userAgentMiddleware;
var escapeUserAgent;
var getUserAgentMiddlewareOptions;
var getUserAgentPlugin;
var init_user_agent_middleware = __esm({
  "../node_modules/@aws-sdk/middleware-user-agent/dist-es/user-agent-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es34();
    init_dist_es2();
    init_check_features();
    init_constants6();
    init_encode_features();
    userAgentMiddleware = /* @__PURE__ */ __name2((options) => (next, context) => async (args) => {
      const { request } = args;
      if (!HttpRequest.isInstance(request)) {
        return next(args);
      }
      const { headers } = request;
      const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
      const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
      await checkFeatures(context, options, args);
      const awsContext = context;
      defaultUserAgent.push(`m/${encodeFeatures(Object.assign({}, context.__smithy_context?.features, awsContext.__aws_sdk_context?.features))}`);
      const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
      const appId = await options.userAgentAppId();
      if (appId) {
        defaultUserAgent.push(escapeUserAgent([`app`, `${appId}`]));
      }
      const prefix = getUserAgentPrefix();
      const sdkUserAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent, ...userAgent, ...customUserAgent]).join(SPACE);
      const normalUAValue = [
        ...defaultUserAgent.filter((section) => section.startsWith("aws-sdk-")),
        ...customUserAgent
      ].join(SPACE);
      if (options.runtime !== "browser") {
        if (normalUAValue) {
          headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
        }
        headers[USER_AGENT] = sdkUserAgentValue;
      } else {
        headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
      }
      return next({
        ...args,
        request
      });
    }, "userAgentMiddleware");
    escapeUserAgent = /* @__PURE__ */ __name2((userAgentPair) => {
      const name = userAgentPair[0].split(UA_NAME_SEPARATOR).map((part) => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR)).join(UA_NAME_SEPARATOR);
      const version = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);
      const prefixSeparatorIndex = name.indexOf(UA_NAME_SEPARATOR);
      const prefix = name.substring(0, prefixSeparatorIndex);
      let uaName = name.substring(prefixSeparatorIndex + 1);
      if (prefix === "api") {
        uaName = uaName.toLowerCase();
      }
      return [prefix, uaName, version].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
        switch (index) {
          case 0:
            return item;
          case 1:
            return `${acc}/${item}`;
          default:
            return `${acc}#${item}`;
        }
      }, "");
    }, "escapeUserAgent");
    getUserAgentMiddlewareOptions = {
      name: "getUserAgentMiddleware",
      step: "build",
      priority: "low",
      tags: ["SET_USER_AGENT", "USER_AGENT"],
      override: true
    };
    getUserAgentPlugin = /* @__PURE__ */ __name2((config) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
      }, "applyToStack")
    }), "getUserAgentPlugin");
  }
});
var init_dist_es35 = __esm({
  "../node_modules/@aws-sdk/middleware-user-agent/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_configurations();
    init_user_agent_middleware();
  }
});
var DEFAULT_USE_DUALSTACK_ENDPOINT;
var init_NodeUseDualstackEndpointConfigOptions = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/endpointsConfig/NodeUseDualstackEndpointConfigOptions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    DEFAULT_USE_DUALSTACK_ENDPOINT = false;
  }
});
var DEFAULT_USE_FIPS_ENDPOINT;
var init_NodeUseFipsEndpointConfigOptions = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/endpointsConfig/NodeUseFipsEndpointConfigOptions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    DEFAULT_USE_FIPS_ENDPOINT = false;
  }
});
var init_resolveCustomEndpointsConfig = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/endpointsConfig/resolveCustomEndpointsConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_resolveEndpointsConfig = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/endpointsConfig/resolveEndpointsConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_endpointsConfig = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/endpointsConfig/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_NodeUseDualstackEndpointConfigOptions();
    init_NodeUseFipsEndpointConfigOptions();
    init_resolveCustomEndpointsConfig();
    init_resolveEndpointsConfig();
  }
});
var init_config2 = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionConfig/config.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var validRegions;
var checkRegion;
var init_checkRegion = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionConfig/checkRegion.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es31();
    validRegions = /* @__PURE__ */ new Set();
    checkRegion = /* @__PURE__ */ __name2((region, check = isValidHostLabel) => {
      if (!validRegions.has(region) && !check(region)) {
        if (region === "*") {
          console.warn(`@smithy/config-resolver WARN - Please use the caller region instead of "*". See "sigv4a" in https://github.com/aws/aws-sdk-js-v3/blob/main/supplemental-docs/CLIENTS.md.`);
        } else {
          throw new Error(`Region not accepted: region="${region}" is not a valid hostname component.`);
        }
      } else {
        validRegions.add(region);
      }
    }, "checkRegion");
  }
});
var isFipsRegion;
var init_isFipsRegion = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionConfig/isFipsRegion.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    isFipsRegion = /* @__PURE__ */ __name2((region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips")), "isFipsRegion");
  }
});
var getRealRegion;
var init_getRealRegion = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionConfig/getRealRegion.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_isFipsRegion();
    getRealRegion = /* @__PURE__ */ __name2((region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region, "getRealRegion");
  }
});
var resolveRegionConfig;
var init_resolveRegionConfig = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionConfig/resolveRegionConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_checkRegion();
    init_getRealRegion();
    init_isFipsRegion();
    resolveRegionConfig = /* @__PURE__ */ __name2((input) => {
      const { region, useFipsEndpoint } = input;
      if (!region) {
        throw new Error("Region is missing");
      }
      return Object.assign(input, {
        region: /* @__PURE__ */ __name2(async () => {
          const providedRegion = typeof region === "function" ? await region() : region;
          const realRegion = getRealRegion(providedRegion);
          checkRegion(realRegion);
          return realRegion;
        }, "region"),
        useFipsEndpoint: /* @__PURE__ */ __name2(async () => {
          const providedRegion = typeof region === "string" ? region : await region();
          if (isFipsRegion(providedRegion)) {
            return true;
          }
          return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
        }, "useFipsEndpoint")
      });
    }, "resolveRegionConfig");
  }
});
var init_regionConfig = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionConfig/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_config2();
    init_resolveRegionConfig();
  }
});
var init_PartitionHash = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionInfo/PartitionHash.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_RegionHash = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionInfo/RegionHash.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_getRegionInfo = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionInfo/getRegionInfo.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_regionInfo = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/regionInfo/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_PartitionHash();
    init_RegionHash();
    init_getRegionInfo();
  }
});
var init_dist_es36 = __esm({
  "../node_modules/@smithy/config-resolver/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_endpointsConfig();
    init_regionConfig();
    init_regionInfo();
  }
});
var resolveEventStreamSerdeConfig;
var init_EventStreamSerdeConfig = __esm({
  "../node_modules/@smithy/eventstream-serde-config-resolver/dist-es/EventStreamSerdeConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    resolveEventStreamSerdeConfig = /* @__PURE__ */ __name2((input) => Object.assign(input, {
      eventStreamMarshaller: input.eventStreamSerdeProvider(input)
    }), "resolveEventStreamSerdeConfig");
  }
});
var init_dist_es37 = __esm({
  "../node_modules/@smithy/eventstream-serde-config-resolver/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EventStreamSerdeConfig();
  }
});
function contentLengthMiddleware(bodyLengthChecker) {
  return (next) => async (args) => {
    const request = args.request;
    if (HttpRequest.isInstance(request)) {
      const { body, headers } = request;
      if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf(CONTENT_LENGTH_HEADER2) === -1) {
        try {
          const length = bodyLengthChecker(body);
          request.headers = {
            ...request.headers,
            [CONTENT_LENGTH_HEADER2]: String(length)
          };
        } catch (error) {
        }
      }
    }
    return next({
      ...args,
      request
    });
  };
}
__name(contentLengthMiddleware, "contentLengthMiddleware");
var CONTENT_LENGTH_HEADER2;
var contentLengthMiddlewareOptions;
var getContentLengthPlugin;
var init_dist_es38 = __esm({
  "../node_modules/@smithy/middleware-content-length/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    CONTENT_LENGTH_HEADER2 = "content-length";
    __name2(contentLengthMiddleware, "contentLengthMiddleware");
    contentLengthMiddlewareOptions = {
      step: "build",
      tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
      name: "contentLengthMiddleware",
      override: true
    };
    getContentLengthPlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
      }, "applyToStack")
    }), "getContentLengthPlugin");
  }
});
var resolveParamsForS3;
var DOMAIN_PATTERN;
var IP_ADDRESS_PATTERN;
var DOTS_PATTERN;
var isDnsCompatibleBucketName;
var isArnBucketName;
var init_s3 = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/service-customizations/s3.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    resolveParamsForS3 = /* @__PURE__ */ __name2(async (endpointParams) => {
      const bucket = endpointParams?.Bucket || "";
      if (typeof endpointParams.Bucket === "string") {
        endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
      }
      if (isArnBucketName(bucket)) {
        if (endpointParams.ForcePathStyle === true) {
          throw new Error("Path-style addressing cannot be used with ARN buckets");
        }
      } else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) {
        endpointParams.ForcePathStyle = true;
      }
      if (endpointParams.DisableMultiRegionAccessPoints) {
        endpointParams.disableMultiRegionAccessPoints = true;
        endpointParams.DisableMRAP = true;
      }
      return endpointParams;
    }, "resolveParamsForS3");
    DOMAIN_PATTERN = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/;
    IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
    DOTS_PATTERN = /\.\./;
    isDnsCompatibleBucketName = /* @__PURE__ */ __name2((bucketName) => DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName), "isDnsCompatibleBucketName");
    isArnBucketName = /* @__PURE__ */ __name2((bucketName) => {
      const [arn, partition2, service, , , bucket] = bucketName.split(":");
      const isArn = arn === "arn" && bucketName.split(":").length >= 6;
      const isValidArn = Boolean(isArn && partition2 && service && bucket);
      if (isArn && !isValidArn) {
        throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
      }
      return isValidArn;
    }, "isArnBucketName");
  }
});
var init_service_customizations = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/service-customizations/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_s3();
  }
});
var createConfigValueProvider;
var init_createConfigValueProvider = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/adaptors/createConfigValueProvider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    createConfigValueProvider = /* @__PURE__ */ __name2((configKey, canonicalEndpointParamKey, config, isClientContextParam = false) => {
      const configProvider = /* @__PURE__ */ __name2(async () => {
        let configValue;
        if (isClientContextParam) {
          const clientContextParams = config.clientContextParams;
          const nestedValue = clientContextParams?.[configKey];
          configValue = nestedValue ?? config[configKey] ?? config[canonicalEndpointParamKey];
        } else {
          configValue = config[configKey] ?? config[canonicalEndpointParamKey];
        }
        if (typeof configValue === "function") {
          return configValue();
        }
        return configValue;
      }, "configProvider");
      if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") {
        return async () => {
          const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
          const configValue = credentials?.credentialScope ?? credentials?.CredentialScope;
          return configValue;
        };
      }
      if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") {
        return async () => {
          const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
          const configValue = credentials?.accountId ?? credentials?.AccountId;
          return configValue;
        };
      }
      if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") {
        return async () => {
          if (config.isCustomEndpoint === false) {
            return void 0;
          }
          const endpoint = await configProvider();
          if (endpoint && typeof endpoint === "object") {
            if ("url" in endpoint) {
              return endpoint.url.href;
            }
            if ("hostname" in endpoint) {
              const { protocol, hostname, port, path } = endpoint;
              return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
            }
          }
          return endpoint;
        };
      }
      return configProvider;
    }, "createConfigValueProvider");
  }
});
var getEndpointFromConfig;
var init_getEndpointFromConfig_browser = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/adaptors/getEndpointFromConfig.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getEndpointFromConfig = /* @__PURE__ */ __name2(async (serviceId) => void 0, "getEndpointFromConfig");
  }
});
var toEndpointV1;
var init_toEndpointV1 = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/adaptors/toEndpointV1.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es33();
    toEndpointV1 = /* @__PURE__ */ __name2((endpoint) => {
      if (typeof endpoint === "object") {
        if ("url" in endpoint) {
          return parseUrl(endpoint.url);
        }
        return endpoint;
      }
      return parseUrl(endpoint);
    }, "toEndpointV1");
  }
});
var getEndpointFromInstructions;
var resolveParams;
var init_getEndpointFromInstructions = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/adaptors/getEndpointFromInstructions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_service_customizations();
    init_createConfigValueProvider();
    init_getEndpointFromConfig_browser();
    init_toEndpointV1();
    getEndpointFromInstructions = /* @__PURE__ */ __name2(async (commandInput, instructionsSupplier, clientConfig, context) => {
      if (!clientConfig.isCustomEndpoint) {
        let endpointFromConfig;
        if (clientConfig.serviceConfiguredEndpoint) {
          endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
        } else {
          endpointFromConfig = await getEndpointFromConfig(clientConfig.serviceId);
        }
        if (endpointFromConfig) {
          clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
          clientConfig.isCustomEndpoint = true;
        }
      }
      const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
      if (typeof clientConfig.endpointProvider !== "function") {
        throw new Error("config.endpointProvider is not set.");
      }
      const endpoint = clientConfig.endpointProvider(endpointParams, context);
      return endpoint;
    }, "getEndpointFromInstructions");
    resolveParams = /* @__PURE__ */ __name2(async (commandInput, instructionsSupplier, clientConfig) => {
      const endpointParams = {};
      const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
      for (const [name, instruction] of Object.entries(instructions)) {
        switch (instruction.type) {
          case "staticContextParams":
            endpointParams[name] = instruction.value;
            break;
          case "contextParams":
            endpointParams[name] = commandInput[instruction.name];
            break;
          case "clientContextParams":
          case "builtInParams":
            endpointParams[name] = await createConfigValueProvider(instruction.name, name, clientConfig, instruction.type !== "builtInParams")();
            break;
          case "operationContextParams":
            endpointParams[name] = instruction.get(commandInput);
            break;
          default:
            throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
        }
      }
      if (Object.keys(instructions).length === 0) {
        Object.assign(endpointParams, clientConfig);
      }
      if (String(clientConfig.serviceId).toLowerCase() === "s3") {
        await resolveParamsForS3(endpointParams);
      }
      return endpointParams;
    }, "resolveParams");
  }
});
var init_adaptors = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/adaptors/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_getEndpointFromInstructions();
    init_toEndpointV1();
  }
});
var endpointMiddleware;
var init_endpointMiddleware = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/endpointMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    init_dist_es4();
    init_getEndpointFromInstructions();
    endpointMiddleware = /* @__PURE__ */ __name2(({ config, instructions }) => {
      return (next, context) => async (args) => {
        if (config.isCustomEndpoint) {
          setFeature2(context, "ENDPOINT_OVERRIDE", "N");
        }
        const endpoint = await getEndpointFromInstructions(args.input, {
          getEndpointParameterInstructions() {
            return instructions;
          }
        }, { ...config }, context);
        context.endpointV2 = endpoint;
        context.authSchemes = endpoint.properties?.authSchemes;
        const authScheme = context.authSchemes?.[0];
        if (authScheme) {
          context["signing_region"] = authScheme.signingRegion;
          context["signing_service"] = authScheme.signingName;
          const smithyContext = getSmithyContext(context);
          const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
          if (httpAuthOption) {
            httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
              signing_region: authScheme.signingRegion,
              signingRegion: authScheme.signingRegion,
              signing_service: authScheme.signingName,
              signingName: authScheme.signingName,
              signingRegionSet: authScheme.signingRegionSet
            }, authScheme.properties);
          }
        }
        return next({
          ...args
        });
      };
    }, "endpointMiddleware");
  }
});
var endpointMiddlewareOptions;
var getEndpointPlugin;
var init_getEndpointPlugin = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/getEndpointPlugin.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es5();
    init_endpointMiddleware();
    endpointMiddlewareOptions = {
      step: "serialize",
      tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
      name: "endpointV2Middleware",
      override: true,
      relation: "before",
      toMiddleware: serializerMiddlewareOption.name
    };
    getEndpointPlugin = /* @__PURE__ */ __name2((config, instructions) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.addRelativeTo(endpointMiddleware({
          config,
          instructions
        }), endpointMiddlewareOptions);
      }, "applyToStack")
    }), "getEndpointPlugin");
  }
});
var resolveEndpointConfig;
var init_resolveEndpointConfig = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/resolveEndpointConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es4();
    init_getEndpointFromConfig_browser();
    init_toEndpointV1();
    resolveEndpointConfig = /* @__PURE__ */ __name2((input) => {
      const tls = input.tls ?? true;
      const { endpoint, useDualstackEndpoint, useFipsEndpoint } = input;
      const customEndpointProvider = endpoint != null ? async () => toEndpointV1(await normalizeProvider(endpoint)()) : void 0;
      const isCustomEndpoint = !!endpoint;
      const resolvedConfig = Object.assign(input, {
        endpoint: customEndpointProvider,
        tls,
        isCustomEndpoint,
        useDualstackEndpoint: normalizeProvider(useDualstackEndpoint ?? false),
        useFipsEndpoint: normalizeProvider(useFipsEndpoint ?? false)
      });
      let configuredEndpointPromise = void 0;
      resolvedConfig.serviceConfiguredEndpoint = async () => {
        if (input.serviceId && !configuredEndpointPromise) {
          configuredEndpointPromise = getEndpointFromConfig(input.serviceId);
        }
        return configuredEndpointPromise;
      };
      return resolvedConfig;
    }, "resolveEndpointConfig");
  }
});
var init_resolveEndpointRequiredConfig = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/resolveEndpointRequiredConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_types5 = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es39 = __esm({
  "../node_modules/@smithy/middleware-endpoint/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_adaptors();
    init_endpointMiddleware();
    init_getEndpointPlugin();
    init_resolveEndpointConfig();
    init_resolveEndpointRequiredConfig();
    init_types5();
  }
});
var RETRY_MODES;
var DEFAULT_MAX_ATTEMPTS;
var DEFAULT_RETRY_MODE;
var init_config3 = __esm({
  "../node_modules/@smithy/util-retry/dist-es/config.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    (function(RETRY_MODES2) {
      RETRY_MODES2["STANDARD"] = "standard";
      RETRY_MODES2["ADAPTIVE"] = "adaptive";
    })(RETRY_MODES || (RETRY_MODES = {}));
    DEFAULT_MAX_ATTEMPTS = 3;
    DEFAULT_RETRY_MODE = RETRY_MODES.STANDARD;
  }
});
var THROTTLING_ERROR_CODES;
var TRANSIENT_ERROR_CODES;
var TRANSIENT_ERROR_STATUS_CODES;
var NODEJS_TIMEOUT_ERROR_CODES;
var NODEJS_NETWORK_ERROR_CODES;
var init_constants7 = __esm({
  "../node_modules/@smithy/service-error-classification/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    THROTTLING_ERROR_CODES = [
      "BandwidthLimitExceeded",
      "EC2ThrottledException",
      "LimitExceededException",
      "PriorRequestNotComplete",
      "ProvisionedThroughputExceededException",
      "RequestLimitExceeded",
      "RequestThrottled",
      "RequestThrottledException",
      "SlowDown",
      "ThrottledException",
      "Throttling",
      "ThrottlingException",
      "TooManyRequestsException",
      "TransactionInProgressException"
    ];
    TRANSIENT_ERROR_CODES = ["TimeoutError", "RequestTimeout", "RequestTimeoutException"];
    TRANSIENT_ERROR_STATUS_CODES = [500, 502, 503, 504];
    NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT"];
    NODEJS_NETWORK_ERROR_CODES = ["EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND"];
  }
});
var isRetryableByTrait;
var isClockSkewCorrectedError;
var isBrowserNetworkError;
var isThrottlingError;
var isTransientError;
var isServerError;
var init_dist_es40 = __esm({
  "../node_modules/@smithy/service-error-classification/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants7();
    isRetryableByTrait = /* @__PURE__ */ __name2((error) => error?.$retryable !== void 0, "isRetryableByTrait");
    isClockSkewCorrectedError = /* @__PURE__ */ __name2((error) => error.$metadata?.clockSkewCorrected, "isClockSkewCorrectedError");
    isBrowserNetworkError = /* @__PURE__ */ __name2((error) => {
      const errorMessages = /* @__PURE__ */ new Set([
        "Failed to fetch",
        "NetworkError when attempting to fetch resource",
        "The Internet connection appears to be offline",
        "Load failed",
        "Network request failed"
      ]);
      const isValid = error && error instanceof TypeError;
      if (!isValid) {
        return false;
      }
      return errorMessages.has(error.message);
    }, "isBrowserNetworkError");
    isThrottlingError = /* @__PURE__ */ __name2((error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true, "isThrottlingError");
    isTransientError = /* @__PURE__ */ __name2((error, depth = 0) => isRetryableByTrait(error) || isClockSkewCorrectedError(error) || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes(error?.code || "") || NODEJS_NETWORK_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0) || isBrowserNetworkError(error) || error.cause !== void 0 && depth <= 10 && isTransientError(error.cause, depth + 1), "isTransientError");
    isServerError = /* @__PURE__ */ __name2((error) => {
      if (error.$metadata?.httpStatusCode !== void 0) {
        const statusCode = error.$metadata.httpStatusCode;
        if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) {
          return true;
        }
        return false;
      }
      return false;
    }, "isServerError");
  }
});
var DefaultRateLimiter;
var init_DefaultRateLimiter = __esm({
  "../node_modules/@smithy/util-retry/dist-es/DefaultRateLimiter.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es40();
    DefaultRateLimiter = class _DefaultRateLimiter {
      static {
        __name(this, "_DefaultRateLimiter");
      }
      static {
        __name2(this, "DefaultRateLimiter");
      }
      static setTimeoutFn = setTimeout;
      beta;
      minCapacity;
      minFillRate;
      scaleConstant;
      smooth;
      currentCapacity = 0;
      enabled = false;
      lastMaxRate = 0;
      measuredTxRate = 0;
      requestCount = 0;
      fillRate;
      lastThrottleTime;
      lastTimestamp = 0;
      lastTxRateBucket;
      maxCapacity;
      timeWindow = 0;
      constructor(options) {
        this.beta = options?.beta ?? 0.7;
        this.minCapacity = options?.minCapacity ?? 1;
        this.minFillRate = options?.minFillRate ?? 0.5;
        this.scaleConstant = options?.scaleConstant ?? 0.4;
        this.smooth = options?.smooth ?? 0.8;
        const currentTimeInSeconds = this.getCurrentTimeInSeconds();
        this.lastThrottleTime = currentTimeInSeconds;
        this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
        this.fillRate = this.minFillRate;
        this.maxCapacity = this.minCapacity;
      }
      getCurrentTimeInSeconds() {
        return Date.now() / 1e3;
      }
      async getSendToken() {
        return this.acquireTokenBucket(1);
      }
      async acquireTokenBucket(amount) {
        if (!this.enabled) {
          return;
        }
        this.refillTokenBucket();
        if (amount > this.currentCapacity) {
          const delay = (amount - this.currentCapacity) / this.fillRate * 1e3;
          await new Promise((resolve) => _DefaultRateLimiter.setTimeoutFn(resolve, delay));
        }
        this.currentCapacity = this.currentCapacity - amount;
      }
      refillTokenBucket() {
        const timestamp = this.getCurrentTimeInSeconds();
        if (!this.lastTimestamp) {
          this.lastTimestamp = timestamp;
          return;
        }
        const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
        this.currentCapacity = Math.min(this.maxCapacity, this.currentCapacity + fillAmount);
        this.lastTimestamp = timestamp;
      }
      updateClientSendingRate(response) {
        let calculatedRate;
        this.updateMeasuredRate();
        if (isThrottlingError(response)) {
          const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
          this.lastMaxRate = rateToUse;
          this.calculateTimeWindow();
          this.lastThrottleTime = this.getCurrentTimeInSeconds();
          calculatedRate = this.cubicThrottle(rateToUse);
          this.enableTokenBucket();
        } else {
          this.calculateTimeWindow();
          calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
        }
        const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
        this.updateTokenBucketRate(newRate);
      }
      calculateTimeWindow() {
        this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
      }
      cubicThrottle(rateToUse) {
        return this.getPrecise(rateToUse * this.beta);
      }
      cubicSuccess(timestamp) {
        return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
      }
      enableTokenBucket() {
        this.enabled = true;
      }
      updateTokenBucketRate(newRate) {
        this.refillTokenBucket();
        this.fillRate = Math.max(newRate, this.minFillRate);
        this.maxCapacity = Math.max(newRate, this.minCapacity);
        this.currentCapacity = Math.min(this.currentCapacity, this.maxCapacity);
      }
      updateMeasuredRate() {
        const t8 = this.getCurrentTimeInSeconds();
        const timeBucket = Math.floor(t8 * 2) / 2;
        this.requestCount++;
        if (timeBucket > this.lastTxRateBucket) {
          const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
          this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
          this.requestCount = 0;
          this.lastTxRateBucket = timeBucket;
        }
      }
      getPrecise(num) {
        return parseFloat(num.toFixed(8));
      }
    };
  }
});
var DEFAULT_RETRY_DELAY_BASE;
var MAXIMUM_RETRY_DELAY;
var THROTTLING_RETRY_DELAY_BASE;
var INITIAL_RETRY_TOKENS;
var RETRY_COST;
var TIMEOUT_RETRY_COST;
var NO_RETRY_INCREMENT;
var INVOCATION_ID_HEADER;
var REQUEST_HEADER;
var init_constants8 = __esm({
  "../node_modules/@smithy/util-retry/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    DEFAULT_RETRY_DELAY_BASE = 100;
    MAXIMUM_RETRY_DELAY = 20 * 1e3;
    THROTTLING_RETRY_DELAY_BASE = 500;
    INITIAL_RETRY_TOKENS = 500;
    RETRY_COST = 5;
    TIMEOUT_RETRY_COST = 10;
    NO_RETRY_INCREMENT = 1;
    INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
    REQUEST_HEADER = "amz-sdk-request";
  }
});
var getDefaultRetryBackoffStrategy;
var init_defaultRetryBackoffStrategy = __esm({
  "../node_modules/@smithy/util-retry/dist-es/defaultRetryBackoffStrategy.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants8();
    getDefaultRetryBackoffStrategy = /* @__PURE__ */ __name2(() => {
      let delayBase = DEFAULT_RETRY_DELAY_BASE;
      const computeNextBackoffDelay = /* @__PURE__ */ __name2((attempts) => {
        return Math.floor(Math.min(MAXIMUM_RETRY_DELAY, Math.random() * 2 ** attempts * delayBase));
      }, "computeNextBackoffDelay");
      const setDelayBase = /* @__PURE__ */ __name2((delay) => {
        delayBase = delay;
      }, "setDelayBase");
      return {
        computeNextBackoffDelay,
        setDelayBase
      };
    }, "getDefaultRetryBackoffStrategy");
  }
});
var createDefaultRetryToken;
var init_defaultRetryToken = __esm({
  "../node_modules/@smithy/util-retry/dist-es/defaultRetryToken.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants8();
    createDefaultRetryToken = /* @__PURE__ */ __name2(({ retryDelay, retryCount, retryCost }) => {
      const getRetryCount = /* @__PURE__ */ __name2(() => retryCount, "getRetryCount");
      const getRetryDelay = /* @__PURE__ */ __name2(() => Math.min(MAXIMUM_RETRY_DELAY, retryDelay), "getRetryDelay");
      const getRetryCost = /* @__PURE__ */ __name2(() => retryCost, "getRetryCost");
      return {
        getRetryCount,
        getRetryDelay,
        getRetryCost
      };
    }, "createDefaultRetryToken");
  }
});
var StandardRetryStrategy;
var init_StandardRetryStrategy = __esm({
  "../node_modules/@smithy/util-retry/dist-es/StandardRetryStrategy.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_config3();
    init_constants8();
    init_defaultRetryBackoffStrategy();
    init_defaultRetryToken();
    StandardRetryStrategy = class {
      static {
        __name(this, "StandardRetryStrategy");
      }
      static {
        __name2(this, "StandardRetryStrategy");
      }
      maxAttempts;
      mode = RETRY_MODES.STANDARD;
      capacity = INITIAL_RETRY_TOKENS;
      retryBackoffStrategy = getDefaultRetryBackoffStrategy();
      maxAttemptsProvider;
      constructor(maxAttempts) {
        this.maxAttempts = maxAttempts;
        this.maxAttemptsProvider = typeof maxAttempts === "function" ? maxAttempts : async () => maxAttempts;
      }
      async acquireInitialRetryToken(retryTokenScope) {
        return createDefaultRetryToken({
          retryDelay: DEFAULT_RETRY_DELAY_BASE,
          retryCount: 0
        });
      }
      async refreshRetryTokenForRetry(token, errorInfo) {
        const maxAttempts = await this.getMaxAttempts();
        if (this.shouldRetry(token, errorInfo, maxAttempts)) {
          const errorType = errorInfo.errorType;
          this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? THROTTLING_RETRY_DELAY_BASE : DEFAULT_RETRY_DELAY_BASE);
          const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
          const retryDelay = errorInfo.retryAfterHint ? Math.max(errorInfo.retryAfterHint.getTime() - Date.now() || 0, delayFromErrorType) : delayFromErrorType;
          const capacityCost = this.getCapacityCost(errorType);
          this.capacity -= capacityCost;
          return createDefaultRetryToken({
            retryDelay,
            retryCount: token.getRetryCount() + 1,
            retryCost: capacityCost
          });
        }
        throw new Error("No retry token available");
      }
      recordSuccess(token) {
        this.capacity = Math.max(INITIAL_RETRY_TOKENS, this.capacity + (token.getRetryCost() ?? NO_RETRY_INCREMENT));
      }
      getCapacity() {
        return this.capacity;
      }
      async getMaxAttempts() {
        try {
          return await this.maxAttemptsProvider();
        } catch (error) {
          console.warn(`Max attempts provider could not resolve. Using default of ${DEFAULT_MAX_ATTEMPTS}`);
          return DEFAULT_MAX_ATTEMPTS;
        }
      }
      shouldRetry(tokenToRenew, errorInfo, maxAttempts) {
        const attempts = tokenToRenew.getRetryCount() + 1;
        return attempts < maxAttempts && this.capacity >= this.getCapacityCost(errorInfo.errorType) && this.isRetryableError(errorInfo.errorType);
      }
      getCapacityCost(errorType) {
        return errorType === "TRANSIENT" ? TIMEOUT_RETRY_COST : RETRY_COST;
      }
      isRetryableError(errorType) {
        return errorType === "THROTTLING" || errorType === "TRANSIENT";
      }
    };
  }
});
var AdaptiveRetryStrategy;
var init_AdaptiveRetryStrategy = __esm({
  "../node_modules/@smithy/util-retry/dist-es/AdaptiveRetryStrategy.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_config3();
    init_DefaultRateLimiter();
    init_StandardRetryStrategy();
    AdaptiveRetryStrategy = class {
      static {
        __name(this, "AdaptiveRetryStrategy");
      }
      static {
        __name2(this, "AdaptiveRetryStrategy");
      }
      maxAttemptsProvider;
      rateLimiter;
      standardRetryStrategy;
      mode = RETRY_MODES.ADAPTIVE;
      constructor(maxAttemptsProvider, options) {
        this.maxAttemptsProvider = maxAttemptsProvider;
        const { rateLimiter } = options ?? {};
        this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
        this.standardRetryStrategy = new StandardRetryStrategy(maxAttemptsProvider);
      }
      async acquireInitialRetryToken(retryTokenScope) {
        await this.rateLimiter.getSendToken();
        return this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
      }
      async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
        this.rateLimiter.updateClientSendingRate(errorInfo);
        return this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
      }
      recordSuccess(token) {
        this.rateLimiter.updateClientSendingRate({});
        this.standardRetryStrategy.recordSuccess(token);
      }
    };
  }
});
var init_ConfiguredRetryStrategy = __esm({
  "../node_modules/@smithy/util-retry/dist-es/ConfiguredRetryStrategy.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_types6 = __esm({
  "../node_modules/@smithy/util-retry/dist-es/types.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es41 = __esm({
  "../node_modules/@smithy/util-retry/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_AdaptiveRetryStrategy();
    init_ConfiguredRetryStrategy();
    init_DefaultRateLimiter();
    init_StandardRetryStrategy();
    init_config3();
    init_constants8();
    init_types6();
  }
});
var init_delayDecider = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/delayDecider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_retryDecider = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/retryDecider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var asSdkError;
var init_util2 = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/util.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    asSdkError = /* @__PURE__ */ __name2((error) => {
      if (error instanceof Error)
        return error;
      if (error instanceof Object)
        return Object.assign(new Error(), error);
      if (typeof error === "string")
        return new Error(error);
      return new Error(`AWS SDK error wrapper for ${error}`);
    }, "asSdkError");
  }
});
var init_StandardRetryStrategy2 = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/StandardRetryStrategy.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_AdaptiveRetryStrategy2 = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/AdaptiveRetryStrategy.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var resolveRetryConfig;
var init_configurations2 = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/configurations.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es4();
    init_dist_es41();
    resolveRetryConfig = /* @__PURE__ */ __name2((input) => {
      const { retryStrategy, retryMode: _retryMode, maxAttempts: _maxAttempts } = input;
      const maxAttempts = normalizeProvider(_maxAttempts ?? DEFAULT_MAX_ATTEMPTS);
      return Object.assign(input, {
        maxAttempts,
        retryStrategy: /* @__PURE__ */ __name2(async () => {
          if (retryStrategy) {
            return retryStrategy;
          }
          const retryMode = await normalizeProvider(_retryMode)();
          if (retryMode === RETRY_MODES.ADAPTIVE) {
            return new AdaptiveRetryStrategy(maxAttempts);
          }
          return new StandardRetryStrategy(maxAttempts);
        }, "retryStrategy")
      });
    }, "resolveRetryConfig");
  }
});
var init_omitRetryHeadersMiddleware = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/omitRetryHeadersMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var isStreamingPayload;
var init_isStreamingPayload_browser = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/isStreamingPayload/isStreamingPayload.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    isStreamingPayload = /* @__PURE__ */ __name2((request) => request?.body instanceof ReadableStream, "isStreamingPayload");
  }
});
var retryMiddleware;
var isRetryStrategyV2;
var getRetryErrorInfo;
var getRetryErrorType;
var retryMiddlewareOptions;
var getRetryPlugin;
var getRetryAfterHint;
var init_retryMiddleware = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/retryMiddleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es2();
    init_dist_es40();
    init_dist_es20();
    init_dist_es41();
    init_dist_es13();
    init_isStreamingPayload_browser();
    init_util2();
    retryMiddleware = /* @__PURE__ */ __name2((options) => (next, context) => async (args) => {
      let retryStrategy = await options.retryStrategy();
      const maxAttempts = await options.maxAttempts();
      if (isRetryStrategyV2(retryStrategy)) {
        retryStrategy = retryStrategy;
        let retryToken = await retryStrategy.acquireInitialRetryToken(context["partition_id"]);
        let lastError = new Error();
        let attempts = 0;
        let totalRetryDelay = 0;
        const { request } = args;
        const isRequest = HttpRequest.isInstance(request);
        if (isRequest) {
          request.headers[INVOCATION_ID_HEADER] = v4();
        }
        while (true) {
          try {
            if (isRequest) {
              request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
            }
            const { response, output } = await next(args);
            retryStrategy.recordSuccess(retryToken);
            output.$metadata.attempts = attempts + 1;
            output.$metadata.totalRetryDelay = totalRetryDelay;
            return { response, output };
          } catch (e2) {
            const retryErrorInfo = getRetryErrorInfo(e2);
            lastError = asSdkError(e2);
            if (isRequest && isStreamingPayload(request)) {
              (context.logger instanceof NoOpLogger ? console : context.logger)?.warn("An error was encountered in a non-retryable streaming request.");
              throw lastError;
            }
            try {
              retryToken = await retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
            } catch (refreshError) {
              if (!lastError.$metadata) {
                lastError.$metadata = {};
              }
              lastError.$metadata.attempts = attempts + 1;
              lastError.$metadata.totalRetryDelay = totalRetryDelay;
              throw lastError;
            }
            attempts = retryToken.getRetryCount();
            const delay = retryToken.getRetryDelay();
            totalRetryDelay += delay;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      } else {
        retryStrategy = retryStrategy;
        if (retryStrategy?.mode)
          context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
        return retryStrategy.retry(next, args);
      }
    }, "retryMiddleware");
    isRetryStrategyV2 = /* @__PURE__ */ __name2((retryStrategy) => typeof retryStrategy.acquireInitialRetryToken !== "undefined" && typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" && typeof retryStrategy.recordSuccess !== "undefined", "isRetryStrategyV2");
    getRetryErrorInfo = /* @__PURE__ */ __name2((error) => {
      const errorInfo = {
        error,
        errorType: getRetryErrorType(error)
      };
      const retryAfterHint = getRetryAfterHint(error.$response);
      if (retryAfterHint) {
        errorInfo.retryAfterHint = retryAfterHint;
      }
      return errorInfo;
    }, "getRetryErrorInfo");
    getRetryErrorType = /* @__PURE__ */ __name2((error) => {
      if (isThrottlingError(error))
        return "THROTTLING";
      if (isTransientError(error))
        return "TRANSIENT";
      if (isServerError(error))
        return "SERVER_ERROR";
      return "CLIENT_ERROR";
    }, "getRetryErrorType");
    retryMiddlewareOptions = {
      name: "retryMiddleware",
      tags: ["RETRY"],
      step: "finalizeRequest",
      priority: "high",
      override: true
    };
    getRetryPlugin = /* @__PURE__ */ __name2((options) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(retryMiddleware(options), retryMiddlewareOptions);
      }, "applyToStack")
    }), "getRetryPlugin");
    getRetryAfterHint = /* @__PURE__ */ __name2((response) => {
      if (!HttpResponse.isInstance(response))
        return;
      const retryAfterHeaderName = Object.keys(response.headers).find((key) => key.toLowerCase() === "retry-after");
      if (!retryAfterHeaderName)
        return;
      const retryAfter = response.headers[retryAfterHeaderName];
      const retryAfterSeconds = Number(retryAfter);
      if (!Number.isNaN(retryAfterSeconds))
        return new Date(retryAfterSeconds * 1e3);
      const retryAfterDate = new Date(retryAfter);
      return retryAfterDate;
    }, "getRetryAfterHint");
  }
});
var init_dist_es42 = __esm({
  "../node_modules/@smithy/middleware-retry/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_AdaptiveRetryStrategy2();
    init_StandardRetryStrategy2();
    init_configurations2();
    init_delayDecider();
    init_omitRetryHeadersMiddleware();
    init_retryDecider();
    init_retryMiddleware();
  }
});
var init_check_content_length_header2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/check-content-length-header.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_region_redirect_endpoint_middleware2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-endpoint-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_region_redirect_middleware2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_s3_expires_middleware2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-expires-middleware.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var SESSION_TOKEN_QUERY_PARAM2;
var SESSION_TOKEN_HEADER2;
var init_constants9 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SESSION_TOKEN_QUERY_PARAM2 = "X-Amz-S3session-Token";
    SESSION_TOKEN_HEADER2 = SESSION_TOKEN_QUERY_PARAM2.toLowerCase();
  }
});
function getCredentialsWithoutSessionToken(credentials) {
  const credentialsWithoutSessionToken = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    expiration: credentials.expiration
  };
  return credentialsWithoutSessionToken;
}
__name(getCredentialsWithoutSessionToken, "getCredentialsWithoutSessionToken");
function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
  const id = setTimeout(() => {
    throw new Error("SignatureV4S3Express credential override was created but not called.");
  }, 10);
  const currentCredentialProvider = privateAccess.credentialProvider;
  const overrideCredentialsProviderOnce = /* @__PURE__ */ __name2(() => {
    clearTimeout(id);
    privateAccess.credentialProvider = currentCredentialProvider;
    return Promise.resolve(credentialsWithoutSessionToken);
  }, "overrideCredentialsProviderOnce");
  privateAccess.credentialProvider = overrideCredentialsProviderOnce;
}
__name(setSingleOverride, "setSingleOverride");
var SignatureV4S3Express;
var init_SignatureV4S3Express = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/SignatureV4S3Express.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es17();
    init_constants9();
    SignatureV4S3Express = class extends SignatureV4 {
      static {
        __name(this, "SignatureV4S3Express");
      }
      static {
        __name2(this, "SignatureV4S3Express");
      }
      async signWithCredentials(requestToSign, credentials, options) {
        const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
        requestToSign.headers[SESSION_TOKEN_HEADER2] = credentials.sessionToken;
        const privateAccess = this;
        setSingleOverride(privateAccess, credentialsWithoutSessionToken);
        return privateAccess.signRequest(requestToSign, options ?? {});
      }
      async presignWithCredentials(requestToSign, credentials, options) {
        const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
        delete requestToSign.headers[SESSION_TOKEN_HEADER2];
        requestToSign.headers[SESSION_TOKEN_QUERY_PARAM2] = credentials.sessionToken;
        requestToSign.query = requestToSign.query ?? {};
        requestToSign.query[SESSION_TOKEN_QUERY_PARAM2] = credentials.sessionToken;
        const privateAccess = this;
        setSingleOverride(privateAccess, credentialsWithoutSessionToken);
        return this.presign(requestToSign, options);
      }
    };
    __name2(getCredentialsWithoutSessionToken, "getCredentialsWithoutSessionToken");
    __name2(setSingleOverride, "setSingleOverride");
  }
});
var init_s3_express2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_SignatureV4S3Express();
  }
});
var init_s3Configuration2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3Configuration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_throw_200_exceptions2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/throw-200-exceptions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_validate_bucket_name2 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/validate-bucket-name.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es43 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/node_modules/@aws-sdk/middleware-sdk-s3/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_check_content_length_header2();
    init_region_redirect_endpoint_middleware2();
    init_region_redirect_middleware2();
    init_s3_expires_middleware2();
    init_s3_express2();
    init_s3Configuration2();
    init_throw_200_exceptions2();
    init_validate_bucket_name2();
  }
});
var signatureV4CrtContainer;
var init_signature_v4_crt_container = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/dist-es/signature-v4-crt-container.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    signatureV4CrtContainer = {
      CrtSignerV4: null
    };
  }
});
var SignatureV4MultiRegion;
var init_SignatureV4MultiRegion = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4MultiRegion.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es43();
    init_dist_es17();
    init_signature_v4_crt_container();
    SignatureV4MultiRegion = class {
      static {
        __name(this, "SignatureV4MultiRegion");
      }
      static {
        __name2(this, "SignatureV4MultiRegion");
      }
      sigv4aSigner;
      sigv4Signer;
      signerOptions;
      static sigv4aDependency() {
        if (typeof signatureV4CrtContainer.CrtSignerV4 === "function") {
          return "crt";
        } else if (typeof signatureV4aContainer.SignatureV4a === "function") {
          return "js";
        }
        return "none";
      }
      constructor(options) {
        this.sigv4Signer = new SignatureV4S3Express(options);
        this.signerOptions = options;
      }
      async sign(requestToSign, options = {}) {
        if (options.signingRegion === "*") {
          return this.getSigv4aSigner().sign(requestToSign, options);
        }
        return this.sigv4Signer.sign(requestToSign, options);
      }
      async signWithCredentials(requestToSign, credentials, options = {}) {
        if (options.signingRegion === "*") {
          const signer = this.getSigv4aSigner();
          const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
          if (CrtSignerV4 && signer instanceof CrtSignerV4) {
            return signer.signWithCredentials(requestToSign, credentials, options);
          } else {
            throw new Error(`signWithCredentials with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the "@aws-sdk/signature-v4-crt" package explicitly. You must also register the package by calling [require("@aws-sdk/signature-v4-crt");] or an ESM equivalent such as [import "@aws-sdk/signature-v4-crt";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt`);
          }
        }
        return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
      }
      async presign(originalRequest, options = {}) {
        if (options.signingRegion === "*") {
          const signer = this.getSigv4aSigner();
          const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
          if (CrtSignerV4 && signer instanceof CrtSignerV4) {
            return signer.presign(originalRequest, options);
          } else {
            throw new Error(`presign with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the "@aws-sdk/signature-v4-crt" package explicitly. You must also register the package by calling [require("@aws-sdk/signature-v4-crt");] or an ESM equivalent such as [import "@aws-sdk/signature-v4-crt";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt`);
          }
        }
        return this.sigv4Signer.presign(originalRequest, options);
      }
      async presignWithCredentials(originalRequest, credentials, options = {}) {
        if (options.signingRegion === "*") {
          throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
        }
        return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
      }
      getSigv4aSigner() {
        if (!this.sigv4aSigner) {
          const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
          const JsSigV4aSigner = signatureV4aContainer.SignatureV4a;
          if (this.signerOptions.runtime === "node") {
            if (!CrtSignerV4 && !JsSigV4aSigner) {
              throw new Error("Neither CRT nor JS SigV4a implementation is available. Please load either @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
            }
            if (CrtSignerV4 && typeof CrtSignerV4 === "function") {
              this.sigv4aSigner = new CrtSignerV4({
                ...this.signerOptions,
                signingAlgorithm: 1
              });
            } else if (JsSigV4aSigner && typeof JsSigV4aSigner === "function") {
              this.sigv4aSigner = new JsSigV4aSigner({
                ...this.signerOptions
              });
            } else {
              throw new Error("Available SigV4a implementation is not a valid constructor. Please ensure you've properly imported @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a.For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
            }
          } else {
            if (!JsSigV4aSigner || typeof JsSigV4aSigner !== "function") {
              throw new Error("JS SigV4a implementation is not available or not a valid constructor. Please check whether you have installed the @aws-sdk/signature-v4a package explicitly. The CRT implementation is not available for browsers. You must also register the package by calling [require('@aws-sdk/signature-v4a');] or an ESM equivalent such as [import '@aws-sdk/signature-v4a';]. For more information please go to https://github.com/aws/aws-sdk-js-v3#using-javascript-non-crt-implementation-of-sigv4a");
            }
            this.sigv4aSigner = new JsSigV4aSigner({
              ...this.signerOptions
            });
          }
        }
        return this.sigv4aSigner;
      }
    };
  }
});
var init_dist_es44 = __esm({
  "../node_modules/@aws-sdk/signature-v4-multi-region/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_SignatureV4MultiRegion();
    init_signature_v4_crt_container();
  }
});
var cs;
var ct;
var cu;
var cv;
var cw;
var cx;
var cy;
var cz;
var cA;
var cB;
var cC;
var cD;
var cE;
var cF;
var cG;
var cH;
var cI;
var a;
var b;
var c;
var d;
var e;
var f;
var g;
var h;
var i;
var j;
var k;
var l;
var m;
var n;
var o;
var p;
var q;
var r;
var s;
var t;
var u;
var v;
var w;
var x;
var y;
var z;
var A;
var B;
var C;
var D;
var E;
var F;
var G;
var H;
var I;
var J;
var K;
var L;
var M;
var N;
var O;
var P;
var Q;
var R;
var S;
var T;
var U;
var V;
var W;
var X;
var Y;
var Z;
var aa;
var ab;
var ac;
var ad;
var ae;
var af;
var ag;
var ah;
var ai;
var aj;
var ak;
var al;
var am;
var an;
var ao;
var ap;
var aq;
var ar;
var as;
var at;
var au;
var av;
var aw;
var ax;
var ay;
var az;
var aA;
var aB;
var aC;
var aD;
var aE;
var aF;
var aG;
var aH;
var aI;
var aJ;
var aK;
var aL;
var aM;
var aN;
var aO;
var aP;
var aQ;
var aR;
var aS;
var aT;
var aU;
var aV;
var aW;
var aX;
var aY;
var aZ;
var ba;
var bb;
var bc;
var bd;
var be;
var bf;
var bg;
var bh;
var bi;
var bj;
var bk;
var bl;
var bm;
var bn;
var bo;
var bp;
var bq;
var br;
var bs;
var bt;
var bu;
var bv;
var bw;
var bx;
var by;
var bz;
var bA;
var bB;
var bC;
var bD;
var bE;
var bF;
var bG;
var bH;
var bI;
var bJ;
var bK;
var bL;
var bM;
var bN;
var bO;
var bP;
var bQ;
var bR;
var bS;
var bT;
var bU;
var bV;
var bW;
var bX;
var bY;
var bZ;
var ca;
var cb;
var cc;
var cd;
var ce;
var cf;
var cg;
var ch;
var ci;
var cj;
var ck;
var cl;
var cm;
var cn;
var co;
var cp;
var cq;
var cr;
var _data;
var ruleSet;
var init_ruleset = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/endpoint/ruleset.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    cs = "required";
    ct = "type";
    cu = "rules";
    cv = "conditions";
    cw = "fn";
    cx = "argv";
    cy = "ref";
    cz = "assign";
    cA = "url";
    cB = "properties";
    cC = "backend";
    cD = "authSchemes";
    cE = "disableDoubleEncoding";
    cF = "signingName";
    cG = "signingRegion";
    cH = "headers";
    cI = "signingRegionSet";
    a = 6;
    b = false;
    c = true;
    d = "isSet";
    e = "booleanEquals";
    f = "error";
    g = "aws.partition";
    h = "stringEquals";
    i = "getAttr";
    j = "name";
    k = "substring";
    l = "bucketSuffix";
    m = "parseURL";
    n = "endpoint";
    o = "tree";
    p = "aws.isVirtualHostableS3Bucket";
    q = "{url#scheme}://{Bucket}.{url#authority}{url#path}";
    r = "not";
    s = "accessPointSuffix";
    t = "{url#scheme}://{url#authority}{url#path}";
    u = "hardwareType";
    v = "regionPrefix";
    w = "bucketAliasSuffix";
    x = "outpostId";
    y = "isValidHostLabel";
    z = "sigv4a";
    A = "s3-outposts";
    B = "s3";
    C = "{url#scheme}://{url#authority}{url#normalizedPath}{Bucket}";
    D = "https://{Bucket}.s3-accelerate.{partitionResult#dnsSuffix}";
    E = "https://{Bucket}.s3.{partitionResult#dnsSuffix}";
    F = "aws.parseArn";
    G = "bucketArn";
    H = "arnType";
    I = "";
    J = "s3-object-lambda";
    K = "accesspoint";
    L = "accessPointName";
    M = "{url#scheme}://{accessPointName}-{bucketArn#accountId}.{url#authority}{url#path}";
    N = "mrapPartition";
    O = "outpostType";
    P = "arnPrefix";
    Q = "{url#scheme}://{url#authority}{url#normalizedPath}{uri_encoded_bucket}";
    R = "https://s3.{partitionResult#dnsSuffix}/{uri_encoded_bucket}";
    S = "https://s3.{partitionResult#dnsSuffix}";
    T = { [cs]: false, [ct]: "string" };
    U = { [cs]: true, "default": false, [ct]: "boolean" };
    V = { [cs]: false, [ct]: "boolean" };
    W = { [cw]: e, [cx]: [{ [cy]: "Accelerate" }, true] };
    X = { [cw]: e, [cx]: [{ [cy]: "UseFIPS" }, true] };
    Y = { [cw]: e, [cx]: [{ [cy]: "UseDualStack" }, true] };
    Z = { [cw]: d, [cx]: [{ [cy]: "Endpoint" }] };
    aa = { [cw]: g, [cx]: [{ [cy]: "Region" }], [cz]: "partitionResult" };
    ab = { [cw]: h, [cx]: [{ [cw]: i, [cx]: [{ [cy]: "partitionResult" }, j] }, "aws-cn"] };
    ac = { [cw]: d, [cx]: [{ [cy]: "Bucket" }] };
    ad = { [cy]: "Bucket" };
    ae = { [cv]: [W], [f]: "S3Express does not support S3 Accelerate.", [ct]: f };
    af = { [cv]: [Z, { [cw]: m, [cx]: [{ [cy]: "Endpoint" }], [cz]: "url" }], [cu]: [{ [cv]: [{ [cw]: d, [cx]: [{ [cy]: "DisableS3ExpressSessionAuth" }] }, { [cw]: e, [cx]: [{ [cy]: "DisableS3ExpressSessionAuth" }, true] }], [cu]: [{ [cv]: [{ [cw]: e, [cx]: [{ [cw]: i, [cx]: [{ [cy]: "url" }, "isIp"] }, true] }], [cu]: [{ [cv]: [{ [cw]: "uriEncode", [cx]: [ad], [cz]: "uri_encoded_bucket" }], [cu]: [{ [n]: { [cA]: "{url#scheme}://{url#authority}/{uri_encoded_bucket}{url#path}", [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }], [ct]: o }], [ct]: o }, { [cv]: [{ [cw]: p, [cx]: [ad, false] }], [cu]: [{ [n]: { [cA]: q, [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }], [ct]: o }, { [f]: "S3Express bucket name is not a valid virtual hostable name.", [ct]: f }], [ct]: o }, { [cv]: [{ [cw]: e, [cx]: [{ [cw]: i, [cx]: [{ [cy]: "url" }, "isIp"] }, true] }], [cu]: [{ [cv]: [{ [cw]: "uriEncode", [cx]: [ad], [cz]: "uri_encoded_bucket" }], [cu]: [{ [n]: { [cA]: "{url#scheme}://{url#authority}/{uri_encoded_bucket}{url#path}", [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4-s3express", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }], [ct]: o }], [ct]: o }, { [cv]: [{ [cw]: p, [cx]: [ad, false] }], [cu]: [{ [n]: { [cA]: q, [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4-s3express", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }], [ct]: o }, { [f]: "S3Express bucket name is not a valid virtual hostable name.", [ct]: f }], [ct]: o };
    ag = { [cw]: m, [cx]: [{ [cy]: "Endpoint" }], [cz]: "url" };
    ah = { [cw]: e, [cx]: [{ [cw]: i, [cx]: [{ [cy]: "url" }, "isIp"] }, true] };
    ai = { [cy]: "url" };
    aj = { [cw]: "uriEncode", [cx]: [ad], [cz]: "uri_encoded_bucket" };
    ak = { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: "s3express", [cG]: "{Region}" }] };
    al = {};
    am = { [cw]: p, [cx]: [ad, false] };
    an = { [f]: "S3Express bucket name is not a valid virtual hostable name.", [ct]: f };
    ao = { [cw]: d, [cx]: [{ [cy]: "UseS3ExpressControlEndpoint" }] };
    ap = { [cw]: e, [cx]: [{ [cy]: "UseS3ExpressControlEndpoint" }, true] };
    aq = { [cw]: r, [cx]: [Z] };
    ar = { [cw]: e, [cx]: [{ [cy]: "UseDualStack" }, false] };
    as = { [cw]: e, [cx]: [{ [cy]: "UseFIPS" }, false] };
    at = { [f]: "Unrecognized S3Express bucket name format.", [ct]: f };
    au = { [cw]: r, [cx]: [ac] };
    av = { [cy]: u };
    aw = { [cv]: [aq], [f]: "Expected a endpoint to be specified but no endpoint was found", [ct]: f };
    ax = { [cD]: [{ [cE]: true, [j]: z, [cF]: A, [cI]: ["*"] }, { [cE]: true, [j]: "sigv4", [cF]: A, [cG]: "{Region}" }] };
    ay = { [cw]: e, [cx]: [{ [cy]: "ForcePathStyle" }, false] };
    az = { [cy]: "ForcePathStyle" };
    aA = { [cw]: e, [cx]: [{ [cy]: "Accelerate" }, false] };
    aB = { [cw]: h, [cx]: [{ [cy]: "Region" }, "aws-global"] };
    aC = { [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: B, [cG]: "us-east-1" }] };
    aD = { [cw]: r, [cx]: [aB] };
    aE = { [cw]: e, [cx]: [{ [cy]: "UseGlobalEndpoint" }, true] };
    aF = { [cA]: "https://{Bucket}.s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: { [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: B, [cG]: "{Region}" }] }, [cH]: {} };
    aG = { [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: B, [cG]: "{Region}" }] };
    aH = { [cw]: e, [cx]: [{ [cy]: "UseGlobalEndpoint" }, false] };
    aI = { [cA]: "https://{Bucket}.s3-fips.{Region}.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    aJ = { [cA]: "https://{Bucket}.s3-accelerate.dualstack.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    aK = { [cA]: "https://{Bucket}.s3.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    aL = { [cw]: e, [cx]: [{ [cw]: i, [cx]: [ai, "isIp"] }, false] };
    aM = { [cA]: C, [cB]: aG, [cH]: {} };
    aN = { [cA]: q, [cB]: aG, [cH]: {} };
    aO = { [n]: aN, [ct]: n };
    aP = { [cA]: D, [cB]: aG, [cH]: {} };
    aQ = { [cA]: "https://{Bucket}.s3.{Region}.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    aR = { [f]: "Invalid region: region was not a valid DNS name.", [ct]: f };
    aS = { [cy]: G };
    aT = { [cy]: H };
    aU = { [cw]: i, [cx]: [aS, "service"] };
    aV = { [cy]: L };
    aW = { [cv]: [Y], [f]: "S3 Object Lambda does not support Dual-stack", [ct]: f };
    aX = { [cv]: [W], [f]: "S3 Object Lambda does not support S3 Accelerate", [ct]: f };
    aY = { [cv]: [{ [cw]: d, [cx]: [{ [cy]: "DisableAccessPoints" }] }, { [cw]: e, [cx]: [{ [cy]: "DisableAccessPoints" }, true] }], [f]: "Access points are not supported for this operation", [ct]: f };
    aZ = { [cv]: [{ [cw]: d, [cx]: [{ [cy]: "UseArnRegion" }] }, { [cw]: e, [cx]: [{ [cy]: "UseArnRegion" }, false] }, { [cw]: r, [cx]: [{ [cw]: h, [cx]: [{ [cw]: i, [cx]: [aS, "region"] }, "{Region}"] }] }], [f]: "Invalid configuration: region from ARN `{bucketArn#region}` does not match client region `{Region}` and UseArnRegion is `false`", [ct]: f };
    ba = { [cw]: i, [cx]: [{ [cy]: "bucketPartition" }, j] };
    bb = { [cw]: i, [cx]: [aS, "accountId"] };
    bc = { [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: J, [cG]: "{bucketArn#region}" }] };
    bd = { [f]: "Invalid ARN: The access point name may only contain a-z, A-Z, 0-9 and `-`. Found: `{accessPointName}`", [ct]: f };
    be = { [f]: "Invalid ARN: The account id may only contain a-z, A-Z, 0-9 and `-`. Found: `{bucketArn#accountId}`", [ct]: f };
    bf = { [f]: "Invalid region in ARN: `{bucketArn#region}` (invalid DNS name)", [ct]: f };
    bg = { [f]: "Client was configured for partition `{partitionResult#name}` but ARN (`{Bucket}`) has `{bucketPartition#name}`", [ct]: f };
    bh = { [f]: "Invalid ARN: The ARN may only contain a single resource component after `accesspoint`.", [ct]: f };
    bi = { [f]: "Invalid ARN: Expected a resource of the format `accesspoint:<accesspoint name>` but no name was provided", [ct]: f };
    bj = { [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: B, [cG]: "{bucketArn#region}" }] };
    bk = { [cD]: [{ [cE]: true, [j]: z, [cF]: A, [cI]: ["*"] }, { [cE]: true, [j]: "sigv4", [cF]: A, [cG]: "{bucketArn#region}" }] };
    bl = { [cw]: F, [cx]: [ad] };
    bm = { [cA]: "https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: aG, [cH]: {} };
    bn = { [cA]: "https://s3-fips.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: aG, [cH]: {} };
    bo = { [cA]: "https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: aG, [cH]: {} };
    bp = { [cA]: Q, [cB]: aG, [cH]: {} };
    bq = { [cA]: "https://s3.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: aG, [cH]: {} };
    br = { [cy]: "UseObjectLambdaEndpoint" };
    bs = { [cD]: [{ [cE]: true, [j]: "sigv4", [cF]: J, [cG]: "{Region}" }] };
    bt = { [cA]: "https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    bu = { [cA]: "https://s3-fips.{Region}.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    bv = { [cA]: "https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    bw = { [cA]: t, [cB]: aG, [cH]: {} };
    bx = { [cA]: "https://s3.{Region}.{partitionResult#dnsSuffix}", [cB]: aG, [cH]: {} };
    by = [{ [cy]: "Region" }];
    bz = [{ [cy]: "Endpoint" }];
    bA = [ad];
    bB = [W];
    bC = [Z, ag];
    bD = [{ [cw]: d, [cx]: [{ [cy]: "DisableS3ExpressSessionAuth" }] }, { [cw]: e, [cx]: [{ [cy]: "DisableS3ExpressSessionAuth" }, true] }];
    bE = [aj];
    bF = [am];
    bG = [aa];
    bH = [X, Y];
    bI = [X, ar];
    bJ = [as, Y];
    bK = [as, ar];
    bL = [{ [cw]: k, [cx]: [ad, 6, 14, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 14, 16, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bM = [{ [cv]: [X, Y], [n]: { [cA]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: {} }, [ct]: n }, { [cv]: bI, [n]: { [cA]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: {} }, [ct]: n }, { [cv]: bJ, [n]: { [cA]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: {} }, [ct]: n }, { [cv]: bK, [n]: { [cA]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: {} }, [ct]: n }];
    bN = [{ [cw]: k, [cx]: [ad, 6, 15, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 15, 17, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bO = [{ [cw]: k, [cx]: [ad, 6, 19, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 19, 21, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bP = [{ [cw]: k, [cx]: [ad, 6, 20, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 20, 22, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bQ = [{ [cw]: k, [cx]: [ad, 6, 26, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 26, 28, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bR = [{ [cv]: [X, Y], [n]: { [cA]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4-s3express", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }, { [cv]: bI, [n]: { [cA]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.{Region}.{partitionResult#dnsSuffix}", [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4-s3express", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }, { [cv]: bJ, [n]: { [cA]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4-s3express", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }, { [cv]: bK, [n]: { [cA]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.{Region}.{partitionResult#dnsSuffix}", [cB]: { [cC]: "S3Express", [cD]: [{ [cE]: true, [j]: "sigv4-s3express", [cF]: "s3express", [cG]: "{Region}" }] }, [cH]: {} }, [ct]: n }];
    bS = [ad, 0, 7, true];
    bT = [{ [cw]: k, [cx]: [ad, 7, 15, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 15, 17, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bU = [{ [cw]: k, [cx]: [ad, 7, 16, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 16, 18, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bV = [{ [cw]: k, [cx]: [ad, 7, 20, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 20, 22, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bW = [{ [cw]: k, [cx]: [ad, 7, 21, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 21, 23, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bX = [{ [cw]: k, [cx]: [ad, 7, 27, true], [cz]: "s3expressAvailabilityZoneId" }, { [cw]: k, [cx]: [ad, 27, 29, true], [cz]: "s3expressAvailabilityZoneDelim" }, { [cw]: h, [cx]: [{ [cy]: "s3expressAvailabilityZoneDelim" }, "--"] }];
    bY = [ac];
    bZ = [{ [cw]: y, [cx]: [{ [cy]: x }, false] }];
    ca = [{ [cw]: h, [cx]: [{ [cy]: v }, "beta"] }];
    cb = ["*"];
    cc = [{ [cw]: y, [cx]: [{ [cy]: "Region" }, false] }];
    cd = [{ [cw]: h, [cx]: [{ [cy]: "Region" }, "us-east-1"] }];
    ce = [{ [cw]: h, [cx]: [aT, K] }];
    cf = [{ [cw]: i, [cx]: [aS, "resourceId[1]"], [cz]: L }, { [cw]: r, [cx]: [{ [cw]: h, [cx]: [aV, I] }] }];
    cg = [aS, "resourceId[1]"];
    ch = [Y];
    ci = [{ [cw]: r, [cx]: [{ [cw]: h, [cx]: [{ [cw]: i, [cx]: [aS, "region"] }, I] }] }];
    cj = [{ [cw]: r, [cx]: [{ [cw]: d, [cx]: [{ [cw]: i, [cx]: [aS, "resourceId[2]"] }] }] }];
    ck = [aS, "resourceId[2]"];
    cl = [{ [cw]: g, [cx]: [{ [cw]: i, [cx]: [aS, "region"] }], [cz]: "bucketPartition" }];
    cm = [{ [cw]: h, [cx]: [ba, { [cw]: i, [cx]: [{ [cy]: "partitionResult" }, j] }] }];
    cn = [{ [cw]: y, [cx]: [{ [cw]: i, [cx]: [aS, "region"] }, true] }];
    co = [{ [cw]: y, [cx]: [bb, false] }];
    cp = [{ [cw]: y, [cx]: [aV, false] }];
    cq = [X];
    cr = [{ [cw]: y, [cx]: [{ [cy]: "Region" }, true] }];
    _data = { version: "1.0", parameters: { Bucket: T, Region: T, UseFIPS: U, UseDualStack: U, Endpoint: T, ForcePathStyle: U, Accelerate: U, UseGlobalEndpoint: U, UseObjectLambdaEndpoint: V, Key: T, Prefix: T, CopySource: T, DisableAccessPoints: V, DisableMultiRegionAccessPoints: U, UseArnRegion: V, UseS3ExpressControlEndpoint: V, DisableS3ExpressSessionAuth: V }, [cu]: [{ [cv]: [{ [cw]: d, [cx]: by }], [cu]: [{ [cv]: [W, X], error: "Accelerate cannot be used with FIPS", [ct]: f }, { [cv]: [Y, Z], error: "Cannot set dual-stack in combination with a custom endpoint.", [ct]: f }, { [cv]: [Z, X], error: "A custom endpoint cannot be combined with FIPS", [ct]: f }, { [cv]: [Z, W], error: "A custom endpoint cannot be combined with S3 Accelerate", [ct]: f }, { [cv]: [X, aa, ab], error: "Partition does not support FIPS", [ct]: f }, { [cv]: [ac, { [cw]: k, [cx]: [ad, 0, a, c], [cz]: l }, { [cw]: h, [cx]: [{ [cy]: l }, "--x-s3"] }], [cu]: [ae, af, { [cv]: [ao, ap], [cu]: [{ [cv]: bG, [cu]: [{ [cv]: [aj, aq], [cu]: [{ [cv]: bH, endpoint: { [cA]: "https://s3express-control-fips.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: ak, [cH]: al }, [ct]: n }, { [cv]: bI, endpoint: { [cA]: "https://s3express-control-fips.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: ak, [cH]: al }, [ct]: n }, { [cv]: bJ, endpoint: { [cA]: "https://s3express-control.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: ak, [cH]: al }, [ct]: n }, { [cv]: bK, endpoint: { [cA]: "https://s3express-control.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: ak, [cH]: al }, [ct]: n }], [ct]: o }], [ct]: o }], [ct]: o }, { [cv]: bF, [cu]: [{ [cv]: bG, [cu]: [{ [cv]: bD, [cu]: [{ [cv]: bL, [cu]: bM, [ct]: o }, { [cv]: bN, [cu]: bM, [ct]: o }, { [cv]: bO, [cu]: bM, [ct]: o }, { [cv]: bP, [cu]: bM, [ct]: o }, { [cv]: bQ, [cu]: bM, [ct]: o }, at], [ct]: o }, { [cv]: bL, [cu]: bR, [ct]: o }, { [cv]: bN, [cu]: bR, [ct]: o }, { [cv]: bO, [cu]: bR, [ct]: o }, { [cv]: bP, [cu]: bR, [ct]: o }, { [cv]: bQ, [cu]: bR, [ct]: o }, at], [ct]: o }], [ct]: o }, an], [ct]: o }, { [cv]: [ac, { [cw]: k, [cx]: bS, [cz]: s }, { [cw]: h, [cx]: [{ [cy]: s }, "--xa-s3"] }], [cu]: [ae, af, { [cv]: bF, [cu]: [{ [cv]: bG, [cu]: [{ [cv]: bD, [cu]: [{ [cv]: bT, [cu]: bM, [ct]: o }, { [cv]: bU, [cu]: bM, [ct]: o }, { [cv]: bV, [cu]: bM, [ct]: o }, { [cv]: bW, [cu]: bM, [ct]: o }, { [cv]: bX, [cu]: bM, [ct]: o }, at], [ct]: o }, { [cv]: bT, [cu]: bR, [ct]: o }, { [cv]: bU, [cu]: bR, [ct]: o }, { [cv]: bV, [cu]: bR, [ct]: o }, { [cv]: bW, [cu]: bR, [ct]: o }, { [cv]: bX, [cu]: bR, [ct]: o }, at], [ct]: o }], [ct]: o }, an], [ct]: o }, { [cv]: [au, ao, ap], [cu]: [{ [cv]: bG, [cu]: [{ [cv]: bC, endpoint: { [cA]: t, [cB]: ak, [cH]: al }, [ct]: n }, { [cv]: bH, endpoint: { [cA]: "https://s3express-control-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: al }, [ct]: n }, { [cv]: bI, endpoint: { [cA]: "https://s3express-control-fips.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: al }, [ct]: n }, { [cv]: bJ, endpoint: { [cA]: "https://s3express-control.dualstack.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: al }, [ct]: n }, { [cv]: bK, endpoint: { [cA]: "https://s3express-control.{Region}.{partitionResult#dnsSuffix}", [cB]: ak, [cH]: al }, [ct]: n }], [ct]: o }], [ct]: o }, { [cv]: [ac, { [cw]: k, [cx]: [ad, 49, 50, c], [cz]: u }, { [cw]: k, [cx]: [ad, 8, 12, c], [cz]: v }, { [cw]: k, [cx]: bS, [cz]: w }, { [cw]: k, [cx]: [ad, 32, 49, c], [cz]: x }, { [cw]: g, [cx]: by, [cz]: "regionPartition" }, { [cw]: h, [cx]: [{ [cy]: w }, "--op-s3"] }], [cu]: [{ [cv]: bZ, [cu]: [{ [cv]: bF, [cu]: [{ [cv]: [{ [cw]: h, [cx]: [av, "e"] }], [cu]: [{ [cv]: ca, [cu]: [aw, { [cv]: bC, endpoint: { [cA]: "https://{Bucket}.ec2.{url#authority}", [cB]: ax, [cH]: al }, [ct]: n }], [ct]: o }, { endpoint: { [cA]: "https://{Bucket}.ec2.s3-outposts.{Region}.{regionPartition#dnsSuffix}", [cB]: ax, [cH]: al }, [ct]: n }], [ct]: o }, { [cv]: [{ [cw]: h, [cx]: [av, "o"] }], [cu]: [{ [cv]: ca, [cu]: [aw, { [cv]: bC, endpoint: { [cA]: "https://{Bucket}.op-{outpostId}.{url#authority}", [cB]: ax, [cH]: al }, [ct]: n }], [ct]: o }, { endpoint: { [cA]: "https://{Bucket}.op-{outpostId}.s3-outposts.{Region}.{regionPartition#dnsSuffix}", [cB]: ax, [cH]: al }, [ct]: n }], [ct]: o }, { error: 'Unrecognized hardware type: "Expected hardware type o or e but got {hardwareType}"', [ct]: f }], [ct]: o }, { error: "Invalid Outposts Bucket alias - it must be a valid bucket name.", [ct]: f }], [ct]: o }, { error: "Invalid ARN: The outpost Id must only contain a-z, A-Z, 0-9 and `-`.", [ct]: f }], [ct]: o }, { [cv]: bY, [cu]: [{ [cv]: [Z, { [cw]: r, [cx]: [{ [cw]: d, [cx]: [{ [cw]: m, [cx]: bz }] }] }], error: "Custom endpoint `{Endpoint}` was not a valid URI", [ct]: f }, { [cv]: [ay, am], [cu]: [{ [cv]: bG, [cu]: [{ [cv]: cc, [cu]: [{ [cv]: [W, ab], error: "S3 Accelerate cannot be used in this region", [ct]: f }, { [cv]: [Y, X, aA, aq, aB], endpoint: { [cA]: "https://{Bucket}.s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [Y, X, aA, aq, aD, aE], [cu]: [{ endpoint: aF, [ct]: n }], [ct]: o }, { [cv]: [Y, X, aA, aq, aD, aH], endpoint: aF, [ct]: n }, { [cv]: [ar, X, aA, aq, aB], endpoint: { [cA]: "https://{Bucket}.s3-fips.us-east-1.{partitionResult#dnsSuffix}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, X, aA, aq, aD, aE], [cu]: [{ endpoint: aI, [ct]: n }], [ct]: o }, { [cv]: [ar, X, aA, aq, aD, aH], endpoint: aI, [ct]: n }, { [cv]: [Y, as, W, aq, aB], endpoint: { [cA]: "https://{Bucket}.s3-accelerate.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [Y, as, W, aq, aD, aE], [cu]: [{ endpoint: aJ, [ct]: n }], [ct]: o }, { [cv]: [Y, as, W, aq, aD, aH], endpoint: aJ, [ct]: n }, { [cv]: [Y, as, aA, aq, aB], endpoint: { [cA]: "https://{Bucket}.s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [Y, as, aA, aq, aD, aE], [cu]: [{ endpoint: aK, [ct]: n }], [ct]: o }, { [cv]: [Y, as, aA, aq, aD, aH], endpoint: aK, [ct]: n }, { [cv]: [ar, as, aA, Z, ag, ah, aB], endpoint: { [cA]: C, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, as, aA, Z, ag, aL, aB], endpoint: { [cA]: q, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, as, aA, Z, ag, ah, aD, aE], [cu]: [{ [cv]: cd, endpoint: aM, [ct]: n }, { endpoint: aM, [ct]: n }], [ct]: o }, { [cv]: [ar, as, aA, Z, ag, aL, aD, aE], [cu]: [{ [cv]: cd, endpoint: aN, [ct]: n }, aO], [ct]: o }, { [cv]: [ar, as, aA, Z, ag, ah, aD, aH], endpoint: aM, [ct]: n }, { [cv]: [ar, as, aA, Z, ag, aL, aD, aH], endpoint: aN, [ct]: n }, { [cv]: [ar, as, W, aq, aB], endpoint: { [cA]: D, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, as, W, aq, aD, aE], [cu]: [{ [cv]: cd, endpoint: aP, [ct]: n }, { endpoint: aP, [ct]: n }], [ct]: o }, { [cv]: [ar, as, W, aq, aD, aH], endpoint: aP, [ct]: n }, { [cv]: [ar, as, aA, aq, aB], endpoint: { [cA]: E, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, as, aA, aq, aD, aE], [cu]: [{ [cv]: cd, endpoint: { [cA]: E, [cB]: aG, [cH]: al }, [ct]: n }, { endpoint: aQ, [ct]: n }], [ct]: o }, { [cv]: [ar, as, aA, aq, aD, aH], endpoint: aQ, [ct]: n }], [ct]: o }, aR], [ct]: o }], [ct]: o }, { [cv]: [Z, ag, { [cw]: h, [cx]: [{ [cw]: i, [cx]: [ai, "scheme"] }, "http"] }, { [cw]: p, [cx]: [ad, c] }, ay, as, ar, aA], [cu]: [{ [cv]: bG, [cu]: [{ [cv]: cc, [cu]: [aO], [ct]: o }, aR], [ct]: o }], [ct]: o }, { [cv]: [ay, { [cw]: F, [cx]: bA, [cz]: G }], [cu]: [{ [cv]: [{ [cw]: i, [cx]: [aS, "resourceId[0]"], [cz]: H }, { [cw]: r, [cx]: [{ [cw]: h, [cx]: [aT, I] }] }], [cu]: [{ [cv]: [{ [cw]: h, [cx]: [aU, J] }], [cu]: [{ [cv]: ce, [cu]: [{ [cv]: cf, [cu]: [aW, aX, { [cv]: ci, [cu]: [aY, { [cv]: cj, [cu]: [aZ, { [cv]: cl, [cu]: [{ [cv]: bG, [cu]: [{ [cv]: cm, [cu]: [{ [cv]: cn, [cu]: [{ [cv]: [{ [cw]: h, [cx]: [bb, I] }], error: "Invalid ARN: Missing account id", [ct]: f }, { [cv]: co, [cu]: [{ [cv]: cp, [cu]: [{ [cv]: bC, endpoint: { [cA]: M, [cB]: bc, [cH]: al }, [ct]: n }, { [cv]: cq, endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.s3-object-lambda-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cB]: bc, [cH]: al }, [ct]: n }, { endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.s3-object-lambda.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cB]: bc, [cH]: al }, [ct]: n }], [ct]: o }, bd], [ct]: o }, be], [ct]: o }, bf], [ct]: o }, bg], [ct]: o }], [ct]: o }], [ct]: o }, bh], [ct]: o }, { error: "Invalid ARN: bucket ARN is missing a region", [ct]: f }], [ct]: o }, bi], [ct]: o }, { error: "Invalid ARN: Object Lambda ARNs only support `accesspoint` arn types, but found: `{arnType}`", [ct]: f }], [ct]: o }, { [cv]: ce, [cu]: [{ [cv]: cf, [cu]: [{ [cv]: ci, [cu]: [{ [cv]: ce, [cu]: [{ [cv]: ci, [cu]: [aY, { [cv]: cj, [cu]: [aZ, { [cv]: cl, [cu]: [{ [cv]: bG, [cu]: [{ [cv]: [{ [cw]: h, [cx]: [ba, "{partitionResult#name}"] }], [cu]: [{ [cv]: cn, [cu]: [{ [cv]: [{ [cw]: h, [cx]: [aU, B] }], [cu]: [{ [cv]: co, [cu]: [{ [cv]: cp, [cu]: [{ [cv]: bB, error: "Access Points do not support S3 Accelerate", [ct]: f }, { [cv]: bH, endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint-fips.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cB]: bj, [cH]: al }, [ct]: n }, { [cv]: bI, endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cB]: bj, [cH]: al }, [ct]: n }, { [cv]: bJ, endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cB]: bj, [cH]: al }, [ct]: n }, { [cv]: [as, ar, Z, ag], endpoint: { [cA]: M, [cB]: bj, [cH]: al }, [ct]: n }, { [cv]: bK, endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cB]: bj, [cH]: al }, [ct]: n }], [ct]: o }, bd], [ct]: o }, be], [ct]: o }, { error: "Invalid ARN: The ARN was not for the S3 service, found: {bucketArn#service}", [ct]: f }], [ct]: o }, bf], [ct]: o }, bg], [ct]: o }], [ct]: o }], [ct]: o }, bh], [ct]: o }], [ct]: o }], [ct]: o }, { [cv]: [{ [cw]: y, [cx]: [aV, c] }], [cu]: [{ [cv]: ch, error: "S3 MRAP does not support dual-stack", [ct]: f }, { [cv]: cq, error: "S3 MRAP does not support FIPS", [ct]: f }, { [cv]: bB, error: "S3 MRAP does not support S3 Accelerate", [ct]: f }, { [cv]: [{ [cw]: e, [cx]: [{ [cy]: "DisableMultiRegionAccessPoints" }, c] }], error: "Invalid configuration: Multi-Region Access Point ARNs are disabled.", [ct]: f }, { [cv]: [{ [cw]: g, [cx]: by, [cz]: N }], [cu]: [{ [cv]: [{ [cw]: h, [cx]: [{ [cw]: i, [cx]: [{ [cy]: N }, j] }, { [cw]: i, [cx]: [aS, "partition"] }] }], [cu]: [{ endpoint: { [cA]: "https://{accessPointName}.accesspoint.s3-global.{mrapPartition#dnsSuffix}", [cB]: { [cD]: [{ [cE]: c, name: z, [cF]: B, [cI]: cb }] }, [cH]: al }, [ct]: n }], [ct]: o }, { error: "Client was configured for partition `{mrapPartition#name}` but bucket referred to partition `{bucketArn#partition}`", [ct]: f }], [ct]: o }], [ct]: o }, { error: "Invalid Access Point Name", [ct]: f }], [ct]: o }, bi], [ct]: o }, { [cv]: [{ [cw]: h, [cx]: [aU, A] }], [cu]: [{ [cv]: ch, error: "S3 Outposts does not support Dual-stack", [ct]: f }, { [cv]: cq, error: "S3 Outposts does not support FIPS", [ct]: f }, { [cv]: bB, error: "S3 Outposts does not support S3 Accelerate", [ct]: f }, { [cv]: [{ [cw]: d, [cx]: [{ [cw]: i, [cx]: [aS, "resourceId[4]"] }] }], error: "Invalid Arn: Outpost Access Point ARN contains sub resources", [ct]: f }, { [cv]: [{ [cw]: i, [cx]: cg, [cz]: x }], [cu]: [{ [cv]: bZ, [cu]: [aZ, { [cv]: cl, [cu]: [{ [cv]: bG, [cu]: [{ [cv]: cm, [cu]: [{ [cv]: cn, [cu]: [{ [cv]: co, [cu]: [{ [cv]: [{ [cw]: i, [cx]: ck, [cz]: O }], [cu]: [{ [cv]: [{ [cw]: i, [cx]: [aS, "resourceId[3]"], [cz]: L }], [cu]: [{ [cv]: [{ [cw]: h, [cx]: [{ [cy]: O }, K] }], [cu]: [{ [cv]: bC, endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.{outpostId}.{url#authority}", [cB]: bk, [cH]: al }, [ct]: n }, { endpoint: { [cA]: "https://{accessPointName}-{bucketArn#accountId}.{outpostId}.s3-outposts.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cB]: bk, [cH]: al }, [ct]: n }], [ct]: o }, { error: "Expected an outpost type `accesspoint`, found {outpostType}", [ct]: f }], [ct]: o }, { error: "Invalid ARN: expected an access point name", [ct]: f }], [ct]: o }, { error: "Invalid ARN: Expected a 4-component resource", [ct]: f }], [ct]: o }, be], [ct]: o }, bf], [ct]: o }, bg], [ct]: o }], [ct]: o }], [ct]: o }, { error: "Invalid ARN: The outpost Id may only contain a-z, A-Z, 0-9 and `-`. Found: `{outpostId}`", [ct]: f }], [ct]: o }, { error: "Invalid ARN: The Outpost Id was not set", [ct]: f }], [ct]: o }, { error: "Invalid ARN: Unrecognized format: {Bucket} (type: {arnType})", [ct]: f }], [ct]: o }, { error: "Invalid ARN: No ARN type specified", [ct]: f }], [ct]: o }, { [cv]: [{ [cw]: k, [cx]: [ad, 0, 4, b], [cz]: P }, { [cw]: h, [cx]: [{ [cy]: P }, "arn:"] }, { [cw]: r, [cx]: [{ [cw]: d, [cx]: [bl] }] }], error: "Invalid ARN: `{Bucket}` was not a valid ARN", [ct]: f }, { [cv]: [{ [cw]: e, [cx]: [az, c] }, bl], error: "Path-style addressing cannot be used with ARN buckets", [ct]: f }, { [cv]: bE, [cu]: [{ [cv]: bG, [cu]: [{ [cv]: [aA], [cu]: [{ [cv]: [Y, aq, X, aB], endpoint: { [cA]: "https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [Y, aq, X, aD, aE], [cu]: [{ endpoint: bm, [ct]: n }], [ct]: o }, { [cv]: [Y, aq, X, aD, aH], endpoint: bm, [ct]: n }, { [cv]: [ar, aq, X, aB], endpoint: { [cA]: "https://s3-fips.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, aq, X, aD, aE], [cu]: [{ endpoint: bn, [ct]: n }], [ct]: o }, { [cv]: [ar, aq, X, aD, aH], endpoint: bn, [ct]: n }, { [cv]: [Y, aq, as, aB], endpoint: { [cA]: "https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [Y, aq, as, aD, aE], [cu]: [{ endpoint: bo, [ct]: n }], [ct]: o }, { [cv]: [Y, aq, as, aD, aH], endpoint: bo, [ct]: n }, { [cv]: [ar, Z, ag, as, aB], endpoint: { [cA]: Q, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, Z, ag, as, aD, aE], [cu]: [{ [cv]: cd, endpoint: bp, [ct]: n }, { endpoint: bp, [ct]: n }], [ct]: o }, { [cv]: [ar, Z, ag, as, aD, aH], endpoint: bp, [ct]: n }, { [cv]: [ar, aq, as, aB], endpoint: { [cA]: R, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [ar, aq, as, aD, aE], [cu]: [{ [cv]: cd, endpoint: { [cA]: R, [cB]: aG, [cH]: al }, [ct]: n }, { endpoint: bq, [ct]: n }], [ct]: o }, { [cv]: [ar, aq, as, aD, aH], endpoint: bq, [ct]: n }], [ct]: o }, { error: "Path-style addressing cannot be used with S3 Accelerate", [ct]: f }], [ct]: o }], [ct]: o }], [ct]: o }, { [cv]: [{ [cw]: d, [cx]: [br] }, { [cw]: e, [cx]: [br, c] }], [cu]: [{ [cv]: bG, [cu]: [{ [cv]: cr, [cu]: [aW, aX, { [cv]: bC, endpoint: { [cA]: t, [cB]: bs, [cH]: al }, [ct]: n }, { [cv]: cq, endpoint: { [cA]: "https://s3-object-lambda-fips.{Region}.{partitionResult#dnsSuffix}", [cB]: bs, [cH]: al }, [ct]: n }, { endpoint: { [cA]: "https://s3-object-lambda.{Region}.{partitionResult#dnsSuffix}", [cB]: bs, [cH]: al }, [ct]: n }], [ct]: o }, aR], [ct]: o }], [ct]: o }, { [cv]: [au], [cu]: [{ [cv]: bG, [cu]: [{ [cv]: cr, [cu]: [{ [cv]: [X, Y, aq, aB], endpoint: { [cA]: "https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [X, Y, aq, aD, aE], [cu]: [{ endpoint: bt, [ct]: n }], [ct]: o }, { [cv]: [X, Y, aq, aD, aH], endpoint: bt, [ct]: n }, { [cv]: [X, ar, aq, aB], endpoint: { [cA]: "https://s3-fips.us-east-1.{partitionResult#dnsSuffix}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [X, ar, aq, aD, aE], [cu]: [{ endpoint: bu, [ct]: n }], [ct]: o }, { [cv]: [X, ar, aq, aD, aH], endpoint: bu, [ct]: n }, { [cv]: [as, Y, aq, aB], endpoint: { [cA]: "https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [as, Y, aq, aD, aE], [cu]: [{ endpoint: bv, [ct]: n }], [ct]: o }, { [cv]: [as, Y, aq, aD, aH], endpoint: bv, [ct]: n }, { [cv]: [as, ar, Z, ag, aB], endpoint: { [cA]: t, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [as, ar, Z, ag, aD, aE], [cu]: [{ [cv]: cd, endpoint: bw, [ct]: n }, { endpoint: bw, [ct]: n }], [ct]: o }, { [cv]: [as, ar, Z, ag, aD, aH], endpoint: bw, [ct]: n }, { [cv]: [as, ar, aq, aB], endpoint: { [cA]: S, [cB]: aC, [cH]: al }, [ct]: n }, { [cv]: [as, ar, aq, aD, aE], [cu]: [{ [cv]: cd, endpoint: { [cA]: S, [cB]: aG, [cH]: al }, [ct]: n }, { endpoint: bx, [ct]: n }], [ct]: o }, { [cv]: [as, ar, aq, aD, aH], endpoint: bx, [ct]: n }], [ct]: o }, aR], [ct]: o }], [ct]: o }], [ct]: o }, { error: "A region must be set when sending requests to S3.", [ct]: f }] };
    ruleSet = _data;
  }
});
var cache;
var defaultEndpointResolver;
var init_endpointResolver = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/endpoint/endpointResolver.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es34();
    init_dist_es31();
    init_ruleset();
    cache = new EndpointCache({
      size: 50,
      params: [
        "Accelerate",
        "Bucket",
        "DisableAccessPoints",
        "DisableMultiRegionAccessPoints",
        "DisableS3ExpressSessionAuth",
        "Endpoint",
        "ForcePathStyle",
        "Region",
        "UseArnRegion",
        "UseDualStack",
        "UseFIPS",
        "UseGlobalEndpoint",
        "UseObjectLambdaEndpoint",
        "UseS3ExpressControlEndpoint"
      ]
    });
    defaultEndpointResolver = /* @__PURE__ */ __name2((endpointParams, context = {}) => {
      return cache.get(endpointParams, () => resolveEndpoint(ruleSet, {
        endpointParams,
        logger: context.logger
      }));
    }, "defaultEndpointResolver");
    customEndpointFunctions.aws = awsEndpointFunctions;
  }
});
function createAwsAuthSigv4HttpAuthOption(authParameters) {
  return {
    schemeId: "aws.auth#sigv4",
    signingProperties: {
      name: "s3",
      region: authParameters.region
    },
    propertiesExtractor: /* @__PURE__ */ __name2((config, context) => ({
      signingProperties: {
        config,
        context
      }
    }), "propertiesExtractor")
  };
}
__name(createAwsAuthSigv4HttpAuthOption, "createAwsAuthSigv4HttpAuthOption");
function createAwsAuthSigv4aHttpAuthOption(authParameters) {
  return {
    schemeId: "aws.auth#sigv4a",
    signingProperties: {
      name: "s3",
      region: authParameters.region
    },
    propertiesExtractor: /* @__PURE__ */ __name2((config, context) => ({
      signingProperties: {
        config,
        context
      }
    }), "propertiesExtractor")
  };
}
__name(createAwsAuthSigv4aHttpAuthOption, "createAwsAuthSigv4aHttpAuthOption");
var createEndpointRuleSetHttpAuthSchemeParametersProvider;
var _defaultS3HttpAuthSchemeParametersProvider;
var defaultS3HttpAuthSchemeParametersProvider;
var createEndpointRuleSetHttpAuthSchemeProvider;
var _defaultS3HttpAuthSchemeProvider;
var defaultS3HttpAuthSchemeProvider;
var resolveHttpAuthSchemeConfig;
var init_httpAuthSchemeProvider = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthSchemeProvider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es22();
    init_dist_es44();
    init_dist_es39();
    init_dist_es4();
    init_endpointResolver();
    createEndpointRuleSetHttpAuthSchemeParametersProvider = /* @__PURE__ */ __name2((defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
      if (!input) {
        throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
      }
      const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
      const instructionsFn = getSmithyContext(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
      if (!instructionsFn) {
        throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
      }
      const endpointParameters = await resolveParams(input, { getEndpointParameterInstructions: instructionsFn }, config);
      return Object.assign(defaultParameters, endpointParameters);
    }, "createEndpointRuleSetHttpAuthSchemeParametersProvider");
    _defaultS3HttpAuthSchemeParametersProvider = /* @__PURE__ */ __name2(async (config, context, input) => {
      return {
        operation: getSmithyContext(context).operation,
        region: await normalizeProvider(config.region)() || (() => {
          throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
        })()
      };
    }, "_defaultS3HttpAuthSchemeParametersProvider");
    defaultS3HttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultS3HttpAuthSchemeParametersProvider);
    __name2(createAwsAuthSigv4HttpAuthOption, "createAwsAuthSigv4HttpAuthOption");
    __name2(createAwsAuthSigv4aHttpAuthOption, "createAwsAuthSigv4aHttpAuthOption");
    createEndpointRuleSetHttpAuthSchemeProvider = /* @__PURE__ */ __name2((defaultEndpointResolver2, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
      const endpointRuleSetHttpAuthSchemeProvider = /* @__PURE__ */ __name2((authParameters) => {
        const endpoint = defaultEndpointResolver2(authParameters);
        const authSchemes = endpoint.properties?.authSchemes;
        if (!authSchemes) {
          return defaultHttpAuthSchemeResolver(authParameters);
        }
        const options = [];
        for (const scheme of authSchemes) {
          const { name: resolvedName, properties = {}, ...rest } = scheme;
          const name = resolvedName.toLowerCase();
          if (resolvedName !== name) {
            console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
          }
          let schemeId;
          if (name === "sigv4a") {
            schemeId = "aws.auth#sigv4a";
            const sigv4Present = authSchemes.find((s2) => {
              const name2 = s2.name.toLowerCase();
              return name2 !== "sigv4a" && name2.startsWith("sigv4");
            });
            if (SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) {
              continue;
            }
          } else if (name.startsWith("sigv4")) {
            schemeId = "aws.auth#sigv4";
          } else {
            throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
          }
          const createOption = createHttpAuthOptionFunctions[schemeId];
          if (!createOption) {
            throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
          }
          const option = createOption(authParameters);
          option.schemeId = schemeId;
          option.signingProperties = { ...option.signingProperties || {}, ...rest, ...properties };
          options.push(option);
        }
        return options;
      }, "endpointRuleSetHttpAuthSchemeProvider");
      return endpointRuleSetHttpAuthSchemeProvider;
    }, "createEndpointRuleSetHttpAuthSchemeProvider");
    _defaultS3HttpAuthSchemeProvider = /* @__PURE__ */ __name2((authParameters) => {
      const options = [];
      switch (authParameters.operation) {
        default: {
          options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
          options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
        }
      }
      return options;
    }, "_defaultS3HttpAuthSchemeProvider");
    defaultS3HttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver, _defaultS3HttpAuthSchemeProvider, {
      "aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
      "aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption
    });
    resolveHttpAuthSchemeConfig = /* @__PURE__ */ __name2((config) => {
      const config_0 = resolveAwsSdkSigV4Config(config);
      const config_1 = resolveAwsSdkSigV4AConfig(config_0);
      return Object.assign(config_1, {
        authSchemePreference: normalizeProvider(config.authSchemePreference ?? [])
      });
    }, "resolveHttpAuthSchemeConfig");
  }
});
var resolveClientEndpointParameters;
var commonParams;
var init_EndpointParameters = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/endpoint/EndpointParameters.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    resolveClientEndpointParameters = /* @__PURE__ */ __name2((options) => {
      return Object.assign(options, {
        useFipsEndpoint: options.useFipsEndpoint ?? false,
        useDualstackEndpoint: options.useDualstackEndpoint ?? false,
        forcePathStyle: options.forcePathStyle ?? false,
        useAccelerateEndpoint: options.useAccelerateEndpoint ?? false,
        useGlobalEndpoint: options.useGlobalEndpoint ?? false,
        disableMultiregionAccessPoints: options.disableMultiregionAccessPoints ?? false,
        defaultSigningName: "s3",
        clientContextParams: options.clientContextParams ?? {}
      });
    }, "resolveClientEndpointParameters");
    commonParams = {
      ForcePathStyle: { type: "clientContextParams", name: "forcePathStyle" },
      UseArnRegion: { type: "clientContextParams", name: "useArnRegion" },
      DisableMultiRegionAccessPoints: { type: "clientContextParams", name: "disableMultiregionAccessPoints" },
      Accelerate: { type: "clientContextParams", name: "useAccelerateEndpoint" },
      DisableS3ExpressSessionAuth: { type: "clientContextParams", name: "disableS3ExpressSessionAuth" },
      UseGlobalEndpoint: { type: "builtInParams", name: "useGlobalEndpoint" },
      UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
      Endpoint: { type: "builtInParams", name: "endpoint" },
      Region: { type: "builtInParams", name: "region" },
      UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
    };
  }
});
var S3ServiceException;
var init_S3ServiceException = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/models/S3ServiceException.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es20();
    S3ServiceException = class _S3ServiceException extends ServiceException {
      static {
        __name(this, "_S3ServiceException");
      }
      static {
        __name2(this, "S3ServiceException");
      }
      constructor(options) {
        super(options);
        Object.setPrototypeOf(this, _S3ServiceException.prototype);
      }
    };
  }
});
var NoSuchUpload;
var ObjectNotInActiveTierError;
var BucketAlreadyExists;
var BucketAlreadyOwnedByYou;
var NoSuchBucket;
var InvalidObjectState;
var NoSuchKey;
var NotFound;
var EncryptionTypeMismatch;
var InvalidRequest;
var InvalidWriteOffset;
var TooManyParts;
var IdempotencyParameterMismatch;
var ObjectAlreadyInActiveTierError;
var init_errors = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/models/errors.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_S3ServiceException();
    NoSuchUpload = class _NoSuchUpload extends S3ServiceException {
      static {
        __name(this, "_NoSuchUpload");
      }
      static {
        __name2(this, "NoSuchUpload");
      }
      name = "NoSuchUpload";
      $fault = "client";
      constructor(opts) {
        super({
          name: "NoSuchUpload",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _NoSuchUpload.prototype);
      }
    };
    ObjectNotInActiveTierError = class _ObjectNotInActiveTierError extends S3ServiceException {
      static {
        __name(this, "_ObjectNotInActiveTierError");
      }
      static {
        __name2(this, "ObjectNotInActiveTierError");
      }
      name = "ObjectNotInActiveTierError";
      $fault = "client";
      constructor(opts) {
        super({
          name: "ObjectNotInActiveTierError",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _ObjectNotInActiveTierError.prototype);
      }
    };
    BucketAlreadyExists = class _BucketAlreadyExists extends S3ServiceException {
      static {
        __name(this, "_BucketAlreadyExists");
      }
      static {
        __name2(this, "BucketAlreadyExists");
      }
      name = "BucketAlreadyExists";
      $fault = "client";
      constructor(opts) {
        super({
          name: "BucketAlreadyExists",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _BucketAlreadyExists.prototype);
      }
    };
    BucketAlreadyOwnedByYou = class _BucketAlreadyOwnedByYou extends S3ServiceException {
      static {
        __name(this, "_BucketAlreadyOwnedByYou");
      }
      static {
        __name2(this, "BucketAlreadyOwnedByYou");
      }
      name = "BucketAlreadyOwnedByYou";
      $fault = "client";
      constructor(opts) {
        super({
          name: "BucketAlreadyOwnedByYou",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _BucketAlreadyOwnedByYou.prototype);
      }
    };
    NoSuchBucket = class _NoSuchBucket extends S3ServiceException {
      static {
        __name(this, "_NoSuchBucket");
      }
      static {
        __name2(this, "NoSuchBucket");
      }
      name = "NoSuchBucket";
      $fault = "client";
      constructor(opts) {
        super({
          name: "NoSuchBucket",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _NoSuchBucket.prototype);
      }
    };
    InvalidObjectState = class _InvalidObjectState extends S3ServiceException {
      static {
        __name(this, "_InvalidObjectState");
      }
      static {
        __name2(this, "InvalidObjectState");
      }
      name = "InvalidObjectState";
      $fault = "client";
      StorageClass;
      AccessTier;
      constructor(opts) {
        super({
          name: "InvalidObjectState",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _InvalidObjectState.prototype);
        this.StorageClass = opts.StorageClass;
        this.AccessTier = opts.AccessTier;
      }
    };
    NoSuchKey = class _NoSuchKey extends S3ServiceException {
      static {
        __name(this, "_NoSuchKey");
      }
      static {
        __name2(this, "NoSuchKey");
      }
      name = "NoSuchKey";
      $fault = "client";
      constructor(opts) {
        super({
          name: "NoSuchKey",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _NoSuchKey.prototype);
      }
    };
    NotFound = class _NotFound extends S3ServiceException {
      static {
        __name(this, "_NotFound");
      }
      static {
        __name2(this, "NotFound");
      }
      name = "NotFound";
      $fault = "client";
      constructor(opts) {
        super({
          name: "NotFound",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _NotFound.prototype);
      }
    };
    EncryptionTypeMismatch = class _EncryptionTypeMismatch extends S3ServiceException {
      static {
        __name(this, "_EncryptionTypeMismatch");
      }
      static {
        __name2(this, "EncryptionTypeMismatch");
      }
      name = "EncryptionTypeMismatch";
      $fault = "client";
      constructor(opts) {
        super({
          name: "EncryptionTypeMismatch",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _EncryptionTypeMismatch.prototype);
      }
    };
    InvalidRequest = class _InvalidRequest extends S3ServiceException {
      static {
        __name(this, "_InvalidRequest");
      }
      static {
        __name2(this, "InvalidRequest");
      }
      name = "InvalidRequest";
      $fault = "client";
      constructor(opts) {
        super({
          name: "InvalidRequest",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _InvalidRequest.prototype);
      }
    };
    InvalidWriteOffset = class _InvalidWriteOffset extends S3ServiceException {
      static {
        __name(this, "_InvalidWriteOffset");
      }
      static {
        __name2(this, "InvalidWriteOffset");
      }
      name = "InvalidWriteOffset";
      $fault = "client";
      constructor(opts) {
        super({
          name: "InvalidWriteOffset",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _InvalidWriteOffset.prototype);
      }
    };
    TooManyParts = class _TooManyParts extends S3ServiceException {
      static {
        __name(this, "_TooManyParts");
      }
      static {
        __name2(this, "TooManyParts");
      }
      name = "TooManyParts";
      $fault = "client";
      constructor(opts) {
        super({
          name: "TooManyParts",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _TooManyParts.prototype);
      }
    };
    IdempotencyParameterMismatch = class _IdempotencyParameterMismatch extends S3ServiceException {
      static {
        __name(this, "_IdempotencyParameterMismatch");
      }
      static {
        __name2(this, "IdempotencyParameterMismatch");
      }
      name = "IdempotencyParameterMismatch";
      $fault = "client";
      constructor(opts) {
        super({
          name: "IdempotencyParameterMismatch",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _IdempotencyParameterMismatch.prototype);
      }
    };
    ObjectAlreadyInActiveTierError = class _ObjectAlreadyInActiveTierError extends S3ServiceException {
      static {
        __name(this, "_ObjectAlreadyInActiveTierError");
      }
      static {
        __name2(this, "ObjectAlreadyInActiveTierError");
      }
      name = "ObjectAlreadyInActiveTierError";
      $fault = "client";
      constructor(opts) {
        super({
          name: "ObjectAlreadyInActiveTierError",
          $fault: "client",
          ...opts
        });
        Object.setPrototypeOf(this, _ObjectAlreadyInActiveTierError.prototype);
      }
    };
  }
});
var _A;
var _AAO;
var _AC;
var _ACL;
var _ACL_;
var _ACLn;
var _ACP;
var _ACT;
var _ACn;
var _AD;
var _AED;
var _AF;
var _AH;
var _AHl;
var _AI;
var _AIMU;
var _AKI;
var _AM;
var _AMU;
var _AMUO;
var _AMUR;
var _AMl;
var _AO;
var _AOl;
var _APA;
var _APAc;
var _AQRD;
var _AR;
var _ARI;
var _AS;
var _ASBD;
var _ASSEBD;
var _ASr;
var _AT;
var _An;
var _B;
var _BA;
var _BAE;
var _BAI;
var _BAOBY;
var _BET;
var _BGR;
var _BI;
var _BKE;
var _BLC;
var _BLN;
var _BLS;
var _BLT;
var _BN;
var _BP;
var _BPA;
var _BPP;
var _BR;
var _BRy;
var _BS;
var _Bo;
var _Bu;
var _C;
var _CA;
var _CACL;
var _CB;
var _CBC;
var _CBMC;
var _CBMCR;
var _CBMTC;
var _CBMTCR;
var _CBO;
var _CBR;
var _CC;
var _CCRC;
var _CCRCC;
var _CCRCNVME;
var _CC_;
var _CD;
var _CD_;
var _CDo;
var _CE;
var _CE_;
var _CEo;
var _CF;
var _CFC;
var _CL;
var _CL_;
var _CL__;
var _CLo;
var _CM;
var _CMD;
var _CMU;
var _CMUO;
var _CMUOr;
var _CMUR;
var _CMURo;
var _CMURr;
var _CMUo;
var _CMUr;
var _CMh;
var _CO;
var _COO;
var _COR;
var _CORSC;
var _CORSR;
var _CORSRu;
var _CORo;
var _CP;
var _CPL;
var _CPLo;
var _CPR;
var _CPo;
var _CPom;
var _CR;
var _CRSBA;
var _CR_;
var _CS;
var _CSHA;
var _CSHAh;
var _CSIM;
var _CSIMS;
var _CSINM;
var _CSIUS;
var _CSO;
var _CSR;
var _CSRo;
var _CSRr;
var _CSSSECA;
var _CSSSECK;
var _CSSSECKMD;
var _CSV;
var _CSVI;
var _CSVIn;
var _CSVO;
var _CSo;
var _CSr;
var _CT;
var _CT_;
var _CTl;
var _CTo;
var _CTom;
var _CTon;
var _Co;
var _Cod;
var _Com;
var _Con;
var _Cont;
var _Cr;
var _D;
var _DAI;
var _DB;
var _DBAC;
var _DBACR;
var _DBC;
var _DBCR;
var _DBE;
var _DBER;
var _DBIC;
var _DBICR;
var _DBITC;
var _DBITCR;
var _DBL;
var _DBLR;
var _DBMC;
var _DBMCR;
var _DBMCRe;
var _DBMCe;
var _DBMTC;
var _DBMTCR;
var _DBOC;
var _DBOCR;
var _DBP;
var _DBPR;
var _DBR;
var _DBRR;
var _DBRe;
var _DBT;
var _DBTR;
var _DBW;
var _DBWR;
var _DE;
var _DIM;
var _DIMS;
var _DINM;
var _DIUS;
var _DM;
var _DME;
var _DMR;
var _DMVI;
var _DMe;
var _DN;
var _DO;
var _DOO;
var _DOOe;
var _DOR;
var _DORe;
var _DOT;
var _DOTO;
var _DOTR;
var _DOe;
var _DOel;
var _DOele;
var _DPAB;
var _DPABR;
var _DR;
var _DRe;
var _DRel;
var _DRes;
var _Da;
var _De;
var _Del;
var _Deli;
var _Des;
var _Desc;
var _Det;
var _E;
var _EA;
var _EBC;
var _EBO;
var _EC;
var _ECr;
var _ED;
var _EDr;
var _EE;
var _EH;
var _EHx;
var _EM;
var _EODM;
var _EOR;
var _ES;
var _ESBO;
var _ET;
var _ETL;
var _ETM;
var _ETa;
var _ETn;
var _ETv;
var _ETx;
var _En;
var _Ena;
var _End;
var _Er;
var _Err;
var _Ev;
var _Eve;
var _Ex;
var _Exp;
var _F;
var _FD;
var _FHI;
var _FO;
var _FR;
var _FRL;
var _FRi;
var _Fi;
var _Fo;
var _Fr;
var _G;
var _GBA;
var _GBAC;
var _GBACO;
var _GBACOe;
var _GBACR;
var _GBACRe;
var _GBACe;
var _GBAO;
var _GBAOe;
var _GBAR;
var _GBARe;
var _GBAe;
var _GBC;
var _GBCO;
var _GBCR;
var _GBE;
var _GBEO;
var _GBER;
var _GBIC;
var _GBICO;
var _GBICR;
var _GBITC;
var _GBITCO;
var _GBITCR;
var _GBL;
var _GBLC;
var _GBLCO;
var _GBLCR;
var _GBLO;
var _GBLOe;
var _GBLR;
var _GBLRe;
var _GBLe;
var _GBMC;
var _GBMCO;
var _GBMCOe;
var _GBMCR;
var _GBMCRe;
var _GBMCRet;
var _GBMCe;
var _GBMTC;
var _GBMTCO;
var _GBMTCR;
var _GBMTCRe;
var _GBNC;
var _GBNCR;
var _GBOC;
var _GBOCO;
var _GBOCR;
var _GBP;
var _GBPO;
var _GBPR;
var _GBPS;
var _GBPSO;
var _GBPSR;
var _GBR;
var _GBRO;
var _GBRP;
var _GBRPO;
var _GBRPR;
var _GBRR;
var _GBT;
var _GBTO;
var _GBTR;
var _GBV;
var _GBVO;
var _GBVR;
var _GBW;
var _GBWO;
var _GBWR;
var _GFC;
var _GJP;
var _GO;
var _GOA;
var _GOAO;
var _GOAOe;
var _GOAP;
var _GOAR;
var _GOARe;
var _GOARet;
var _GOAe;
var _GOLC;
var _GOLCO;
var _GOLCR;
var _GOLH;
var _GOLHO;
var _GOLHR;
var _GOO;
var _GOR;
var _GORO;
var _GORR;
var _GORe;
var _GOT;
var _GOTO;
var _GOTOe;
var _GOTR;
var _GOTRe;
var _GOTe;
var _GPAB;
var _GPABO;
var _GPABR;
var _GR;
var _GRACP;
var _GW;
var _GWACP;
var _Gr;
var _Gra;
var _HB;
var _HBO;
var _HBR;
var _HECRE;
var _HN;
var _HO;
var _HOO;
var _HOR;
var _HRC;
var _I;
var _IC;
var _ICL;
var _ID;
var _IDn;
var _IDnv;
var _IE;
var _IEn;
var _IF;
var _IL;
var _IM;
var _IMIT;
var _IMLMT;
var _IMS;
var _IMS_;
var _IMSf;
var _IMUR;
var _IM_;
var _INM;
var _INM_;
var _IOF;
var _IOS;
var _IOV;
var _IP;
var _IPA;
var _IPM;
var _IR;
var _IRIP;
var _IS;
var _ISBD;
var _ISn;
var _IT;
var _ITAO;
var _ITC;
var _ITCL;
var _ITCR;
var _ITCU;
var _ITCn;
var _ITF;
var _IUS;
var _IUS_;
var _IWO;
var _In;
var _Ini;
var _JSON;
var _JSONI;
var _JSONO;
var _JTC;
var _JTCR;
var _JTCU;
var _K;
var _KC;
var _KI;
var _KKA;
var _KM;
var _KMSC;
var _KMSKI;
var _KMSMKID;
var _KPE;
var _L;
var _LAMBR;
var _LAMDBR;
var _LB;
var _LBAC;
var _LBACO;
var _LBACR;
var _LBACRi;
var _LBIC;
var _LBICO;
var _LBICR;
var _LBITC;
var _LBITCO;
var _LBITCR;
var _LBMC;
var _LBMCO;
var _LBMCR;
var _LBO;
var _LBR;
var _LBRi;
var _LC;
var _LCi;
var _LDB;
var _LDBO;
var _LDBR;
var _LE;
var _LEi;
var _LFA;
var _LFC;
var _LFCL;
var _LFCa;
var _LH;
var _LI;
var _LICR;
var _LM;
var _LMCR;
var _LMT;
var _LMU;
var _LMUO;
var _LMUR;
var _LMURi;
var _LM_;
var _LO;
var _LOO;
var _LOR;
var _LOV;
var _LOVO;
var _LOVOi;
var _LOVR;
var _LOVRi;
var _LOVi;
var _LP;
var _LPO;
var _LPR;
var _LPRi;
var _LR;
var _LRAO;
var _LRF;
var _LRi;
var _LVR;
var _M;
var _MAO;
var _MAS;
var _MB;
var _MC;
var _MCL;
var _MCR;
var _MCe;
var _MD;
var _MDB;
var _MDf;
var _ME;
var _MF;
var _MFA;
var _MFAD;
var _MK;
var _MM;
var _MOS;
var _MP;
var _MTC;
var _MTCR;
var _MTEC;
var _MU;
var _MUL;
var _MUa;
var _Ma;
var _Me;
var _Mes;
var _Mi;
var _Mo;
var _N;
var _NC;
var _NCF;
var _NCT;
var _ND;
var _NF;
var _NKM;
var _NM;
var _NNV;
var _NPNM;
var _NSB;
var _NSK;
var _NSU;
var _NUIM;
var _NVE;
var _NVIM;
var _NVT;
var _NVTL;
var _NVTo;
var _O;
var _OA;
var _OAIATE;
var _OC;
var _OCR;
var _OCRw;
var _OF;
var _OI;
var _OIL;
var _OL;
var _OLC;
var _OLE;
var _OLEFB;
var _OLLH;
var _OLLHS;
var _OLM;
var _OLR;
var _OLRUD;
var _OLRb;
var _OLb;
var _ONIATE;
var _OO;
var _OOA;
var _OP;
var _OPb;
var _OS;
var _OSGT;
var _OSLT;
var _OSV;
var _OSu;
var _OV;
var _OVL;
var _Ob;
var _Obj;
var _P;
var _PABC;
var _PBA;
var _PBAC;
var _PBACR;
var _PBACRu;
var _PBACu;
var _PBAR;
var _PBARu;
var _PBAu;
var _PBC;
var _PBCR;
var _PBE;
var _PBER;
var _PBIC;
var _PBICR;
var _PBITC;
var _PBITCR;
var _PBL;
var _PBLC;
var _PBLCO;
var _PBLCR;
var _PBLR;
var _PBMC;
var _PBMCR;
var _PBNC;
var _PBNCR;
var _PBOC;
var _PBOCR;
var _PBP;
var _PBPR;
var _PBR;
var _PBRP;
var _PBRPR;
var _PBRR;
var _PBT;
var _PBTR;
var _PBV;
var _PBVR;
var _PBW;
var _PBWR;
var _PC;
var _PDS;
var _PE;
var _PI;
var _PL;
var _PN;
var _PNM;
var _PO;
var _POA;
var _POAO;
var _POAR;
var _POLC;
var _POLCO;
var _POLCR;
var _POLH;
var _POLHO;
var _POLHR;
var _POO;
var _POR;
var _PORO;
var _PORR;
var _PORu;
var _POT;
var _POTO;
var _POTR;
var _PP;
var _PPAB;
var _PPABR;
var _PS;
var _Pa;
var _Par;
var _Parq;
var _Pay;
var _Payl;
var _Pe;
var _Po;
var _Pr;
var _Pri;
var _Pro;
var _Q;
var _QA;
var _QC;
var _QCL;
var _QCu;
var _QCue;
var _QEC;
var _QF;
var _Qu;
var _R;
var _RART;
var _RC;
var _RCC;
var _RCD;
var _RCE;
var _RCL;
var _RCT;
var _RCe;
var _RD;
var _RE;
var _RED;
var _REe;
var _REec;
var _RKKID;
var _RKPW;
var _RKW;
var _RM;
var _RO;
var _ROO;
var _ROOe;
var _ROP;
var _ROR;
var _RORe;
var _ROe;
var _RP;
var _RPB;
var _RPC;
var _RPe;
var _RR;
var _RRAO;
var _RRF;
var _RRe;
var _RRep;
var _RReq;
var _RRes;
var _RRo;
var _RS;
var _RSe;
var _RSen;
var _RT;
var _RTV;
var _RTe;
var _RUD;
var _Ra;
var _Re;
var _Rec;
var _Red;
var _Ret;
var _Ro;
var _Ru;
var _S;
var _SA;
var _SAK;
var _SAs;
var _SB;
var _SBD;
var _SC;
var _SCA;
var _SCADE;
var _SCV;
var _SCe;
var _SCt;
var _SDV;
var _SE;
var _SIM;
var _SIMS;
var _SINM;
var _SIUS;
var _SK;
var _SKEO;
var _SKF;
var _SKe;
var _SL;
var _SM;
var _SOC;
var _SOCES;
var _SOCO;
var _SOCR;
var _SP;
var _SPi;
var _SR;
var _SS;
var _SSC;
var _SSE;
var _SSEA;
var _SSEBD;
var _SSEC;
var _SSECA;
var _SSECK;
var _SSECKMD;
var _SSEKMS;
var _SSEKMSEC;
var _SSEKMSKI;
var _SSER;
var _SSERe;
var _SSES;
var _ST;
var _STD;
var _STDR;
var _S_;
var _Sc;
var _Si;
var _St;
var _Sta;
var _Su;
var _T;
var _TA;
var _TAo;
var _TB;
var _TBA;
var _TBT;
var _TC;
var _TCL;
var _TCo;
var _TCop;
var _TD;
var _TDMOS;
var _TG;
var _TGa;
var _TL;
var _TLr;
var _TMP;
var _TN;
var _TNa;
var _TOKF;
var _TP;
var _TPC;
var _TS;
var _TSa;
var _Ta;
var _Tag;
var _Ti;
var _Tie;
var _Tier;
var _Tim;
var _To;
var _Top;
var _Tr;
var _Tra;
var _Ty;
var _U;
var _UBMITC;
var _UBMITCR;
var _UBMJTC;
var _UBMJTCR;
var _UI;
var _UIM;
var _UM;
var _UP;
var _UPC;
var _UPCO;
var _UPCR;
var _UPO;
var _UPR;
var _URI;
var _Up;
var _V;
var _VC;
var _VI;
var _VIM;
var _Ve;
var _Ver;
var _WC;
var _WGOR;
var _WGORR;
var _WOB;
var _WRL;
var _Y;
var _ar;
var _br;
var _c;
var _ct;
var _d;
var _e;
var _eP;
var _en;
var _et;
var _fo;
var _h;
var _hC;
var _hE;
var _hH;
var _hL;
var _hP;
var _hPH;
var _hQ;
var _hi;
var _i;
var _iT;
var _km;
var _m;
var _mb;
var _mdb;
var _mk;
var _mp;
var _mu;
var _p;
var _pN;
var _pnm;
var _rcc;
var _rcd;
var _rce;
var _rcl;
var _rct;
var _re;
var _s;
var _sa;
var _sm;
var _uI;
var _uim;
var _vI;
var _vim;
var _x;
var _xA;
var _xF;
var _xN;
var _xNm;
var _xaa;
var _xaad;
var _xaapa;
var _xaari;
var _xaas;
var _xaba;
var _xabgr;
var _xabln;
var _xablt;
var _xabole;
var _xabolt;
var _xabr;
var _xaca;
var _xacc;
var _xacc_;
var _xacc__;
var _xacm;
var _xacrsba;
var _xacs;
var _xacs_;
var _xacs__;
var _xacsim;
var _xacsims;
var _xacsinm;
var _xacsius;
var _xacsm;
var _xacsr;
var _xacssseca;
var _xacssseck;
var _xacssseckM;
var _xacsvi;
var _xact;
var _xact_;
var _xadm;
var _xae;
var _xaebo;
var _xafec;
var _xafem;
var _xafhCC;
var _xafhCD;
var _xafhCE;
var _xafhCL;
var _xafhCR;
var _xafhCT;
var _xafhE;
var _xafhE_;
var _xafhLM;
var _xafhar;
var _xafhxacc;
var _xafhxacc_;
var _xafhxacc__;
var _xafhxacs;
var _xafhxacs_;
var _xafhxadm;
var _xafhxae;
var _xafhxamm;
var _xafhxampc;
var _xafhxaollh;
var _xafhxaolm;
var _xafhxaolrud;
var _xafhxar;
var _xafhxarc;
var _xafhxars;
var _xafhxasc;
var _xafhxasse;
var _xafhxasseakki;
var _xafhxassebke;
var _xafhxasseca;
var _xafhxasseckM;
var _xafhxatc;
var _xafhxavi;
var _xafs;
var _xagfc;
var _xagr;
var _xagra;
var _xagw;
var _xagwa;
var _xaimit;
var _xaimlmt;
var _xaims;
var _xam;
var _xam_;
var _xamd;
var _xamm;
var _xamos;
var _xamp;
var _xampc;
var _xaoa;
var _xaollh;
var _xaolm;
var _xaolrud;
var _xaoo;
var _xaooa;
var _xaos;
var _xapnm;
var _xar;
var _xarc;
var _xarop;
var _xarp;
var _xarr;
var _xars;
var _xars_;
var _xarsim;
var _xarsims;
var _xarsinm;
var _xarsius;
var _xart;
var _xasc;
var _xasca;
var _xasdv;
var _xasebo;
var _xasse;
var _xasseakki;
var _xassebke;
var _xassec;
var _xasseca;
var _xasseck;
var _xasseckM;
var _xat;
var _xatc;
var _xatd;
var _xatdmos;
var _xavi;
var _xawob;
var _xawrl;
var _xs;
var n0;
var CopySourceSSECustomerKey;
var SessionCredentialValue;
var SSECustomerKey;
var SSEKMSEncryptionContext;
var SSEKMSKeyId;
var StreamingBlob;
var AbacStatus$;
var AbortIncompleteMultipartUpload$;
var AbortMultipartUploadOutput$;
var AbortMultipartUploadRequest$;
var AccelerateConfiguration$;
var AccessControlPolicy$;
var AccessControlTranslation$;
var AnalyticsAndOperator$;
var AnalyticsConfiguration$;
var AnalyticsExportDestination$;
var AnalyticsS3BucketDestination$;
var BlockedEncryptionTypes$;
var Bucket$;
var BucketAlreadyExists$;
var BucketAlreadyOwnedByYou$;
var BucketInfo$;
var BucketLifecycleConfiguration$;
var BucketLoggingStatus$;
var Checksum$;
var CommonPrefix$;
var CompletedMultipartUpload$;
var CompletedPart$;
var CompleteMultipartUploadOutput$;
var CompleteMultipartUploadRequest$;
var Condition$;
var ContinuationEvent$;
var CopyObjectOutput$;
var CopyObjectRequest$;
var CopyObjectResult$;
var CopyPartResult$;
var CORSConfiguration$;
var CORSRule$;
var CreateBucketConfiguration$;
var CreateBucketMetadataConfigurationRequest$;
var CreateBucketMetadataTableConfigurationRequest$;
var CreateBucketOutput$;
var CreateBucketRequest$;
var CreateMultipartUploadOutput$;
var CreateMultipartUploadRequest$;
var CreateSessionOutput$;
var CreateSessionRequest$;
var CSVInput$;
var CSVOutput$;
var DefaultRetention$;
var Delete$;
var DeleteBucketAnalyticsConfigurationRequest$;
var DeleteBucketCorsRequest$;
var DeleteBucketEncryptionRequest$;
var DeleteBucketIntelligentTieringConfigurationRequest$;
var DeleteBucketInventoryConfigurationRequest$;
var DeleteBucketLifecycleRequest$;
var DeleteBucketMetadataConfigurationRequest$;
var DeleteBucketMetadataTableConfigurationRequest$;
var DeleteBucketMetricsConfigurationRequest$;
var DeleteBucketOwnershipControlsRequest$;
var DeleteBucketPolicyRequest$;
var DeleteBucketReplicationRequest$;
var DeleteBucketRequest$;
var DeleteBucketTaggingRequest$;
var DeleteBucketWebsiteRequest$;
var DeletedObject$;
var DeleteMarkerEntry$;
var DeleteMarkerReplication$;
var DeleteObjectOutput$;
var DeleteObjectRequest$;
var DeleteObjectsOutput$;
var DeleteObjectsRequest$;
var DeleteObjectTaggingOutput$;
var DeleteObjectTaggingRequest$;
var DeletePublicAccessBlockRequest$;
var Destination$;
var DestinationResult$;
var Encryption$;
var EncryptionConfiguration$;
var EncryptionTypeMismatch$;
var EndEvent$;
var _Error$;
var ErrorDetails$;
var ErrorDocument$;
var EventBridgeConfiguration$;
var ExistingObjectReplication$;
var FilterRule$;
var GetBucketAbacOutput$;
var GetBucketAbacRequest$;
var GetBucketAccelerateConfigurationOutput$;
var GetBucketAccelerateConfigurationRequest$;
var GetBucketAclOutput$;
var GetBucketAclRequest$;
var GetBucketAnalyticsConfigurationOutput$;
var GetBucketAnalyticsConfigurationRequest$;
var GetBucketCorsOutput$;
var GetBucketCorsRequest$;
var GetBucketEncryptionOutput$;
var GetBucketEncryptionRequest$;
var GetBucketIntelligentTieringConfigurationOutput$;
var GetBucketIntelligentTieringConfigurationRequest$;
var GetBucketInventoryConfigurationOutput$;
var GetBucketInventoryConfigurationRequest$;
var GetBucketLifecycleConfigurationOutput$;
var GetBucketLifecycleConfigurationRequest$;
var GetBucketLocationOutput$;
var GetBucketLocationRequest$;
var GetBucketLoggingOutput$;
var GetBucketLoggingRequest$;
var GetBucketMetadataConfigurationOutput$;
var GetBucketMetadataConfigurationRequest$;
var GetBucketMetadataConfigurationResult$;
var GetBucketMetadataTableConfigurationOutput$;
var GetBucketMetadataTableConfigurationRequest$;
var GetBucketMetadataTableConfigurationResult$;
var GetBucketMetricsConfigurationOutput$;
var GetBucketMetricsConfigurationRequest$;
var GetBucketNotificationConfigurationRequest$;
var GetBucketOwnershipControlsOutput$;
var GetBucketOwnershipControlsRequest$;
var GetBucketPolicyOutput$;
var GetBucketPolicyRequest$;
var GetBucketPolicyStatusOutput$;
var GetBucketPolicyStatusRequest$;
var GetBucketReplicationOutput$;
var GetBucketReplicationRequest$;
var GetBucketRequestPaymentOutput$;
var GetBucketRequestPaymentRequest$;
var GetBucketTaggingOutput$;
var GetBucketTaggingRequest$;
var GetBucketVersioningOutput$;
var GetBucketVersioningRequest$;
var GetBucketWebsiteOutput$;
var GetBucketWebsiteRequest$;
var GetObjectAclOutput$;
var GetObjectAclRequest$;
var GetObjectAttributesOutput$;
var GetObjectAttributesParts$;
var GetObjectAttributesRequest$;
var GetObjectLegalHoldOutput$;
var GetObjectLegalHoldRequest$;
var GetObjectLockConfigurationOutput$;
var GetObjectLockConfigurationRequest$;
var GetObjectOutput$;
var GetObjectRequest$;
var GetObjectRetentionOutput$;
var GetObjectRetentionRequest$;
var GetObjectTaggingOutput$;
var GetObjectTaggingRequest$;
var GetObjectTorrentOutput$;
var GetObjectTorrentRequest$;
var GetPublicAccessBlockOutput$;
var GetPublicAccessBlockRequest$;
var GlacierJobParameters$;
var Grant$;
var Grantee$;
var HeadBucketOutput$;
var HeadBucketRequest$;
var HeadObjectOutput$;
var HeadObjectRequest$;
var IdempotencyParameterMismatch$;
var IndexDocument$;
var Initiator$;
var InputSerialization$;
var IntelligentTieringAndOperator$;
var IntelligentTieringConfiguration$;
var IntelligentTieringFilter$;
var InvalidObjectState$;
var InvalidRequest$;
var InvalidWriteOffset$;
var InventoryConfiguration$;
var InventoryDestination$;
var InventoryEncryption$;
var InventoryFilter$;
var InventoryS3BucketDestination$;
var InventorySchedule$;
var InventoryTableConfiguration$;
var InventoryTableConfigurationResult$;
var InventoryTableConfigurationUpdates$;
var JournalTableConfiguration$;
var JournalTableConfigurationResult$;
var JournalTableConfigurationUpdates$;
var JSONInput$;
var JSONOutput$;
var LambdaFunctionConfiguration$;
var LifecycleExpiration$;
var LifecycleRule$;
var LifecycleRuleAndOperator$;
var LifecycleRuleFilter$;
var ListBucketAnalyticsConfigurationsOutput$;
var ListBucketAnalyticsConfigurationsRequest$;
var ListBucketIntelligentTieringConfigurationsOutput$;
var ListBucketIntelligentTieringConfigurationsRequest$;
var ListBucketInventoryConfigurationsOutput$;
var ListBucketInventoryConfigurationsRequest$;
var ListBucketMetricsConfigurationsOutput$;
var ListBucketMetricsConfigurationsRequest$;
var ListBucketsOutput$;
var ListBucketsRequest$;
var ListDirectoryBucketsOutput$;
var ListDirectoryBucketsRequest$;
var ListMultipartUploadsOutput$;
var ListMultipartUploadsRequest$;
var ListObjectsOutput$;
var ListObjectsRequest$;
var ListObjectsV2Output$;
var ListObjectsV2Request$;
var ListObjectVersionsOutput$;
var ListObjectVersionsRequest$;
var ListPartsOutput$;
var ListPartsRequest$;
var LocationInfo$;
var LoggingEnabled$;
var MetadataConfiguration$;
var MetadataConfigurationResult$;
var MetadataEntry$;
var MetadataTableConfiguration$;
var MetadataTableConfigurationResult$;
var MetadataTableEncryptionConfiguration$;
var Metrics$;
var MetricsAndOperator$;
var MetricsConfiguration$;
var MultipartUpload$;
var NoncurrentVersionExpiration$;
var NoncurrentVersionTransition$;
var NoSuchBucket$;
var NoSuchKey$;
var NoSuchUpload$;
var NotFound$;
var NotificationConfiguration$;
var NotificationConfigurationFilter$;
var _Object$;
var ObjectAlreadyInActiveTierError$;
var ObjectIdentifier$;
var ObjectLockConfiguration$;
var ObjectLockLegalHold$;
var ObjectLockRetention$;
var ObjectLockRule$;
var ObjectNotInActiveTierError$;
var ObjectPart$;
var ObjectVersion$;
var OutputLocation$;
var OutputSerialization$;
var Owner$;
var OwnershipControls$;
var OwnershipControlsRule$;
var ParquetInput$;
var Part$;
var PartitionedPrefix$;
var PolicyStatus$;
var Progress$;
var ProgressEvent$;
var PublicAccessBlockConfiguration$;
var PutBucketAbacRequest$;
var PutBucketAccelerateConfigurationRequest$;
var PutBucketAclRequest$;
var PutBucketAnalyticsConfigurationRequest$;
var PutBucketCorsRequest$;
var PutBucketEncryptionRequest$;
var PutBucketIntelligentTieringConfigurationRequest$;
var PutBucketInventoryConfigurationRequest$;
var PutBucketLifecycleConfigurationOutput$;
var PutBucketLifecycleConfigurationRequest$;
var PutBucketLoggingRequest$;
var PutBucketMetricsConfigurationRequest$;
var PutBucketNotificationConfigurationRequest$;
var PutBucketOwnershipControlsRequest$;
var PutBucketPolicyRequest$;
var PutBucketReplicationRequest$;
var PutBucketRequestPaymentRequest$;
var PutBucketTaggingRequest$;
var PutBucketVersioningRequest$;
var PutBucketWebsiteRequest$;
var PutObjectAclOutput$;
var PutObjectAclRequest$;
var PutObjectLegalHoldOutput$;
var PutObjectLegalHoldRequest$;
var PutObjectLockConfigurationOutput$;
var PutObjectLockConfigurationRequest$;
var PutObjectOutput$;
var PutObjectRequest$;
var PutObjectRetentionOutput$;
var PutObjectRetentionRequest$;
var PutObjectTaggingOutput$;
var PutObjectTaggingRequest$;
var PutPublicAccessBlockRequest$;
var QueueConfiguration$;
var RecordExpiration$;
var RecordsEvent$;
var Redirect$;
var RedirectAllRequestsTo$;
var RenameObjectOutput$;
var RenameObjectRequest$;
var ReplicaModifications$;
var ReplicationConfiguration$;
var ReplicationRule$;
var ReplicationRuleAndOperator$;
var ReplicationRuleFilter$;
var ReplicationTime$;
var ReplicationTimeValue$;
var RequestPaymentConfiguration$;
var RequestProgress$;
var RestoreObjectOutput$;
var RestoreObjectRequest$;
var RestoreRequest$;
var RestoreStatus$;
var RoutingRule$;
var S3KeyFilter$;
var S3Location$;
var S3TablesDestination$;
var S3TablesDestinationResult$;
var ScanRange$;
var SelectObjectContentOutput$;
var SelectObjectContentRequest$;
var SelectParameters$;
var ServerSideEncryptionByDefault$;
var ServerSideEncryptionConfiguration$;
var ServerSideEncryptionRule$;
var SessionCredentials$;
var SimplePrefix$;
var SourceSelectionCriteria$;
var SSEKMS$;
var SseKmsEncryptedObjects$;
var SSES3$;
var Stats$;
var StatsEvent$;
var StorageClassAnalysis$;
var StorageClassAnalysisDataExport$;
var Tag$;
var Tagging$;
var TargetGrant$;
var TargetObjectKeyFormat$;
var Tiering$;
var TooManyParts$;
var TopicConfiguration$;
var Transition$;
var UpdateBucketMetadataInventoryTableConfigurationRequest$;
var UpdateBucketMetadataJournalTableConfigurationRequest$;
var UploadPartCopyOutput$;
var UploadPartCopyRequest$;
var UploadPartOutput$;
var UploadPartRequest$;
var VersioningConfiguration$;
var WebsiteConfiguration$;
var WriteGetObjectResponseRequest$;
var __Unit;
var S3ServiceException$;
var AllowedHeaders;
var AllowedMethods;
var AllowedOrigins;
var AnalyticsConfigurationList;
var Buckets;
var ChecksumAlgorithmList;
var CommonPrefixList;
var CompletedPartList;
var CORSRules;
var DeletedObjects;
var DeleteMarkers;
var EncryptionTypeList;
var Errors;
var EventList;
var ExposeHeaders;
var FilterRuleList;
var Grants;
var IntelligentTieringConfigurationList;
var InventoryConfigurationList;
var InventoryOptionalFields;
var LambdaFunctionConfigurationList;
var LifecycleRules;
var MetricsConfigurationList;
var MultipartUploadList;
var NoncurrentVersionTransitionList;
var ObjectAttributesList;
var ObjectIdentifierList;
var ObjectList;
var ObjectVersionList;
var OptionalObjectAttributesList;
var OwnershipControlsRules;
var Parts;
var PartsList;
var QueueConfigurationList;
var ReplicationRules;
var RoutingRules;
var ServerSideEncryptionRules;
var TagSet;
var TargetGrants;
var TieringList;
var TopicConfigurationList;
var TransitionList;
var UserMetadata;
var Metadata;
var AnalyticsFilter$;
var MetricsFilter$;
var SelectObjectContentEventStream$;
var AbortMultipartUpload$;
var CompleteMultipartUpload$;
var CopyObject$;
var CreateBucket$;
var CreateBucketMetadataConfiguration$;
var CreateBucketMetadataTableConfiguration$;
var CreateMultipartUpload$;
var CreateSession$;
var DeleteBucket$;
var DeleteBucketAnalyticsConfiguration$;
var DeleteBucketCors$;
var DeleteBucketEncryption$;
var DeleteBucketIntelligentTieringConfiguration$;
var DeleteBucketInventoryConfiguration$;
var DeleteBucketLifecycle$;
var DeleteBucketMetadataConfiguration$;
var DeleteBucketMetadataTableConfiguration$;
var DeleteBucketMetricsConfiguration$;
var DeleteBucketOwnershipControls$;
var DeleteBucketPolicy$;
var DeleteBucketReplication$;
var DeleteBucketTagging$;
var DeleteBucketWebsite$;
var DeleteObject$;
var DeleteObjects$;
var DeleteObjectTagging$;
var DeletePublicAccessBlock$;
var GetBucketAbac$;
var GetBucketAccelerateConfiguration$;
var GetBucketAcl$;
var GetBucketAnalyticsConfiguration$;
var GetBucketCors$;
var GetBucketEncryption$;
var GetBucketIntelligentTieringConfiguration$;
var GetBucketInventoryConfiguration$;
var GetBucketLifecycleConfiguration$;
var GetBucketLocation$;
var GetBucketLogging$;
var GetBucketMetadataConfiguration$;
var GetBucketMetadataTableConfiguration$;
var GetBucketMetricsConfiguration$;
var GetBucketNotificationConfiguration$;
var GetBucketOwnershipControls$;
var GetBucketPolicy$;
var GetBucketPolicyStatus$;
var GetBucketReplication$;
var GetBucketRequestPayment$;
var GetBucketTagging$;
var GetBucketVersioning$;
var GetBucketWebsite$;
var GetObject$;
var GetObjectAcl$;
var GetObjectAttributes$;
var GetObjectLegalHold$;
var GetObjectLockConfiguration$;
var GetObjectRetention$;
var GetObjectTagging$;
var GetObjectTorrent$;
var GetPublicAccessBlock$;
var HeadBucket$;
var HeadObject$;
var ListBucketAnalyticsConfigurations$;
var ListBucketIntelligentTieringConfigurations$;
var ListBucketInventoryConfigurations$;
var ListBucketMetricsConfigurations$;
var ListBuckets$;
var ListDirectoryBuckets$;
var ListMultipartUploads$;
var ListObjects$;
var ListObjectsV2$;
var ListObjectVersions$;
var ListParts$;
var PutBucketAbac$;
var PutBucketAccelerateConfiguration$;
var PutBucketAcl$;
var PutBucketAnalyticsConfiguration$;
var PutBucketCors$;
var PutBucketEncryption$;
var PutBucketIntelligentTieringConfiguration$;
var PutBucketInventoryConfiguration$;
var PutBucketLifecycleConfiguration$;
var PutBucketLogging$;
var PutBucketMetricsConfiguration$;
var PutBucketNotificationConfiguration$;
var PutBucketOwnershipControls$;
var PutBucketPolicy$;
var PutBucketReplication$;
var PutBucketRequestPayment$;
var PutBucketTagging$;
var PutBucketVersioning$;
var PutBucketWebsite$;
var PutObject$;
var PutObjectAcl$;
var PutObjectLegalHold$;
var PutObjectLockConfiguration$;
var PutObjectRetention$;
var PutObjectTagging$;
var PutPublicAccessBlock$;
var RenameObject$;
var RestoreObject$;
var SelectObjectContent$;
var UpdateBucketMetadataInventoryTableConfiguration$;
var UpdateBucketMetadataJournalTableConfiguration$;
var UploadPart$;
var UploadPartCopy$;
var WriteGetObjectResponse$;
var init_schemas_0 = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/schemas/schemas_0.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_schema2();
    init_errors();
    init_S3ServiceException();
    _A = "Account";
    _AAO = "AnalyticsAndOperator";
    _AC = "AccelerateConfiguration";
    _ACL = "AccessControlList";
    _ACL_ = "ACL";
    _ACLn = "AnalyticsConfigurationList";
    _ACP = "AccessControlPolicy";
    _ACT = "AccessControlTranslation";
    _ACn = "AnalyticsConfiguration";
    _AD = "AbortDate";
    _AED = "AnalyticsExportDestination";
    _AF = "AnalyticsFilter";
    _AH = "AllowedHeaders";
    _AHl = "AllowedHeader";
    _AI = "AccountId";
    _AIMU = "AbortIncompleteMultipartUpload";
    _AKI = "AccessKeyId";
    _AM = "AllowedMethods";
    _AMU = "AbortMultipartUpload";
    _AMUO = "AbortMultipartUploadOutput";
    _AMUR = "AbortMultipartUploadRequest";
    _AMl = "AllowedMethod";
    _AO = "AllowedOrigins";
    _AOl = "AllowedOrigin";
    _APA = "AccessPointAlias";
    _APAc = "AccessPointArn";
    _AQRD = "AllowQuotedRecordDelimiter";
    _AR = "AcceptRanges";
    _ARI = "AbortRuleId";
    _AS = "AbacStatus";
    _ASBD = "AnalyticsS3BucketDestination";
    _ASSEBD = "ApplyServerSideEncryptionByDefault";
    _ASr = "ArchiveStatus";
    _AT = "AccessTier";
    _An = "And";
    _B = "Bucket";
    _BA = "BucketArn";
    _BAE = "BucketAlreadyExists";
    _BAI = "BucketAccountId";
    _BAOBY = "BucketAlreadyOwnedByYou";
    _BET = "BlockedEncryptionTypes";
    _BGR = "BypassGovernanceRetention";
    _BI = "BucketInfo";
    _BKE = "BucketKeyEnabled";
    _BLC = "BucketLifecycleConfiguration";
    _BLN = "BucketLocationName";
    _BLS = "BucketLoggingStatus";
    _BLT = "BucketLocationType";
    _BN = "BucketName";
    _BP = "BytesProcessed";
    _BPA = "BlockPublicAcls";
    _BPP = "BlockPublicPolicy";
    _BR = "BucketRegion";
    _BRy = "BytesReturned";
    _BS = "BytesScanned";
    _Bo = "Body";
    _Bu = "Buckets";
    _C = "Checksum";
    _CA = "ChecksumAlgorithm";
    _CACL = "CannedACL";
    _CB = "CreateBucket";
    _CBC = "CreateBucketConfiguration";
    _CBMC = "CreateBucketMetadataConfiguration";
    _CBMCR = "CreateBucketMetadataConfigurationRequest";
    _CBMTC = "CreateBucketMetadataTableConfiguration";
    _CBMTCR = "CreateBucketMetadataTableConfigurationRequest";
    _CBO = "CreateBucketOutput";
    _CBR = "CreateBucketRequest";
    _CC = "CacheControl";
    _CCRC = "ChecksumCRC32";
    _CCRCC = "ChecksumCRC32C";
    _CCRCNVME = "ChecksumCRC64NVME";
    _CC_ = "Cache-Control";
    _CD = "CreationDate";
    _CD_ = "Content-Disposition";
    _CDo = "ContentDisposition";
    _CE = "ContinuationEvent";
    _CE_ = "Content-Encoding";
    _CEo = "ContentEncoding";
    _CF = "CloudFunction";
    _CFC = "CloudFunctionConfiguration";
    _CL = "ContentLanguage";
    _CL_ = "Content-Language";
    _CL__ = "Content-Length";
    _CLo = "ContentLength";
    _CM = "Content-MD5";
    _CMD = "ContentMD5";
    _CMU = "CompletedMultipartUpload";
    _CMUO = "CompleteMultipartUploadOutput";
    _CMUOr = "CreateMultipartUploadOutput";
    _CMUR = "CompleteMultipartUploadResult";
    _CMURo = "CompleteMultipartUploadRequest";
    _CMURr = "CreateMultipartUploadRequest";
    _CMUo = "CompleteMultipartUpload";
    _CMUr = "CreateMultipartUpload";
    _CMh = "ChecksumMode";
    _CO = "CopyObject";
    _COO = "CopyObjectOutput";
    _COR = "CopyObjectResult";
    _CORSC = "CORSConfiguration";
    _CORSR = "CORSRules";
    _CORSRu = "CORSRule";
    _CORo = "CopyObjectRequest";
    _CP = "CommonPrefix";
    _CPL = "CommonPrefixList";
    _CPLo = "CompletedPartList";
    _CPR = "CopyPartResult";
    _CPo = "CompletedPart";
    _CPom = "CommonPrefixes";
    _CR = "ContentRange";
    _CRSBA = "ConfirmRemoveSelfBucketAccess";
    _CR_ = "Content-Range";
    _CS = "CopySource";
    _CSHA = "ChecksumSHA1";
    _CSHAh = "ChecksumSHA256";
    _CSIM = "CopySourceIfMatch";
    _CSIMS = "CopySourceIfModifiedSince";
    _CSINM = "CopySourceIfNoneMatch";
    _CSIUS = "CopySourceIfUnmodifiedSince";
    _CSO = "CreateSessionOutput";
    _CSR = "CreateSessionResult";
    _CSRo = "CopySourceRange";
    _CSRr = "CreateSessionRequest";
    _CSSSECA = "CopySourceSSECustomerAlgorithm";
    _CSSSECK = "CopySourceSSECustomerKey";
    _CSSSECKMD = "CopySourceSSECustomerKeyMD5";
    _CSV = "CSV";
    _CSVI = "CopySourceVersionId";
    _CSVIn = "CSVInput";
    _CSVO = "CSVOutput";
    _CSo = "ConfigurationState";
    _CSr = "CreateSession";
    _CT = "ChecksumType";
    _CT_ = "Content-Type";
    _CTl = "ClientToken";
    _CTo = "ContentType";
    _CTom = "CompressionType";
    _CTon = "ContinuationToken";
    _Co = "Condition";
    _Cod = "Code";
    _Com = "Comments";
    _Con = "Contents";
    _Cont = "Cont";
    _Cr = "Credentials";
    _D = "Days";
    _DAI = "DaysAfterInitiation";
    _DB = "DeleteBucket";
    _DBAC = "DeleteBucketAnalyticsConfiguration";
    _DBACR = "DeleteBucketAnalyticsConfigurationRequest";
    _DBC = "DeleteBucketCors";
    _DBCR = "DeleteBucketCorsRequest";
    _DBE = "DeleteBucketEncryption";
    _DBER = "DeleteBucketEncryptionRequest";
    _DBIC = "DeleteBucketInventoryConfiguration";
    _DBICR = "DeleteBucketInventoryConfigurationRequest";
    _DBITC = "DeleteBucketIntelligentTieringConfiguration";
    _DBITCR = "DeleteBucketIntelligentTieringConfigurationRequest";
    _DBL = "DeleteBucketLifecycle";
    _DBLR = "DeleteBucketLifecycleRequest";
    _DBMC = "DeleteBucketMetadataConfiguration";
    _DBMCR = "DeleteBucketMetadataConfigurationRequest";
    _DBMCRe = "DeleteBucketMetricsConfigurationRequest";
    _DBMCe = "DeleteBucketMetricsConfiguration";
    _DBMTC = "DeleteBucketMetadataTableConfiguration";
    _DBMTCR = "DeleteBucketMetadataTableConfigurationRequest";
    _DBOC = "DeleteBucketOwnershipControls";
    _DBOCR = "DeleteBucketOwnershipControlsRequest";
    _DBP = "DeleteBucketPolicy";
    _DBPR = "DeleteBucketPolicyRequest";
    _DBR = "DeleteBucketRequest";
    _DBRR = "DeleteBucketReplicationRequest";
    _DBRe = "DeleteBucketReplication";
    _DBT = "DeleteBucketTagging";
    _DBTR = "DeleteBucketTaggingRequest";
    _DBW = "DeleteBucketWebsite";
    _DBWR = "DeleteBucketWebsiteRequest";
    _DE = "DataExport";
    _DIM = "DestinationIfMatch";
    _DIMS = "DestinationIfModifiedSince";
    _DINM = "DestinationIfNoneMatch";
    _DIUS = "DestinationIfUnmodifiedSince";
    _DM = "DeleteMarker";
    _DME = "DeleteMarkerEntry";
    _DMR = "DeleteMarkerReplication";
    _DMVI = "DeleteMarkerVersionId";
    _DMe = "DeleteMarkers";
    _DN = "DisplayName";
    _DO = "DeletedObject";
    _DOO = "DeleteObjectOutput";
    _DOOe = "DeleteObjectsOutput";
    _DOR = "DeleteObjectRequest";
    _DORe = "DeleteObjectsRequest";
    _DOT = "DeleteObjectTagging";
    _DOTO = "DeleteObjectTaggingOutput";
    _DOTR = "DeleteObjectTaggingRequest";
    _DOe = "DeletedObjects";
    _DOel = "DeleteObject";
    _DOele = "DeleteObjects";
    _DPAB = "DeletePublicAccessBlock";
    _DPABR = "DeletePublicAccessBlockRequest";
    _DR = "DataRedundancy";
    _DRe = "DefaultRetention";
    _DRel = "DeleteResult";
    _DRes = "DestinationResult";
    _Da = "Date";
    _De = "Delete";
    _Del = "Deleted";
    _Deli = "Delimiter";
    _Des = "Destination";
    _Desc = "Description";
    _Det = "Details";
    _E = "Expiration";
    _EA = "EmailAddress";
    _EBC = "EventBridgeConfiguration";
    _EBO = "ExpectedBucketOwner";
    _EC = "EncryptionConfiguration";
    _ECr = "ErrorCode";
    _ED = "ErrorDetails";
    _EDr = "ErrorDocument";
    _EE = "EndEvent";
    _EH = "ExposeHeaders";
    _EHx = "ExposeHeader";
    _EM = "ErrorMessage";
    _EODM = "ExpiredObjectDeleteMarker";
    _EOR = "ExistingObjectReplication";
    _ES = "ExpiresString";
    _ESBO = "ExpectedSourceBucketOwner";
    _ET = "EncryptionType";
    _ETL = "EncryptionTypeList";
    _ETM = "EncryptionTypeMismatch";
    _ETa = "ETag";
    _ETn = "EncodingType";
    _ETv = "EventThreshold";
    _ETx = "ExpressionType";
    _En = "Encryption";
    _Ena = "Enabled";
    _End = "End";
    _Er = "Errors";
    _Err = "Error";
    _Ev = "Events";
    _Eve = "Event";
    _Ex = "Expires";
    _Exp = "Expression";
    _F = "Filter";
    _FD = "FieldDelimiter";
    _FHI = "FileHeaderInfo";
    _FO = "FetchOwner";
    _FR = "FilterRule";
    _FRL = "FilterRuleList";
    _FRi = "FilterRules";
    _Fi = "Field";
    _Fo = "Format";
    _Fr = "Frequency";
    _G = "Grants";
    _GBA = "GetBucketAbac";
    _GBAC = "GetBucketAccelerateConfiguration";
    _GBACO = "GetBucketAccelerateConfigurationOutput";
    _GBACOe = "GetBucketAnalyticsConfigurationOutput";
    _GBACR = "GetBucketAccelerateConfigurationRequest";
    _GBACRe = "GetBucketAnalyticsConfigurationRequest";
    _GBACe = "GetBucketAnalyticsConfiguration";
    _GBAO = "GetBucketAbacOutput";
    _GBAOe = "GetBucketAclOutput";
    _GBAR = "GetBucketAbacRequest";
    _GBARe = "GetBucketAclRequest";
    _GBAe = "GetBucketAcl";
    _GBC = "GetBucketCors";
    _GBCO = "GetBucketCorsOutput";
    _GBCR = "GetBucketCorsRequest";
    _GBE = "GetBucketEncryption";
    _GBEO = "GetBucketEncryptionOutput";
    _GBER = "GetBucketEncryptionRequest";
    _GBIC = "GetBucketInventoryConfiguration";
    _GBICO = "GetBucketInventoryConfigurationOutput";
    _GBICR = "GetBucketInventoryConfigurationRequest";
    _GBITC = "GetBucketIntelligentTieringConfiguration";
    _GBITCO = "GetBucketIntelligentTieringConfigurationOutput";
    _GBITCR = "GetBucketIntelligentTieringConfigurationRequest";
    _GBL = "GetBucketLocation";
    _GBLC = "GetBucketLifecycleConfiguration";
    _GBLCO = "GetBucketLifecycleConfigurationOutput";
    _GBLCR = "GetBucketLifecycleConfigurationRequest";
    _GBLO = "GetBucketLocationOutput";
    _GBLOe = "GetBucketLoggingOutput";
    _GBLR = "GetBucketLocationRequest";
    _GBLRe = "GetBucketLoggingRequest";
    _GBLe = "GetBucketLogging";
    _GBMC = "GetBucketMetadataConfiguration";
    _GBMCO = "GetBucketMetadataConfigurationOutput";
    _GBMCOe = "GetBucketMetricsConfigurationOutput";
    _GBMCR = "GetBucketMetadataConfigurationResult";
    _GBMCRe = "GetBucketMetadataConfigurationRequest";
    _GBMCRet = "GetBucketMetricsConfigurationRequest";
    _GBMCe = "GetBucketMetricsConfiguration";
    _GBMTC = "GetBucketMetadataTableConfiguration";
    _GBMTCO = "GetBucketMetadataTableConfigurationOutput";
    _GBMTCR = "GetBucketMetadataTableConfigurationResult";
    _GBMTCRe = "GetBucketMetadataTableConfigurationRequest";
    _GBNC = "GetBucketNotificationConfiguration";
    _GBNCR = "GetBucketNotificationConfigurationRequest";
    _GBOC = "GetBucketOwnershipControls";
    _GBOCO = "GetBucketOwnershipControlsOutput";
    _GBOCR = "GetBucketOwnershipControlsRequest";
    _GBP = "GetBucketPolicy";
    _GBPO = "GetBucketPolicyOutput";
    _GBPR = "GetBucketPolicyRequest";
    _GBPS = "GetBucketPolicyStatus";
    _GBPSO = "GetBucketPolicyStatusOutput";
    _GBPSR = "GetBucketPolicyStatusRequest";
    _GBR = "GetBucketReplication";
    _GBRO = "GetBucketReplicationOutput";
    _GBRP = "GetBucketRequestPayment";
    _GBRPO = "GetBucketRequestPaymentOutput";
    _GBRPR = "GetBucketRequestPaymentRequest";
    _GBRR = "GetBucketReplicationRequest";
    _GBT = "GetBucketTagging";
    _GBTO = "GetBucketTaggingOutput";
    _GBTR = "GetBucketTaggingRequest";
    _GBV = "GetBucketVersioning";
    _GBVO = "GetBucketVersioningOutput";
    _GBVR = "GetBucketVersioningRequest";
    _GBW = "GetBucketWebsite";
    _GBWO = "GetBucketWebsiteOutput";
    _GBWR = "GetBucketWebsiteRequest";
    _GFC = "GrantFullControl";
    _GJP = "GlacierJobParameters";
    _GO = "GetObject";
    _GOA = "GetObjectAcl";
    _GOAO = "GetObjectAclOutput";
    _GOAOe = "GetObjectAttributesOutput";
    _GOAP = "GetObjectAttributesParts";
    _GOAR = "GetObjectAclRequest";
    _GOARe = "GetObjectAttributesResponse";
    _GOARet = "GetObjectAttributesRequest";
    _GOAe = "GetObjectAttributes";
    _GOLC = "GetObjectLockConfiguration";
    _GOLCO = "GetObjectLockConfigurationOutput";
    _GOLCR = "GetObjectLockConfigurationRequest";
    _GOLH = "GetObjectLegalHold";
    _GOLHO = "GetObjectLegalHoldOutput";
    _GOLHR = "GetObjectLegalHoldRequest";
    _GOO = "GetObjectOutput";
    _GOR = "GetObjectRequest";
    _GORO = "GetObjectRetentionOutput";
    _GORR = "GetObjectRetentionRequest";
    _GORe = "GetObjectRetention";
    _GOT = "GetObjectTagging";
    _GOTO = "GetObjectTaggingOutput";
    _GOTOe = "GetObjectTorrentOutput";
    _GOTR = "GetObjectTaggingRequest";
    _GOTRe = "GetObjectTorrentRequest";
    _GOTe = "GetObjectTorrent";
    _GPAB = "GetPublicAccessBlock";
    _GPABO = "GetPublicAccessBlockOutput";
    _GPABR = "GetPublicAccessBlockRequest";
    _GR = "GrantRead";
    _GRACP = "GrantReadACP";
    _GW = "GrantWrite";
    _GWACP = "GrantWriteACP";
    _Gr = "Grant";
    _Gra = "Grantee";
    _HB = "HeadBucket";
    _HBO = "HeadBucketOutput";
    _HBR = "HeadBucketRequest";
    _HECRE = "HttpErrorCodeReturnedEquals";
    _HN = "HostName";
    _HO = "HeadObject";
    _HOO = "HeadObjectOutput";
    _HOR = "HeadObjectRequest";
    _HRC = "HttpRedirectCode";
    _I = "Id";
    _IC = "InventoryConfiguration";
    _ICL = "InventoryConfigurationList";
    _ID = "ID";
    _IDn = "IndexDocument";
    _IDnv = "InventoryDestination";
    _IE = "IsEnabled";
    _IEn = "InventoryEncryption";
    _IF = "InventoryFilter";
    _IL = "IsLatest";
    _IM = "IfMatch";
    _IMIT = "IfMatchInitiatedTime";
    _IMLMT = "IfMatchLastModifiedTime";
    _IMS = "IfMatchSize";
    _IMS_ = "If-Modified-Since";
    _IMSf = "IfModifiedSince";
    _IMUR = "InitiateMultipartUploadResult";
    _IM_ = "If-Match";
    _INM = "IfNoneMatch";
    _INM_ = "If-None-Match";
    _IOF = "InventoryOptionalFields";
    _IOS = "InvalidObjectState";
    _IOV = "IncludedObjectVersions";
    _IP = "IsPublic";
    _IPA = "IgnorePublicAcls";
    _IPM = "IdempotencyParameterMismatch";
    _IR = "InvalidRequest";
    _IRIP = "IsRestoreInProgress";
    _IS = "InputSerialization";
    _ISBD = "InventoryS3BucketDestination";
    _ISn = "InventorySchedule";
    _IT = "IsTruncated";
    _ITAO = "IntelligentTieringAndOperator";
    _ITC = "IntelligentTieringConfiguration";
    _ITCL = "IntelligentTieringConfigurationList";
    _ITCR = "InventoryTableConfigurationResult";
    _ITCU = "InventoryTableConfigurationUpdates";
    _ITCn = "InventoryTableConfiguration";
    _ITF = "IntelligentTieringFilter";
    _IUS = "IfUnmodifiedSince";
    _IUS_ = "If-Unmodified-Since";
    _IWO = "InvalidWriteOffset";
    _In = "Initiator";
    _Ini = "Initiated";
    _JSON = "JSON";
    _JSONI = "JSONInput";
    _JSONO = "JSONOutput";
    _JTC = "JournalTableConfiguration";
    _JTCR = "JournalTableConfigurationResult";
    _JTCU = "JournalTableConfigurationUpdates";
    _K = "Key";
    _KC = "KeyCount";
    _KI = "KeyId";
    _KKA = "KmsKeyArn";
    _KM = "KeyMarker";
    _KMSC = "KMSContext";
    _KMSKI = "KMSKeyId";
    _KMSMKID = "KMSMasterKeyID";
    _KPE = "KeyPrefixEquals";
    _L = "Location";
    _LAMBR = "ListAllMyBucketsResult";
    _LAMDBR = "ListAllMyDirectoryBucketsResult";
    _LB = "ListBuckets";
    _LBAC = "ListBucketAnalyticsConfigurations";
    _LBACO = "ListBucketAnalyticsConfigurationsOutput";
    _LBACR = "ListBucketAnalyticsConfigurationResult";
    _LBACRi = "ListBucketAnalyticsConfigurationsRequest";
    _LBIC = "ListBucketInventoryConfigurations";
    _LBICO = "ListBucketInventoryConfigurationsOutput";
    _LBICR = "ListBucketInventoryConfigurationsRequest";
    _LBITC = "ListBucketIntelligentTieringConfigurations";
    _LBITCO = "ListBucketIntelligentTieringConfigurationsOutput";
    _LBITCR = "ListBucketIntelligentTieringConfigurationsRequest";
    _LBMC = "ListBucketMetricsConfigurations";
    _LBMCO = "ListBucketMetricsConfigurationsOutput";
    _LBMCR = "ListBucketMetricsConfigurationsRequest";
    _LBO = "ListBucketsOutput";
    _LBR = "ListBucketsRequest";
    _LBRi = "ListBucketResult";
    _LC = "LocationConstraint";
    _LCi = "LifecycleConfiguration";
    _LDB = "ListDirectoryBuckets";
    _LDBO = "ListDirectoryBucketsOutput";
    _LDBR = "ListDirectoryBucketsRequest";
    _LE = "LoggingEnabled";
    _LEi = "LifecycleExpiration";
    _LFA = "LambdaFunctionArn";
    _LFC = "LambdaFunctionConfiguration";
    _LFCL = "LambdaFunctionConfigurationList";
    _LFCa = "LambdaFunctionConfigurations";
    _LH = "LegalHold";
    _LI = "LocationInfo";
    _LICR = "ListInventoryConfigurationsResult";
    _LM = "LastModified";
    _LMCR = "ListMetricsConfigurationsResult";
    _LMT = "LastModifiedTime";
    _LMU = "ListMultipartUploads";
    _LMUO = "ListMultipartUploadsOutput";
    _LMUR = "ListMultipartUploadsResult";
    _LMURi = "ListMultipartUploadsRequest";
    _LM_ = "Last-Modified";
    _LO = "ListObjects";
    _LOO = "ListObjectsOutput";
    _LOR = "ListObjectsRequest";
    _LOV = "ListObjectsV2";
    _LOVO = "ListObjectsV2Output";
    _LOVOi = "ListObjectVersionsOutput";
    _LOVR = "ListObjectsV2Request";
    _LOVRi = "ListObjectVersionsRequest";
    _LOVi = "ListObjectVersions";
    _LP = "ListParts";
    _LPO = "ListPartsOutput";
    _LPR = "ListPartsResult";
    _LPRi = "ListPartsRequest";
    _LR = "LifecycleRule";
    _LRAO = "LifecycleRuleAndOperator";
    _LRF = "LifecycleRuleFilter";
    _LRi = "LifecycleRules";
    _LVR = "ListVersionsResult";
    _M = "Metadata";
    _MAO = "MetricsAndOperator";
    _MAS = "MaxAgeSeconds";
    _MB = "MaxBuckets";
    _MC = "MetadataConfiguration";
    _MCL = "MetricsConfigurationList";
    _MCR = "MetadataConfigurationResult";
    _MCe = "MetricsConfiguration";
    _MD = "MetadataDirective";
    _MDB = "MaxDirectoryBuckets";
    _MDf = "MfaDelete";
    _ME = "MetadataEntry";
    _MF = "MetricsFilter";
    _MFA = "MFA";
    _MFAD = "MFADelete";
    _MK = "MaxKeys";
    _MM = "MissingMeta";
    _MOS = "MpuObjectSize";
    _MP = "MaxParts";
    _MTC = "MetadataTableConfiguration";
    _MTCR = "MetadataTableConfigurationResult";
    _MTEC = "MetadataTableEncryptionConfiguration";
    _MU = "MultipartUpload";
    _MUL = "MultipartUploadList";
    _MUa = "MaxUploads";
    _Ma = "Marker";
    _Me = "Metrics";
    _Mes = "Message";
    _Mi = "Minutes";
    _Mo = "Mode";
    _N = "Name";
    _NC = "NotificationConfiguration";
    _NCF = "NotificationConfigurationFilter";
    _NCT = "NextContinuationToken";
    _ND = "NoncurrentDays";
    _NF = "NotFound";
    _NKM = "NextKeyMarker";
    _NM = "NextMarker";
    _NNV = "NewerNoncurrentVersions";
    _NPNM = "NextPartNumberMarker";
    _NSB = "NoSuchBucket";
    _NSK = "NoSuchKey";
    _NSU = "NoSuchUpload";
    _NUIM = "NextUploadIdMarker";
    _NVE = "NoncurrentVersionExpiration";
    _NVIM = "NextVersionIdMarker";
    _NVT = "NoncurrentVersionTransitions";
    _NVTL = "NoncurrentVersionTransitionList";
    _NVTo = "NoncurrentVersionTransition";
    _O = "Owner";
    _OA = "ObjectAttributes";
    _OAIATE = "ObjectAlreadyInActiveTierError";
    _OC = "OwnershipControls";
    _OCR = "OwnershipControlsRule";
    _OCRw = "OwnershipControlsRules";
    _OF = "OptionalFields";
    _OI = "ObjectIdentifier";
    _OIL = "ObjectIdentifierList";
    _OL = "OutputLocation";
    _OLC = "ObjectLockConfiguration";
    _OLE = "ObjectLockEnabled";
    _OLEFB = "ObjectLockEnabledForBucket";
    _OLLH = "ObjectLockLegalHold";
    _OLLHS = "ObjectLockLegalHoldStatus";
    _OLM = "ObjectLockMode";
    _OLR = "ObjectLockRetention";
    _OLRUD = "ObjectLockRetainUntilDate";
    _OLRb = "ObjectLockRule";
    _OLb = "ObjectList";
    _ONIATE = "ObjectNotInActiveTierError";
    _OO = "ObjectOwnership";
    _OOA = "OptionalObjectAttributes";
    _OP = "ObjectParts";
    _OPb = "ObjectPart";
    _OS = "ObjectSize";
    _OSGT = "ObjectSizeGreaterThan";
    _OSLT = "ObjectSizeLessThan";
    _OSV = "OutputSchemaVersion";
    _OSu = "OutputSerialization";
    _OV = "ObjectVersion";
    _OVL = "ObjectVersionList";
    _Ob = "Objects";
    _Obj = "Object";
    _P = "Prefix";
    _PABC = "PublicAccessBlockConfiguration";
    _PBA = "PutBucketAbac";
    _PBAC = "PutBucketAccelerateConfiguration";
    _PBACR = "PutBucketAccelerateConfigurationRequest";
    _PBACRu = "PutBucketAnalyticsConfigurationRequest";
    _PBACu = "PutBucketAnalyticsConfiguration";
    _PBAR = "PutBucketAbacRequest";
    _PBARu = "PutBucketAclRequest";
    _PBAu = "PutBucketAcl";
    _PBC = "PutBucketCors";
    _PBCR = "PutBucketCorsRequest";
    _PBE = "PutBucketEncryption";
    _PBER = "PutBucketEncryptionRequest";
    _PBIC = "PutBucketInventoryConfiguration";
    _PBICR = "PutBucketInventoryConfigurationRequest";
    _PBITC = "PutBucketIntelligentTieringConfiguration";
    _PBITCR = "PutBucketIntelligentTieringConfigurationRequest";
    _PBL = "PutBucketLogging";
    _PBLC = "PutBucketLifecycleConfiguration";
    _PBLCO = "PutBucketLifecycleConfigurationOutput";
    _PBLCR = "PutBucketLifecycleConfigurationRequest";
    _PBLR = "PutBucketLoggingRequest";
    _PBMC = "PutBucketMetricsConfiguration";
    _PBMCR = "PutBucketMetricsConfigurationRequest";
    _PBNC = "PutBucketNotificationConfiguration";
    _PBNCR = "PutBucketNotificationConfigurationRequest";
    _PBOC = "PutBucketOwnershipControls";
    _PBOCR = "PutBucketOwnershipControlsRequest";
    _PBP = "PutBucketPolicy";
    _PBPR = "PutBucketPolicyRequest";
    _PBR = "PutBucketReplication";
    _PBRP = "PutBucketRequestPayment";
    _PBRPR = "PutBucketRequestPaymentRequest";
    _PBRR = "PutBucketReplicationRequest";
    _PBT = "PutBucketTagging";
    _PBTR = "PutBucketTaggingRequest";
    _PBV = "PutBucketVersioning";
    _PBVR = "PutBucketVersioningRequest";
    _PBW = "PutBucketWebsite";
    _PBWR = "PutBucketWebsiteRequest";
    _PC = "PartsCount";
    _PDS = "PartitionDateSource";
    _PE = "ProgressEvent";
    _PI = "ParquetInput";
    _PL = "PartsList";
    _PN = "PartNumber";
    _PNM = "PartNumberMarker";
    _PO = "PutObject";
    _POA = "PutObjectAcl";
    _POAO = "PutObjectAclOutput";
    _POAR = "PutObjectAclRequest";
    _POLC = "PutObjectLockConfiguration";
    _POLCO = "PutObjectLockConfigurationOutput";
    _POLCR = "PutObjectLockConfigurationRequest";
    _POLH = "PutObjectLegalHold";
    _POLHO = "PutObjectLegalHoldOutput";
    _POLHR = "PutObjectLegalHoldRequest";
    _POO = "PutObjectOutput";
    _POR = "PutObjectRequest";
    _PORO = "PutObjectRetentionOutput";
    _PORR = "PutObjectRetentionRequest";
    _PORu = "PutObjectRetention";
    _POT = "PutObjectTagging";
    _POTO = "PutObjectTaggingOutput";
    _POTR = "PutObjectTaggingRequest";
    _PP = "PartitionedPrefix";
    _PPAB = "PutPublicAccessBlock";
    _PPABR = "PutPublicAccessBlockRequest";
    _PS = "PolicyStatus";
    _Pa = "Parts";
    _Par = "Part";
    _Parq = "Parquet";
    _Pay = "Payer";
    _Payl = "Payload";
    _Pe = "Permission";
    _Po = "Policy";
    _Pr = "Progress";
    _Pri = "Priority";
    _Pro = "Protocol";
    _Q = "Quiet";
    _QA = "QueueArn";
    _QC = "QuoteCharacter";
    _QCL = "QueueConfigurationList";
    _QCu = "QueueConfigurations";
    _QCue = "QueueConfiguration";
    _QEC = "QuoteEscapeCharacter";
    _QF = "QuoteFields";
    _Qu = "Queue";
    _R = "Rules";
    _RART = "RedirectAllRequestsTo";
    _RC = "RequestCharged";
    _RCC = "ResponseCacheControl";
    _RCD = "ResponseContentDisposition";
    _RCE = "ResponseContentEncoding";
    _RCL = "ResponseContentLanguage";
    _RCT = "ResponseContentType";
    _RCe = "ReplicationConfiguration";
    _RD = "RecordDelimiter";
    _RE = "ResponseExpires";
    _RED = "RestoreExpiryDate";
    _REe = "RecordExpiration";
    _REec = "RecordsEvent";
    _RKKID = "ReplicaKmsKeyID";
    _RKPW = "ReplaceKeyPrefixWith";
    _RKW = "ReplaceKeyWith";
    _RM = "ReplicaModifications";
    _RO = "RenameObject";
    _ROO = "RenameObjectOutput";
    _ROOe = "RestoreObjectOutput";
    _ROP = "RestoreOutputPath";
    _ROR = "RenameObjectRequest";
    _RORe = "RestoreObjectRequest";
    _ROe = "RestoreObject";
    _RP = "RequestPayer";
    _RPB = "RestrictPublicBuckets";
    _RPC = "RequestPaymentConfiguration";
    _RPe = "RequestProgress";
    _RR = "RoutingRules";
    _RRAO = "ReplicationRuleAndOperator";
    _RRF = "ReplicationRuleFilter";
    _RRe = "ReplicationRule";
    _RRep = "ReplicationRules";
    _RReq = "RequestRoute";
    _RRes = "RestoreRequest";
    _RRo = "RoutingRule";
    _RS = "ReplicationStatus";
    _RSe = "RestoreStatus";
    _RSen = "RenameSource";
    _RT = "ReplicationTime";
    _RTV = "ReplicationTimeValue";
    _RTe = "RequestToken";
    _RUD = "RetainUntilDate";
    _Ra = "Range";
    _Re = "Restore";
    _Rec = "Records";
    _Red = "Redirect";
    _Ret = "Retention";
    _Ro = "Role";
    _Ru = "Rule";
    _S = "Status";
    _SA = "StartAfter";
    _SAK = "SecretAccessKey";
    _SAs = "SseAlgorithm";
    _SB = "StreamingBlob";
    _SBD = "S3BucketDestination";
    _SC = "StorageClass";
    _SCA = "StorageClassAnalysis";
    _SCADE = "StorageClassAnalysisDataExport";
    _SCV = "SessionCredentialValue";
    _SCe = "SessionCredentials";
    _SCt = "StatusCode";
    _SDV = "SkipDestinationValidation";
    _SE = "StatsEvent";
    _SIM = "SourceIfMatch";
    _SIMS = "SourceIfModifiedSince";
    _SINM = "SourceIfNoneMatch";
    _SIUS = "SourceIfUnmodifiedSince";
    _SK = "SSE-KMS";
    _SKEO = "SseKmsEncryptedObjects";
    _SKF = "S3KeyFilter";
    _SKe = "S3Key";
    _SL = "S3Location";
    _SM = "SessionMode";
    _SOC = "SelectObjectContent";
    _SOCES = "SelectObjectContentEventStream";
    _SOCO = "SelectObjectContentOutput";
    _SOCR = "SelectObjectContentRequest";
    _SP = "SelectParameters";
    _SPi = "SimplePrefix";
    _SR = "ScanRange";
    _SS = "SSE-S3";
    _SSC = "SourceSelectionCriteria";
    _SSE = "ServerSideEncryption";
    _SSEA = "SSEAlgorithm";
    _SSEBD = "ServerSideEncryptionByDefault";
    _SSEC = "ServerSideEncryptionConfiguration";
    _SSECA = "SSECustomerAlgorithm";
    _SSECK = "SSECustomerKey";
    _SSECKMD = "SSECustomerKeyMD5";
    _SSEKMS = "SSEKMS";
    _SSEKMSEC = "SSEKMSEncryptionContext";
    _SSEKMSKI = "SSEKMSKeyId";
    _SSER = "ServerSideEncryptionRule";
    _SSERe = "ServerSideEncryptionRules";
    _SSES = "SSES3";
    _ST = "SessionToken";
    _STD = "S3TablesDestination";
    _STDR = "S3TablesDestinationResult";
    _S_ = "S3";
    _Sc = "Schedule";
    _Si = "Size";
    _St = "Start";
    _Sta = "Stats";
    _Su = "Suffix";
    _T = "Tags";
    _TA = "TableArn";
    _TAo = "TopicArn";
    _TB = "TargetBucket";
    _TBA = "TableBucketArn";
    _TBT = "TableBucketType";
    _TC = "TagCount";
    _TCL = "TopicConfigurationList";
    _TCo = "TopicConfigurations";
    _TCop = "TopicConfiguration";
    _TD = "TaggingDirective";
    _TDMOS = "TransitionDefaultMinimumObjectSize";
    _TG = "TargetGrants";
    _TGa = "TargetGrant";
    _TL = "TieringList";
    _TLr = "TransitionList";
    _TMP = "TooManyParts";
    _TN = "TableNamespace";
    _TNa = "TableName";
    _TOKF = "TargetObjectKeyFormat";
    _TP = "TargetPrefix";
    _TPC = "TotalPartsCount";
    _TS = "TagSet";
    _TSa = "TableStatus";
    _Ta = "Tag";
    _Tag = "Tagging";
    _Ti = "Tier";
    _Tie = "Tierings";
    _Tier = "Tiering";
    _Tim = "Time";
    _To = "Token";
    _Top = "Topic";
    _Tr = "Transitions";
    _Tra = "Transition";
    _Ty = "Type";
    _U = "Uploads";
    _UBMITC = "UpdateBucketMetadataInventoryTableConfiguration";
    _UBMITCR = "UpdateBucketMetadataInventoryTableConfigurationRequest";
    _UBMJTC = "UpdateBucketMetadataJournalTableConfiguration";
    _UBMJTCR = "UpdateBucketMetadataJournalTableConfigurationRequest";
    _UI = "UploadId";
    _UIM = "UploadIdMarker";
    _UM = "UserMetadata";
    _UP = "UploadPart";
    _UPC = "UploadPartCopy";
    _UPCO = "UploadPartCopyOutput";
    _UPCR = "UploadPartCopyRequest";
    _UPO = "UploadPartOutput";
    _UPR = "UploadPartRequest";
    _URI = "URI";
    _Up = "Upload";
    _V = "Value";
    _VC = "VersioningConfiguration";
    _VI = "VersionId";
    _VIM = "VersionIdMarker";
    _Ve = "Versions";
    _Ver = "Version";
    _WC = "WebsiteConfiguration";
    _WGOR = "WriteGetObjectResponse";
    _WGORR = "WriteGetObjectResponseRequest";
    _WOB = "WriteOffsetBytes";
    _WRL = "WebsiteRedirectLocation";
    _Y = "Years";
    _ar = "accept-ranges";
    _br = "bucket-region";
    _c = "client";
    _ct = "continuation-token";
    _d = "delimiter";
    _e = "error";
    _eP = "eventPayload";
    _en = "endpoint";
    _et = "encoding-type";
    _fo = "fetch-owner";
    _h = "http";
    _hC = "httpChecksum";
    _hE = "httpError";
    _hH = "httpHeader";
    _hL = "hostLabel";
    _hP = "httpPayload";
    _hPH = "httpPrefixHeaders";
    _hQ = "httpQuery";
    _hi = "http://www.w3.org/2001/XMLSchema-instance";
    _i = "id";
    _iT = "idempotencyToken";
    _km = "key-marker";
    _m = "marker";
    _mb = "max-buckets";
    _mdb = "max-directory-buckets";
    _mk = "max-keys";
    _mp = "max-parts";
    _mu = "max-uploads";
    _p = "prefix";
    _pN = "partNumber";
    _pnm = "part-number-marker";
    _rcc = "response-cache-control";
    _rcd = "response-content-disposition";
    _rce = "response-content-encoding";
    _rcl = "response-content-language";
    _rct = "response-content-type";
    _re = "response-expires";
    _s = "streaming";
    _sa = "start-after";
    _sm = "smithy.ts.sdk.synthetic.com.amazonaws.s3";
    _uI = "uploadId";
    _uim = "upload-id-marker";
    _vI = "versionId";
    _vim = "version-id-marker";
    _x = "xsi";
    _xA = "xmlAttribute";
    _xF = "xmlFlattened";
    _xN = "xmlName";
    _xNm = "xmlNamespace";
    _xaa = "x-amz-acl";
    _xaad = "x-amz-abort-date";
    _xaapa = "x-amz-access-point-alias";
    _xaari = "x-amz-abort-rule-id";
    _xaas = "x-amz-archive-status";
    _xaba = "x-amz-bucket-arn";
    _xabgr = "x-amz-bypass-governance-retention";
    _xabln = "x-amz-bucket-location-name";
    _xablt = "x-amz-bucket-location-type";
    _xabole = "x-amz-bucket-object-lock-enabled";
    _xabolt = "x-amz-bucket-object-lock-token";
    _xabr = "x-amz-bucket-region";
    _xaca = "x-amz-checksum-algorithm";
    _xacc = "x-amz-checksum-crc32";
    _xacc_ = "x-amz-checksum-crc32c";
    _xacc__ = "x-amz-checksum-crc64nvme";
    _xacm = "x-amz-checksum-mode";
    _xacrsba = "x-amz-confirm-remove-self-bucket-access";
    _xacs = "x-amz-checksum-sha1";
    _xacs_ = "x-amz-checksum-sha256";
    _xacs__ = "x-amz-copy-source";
    _xacsim = "x-amz-copy-source-if-match";
    _xacsims = "x-amz-copy-source-if-modified-since";
    _xacsinm = "x-amz-copy-source-if-none-match";
    _xacsius = "x-amz-copy-source-if-unmodified-since";
    _xacsm = "x-amz-create-session-mode";
    _xacsr = "x-amz-copy-source-range";
    _xacssseca = "x-amz-copy-source-server-side-encryption-customer-algorithm";
    _xacssseck = "x-amz-copy-source-server-side-encryption-customer-key";
    _xacssseckM = "x-amz-copy-source-server-side-encryption-customer-key-MD5";
    _xacsvi = "x-amz-copy-source-version-id";
    _xact = "x-amz-checksum-type";
    _xact_ = "x-amz-client-token";
    _xadm = "x-amz-delete-marker";
    _xae = "x-amz-expiration";
    _xaebo = "x-amz-expected-bucket-owner";
    _xafec = "x-amz-fwd-error-code";
    _xafem = "x-amz-fwd-error-message";
    _xafhCC = "x-amz-fwd-header-Cache-Control";
    _xafhCD = "x-amz-fwd-header-Content-Disposition";
    _xafhCE = "x-amz-fwd-header-Content-Encoding";
    _xafhCL = "x-amz-fwd-header-Content-Language";
    _xafhCR = "x-amz-fwd-header-Content-Range";
    _xafhCT = "x-amz-fwd-header-Content-Type";
    _xafhE = "x-amz-fwd-header-ETag";
    _xafhE_ = "x-amz-fwd-header-Expires";
    _xafhLM = "x-amz-fwd-header-Last-Modified";
    _xafhar = "x-amz-fwd-header-accept-ranges";
    _xafhxacc = "x-amz-fwd-header-x-amz-checksum-crc32";
    _xafhxacc_ = "x-amz-fwd-header-x-amz-checksum-crc32c";
    _xafhxacc__ = "x-amz-fwd-header-x-amz-checksum-crc64nvme";
    _xafhxacs = "x-amz-fwd-header-x-amz-checksum-sha1";
    _xafhxacs_ = "x-amz-fwd-header-x-amz-checksum-sha256";
    _xafhxadm = "x-amz-fwd-header-x-amz-delete-marker";
    _xafhxae = "x-amz-fwd-header-x-amz-expiration";
    _xafhxamm = "x-amz-fwd-header-x-amz-missing-meta";
    _xafhxampc = "x-amz-fwd-header-x-amz-mp-parts-count";
    _xafhxaollh = "x-amz-fwd-header-x-amz-object-lock-legal-hold";
    _xafhxaolm = "x-amz-fwd-header-x-amz-object-lock-mode";
    _xafhxaolrud = "x-amz-fwd-header-x-amz-object-lock-retain-until-date";
    _xafhxar = "x-amz-fwd-header-x-amz-restore";
    _xafhxarc = "x-amz-fwd-header-x-amz-request-charged";
    _xafhxars = "x-amz-fwd-header-x-amz-replication-status";
    _xafhxasc = "x-amz-fwd-header-x-amz-storage-class";
    _xafhxasse = "x-amz-fwd-header-x-amz-server-side-encryption";
    _xafhxasseakki = "x-amz-fwd-header-x-amz-server-side-encryption-aws-kms-key-id";
    _xafhxassebke = "x-amz-fwd-header-x-amz-server-side-encryption-bucket-key-enabled";
    _xafhxasseca = "x-amz-fwd-header-x-amz-server-side-encryption-customer-algorithm";
    _xafhxasseckM = "x-amz-fwd-header-x-amz-server-side-encryption-customer-key-MD5";
    _xafhxatc = "x-amz-fwd-header-x-amz-tagging-count";
    _xafhxavi = "x-amz-fwd-header-x-amz-version-id";
    _xafs = "x-amz-fwd-status";
    _xagfc = "x-amz-grant-full-control";
    _xagr = "x-amz-grant-read";
    _xagra = "x-amz-grant-read-acp";
    _xagw = "x-amz-grant-write";
    _xagwa = "x-amz-grant-write-acp";
    _xaimit = "x-amz-if-match-initiated-time";
    _xaimlmt = "x-amz-if-match-last-modified-time";
    _xaims = "x-amz-if-match-size";
    _xam = "x-amz-meta-";
    _xam_ = "x-amz-mfa";
    _xamd = "x-amz-metadata-directive";
    _xamm = "x-amz-missing-meta";
    _xamos = "x-amz-mp-object-size";
    _xamp = "x-amz-max-parts";
    _xampc = "x-amz-mp-parts-count";
    _xaoa = "x-amz-object-attributes";
    _xaollh = "x-amz-object-lock-legal-hold";
    _xaolm = "x-amz-object-lock-mode";
    _xaolrud = "x-amz-object-lock-retain-until-date";
    _xaoo = "x-amz-object-ownership";
    _xaooa = "x-amz-optional-object-attributes";
    _xaos = "x-amz-object-size";
    _xapnm = "x-amz-part-number-marker";
    _xar = "x-amz-restore";
    _xarc = "x-amz-request-charged";
    _xarop = "x-amz-restore-output-path";
    _xarp = "x-amz-request-payer";
    _xarr = "x-amz-request-route";
    _xars = "x-amz-replication-status";
    _xars_ = "x-amz-rename-source";
    _xarsim = "x-amz-rename-source-if-match";
    _xarsims = "x-amz-rename-source-if-modified-since";
    _xarsinm = "x-amz-rename-source-if-none-match";
    _xarsius = "x-amz-rename-source-if-unmodified-since";
    _xart = "x-amz-request-token";
    _xasc = "x-amz-storage-class";
    _xasca = "x-amz-sdk-checksum-algorithm";
    _xasdv = "x-amz-skip-destination-validation";
    _xasebo = "x-amz-source-expected-bucket-owner";
    _xasse = "x-amz-server-side-encryption";
    _xasseakki = "x-amz-server-side-encryption-aws-kms-key-id";
    _xassebke = "x-amz-server-side-encryption-bucket-key-enabled";
    _xassec = "x-amz-server-side-encryption-context";
    _xasseca = "x-amz-server-side-encryption-customer-algorithm";
    _xasseck = "x-amz-server-side-encryption-customer-key";
    _xasseckM = "x-amz-server-side-encryption-customer-key-MD5";
    _xat = "x-amz-tagging";
    _xatc = "x-amz-tagging-count";
    _xatd = "x-amz-tagging-directive";
    _xatdmos = "x-amz-transition-default-minimum-object-size";
    _xavi = "x-amz-version-id";
    _xawob = "x-amz-write-offset-bytes";
    _xawrl = "x-amz-website-redirect-location";
    _xs = "xsi:type";
    n0 = "com.amazonaws.s3";
    CopySourceSSECustomerKey = [0, n0, _CSSSECK, 8, 0];
    SessionCredentialValue = [0, n0, _SCV, 8, 0];
    SSECustomerKey = [0, n0, _SSECK, 8, 0];
    SSEKMSEncryptionContext = [0, n0, _SSEKMSEC, 8, 0];
    SSEKMSKeyId = [0, n0, _SSEKMSKI, 8, 0];
    StreamingBlob = [0, n0, _SB, { [_s]: 1 }, 42];
    AbacStatus$ = [
      3,
      n0,
      _AS,
      0,
      [_S],
      [0]
    ];
    AbortIncompleteMultipartUpload$ = [
      3,
      n0,
      _AIMU,
      0,
      [_DAI],
      [1]
    ];
    AbortMultipartUploadOutput$ = [
      3,
      n0,
      _AMUO,
      0,
      [_RC],
      [[0, { [_hH]: _xarc }]]
    ];
    AbortMultipartUploadRequest$ = [
      3,
      n0,
      _AMUR,
      0,
      [_B, _K, _UI, _RP, _EBO, _IMIT],
      [[0, 1], [0, 1], [0, { [_hQ]: _uI }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }], [6, { [_hH]: _xaimit }]],
      3
    ];
    AccelerateConfiguration$ = [
      3,
      n0,
      _AC,
      0,
      [_S],
      [0]
    ];
    AccessControlPolicy$ = [
      3,
      n0,
      _ACP,
      0,
      [_G, _O],
      [[() => Grants, { [_xN]: _ACL }], () => Owner$]
    ];
    AccessControlTranslation$ = [
      3,
      n0,
      _ACT,
      0,
      [_O],
      [0],
      1
    ];
    AnalyticsAndOperator$ = [
      3,
      n0,
      _AAO,
      0,
      [_P, _T],
      [0, [() => TagSet, { [_xF]: 1, [_xN]: _Ta }]]
    ];
    AnalyticsConfiguration$ = [
      3,
      n0,
      _ACn,
      0,
      [_I, _SCA, _F],
      [0, () => StorageClassAnalysis$, [() => AnalyticsFilter$, 0]],
      2
    ];
    AnalyticsExportDestination$ = [
      3,
      n0,
      _AED,
      0,
      [_SBD],
      [() => AnalyticsS3BucketDestination$],
      1
    ];
    AnalyticsS3BucketDestination$ = [
      3,
      n0,
      _ASBD,
      0,
      [_Fo, _B, _BAI, _P],
      [0, 0, 0, 0],
      2
    ];
    BlockedEncryptionTypes$ = [
      3,
      n0,
      _BET,
      0,
      [_ET],
      [[() => EncryptionTypeList, { [_xF]: 1 }]]
    ];
    Bucket$ = [
      3,
      n0,
      _B,
      0,
      [_N, _CD, _BR, _BA],
      [0, 4, 0, 0]
    ];
    BucketAlreadyExists$ = [
      -3,
      n0,
      _BAE,
      { [_e]: _c, [_hE]: 409 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(BucketAlreadyExists$, BucketAlreadyExists);
    BucketAlreadyOwnedByYou$ = [
      -3,
      n0,
      _BAOBY,
      { [_e]: _c, [_hE]: 409 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(BucketAlreadyOwnedByYou$, BucketAlreadyOwnedByYou);
    BucketInfo$ = [
      3,
      n0,
      _BI,
      0,
      [_DR, _Ty],
      [0, 0]
    ];
    BucketLifecycleConfiguration$ = [
      3,
      n0,
      _BLC,
      0,
      [_R],
      [[() => LifecycleRules, { [_xF]: 1, [_xN]: _Ru }]],
      1
    ];
    BucketLoggingStatus$ = [
      3,
      n0,
      _BLS,
      0,
      [_LE],
      [[() => LoggingEnabled$, 0]]
    ];
    Checksum$ = [
      3,
      n0,
      _C,
      0,
      [_CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _CT],
      [0, 0, 0, 0, 0, 0]
    ];
    CommonPrefix$ = [
      3,
      n0,
      _CP,
      0,
      [_P],
      [0]
    ];
    CompletedMultipartUpload$ = [
      3,
      n0,
      _CMU,
      0,
      [_Pa],
      [[() => CompletedPartList, { [_xF]: 1, [_xN]: _Par }]]
    ];
    CompletedPart$ = [
      3,
      n0,
      _CPo,
      0,
      [_ETa, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _PN],
      [0, 0, 0, 0, 0, 0, 1]
    ];
    CompleteMultipartUploadOutput$ = [
      3,
      n0,
      _CMUO,
      { [_xN]: _CMUR },
      [_L, _B, _K, _E, _ETa, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _CT, _SSE, _VI, _SSEKMSKI, _BKE, _RC],
      [0, 0, 0, [0, { [_hH]: _xae }], 0, 0, 0, 0, 0, 0, 0, [0, { [_hH]: _xasse }], [0, { [_hH]: _xavi }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xarc }]]
    ];
    CompleteMultipartUploadRequest$ = [
      3,
      n0,
      _CMURo,
      0,
      [_B, _K, _UI, _MU, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _CT, _MOS, _RP, _EBO, _IM, _INM, _SSECA, _SSECK, _SSECKMD],
      [[0, 1], [0, 1], [0, { [_hQ]: _uI }], [() => CompletedMultipartUpload$, { [_hP]: 1, [_xN]: _CMUo }], [0, { [_hH]: _xacc }], [0, { [_hH]: _xacc_ }], [0, { [_hH]: _xacc__ }], [0, { [_hH]: _xacs }], [0, { [_hH]: _xacs_ }], [0, { [_hH]: _xact }], [1, { [_hH]: _xamos }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _IM_ }], [0, { [_hH]: _INM_ }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }]],
      3
    ];
    Condition$ = [
      3,
      n0,
      _Co,
      0,
      [_HECRE, _KPE],
      [0, 0]
    ];
    ContinuationEvent$ = [
      3,
      n0,
      _CE,
      0,
      [],
      []
    ];
    CopyObjectOutput$ = [
      3,
      n0,
      _COO,
      0,
      [_COR, _E, _CSVI, _VI, _SSE, _SSECA, _SSECKMD, _SSEKMSKI, _SSEKMSEC, _BKE, _RC],
      [[() => CopyObjectResult$, 16], [0, { [_hH]: _xae }], [0, { [_hH]: _xacsvi }], [0, { [_hH]: _xavi }], [0, { [_hH]: _xasse }], [0, { [_hH]: _xasseca }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xarc }]]
    ];
    CopyObjectRequest$ = [
      3,
      n0,
      _CORo,
      0,
      [_B, _CS, _K, _ACL_, _CC, _CA, _CDo, _CEo, _CL, _CTo, _CSIM, _CSIMS, _CSINM, _CSIUS, _Ex, _GFC, _GR, _GRACP, _GWACP, _IM, _INM, _M, _MD, _TD, _SSE, _SC, _WRL, _SSECA, _SSECK, _SSECKMD, _SSEKMSKI, _SSEKMSEC, _BKE, _CSSSECA, _CSSSECK, _CSSSECKMD, _RP, _Tag, _OLM, _OLRUD, _OLLHS, _EBO, _ESBO],
      [[0, 1], [0, { [_hH]: _xacs__ }], [0, 1], [0, { [_hH]: _xaa }], [0, { [_hH]: _CC_ }], [0, { [_hH]: _xaca }], [0, { [_hH]: _CD_ }], [0, { [_hH]: _CE_ }], [0, { [_hH]: _CL_ }], [0, { [_hH]: _CT_ }], [0, { [_hH]: _xacsim }], [4, { [_hH]: _xacsims }], [0, { [_hH]: _xacsinm }], [4, { [_hH]: _xacsius }], [4, { [_hH]: _Ex }], [0, { [_hH]: _xagfc }], [0, { [_hH]: _xagr }], [0, { [_hH]: _xagra }], [0, { [_hH]: _xagwa }], [0, { [_hH]: _IM_ }], [0, { [_hH]: _INM_ }], [128 | 0, { [_hPH]: _xam }], [0, { [_hH]: _xamd }], [0, { [_hH]: _xatd }], [0, { [_hH]: _xasse }], [0, { [_hH]: _xasc }], [0, { [_hH]: _xawrl }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xacssseca }], [() => CopySourceSSECustomerKey, { [_hH]: _xacssseck }], [0, { [_hH]: _xacssseckM }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xat }], [0, { [_hH]: _xaolm }], [5, { [_hH]: _xaolrud }], [0, { [_hH]: _xaollh }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xasebo }]],
      3
    ];
    CopyObjectResult$ = [
      3,
      n0,
      _COR,
      0,
      [_ETa, _LM, _CT, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh],
      [0, 4, 0, 0, 0, 0, 0, 0]
    ];
    CopyPartResult$ = [
      3,
      n0,
      _CPR,
      0,
      [_ETa, _LM, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh],
      [0, 4, 0, 0, 0, 0, 0]
    ];
    CORSConfiguration$ = [
      3,
      n0,
      _CORSC,
      0,
      [_CORSR],
      [[() => CORSRules, { [_xF]: 1, [_xN]: _CORSRu }]],
      1
    ];
    CORSRule$ = [
      3,
      n0,
      _CORSRu,
      0,
      [_AM, _AO, _ID, _AH, _EH, _MAS],
      [[64 | 0, { [_xF]: 1, [_xN]: _AMl }], [64 | 0, { [_xF]: 1, [_xN]: _AOl }], 0, [64 | 0, { [_xF]: 1, [_xN]: _AHl }], [64 | 0, { [_xF]: 1, [_xN]: _EHx }], 1],
      2
    ];
    CreateBucketConfiguration$ = [
      3,
      n0,
      _CBC,
      0,
      [_LC, _L, _B, _T],
      [0, () => LocationInfo$, () => BucketInfo$, [() => TagSet, 0]]
    ];
    CreateBucketMetadataConfigurationRequest$ = [
      3,
      n0,
      _CBMCR,
      0,
      [_B, _MC, _CMD, _CA, _EBO],
      [[0, 1], [() => MetadataConfiguration$, { [_hP]: 1, [_xN]: _MC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    CreateBucketMetadataTableConfigurationRequest$ = [
      3,
      n0,
      _CBMTCR,
      0,
      [_B, _MTC, _CMD, _CA, _EBO],
      [[0, 1], [() => MetadataTableConfiguration$, { [_hP]: 1, [_xN]: _MTC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    CreateBucketOutput$ = [
      3,
      n0,
      _CBO,
      0,
      [_L, _BA],
      [[0, { [_hH]: _L }], [0, { [_hH]: _xaba }]]
    ];
    CreateBucketRequest$ = [
      3,
      n0,
      _CBR,
      0,
      [_B, _ACL_, _CBC, _GFC, _GR, _GRACP, _GW, _GWACP, _OLEFB, _OO],
      [[0, 1], [0, { [_hH]: _xaa }], [() => CreateBucketConfiguration$, { [_hP]: 1, [_xN]: _CBC }], [0, { [_hH]: _xagfc }], [0, { [_hH]: _xagr }], [0, { [_hH]: _xagra }], [0, { [_hH]: _xagw }], [0, { [_hH]: _xagwa }], [2, { [_hH]: _xabole }], [0, { [_hH]: _xaoo }]],
      1
    ];
    CreateMultipartUploadOutput$ = [
      3,
      n0,
      _CMUOr,
      { [_xN]: _IMUR },
      [_AD, _ARI, _B, _K, _UI, _SSE, _SSECA, _SSECKMD, _SSEKMSKI, _SSEKMSEC, _BKE, _RC, _CA, _CT],
      [[4, { [_hH]: _xaad }], [0, { [_hH]: _xaari }], [0, { [_xN]: _B }], 0, 0, [0, { [_hH]: _xasse }], [0, { [_hH]: _xasseca }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xarc }], [0, { [_hH]: _xaca }], [0, { [_hH]: _xact }]]
    ];
    CreateMultipartUploadRequest$ = [
      3,
      n0,
      _CMURr,
      0,
      [_B, _K, _ACL_, _CC, _CDo, _CEo, _CL, _CTo, _Ex, _GFC, _GR, _GRACP, _GWACP, _M, _SSE, _SC, _WRL, _SSECA, _SSECK, _SSECKMD, _SSEKMSKI, _SSEKMSEC, _BKE, _RP, _Tag, _OLM, _OLRUD, _OLLHS, _EBO, _CA, _CT],
      [[0, 1], [0, 1], [0, { [_hH]: _xaa }], [0, { [_hH]: _CC_ }], [0, { [_hH]: _CD_ }], [0, { [_hH]: _CE_ }], [0, { [_hH]: _CL_ }], [0, { [_hH]: _CT_ }], [4, { [_hH]: _Ex }], [0, { [_hH]: _xagfc }], [0, { [_hH]: _xagr }], [0, { [_hH]: _xagra }], [0, { [_hH]: _xagwa }], [128 | 0, { [_hPH]: _xam }], [0, { [_hH]: _xasse }], [0, { [_hH]: _xasc }], [0, { [_hH]: _xawrl }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xat }], [0, { [_hH]: _xaolm }], [5, { [_hH]: _xaolrud }], [0, { [_hH]: _xaollh }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xaca }], [0, { [_hH]: _xact }]],
      2
    ];
    CreateSessionOutput$ = [
      3,
      n0,
      _CSO,
      { [_xN]: _CSR },
      [_Cr, _SSE, _SSEKMSKI, _SSEKMSEC, _BKE],
      [[() => SessionCredentials$, { [_xN]: _Cr }], [0, { [_hH]: _xasse }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }]],
      1
    ];
    CreateSessionRequest$ = [
      3,
      n0,
      _CSRr,
      0,
      [_B, _SM, _SSE, _SSEKMSKI, _SSEKMSEC, _BKE],
      [[0, 1], [0, { [_hH]: _xacsm }], [0, { [_hH]: _xasse }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }]],
      1
    ];
    CSVInput$ = [
      3,
      n0,
      _CSVIn,
      0,
      [_FHI, _Com, _QEC, _RD, _FD, _QC, _AQRD],
      [0, 0, 0, 0, 0, 0, 2]
    ];
    CSVOutput$ = [
      3,
      n0,
      _CSVO,
      0,
      [_QF, _QEC, _RD, _FD, _QC],
      [0, 0, 0, 0, 0]
    ];
    DefaultRetention$ = [
      3,
      n0,
      _DRe,
      0,
      [_Mo, _D, _Y],
      [0, 1, 1]
    ];
    Delete$ = [
      3,
      n0,
      _De,
      0,
      [_Ob, _Q],
      [[() => ObjectIdentifierList, { [_xF]: 1, [_xN]: _Obj }], 2],
      1
    ];
    DeleteBucketAnalyticsConfigurationRequest$ = [
      3,
      n0,
      _DBACR,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    DeleteBucketCorsRequest$ = [
      3,
      n0,
      _DBCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketEncryptionRequest$ = [
      3,
      n0,
      _DBER,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketIntelligentTieringConfigurationRequest$ = [
      3,
      n0,
      _DBITCR,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    DeleteBucketInventoryConfigurationRequest$ = [
      3,
      n0,
      _DBICR,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    DeleteBucketLifecycleRequest$ = [
      3,
      n0,
      _DBLR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketMetadataConfigurationRequest$ = [
      3,
      n0,
      _DBMCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketMetadataTableConfigurationRequest$ = [
      3,
      n0,
      _DBMTCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketMetricsConfigurationRequest$ = [
      3,
      n0,
      _DBMCRe,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    DeleteBucketOwnershipControlsRequest$ = [
      3,
      n0,
      _DBOCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketPolicyRequest$ = [
      3,
      n0,
      _DBPR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketReplicationRequest$ = [
      3,
      n0,
      _DBRR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketRequest$ = [
      3,
      n0,
      _DBR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketTaggingRequest$ = [
      3,
      n0,
      _DBTR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeleteBucketWebsiteRequest$ = [
      3,
      n0,
      _DBWR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    DeletedObject$ = [
      3,
      n0,
      _DO,
      0,
      [_K, _VI, _DM, _DMVI],
      [0, 0, 2, 0]
    ];
    DeleteMarkerEntry$ = [
      3,
      n0,
      _DME,
      0,
      [_O, _K, _VI, _IL, _LM],
      [() => Owner$, 0, 0, 2, 4]
    ];
    DeleteMarkerReplication$ = [
      3,
      n0,
      _DMR,
      0,
      [_S],
      [0]
    ];
    DeleteObjectOutput$ = [
      3,
      n0,
      _DOO,
      0,
      [_DM, _VI, _RC],
      [[2, { [_hH]: _xadm }], [0, { [_hH]: _xavi }], [0, { [_hH]: _xarc }]]
    ];
    DeleteObjectRequest$ = [
      3,
      n0,
      _DOR,
      0,
      [_B, _K, _MFA, _VI, _RP, _BGR, _EBO, _IM, _IMLMT, _IMS],
      [[0, 1], [0, 1], [0, { [_hH]: _xam_ }], [0, { [_hQ]: _vI }], [0, { [_hH]: _xarp }], [2, { [_hH]: _xabgr }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _IM_ }], [6, { [_hH]: _xaimlmt }], [1, { [_hH]: _xaims }]],
      2
    ];
    DeleteObjectsOutput$ = [
      3,
      n0,
      _DOOe,
      { [_xN]: _DRel },
      [_Del, _RC, _Er],
      [[() => DeletedObjects, { [_xF]: 1 }], [0, { [_hH]: _xarc }], [() => Errors, { [_xF]: 1, [_xN]: _Err }]]
    ];
    DeleteObjectsRequest$ = [
      3,
      n0,
      _DORe,
      0,
      [_B, _De, _MFA, _RP, _BGR, _EBO, _CA],
      [[0, 1], [() => Delete$, { [_hP]: 1, [_xN]: _De }], [0, { [_hH]: _xam_ }], [0, { [_hH]: _xarp }], [2, { [_hH]: _xabgr }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xasca }]],
      2
    ];
    DeleteObjectTaggingOutput$ = [
      3,
      n0,
      _DOTO,
      0,
      [_VI],
      [[0, { [_hH]: _xavi }]]
    ];
    DeleteObjectTaggingRequest$ = [
      3,
      n0,
      _DOTR,
      0,
      [_B, _K, _VI, _EBO],
      [[0, 1], [0, 1], [0, { [_hQ]: _vI }], [0, { [_hH]: _xaebo }]],
      2
    ];
    DeletePublicAccessBlockRequest$ = [
      3,
      n0,
      _DPABR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    Destination$ = [
      3,
      n0,
      _Des,
      0,
      [_B, _A, _SC, _ACT, _EC, _RT, _Me],
      [0, 0, 0, () => AccessControlTranslation$, () => EncryptionConfiguration$, () => ReplicationTime$, () => Metrics$],
      1
    ];
    DestinationResult$ = [
      3,
      n0,
      _DRes,
      0,
      [_TBT, _TBA, _TN],
      [0, 0, 0]
    ];
    Encryption$ = [
      3,
      n0,
      _En,
      0,
      [_ET, _KMSKI, _KMSC],
      [0, [() => SSEKMSKeyId, 0], 0],
      1
    ];
    EncryptionConfiguration$ = [
      3,
      n0,
      _EC,
      0,
      [_RKKID],
      [0]
    ];
    EncryptionTypeMismatch$ = [
      -3,
      n0,
      _ETM,
      { [_e]: _c, [_hE]: 400 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(EncryptionTypeMismatch$, EncryptionTypeMismatch);
    EndEvent$ = [
      3,
      n0,
      _EE,
      0,
      [],
      []
    ];
    _Error$ = [
      3,
      n0,
      _Err,
      0,
      [_K, _VI, _Cod, _Mes],
      [0, 0, 0, 0]
    ];
    ErrorDetails$ = [
      3,
      n0,
      _ED,
      0,
      [_ECr, _EM],
      [0, 0]
    ];
    ErrorDocument$ = [
      3,
      n0,
      _EDr,
      0,
      [_K],
      [0],
      1
    ];
    EventBridgeConfiguration$ = [
      3,
      n0,
      _EBC,
      0,
      [],
      []
    ];
    ExistingObjectReplication$ = [
      3,
      n0,
      _EOR,
      0,
      [_S],
      [0],
      1
    ];
    FilterRule$ = [
      3,
      n0,
      _FR,
      0,
      [_N, _V],
      [0, 0]
    ];
    GetBucketAbacOutput$ = [
      3,
      n0,
      _GBAO,
      0,
      [_AS],
      [[() => AbacStatus$, 16]]
    ];
    GetBucketAbacRequest$ = [
      3,
      n0,
      _GBAR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketAccelerateConfigurationOutput$ = [
      3,
      n0,
      _GBACO,
      { [_xN]: _AC },
      [_S, _RC],
      [0, [0, { [_hH]: _xarc }]]
    ];
    GetBucketAccelerateConfigurationRequest$ = [
      3,
      n0,
      _GBACR,
      0,
      [_B, _EBO, _RP],
      [[0, 1], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xarp }]],
      1
    ];
    GetBucketAclOutput$ = [
      3,
      n0,
      _GBAOe,
      { [_xN]: _ACP },
      [_O, _G],
      [() => Owner$, [() => Grants, { [_xN]: _ACL }]]
    ];
    GetBucketAclRequest$ = [
      3,
      n0,
      _GBARe,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketAnalyticsConfigurationOutput$ = [
      3,
      n0,
      _GBACOe,
      0,
      [_ACn],
      [[() => AnalyticsConfiguration$, 16]]
    ];
    GetBucketAnalyticsConfigurationRequest$ = [
      3,
      n0,
      _GBACRe,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetBucketCorsOutput$ = [
      3,
      n0,
      _GBCO,
      { [_xN]: _CORSC },
      [_CORSR],
      [[() => CORSRules, { [_xF]: 1, [_xN]: _CORSRu }]]
    ];
    GetBucketCorsRequest$ = [
      3,
      n0,
      _GBCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketEncryptionOutput$ = [
      3,
      n0,
      _GBEO,
      0,
      [_SSEC],
      [[() => ServerSideEncryptionConfiguration$, 16]]
    ];
    GetBucketEncryptionRequest$ = [
      3,
      n0,
      _GBER,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketIntelligentTieringConfigurationOutput$ = [
      3,
      n0,
      _GBITCO,
      0,
      [_ITC],
      [[() => IntelligentTieringConfiguration$, 16]]
    ];
    GetBucketIntelligentTieringConfigurationRequest$ = [
      3,
      n0,
      _GBITCR,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetBucketInventoryConfigurationOutput$ = [
      3,
      n0,
      _GBICO,
      0,
      [_IC],
      [[() => InventoryConfiguration$, 16]]
    ];
    GetBucketInventoryConfigurationRequest$ = [
      3,
      n0,
      _GBICR,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetBucketLifecycleConfigurationOutput$ = [
      3,
      n0,
      _GBLCO,
      { [_xN]: _LCi },
      [_R, _TDMOS],
      [[() => LifecycleRules, { [_xF]: 1, [_xN]: _Ru }], [0, { [_hH]: _xatdmos }]]
    ];
    GetBucketLifecycleConfigurationRequest$ = [
      3,
      n0,
      _GBLCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketLocationOutput$ = [
      3,
      n0,
      _GBLO,
      { [_xN]: _LC },
      [_LC],
      [0]
    ];
    GetBucketLocationRequest$ = [
      3,
      n0,
      _GBLR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketLoggingOutput$ = [
      3,
      n0,
      _GBLOe,
      { [_xN]: _BLS },
      [_LE],
      [[() => LoggingEnabled$, 0]]
    ];
    GetBucketLoggingRequest$ = [
      3,
      n0,
      _GBLRe,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketMetadataConfigurationOutput$ = [
      3,
      n0,
      _GBMCO,
      0,
      [_GBMCR],
      [[() => GetBucketMetadataConfigurationResult$, 16]]
    ];
    GetBucketMetadataConfigurationRequest$ = [
      3,
      n0,
      _GBMCRe,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketMetadataConfigurationResult$ = [
      3,
      n0,
      _GBMCR,
      0,
      [_MCR],
      [() => MetadataConfigurationResult$],
      1
    ];
    GetBucketMetadataTableConfigurationOutput$ = [
      3,
      n0,
      _GBMTCO,
      0,
      [_GBMTCR],
      [[() => GetBucketMetadataTableConfigurationResult$, 16]]
    ];
    GetBucketMetadataTableConfigurationRequest$ = [
      3,
      n0,
      _GBMTCRe,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketMetadataTableConfigurationResult$ = [
      3,
      n0,
      _GBMTCR,
      0,
      [_MTCR, _S, _Err],
      [() => MetadataTableConfigurationResult$, 0, () => ErrorDetails$],
      2
    ];
    GetBucketMetricsConfigurationOutput$ = [
      3,
      n0,
      _GBMCOe,
      0,
      [_MCe],
      [[() => MetricsConfiguration$, 16]]
    ];
    GetBucketMetricsConfigurationRequest$ = [
      3,
      n0,
      _GBMCRet,
      0,
      [_B, _I, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetBucketNotificationConfigurationRequest$ = [
      3,
      n0,
      _GBNCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketOwnershipControlsOutput$ = [
      3,
      n0,
      _GBOCO,
      0,
      [_OC],
      [[() => OwnershipControls$, 16]]
    ];
    GetBucketOwnershipControlsRequest$ = [
      3,
      n0,
      _GBOCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketPolicyOutput$ = [
      3,
      n0,
      _GBPO,
      0,
      [_Po],
      [[0, 16]]
    ];
    GetBucketPolicyRequest$ = [
      3,
      n0,
      _GBPR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketPolicyStatusOutput$ = [
      3,
      n0,
      _GBPSO,
      0,
      [_PS],
      [[() => PolicyStatus$, 16]]
    ];
    GetBucketPolicyStatusRequest$ = [
      3,
      n0,
      _GBPSR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketReplicationOutput$ = [
      3,
      n0,
      _GBRO,
      0,
      [_RCe],
      [[() => ReplicationConfiguration$, 16]]
    ];
    GetBucketReplicationRequest$ = [
      3,
      n0,
      _GBRR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketRequestPaymentOutput$ = [
      3,
      n0,
      _GBRPO,
      { [_xN]: _RPC },
      [_Pay],
      [0]
    ];
    GetBucketRequestPaymentRequest$ = [
      3,
      n0,
      _GBRPR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketTaggingOutput$ = [
      3,
      n0,
      _GBTO,
      { [_xN]: _Tag },
      [_TS],
      [[() => TagSet, 0]],
      1
    ];
    GetBucketTaggingRequest$ = [
      3,
      n0,
      _GBTR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketVersioningOutput$ = [
      3,
      n0,
      _GBVO,
      { [_xN]: _VC },
      [_S, _MFAD],
      [0, [0, { [_xN]: _MDf }]]
    ];
    GetBucketVersioningRequest$ = [
      3,
      n0,
      _GBVR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetBucketWebsiteOutput$ = [
      3,
      n0,
      _GBWO,
      { [_xN]: _WC },
      [_RART, _IDn, _EDr, _RR],
      [() => RedirectAllRequestsTo$, () => IndexDocument$, () => ErrorDocument$, [() => RoutingRules, 0]]
    ];
    GetBucketWebsiteRequest$ = [
      3,
      n0,
      _GBWR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetObjectAclOutput$ = [
      3,
      n0,
      _GOAO,
      { [_xN]: _ACP },
      [_O, _G, _RC],
      [() => Owner$, [() => Grants, { [_xN]: _ACL }], [0, { [_hH]: _xarc }]]
    ];
    GetObjectAclRequest$ = [
      3,
      n0,
      _GOAR,
      0,
      [_B, _K, _VI, _RP, _EBO],
      [[0, 1], [0, 1], [0, { [_hQ]: _vI }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetObjectAttributesOutput$ = [
      3,
      n0,
      _GOAOe,
      { [_xN]: _GOARe },
      [_DM, _LM, _VI, _RC, _ETa, _C, _OP, _SC, _OS],
      [[2, { [_hH]: _xadm }], [4, { [_hH]: _LM_ }], [0, { [_hH]: _xavi }], [0, { [_hH]: _xarc }], 0, () => Checksum$, [() => GetObjectAttributesParts$, 0], 0, 1]
    ];
    GetObjectAttributesParts$ = [
      3,
      n0,
      _GOAP,
      0,
      [_TPC, _PNM, _NPNM, _MP, _IT, _Pa],
      [[1, { [_xN]: _PC }], 0, 0, 1, 2, [() => PartsList, { [_xF]: 1, [_xN]: _Par }]]
    ];
    GetObjectAttributesRequest$ = [
      3,
      n0,
      _GOARet,
      0,
      [_B, _K, _OA, _VI, _MP, _PNM, _SSECA, _SSECK, _SSECKMD, _RP, _EBO],
      [[0, 1], [0, 1], [64 | 0, { [_hH]: _xaoa }], [0, { [_hQ]: _vI }], [1, { [_hH]: _xamp }], [0, { [_hH]: _xapnm }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }]],
      3
    ];
    GetObjectLegalHoldOutput$ = [
      3,
      n0,
      _GOLHO,
      0,
      [_LH],
      [[() => ObjectLockLegalHold$, { [_hP]: 1, [_xN]: _LH }]]
    ];
    GetObjectLegalHoldRequest$ = [
      3,
      n0,
      _GOLHR,
      0,
      [_B, _K, _VI, _RP, _EBO],
      [[0, 1], [0, 1], [0, { [_hQ]: _vI }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetObjectLockConfigurationOutput$ = [
      3,
      n0,
      _GOLCO,
      0,
      [_OLC],
      [[() => ObjectLockConfiguration$, 16]]
    ];
    GetObjectLockConfigurationRequest$ = [
      3,
      n0,
      _GOLCR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GetObjectOutput$ = [
      3,
      n0,
      _GOO,
      0,
      [_Bo, _DM, _AR, _E, _Re, _LM, _CLo, _ETa, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _CT, _MM, _VI, _CC, _CDo, _CEo, _CL, _CR, _CTo, _Ex, _ES, _WRL, _SSE, _M, _SSECA, _SSECKMD, _SSEKMSKI, _BKE, _SC, _RC, _RS, _PC, _TC, _OLM, _OLRUD, _OLLHS],
      [[() => StreamingBlob, 16], [2, { [_hH]: _xadm }], [0, { [_hH]: _ar }], [0, { [_hH]: _xae }], [0, { [_hH]: _xar }], [4, { [_hH]: _LM_ }], [1, { [_hH]: _CL__ }], [0, { [_hH]: _ETa }], [0, { [_hH]: _xacc }], [0, { [_hH]: _xacc_ }], [0, { [_hH]: _xacc__ }], [0, { [_hH]: _xacs }], [0, { [_hH]: _xacs_ }], [0, { [_hH]: _xact }], [1, { [_hH]: _xamm }], [0, { [_hH]: _xavi }], [0, { [_hH]: _CC_ }], [0, { [_hH]: _CD_ }], [0, { [_hH]: _CE_ }], [0, { [_hH]: _CL_ }], [0, { [_hH]: _CR_ }], [0, { [_hH]: _CT_ }], [4, { [_hH]: _Ex }], [0, { [_hH]: _ES }], [0, { [_hH]: _xawrl }], [0, { [_hH]: _xasse }], [128 | 0, { [_hPH]: _xam }], [0, { [_hH]: _xasseca }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xasc }], [0, { [_hH]: _xarc }], [0, { [_hH]: _xars }], [1, { [_hH]: _xampc }], [1, { [_hH]: _xatc }], [0, { [_hH]: _xaolm }], [5, { [_hH]: _xaolrud }], [0, { [_hH]: _xaollh }]]
    ];
    GetObjectRequest$ = [
      3,
      n0,
      _GOR,
      0,
      [_B, _K, _IM, _IMSf, _INM, _IUS, _Ra, _RCC, _RCD, _RCE, _RCL, _RCT, _RE, _VI, _SSECA, _SSECK, _SSECKMD, _RP, _PN, _EBO, _CMh],
      [[0, 1], [0, 1], [0, { [_hH]: _IM_ }], [4, { [_hH]: _IMS_ }], [0, { [_hH]: _INM_ }], [4, { [_hH]: _IUS_ }], [0, { [_hH]: _Ra }], [0, { [_hQ]: _rcc }], [0, { [_hQ]: _rcd }], [0, { [_hQ]: _rce }], [0, { [_hQ]: _rcl }], [0, { [_hQ]: _rct }], [6, { [_hQ]: _re }], [0, { [_hQ]: _vI }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [0, { [_hH]: _xarp }], [1, { [_hQ]: _pN }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xacm }]],
      2
    ];
    GetObjectRetentionOutput$ = [
      3,
      n0,
      _GORO,
      0,
      [_Ret],
      [[() => ObjectLockRetention$, { [_hP]: 1, [_xN]: _Ret }]]
    ];
    GetObjectRetentionRequest$ = [
      3,
      n0,
      _GORR,
      0,
      [_B, _K, _VI, _RP, _EBO],
      [[0, 1], [0, 1], [0, { [_hQ]: _vI }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetObjectTaggingOutput$ = [
      3,
      n0,
      _GOTO,
      { [_xN]: _Tag },
      [_TS, _VI],
      [[() => TagSet, 0], [0, { [_hH]: _xavi }]],
      1
    ];
    GetObjectTaggingRequest$ = [
      3,
      n0,
      _GOTR,
      0,
      [_B, _K, _VI, _EBO, _RP],
      [[0, 1], [0, 1], [0, { [_hQ]: _vI }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xarp }]],
      2
    ];
    GetObjectTorrentOutput$ = [
      3,
      n0,
      _GOTOe,
      0,
      [_Bo, _RC],
      [[() => StreamingBlob, 16], [0, { [_hH]: _xarc }]]
    ];
    GetObjectTorrentRequest$ = [
      3,
      n0,
      _GOTRe,
      0,
      [_B, _K, _RP, _EBO],
      [[0, 1], [0, 1], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }]],
      2
    ];
    GetPublicAccessBlockOutput$ = [
      3,
      n0,
      _GPABO,
      0,
      [_PABC],
      [[() => PublicAccessBlockConfiguration$, 16]]
    ];
    GetPublicAccessBlockRequest$ = [
      3,
      n0,
      _GPABR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    GlacierJobParameters$ = [
      3,
      n0,
      _GJP,
      0,
      [_Ti],
      [0],
      1
    ];
    Grant$ = [
      3,
      n0,
      _Gr,
      0,
      [_Gra, _Pe],
      [[() => Grantee$, { [_xNm]: [_x, _hi] }], 0]
    ];
    Grantee$ = [
      3,
      n0,
      _Gra,
      0,
      [_Ty, _DN, _EA, _ID, _URI],
      [[0, { [_xA]: 1, [_xN]: _xs }], 0, 0, 0, 0],
      1
    ];
    HeadBucketOutput$ = [
      3,
      n0,
      _HBO,
      0,
      [_BA, _BLT, _BLN, _BR, _APA],
      [[0, { [_hH]: _xaba }], [0, { [_hH]: _xablt }], [0, { [_hH]: _xabln }], [0, { [_hH]: _xabr }], [2, { [_hH]: _xaapa }]]
    ];
    HeadBucketRequest$ = [
      3,
      n0,
      _HBR,
      0,
      [_B, _EBO],
      [[0, 1], [0, { [_hH]: _xaebo }]],
      1
    ];
    HeadObjectOutput$ = [
      3,
      n0,
      _HOO,
      0,
      [_DM, _AR, _E, _Re, _ASr, _LM, _CLo, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _CT, _ETa, _MM, _VI, _CC, _CDo, _CEo, _CL, _CTo, _CR, _Ex, _ES, _WRL, _SSE, _M, _SSECA, _SSECKMD, _SSEKMSKI, _BKE, _SC, _RC, _RS, _PC, _TC, _OLM, _OLRUD, _OLLHS],
      [[2, { [_hH]: _xadm }], [0, { [_hH]: _ar }], [0, { [_hH]: _xae }], [0, { [_hH]: _xar }], [0, { [_hH]: _xaas }], [4, { [_hH]: _LM_ }], [1, { [_hH]: _CL__ }], [0, { [_hH]: _xacc }], [0, { [_hH]: _xacc_ }], [0, { [_hH]: _xacc__ }], [0, { [_hH]: _xacs }], [0, { [_hH]: _xacs_ }], [0, { [_hH]: _xact }], [0, { [_hH]: _ETa }], [1, { [_hH]: _xamm }], [0, { [_hH]: _xavi }], [0, { [_hH]: _CC_ }], [0, { [_hH]: _CD_ }], [0, { [_hH]: _CE_ }], [0, { [_hH]: _CL_ }], [0, { [_hH]: _CT_ }], [0, { [_hH]: _CR_ }], [4, { [_hH]: _Ex }], [0, { [_hH]: _ES }], [0, { [_hH]: _xawrl }], [0, { [_hH]: _xasse }], [128 | 0, { [_hPH]: _xam }], [0, { [_hH]: _xasseca }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xasc }], [0, { [_hH]: _xarc }], [0, { [_hH]: _xars }], [1, { [_hH]: _xampc }], [1, { [_hH]: _xatc }], [0, { [_hH]: _xaolm }], [5, { [_hH]: _xaolrud }], [0, { [_hH]: _xaollh }]]
    ];
    HeadObjectRequest$ = [
      3,
      n0,
      _HOR,
      0,
      [_B, _K, _IM, _IMSf, _INM, _IUS, _Ra, _RCC, _RCD, _RCE, _RCL, _RCT, _RE, _VI, _SSECA, _SSECK, _SSECKMD, _RP, _PN, _EBO, _CMh],
      [[0, 1], [0, 1], [0, { [_hH]: _IM_ }], [4, { [_hH]: _IMS_ }], [0, { [_hH]: _INM_ }], [4, { [_hH]: _IUS_ }], [0, { [_hH]: _Ra }], [0, { [_hQ]: _rcc }], [0, { [_hQ]: _rcd }], [0, { [_hQ]: _rce }], [0, { [_hQ]: _rcl }], [0, { [_hQ]: _rct }], [6, { [_hQ]: _re }], [0, { [_hQ]: _vI }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [0, { [_hH]: _xarp }], [1, { [_hQ]: _pN }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xacm }]],
      2
    ];
    IdempotencyParameterMismatch$ = [
      -3,
      n0,
      _IPM,
      { [_e]: _c, [_hE]: 400 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(IdempotencyParameterMismatch$, IdempotencyParameterMismatch);
    IndexDocument$ = [
      3,
      n0,
      _IDn,
      0,
      [_Su],
      [0],
      1
    ];
    Initiator$ = [
      3,
      n0,
      _In,
      0,
      [_ID, _DN],
      [0, 0]
    ];
    InputSerialization$ = [
      3,
      n0,
      _IS,
      0,
      [_CSV, _CTom, _JSON, _Parq],
      [() => CSVInput$, 0, () => JSONInput$, () => ParquetInput$]
    ];
    IntelligentTieringAndOperator$ = [
      3,
      n0,
      _ITAO,
      0,
      [_P, _T],
      [0, [() => TagSet, { [_xF]: 1, [_xN]: _Ta }]]
    ];
    IntelligentTieringConfiguration$ = [
      3,
      n0,
      _ITC,
      0,
      [_I, _S, _Tie, _F],
      [0, 0, [() => TieringList, { [_xF]: 1, [_xN]: _Tier }], [() => IntelligentTieringFilter$, 0]],
      3
    ];
    IntelligentTieringFilter$ = [
      3,
      n0,
      _ITF,
      0,
      [_P, _Ta, _An],
      [0, () => Tag$, [() => IntelligentTieringAndOperator$, 0]]
    ];
    InvalidObjectState$ = [
      -3,
      n0,
      _IOS,
      { [_e]: _c, [_hE]: 403 },
      [_SC, _AT],
      [0, 0]
    ];
    TypeRegistry.for(n0).registerError(InvalidObjectState$, InvalidObjectState);
    InvalidRequest$ = [
      -3,
      n0,
      _IR,
      { [_e]: _c, [_hE]: 400 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(InvalidRequest$, InvalidRequest);
    InvalidWriteOffset$ = [
      -3,
      n0,
      _IWO,
      { [_e]: _c, [_hE]: 400 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(InvalidWriteOffset$, InvalidWriteOffset);
    InventoryConfiguration$ = [
      3,
      n0,
      _IC,
      0,
      [_Des, _IE, _I, _IOV, _Sc, _F, _OF],
      [[() => InventoryDestination$, 0], 2, 0, 0, () => InventorySchedule$, () => InventoryFilter$, [() => InventoryOptionalFields, 0]],
      5
    ];
    InventoryDestination$ = [
      3,
      n0,
      _IDnv,
      0,
      [_SBD],
      [[() => InventoryS3BucketDestination$, 0]],
      1
    ];
    InventoryEncryption$ = [
      3,
      n0,
      _IEn,
      0,
      [_SSES, _SSEKMS],
      [[() => SSES3$, { [_xN]: _SS }], [() => SSEKMS$, { [_xN]: _SK }]]
    ];
    InventoryFilter$ = [
      3,
      n0,
      _IF,
      0,
      [_P],
      [0],
      1
    ];
    InventoryS3BucketDestination$ = [
      3,
      n0,
      _ISBD,
      0,
      [_B, _Fo, _AI, _P, _En],
      [0, 0, 0, 0, [() => InventoryEncryption$, 0]],
      2
    ];
    InventorySchedule$ = [
      3,
      n0,
      _ISn,
      0,
      [_Fr],
      [0],
      1
    ];
    InventoryTableConfiguration$ = [
      3,
      n0,
      _ITCn,
      0,
      [_CSo, _EC],
      [0, () => MetadataTableEncryptionConfiguration$],
      1
    ];
    InventoryTableConfigurationResult$ = [
      3,
      n0,
      _ITCR,
      0,
      [_CSo, _TSa, _Err, _TNa, _TA],
      [0, 0, () => ErrorDetails$, 0, 0],
      1
    ];
    InventoryTableConfigurationUpdates$ = [
      3,
      n0,
      _ITCU,
      0,
      [_CSo, _EC],
      [0, () => MetadataTableEncryptionConfiguration$],
      1
    ];
    JournalTableConfiguration$ = [
      3,
      n0,
      _JTC,
      0,
      [_REe, _EC],
      [() => RecordExpiration$, () => MetadataTableEncryptionConfiguration$],
      1
    ];
    JournalTableConfigurationResult$ = [
      3,
      n0,
      _JTCR,
      0,
      [_TSa, _TNa, _REe, _Err, _TA],
      [0, 0, () => RecordExpiration$, () => ErrorDetails$, 0],
      3
    ];
    JournalTableConfigurationUpdates$ = [
      3,
      n0,
      _JTCU,
      0,
      [_REe],
      [() => RecordExpiration$],
      1
    ];
    JSONInput$ = [
      3,
      n0,
      _JSONI,
      0,
      [_Ty],
      [0]
    ];
    JSONOutput$ = [
      3,
      n0,
      _JSONO,
      0,
      [_RD],
      [0]
    ];
    LambdaFunctionConfiguration$ = [
      3,
      n0,
      _LFC,
      0,
      [_LFA, _Ev, _I, _F],
      [[0, { [_xN]: _CF }], [64 | 0, { [_xF]: 1, [_xN]: _Eve }], 0, [() => NotificationConfigurationFilter$, 0]],
      2
    ];
    LifecycleExpiration$ = [
      3,
      n0,
      _LEi,
      0,
      [_Da, _D, _EODM],
      [5, 1, 2]
    ];
    LifecycleRule$ = [
      3,
      n0,
      _LR,
      0,
      [_S, _E, _ID, _P, _F, _Tr, _NVT, _NVE, _AIMU],
      [0, () => LifecycleExpiration$, 0, 0, [() => LifecycleRuleFilter$, 0], [() => TransitionList, { [_xF]: 1, [_xN]: _Tra }], [() => NoncurrentVersionTransitionList, { [_xF]: 1, [_xN]: _NVTo }], () => NoncurrentVersionExpiration$, () => AbortIncompleteMultipartUpload$],
      1
    ];
    LifecycleRuleAndOperator$ = [
      3,
      n0,
      _LRAO,
      0,
      [_P, _T, _OSGT, _OSLT],
      [0, [() => TagSet, { [_xF]: 1, [_xN]: _Ta }], 1, 1]
    ];
    LifecycleRuleFilter$ = [
      3,
      n0,
      _LRF,
      0,
      [_P, _Ta, _OSGT, _OSLT, _An],
      [0, () => Tag$, 1, 1, [() => LifecycleRuleAndOperator$, 0]]
    ];
    ListBucketAnalyticsConfigurationsOutput$ = [
      3,
      n0,
      _LBACO,
      { [_xN]: _LBACR },
      [_IT, _CTon, _NCT, _ACLn],
      [2, 0, 0, [() => AnalyticsConfigurationList, { [_xF]: 1, [_xN]: _ACn }]]
    ];
    ListBucketAnalyticsConfigurationsRequest$ = [
      3,
      n0,
      _LBACRi,
      0,
      [_B, _CTon, _EBO],
      [[0, 1], [0, { [_hQ]: _ct }], [0, { [_hH]: _xaebo }]],
      1
    ];
    ListBucketIntelligentTieringConfigurationsOutput$ = [
      3,
      n0,
      _LBITCO,
      0,
      [_IT, _CTon, _NCT, _ITCL],
      [2, 0, 0, [() => IntelligentTieringConfigurationList, { [_xF]: 1, [_xN]: _ITC }]]
    ];
    ListBucketIntelligentTieringConfigurationsRequest$ = [
      3,
      n0,
      _LBITCR,
      0,
      [_B, _CTon, _EBO],
      [[0, 1], [0, { [_hQ]: _ct }], [0, { [_hH]: _xaebo }]],
      1
    ];
    ListBucketInventoryConfigurationsOutput$ = [
      3,
      n0,
      _LBICO,
      { [_xN]: _LICR },
      [_CTon, _ICL, _IT, _NCT],
      [0, [() => InventoryConfigurationList, { [_xF]: 1, [_xN]: _IC }], 2, 0]
    ];
    ListBucketInventoryConfigurationsRequest$ = [
      3,
      n0,
      _LBICR,
      0,
      [_B, _CTon, _EBO],
      [[0, 1], [0, { [_hQ]: _ct }], [0, { [_hH]: _xaebo }]],
      1
    ];
    ListBucketMetricsConfigurationsOutput$ = [
      3,
      n0,
      _LBMCO,
      { [_xN]: _LMCR },
      [_IT, _CTon, _NCT, _MCL],
      [2, 0, 0, [() => MetricsConfigurationList, { [_xF]: 1, [_xN]: _MCe }]]
    ];
    ListBucketMetricsConfigurationsRequest$ = [
      3,
      n0,
      _LBMCR,
      0,
      [_B, _CTon, _EBO],
      [[0, 1], [0, { [_hQ]: _ct }], [0, { [_hH]: _xaebo }]],
      1
    ];
    ListBucketsOutput$ = [
      3,
      n0,
      _LBO,
      { [_xN]: _LAMBR },
      [_Bu, _O, _CTon, _P],
      [[() => Buckets, 0], () => Owner$, 0, 0]
    ];
    ListBucketsRequest$ = [
      3,
      n0,
      _LBR,
      0,
      [_MB, _CTon, _P, _BR],
      [[1, { [_hQ]: _mb }], [0, { [_hQ]: _ct }], [0, { [_hQ]: _p }], [0, { [_hQ]: _br }]]
    ];
    ListDirectoryBucketsOutput$ = [
      3,
      n0,
      _LDBO,
      { [_xN]: _LAMDBR },
      [_Bu, _CTon],
      [[() => Buckets, 0], 0]
    ];
    ListDirectoryBucketsRequest$ = [
      3,
      n0,
      _LDBR,
      0,
      [_CTon, _MDB],
      [[0, { [_hQ]: _ct }], [1, { [_hQ]: _mdb }]]
    ];
    ListMultipartUploadsOutput$ = [
      3,
      n0,
      _LMUO,
      { [_xN]: _LMUR },
      [_B, _KM, _UIM, _NKM, _P, _Deli, _NUIM, _MUa, _IT, _U, _CPom, _ETn, _RC],
      [0, 0, 0, 0, 0, 0, 0, 1, 2, [() => MultipartUploadList, { [_xF]: 1, [_xN]: _Up }], [() => CommonPrefixList, { [_xF]: 1 }], 0, [0, { [_hH]: _xarc }]]
    ];
    ListMultipartUploadsRequest$ = [
      3,
      n0,
      _LMURi,
      0,
      [_B, _Deli, _ETn, _KM, _MUa, _P, _UIM, _EBO, _RP],
      [[0, 1], [0, { [_hQ]: _d }], [0, { [_hQ]: _et }], [0, { [_hQ]: _km }], [1, { [_hQ]: _mu }], [0, { [_hQ]: _p }], [0, { [_hQ]: _uim }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xarp }]],
      1
    ];
    ListObjectsOutput$ = [
      3,
      n0,
      _LOO,
      { [_xN]: _LBRi },
      [_IT, _Ma, _NM, _Con, _N, _P, _Deli, _MK, _CPom, _ETn, _RC],
      [2, 0, 0, [() => ObjectList, { [_xF]: 1 }], 0, 0, 0, 1, [() => CommonPrefixList, { [_xF]: 1 }], 0, [0, { [_hH]: _xarc }]]
    ];
    ListObjectsRequest$ = [
      3,
      n0,
      _LOR,
      0,
      [_B, _Deli, _ETn, _Ma, _MK, _P, _RP, _EBO, _OOA],
      [[0, 1], [0, { [_hQ]: _d }], [0, { [_hQ]: _et }], [0, { [_hQ]: _m }], [1, { [_hQ]: _mk }], [0, { [_hQ]: _p }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }], [64 | 0, { [_hH]: _xaooa }]],
      1
    ];
    ListObjectsV2Output$ = [
      3,
      n0,
      _LOVO,
      { [_xN]: _LBRi },
      [_IT, _Con, _N, _P, _Deli, _MK, _CPom, _ETn, _KC, _CTon, _NCT, _SA, _RC],
      [2, [() => ObjectList, { [_xF]: 1 }], 0, 0, 0, 1, [() => CommonPrefixList, { [_xF]: 1 }], 0, 1, 0, 0, 0, [0, { [_hH]: _xarc }]]
    ];
    ListObjectsV2Request$ = [
      3,
      n0,
      _LOVR,
      0,
      [_B, _Deli, _ETn, _MK, _P, _CTon, _FO, _SA, _RP, _EBO, _OOA],
      [[0, 1], [0, { [_hQ]: _d }], [0, { [_hQ]: _et }], [1, { [_hQ]: _mk }], [0, { [_hQ]: _p }], [0, { [_hQ]: _ct }], [2, { [_hQ]: _fo }], [0, { [_hQ]: _sa }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }], [64 | 0, { [_hH]: _xaooa }]],
      1
    ];
    ListObjectVersionsOutput$ = [
      3,
      n0,
      _LOVOi,
      { [_xN]: _LVR },
      [_IT, _KM, _VIM, _NKM, _NVIM, _Ve, _DMe, _N, _P, _Deli, _MK, _CPom, _ETn, _RC],
      [2, 0, 0, 0, 0, [() => ObjectVersionList, { [_xF]: 1, [_xN]: _Ver }], [() => DeleteMarkers, { [_xF]: 1, [_xN]: _DM }], 0, 0, 0, 1, [() => CommonPrefixList, { [_xF]: 1 }], 0, [0, { [_hH]: _xarc }]]
    ];
    ListObjectVersionsRequest$ = [
      3,
      n0,
      _LOVRi,
      0,
      [_B, _Deli, _ETn, _KM, _MK, _P, _VIM, _EBO, _RP, _OOA],
      [[0, 1], [0, { [_hQ]: _d }], [0, { [_hQ]: _et }], [0, { [_hQ]: _km }], [1, { [_hQ]: _mk }], [0, { [_hQ]: _p }], [0, { [_hQ]: _vim }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xarp }], [64 | 0, { [_hH]: _xaooa }]],
      1
    ];
    ListPartsOutput$ = [
      3,
      n0,
      _LPO,
      { [_xN]: _LPR },
      [_AD, _ARI, _B, _K, _UI, _PNM, _NPNM, _MP, _IT, _Pa, _In, _O, _SC, _RC, _CA, _CT],
      [[4, { [_hH]: _xaad }], [0, { [_hH]: _xaari }], 0, 0, 0, 0, 0, 1, 2, [() => Parts, { [_xF]: 1, [_xN]: _Par }], () => Initiator$, () => Owner$, 0, [0, { [_hH]: _xarc }], 0, 0]
    ];
    ListPartsRequest$ = [
      3,
      n0,
      _LPRi,
      0,
      [_B, _K, _UI, _MP, _PNM, _RP, _EBO, _SSECA, _SSECK, _SSECKMD],
      [[0, 1], [0, 1], [0, { [_hQ]: _uI }], [1, { [_hQ]: _mp }], [0, { [_hQ]: _pnm }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }]],
      3
    ];
    LocationInfo$ = [
      3,
      n0,
      _LI,
      0,
      [_Ty, _N],
      [0, 0]
    ];
    LoggingEnabled$ = [
      3,
      n0,
      _LE,
      0,
      [_TB, _TP, _TG, _TOKF],
      [0, 0, [() => TargetGrants, 0], [() => TargetObjectKeyFormat$, 0]],
      2
    ];
    MetadataConfiguration$ = [
      3,
      n0,
      _MC,
      0,
      [_JTC, _ITCn],
      [() => JournalTableConfiguration$, () => InventoryTableConfiguration$],
      1
    ];
    MetadataConfigurationResult$ = [
      3,
      n0,
      _MCR,
      0,
      [_DRes, _JTCR, _ITCR],
      [() => DestinationResult$, () => JournalTableConfigurationResult$, () => InventoryTableConfigurationResult$],
      1
    ];
    MetadataEntry$ = [
      3,
      n0,
      _ME,
      0,
      [_N, _V],
      [0, 0]
    ];
    MetadataTableConfiguration$ = [
      3,
      n0,
      _MTC,
      0,
      [_STD],
      [() => S3TablesDestination$],
      1
    ];
    MetadataTableConfigurationResult$ = [
      3,
      n0,
      _MTCR,
      0,
      [_STDR],
      [() => S3TablesDestinationResult$],
      1
    ];
    MetadataTableEncryptionConfiguration$ = [
      3,
      n0,
      _MTEC,
      0,
      [_SAs, _KKA],
      [0, 0],
      1
    ];
    Metrics$ = [
      3,
      n0,
      _Me,
      0,
      [_S, _ETv],
      [0, () => ReplicationTimeValue$],
      1
    ];
    MetricsAndOperator$ = [
      3,
      n0,
      _MAO,
      0,
      [_P, _T, _APAc],
      [0, [() => TagSet, { [_xF]: 1, [_xN]: _Ta }], 0]
    ];
    MetricsConfiguration$ = [
      3,
      n0,
      _MCe,
      0,
      [_I, _F],
      [0, [() => MetricsFilter$, 0]],
      1
    ];
    MultipartUpload$ = [
      3,
      n0,
      _MU,
      0,
      [_UI, _K, _Ini, _SC, _O, _In, _CA, _CT],
      [0, 0, 4, 0, () => Owner$, () => Initiator$, 0, 0]
    ];
    NoncurrentVersionExpiration$ = [
      3,
      n0,
      _NVE,
      0,
      [_ND, _NNV],
      [1, 1]
    ];
    NoncurrentVersionTransition$ = [
      3,
      n0,
      _NVTo,
      0,
      [_ND, _SC, _NNV],
      [1, 0, 1]
    ];
    NoSuchBucket$ = [
      -3,
      n0,
      _NSB,
      { [_e]: _c, [_hE]: 404 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(NoSuchBucket$, NoSuchBucket);
    NoSuchKey$ = [
      -3,
      n0,
      _NSK,
      { [_e]: _c, [_hE]: 404 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(NoSuchKey$, NoSuchKey);
    NoSuchUpload$ = [
      -3,
      n0,
      _NSU,
      { [_e]: _c, [_hE]: 404 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(NoSuchUpload$, NoSuchUpload);
    NotFound$ = [
      -3,
      n0,
      _NF,
      { [_e]: _c },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(NotFound$, NotFound);
    NotificationConfiguration$ = [
      3,
      n0,
      _NC,
      0,
      [_TCo, _QCu, _LFCa, _EBC],
      [[() => TopicConfigurationList, { [_xF]: 1, [_xN]: _TCop }], [() => QueueConfigurationList, { [_xF]: 1, [_xN]: _QCue }], [() => LambdaFunctionConfigurationList, { [_xF]: 1, [_xN]: _CFC }], () => EventBridgeConfiguration$]
    ];
    NotificationConfigurationFilter$ = [
      3,
      n0,
      _NCF,
      0,
      [_K],
      [[() => S3KeyFilter$, { [_xN]: _SKe }]]
    ];
    _Object$ = [
      3,
      n0,
      _Obj,
      0,
      [_K, _LM, _ETa, _CA, _CT, _Si, _SC, _O, _RSe],
      [0, 4, 0, [64 | 0, { [_xF]: 1 }], 0, 1, 0, () => Owner$, () => RestoreStatus$]
    ];
    ObjectAlreadyInActiveTierError$ = [
      -3,
      n0,
      _OAIATE,
      { [_e]: _c, [_hE]: 403 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(ObjectAlreadyInActiveTierError$, ObjectAlreadyInActiveTierError);
    ObjectIdentifier$ = [
      3,
      n0,
      _OI,
      0,
      [_K, _VI, _ETa, _LMT, _Si],
      [0, 0, 0, 6, 1],
      1
    ];
    ObjectLockConfiguration$ = [
      3,
      n0,
      _OLC,
      0,
      [_OLE, _Ru],
      [0, () => ObjectLockRule$]
    ];
    ObjectLockLegalHold$ = [
      3,
      n0,
      _OLLH,
      0,
      [_S],
      [0]
    ];
    ObjectLockRetention$ = [
      3,
      n0,
      _OLR,
      0,
      [_Mo, _RUD],
      [0, 5]
    ];
    ObjectLockRule$ = [
      3,
      n0,
      _OLRb,
      0,
      [_DRe],
      [() => DefaultRetention$]
    ];
    ObjectNotInActiveTierError$ = [
      -3,
      n0,
      _ONIATE,
      { [_e]: _c, [_hE]: 403 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(ObjectNotInActiveTierError$, ObjectNotInActiveTierError);
    ObjectPart$ = [
      3,
      n0,
      _OPb,
      0,
      [_PN, _Si, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh],
      [1, 1, 0, 0, 0, 0, 0]
    ];
    ObjectVersion$ = [
      3,
      n0,
      _OV,
      0,
      [_ETa, _CA, _CT, _Si, _SC, _K, _VI, _IL, _LM, _O, _RSe],
      [0, [64 | 0, { [_xF]: 1 }], 0, 1, 0, 0, 0, 2, 4, () => Owner$, () => RestoreStatus$]
    ];
    OutputLocation$ = [
      3,
      n0,
      _OL,
      0,
      [_S_],
      [[() => S3Location$, 0]]
    ];
    OutputSerialization$ = [
      3,
      n0,
      _OSu,
      0,
      [_CSV, _JSON],
      [() => CSVOutput$, () => JSONOutput$]
    ];
    Owner$ = [
      3,
      n0,
      _O,
      0,
      [_DN, _ID],
      [0, 0]
    ];
    OwnershipControls$ = [
      3,
      n0,
      _OC,
      0,
      [_R],
      [[() => OwnershipControlsRules, { [_xF]: 1, [_xN]: _Ru }]],
      1
    ];
    OwnershipControlsRule$ = [
      3,
      n0,
      _OCR,
      0,
      [_OO],
      [0],
      1
    ];
    ParquetInput$ = [
      3,
      n0,
      _PI,
      0,
      [],
      []
    ];
    Part$ = [
      3,
      n0,
      _Par,
      0,
      [_PN, _LM, _ETa, _Si, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh],
      [1, 4, 0, 1, 0, 0, 0, 0, 0]
    ];
    PartitionedPrefix$ = [
      3,
      n0,
      _PP,
      { [_xN]: _PP },
      [_PDS],
      [0]
    ];
    PolicyStatus$ = [
      3,
      n0,
      _PS,
      0,
      [_IP],
      [[2, { [_xN]: _IP }]]
    ];
    Progress$ = [
      3,
      n0,
      _Pr,
      0,
      [_BS, _BP, _BRy],
      [1, 1, 1]
    ];
    ProgressEvent$ = [
      3,
      n0,
      _PE,
      0,
      [_Det],
      [[() => Progress$, { [_eP]: 1 }]]
    ];
    PublicAccessBlockConfiguration$ = [
      3,
      n0,
      _PABC,
      0,
      [_BPA, _IPA, _BPP, _RPB],
      [[2, { [_xN]: _BPA }], [2, { [_xN]: _IPA }], [2, { [_xN]: _BPP }], [2, { [_xN]: _RPB }]]
    ];
    PutBucketAbacRequest$ = [
      3,
      n0,
      _PBAR,
      0,
      [_B, _AS, _CMD, _CA, _EBO],
      [[0, 1], [() => AbacStatus$, { [_hP]: 1, [_xN]: _AS }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketAccelerateConfigurationRequest$ = [
      3,
      n0,
      _PBACR,
      0,
      [_B, _AC, _EBO, _CA],
      [[0, 1], [() => AccelerateConfiguration$, { [_hP]: 1, [_xN]: _AC }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xasca }]],
      2
    ];
    PutBucketAclRequest$ = [
      3,
      n0,
      _PBARu,
      0,
      [_B, _ACL_, _ACP, _CMD, _CA, _GFC, _GR, _GRACP, _GW, _GWACP, _EBO],
      [[0, 1], [0, { [_hH]: _xaa }], [() => AccessControlPolicy$, { [_hP]: 1, [_xN]: _ACP }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xagfc }], [0, { [_hH]: _xagr }], [0, { [_hH]: _xagra }], [0, { [_hH]: _xagw }], [0, { [_hH]: _xagwa }], [0, { [_hH]: _xaebo }]],
      1
    ];
    PutBucketAnalyticsConfigurationRequest$ = [
      3,
      n0,
      _PBACRu,
      0,
      [_B, _I, _ACn, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [() => AnalyticsConfiguration$, { [_hP]: 1, [_xN]: _ACn }], [0, { [_hH]: _xaebo }]],
      3
    ];
    PutBucketCorsRequest$ = [
      3,
      n0,
      _PBCR,
      0,
      [_B, _CORSC, _CMD, _CA, _EBO],
      [[0, 1], [() => CORSConfiguration$, { [_hP]: 1, [_xN]: _CORSC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketEncryptionRequest$ = [
      3,
      n0,
      _PBER,
      0,
      [_B, _SSEC, _CMD, _CA, _EBO],
      [[0, 1], [() => ServerSideEncryptionConfiguration$, { [_hP]: 1, [_xN]: _SSEC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketIntelligentTieringConfigurationRequest$ = [
      3,
      n0,
      _PBITCR,
      0,
      [_B, _I, _ITC, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [() => IntelligentTieringConfiguration$, { [_hP]: 1, [_xN]: _ITC }], [0, { [_hH]: _xaebo }]],
      3
    ];
    PutBucketInventoryConfigurationRequest$ = [
      3,
      n0,
      _PBICR,
      0,
      [_B, _I, _IC, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [() => InventoryConfiguration$, { [_hP]: 1, [_xN]: _IC }], [0, { [_hH]: _xaebo }]],
      3
    ];
    PutBucketLifecycleConfigurationOutput$ = [
      3,
      n0,
      _PBLCO,
      0,
      [_TDMOS],
      [[0, { [_hH]: _xatdmos }]]
    ];
    PutBucketLifecycleConfigurationRequest$ = [
      3,
      n0,
      _PBLCR,
      0,
      [_B, _CA, _LCi, _EBO, _TDMOS],
      [[0, 1], [0, { [_hH]: _xasca }], [() => BucketLifecycleConfiguration$, { [_hP]: 1, [_xN]: _LCi }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xatdmos }]],
      1
    ];
    PutBucketLoggingRequest$ = [
      3,
      n0,
      _PBLR,
      0,
      [_B, _BLS, _CMD, _CA, _EBO],
      [[0, 1], [() => BucketLoggingStatus$, { [_hP]: 1, [_xN]: _BLS }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketMetricsConfigurationRequest$ = [
      3,
      n0,
      _PBMCR,
      0,
      [_B, _I, _MCe, _EBO],
      [[0, 1], [0, { [_hQ]: _i }], [() => MetricsConfiguration$, { [_hP]: 1, [_xN]: _MCe }], [0, { [_hH]: _xaebo }]],
      3
    ];
    PutBucketNotificationConfigurationRequest$ = [
      3,
      n0,
      _PBNCR,
      0,
      [_B, _NC, _EBO, _SDV],
      [[0, 1], [() => NotificationConfiguration$, { [_hP]: 1, [_xN]: _NC }], [0, { [_hH]: _xaebo }], [2, { [_hH]: _xasdv }]],
      2
    ];
    PutBucketOwnershipControlsRequest$ = [
      3,
      n0,
      _PBOCR,
      0,
      [_B, _OC, _CMD, _EBO, _CA],
      [[0, 1], [() => OwnershipControls$, { [_hP]: 1, [_xN]: _OC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xasca }]],
      2
    ];
    PutBucketPolicyRequest$ = [
      3,
      n0,
      _PBPR,
      0,
      [_B, _Po, _CMD, _CA, _CRSBA, _EBO],
      [[0, 1], [0, 16], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [2, { [_hH]: _xacrsba }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketReplicationRequest$ = [
      3,
      n0,
      _PBRR,
      0,
      [_B, _RCe, _CMD, _CA, _To, _EBO],
      [[0, 1], [() => ReplicationConfiguration$, { [_hP]: 1, [_xN]: _RCe }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xabolt }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketRequestPaymentRequest$ = [
      3,
      n0,
      _PBRPR,
      0,
      [_B, _RPC, _CMD, _CA, _EBO],
      [[0, 1], [() => RequestPaymentConfiguration$, { [_hP]: 1, [_xN]: _RPC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketTaggingRequest$ = [
      3,
      n0,
      _PBTR,
      0,
      [_B, _Tag, _CMD, _CA, _EBO],
      [[0, 1], [() => Tagging$, { [_hP]: 1, [_xN]: _Tag }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketVersioningRequest$ = [
      3,
      n0,
      _PBVR,
      0,
      [_B, _VC, _CMD, _CA, _MFA, _EBO],
      [[0, 1], [() => VersioningConfiguration$, { [_hP]: 1, [_xN]: _VC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xam_ }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutBucketWebsiteRequest$ = [
      3,
      n0,
      _PBWR,
      0,
      [_B, _WC, _CMD, _CA, _EBO],
      [[0, 1], [() => WebsiteConfiguration$, { [_hP]: 1, [_xN]: _WC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutObjectAclOutput$ = [
      3,
      n0,
      _POAO,
      0,
      [_RC],
      [[0, { [_hH]: _xarc }]]
    ];
    PutObjectAclRequest$ = [
      3,
      n0,
      _POAR,
      0,
      [_B, _K, _ACL_, _ACP, _CMD, _CA, _GFC, _GR, _GRACP, _GW, _GWACP, _RP, _VI, _EBO],
      [[0, 1], [0, 1], [0, { [_hH]: _xaa }], [() => AccessControlPolicy$, { [_hP]: 1, [_xN]: _ACP }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xagfc }], [0, { [_hH]: _xagr }], [0, { [_hH]: _xagra }], [0, { [_hH]: _xagw }], [0, { [_hH]: _xagwa }], [0, { [_hH]: _xarp }], [0, { [_hQ]: _vI }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutObjectLegalHoldOutput$ = [
      3,
      n0,
      _POLHO,
      0,
      [_RC],
      [[0, { [_hH]: _xarc }]]
    ];
    PutObjectLegalHoldRequest$ = [
      3,
      n0,
      _POLHR,
      0,
      [_B, _K, _LH, _RP, _VI, _CMD, _CA, _EBO],
      [[0, 1], [0, 1], [() => ObjectLockLegalHold$, { [_hP]: 1, [_xN]: _LH }], [0, { [_hH]: _xarp }], [0, { [_hQ]: _vI }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutObjectLockConfigurationOutput$ = [
      3,
      n0,
      _POLCO,
      0,
      [_RC],
      [[0, { [_hH]: _xarc }]]
    ];
    PutObjectLockConfigurationRequest$ = [
      3,
      n0,
      _POLCR,
      0,
      [_B, _OLC, _RP, _To, _CMD, _CA, _EBO],
      [[0, 1], [() => ObjectLockConfiguration$, { [_hP]: 1, [_xN]: _OLC }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xabolt }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      1
    ];
    PutObjectOutput$ = [
      3,
      n0,
      _POO,
      0,
      [_E, _ETa, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _CT, _SSE, _VI, _SSECA, _SSECKMD, _SSEKMSKI, _SSEKMSEC, _BKE, _Si, _RC],
      [[0, { [_hH]: _xae }], [0, { [_hH]: _ETa }], [0, { [_hH]: _xacc }], [0, { [_hH]: _xacc_ }], [0, { [_hH]: _xacc__ }], [0, { [_hH]: _xacs }], [0, { [_hH]: _xacs_ }], [0, { [_hH]: _xact }], [0, { [_hH]: _xasse }], [0, { [_hH]: _xavi }], [0, { [_hH]: _xasseca }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }], [1, { [_hH]: _xaos }], [0, { [_hH]: _xarc }]]
    ];
    PutObjectRequest$ = [
      3,
      n0,
      _POR,
      0,
      [_B, _K, _ACL_, _Bo, _CC, _CDo, _CEo, _CL, _CLo, _CMD, _CTo, _CA, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _Ex, _IM, _INM, _GFC, _GR, _GRACP, _GWACP, _WOB, _M, _SSE, _SC, _WRL, _SSECA, _SSECK, _SSECKMD, _SSEKMSKI, _SSEKMSEC, _BKE, _RP, _Tag, _OLM, _OLRUD, _OLLHS, _EBO],
      [[0, 1], [0, 1], [0, { [_hH]: _xaa }], [() => StreamingBlob, 16], [0, { [_hH]: _CC_ }], [0, { [_hH]: _CD_ }], [0, { [_hH]: _CE_ }], [0, { [_hH]: _CL_ }], [1, { [_hH]: _CL__ }], [0, { [_hH]: _CM }], [0, { [_hH]: _CT_ }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xacc }], [0, { [_hH]: _xacc_ }], [0, { [_hH]: _xacc__ }], [0, { [_hH]: _xacs }], [0, { [_hH]: _xacs_ }], [4, { [_hH]: _Ex }], [0, { [_hH]: _IM_ }], [0, { [_hH]: _INM_ }], [0, { [_hH]: _xagfc }], [0, { [_hH]: _xagr }], [0, { [_hH]: _xagra }], [0, { [_hH]: _xagwa }], [1, { [_hH]: _xawob }], [128 | 0, { [_hPH]: _xam }], [0, { [_hH]: _xasse }], [0, { [_hH]: _xasc }], [0, { [_hH]: _xawrl }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [() => SSEKMSEncryptionContext, { [_hH]: _xassec }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xat }], [0, { [_hH]: _xaolm }], [5, { [_hH]: _xaolrud }], [0, { [_hH]: _xaollh }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutObjectRetentionOutput$ = [
      3,
      n0,
      _PORO,
      0,
      [_RC],
      [[0, { [_hH]: _xarc }]]
    ];
    PutObjectRetentionRequest$ = [
      3,
      n0,
      _PORR,
      0,
      [_B, _K, _Ret, _RP, _VI, _BGR, _CMD, _CA, _EBO],
      [[0, 1], [0, 1], [() => ObjectLockRetention$, { [_hP]: 1, [_xN]: _Ret }], [0, { [_hH]: _xarp }], [0, { [_hQ]: _vI }], [2, { [_hH]: _xabgr }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    PutObjectTaggingOutput$ = [
      3,
      n0,
      _POTO,
      0,
      [_VI],
      [[0, { [_hH]: _xavi }]]
    ];
    PutObjectTaggingRequest$ = [
      3,
      n0,
      _POTR,
      0,
      [_B, _K, _Tag, _VI, _CMD, _CA, _EBO, _RP],
      [[0, 1], [0, 1], [() => Tagging$, { [_hP]: 1, [_xN]: _Tag }], [0, { [_hQ]: _vI }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xarp }]],
      3
    ];
    PutPublicAccessBlockRequest$ = [
      3,
      n0,
      _PPABR,
      0,
      [_B, _PABC, _CMD, _CA, _EBO],
      [[0, 1], [() => PublicAccessBlockConfiguration$, { [_hP]: 1, [_xN]: _PABC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    QueueConfiguration$ = [
      3,
      n0,
      _QCue,
      0,
      [_QA, _Ev, _I, _F],
      [[0, { [_xN]: _Qu }], [64 | 0, { [_xF]: 1, [_xN]: _Eve }], 0, [() => NotificationConfigurationFilter$, 0]],
      2
    ];
    RecordExpiration$ = [
      3,
      n0,
      _REe,
      0,
      [_E, _D],
      [0, 1],
      1
    ];
    RecordsEvent$ = [
      3,
      n0,
      _REec,
      0,
      [_Payl],
      [[21, { [_eP]: 1 }]]
    ];
    Redirect$ = [
      3,
      n0,
      _Red,
      0,
      [_HN, _HRC, _Pro, _RKPW, _RKW],
      [0, 0, 0, 0, 0]
    ];
    RedirectAllRequestsTo$ = [
      3,
      n0,
      _RART,
      0,
      [_HN, _Pro],
      [0, 0],
      1
    ];
    RenameObjectOutput$ = [
      3,
      n0,
      _ROO,
      0,
      [],
      []
    ];
    RenameObjectRequest$ = [
      3,
      n0,
      _ROR,
      0,
      [_B, _K, _RSen, _DIM, _DINM, _DIMS, _DIUS, _SIM, _SINM, _SIMS, _SIUS, _CTl],
      [[0, 1], [0, 1], [0, { [_hH]: _xars_ }], [0, { [_hH]: _IM_ }], [0, { [_hH]: _INM_ }], [4, { [_hH]: _IMS_ }], [4, { [_hH]: _IUS_ }], [0, { [_hH]: _xarsim }], [0, { [_hH]: _xarsinm }], [6, { [_hH]: _xarsims }], [6, { [_hH]: _xarsius }], [0, { [_hH]: _xact_, [_iT]: 1 }]],
      3
    ];
    ReplicaModifications$ = [
      3,
      n0,
      _RM,
      0,
      [_S],
      [0],
      1
    ];
    ReplicationConfiguration$ = [
      3,
      n0,
      _RCe,
      0,
      [_Ro, _R],
      [0, [() => ReplicationRules, { [_xF]: 1, [_xN]: _Ru }]],
      2
    ];
    ReplicationRule$ = [
      3,
      n0,
      _RRe,
      0,
      [_S, _Des, _ID, _Pri, _P, _F, _SSC, _EOR, _DMR],
      [0, () => Destination$, 0, 1, 0, [() => ReplicationRuleFilter$, 0], () => SourceSelectionCriteria$, () => ExistingObjectReplication$, () => DeleteMarkerReplication$],
      2
    ];
    ReplicationRuleAndOperator$ = [
      3,
      n0,
      _RRAO,
      0,
      [_P, _T],
      [0, [() => TagSet, { [_xF]: 1, [_xN]: _Ta }]]
    ];
    ReplicationRuleFilter$ = [
      3,
      n0,
      _RRF,
      0,
      [_P, _Ta, _An],
      [0, () => Tag$, [() => ReplicationRuleAndOperator$, 0]]
    ];
    ReplicationTime$ = [
      3,
      n0,
      _RT,
      0,
      [_S, _Tim],
      [0, () => ReplicationTimeValue$],
      2
    ];
    ReplicationTimeValue$ = [
      3,
      n0,
      _RTV,
      0,
      [_Mi],
      [1]
    ];
    RequestPaymentConfiguration$ = [
      3,
      n0,
      _RPC,
      0,
      [_Pay],
      [0],
      1
    ];
    RequestProgress$ = [
      3,
      n0,
      _RPe,
      0,
      [_Ena],
      [2]
    ];
    RestoreObjectOutput$ = [
      3,
      n0,
      _ROOe,
      0,
      [_RC, _ROP],
      [[0, { [_hH]: _xarc }], [0, { [_hH]: _xarop }]]
    ];
    RestoreObjectRequest$ = [
      3,
      n0,
      _RORe,
      0,
      [_B, _K, _VI, _RRes, _RP, _CA, _EBO],
      [[0, 1], [0, 1], [0, { [_hQ]: _vI }], [() => RestoreRequest$, { [_hP]: 1, [_xN]: _RRes }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    RestoreRequest$ = [
      3,
      n0,
      _RRes,
      0,
      [_D, _GJP, _Ty, _Ti, _Desc, _SP, _OL],
      [1, () => GlacierJobParameters$, 0, 0, 0, () => SelectParameters$, [() => OutputLocation$, 0]]
    ];
    RestoreStatus$ = [
      3,
      n0,
      _RSe,
      0,
      [_IRIP, _RED],
      [2, 4]
    ];
    RoutingRule$ = [
      3,
      n0,
      _RRo,
      0,
      [_Red, _Co],
      [() => Redirect$, () => Condition$],
      1
    ];
    S3KeyFilter$ = [
      3,
      n0,
      _SKF,
      0,
      [_FRi],
      [[() => FilterRuleList, { [_xF]: 1, [_xN]: _FR }]]
    ];
    S3Location$ = [
      3,
      n0,
      _SL,
      0,
      [_BN, _P, _En, _CACL, _ACL, _Tag, _UM, _SC],
      [0, 0, [() => Encryption$, 0], 0, [() => Grants, 0], [() => Tagging$, 0], [() => UserMetadata, 0], 0],
      2
    ];
    S3TablesDestination$ = [
      3,
      n0,
      _STD,
      0,
      [_TBA, _TNa],
      [0, 0],
      2
    ];
    S3TablesDestinationResult$ = [
      3,
      n0,
      _STDR,
      0,
      [_TBA, _TNa, _TA, _TN],
      [0, 0, 0, 0],
      4
    ];
    ScanRange$ = [
      3,
      n0,
      _SR,
      0,
      [_St, _End],
      [1, 1]
    ];
    SelectObjectContentOutput$ = [
      3,
      n0,
      _SOCO,
      0,
      [_Payl],
      [[() => SelectObjectContentEventStream$, 16]]
    ];
    SelectObjectContentRequest$ = [
      3,
      n0,
      _SOCR,
      0,
      [_B, _K, _Exp, _ETx, _IS, _OSu, _SSECA, _SSECK, _SSECKMD, _RPe, _SR, _EBO],
      [[0, 1], [0, 1], 0, 0, () => InputSerialization$, () => OutputSerialization$, [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], () => RequestProgress$, () => ScanRange$, [0, { [_hH]: _xaebo }]],
      6
    ];
    SelectParameters$ = [
      3,
      n0,
      _SP,
      0,
      [_IS, _ETx, _Exp, _OSu],
      [() => InputSerialization$, 0, 0, () => OutputSerialization$],
      4
    ];
    ServerSideEncryptionByDefault$ = [
      3,
      n0,
      _SSEBD,
      0,
      [_SSEA, _KMSMKID],
      [0, [() => SSEKMSKeyId, 0]],
      1
    ];
    ServerSideEncryptionConfiguration$ = [
      3,
      n0,
      _SSEC,
      0,
      [_R],
      [[() => ServerSideEncryptionRules, { [_xF]: 1, [_xN]: _Ru }]],
      1
    ];
    ServerSideEncryptionRule$ = [
      3,
      n0,
      _SSER,
      0,
      [_ASSEBD, _BKE, _BET],
      [[() => ServerSideEncryptionByDefault$, 0], 2, [() => BlockedEncryptionTypes$, 0]]
    ];
    SessionCredentials$ = [
      3,
      n0,
      _SCe,
      0,
      [_AKI, _SAK, _ST, _E],
      [[0, { [_xN]: _AKI }], [() => SessionCredentialValue, { [_xN]: _SAK }], [() => SessionCredentialValue, { [_xN]: _ST }], [4, { [_xN]: _E }]],
      4
    ];
    SimplePrefix$ = [
      3,
      n0,
      _SPi,
      { [_xN]: _SPi },
      [],
      []
    ];
    SourceSelectionCriteria$ = [
      3,
      n0,
      _SSC,
      0,
      [_SKEO, _RM],
      [() => SseKmsEncryptedObjects$, () => ReplicaModifications$]
    ];
    SSEKMS$ = [
      3,
      n0,
      _SSEKMS,
      { [_xN]: _SK },
      [_KI],
      [[() => SSEKMSKeyId, 0]],
      1
    ];
    SseKmsEncryptedObjects$ = [
      3,
      n0,
      _SKEO,
      0,
      [_S],
      [0],
      1
    ];
    SSES3$ = [
      3,
      n0,
      _SSES,
      { [_xN]: _SS },
      [],
      []
    ];
    Stats$ = [
      3,
      n0,
      _Sta,
      0,
      [_BS, _BP, _BRy],
      [1, 1, 1]
    ];
    StatsEvent$ = [
      3,
      n0,
      _SE,
      0,
      [_Det],
      [[() => Stats$, { [_eP]: 1 }]]
    ];
    StorageClassAnalysis$ = [
      3,
      n0,
      _SCA,
      0,
      [_DE],
      [() => StorageClassAnalysisDataExport$]
    ];
    StorageClassAnalysisDataExport$ = [
      3,
      n0,
      _SCADE,
      0,
      [_OSV, _Des],
      [0, () => AnalyticsExportDestination$],
      2
    ];
    Tag$ = [
      3,
      n0,
      _Ta,
      0,
      [_K, _V],
      [0, 0],
      2
    ];
    Tagging$ = [
      3,
      n0,
      _Tag,
      0,
      [_TS],
      [[() => TagSet, 0]],
      1
    ];
    TargetGrant$ = [
      3,
      n0,
      _TGa,
      0,
      [_Gra, _Pe],
      [[() => Grantee$, { [_xNm]: [_x, _hi] }], 0]
    ];
    TargetObjectKeyFormat$ = [
      3,
      n0,
      _TOKF,
      0,
      [_SPi, _PP],
      [[() => SimplePrefix$, { [_xN]: _SPi }], [() => PartitionedPrefix$, { [_xN]: _PP }]]
    ];
    Tiering$ = [
      3,
      n0,
      _Tier,
      0,
      [_D, _AT],
      [1, 0],
      2
    ];
    TooManyParts$ = [
      -3,
      n0,
      _TMP,
      { [_e]: _c, [_hE]: 400 },
      [],
      []
    ];
    TypeRegistry.for(n0).registerError(TooManyParts$, TooManyParts);
    TopicConfiguration$ = [
      3,
      n0,
      _TCop,
      0,
      [_TAo, _Ev, _I, _F],
      [[0, { [_xN]: _Top }], [64 | 0, { [_xF]: 1, [_xN]: _Eve }], 0, [() => NotificationConfigurationFilter$, 0]],
      2
    ];
    Transition$ = [
      3,
      n0,
      _Tra,
      0,
      [_Da, _D, _SC],
      [5, 1, 0]
    ];
    UpdateBucketMetadataInventoryTableConfigurationRequest$ = [
      3,
      n0,
      _UBMITCR,
      0,
      [_B, _ITCn, _CMD, _CA, _EBO],
      [[0, 1], [() => InventoryTableConfigurationUpdates$, { [_hP]: 1, [_xN]: _ITCn }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    UpdateBucketMetadataJournalTableConfigurationRequest$ = [
      3,
      n0,
      _UBMJTCR,
      0,
      [_B, _JTC, _CMD, _CA, _EBO],
      [[0, 1], [() => JournalTableConfigurationUpdates$, { [_hP]: 1, [_xN]: _JTC }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xaebo }]],
      2
    ];
    UploadPartCopyOutput$ = [
      3,
      n0,
      _UPCO,
      0,
      [_CSVI, _CPR, _SSE, _SSECA, _SSECKMD, _SSEKMSKI, _BKE, _RC],
      [[0, { [_hH]: _xacsvi }], [() => CopyPartResult$, 16], [0, { [_hH]: _xasse }], [0, { [_hH]: _xasseca }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xarc }]]
    ];
    UploadPartCopyRequest$ = [
      3,
      n0,
      _UPCR,
      0,
      [_B, _CS, _K, _PN, _UI, _CSIM, _CSIMS, _CSINM, _CSIUS, _CSRo, _SSECA, _SSECK, _SSECKMD, _CSSSECA, _CSSSECK, _CSSSECKMD, _RP, _EBO, _ESBO],
      [[0, 1], [0, { [_hH]: _xacs__ }], [0, 1], [1, { [_hQ]: _pN }], [0, { [_hQ]: _uI }], [0, { [_hH]: _xacsim }], [4, { [_hH]: _xacsims }], [0, { [_hH]: _xacsinm }], [4, { [_hH]: _xacsius }], [0, { [_hH]: _xacsr }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [0, { [_hH]: _xacssseca }], [() => CopySourceSSECustomerKey, { [_hH]: _xacssseck }], [0, { [_hH]: _xacssseckM }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }], [0, { [_hH]: _xasebo }]],
      5
    ];
    UploadPartOutput$ = [
      3,
      n0,
      _UPO,
      0,
      [_SSE, _ETa, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _SSECA, _SSECKMD, _SSEKMSKI, _BKE, _RC],
      [[0, { [_hH]: _xasse }], [0, { [_hH]: _ETa }], [0, { [_hH]: _xacc }], [0, { [_hH]: _xacc_ }], [0, { [_hH]: _xacc__ }], [0, { [_hH]: _xacs }], [0, { [_hH]: _xacs_ }], [0, { [_hH]: _xasseca }], [0, { [_hH]: _xasseckM }], [() => SSEKMSKeyId, { [_hH]: _xasseakki }], [2, { [_hH]: _xassebke }], [0, { [_hH]: _xarc }]]
    ];
    UploadPartRequest$ = [
      3,
      n0,
      _UPR,
      0,
      [_B, _K, _PN, _UI, _Bo, _CLo, _CMD, _CA, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _SSECA, _SSECK, _SSECKMD, _RP, _EBO],
      [[0, 1], [0, 1], [1, { [_hQ]: _pN }], [0, { [_hQ]: _uI }], [() => StreamingBlob, 16], [1, { [_hH]: _CL__ }], [0, { [_hH]: _CM }], [0, { [_hH]: _xasca }], [0, { [_hH]: _xacc }], [0, { [_hH]: _xacc_ }], [0, { [_hH]: _xacc__ }], [0, { [_hH]: _xacs }], [0, { [_hH]: _xacs_ }], [0, { [_hH]: _xasseca }], [() => SSECustomerKey, { [_hH]: _xasseck }], [0, { [_hH]: _xasseckM }], [0, { [_hH]: _xarp }], [0, { [_hH]: _xaebo }]],
      4
    ];
    VersioningConfiguration$ = [
      3,
      n0,
      _VC,
      0,
      [_MFAD, _S],
      [[0, { [_xN]: _MDf }], 0]
    ];
    WebsiteConfiguration$ = [
      3,
      n0,
      _WC,
      0,
      [_EDr, _IDn, _RART, _RR],
      [() => ErrorDocument$, () => IndexDocument$, () => RedirectAllRequestsTo$, [() => RoutingRules, 0]]
    ];
    WriteGetObjectResponseRequest$ = [
      3,
      n0,
      _WGORR,
      0,
      [_RReq, _RTe, _Bo, _SCt, _ECr, _EM, _AR, _CC, _CDo, _CEo, _CL, _CLo, _CR, _CTo, _CCRC, _CCRCC, _CCRCNVME, _CSHA, _CSHAh, _DM, _ETa, _Ex, _E, _LM, _MM, _M, _OLM, _OLLHS, _OLRUD, _PC, _RS, _RC, _Re, _SSE, _SSECA, _SSEKMSKI, _SSECKMD, _SC, _TC, _VI, _BKE],
      [[0, { [_hL]: 1, [_hH]: _xarr }], [0, { [_hH]: _xart }], [() => StreamingBlob, 16], [1, { [_hH]: _xafs }], [0, { [_hH]: _xafec }], [0, { [_hH]: _xafem }], [0, { [_hH]: _xafhar }], [0, { [_hH]: _xafhCC }], [0, { [_hH]: _xafhCD }], [0, { [_hH]: _xafhCE }], [0, { [_hH]: _xafhCL }], [1, { [_hH]: _CL__ }], [0, { [_hH]: _xafhCR }], [0, { [_hH]: _xafhCT }], [0, { [_hH]: _xafhxacc }], [0, { [_hH]: _xafhxacc_ }], [0, { [_hH]: _xafhxacc__ }], [0, { [_hH]: _xafhxacs }], [0, { [_hH]: _xafhxacs_ }], [2, { [_hH]: _xafhxadm }], [0, { [_hH]: _xafhE }], [4, { [_hH]: _xafhE_ }], [0, { [_hH]: _xafhxae }], [4, { [_hH]: _xafhLM }], [1, { [_hH]: _xafhxamm }], [128 | 0, { [_hPH]: _xam }], [0, { [_hH]: _xafhxaolm }], [0, { [_hH]: _xafhxaollh }], [5, { [_hH]: _xafhxaolrud }], [1, { [_hH]: _xafhxampc }], [0, { [_hH]: _xafhxars }], [0, { [_hH]: _xafhxarc }], [0, { [_hH]: _xafhxar }], [0, { [_hH]: _xafhxasse }], [0, { [_hH]: _xafhxasseca }], [() => SSEKMSKeyId, { [_hH]: _xafhxasseakki }], [0, { [_hH]: _xafhxasseckM }], [0, { [_hH]: _xafhxasc }], [1, { [_hH]: _xafhxatc }], [0, { [_hH]: _xafhxavi }], [2, { [_hH]: _xafhxassebke }]],
      2
    ];
    __Unit = "unit";
    S3ServiceException$ = [-3, _sm, "S3ServiceException", 0, [], []];
    TypeRegistry.for(_sm).registerError(S3ServiceException$, S3ServiceException);
    AllowedHeaders = 64 | 0;
    AllowedMethods = 64 | 0;
    AllowedOrigins = 64 | 0;
    AnalyticsConfigurationList = [
      1,
      n0,
      _ACLn,
      0,
      [
        () => AnalyticsConfiguration$,
        0
      ]
    ];
    Buckets = [
      1,
      n0,
      _Bu,
      0,
      [
        () => Bucket$,
        { [_xN]: _B }
      ]
    ];
    ChecksumAlgorithmList = 64 | 0;
    CommonPrefixList = [
      1,
      n0,
      _CPL,
      0,
      () => CommonPrefix$
    ];
    CompletedPartList = [
      1,
      n0,
      _CPLo,
      0,
      () => CompletedPart$
    ];
    CORSRules = [
      1,
      n0,
      _CORSR,
      0,
      [
        () => CORSRule$,
        0
      ]
    ];
    DeletedObjects = [
      1,
      n0,
      _DOe,
      0,
      () => DeletedObject$
    ];
    DeleteMarkers = [
      1,
      n0,
      _DMe,
      0,
      () => DeleteMarkerEntry$
    ];
    EncryptionTypeList = [
      1,
      n0,
      _ETL,
      0,
      [
        0,
        { [_xN]: _ET }
      ]
    ];
    Errors = [
      1,
      n0,
      _Er,
      0,
      () => _Error$
    ];
    EventList = 64 | 0;
    ExposeHeaders = 64 | 0;
    FilterRuleList = [
      1,
      n0,
      _FRL,
      0,
      () => FilterRule$
    ];
    Grants = [
      1,
      n0,
      _G,
      0,
      [
        () => Grant$,
        { [_xN]: _Gr }
      ]
    ];
    IntelligentTieringConfigurationList = [
      1,
      n0,
      _ITCL,
      0,
      [
        () => IntelligentTieringConfiguration$,
        0
      ]
    ];
    InventoryConfigurationList = [
      1,
      n0,
      _ICL,
      0,
      [
        () => InventoryConfiguration$,
        0
      ]
    ];
    InventoryOptionalFields = [
      1,
      n0,
      _IOF,
      0,
      [
        0,
        { [_xN]: _Fi }
      ]
    ];
    LambdaFunctionConfigurationList = [
      1,
      n0,
      _LFCL,
      0,
      [
        () => LambdaFunctionConfiguration$,
        0
      ]
    ];
    LifecycleRules = [
      1,
      n0,
      _LRi,
      0,
      [
        () => LifecycleRule$,
        0
      ]
    ];
    MetricsConfigurationList = [
      1,
      n0,
      _MCL,
      0,
      [
        () => MetricsConfiguration$,
        0
      ]
    ];
    MultipartUploadList = [
      1,
      n0,
      _MUL,
      0,
      () => MultipartUpload$
    ];
    NoncurrentVersionTransitionList = [
      1,
      n0,
      _NVTL,
      0,
      () => NoncurrentVersionTransition$
    ];
    ObjectAttributesList = 64 | 0;
    ObjectIdentifierList = [
      1,
      n0,
      _OIL,
      0,
      () => ObjectIdentifier$
    ];
    ObjectList = [
      1,
      n0,
      _OLb,
      0,
      [
        () => _Object$,
        0
      ]
    ];
    ObjectVersionList = [
      1,
      n0,
      _OVL,
      0,
      [
        () => ObjectVersion$,
        0
      ]
    ];
    OptionalObjectAttributesList = 64 | 0;
    OwnershipControlsRules = [
      1,
      n0,
      _OCRw,
      0,
      () => OwnershipControlsRule$
    ];
    Parts = [
      1,
      n0,
      _Pa,
      0,
      () => Part$
    ];
    PartsList = [
      1,
      n0,
      _PL,
      0,
      () => ObjectPart$
    ];
    QueueConfigurationList = [
      1,
      n0,
      _QCL,
      0,
      [
        () => QueueConfiguration$,
        0
      ]
    ];
    ReplicationRules = [
      1,
      n0,
      _RRep,
      0,
      [
        () => ReplicationRule$,
        0
      ]
    ];
    RoutingRules = [
      1,
      n0,
      _RR,
      0,
      [
        () => RoutingRule$,
        { [_xN]: _RRo }
      ]
    ];
    ServerSideEncryptionRules = [
      1,
      n0,
      _SSERe,
      0,
      [
        () => ServerSideEncryptionRule$,
        0
      ]
    ];
    TagSet = [
      1,
      n0,
      _TS,
      0,
      [
        () => Tag$,
        { [_xN]: _Ta }
      ]
    ];
    TargetGrants = [
      1,
      n0,
      _TG,
      0,
      [
        () => TargetGrant$,
        { [_xN]: _Gr }
      ]
    ];
    TieringList = [
      1,
      n0,
      _TL,
      0,
      () => Tiering$
    ];
    TopicConfigurationList = [
      1,
      n0,
      _TCL,
      0,
      [
        () => TopicConfiguration$,
        0
      ]
    ];
    TransitionList = [
      1,
      n0,
      _TLr,
      0,
      () => Transition$
    ];
    UserMetadata = [
      1,
      n0,
      _UM,
      0,
      [
        () => MetadataEntry$,
        { [_xN]: _ME }
      ]
    ];
    Metadata = 128 | 0;
    AnalyticsFilter$ = [
      4,
      n0,
      _AF,
      0,
      [_P, _Ta, _An],
      [0, () => Tag$, [() => AnalyticsAndOperator$, 0]]
    ];
    MetricsFilter$ = [
      4,
      n0,
      _MF,
      0,
      [_P, _Ta, _APAc, _An],
      [0, () => Tag$, 0, [() => MetricsAndOperator$, 0]]
    ];
    SelectObjectContentEventStream$ = [
      4,
      n0,
      _SOCES,
      { [_s]: 1 },
      [_Rec, _Sta, _Pr, _Cont, _End],
      [[() => RecordsEvent$, 0], [() => StatsEvent$, 0], [() => ProgressEvent$, 0], () => ContinuationEvent$, () => EndEvent$]
    ];
    AbortMultipartUpload$ = [
      9,
      n0,
      _AMU,
      { [_h]: ["DELETE", "/{Key+}?x-id=AbortMultipartUpload", 204] },
      () => AbortMultipartUploadRequest$,
      () => AbortMultipartUploadOutput$
    ];
    CompleteMultipartUpload$ = [
      9,
      n0,
      _CMUo,
      { [_h]: ["POST", "/{Key+}", 200] },
      () => CompleteMultipartUploadRequest$,
      () => CompleteMultipartUploadOutput$
    ];
    CopyObject$ = [
      9,
      n0,
      _CO,
      { [_h]: ["PUT", "/{Key+}?x-id=CopyObject", 200] },
      () => CopyObjectRequest$,
      () => CopyObjectOutput$
    ];
    CreateBucket$ = [
      9,
      n0,
      _CB,
      { [_h]: ["PUT", "/", 200] },
      () => CreateBucketRequest$,
      () => CreateBucketOutput$
    ];
    CreateBucketMetadataConfiguration$ = [
      9,
      n0,
      _CBMC,
      { [_hC]: "-", [_h]: ["POST", "/?metadataConfiguration", 200] },
      () => CreateBucketMetadataConfigurationRequest$,
      () => __Unit
    ];
    CreateBucketMetadataTableConfiguration$ = [
      9,
      n0,
      _CBMTC,
      { [_hC]: "-", [_h]: ["POST", "/?metadataTable", 200] },
      () => CreateBucketMetadataTableConfigurationRequest$,
      () => __Unit
    ];
    CreateMultipartUpload$ = [
      9,
      n0,
      _CMUr,
      { [_h]: ["POST", "/{Key+}?uploads", 200] },
      () => CreateMultipartUploadRequest$,
      () => CreateMultipartUploadOutput$
    ];
    CreateSession$ = [
      9,
      n0,
      _CSr,
      { [_h]: ["GET", "/?session", 200] },
      () => CreateSessionRequest$,
      () => CreateSessionOutput$
    ];
    DeleteBucket$ = [
      9,
      n0,
      _DB,
      { [_h]: ["DELETE", "/", 204] },
      () => DeleteBucketRequest$,
      () => __Unit
    ];
    DeleteBucketAnalyticsConfiguration$ = [
      9,
      n0,
      _DBAC,
      { [_h]: ["DELETE", "/?analytics", 204] },
      () => DeleteBucketAnalyticsConfigurationRequest$,
      () => __Unit
    ];
    DeleteBucketCors$ = [
      9,
      n0,
      _DBC,
      { [_h]: ["DELETE", "/?cors", 204] },
      () => DeleteBucketCorsRequest$,
      () => __Unit
    ];
    DeleteBucketEncryption$ = [
      9,
      n0,
      _DBE,
      { [_h]: ["DELETE", "/?encryption", 204] },
      () => DeleteBucketEncryptionRequest$,
      () => __Unit
    ];
    DeleteBucketIntelligentTieringConfiguration$ = [
      9,
      n0,
      _DBITC,
      { [_h]: ["DELETE", "/?intelligent-tiering", 204] },
      () => DeleteBucketIntelligentTieringConfigurationRequest$,
      () => __Unit
    ];
    DeleteBucketInventoryConfiguration$ = [
      9,
      n0,
      _DBIC,
      { [_h]: ["DELETE", "/?inventory", 204] },
      () => DeleteBucketInventoryConfigurationRequest$,
      () => __Unit
    ];
    DeleteBucketLifecycle$ = [
      9,
      n0,
      _DBL,
      { [_h]: ["DELETE", "/?lifecycle", 204] },
      () => DeleteBucketLifecycleRequest$,
      () => __Unit
    ];
    DeleteBucketMetadataConfiguration$ = [
      9,
      n0,
      _DBMC,
      { [_h]: ["DELETE", "/?metadataConfiguration", 204] },
      () => DeleteBucketMetadataConfigurationRequest$,
      () => __Unit
    ];
    DeleteBucketMetadataTableConfiguration$ = [
      9,
      n0,
      _DBMTC,
      { [_h]: ["DELETE", "/?metadataTable", 204] },
      () => DeleteBucketMetadataTableConfigurationRequest$,
      () => __Unit
    ];
    DeleteBucketMetricsConfiguration$ = [
      9,
      n0,
      _DBMCe,
      { [_h]: ["DELETE", "/?metrics", 204] },
      () => DeleteBucketMetricsConfigurationRequest$,
      () => __Unit
    ];
    DeleteBucketOwnershipControls$ = [
      9,
      n0,
      _DBOC,
      { [_h]: ["DELETE", "/?ownershipControls", 204] },
      () => DeleteBucketOwnershipControlsRequest$,
      () => __Unit
    ];
    DeleteBucketPolicy$ = [
      9,
      n0,
      _DBP,
      { [_h]: ["DELETE", "/?policy", 204] },
      () => DeleteBucketPolicyRequest$,
      () => __Unit
    ];
    DeleteBucketReplication$ = [
      9,
      n0,
      _DBRe,
      { [_h]: ["DELETE", "/?replication", 204] },
      () => DeleteBucketReplicationRequest$,
      () => __Unit
    ];
    DeleteBucketTagging$ = [
      9,
      n0,
      _DBT,
      { [_h]: ["DELETE", "/?tagging", 204] },
      () => DeleteBucketTaggingRequest$,
      () => __Unit
    ];
    DeleteBucketWebsite$ = [
      9,
      n0,
      _DBW,
      { [_h]: ["DELETE", "/?website", 204] },
      () => DeleteBucketWebsiteRequest$,
      () => __Unit
    ];
    DeleteObject$ = [
      9,
      n0,
      _DOel,
      { [_h]: ["DELETE", "/{Key+}?x-id=DeleteObject", 204] },
      () => DeleteObjectRequest$,
      () => DeleteObjectOutput$
    ];
    DeleteObjects$ = [
      9,
      n0,
      _DOele,
      { [_hC]: "-", [_h]: ["POST", "/?delete", 200] },
      () => DeleteObjectsRequest$,
      () => DeleteObjectsOutput$
    ];
    DeleteObjectTagging$ = [
      9,
      n0,
      _DOT,
      { [_h]: ["DELETE", "/{Key+}?tagging", 204] },
      () => DeleteObjectTaggingRequest$,
      () => DeleteObjectTaggingOutput$
    ];
    DeletePublicAccessBlock$ = [
      9,
      n0,
      _DPAB,
      { [_h]: ["DELETE", "/?publicAccessBlock", 204] },
      () => DeletePublicAccessBlockRequest$,
      () => __Unit
    ];
    GetBucketAbac$ = [
      9,
      n0,
      _GBA,
      { [_h]: ["GET", "/?abac", 200] },
      () => GetBucketAbacRequest$,
      () => GetBucketAbacOutput$
    ];
    GetBucketAccelerateConfiguration$ = [
      9,
      n0,
      _GBAC,
      { [_h]: ["GET", "/?accelerate", 200] },
      () => GetBucketAccelerateConfigurationRequest$,
      () => GetBucketAccelerateConfigurationOutput$
    ];
    GetBucketAcl$ = [
      9,
      n0,
      _GBAe,
      { [_h]: ["GET", "/?acl", 200] },
      () => GetBucketAclRequest$,
      () => GetBucketAclOutput$
    ];
    GetBucketAnalyticsConfiguration$ = [
      9,
      n0,
      _GBACe,
      { [_h]: ["GET", "/?analytics&x-id=GetBucketAnalyticsConfiguration", 200] },
      () => GetBucketAnalyticsConfigurationRequest$,
      () => GetBucketAnalyticsConfigurationOutput$
    ];
    GetBucketCors$ = [
      9,
      n0,
      _GBC,
      { [_h]: ["GET", "/?cors", 200] },
      () => GetBucketCorsRequest$,
      () => GetBucketCorsOutput$
    ];
    GetBucketEncryption$ = [
      9,
      n0,
      _GBE,
      { [_h]: ["GET", "/?encryption", 200] },
      () => GetBucketEncryptionRequest$,
      () => GetBucketEncryptionOutput$
    ];
    GetBucketIntelligentTieringConfiguration$ = [
      9,
      n0,
      _GBITC,
      { [_h]: ["GET", "/?intelligent-tiering&x-id=GetBucketIntelligentTieringConfiguration", 200] },
      () => GetBucketIntelligentTieringConfigurationRequest$,
      () => GetBucketIntelligentTieringConfigurationOutput$
    ];
    GetBucketInventoryConfiguration$ = [
      9,
      n0,
      _GBIC,
      { [_h]: ["GET", "/?inventory&x-id=GetBucketInventoryConfiguration", 200] },
      () => GetBucketInventoryConfigurationRequest$,
      () => GetBucketInventoryConfigurationOutput$
    ];
    GetBucketLifecycleConfiguration$ = [
      9,
      n0,
      _GBLC,
      { [_h]: ["GET", "/?lifecycle", 200] },
      () => GetBucketLifecycleConfigurationRequest$,
      () => GetBucketLifecycleConfigurationOutput$
    ];
    GetBucketLocation$ = [
      9,
      n0,
      _GBL,
      { [_h]: ["GET", "/?location", 200] },
      () => GetBucketLocationRequest$,
      () => GetBucketLocationOutput$
    ];
    GetBucketLogging$ = [
      9,
      n0,
      _GBLe,
      { [_h]: ["GET", "/?logging", 200] },
      () => GetBucketLoggingRequest$,
      () => GetBucketLoggingOutput$
    ];
    GetBucketMetadataConfiguration$ = [
      9,
      n0,
      _GBMC,
      { [_h]: ["GET", "/?metadataConfiguration", 200] },
      () => GetBucketMetadataConfigurationRequest$,
      () => GetBucketMetadataConfigurationOutput$
    ];
    GetBucketMetadataTableConfiguration$ = [
      9,
      n0,
      _GBMTC,
      { [_h]: ["GET", "/?metadataTable", 200] },
      () => GetBucketMetadataTableConfigurationRequest$,
      () => GetBucketMetadataTableConfigurationOutput$
    ];
    GetBucketMetricsConfiguration$ = [
      9,
      n0,
      _GBMCe,
      { [_h]: ["GET", "/?metrics&x-id=GetBucketMetricsConfiguration", 200] },
      () => GetBucketMetricsConfigurationRequest$,
      () => GetBucketMetricsConfigurationOutput$
    ];
    GetBucketNotificationConfiguration$ = [
      9,
      n0,
      _GBNC,
      { [_h]: ["GET", "/?notification", 200] },
      () => GetBucketNotificationConfigurationRequest$,
      () => NotificationConfiguration$
    ];
    GetBucketOwnershipControls$ = [
      9,
      n0,
      _GBOC,
      { [_h]: ["GET", "/?ownershipControls", 200] },
      () => GetBucketOwnershipControlsRequest$,
      () => GetBucketOwnershipControlsOutput$
    ];
    GetBucketPolicy$ = [
      9,
      n0,
      _GBP,
      { [_h]: ["GET", "/?policy", 200] },
      () => GetBucketPolicyRequest$,
      () => GetBucketPolicyOutput$
    ];
    GetBucketPolicyStatus$ = [
      9,
      n0,
      _GBPS,
      { [_h]: ["GET", "/?policyStatus", 200] },
      () => GetBucketPolicyStatusRequest$,
      () => GetBucketPolicyStatusOutput$
    ];
    GetBucketReplication$ = [
      9,
      n0,
      _GBR,
      { [_h]: ["GET", "/?replication", 200] },
      () => GetBucketReplicationRequest$,
      () => GetBucketReplicationOutput$
    ];
    GetBucketRequestPayment$ = [
      9,
      n0,
      _GBRP,
      { [_h]: ["GET", "/?requestPayment", 200] },
      () => GetBucketRequestPaymentRequest$,
      () => GetBucketRequestPaymentOutput$
    ];
    GetBucketTagging$ = [
      9,
      n0,
      _GBT,
      { [_h]: ["GET", "/?tagging", 200] },
      () => GetBucketTaggingRequest$,
      () => GetBucketTaggingOutput$
    ];
    GetBucketVersioning$ = [
      9,
      n0,
      _GBV,
      { [_h]: ["GET", "/?versioning", 200] },
      () => GetBucketVersioningRequest$,
      () => GetBucketVersioningOutput$
    ];
    GetBucketWebsite$ = [
      9,
      n0,
      _GBW,
      { [_h]: ["GET", "/?website", 200] },
      () => GetBucketWebsiteRequest$,
      () => GetBucketWebsiteOutput$
    ];
    GetObject$ = [
      9,
      n0,
      _GO,
      { [_hC]: "-", [_h]: ["GET", "/{Key+}?x-id=GetObject", 200] },
      () => GetObjectRequest$,
      () => GetObjectOutput$
    ];
    GetObjectAcl$ = [
      9,
      n0,
      _GOA,
      { [_h]: ["GET", "/{Key+}?acl", 200] },
      () => GetObjectAclRequest$,
      () => GetObjectAclOutput$
    ];
    GetObjectAttributes$ = [
      9,
      n0,
      _GOAe,
      { [_h]: ["GET", "/{Key+}?attributes", 200] },
      () => GetObjectAttributesRequest$,
      () => GetObjectAttributesOutput$
    ];
    GetObjectLegalHold$ = [
      9,
      n0,
      _GOLH,
      { [_h]: ["GET", "/{Key+}?legal-hold", 200] },
      () => GetObjectLegalHoldRequest$,
      () => GetObjectLegalHoldOutput$
    ];
    GetObjectLockConfiguration$ = [
      9,
      n0,
      _GOLC,
      { [_h]: ["GET", "/?object-lock", 200] },
      () => GetObjectLockConfigurationRequest$,
      () => GetObjectLockConfigurationOutput$
    ];
    GetObjectRetention$ = [
      9,
      n0,
      _GORe,
      { [_h]: ["GET", "/{Key+}?retention", 200] },
      () => GetObjectRetentionRequest$,
      () => GetObjectRetentionOutput$
    ];
    GetObjectTagging$ = [
      9,
      n0,
      _GOT,
      { [_h]: ["GET", "/{Key+}?tagging", 200] },
      () => GetObjectTaggingRequest$,
      () => GetObjectTaggingOutput$
    ];
    GetObjectTorrent$ = [
      9,
      n0,
      _GOTe,
      { [_h]: ["GET", "/{Key+}?torrent", 200] },
      () => GetObjectTorrentRequest$,
      () => GetObjectTorrentOutput$
    ];
    GetPublicAccessBlock$ = [
      9,
      n0,
      _GPAB,
      { [_h]: ["GET", "/?publicAccessBlock", 200] },
      () => GetPublicAccessBlockRequest$,
      () => GetPublicAccessBlockOutput$
    ];
    HeadBucket$ = [
      9,
      n0,
      _HB,
      { [_h]: ["HEAD", "/", 200] },
      () => HeadBucketRequest$,
      () => HeadBucketOutput$
    ];
    HeadObject$ = [
      9,
      n0,
      _HO,
      { [_h]: ["HEAD", "/{Key+}", 200] },
      () => HeadObjectRequest$,
      () => HeadObjectOutput$
    ];
    ListBucketAnalyticsConfigurations$ = [
      9,
      n0,
      _LBAC,
      { [_h]: ["GET", "/?analytics&x-id=ListBucketAnalyticsConfigurations", 200] },
      () => ListBucketAnalyticsConfigurationsRequest$,
      () => ListBucketAnalyticsConfigurationsOutput$
    ];
    ListBucketIntelligentTieringConfigurations$ = [
      9,
      n0,
      _LBITC,
      { [_h]: ["GET", "/?intelligent-tiering&x-id=ListBucketIntelligentTieringConfigurations", 200] },
      () => ListBucketIntelligentTieringConfigurationsRequest$,
      () => ListBucketIntelligentTieringConfigurationsOutput$
    ];
    ListBucketInventoryConfigurations$ = [
      9,
      n0,
      _LBIC,
      { [_h]: ["GET", "/?inventory&x-id=ListBucketInventoryConfigurations", 200] },
      () => ListBucketInventoryConfigurationsRequest$,
      () => ListBucketInventoryConfigurationsOutput$
    ];
    ListBucketMetricsConfigurations$ = [
      9,
      n0,
      _LBMC,
      { [_h]: ["GET", "/?metrics&x-id=ListBucketMetricsConfigurations", 200] },
      () => ListBucketMetricsConfigurationsRequest$,
      () => ListBucketMetricsConfigurationsOutput$
    ];
    ListBuckets$ = [
      9,
      n0,
      _LB,
      { [_h]: ["GET", "/?x-id=ListBuckets", 200] },
      () => ListBucketsRequest$,
      () => ListBucketsOutput$
    ];
    ListDirectoryBuckets$ = [
      9,
      n0,
      _LDB,
      { [_h]: ["GET", "/?x-id=ListDirectoryBuckets", 200] },
      () => ListDirectoryBucketsRequest$,
      () => ListDirectoryBucketsOutput$
    ];
    ListMultipartUploads$ = [
      9,
      n0,
      _LMU,
      { [_h]: ["GET", "/?uploads", 200] },
      () => ListMultipartUploadsRequest$,
      () => ListMultipartUploadsOutput$
    ];
    ListObjects$ = [
      9,
      n0,
      _LO,
      { [_h]: ["GET", "/", 200] },
      () => ListObjectsRequest$,
      () => ListObjectsOutput$
    ];
    ListObjectsV2$ = [
      9,
      n0,
      _LOV,
      { [_h]: ["GET", "/?list-type=2", 200] },
      () => ListObjectsV2Request$,
      () => ListObjectsV2Output$
    ];
    ListObjectVersions$ = [
      9,
      n0,
      _LOVi,
      { [_h]: ["GET", "/?versions", 200] },
      () => ListObjectVersionsRequest$,
      () => ListObjectVersionsOutput$
    ];
    ListParts$ = [
      9,
      n0,
      _LP,
      { [_h]: ["GET", "/{Key+}?x-id=ListParts", 200] },
      () => ListPartsRequest$,
      () => ListPartsOutput$
    ];
    PutBucketAbac$ = [
      9,
      n0,
      _PBA,
      { [_hC]: "-", [_h]: ["PUT", "/?abac", 200] },
      () => PutBucketAbacRequest$,
      () => __Unit
    ];
    PutBucketAccelerateConfiguration$ = [
      9,
      n0,
      _PBAC,
      { [_hC]: "-", [_h]: ["PUT", "/?accelerate", 200] },
      () => PutBucketAccelerateConfigurationRequest$,
      () => __Unit
    ];
    PutBucketAcl$ = [
      9,
      n0,
      _PBAu,
      { [_hC]: "-", [_h]: ["PUT", "/?acl", 200] },
      () => PutBucketAclRequest$,
      () => __Unit
    ];
    PutBucketAnalyticsConfiguration$ = [
      9,
      n0,
      _PBACu,
      { [_h]: ["PUT", "/?analytics", 200] },
      () => PutBucketAnalyticsConfigurationRequest$,
      () => __Unit
    ];
    PutBucketCors$ = [
      9,
      n0,
      _PBC,
      { [_hC]: "-", [_h]: ["PUT", "/?cors", 200] },
      () => PutBucketCorsRequest$,
      () => __Unit
    ];
    PutBucketEncryption$ = [
      9,
      n0,
      _PBE,
      { [_hC]: "-", [_h]: ["PUT", "/?encryption", 200] },
      () => PutBucketEncryptionRequest$,
      () => __Unit
    ];
    PutBucketIntelligentTieringConfiguration$ = [
      9,
      n0,
      _PBITC,
      { [_h]: ["PUT", "/?intelligent-tiering", 200] },
      () => PutBucketIntelligentTieringConfigurationRequest$,
      () => __Unit
    ];
    PutBucketInventoryConfiguration$ = [
      9,
      n0,
      _PBIC,
      { [_h]: ["PUT", "/?inventory", 200] },
      () => PutBucketInventoryConfigurationRequest$,
      () => __Unit
    ];
    PutBucketLifecycleConfiguration$ = [
      9,
      n0,
      _PBLC,
      { [_hC]: "-", [_h]: ["PUT", "/?lifecycle", 200] },
      () => PutBucketLifecycleConfigurationRequest$,
      () => PutBucketLifecycleConfigurationOutput$
    ];
    PutBucketLogging$ = [
      9,
      n0,
      _PBL,
      { [_hC]: "-", [_h]: ["PUT", "/?logging", 200] },
      () => PutBucketLoggingRequest$,
      () => __Unit
    ];
    PutBucketMetricsConfiguration$ = [
      9,
      n0,
      _PBMC,
      { [_h]: ["PUT", "/?metrics", 200] },
      () => PutBucketMetricsConfigurationRequest$,
      () => __Unit
    ];
    PutBucketNotificationConfiguration$ = [
      9,
      n0,
      _PBNC,
      { [_h]: ["PUT", "/?notification", 200] },
      () => PutBucketNotificationConfigurationRequest$,
      () => __Unit
    ];
    PutBucketOwnershipControls$ = [
      9,
      n0,
      _PBOC,
      { [_hC]: "-", [_h]: ["PUT", "/?ownershipControls", 200] },
      () => PutBucketOwnershipControlsRequest$,
      () => __Unit
    ];
    PutBucketPolicy$ = [
      9,
      n0,
      _PBP,
      { [_hC]: "-", [_h]: ["PUT", "/?policy", 200] },
      () => PutBucketPolicyRequest$,
      () => __Unit
    ];
    PutBucketReplication$ = [
      9,
      n0,
      _PBR,
      { [_hC]: "-", [_h]: ["PUT", "/?replication", 200] },
      () => PutBucketReplicationRequest$,
      () => __Unit
    ];
    PutBucketRequestPayment$ = [
      9,
      n0,
      _PBRP,
      { [_hC]: "-", [_h]: ["PUT", "/?requestPayment", 200] },
      () => PutBucketRequestPaymentRequest$,
      () => __Unit
    ];
    PutBucketTagging$ = [
      9,
      n0,
      _PBT,
      { [_hC]: "-", [_h]: ["PUT", "/?tagging", 200] },
      () => PutBucketTaggingRequest$,
      () => __Unit
    ];
    PutBucketVersioning$ = [
      9,
      n0,
      _PBV,
      { [_hC]: "-", [_h]: ["PUT", "/?versioning", 200] },
      () => PutBucketVersioningRequest$,
      () => __Unit
    ];
    PutBucketWebsite$ = [
      9,
      n0,
      _PBW,
      { [_hC]: "-", [_h]: ["PUT", "/?website", 200] },
      () => PutBucketWebsiteRequest$,
      () => __Unit
    ];
    PutObject$ = [
      9,
      n0,
      _PO,
      { [_hC]: "-", [_h]: ["PUT", "/{Key+}?x-id=PutObject", 200] },
      () => PutObjectRequest$,
      () => PutObjectOutput$
    ];
    PutObjectAcl$ = [
      9,
      n0,
      _POA,
      { [_hC]: "-", [_h]: ["PUT", "/{Key+}?acl", 200] },
      () => PutObjectAclRequest$,
      () => PutObjectAclOutput$
    ];
    PutObjectLegalHold$ = [
      9,
      n0,
      _POLH,
      { [_hC]: "-", [_h]: ["PUT", "/{Key+}?legal-hold", 200] },
      () => PutObjectLegalHoldRequest$,
      () => PutObjectLegalHoldOutput$
    ];
    PutObjectLockConfiguration$ = [
      9,
      n0,
      _POLC,
      { [_hC]: "-", [_h]: ["PUT", "/?object-lock", 200] },
      () => PutObjectLockConfigurationRequest$,
      () => PutObjectLockConfigurationOutput$
    ];
    PutObjectRetention$ = [
      9,
      n0,
      _PORu,
      { [_hC]: "-", [_h]: ["PUT", "/{Key+}?retention", 200] },
      () => PutObjectRetentionRequest$,
      () => PutObjectRetentionOutput$
    ];
    PutObjectTagging$ = [
      9,
      n0,
      _POT,
      { [_hC]: "-", [_h]: ["PUT", "/{Key+}?tagging", 200] },
      () => PutObjectTaggingRequest$,
      () => PutObjectTaggingOutput$
    ];
    PutPublicAccessBlock$ = [
      9,
      n0,
      _PPAB,
      { [_hC]: "-", [_h]: ["PUT", "/?publicAccessBlock", 200] },
      () => PutPublicAccessBlockRequest$,
      () => __Unit
    ];
    RenameObject$ = [
      9,
      n0,
      _RO,
      { [_h]: ["PUT", "/{Key+}?renameObject", 200] },
      () => RenameObjectRequest$,
      () => RenameObjectOutput$
    ];
    RestoreObject$ = [
      9,
      n0,
      _ROe,
      { [_hC]: "-", [_h]: ["POST", "/{Key+}?restore", 200] },
      () => RestoreObjectRequest$,
      () => RestoreObjectOutput$
    ];
    SelectObjectContent$ = [
      9,
      n0,
      _SOC,
      { [_h]: ["POST", "/{Key+}?select&select-type=2", 200] },
      () => SelectObjectContentRequest$,
      () => SelectObjectContentOutput$
    ];
    UpdateBucketMetadataInventoryTableConfiguration$ = [
      9,
      n0,
      _UBMITC,
      { [_hC]: "-", [_h]: ["PUT", "/?metadataInventoryTable", 200] },
      () => UpdateBucketMetadataInventoryTableConfigurationRequest$,
      () => __Unit
    ];
    UpdateBucketMetadataJournalTableConfiguration$ = [
      9,
      n0,
      _UBMJTC,
      { [_hC]: "-", [_h]: ["PUT", "/?metadataJournalTable", 200] },
      () => UpdateBucketMetadataJournalTableConfigurationRequest$,
      () => __Unit
    ];
    UploadPart$ = [
      9,
      n0,
      _UP,
      { [_hC]: "-", [_h]: ["PUT", "/{Key+}?x-id=UploadPart", 200] },
      () => UploadPartRequest$,
      () => UploadPartOutput$
    ];
    UploadPartCopy$ = [
      9,
      n0,
      _UPC,
      { [_h]: ["PUT", "/{Key+}?x-id=UploadPartCopy", 200] },
      () => UploadPartCopyRequest$,
      () => UploadPartCopyOutput$
    ];
    WriteGetObjectResponse$ = [
      9,
      n0,
      _WGOR,
      { [_en]: ["{RequestRoute}."], [_h]: ["POST", "/WriteGetObjectResponse", 200] },
      () => WriteGetObjectResponseRequest$,
      () => __Unit
    ];
  }
});
var CreateSessionCommand;
var init_CreateSessionCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/CreateSessionCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    CreateSessionCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      DisableS3ExpressSessionAuth: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "CreateSession", {}).n("S3Client", "CreateSessionCommand").sc(CreateSession$).build() {
      static {
        __name(this, "CreateSessionCommand");
      }
      static {
        __name2(this, "CreateSessionCommand");
      }
    };
  }
});
var package_default;
var init_package = __esm({
  "../node_modules/@aws-sdk/client-s3/package.json"() {
    package_default = {
      name: "@aws-sdk/client-s3",
      description: "AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native",
      version: "3.975.0",
      scripts: {
        build: "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
        "build:cjs": "node ../../scripts/compilation/inline client-s3",
        "build:es": "tsc -p tsconfig.es.json",
        "build:include:deps": 'yarn g:turbo run build -F="$npm_package_name"',
        "build:types": "tsc -p tsconfig.types.json",
        "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
        clean: "premove dist-cjs dist-es dist-types tsconfig.cjs.tsbuildinfo tsconfig.es.tsbuildinfo tsconfig.types.tsbuildinfo",
        "extract:docs": "api-extractor run --local",
        "generate:client": "node ../../scripts/generate-clients/single-service --solo s3",
        test: "yarn g:vitest run",
        "test:browser": "node ./test/browser-build/esbuild && yarn g:vitest run -c vitest.config.browser.mts",
        "test:browser:watch": "node ./test/browser-build/esbuild && yarn g:vitest watch -c vitest.config.browser.mts",
        "test:e2e": "yarn g:vitest run -c vitest.config.e2e.mts && yarn test:browser",
        "test:e2e:watch": "yarn g:vitest watch -c vitest.config.e2e.mts",
        "test:index": "tsc --noEmit ./test/index-types.ts && node ./test/index-objects.spec.mjs",
        "test:integration": "yarn g:vitest run -c vitest.config.integ.mts",
        "test:integration:watch": "yarn g:vitest watch -c vitest.config.integ.mts",
        "test:watch": "yarn g:vitest watch"
      },
      main: "./dist-cjs/index.js",
      types: "./dist-types/index.d.ts",
      module: "./dist-es/index.js",
      sideEffects: false,
      dependencies: {
        "@aws-crypto/sha1-browser": "5.2.0",
        "@aws-crypto/sha256-browser": "5.2.0",
        "@aws-crypto/sha256-js": "5.2.0",
        "@aws-sdk/core": "^3.973.1",
        "@aws-sdk/credential-provider-node": "^3.972.1",
        "@aws-sdk/middleware-bucket-endpoint": "^3.972.1",
        "@aws-sdk/middleware-expect-continue": "^3.972.1",
        "@aws-sdk/middleware-flexible-checksums": "^3.972.1",
        "@aws-sdk/middleware-host-header": "^3.972.1",
        "@aws-sdk/middleware-location-constraint": "^3.972.1",
        "@aws-sdk/middleware-logger": "^3.972.1",
        "@aws-sdk/middleware-recursion-detection": "^3.972.1",
        "@aws-sdk/middleware-sdk-s3": "^3.972.2",
        "@aws-sdk/middleware-ssec": "^3.972.1",
        "@aws-sdk/middleware-user-agent": "^3.972.2",
        "@aws-sdk/region-config-resolver": "^3.972.1",
        "@aws-sdk/signature-v4-multi-region": "3.972.0",
        "@aws-sdk/types": "^3.973.0",
        "@aws-sdk/util-endpoints": "3.972.0",
        "@aws-sdk/util-user-agent-browser": "^3.972.1",
        "@aws-sdk/util-user-agent-node": "^3.972.1",
        "@smithy/config-resolver": "^4.4.6",
        "@smithy/core": "^3.21.1",
        "@smithy/eventstream-serde-browser": "^4.2.8",
        "@smithy/eventstream-serde-config-resolver": "^4.3.8",
        "@smithy/eventstream-serde-node": "^4.2.8",
        "@smithy/fetch-http-handler": "^5.3.9",
        "@smithy/hash-blob-browser": "^4.2.9",
        "@smithy/hash-node": "^4.2.8",
        "@smithy/hash-stream-node": "^4.2.8",
        "@smithy/invalid-dependency": "^4.2.8",
        "@smithy/md5-js": "^4.2.8",
        "@smithy/middleware-content-length": "^4.2.8",
        "@smithy/middleware-endpoint": "^4.4.11",
        "@smithy/middleware-retry": "^4.4.27",
        "@smithy/middleware-serde": "^4.2.9",
        "@smithy/middleware-stack": "^4.2.8",
        "@smithy/node-config-provider": "^4.3.8",
        "@smithy/node-http-handler": "^4.4.8",
        "@smithy/protocol-http": "^5.3.8",
        "@smithy/smithy-client": "^4.10.12",
        "@smithy/types": "^4.12.0",
        "@smithy/url-parser": "^4.2.8",
        "@smithy/util-base64": "^4.3.0",
        "@smithy/util-body-length-browser": "^4.2.0",
        "@smithy/util-body-length-node": "^4.2.1",
        "@smithy/util-defaults-mode-browser": "^4.3.26",
        "@smithy/util-defaults-mode-node": "^4.2.29",
        "@smithy/util-endpoints": "^3.2.8",
        "@smithy/util-middleware": "^4.2.8",
        "@smithy/util-retry": "^4.2.8",
        "@smithy/util-stream": "^4.5.10",
        "@smithy/util-utf8": "^4.2.0",
        "@smithy/util-waiter": "^4.2.8",
        tslib: "^2.6.2"
      },
      devDependencies: {
        "@aws-sdk/signature-v4-crt": "3.972.0",
        "@tsconfig/node20": "20.1.8",
        "@types/node": "^20.14.8",
        concurrently: "7.0.0",
        "downlevel-dts": "0.10.1",
        premove: "4.0.0",
        typescript: "~5.8.3"
      },
      engines: {
        node: ">=20.0.0"
      },
      typesVersions: {
        "<4.0": {
          "dist-types/*": [
            "dist-types/ts3.4/*"
          ]
        }
      },
      files: [
        "dist-*/**"
      ],
      author: {
        name: "AWS SDK for JavaScript Team",
        url: "https://aws.amazon.com/javascript/"
      },
      license: "Apache-2.0",
      browser: {
        "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser"
      },
      "react-native": {
        "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native"
      },
      homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-s3",
      repository: {
        type: "git",
        url: "https://github.com/aws/aws-sdk-js-v3.git",
        directory: "clients/client-s3"
      }
    };
  }
});
var fromUtf84;
var init_fromUtf8_browser3 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    fromUtf84 = /* @__PURE__ */ __name2((input) => new TextEncoder().encode(input), "fromUtf8");
  }
});
var init_toUint8Array3 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/node_modules/@smithy/util-utf8/dist-es/toUint8Array.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fromUtf8_browser3();
  }
});
var init_toUtf8_browser3 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/node_modules/@smithy/util-utf8/dist-es/toUtf8.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es45 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/node_modules/@smithy/util-utf8/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_fromUtf8_browser3();
    init_toUint8Array3();
    init_toUtf8_browser3();
  }
});
function isEmptyData2(data) {
  if (typeof data === "string") {
    return data.length === 0;
  }
  return data.byteLength === 0;
}
__name(isEmptyData2, "isEmptyData2");
var init_isEmptyData2 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/build/module/isEmptyData.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(isEmptyData2, "isEmptyData");
  }
});
var SHA_1_HASH;
var SHA_1_HMAC_ALGO;
var EMPTY_DATA_SHA_1;
var init_constants10 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/build/module/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SHA_1_HASH = { name: "SHA-1" };
    SHA_1_HMAC_ALGO = {
      name: "HMAC",
      hash: SHA_1_HASH
    };
    EMPTY_DATA_SHA_1 = new Uint8Array([
      218,
      57,
      163,
      238,
      94,
      107,
      75,
      13,
      50,
      85,
      191,
      239,
      149,
      96,
      24,
      144,
      175,
      216,
      7,
      9
    ]);
  }
});
function locateWindow() {
  if (typeof window !== "undefined") {
    return window;
  } else if (typeof self !== "undefined") {
    return self;
  }
  return fallbackWindow;
}
__name(locateWindow, "locateWindow");
var fallbackWindow;
var init_dist_es46 = __esm({
  "../node_modules/@aws-sdk/util-locate-window/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    fallbackWindow = {};
    __name2(locateWindow, "locateWindow");
  }
});
function convertToBuffer2(data) {
  if (typeof data === "string") {
    return fromUtf84(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}
__name(convertToBuffer2, "convertToBuffer2");
var Sha1;
var init_webCryptoSha1 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/build/module/webCryptoSha1.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es45();
    init_isEmptyData2();
    init_constants10();
    init_dist_es46();
    Sha1 = /** @class */
    function() {
      function Sha13(secret) {
        this.toHash = new Uint8Array(0);
        if (secret !== void 0) {
          this.key = new Promise(function(resolve, reject) {
            locateWindow().crypto.subtle.importKey("raw", convertToBuffer2(secret), SHA_1_HMAC_ALGO, false, ["sign"]).then(resolve, reject);
          });
          this.key.catch(function() {
          });
        }
      }
      __name(Sha13, "Sha13");
      __name2(Sha13, "Sha1");
      Sha13.prototype.update = function(data) {
        if (isEmptyData2(data)) {
          return;
        }
        var update = convertToBuffer2(data);
        var typedArray = new Uint8Array(this.toHash.byteLength + update.byteLength);
        typedArray.set(this.toHash, 0);
        typedArray.set(update, this.toHash.byteLength);
        this.toHash = typedArray;
      };
      Sha13.prototype.digest = function() {
        var _this = this;
        if (this.key) {
          return this.key.then(function(key) {
            return locateWindow().crypto.subtle.sign(SHA_1_HMAC_ALGO, key, _this.toHash).then(function(data) {
              return new Uint8Array(data);
            });
          });
        }
        if (isEmptyData2(this.toHash)) {
          return Promise.resolve(EMPTY_DATA_SHA_1);
        }
        return Promise.resolve().then(function() {
          return locateWindow().crypto.subtle.digest(SHA_1_HASH, _this.toHash);
        }).then(function(data) {
          return Promise.resolve(new Uint8Array(data));
        });
      };
      Sha13.prototype.reset = function() {
        this.toHash = new Uint8Array(0);
      };
      return Sha13;
    }();
    __name2(convertToBuffer2, "convertToBuffer");
  }
});
function supportsWebCrypto(window2) {
  if (supportsSecureRandom(window2) && typeof window2.crypto.subtle === "object") {
    var subtle = window2.crypto.subtle;
    return supportsSubtleCrypto(subtle);
  }
  return false;
}
__name(supportsWebCrypto, "supportsWebCrypto");
function supportsSecureRandom(window2) {
  if (typeof window2 === "object" && typeof window2.crypto === "object") {
    var getRandomValues = window2.crypto.getRandomValues;
    return typeof getRandomValues === "function";
  }
  return false;
}
__name(supportsSecureRandom, "supportsSecureRandom");
function supportsSubtleCrypto(subtle) {
  return subtle && subtleCryptoMethods.every(function(methodName) {
    return typeof subtle[methodName] === "function";
  });
}
__name(supportsSubtleCrypto, "supportsSubtleCrypto");
var subtleCryptoMethods;
var init_supportsWebCrypto = __esm({
  "../node_modules/@aws-crypto/supports-web-crypto/build/module/supportsWebCrypto.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    subtleCryptoMethods = [
      "decrypt",
      "digest",
      "encrypt",
      "exportKey",
      "generateKey",
      "importKey",
      "sign",
      "verify"
    ];
    __name2(supportsWebCrypto, "supportsWebCrypto");
    __name2(supportsSecureRandom, "supportsSecureRandom");
    __name2(supportsSubtleCrypto, "supportsSubtleCrypto");
  }
});
var init_module4 = __esm({
  "../node_modules/@aws-crypto/supports-web-crypto/build/module/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_supportsWebCrypto();
  }
});
var Sha12;
var init_crossPlatformSha1 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/build/module/crossPlatformSha1.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_webCryptoSha1();
    init_module4();
    init_dist_es46();
    init_module();
    Sha12 = /** @class */
    function() {
      function Sha13(secret) {
        if (supportsWebCrypto(locateWindow())) {
          this.hash = new Sha1(secret);
        } else {
          throw new Error("SHA1 not supported");
        }
      }
      __name(Sha13, "Sha13");
      __name2(Sha13, "Sha1");
      Sha13.prototype.update = function(data, encoding) {
        this.hash.update(convertToBuffer(data));
      };
      Sha13.prototype.digest = function() {
        return this.hash.digest();
      };
      Sha13.prototype.reset = function() {
        this.hash.reset();
      };
      return Sha13;
    }();
  }
});
var init_module5 = __esm({
  "../node_modules/@aws-crypto/sha1-browser/build/module/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_crossPlatformSha1();
    init_webCryptoSha1();
  }
});
var SHA_256_HASH;
var SHA_256_HMAC_ALGO;
var EMPTY_DATA_SHA_256;
var init_constants11 = __esm({
  "../node_modules/@aws-crypto/sha256-browser/build/module/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SHA_256_HASH = { name: "SHA-256" };
    SHA_256_HMAC_ALGO = {
      name: "HMAC",
      hash: SHA_256_HASH
    };
    EMPTY_DATA_SHA_256 = new Uint8Array([
      227,
      176,
      196,
      66,
      152,
      252,
      28,
      20,
      154,
      251,
      244,
      200,
      153,
      111,
      185,
      36,
      39,
      174,
      65,
      228,
      100,
      155,
      147,
      76,
      164,
      149,
      153,
      27,
      120,
      82,
      184,
      85
    ]);
  }
});
var Sha256;
var init_webCryptoSha256 = __esm({
  "../node_modules/@aws-crypto/sha256-browser/build/module/webCryptoSha256.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_module();
    init_constants11();
    init_dist_es46();
    Sha256 = /** @class */
    function() {
      function Sha2564(secret) {
        this.toHash = new Uint8Array(0);
        this.secret = secret;
        this.reset();
      }
      __name(Sha2564, "Sha2564");
      __name2(Sha2564, "Sha256");
      Sha2564.prototype.update = function(data) {
        if (isEmptyData(data)) {
          return;
        }
        var update = convertToBuffer(data);
        var typedArray = new Uint8Array(this.toHash.byteLength + update.byteLength);
        typedArray.set(this.toHash, 0);
        typedArray.set(update, this.toHash.byteLength);
        this.toHash = typedArray;
      };
      Sha2564.prototype.digest = function() {
        var _this = this;
        if (this.key) {
          return this.key.then(function(key) {
            return locateWindow().crypto.subtle.sign(SHA_256_HMAC_ALGO, key, _this.toHash).then(function(data) {
              return new Uint8Array(data);
            });
          });
        }
        if (isEmptyData(this.toHash)) {
          return Promise.resolve(EMPTY_DATA_SHA_256);
        }
        return Promise.resolve().then(function() {
          return locateWindow().crypto.subtle.digest(SHA_256_HASH, _this.toHash);
        }).then(function(data) {
          return Promise.resolve(new Uint8Array(data));
        });
      };
      Sha2564.prototype.reset = function() {
        var _this = this;
        this.toHash = new Uint8Array(0);
        if (this.secret && this.secret !== void 0) {
          this.key = new Promise(function(resolve, reject) {
            locateWindow().crypto.subtle.importKey("raw", convertToBuffer(_this.secret), SHA_256_HMAC_ALGO, false, ["sign"]).then(resolve, reject);
          });
          this.key.catch(function() {
          });
        }
      };
      return Sha2564;
    }();
  }
});
var BLOCK_SIZE;
var DIGEST_LENGTH;
var KEY;
var INIT;
var MAX_HASHABLE_LENGTH;
var init_constants12 = __esm({
  "../node_modules/@aws-crypto/sha256-js/build/module/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    BLOCK_SIZE = 64;
    DIGEST_LENGTH = 32;
    KEY = new Uint32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    INIT = [
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ];
    MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;
  }
});
var RawSha256;
var init_RawSha256 = __esm({
  "../node_modules/@aws-crypto/sha256-js/build/module/RawSha256.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_constants12();
    RawSha256 = /** @class */
    function() {
      function RawSha2562() {
        this.state = Int32Array.from(INIT);
        this.temp = new Int32Array(64);
        this.buffer = new Uint8Array(64);
        this.bufferLength = 0;
        this.bytesHashed = 0;
        this.finished = false;
      }
      __name(RawSha2562, "RawSha2562");
      __name2(RawSha2562, "RawSha256");
      RawSha2562.prototype.update = function(data) {
        if (this.finished) {
          throw new Error("Attempted to update an already finished hash.");
        }
        var position = 0;
        var byteLength = data.byteLength;
        this.bytesHashed += byteLength;
        if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) {
          throw new Error("Cannot hash more than 2^53 - 1 bits");
        }
        while (byteLength > 0) {
          this.buffer[this.bufferLength++] = data[position++];
          byteLength--;
          if (this.bufferLength === BLOCK_SIZE) {
            this.hashBuffer();
            this.bufferLength = 0;
          }
        }
      };
      RawSha2562.prototype.digest = function() {
        if (!this.finished) {
          var bitsHashed = this.bytesHashed * 8;
          var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
          var undecoratedLength = this.bufferLength;
          bufferView.setUint8(this.bufferLength++, 128);
          if (undecoratedLength % BLOCK_SIZE >= BLOCK_SIZE - 8) {
            for (var i2 = this.bufferLength; i2 < BLOCK_SIZE; i2++) {
              bufferView.setUint8(i2, 0);
            }
            this.hashBuffer();
            this.bufferLength = 0;
          }
          for (var i2 = this.bufferLength; i2 < BLOCK_SIZE - 8; i2++) {
            bufferView.setUint8(i2, 0);
          }
          bufferView.setUint32(BLOCK_SIZE - 8, Math.floor(bitsHashed / 4294967296), true);
          bufferView.setUint32(BLOCK_SIZE - 4, bitsHashed);
          this.hashBuffer();
          this.finished = true;
        }
        var out = new Uint8Array(DIGEST_LENGTH);
        for (var i2 = 0; i2 < 8; i2++) {
          out[i2 * 4] = this.state[i2] >>> 24 & 255;
          out[i2 * 4 + 1] = this.state[i2] >>> 16 & 255;
          out[i2 * 4 + 2] = this.state[i2] >>> 8 & 255;
          out[i2 * 4 + 3] = this.state[i2] >>> 0 & 255;
        }
        return out;
      };
      RawSha2562.prototype.hashBuffer = function() {
        var _a = this, buffer = _a.buffer, state = _a.state;
        var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
        for (var i2 = 0; i2 < BLOCK_SIZE; i2++) {
          if (i2 < 16) {
            this.temp[i2] = (buffer[i2 * 4] & 255) << 24 | (buffer[i2 * 4 + 1] & 255) << 16 | (buffer[i2 * 4 + 2] & 255) << 8 | buffer[i2 * 4 + 3] & 255;
          } else {
            var u2 = this.temp[i2 - 2];
            var t1_1 = (u2 >>> 17 | u2 << 15) ^ (u2 >>> 19 | u2 << 13) ^ u2 >>> 10;
            u2 = this.temp[i2 - 15];
            var t2_1 = (u2 >>> 7 | u2 << 25) ^ (u2 >>> 18 | u2 << 14) ^ u2 >>> 3;
            this.temp[i2] = (t1_1 + this.temp[i2 - 7] | 0) + (t2_1 + this.temp[i2 - 16] | 0);
          }
          var t12 = (((state4 >>> 6 | state4 << 26) ^ (state4 >>> 11 | state4 << 21) ^ (state4 >>> 25 | state4 << 7)) + (state4 & state5 ^ ~state4 & state6) | 0) + (state7 + (KEY[i2] + this.temp[i2] | 0) | 0) | 0;
          var t22 = ((state0 >>> 2 | state0 << 30) ^ (state0 >>> 13 | state0 << 19) ^ (state0 >>> 22 | state0 << 10)) + (state0 & state1 ^ state0 & state2 ^ state1 & state2) | 0;
          state7 = state6;
          state6 = state5;
          state5 = state4;
          state4 = state3 + t12 | 0;
          state3 = state2;
          state2 = state1;
          state1 = state0;
          state0 = t12 + t22 | 0;
        }
        state[0] += state0;
        state[1] += state1;
        state[2] += state2;
        state[3] += state3;
        state[4] += state4;
        state[5] += state5;
        state[6] += state6;
        state[7] += state7;
      };
      return RawSha2562;
    }();
  }
});
function bufferFromSecret(secret) {
  var input = convertToBuffer(secret);
  if (input.byteLength > BLOCK_SIZE) {
    var bufferHash = new RawSha256();
    bufferHash.update(input);
    input = bufferHash.digest();
  }
  var buffer = new Uint8Array(BLOCK_SIZE);
  buffer.set(input);
  return buffer;
}
__name(bufferFromSecret, "bufferFromSecret");
var Sha2562;
var init_jsSha256 = __esm({
  "../node_modules/@aws-crypto/sha256-js/build/module/jsSha256.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_tslib_es6();
    init_constants12();
    init_RawSha256();
    init_module();
    Sha2562 = /** @class */
    function() {
      function Sha2564(secret) {
        this.secret = secret;
        this.hash = new RawSha256();
        this.reset();
      }
      __name(Sha2564, "Sha2564");
      __name2(Sha2564, "Sha256");
      Sha2564.prototype.update = function(toHash) {
        if (isEmptyData(toHash) || this.error) {
          return;
        }
        try {
          this.hash.update(convertToBuffer(toHash));
        } catch (e2) {
          this.error = e2;
        }
      };
      Sha2564.prototype.digestSync = function() {
        if (this.error) {
          throw this.error;
        }
        if (this.outer) {
          if (!this.outer.finished) {
            this.outer.update(this.hash.digest());
          }
          return this.outer.digest();
        }
        return this.hash.digest();
      };
      Sha2564.prototype.digest = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, this.digestSync()];
          });
        });
      };
      Sha2564.prototype.reset = function() {
        this.hash = new RawSha256();
        if (this.secret) {
          this.outer = new RawSha256();
          var inner = bufferFromSecret(this.secret);
          var outer = new Uint8Array(BLOCK_SIZE);
          outer.set(inner);
          for (var i2 = 0; i2 < BLOCK_SIZE; i2++) {
            inner[i2] ^= 54;
            outer[i2] ^= 92;
          }
          this.hash.update(inner);
          this.outer.update(outer);
          for (var i2 = 0; i2 < inner.byteLength; i2++) {
            inner[i2] = 0;
          }
        }
      };
      return Sha2564;
    }();
    __name2(bufferFromSecret, "bufferFromSecret");
  }
});
var init_module6 = __esm({
  "../node_modules/@aws-crypto/sha256-js/build/module/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_jsSha256();
  }
});
var Sha2563;
var init_crossPlatformSha256 = __esm({
  "../node_modules/@aws-crypto/sha256-browser/build/module/crossPlatformSha256.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_webCryptoSha256();
    init_module6();
    init_module4();
    init_dist_es46();
    init_module();
    Sha2563 = /** @class */
    function() {
      function Sha2564(secret) {
        if (supportsWebCrypto(locateWindow())) {
          this.hash = new Sha256(secret);
        } else {
          this.hash = new Sha2562(secret);
        }
      }
      __name(Sha2564, "Sha2564");
      __name2(Sha2564, "Sha256");
      Sha2564.prototype.update = function(data, encoding) {
        this.hash.update(convertToBuffer(data));
      };
      Sha2564.prototype.digest = function() {
        return this.hash.digest();
      };
      Sha2564.prototype.reset = function() {
        this.hash.reset();
      };
      return Sha2564;
    }();
  }
});
var init_module7 = __esm({
  "../node_modules/@aws-crypto/sha256-browser/build/module/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_crossPlatformSha256();
    init_webCryptoSha256();
  }
});
var createDefaultUserAgentProvider;
var fallback;
var init_dist_es47 = __esm({
  "../node_modules/@aws-sdk/util-user-agent-browser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    createDefaultUserAgentProvider = /* @__PURE__ */ __name2(({ serviceId, clientVersion }) => async (config) => {
      const navigator = typeof window !== "undefined" ? window.navigator : void 0;
      const uaString = navigator?.userAgent ?? "";
      const osName = navigator?.userAgentData?.platform ?? fallback.os(uaString) ?? "other";
      const osVersion = void 0;
      const brands = navigator?.userAgentData?.brands ?? [];
      const brand = brands[brands.length - 1];
      const browserName = brand?.brand ?? fallback.browser(uaString) ?? "unknown";
      const browserVersion = brand?.version ?? "unknown";
      const sections = [
        ["aws-sdk-js", clientVersion],
        ["ua", "2.1"],
        [`os/${osName}`, osVersion],
        ["lang/js"],
        ["md/browser", `${browserName}_${browserVersion}`]
      ];
      if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
      }
      const appId = await config?.userAgentAppId?.();
      if (appId) {
        sections.push([`app/${appId}`]);
      }
      return sections;
    }, "createDefaultUserAgentProvider");
    fallback = {
      os(ua) {
        if (/iPhone|iPad|iPod/.test(ua))
          return "iOS";
        if (/Macintosh|Mac OS X/.test(ua))
          return "macOS";
        if (/Windows NT/.test(ua))
          return "Windows";
        if (/Android/.test(ua))
          return "Android";
        if (/Linux/.test(ua))
          return "Linux";
        return void 0;
      },
      browser(ua) {
        if (/EdgiOS|EdgA|Edg\//.test(ua))
          return "Microsoft Edge";
        if (/Firefox\//.test(ua))
          return "Firefox";
        if (/Chrome\//.test(ua))
          return "Chrome";
        if (/Safari\//.test(ua))
          return "Safari";
        return void 0;
      }
    };
  }
});
function negate2(bytes) {
  for (let i2 = 0; i2 < 8; i2++) {
    bytes[i2] ^= 255;
  }
  for (let i2 = 7; i2 > -1; i2--) {
    bytes[i2]++;
    if (bytes[i2] !== 0)
      break;
  }
}
__name(negate2, "negate2");
var Int642;
var init_Int64 = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/Int64.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es11();
    Int642 = class _Int64 {
      static {
        __name(this, "_Int64");
      }
      static {
        __name2(this, "Int64");
      }
      bytes;
      constructor(bytes) {
        this.bytes = bytes;
        if (bytes.byteLength !== 8) {
          throw new Error("Int64 buffers must be exactly 8 bytes");
        }
      }
      static fromNumber(number) {
        if (number > 9223372036854776e3 || number < -9223372036854776e3) {
          throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
        }
        const bytes = new Uint8Array(8);
        for (let i2 = 7, remaining = Math.abs(Math.round(number)); i2 > -1 && remaining > 0; i2--, remaining /= 256) {
          bytes[i2] = remaining;
        }
        if (number < 0) {
          negate2(bytes);
        }
        return new _Int64(bytes);
      }
      valueOf() {
        const bytes = this.bytes.slice(0);
        const negative = bytes[0] & 128;
        if (negative) {
          negate2(bytes);
        }
        return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
      }
      toString() {
        return String(this.valueOf());
      }
    };
    __name2(negate2, "negate");
  }
});
var HeaderMarshaller;
var HEADER_VALUE_TYPE2;
var BOOLEAN_TAG;
var BYTE_TAG;
var SHORT_TAG;
var INT_TAG;
var LONG_TAG;
var BINARY_TAG;
var STRING_TAG;
var TIMESTAMP_TAG;
var UUID_TAG;
var UUID_PATTERN2;
var init_HeaderMarshaller = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/HeaderMarshaller.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es11();
    init_Int64();
    HeaderMarshaller = class {
      static {
        __name(this, "HeaderMarshaller");
      }
      static {
        __name2(this, "HeaderMarshaller");
      }
      toUtf8;
      fromUtf8;
      constructor(toUtf82, fromUtf85) {
        this.toUtf8 = toUtf82;
        this.fromUtf8 = fromUtf85;
      }
      format(headers) {
        const chunks = [];
        for (const headerName of Object.keys(headers)) {
          const bytes = this.fromUtf8(headerName);
          chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
        }
        const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
        let position = 0;
        for (const chunk of chunks) {
          out.set(chunk, position);
          position += chunk.byteLength;
        }
        return out;
      }
      formatHeaderValue(header) {
        switch (header.type) {
          case "boolean":
            return Uint8Array.from([header.value ? 0 : 1]);
          case "byte":
            return Uint8Array.from([2, header.value]);
          case "short":
            const shortView = new DataView(new ArrayBuffer(3));
            shortView.setUint8(0, 3);
            shortView.setInt16(1, header.value, false);
            return new Uint8Array(shortView.buffer);
          case "integer":
            const intView = new DataView(new ArrayBuffer(5));
            intView.setUint8(0, 4);
            intView.setInt32(1, header.value, false);
            return new Uint8Array(intView.buffer);
          case "long":
            const longBytes = new Uint8Array(9);
            longBytes[0] = 5;
            longBytes.set(header.value.bytes, 1);
            return longBytes;
          case "binary":
            const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
            binView.setUint8(0, 6);
            binView.setUint16(1, header.value.byteLength, false);
            const binBytes = new Uint8Array(binView.buffer);
            binBytes.set(header.value, 3);
            return binBytes;
          case "string":
            const utf8Bytes = this.fromUtf8(header.value);
            const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
            strView.setUint8(0, 7);
            strView.setUint16(1, utf8Bytes.byteLength, false);
            const strBytes = new Uint8Array(strView.buffer);
            strBytes.set(utf8Bytes, 3);
            return strBytes;
          case "timestamp":
            const tsBytes = new Uint8Array(9);
            tsBytes[0] = 8;
            tsBytes.set(Int642.fromNumber(header.value.valueOf()).bytes, 1);
            return tsBytes;
          case "uuid":
            if (!UUID_PATTERN2.test(header.value)) {
              throw new Error(`Invalid UUID received: ${header.value}`);
            }
            const uuidBytes = new Uint8Array(17);
            uuidBytes[0] = 9;
            uuidBytes.set(fromHex(header.value.replace(/\-/g, "")), 1);
            return uuidBytes;
        }
      }
      parse(headers) {
        const out = {};
        let position = 0;
        while (position < headers.byteLength) {
          const nameLength = headers.getUint8(position++);
          const name = this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, nameLength));
          position += nameLength;
          switch (headers.getUint8(position++)) {
            case 0:
              out[name] = {
                type: BOOLEAN_TAG,
                value: true
              };
              break;
            case 1:
              out[name] = {
                type: BOOLEAN_TAG,
                value: false
              };
              break;
            case 2:
              out[name] = {
                type: BYTE_TAG,
                value: headers.getInt8(position++)
              };
              break;
            case 3:
              out[name] = {
                type: SHORT_TAG,
                value: headers.getInt16(position, false)
              };
              position += 2;
              break;
            case 4:
              out[name] = {
                type: INT_TAG,
                value: headers.getInt32(position, false)
              };
              position += 4;
              break;
            case 5:
              out[name] = {
                type: LONG_TAG,
                value: new Int642(new Uint8Array(headers.buffer, headers.byteOffset + position, 8))
              };
              position += 8;
              break;
            case 6:
              const binaryLength = headers.getUint16(position, false);
              position += 2;
              out[name] = {
                type: BINARY_TAG,
                value: new Uint8Array(headers.buffer, headers.byteOffset + position, binaryLength)
              };
              position += binaryLength;
              break;
            case 7:
              const stringLength = headers.getUint16(position, false);
              position += 2;
              out[name] = {
                type: STRING_TAG,
                value: this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, stringLength))
              };
              position += stringLength;
              break;
            case 8:
              out[name] = {
                type: TIMESTAMP_TAG,
                value: new Date(new Int642(new Uint8Array(headers.buffer, headers.byteOffset + position, 8)).valueOf())
              };
              position += 8;
              break;
            case 9:
              const uuidBytes = new Uint8Array(headers.buffer, headers.byteOffset + position, 16);
              position += 16;
              out[name] = {
                type: UUID_TAG,
                value: `${toHex(uuidBytes.subarray(0, 4))}-${toHex(uuidBytes.subarray(4, 6))}-${toHex(uuidBytes.subarray(6, 8))}-${toHex(uuidBytes.subarray(8, 10))}-${toHex(uuidBytes.subarray(10))}`
              };
              break;
            default:
              throw new Error(`Unrecognized header type tag`);
          }
        }
        return out;
      }
    };
    (function(HEADER_VALUE_TYPE3) {
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
      HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
    })(HEADER_VALUE_TYPE2 || (HEADER_VALUE_TYPE2 = {}));
    BOOLEAN_TAG = "boolean";
    BYTE_TAG = "byte";
    SHORT_TAG = "short";
    INT_TAG = "integer";
    LONG_TAG = "long";
    BINARY_TAG = "binary";
    STRING_TAG = "string";
    TIMESTAMP_TAG = "timestamp";
    UUID_TAG = "uuid";
    UUID_PATTERN2 = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  }
});
function splitMessage({ byteLength, byteOffset, buffer }) {
  if (byteLength < MINIMUM_MESSAGE_LENGTH) {
    throw new Error("Provided message too short to accommodate event stream message overhead");
  }
  const view = new DataView(buffer, byteOffset, byteLength);
  const messageLength = view.getUint32(0, false);
  if (byteLength !== messageLength) {
    throw new Error("Reported message length does not match received message length");
  }
  const headerLength = view.getUint32(PRELUDE_MEMBER_LENGTH, false);
  const expectedPreludeChecksum = view.getUint32(PRELUDE_LENGTH, false);
  const expectedMessageChecksum = view.getUint32(byteLength - CHECKSUM_LENGTH, false);
  const checksummer = new Crc32().update(new Uint8Array(buffer, byteOffset, PRELUDE_LENGTH));
  if (expectedPreludeChecksum !== checksummer.digest()) {
    throw new Error(`The prelude checksum specified in the message (${expectedPreludeChecksum}) does not match the calculated CRC32 checksum (${checksummer.digest()})`);
  }
  checksummer.update(new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH, byteLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH)));
  if (expectedMessageChecksum !== checksummer.digest()) {
    throw new Error(`The message checksum (${checksummer.digest()}) did not match the expected value of ${expectedMessageChecksum}`);
  }
  return {
    headers: new DataView(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH, headerLength),
    body: new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH + headerLength, messageLength - headerLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH + CHECKSUM_LENGTH))
  };
}
__name(splitMessage, "splitMessage");
var PRELUDE_MEMBER_LENGTH;
var PRELUDE_LENGTH;
var CHECKSUM_LENGTH;
var MINIMUM_MESSAGE_LENGTH;
var init_splitMessage = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/splitMessage.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_module3();
    PRELUDE_MEMBER_LENGTH = 4;
    PRELUDE_LENGTH = PRELUDE_MEMBER_LENGTH * 2;
    CHECKSUM_LENGTH = 4;
    MINIMUM_MESSAGE_LENGTH = PRELUDE_LENGTH + CHECKSUM_LENGTH * 2;
    __name2(splitMessage, "splitMessage");
  }
});
var EventStreamCodec;
var init_EventStreamCodec = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/EventStreamCodec.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_module3();
    init_HeaderMarshaller();
    init_splitMessage();
    EventStreamCodec = class {
      static {
        __name(this, "EventStreamCodec");
      }
      static {
        __name2(this, "EventStreamCodec");
      }
      headerMarshaller;
      messageBuffer;
      isEndOfStream;
      constructor(toUtf82, fromUtf85) {
        this.headerMarshaller = new HeaderMarshaller(toUtf82, fromUtf85);
        this.messageBuffer = [];
        this.isEndOfStream = false;
      }
      feed(message) {
        this.messageBuffer.push(this.decode(message));
      }
      endOfStream() {
        this.isEndOfStream = true;
      }
      getMessage() {
        const message = this.messageBuffer.pop();
        const isEndOfStream = this.isEndOfStream;
        return {
          getMessage() {
            return message;
          },
          isEndOfStream() {
            return isEndOfStream;
          }
        };
      }
      getAvailableMessages() {
        const messages = this.messageBuffer;
        this.messageBuffer = [];
        const isEndOfStream = this.isEndOfStream;
        return {
          getMessages() {
            return messages;
          },
          isEndOfStream() {
            return isEndOfStream;
          }
        };
      }
      encode({ headers: rawHeaders, body }) {
        const headers = this.headerMarshaller.format(rawHeaders);
        const length = headers.byteLength + body.byteLength + 16;
        const out = new Uint8Array(length);
        const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
        const checksum = new Crc32();
        view.setUint32(0, length, false);
        view.setUint32(4, headers.byteLength, false);
        view.setUint32(8, checksum.update(out.subarray(0, 8)).digest(), false);
        out.set(headers, 12);
        out.set(body, headers.byteLength + 12);
        view.setUint32(length - 4, checksum.update(out.subarray(8, length - 4)).digest(), false);
        return out;
      }
      decode(message) {
        const { headers, body } = splitMessage(message);
        return { headers: this.headerMarshaller.parse(headers), body };
      }
      formatHeaders(rawHeaders) {
        return this.headerMarshaller.format(rawHeaders);
      }
    };
  }
});
var init_Message = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/Message.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var MessageDecoderStream;
var init_MessageDecoderStream = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/MessageDecoderStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    MessageDecoderStream = class {
      static {
        __name(this, "MessageDecoderStream");
      }
      static {
        __name2(this, "MessageDecoderStream");
      }
      options;
      constructor(options) {
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const bytes of this.options.inputStream) {
          const decoded = this.options.decoder.decode(bytes);
          yield decoded;
        }
      }
    };
  }
});
var MessageEncoderStream;
var init_MessageEncoderStream = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/MessageEncoderStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    MessageEncoderStream = class {
      static {
        __name(this, "MessageEncoderStream");
      }
      static {
        __name2(this, "MessageEncoderStream");
      }
      options;
      constructor(options) {
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const msg of this.options.messageStream) {
          const encoded = this.options.encoder.encode(msg);
          yield encoded;
        }
        if (this.options.includeEndFrame) {
          yield new Uint8Array(0);
        }
      }
    };
  }
});
var SmithyMessageDecoderStream;
var init_SmithyMessageDecoderStream = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/SmithyMessageDecoderStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SmithyMessageDecoderStream = class {
      static {
        __name(this, "SmithyMessageDecoderStream");
      }
      static {
        __name2(this, "SmithyMessageDecoderStream");
      }
      options;
      constructor(options) {
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const message of this.options.messageStream) {
          const deserialized = await this.options.deserializer(message);
          if (deserialized === void 0)
            continue;
          yield deserialized;
        }
      }
    };
  }
});
var SmithyMessageEncoderStream;
var init_SmithyMessageEncoderStream = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/SmithyMessageEncoderStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    SmithyMessageEncoderStream = class {
      static {
        __name(this, "SmithyMessageEncoderStream");
      }
      static {
        __name2(this, "SmithyMessageEncoderStream");
      }
      options;
      constructor(options) {
        this.options = options;
      }
      [Symbol.asyncIterator]() {
        return this.asyncIterator();
      }
      async *asyncIterator() {
        for await (const chunk of this.options.inputStream) {
          const payloadBuf = this.options.serializer(chunk);
          yield payloadBuf;
        }
      }
    };
  }
});
var init_dist_es48 = __esm({
  "../node_modules/@smithy/eventstream-codec/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EventStreamCodec();
    init_HeaderMarshaller();
    init_Int64();
    init_Message();
    init_MessageDecoderStream();
    init_MessageEncoderStream();
    init_SmithyMessageDecoderStream();
    init_SmithyMessageEncoderStream();
  }
});
function getChunkedStream(source) {
  let currentMessageTotalLength = 0;
  let currentMessagePendingLength = 0;
  let currentMessage = null;
  let messageLengthBuffer = null;
  const allocateMessage = /* @__PURE__ */ __name2((size) => {
    if (typeof size !== "number") {
      throw new Error("Attempted to allocate an event message where size was not a number: " + size);
    }
    currentMessageTotalLength = size;
    currentMessagePendingLength = 4;
    currentMessage = new Uint8Array(size);
    const currentMessageView = new DataView(currentMessage.buffer);
    currentMessageView.setUint32(0, size, false);
  }, "allocateMessage");
  const iterator = /* @__PURE__ */ __name2(async function* () {
    const sourceIterator = source[Symbol.asyncIterator]();
    while (true) {
      const { value, done } = await sourceIterator.next();
      if (done) {
        if (!currentMessageTotalLength) {
          return;
        } else if (currentMessageTotalLength === currentMessagePendingLength) {
          yield currentMessage;
        } else {
          throw new Error("Truncated event message received.");
        }
        return;
      }
      const chunkLength = value.length;
      let currentOffset = 0;
      while (currentOffset < chunkLength) {
        if (!currentMessage) {
          const bytesRemaining = chunkLength - currentOffset;
          if (!messageLengthBuffer) {
            messageLengthBuffer = new Uint8Array(4);
          }
          const numBytesForTotal = Math.min(4 - currentMessagePendingLength, bytesRemaining);
          messageLengthBuffer.set(value.slice(currentOffset, currentOffset + numBytesForTotal), currentMessagePendingLength);
          currentMessagePendingLength += numBytesForTotal;
          currentOffset += numBytesForTotal;
          if (currentMessagePendingLength < 4) {
            break;
          }
          allocateMessage(new DataView(messageLengthBuffer.buffer).getUint32(0, false));
          messageLengthBuffer = null;
        }
        const numBytesToWrite = Math.min(currentMessageTotalLength - currentMessagePendingLength, chunkLength - currentOffset);
        currentMessage.set(value.slice(currentOffset, currentOffset + numBytesToWrite), currentMessagePendingLength);
        currentMessagePendingLength += numBytesToWrite;
        currentOffset += numBytesToWrite;
        if (currentMessageTotalLength && currentMessageTotalLength === currentMessagePendingLength) {
          yield currentMessage;
          currentMessage = null;
          currentMessageTotalLength = 0;
          currentMessagePendingLength = 0;
        }
      }
    }
  }, "iterator");
  return {
    [Symbol.asyncIterator]: iterator
  };
}
__name(getChunkedStream, "getChunkedStream");
var init_getChunkedStream = __esm({
  "../node_modules/@smithy/eventstream-serde-universal/dist-es/getChunkedStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(getChunkedStream, "getChunkedStream");
  }
});
function getMessageUnmarshaller(deserializer, toUtf82) {
  return async function(message) {
    const { value: messageType } = message.headers[":message-type"];
    if (messageType === "error") {
      const unmodeledError = new Error(message.headers[":error-message"].value || "UnknownError");
      unmodeledError.name = message.headers[":error-code"].value;
      throw unmodeledError;
    } else if (messageType === "exception") {
      const code = message.headers[":exception-type"].value;
      const exception = { [code]: message };
      const deserializedException = await deserializer(exception);
      if (deserializedException.$unknown) {
        const error = new Error(toUtf82(message.body));
        error.name = code;
        throw error;
      }
      throw deserializedException[code];
    } else if (messageType === "event") {
      const event = {
        [message.headers[":event-type"].value]: message
      };
      const deserialized = await deserializer(event);
      if (deserialized.$unknown)
        return;
      return deserialized;
    } else {
      throw Error(`Unrecognizable event type: ${message.headers[":event-type"].value}`);
    }
  };
}
__name(getMessageUnmarshaller, "getMessageUnmarshaller");
var init_getUnmarshalledStream = __esm({
  "../node_modules/@smithy/eventstream-serde-universal/dist-es/getUnmarshalledStream.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(getMessageUnmarshaller, "getMessageUnmarshaller");
  }
});
var EventStreamMarshaller;
var init_EventStreamMarshaller = __esm({
  "../node_modules/@smithy/eventstream-serde-universal/dist-es/EventStreamMarshaller.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es48();
    init_getChunkedStream();
    init_getUnmarshalledStream();
    EventStreamMarshaller = class {
      static {
        __name(this, "EventStreamMarshaller");
      }
      static {
        __name2(this, "EventStreamMarshaller");
      }
      eventStreamCodec;
      utfEncoder;
      constructor({ utf8Encoder, utf8Decoder }) {
        this.eventStreamCodec = new EventStreamCodec(utf8Encoder, utf8Decoder);
        this.utfEncoder = utf8Encoder;
      }
      deserialize(body, deserializer) {
        const inputStream = getChunkedStream(body);
        return new SmithyMessageDecoderStream({
          messageStream: new MessageDecoderStream({ inputStream, decoder: this.eventStreamCodec }),
          deserializer: getMessageUnmarshaller(deserializer, this.utfEncoder)
        });
      }
      serialize(inputStream, serializer) {
        return new MessageEncoderStream({
          messageStream: new SmithyMessageEncoderStream({ inputStream, serializer }),
          encoder: this.eventStreamCodec,
          includeEndFrame: true
        });
      }
    };
  }
});
var init_provider = __esm({
  "../node_modules/@smithy/eventstream-serde-universal/dist-es/provider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es49 = __esm({
  "../node_modules/@smithy/eventstream-serde-universal/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EventStreamMarshaller();
    init_provider();
  }
});
var readableStreamtoIterable;
var iterableToReadableStream;
var init_utils3 = __esm({
  "../node_modules/@smithy/eventstream-serde-browser/dist-es/utils.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    readableStreamtoIterable = /* @__PURE__ */ __name2((readableStream) => ({
      [Symbol.asyncIterator]: async function* () {
        const reader = readableStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              return;
            yield value;
          }
        } finally {
          reader.releaseLock();
        }
      }
    }), "readableStreamtoIterable");
    iterableToReadableStream = /* @__PURE__ */ __name2((asyncIterable) => {
      const iterator = asyncIterable[Symbol.asyncIterator]();
      return new ReadableStream({
        async pull(controller) {
          const { done, value } = await iterator.next();
          if (done) {
            return controller.close();
          }
          controller.enqueue(value);
        }
      });
    }, "iterableToReadableStream");
  }
});
var EventStreamMarshaller2;
var isReadableStream2;
var init_EventStreamMarshaller2 = __esm({
  "../node_modules/@smithy/eventstream-serde-browser/dist-es/EventStreamMarshaller.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es49();
    init_utils3();
    EventStreamMarshaller2 = class {
      static {
        __name(this, "EventStreamMarshaller2");
      }
      static {
        __name2(this, "EventStreamMarshaller");
      }
      universalMarshaller;
      constructor({ utf8Encoder, utf8Decoder }) {
        this.universalMarshaller = new EventStreamMarshaller({
          utf8Decoder,
          utf8Encoder
        });
      }
      deserialize(body, deserializer) {
        const bodyIterable = isReadableStream2(body) ? readableStreamtoIterable(body) : body;
        return this.universalMarshaller.deserialize(bodyIterable, deserializer);
      }
      serialize(input, serializer) {
        const serialziedIterable = this.universalMarshaller.serialize(input, serializer);
        return typeof ReadableStream === "function" ? iterableToReadableStream(serialziedIterable) : serialziedIterable;
      }
    };
    isReadableStream2 = /* @__PURE__ */ __name2((body) => typeof ReadableStream === "function" && body instanceof ReadableStream, "isReadableStream");
  }
});
var eventStreamSerdeProvider;
var init_provider2 = __esm({
  "../node_modules/@smithy/eventstream-serde-browser/dist-es/provider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EventStreamMarshaller2();
    eventStreamSerdeProvider = /* @__PURE__ */ __name2((options) => new EventStreamMarshaller2(options), "eventStreamSerdeProvider");
  }
});
var init_dist_es50 = __esm({
  "../node_modules/@smithy/eventstream-serde-browser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_EventStreamMarshaller2();
    init_provider2();
    init_utils3();
  }
});
async function blobReader(blob, onChunk, chunkSize = 1024 * 1024) {
  const size = blob.size;
  let totalBytesRead = 0;
  while (totalBytesRead < size) {
    const slice = blob.slice(totalBytesRead, Math.min(size, totalBytesRead + chunkSize));
    onChunk(new Uint8Array(await slice.arrayBuffer()));
    totalBytesRead += slice.size;
  }
}
__name(blobReader, "blobReader");
var init_dist_es51 = __esm({
  "../node_modules/@smithy/chunked-blob-reader/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(blobReader, "blobReader");
  }
});
var blobHasher;
var init_dist_es52 = __esm({
  "../node_modules/@smithy/hash-blob-browser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es51();
    blobHasher = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(async function blobHasher2(hashCtor, blob) {
      const hash = new hashCtor();
      await blobReader(blob, (chunk) => {
        hash.update(chunk);
      });
      return hash.digest();
    }, "blobHasher2"), "blobHasher");
  }
});
var init_invalidFunction = __esm({
  "../node_modules/@smithy/invalid-dependency/dist-es/invalidFunction.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var invalidProvider;
var init_invalidProvider = __esm({
  "../node_modules/@smithy/invalid-dependency/dist-es/invalidProvider.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    invalidProvider = /* @__PURE__ */ __name2((message) => () => Promise.reject(message), "invalidProvider");
  }
});
var init_dist_es53 = __esm({
  "../node_modules/@smithy/invalid-dependency/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_invalidFunction();
    init_invalidProvider();
  }
});
var BLOCK_SIZE2;
var DIGEST_LENGTH2;
var INIT2;
var init_constants13 = __esm({
  "../node_modules/@smithy/md5-js/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    BLOCK_SIZE2 = 64;
    DIGEST_LENGTH2 = 16;
    INIT2 = [1732584193, 4023233417, 2562383102, 271733878];
  }
});
function cmn(q2, a2, b2, x2, s2, t8) {
  a2 = (a2 + q2 & 4294967295) + (x2 + t8 & 4294967295) & 4294967295;
  return (a2 << s2 | a2 >>> 32 - s2) + b2 & 4294967295;
}
__name(cmn, "cmn");
function ff(a2, b2, c2, d2, x2, s2, t8) {
  return cmn(b2 & c2 | ~b2 & d2, a2, b2, x2, s2, t8);
}
__name(ff, "ff");
function gg(a2, b2, c2, d2, x2, s2, t8) {
  return cmn(b2 & d2 | c2 & ~d2, a2, b2, x2, s2, t8);
}
__name(gg, "gg");
function hh(a2, b2, c2, d2, x2, s2, t8) {
  return cmn(b2 ^ c2 ^ d2, a2, b2, x2, s2, t8);
}
__name(hh, "hh");
function ii(a2, b2, c2, d2, x2, s2, t8) {
  return cmn(c2 ^ (b2 | ~d2), a2, b2, x2, s2, t8);
}
__name(ii, "ii");
function isEmptyData3(data) {
  if (typeof data === "string") {
    return data.length === 0;
  }
  return data.byteLength === 0;
}
__name(isEmptyData3, "isEmptyData3");
function convertToBuffer3(data) {
  if (typeof data === "string") {
    return fromUtf8(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  return new Uint8Array(data);
}
__name(convertToBuffer3, "convertToBuffer3");
var Md5;
var init_dist_es54 = __esm({
  "../node_modules/@smithy/md5-js/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es6();
    init_constants13();
    Md5 = class {
      static {
        __name(this, "Md5");
      }
      static {
        __name2(this, "Md5");
      }
      state;
      buffer;
      bufferLength;
      bytesHashed;
      finished;
      constructor() {
        this.reset();
      }
      update(sourceData) {
        if (isEmptyData3(sourceData)) {
          return;
        } else if (this.finished) {
          throw new Error("Attempted to update an already finished hash.");
        }
        const data = convertToBuffer3(sourceData);
        let position = 0;
        let { byteLength } = data;
        this.bytesHashed += byteLength;
        while (byteLength > 0) {
          this.buffer.setUint8(this.bufferLength++, data[position++]);
          byteLength--;
          if (this.bufferLength === BLOCK_SIZE2) {
            this.hashBuffer();
            this.bufferLength = 0;
          }
        }
      }
      async digest() {
        if (!this.finished) {
          const { buffer, bufferLength: undecoratedLength, bytesHashed } = this;
          const bitsHashed = bytesHashed * 8;
          buffer.setUint8(this.bufferLength++, 128);
          if (undecoratedLength % BLOCK_SIZE2 >= BLOCK_SIZE2 - 8) {
            for (let i2 = this.bufferLength; i2 < BLOCK_SIZE2; i2++) {
              buffer.setUint8(i2, 0);
            }
            this.hashBuffer();
            this.bufferLength = 0;
          }
          for (let i2 = this.bufferLength; i2 < BLOCK_SIZE2 - 8; i2++) {
            buffer.setUint8(i2, 0);
          }
          buffer.setUint32(BLOCK_SIZE2 - 8, bitsHashed >>> 0, true);
          buffer.setUint32(BLOCK_SIZE2 - 4, Math.floor(bitsHashed / 4294967296), true);
          this.hashBuffer();
          this.finished = true;
        }
        const out = new DataView(new ArrayBuffer(DIGEST_LENGTH2));
        for (let i2 = 0; i2 < 4; i2++) {
          out.setUint32(i2 * 4, this.state[i2], true);
        }
        return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
      }
      hashBuffer() {
        const { buffer, state } = this;
        let a2 = state[0], b2 = state[1], c2 = state[2], d2 = state[3];
        a2 = ff(a2, b2, c2, d2, buffer.getUint32(0, true), 7, 3614090360);
        d2 = ff(d2, a2, b2, c2, buffer.getUint32(4, true), 12, 3905402710);
        c2 = ff(c2, d2, a2, b2, buffer.getUint32(8, true), 17, 606105819);
        b2 = ff(b2, c2, d2, a2, buffer.getUint32(12, true), 22, 3250441966);
        a2 = ff(a2, b2, c2, d2, buffer.getUint32(16, true), 7, 4118548399);
        d2 = ff(d2, a2, b2, c2, buffer.getUint32(20, true), 12, 1200080426);
        c2 = ff(c2, d2, a2, b2, buffer.getUint32(24, true), 17, 2821735955);
        b2 = ff(b2, c2, d2, a2, buffer.getUint32(28, true), 22, 4249261313);
        a2 = ff(a2, b2, c2, d2, buffer.getUint32(32, true), 7, 1770035416);
        d2 = ff(d2, a2, b2, c2, buffer.getUint32(36, true), 12, 2336552879);
        c2 = ff(c2, d2, a2, b2, buffer.getUint32(40, true), 17, 4294925233);
        b2 = ff(b2, c2, d2, a2, buffer.getUint32(44, true), 22, 2304563134);
        a2 = ff(a2, b2, c2, d2, buffer.getUint32(48, true), 7, 1804603682);
        d2 = ff(d2, a2, b2, c2, buffer.getUint32(52, true), 12, 4254626195);
        c2 = ff(c2, d2, a2, b2, buffer.getUint32(56, true), 17, 2792965006);
        b2 = ff(b2, c2, d2, a2, buffer.getUint32(60, true), 22, 1236535329);
        a2 = gg(a2, b2, c2, d2, buffer.getUint32(4, true), 5, 4129170786);
        d2 = gg(d2, a2, b2, c2, buffer.getUint32(24, true), 9, 3225465664);
        c2 = gg(c2, d2, a2, b2, buffer.getUint32(44, true), 14, 643717713);
        b2 = gg(b2, c2, d2, a2, buffer.getUint32(0, true), 20, 3921069994);
        a2 = gg(a2, b2, c2, d2, buffer.getUint32(20, true), 5, 3593408605);
        d2 = gg(d2, a2, b2, c2, buffer.getUint32(40, true), 9, 38016083);
        c2 = gg(c2, d2, a2, b2, buffer.getUint32(60, true), 14, 3634488961);
        b2 = gg(b2, c2, d2, a2, buffer.getUint32(16, true), 20, 3889429448);
        a2 = gg(a2, b2, c2, d2, buffer.getUint32(36, true), 5, 568446438);
        d2 = gg(d2, a2, b2, c2, buffer.getUint32(56, true), 9, 3275163606);
        c2 = gg(c2, d2, a2, b2, buffer.getUint32(12, true), 14, 4107603335);
        b2 = gg(b2, c2, d2, a2, buffer.getUint32(32, true), 20, 1163531501);
        a2 = gg(a2, b2, c2, d2, buffer.getUint32(52, true), 5, 2850285829);
        d2 = gg(d2, a2, b2, c2, buffer.getUint32(8, true), 9, 4243563512);
        c2 = gg(c2, d2, a2, b2, buffer.getUint32(28, true), 14, 1735328473);
        b2 = gg(b2, c2, d2, a2, buffer.getUint32(48, true), 20, 2368359562);
        a2 = hh(a2, b2, c2, d2, buffer.getUint32(20, true), 4, 4294588738);
        d2 = hh(d2, a2, b2, c2, buffer.getUint32(32, true), 11, 2272392833);
        c2 = hh(c2, d2, a2, b2, buffer.getUint32(44, true), 16, 1839030562);
        b2 = hh(b2, c2, d2, a2, buffer.getUint32(56, true), 23, 4259657740);
        a2 = hh(a2, b2, c2, d2, buffer.getUint32(4, true), 4, 2763975236);
        d2 = hh(d2, a2, b2, c2, buffer.getUint32(16, true), 11, 1272893353);
        c2 = hh(c2, d2, a2, b2, buffer.getUint32(28, true), 16, 4139469664);
        b2 = hh(b2, c2, d2, a2, buffer.getUint32(40, true), 23, 3200236656);
        a2 = hh(a2, b2, c2, d2, buffer.getUint32(52, true), 4, 681279174);
        d2 = hh(d2, a2, b2, c2, buffer.getUint32(0, true), 11, 3936430074);
        c2 = hh(c2, d2, a2, b2, buffer.getUint32(12, true), 16, 3572445317);
        b2 = hh(b2, c2, d2, a2, buffer.getUint32(24, true), 23, 76029189);
        a2 = hh(a2, b2, c2, d2, buffer.getUint32(36, true), 4, 3654602809);
        d2 = hh(d2, a2, b2, c2, buffer.getUint32(48, true), 11, 3873151461);
        c2 = hh(c2, d2, a2, b2, buffer.getUint32(60, true), 16, 530742520);
        b2 = hh(b2, c2, d2, a2, buffer.getUint32(8, true), 23, 3299628645);
        a2 = ii(a2, b2, c2, d2, buffer.getUint32(0, true), 6, 4096336452);
        d2 = ii(d2, a2, b2, c2, buffer.getUint32(28, true), 10, 1126891415);
        c2 = ii(c2, d2, a2, b2, buffer.getUint32(56, true), 15, 2878612391);
        b2 = ii(b2, c2, d2, a2, buffer.getUint32(20, true), 21, 4237533241);
        a2 = ii(a2, b2, c2, d2, buffer.getUint32(48, true), 6, 1700485571);
        d2 = ii(d2, a2, b2, c2, buffer.getUint32(12, true), 10, 2399980690);
        c2 = ii(c2, d2, a2, b2, buffer.getUint32(40, true), 15, 4293915773);
        b2 = ii(b2, c2, d2, a2, buffer.getUint32(4, true), 21, 2240044497);
        a2 = ii(a2, b2, c2, d2, buffer.getUint32(32, true), 6, 1873313359);
        d2 = ii(d2, a2, b2, c2, buffer.getUint32(60, true), 10, 4264355552);
        c2 = ii(c2, d2, a2, b2, buffer.getUint32(24, true), 15, 2734768916);
        b2 = ii(b2, c2, d2, a2, buffer.getUint32(52, true), 21, 1309151649);
        a2 = ii(a2, b2, c2, d2, buffer.getUint32(16, true), 6, 4149444226);
        d2 = ii(d2, a2, b2, c2, buffer.getUint32(44, true), 10, 3174756917);
        c2 = ii(c2, d2, a2, b2, buffer.getUint32(8, true), 15, 718787259);
        b2 = ii(b2, c2, d2, a2, buffer.getUint32(36, true), 21, 3951481745);
        state[0] = a2 + state[0] & 4294967295;
        state[1] = b2 + state[1] & 4294967295;
        state[2] = c2 + state[2] & 4294967295;
        state[3] = d2 + state[3] & 4294967295;
      }
      reset() {
        this.state = Uint32Array.from(INIT2);
        this.buffer = new DataView(new ArrayBuffer(BLOCK_SIZE2));
        this.bufferLength = 0;
        this.bytesHashed = 0;
        this.finished = false;
      }
    };
    __name2(cmn, "cmn");
    __name2(ff, "ff");
    __name2(gg, "gg");
    __name2(hh, "hh");
    __name2(ii, "ii");
    __name2(isEmptyData3, "isEmptyData");
    __name2(convertToBuffer3, "convertToBuffer");
  }
});
var DEFAULTS_MODE_OPTIONS;
var init_constants14 = __esm({
  "../node_modules/@smithy/util-defaults-mode-browser/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    DEFAULTS_MODE_OPTIONS = ["in-region", "cross-region", "mobile", "standard", "legacy"];
  }
});
var resolveDefaultsModeConfig;
var useMobileConfiguration;
var init_resolveDefaultsModeConfig = __esm({
  "../node_modules/@smithy/util-defaults-mode-browser/dist-es/resolveDefaultsModeConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es15();
    init_constants14();
    resolveDefaultsModeConfig = /* @__PURE__ */ __name2(({ defaultsMode } = {}) => memoize(async () => {
      const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
      switch (mode?.toLowerCase()) {
        case "auto":
          return Promise.resolve(useMobileConfiguration() ? "mobile" : "standard");
        case "mobile":
        case "in-region":
        case "cross-region":
        case "standard":
        case "legacy":
          return Promise.resolve(mode?.toLocaleLowerCase());
        case void 0:
          return Promise.resolve("legacy");
        default:
          throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
      }
    }), "resolveDefaultsModeConfig");
    useMobileConfiguration = /* @__PURE__ */ __name2(() => {
      const navigator = window?.navigator;
      if (navigator?.connection) {
        const { effectiveType, rtt, downlink } = navigator?.connection;
        const slow = typeof effectiveType === "string" && effectiveType !== "4g" || Number(rtt) > 100 || Number(downlink) < 10;
        if (slow) {
          return true;
        }
      }
      return navigator?.userAgentData?.mobile || typeof navigator?.maxTouchPoints === "number" && navigator?.maxTouchPoints > 1;
    }, "useMobileConfiguration");
  }
});
var init_dist_es55 = __esm({
  "../node_modules/@smithy/util-defaults-mode-browser/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_resolveDefaultsModeConfig();
  }
});
var getRuntimeConfig;
var init_runtimeConfig_shared = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.shared.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es22();
    init_protocols2();
    init_dist_es44();
    init_dist_es20();
    init_dist_es33();
    init_dist_es7();
    init_dist_es12();
    init_dist_es6();
    init_httpAuthSchemeProvider();
    init_endpointResolver();
    getRuntimeConfig = /* @__PURE__ */ __name2((config) => {
      return {
        apiVersion: "2006-03-01",
        base64Decoder: config?.base64Decoder ?? fromBase64,
        base64Encoder: config?.base64Encoder ?? toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        getAwsChunkedEncodingStream: config?.getAwsChunkedEncodingStream ?? getAwsChunkedEncodingStream,
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultS3HttpAuthSchemeProvider,
        httpAuthSchemes: config?.httpAuthSchemes ?? [
          {
            schemeId: "aws.auth#sigv4",
            identityProvider: /* @__PURE__ */ __name2((ipc) => ipc.getIdentityProvider("aws.auth#sigv4"), "identityProvider"),
            signer: new AwsSdkSigV4Signer()
          },
          {
            schemeId: "aws.auth#sigv4a",
            identityProvider: /* @__PURE__ */ __name2((ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"), "identityProvider"),
            signer: new AwsSdkSigV4ASigner()
          }
        ],
        logger: config?.logger ?? new NoOpLogger(),
        protocol: config?.protocol ?? AwsRestXmlProtocol,
        protocolSettings: config?.protocolSettings ?? {
          defaultNamespace: "com.amazonaws.s3",
          xmlNamespace: "http://s3.amazonaws.com/doc/2006-03-01/",
          version: "2006-03-01",
          serviceTarget: "AmazonS3"
        },
        sdkStreamMixin: config?.sdkStreamMixin ?? sdkStreamMixin,
        serviceId: config?.serviceId ?? "S3",
        signerConstructor: config?.signerConstructor ?? SignatureV4MultiRegion,
        signingEscapePath: config?.signingEscapePath ?? false,
        urlParser: config?.urlParser ?? parseUrl,
        useArnRegion: config?.useArnRegion ?? void 0,
        utf8Decoder: config?.utf8Decoder ?? fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? toUtf8
      };
    }, "getRuntimeConfig");
  }
});
var getRuntimeConfig2;
var init_runtimeConfig_browser = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_package();
    init_module5();
    init_module7();
    init_dist_es47();
    init_dist_es36();
    init_dist_es50();
    init_dist_es10();
    init_dist_es52();
    init_dist_es53();
    init_dist_es54();
    init_dist_es20();
    init_dist_es18();
    init_dist_es55();
    init_dist_es41();
    init_runtimeConfig_shared();
    getRuntimeConfig2 = /* @__PURE__ */ __name2((config) => {
      const defaultsMode = resolveDefaultsModeConfig(config);
      const defaultConfigProvider = /* @__PURE__ */ __name2(() => defaultsMode().then(loadConfigsForDefaultMode), "defaultConfigProvider");
      const clientSharedValues = getRuntimeConfig(config);
      return {
        ...clientSharedValues,
        ...config,
        runtime: "browser",
        defaultsMode,
        bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
        credentialDefaultProvider: config?.credentialDefaultProvider ?? ((_) => () => Promise.reject(new Error("Credential is missing"))),
        defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: package_default.version }),
        eventStreamSerdeProvider: config?.eventStreamSerdeProvider ?? eventStreamSerdeProvider,
        maxAttempts: config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
        md5: config?.md5 ?? Md5,
        region: config?.region ?? invalidProvider("Region is missing"),
        requestHandler: FetchHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
        retryMode: config?.retryMode ?? (async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE),
        sha1: config?.sha1 ?? Sha12,
        sha256: config?.sha256 ?? Sha2563,
        streamCollector: config?.streamCollector ?? streamCollector,
        streamHasher: config?.streamHasher ?? blobHasher,
        useDualstackEndpoint: config?.useDualstackEndpoint ?? (() => Promise.resolve(DEFAULT_USE_DUALSTACK_ENDPOINT)),
        useFipsEndpoint: config?.useFipsEndpoint ?? (() => Promise.resolve(DEFAULT_USE_FIPS_ENDPOINT))
      };
    }, "getRuntimeConfig");
  }
});
var getAwsRegionExtensionConfiguration;
var resolveAwsRegionExtensionConfiguration;
var init_extensions4 = __esm({
  "../node_modules/@aws-sdk/region-config-resolver/dist-es/extensions/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getAwsRegionExtensionConfiguration = /* @__PURE__ */ __name2((runtimeConfig) => {
      return {
        setRegion(region) {
          runtimeConfig.region = region;
        },
        region() {
          return runtimeConfig.region;
        }
      };
    }, "getAwsRegionExtensionConfiguration");
    resolveAwsRegionExtensionConfiguration = /* @__PURE__ */ __name2((awsRegionExtensionConfiguration) => {
      return {
        region: awsRegionExtensionConfiguration.region()
      };
    }, "resolveAwsRegionExtensionConfiguration");
  }
});
var init_awsRegionConfig = __esm({
  "../node_modules/@aws-sdk/region-config-resolver/dist-es/regionConfig/awsRegionConfig.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_stsRegionDefaultResolver_browser = __esm({
  "../node_modules/@aws-sdk/region-config-resolver/dist-es/regionConfig/stsRegionDefaultResolver.browser.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es56 = __esm({
  "../node_modules/@aws-sdk/region-config-resolver/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_extensions4();
    init_awsRegionConfig();
    init_stsRegionDefaultResolver_browser();
  }
});
var getHttpAuthExtensionConfiguration;
var resolveHttpAuthRuntimeConfig;
var init_httpAuthExtensionConfiguration = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthExtensionConfiguration.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    getHttpAuthExtensionConfiguration = /* @__PURE__ */ __name2((runtimeConfig) => {
      const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
      let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
      let _credentials = runtimeConfig.credentials;
      return {
        setHttpAuthScheme(httpAuthScheme) {
          const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
          if (index === -1) {
            _httpAuthSchemes.push(httpAuthScheme);
          } else {
            _httpAuthSchemes.splice(index, 1, httpAuthScheme);
          }
        },
        httpAuthSchemes() {
          return _httpAuthSchemes;
        },
        setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
          _httpAuthSchemeProvider = httpAuthSchemeProvider;
        },
        httpAuthSchemeProvider() {
          return _httpAuthSchemeProvider;
        },
        setCredentials(credentials) {
          _credentials = credentials;
        },
        credentials() {
          return _credentials;
        }
      };
    }, "getHttpAuthExtensionConfiguration");
    resolveHttpAuthRuntimeConfig = /* @__PURE__ */ __name2((config) => {
      return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials()
      };
    }, "resolveHttpAuthRuntimeConfig");
  }
});
var resolveRuntimeExtensions;
var init_runtimeExtensions = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/runtimeExtensions.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es56();
    init_dist_es2();
    init_dist_es20();
    init_httpAuthExtensionConfiguration();
    resolveRuntimeExtensions = /* @__PURE__ */ __name2((runtimeConfig, extensions) => {
      const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
      extensions.forEach((extension) => extension.configure(extensionConfiguration));
      return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
    }, "resolveRuntimeExtensions");
  }
});
var S3Client;
var init_S3Client = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/S3Client.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es3();
    init_dist_es25();
    init_dist_es26();
    init_dist_es27();
    init_dist_es28();
    init_dist_es30();
    init_dist_es35();
    init_dist_es36();
    init_dist_es14();
    init_schema2();
    init_dist_es37();
    init_dist_es38();
    init_dist_es39();
    init_dist_es42();
    init_dist_es20();
    init_httpAuthSchemeProvider();
    init_CreateSessionCommand();
    init_EndpointParameters();
    init_runtimeConfig_browser();
    init_runtimeExtensions();
    S3Client = class extends Client {
      static {
        __name(this, "S3Client");
      }
      static {
        __name2(this, "S3Client");
      }
      config;
      constructor(...[configuration]) {
        const _config_0 = getRuntimeConfig2(configuration || {});
        super(_config_0);
        this.initConfig = _config_0;
        const _config_1 = resolveClientEndpointParameters(_config_0);
        const _config_2 = resolveUserAgentConfig(_config_1);
        const _config_3 = resolveFlexibleChecksumsConfig(_config_2);
        const _config_4 = resolveRetryConfig(_config_3);
        const _config_5 = resolveRegionConfig(_config_4);
        const _config_6 = resolveHostHeaderConfig(_config_5);
        const _config_7 = resolveEndpointConfig(_config_6);
        const _config_8 = resolveEventStreamSerdeConfig(_config_7);
        const _config_9 = resolveHttpAuthSchemeConfig(_config_8);
        const _config_10 = resolveS3Config(_config_9, { session: [() => this, CreateSessionCommand] });
        const _config_11 = resolveRuntimeExtensions(_config_10, configuration?.extensions || []);
        this.config = _config_11;
        this.middlewareStack.use(getSchemaSerdePlugin(this.config));
        this.middlewareStack.use(getUserAgentPlugin(this.config));
        this.middlewareStack.use(getRetryPlugin(this.config));
        this.middlewareStack.use(getContentLengthPlugin(this.config));
        this.middlewareStack.use(getHostHeaderPlugin(this.config));
        this.middlewareStack.use(getLoggerPlugin(this.config));
        this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
        this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
          httpAuthSchemeParametersProvider: defaultS3HttpAuthSchemeParametersProvider,
          identityProviderConfigProvider: /* @__PURE__ */ __name2(async (config) => new DefaultIdentityProviderConfig({
            "aws.auth#sigv4": config.credentials,
            "aws.auth#sigv4a": config.credentials
          }), "identityProviderConfigProvider")
        }));
        this.middlewareStack.use(getHttpSigningPlugin(this.config));
        this.middlewareStack.use(getValidateBucketNamePlugin(this.config));
        this.middlewareStack.use(getAddExpectContinuePlugin(this.config));
        this.middlewareStack.use(getRegionRedirectMiddlewarePlugin(this.config));
        this.middlewareStack.use(getS3ExpressPlugin(this.config));
        this.middlewareStack.use(getS3ExpressHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    };
  }
});
var AbortMultipartUploadCommand;
var init_AbortMultipartUploadCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/AbortMultipartUploadCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    AbortMultipartUploadCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "AbortMultipartUpload", {}).n("S3Client", "AbortMultipartUploadCommand").sc(AbortMultipartUpload$).build() {
      static {
        __name(this, "AbortMultipartUploadCommand");
      }
      static {
        __name2(this, "AbortMultipartUploadCommand");
      }
    };
  }
});
function ssecMiddleware(options) {
  return (next) => async (args) => {
    const input = { ...args.input };
    const properties = [
      {
        target: "SSECustomerKey",
        hash: "SSECustomerKeyMD5"
      },
      {
        target: "CopySourceSSECustomerKey",
        hash: "CopySourceSSECustomerKeyMD5"
      }
    ];
    for (const prop of properties) {
      const value = input[prop.target];
      if (value) {
        let valueForHash;
        if (typeof value === "string") {
          if (isValidBase64EncodedSSECustomerKey(value, options)) {
            valueForHash = options.base64Decoder(value);
          } else {
            valueForHash = options.utf8Decoder(value);
            input[prop.target] = options.base64Encoder(valueForHash);
          }
        } else {
          valueForHash = ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value);
          input[prop.target] = options.base64Encoder(valueForHash);
        }
        const hash = new options.md5();
        hash.update(valueForHash);
        input[prop.hash] = options.base64Encoder(await hash.digest());
      }
    }
    return next({
      ...args,
      input
    });
  };
}
__name(ssecMiddleware, "ssecMiddleware");
function isValidBase64EncodedSSECustomerKey(str, options) {
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!base64Regex.test(str))
    return false;
  try {
    const decodedBytes = options.base64Decoder(str);
    return decodedBytes.length === 32;
  } catch {
    return false;
  }
}
__name(isValidBase64EncodedSSECustomerKey, "isValidBase64EncodedSSECustomerKey");
var ssecMiddlewareOptions;
var getSsecPlugin;
var init_dist_es57 = __esm({
  "../node_modules/@aws-sdk/middleware-ssec/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(ssecMiddleware, "ssecMiddleware");
    ssecMiddlewareOptions = {
      name: "ssecMiddleware",
      step: "initialize",
      tags: ["SSE"],
      override: true
    };
    getSsecPlugin = /* @__PURE__ */ __name2((config) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(ssecMiddleware(config), ssecMiddlewareOptions);
      }, "applyToStack")
    }), "getSsecPlugin");
    __name2(isValidBase64EncodedSSECustomerKey, "isValidBase64EncodedSSECustomerKey");
  }
});
var CompleteMultipartUploadCommand;
var init_CompleteMultipartUploadCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/CompleteMultipartUploadCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    CompleteMultipartUploadCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "CompleteMultipartUpload", {}).n("S3Client", "CompleteMultipartUploadCommand").sc(CompleteMultipartUpload$).build() {
      static {
        __name(this, "CompleteMultipartUploadCommand");
      }
      static {
        __name2(this, "CompleteMultipartUploadCommand");
      }
    };
  }
});
var CopyObjectCommand;
var init_CopyObjectCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/CopyObjectCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    CopyObjectCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      DisableS3ExpressSessionAuth: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" },
      CopySource: { type: "contextParams", name: "CopySource" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "CopyObject", {}).n("S3Client", "CopyObjectCommand").sc(CopyObject$).build() {
      static {
        __name(this, "CopyObjectCommand");
      }
      static {
        __name2(this, "CopyObjectCommand");
      }
    };
  }
});
function locationConstraintMiddleware(options) {
  return (next) => async (args) => {
    const { CreateBucketConfiguration } = args.input;
    const region = await options.region();
    if (!CreateBucketConfiguration?.LocationConstraint && !CreateBucketConfiguration?.Location) {
      if (region !== "us-east-1") {
        args.input.CreateBucketConfiguration = args.input.CreateBucketConfiguration ?? {};
        args.input.CreateBucketConfiguration.LocationConstraint = region;
      }
    }
    return next(args);
  };
}
__name(locationConstraintMiddleware, "locationConstraintMiddleware");
var locationConstraintMiddlewareOptions;
var getLocationConstraintPlugin;
var init_dist_es58 = __esm({
  "../node_modules/@aws-sdk/middleware-location-constraint/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(locationConstraintMiddleware, "locationConstraintMiddleware");
    locationConstraintMiddlewareOptions = {
      step: "initialize",
      tags: ["LOCATION_CONSTRAINT", "CREATE_BUCKET_CONFIGURATION"],
      name: "locationConstraintMiddleware",
      override: true
    };
    getLocationConstraintPlugin = /* @__PURE__ */ __name2((config) => ({
      applyToStack: /* @__PURE__ */ __name2((clientStack) => {
        clientStack.add(locationConstraintMiddleware(config), locationConstraintMiddlewareOptions);
      }, "applyToStack")
    }), "getLocationConstraintPlugin");
  }
});
var CreateBucketCommand;
var init_CreateBucketCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/CreateBucketCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es58();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    CreateBucketCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      DisableAccessPoints: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getLocationConstraintPlugin(config)
      ];
    }).s("AmazonS3", "CreateBucket", {}).n("S3Client", "CreateBucketCommand").sc(CreateBucket$).build() {
      static {
        __name(this, "CreateBucketCommand");
      }
      static {
        __name2(this, "CreateBucketCommand");
      }
    };
  }
});
var CreateBucketMetadataConfigurationCommand;
var init_CreateBucketMetadataConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/CreateBucketMetadataConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    CreateBucketMetadataConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "CreateBucketMetadataConfiguration", {}).n("S3Client", "CreateBucketMetadataConfigurationCommand").sc(CreateBucketMetadataConfiguration$).build() {
      static {
        __name(this, "CreateBucketMetadataConfigurationCommand");
      }
      static {
        __name2(this, "CreateBucketMetadataConfigurationCommand");
      }
    };
  }
});
var CreateBucketMetadataTableConfigurationCommand;
var init_CreateBucketMetadataTableConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/CreateBucketMetadataTableConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    CreateBucketMetadataTableConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "CreateBucketMetadataTableConfiguration", {}).n("S3Client", "CreateBucketMetadataTableConfigurationCommand").sc(CreateBucketMetadataTableConfiguration$).build() {
      static {
        __name(this, "CreateBucketMetadataTableConfigurationCommand");
      }
      static {
        __name2(this, "CreateBucketMetadataTableConfigurationCommand");
      }
    };
  }
});
var CreateMultipartUploadCommand;
var init_CreateMultipartUploadCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/CreateMultipartUploadCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    CreateMultipartUploadCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "CreateMultipartUpload", {}).n("S3Client", "CreateMultipartUploadCommand").sc(CreateMultipartUpload$).build() {
      static {
        __name(this, "CreateMultipartUploadCommand");
      }
      static {
        __name2(this, "CreateMultipartUploadCommand");
      }
    };
  }
});
var DeleteBucketAnalyticsConfigurationCommand;
var init_DeleteBucketAnalyticsConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketAnalyticsConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketAnalyticsConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketAnalyticsConfiguration", {}).n("S3Client", "DeleteBucketAnalyticsConfigurationCommand").sc(DeleteBucketAnalyticsConfiguration$).build() {
      static {
        __name(this, "DeleteBucketAnalyticsConfigurationCommand");
      }
      static {
        __name2(this, "DeleteBucketAnalyticsConfigurationCommand");
      }
    };
  }
});
var DeleteBucketCommand;
var init_DeleteBucketCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucket", {}).n("S3Client", "DeleteBucketCommand").sc(DeleteBucket$).build() {
      static {
        __name(this, "DeleteBucketCommand");
      }
      static {
        __name2(this, "DeleteBucketCommand");
      }
    };
  }
});
var DeleteBucketCorsCommand;
var init_DeleteBucketCorsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketCorsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketCorsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketCors", {}).n("S3Client", "DeleteBucketCorsCommand").sc(DeleteBucketCors$).build() {
      static {
        __name(this, "DeleteBucketCorsCommand");
      }
      static {
        __name2(this, "DeleteBucketCorsCommand");
      }
    };
  }
});
var DeleteBucketEncryptionCommand;
var init_DeleteBucketEncryptionCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketEncryptionCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketEncryptionCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketEncryption", {}).n("S3Client", "DeleteBucketEncryptionCommand").sc(DeleteBucketEncryption$).build() {
      static {
        __name(this, "DeleteBucketEncryptionCommand");
      }
      static {
        __name2(this, "DeleteBucketEncryptionCommand");
      }
    };
  }
});
var DeleteBucketIntelligentTieringConfigurationCommand;
var init_DeleteBucketIntelligentTieringConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketIntelligentTieringConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketIntelligentTieringConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketIntelligentTieringConfiguration", {}).n("S3Client", "DeleteBucketIntelligentTieringConfigurationCommand").sc(DeleteBucketIntelligentTieringConfiguration$).build() {
      static {
        __name(this, "DeleteBucketIntelligentTieringConfigurationCommand");
      }
      static {
        __name2(this, "DeleteBucketIntelligentTieringConfigurationCommand");
      }
    };
  }
});
var DeleteBucketInventoryConfigurationCommand;
var init_DeleteBucketInventoryConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketInventoryConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketInventoryConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketInventoryConfiguration", {}).n("S3Client", "DeleteBucketInventoryConfigurationCommand").sc(DeleteBucketInventoryConfiguration$).build() {
      static {
        __name(this, "DeleteBucketInventoryConfigurationCommand");
      }
      static {
        __name2(this, "DeleteBucketInventoryConfigurationCommand");
      }
    };
  }
});
var DeleteBucketLifecycleCommand;
var init_DeleteBucketLifecycleCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketLifecycleCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketLifecycleCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketLifecycle", {}).n("S3Client", "DeleteBucketLifecycleCommand").sc(DeleteBucketLifecycle$).build() {
      static {
        __name(this, "DeleteBucketLifecycleCommand");
      }
      static {
        __name2(this, "DeleteBucketLifecycleCommand");
      }
    };
  }
});
var DeleteBucketMetadataConfigurationCommand;
var init_DeleteBucketMetadataConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketMetadataConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketMetadataConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketMetadataConfiguration", {}).n("S3Client", "DeleteBucketMetadataConfigurationCommand").sc(DeleteBucketMetadataConfiguration$).build() {
      static {
        __name(this, "DeleteBucketMetadataConfigurationCommand");
      }
      static {
        __name2(this, "DeleteBucketMetadataConfigurationCommand");
      }
    };
  }
});
var DeleteBucketMetadataTableConfigurationCommand;
var init_DeleteBucketMetadataTableConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketMetadataTableConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketMetadataTableConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketMetadataTableConfiguration", {}).n("S3Client", "DeleteBucketMetadataTableConfigurationCommand").sc(DeleteBucketMetadataTableConfiguration$).build() {
      static {
        __name(this, "DeleteBucketMetadataTableConfigurationCommand");
      }
      static {
        __name2(this, "DeleteBucketMetadataTableConfigurationCommand");
      }
    };
  }
});
var DeleteBucketMetricsConfigurationCommand;
var init_DeleteBucketMetricsConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketMetricsConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketMetricsConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketMetricsConfiguration", {}).n("S3Client", "DeleteBucketMetricsConfigurationCommand").sc(DeleteBucketMetricsConfiguration$).build() {
      static {
        __name(this, "DeleteBucketMetricsConfigurationCommand");
      }
      static {
        __name2(this, "DeleteBucketMetricsConfigurationCommand");
      }
    };
  }
});
var DeleteBucketOwnershipControlsCommand;
var init_DeleteBucketOwnershipControlsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketOwnershipControlsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketOwnershipControlsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketOwnershipControls", {}).n("S3Client", "DeleteBucketOwnershipControlsCommand").sc(DeleteBucketOwnershipControls$).build() {
      static {
        __name(this, "DeleteBucketOwnershipControlsCommand");
      }
      static {
        __name2(this, "DeleteBucketOwnershipControlsCommand");
      }
    };
  }
});
var DeleteBucketPolicyCommand;
var init_DeleteBucketPolicyCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketPolicyCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketPolicyCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketPolicy", {}).n("S3Client", "DeleteBucketPolicyCommand").sc(DeleteBucketPolicy$).build() {
      static {
        __name(this, "DeleteBucketPolicyCommand");
      }
      static {
        __name2(this, "DeleteBucketPolicyCommand");
      }
    };
  }
});
var DeleteBucketReplicationCommand;
var init_DeleteBucketReplicationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketReplicationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketReplicationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketReplication", {}).n("S3Client", "DeleteBucketReplicationCommand").sc(DeleteBucketReplication$).build() {
      static {
        __name(this, "DeleteBucketReplicationCommand");
      }
      static {
        __name2(this, "DeleteBucketReplicationCommand");
      }
    };
  }
});
var DeleteBucketTaggingCommand;
var init_DeleteBucketTaggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketTaggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketTaggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketTagging", {}).n("S3Client", "DeleteBucketTaggingCommand").sc(DeleteBucketTagging$).build() {
      static {
        __name(this, "DeleteBucketTaggingCommand");
      }
      static {
        __name2(this, "DeleteBucketTaggingCommand");
      }
    };
  }
});
var DeleteBucketWebsiteCommand;
var init_DeleteBucketWebsiteCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteBucketWebsiteCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteBucketWebsiteCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeleteBucketWebsite", {}).n("S3Client", "DeleteBucketWebsiteCommand").sc(DeleteBucketWebsite$).build() {
      static {
        __name(this, "DeleteBucketWebsiteCommand");
      }
      static {
        __name2(this, "DeleteBucketWebsiteCommand");
      }
    };
  }
});
var DeleteObjectCommand;
var init_DeleteObjectCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteObjectCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteObjectCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "DeleteObject", {}).n("S3Client", "DeleteObjectCommand").sc(DeleteObject$).build() {
      static {
        __name(this, "DeleteObjectCommand");
      }
      static {
        __name2(this, "DeleteObjectCommand");
      }
    };
  }
});
var DeleteObjectsCommand;
var init_DeleteObjectsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteObjectsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteObjectsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "DeleteObjects", {}).n("S3Client", "DeleteObjectsCommand").sc(DeleteObjects$).build() {
      static {
        __name(this, "DeleteObjectsCommand");
      }
      static {
        __name2(this, "DeleteObjectsCommand");
      }
    };
  }
});
var DeleteObjectTaggingCommand;
var init_DeleteObjectTaggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeleteObjectTaggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeleteObjectTaggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "DeleteObjectTagging", {}).n("S3Client", "DeleteObjectTaggingCommand").sc(DeleteObjectTagging$).build() {
      static {
        __name(this, "DeleteObjectTaggingCommand");
      }
      static {
        __name2(this, "DeleteObjectTaggingCommand");
      }
    };
  }
});
var DeletePublicAccessBlockCommand;
var init_DeletePublicAccessBlockCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/DeletePublicAccessBlockCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    DeletePublicAccessBlockCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "DeletePublicAccessBlock", {}).n("S3Client", "DeletePublicAccessBlockCommand").sc(DeletePublicAccessBlock$).build() {
      static {
        __name(this, "DeletePublicAccessBlockCommand");
      }
      static {
        __name2(this, "DeletePublicAccessBlockCommand");
      }
    };
  }
});
var GetBucketAbacCommand;
var init_GetBucketAbacCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketAbacCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketAbacCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketAbac", {}).n("S3Client", "GetBucketAbacCommand").sc(GetBucketAbac$).build() {
      static {
        __name(this, "GetBucketAbacCommand");
      }
      static {
        __name2(this, "GetBucketAbacCommand");
      }
    };
  }
});
var GetBucketAccelerateConfigurationCommand;
var init_GetBucketAccelerateConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketAccelerateConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketAccelerateConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketAccelerateConfiguration", {}).n("S3Client", "GetBucketAccelerateConfigurationCommand").sc(GetBucketAccelerateConfiguration$).build() {
      static {
        __name(this, "GetBucketAccelerateConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketAccelerateConfigurationCommand");
      }
    };
  }
});
var GetBucketAclCommand;
var init_GetBucketAclCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketAclCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketAclCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketAcl", {}).n("S3Client", "GetBucketAclCommand").sc(GetBucketAcl$).build() {
      static {
        __name(this, "GetBucketAclCommand");
      }
      static {
        __name2(this, "GetBucketAclCommand");
      }
    };
  }
});
var GetBucketAnalyticsConfigurationCommand;
var init_GetBucketAnalyticsConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketAnalyticsConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketAnalyticsConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketAnalyticsConfiguration", {}).n("S3Client", "GetBucketAnalyticsConfigurationCommand").sc(GetBucketAnalyticsConfiguration$).build() {
      static {
        __name(this, "GetBucketAnalyticsConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketAnalyticsConfigurationCommand");
      }
    };
  }
});
var GetBucketCorsCommand;
var init_GetBucketCorsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketCorsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketCorsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketCors", {}).n("S3Client", "GetBucketCorsCommand").sc(GetBucketCors$).build() {
      static {
        __name(this, "GetBucketCorsCommand");
      }
      static {
        __name2(this, "GetBucketCorsCommand");
      }
    };
  }
});
var GetBucketEncryptionCommand;
var init_GetBucketEncryptionCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketEncryptionCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketEncryptionCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketEncryption", {}).n("S3Client", "GetBucketEncryptionCommand").sc(GetBucketEncryption$).build() {
      static {
        __name(this, "GetBucketEncryptionCommand");
      }
      static {
        __name2(this, "GetBucketEncryptionCommand");
      }
    };
  }
});
var GetBucketIntelligentTieringConfigurationCommand;
var init_GetBucketIntelligentTieringConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketIntelligentTieringConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketIntelligentTieringConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketIntelligentTieringConfiguration", {}).n("S3Client", "GetBucketIntelligentTieringConfigurationCommand").sc(GetBucketIntelligentTieringConfiguration$).build() {
      static {
        __name(this, "GetBucketIntelligentTieringConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketIntelligentTieringConfigurationCommand");
      }
    };
  }
});
var GetBucketInventoryConfigurationCommand;
var init_GetBucketInventoryConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketInventoryConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketInventoryConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketInventoryConfiguration", {}).n("S3Client", "GetBucketInventoryConfigurationCommand").sc(GetBucketInventoryConfiguration$).build() {
      static {
        __name(this, "GetBucketInventoryConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketInventoryConfigurationCommand");
      }
    };
  }
});
var GetBucketLifecycleConfigurationCommand;
var init_GetBucketLifecycleConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketLifecycleConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketLifecycleConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketLifecycleConfiguration", {}).n("S3Client", "GetBucketLifecycleConfigurationCommand").sc(GetBucketLifecycleConfiguration$).build() {
      static {
        __name(this, "GetBucketLifecycleConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketLifecycleConfigurationCommand");
      }
    };
  }
});
var GetBucketLocationCommand;
var init_GetBucketLocationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketLocationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketLocationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketLocation", {}).n("S3Client", "GetBucketLocationCommand").sc(GetBucketLocation$).build() {
      static {
        __name(this, "GetBucketLocationCommand");
      }
      static {
        __name2(this, "GetBucketLocationCommand");
      }
    };
  }
});
var GetBucketLoggingCommand;
var init_GetBucketLoggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketLoggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketLoggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketLogging", {}).n("S3Client", "GetBucketLoggingCommand").sc(GetBucketLogging$).build() {
      static {
        __name(this, "GetBucketLoggingCommand");
      }
      static {
        __name2(this, "GetBucketLoggingCommand");
      }
    };
  }
});
var GetBucketMetadataConfigurationCommand;
var init_GetBucketMetadataConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketMetadataConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketMetadataConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketMetadataConfiguration", {}).n("S3Client", "GetBucketMetadataConfigurationCommand").sc(GetBucketMetadataConfiguration$).build() {
      static {
        __name(this, "GetBucketMetadataConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketMetadataConfigurationCommand");
      }
    };
  }
});
var GetBucketMetadataTableConfigurationCommand;
var init_GetBucketMetadataTableConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketMetadataTableConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketMetadataTableConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketMetadataTableConfiguration", {}).n("S3Client", "GetBucketMetadataTableConfigurationCommand").sc(GetBucketMetadataTableConfiguration$).build() {
      static {
        __name(this, "GetBucketMetadataTableConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketMetadataTableConfigurationCommand");
      }
    };
  }
});
var GetBucketMetricsConfigurationCommand;
var init_GetBucketMetricsConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketMetricsConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketMetricsConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketMetricsConfiguration", {}).n("S3Client", "GetBucketMetricsConfigurationCommand").sc(GetBucketMetricsConfiguration$).build() {
      static {
        __name(this, "GetBucketMetricsConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketMetricsConfigurationCommand");
      }
    };
  }
});
var GetBucketNotificationConfigurationCommand;
var init_GetBucketNotificationConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketNotificationConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketNotificationConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketNotificationConfiguration", {}).n("S3Client", "GetBucketNotificationConfigurationCommand").sc(GetBucketNotificationConfiguration$).build() {
      static {
        __name(this, "GetBucketNotificationConfigurationCommand");
      }
      static {
        __name2(this, "GetBucketNotificationConfigurationCommand");
      }
    };
  }
});
var GetBucketOwnershipControlsCommand;
var init_GetBucketOwnershipControlsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketOwnershipControlsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketOwnershipControlsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketOwnershipControls", {}).n("S3Client", "GetBucketOwnershipControlsCommand").sc(GetBucketOwnershipControls$).build() {
      static {
        __name(this, "GetBucketOwnershipControlsCommand");
      }
      static {
        __name2(this, "GetBucketOwnershipControlsCommand");
      }
    };
  }
});
var GetBucketPolicyCommand;
var init_GetBucketPolicyCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketPolicyCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketPolicyCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketPolicy", {}).n("S3Client", "GetBucketPolicyCommand").sc(GetBucketPolicy$).build() {
      static {
        __name(this, "GetBucketPolicyCommand");
      }
      static {
        __name2(this, "GetBucketPolicyCommand");
      }
    };
  }
});
var GetBucketPolicyStatusCommand;
var init_GetBucketPolicyStatusCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketPolicyStatusCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketPolicyStatusCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketPolicyStatus", {}).n("S3Client", "GetBucketPolicyStatusCommand").sc(GetBucketPolicyStatus$).build() {
      static {
        __name(this, "GetBucketPolicyStatusCommand");
      }
      static {
        __name2(this, "GetBucketPolicyStatusCommand");
      }
    };
  }
});
var GetBucketReplicationCommand;
var init_GetBucketReplicationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketReplicationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketReplicationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketReplication", {}).n("S3Client", "GetBucketReplicationCommand").sc(GetBucketReplication$).build() {
      static {
        __name(this, "GetBucketReplicationCommand");
      }
      static {
        __name2(this, "GetBucketReplicationCommand");
      }
    };
  }
});
var GetBucketRequestPaymentCommand;
var init_GetBucketRequestPaymentCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketRequestPaymentCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketRequestPaymentCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketRequestPayment", {}).n("S3Client", "GetBucketRequestPaymentCommand").sc(GetBucketRequestPayment$).build() {
      static {
        __name(this, "GetBucketRequestPaymentCommand");
      }
      static {
        __name2(this, "GetBucketRequestPaymentCommand");
      }
    };
  }
});
var GetBucketTaggingCommand;
var init_GetBucketTaggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketTaggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketTaggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketTagging", {}).n("S3Client", "GetBucketTaggingCommand").sc(GetBucketTagging$).build() {
      static {
        __name(this, "GetBucketTaggingCommand");
      }
      static {
        __name2(this, "GetBucketTaggingCommand");
      }
    };
  }
});
var GetBucketVersioningCommand;
var init_GetBucketVersioningCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketVersioningCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketVersioningCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketVersioning", {}).n("S3Client", "GetBucketVersioningCommand").sc(GetBucketVersioning$).build() {
      static {
        __name(this, "GetBucketVersioningCommand");
      }
      static {
        __name2(this, "GetBucketVersioningCommand");
      }
    };
  }
});
var GetBucketWebsiteCommand;
var init_GetBucketWebsiteCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetBucketWebsiteCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetBucketWebsiteCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetBucketWebsite", {}).n("S3Client", "GetBucketWebsiteCommand").sc(GetBucketWebsite$).build() {
      static {
        __name(this, "GetBucketWebsiteCommand");
      }
      static {
        __name2(this, "GetBucketWebsiteCommand");
      }
    };
  }
});
var GetObjectAclCommand;
var init_GetObjectAclCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectAclCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectAclCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetObjectAcl", {}).n("S3Client", "GetObjectAclCommand").sc(GetObjectAcl$).build() {
      static {
        __name(this, "GetObjectAclCommand");
      }
      static {
        __name2(this, "GetObjectAclCommand");
      }
    };
  }
});
var GetObjectAttributesCommand;
var init_GetObjectAttributesCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectAttributesCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectAttributesCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "GetObjectAttributes", {}).n("S3Client", "GetObjectAttributesCommand").sc(GetObjectAttributes$).build() {
      static {
        __name(this, "GetObjectAttributesCommand");
      }
      static {
        __name2(this, "GetObjectAttributesCommand");
      }
    };
  }
});
var GetObjectCommand;
var init_GetObjectCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestChecksumRequired: false,
          requestValidationModeMember: "ChecksumMode",
          "responseAlgorithms": ["CRC64NVME", "CRC32", "CRC32C", "SHA256", "SHA1"]
        }),
        getSsecPlugin(config),
        getS3ExpiresMiddlewarePlugin(config)
      ];
    }).s("AmazonS3", "GetObject", {}).n("S3Client", "GetObjectCommand").sc(GetObject$).build() {
      static {
        __name(this, "GetObjectCommand");
      }
      static {
        __name2(this, "GetObjectCommand");
      }
    };
  }
});
var GetObjectLegalHoldCommand;
var init_GetObjectLegalHoldCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectLegalHoldCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectLegalHoldCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetObjectLegalHold", {}).n("S3Client", "GetObjectLegalHoldCommand").sc(GetObjectLegalHold$).build() {
      static {
        __name(this, "GetObjectLegalHoldCommand");
      }
      static {
        __name2(this, "GetObjectLegalHoldCommand");
      }
    };
  }
});
var GetObjectLockConfigurationCommand;
var init_GetObjectLockConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectLockConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectLockConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetObjectLockConfiguration", {}).n("S3Client", "GetObjectLockConfigurationCommand").sc(GetObjectLockConfiguration$).build() {
      static {
        __name(this, "GetObjectLockConfigurationCommand");
      }
      static {
        __name2(this, "GetObjectLockConfigurationCommand");
      }
    };
  }
});
var GetObjectRetentionCommand;
var init_GetObjectRetentionCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectRetentionCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectRetentionCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetObjectRetention", {}).n("S3Client", "GetObjectRetentionCommand").sc(GetObjectRetention$).build() {
      static {
        __name(this, "GetObjectRetentionCommand");
      }
      static {
        __name2(this, "GetObjectRetentionCommand");
      }
    };
  }
});
var GetObjectTaggingCommand;
var init_GetObjectTaggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectTaggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectTaggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetObjectTagging", {}).n("S3Client", "GetObjectTaggingCommand").sc(GetObjectTagging$).build() {
      static {
        __name(this, "GetObjectTaggingCommand");
      }
      static {
        __name2(this, "GetObjectTaggingCommand");
      }
    };
  }
});
var GetObjectTorrentCommand;
var init_GetObjectTorrentCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetObjectTorrentCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetObjectTorrentCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "GetObjectTorrent", {}).n("S3Client", "GetObjectTorrentCommand").sc(GetObjectTorrent$).build() {
      static {
        __name(this, "GetObjectTorrentCommand");
      }
      static {
        __name2(this, "GetObjectTorrentCommand");
      }
    };
  }
});
var GetPublicAccessBlockCommand;
var init_GetPublicAccessBlockCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/GetPublicAccessBlockCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    GetPublicAccessBlockCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "GetPublicAccessBlock", {}).n("S3Client", "GetPublicAccessBlockCommand").sc(GetPublicAccessBlock$).build() {
      static {
        __name(this, "GetPublicAccessBlockCommand");
      }
      static {
        __name2(this, "GetPublicAccessBlockCommand");
      }
    };
  }
});
var HeadBucketCommand;
var init_HeadBucketCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/HeadBucketCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    HeadBucketCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "HeadBucket", {}).n("S3Client", "HeadBucketCommand").sc(HeadBucket$).build() {
      static {
        __name(this, "HeadBucketCommand");
      }
      static {
        __name2(this, "HeadBucketCommand");
      }
    };
  }
});
var HeadObjectCommand;
var init_HeadObjectCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/HeadObjectCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    HeadObjectCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config),
        getS3ExpiresMiddlewarePlugin(config)
      ];
    }).s("AmazonS3", "HeadObject", {}).n("S3Client", "HeadObjectCommand").sc(HeadObject$).build() {
      static {
        __name(this, "HeadObjectCommand");
      }
      static {
        __name2(this, "HeadObjectCommand");
      }
    };
  }
});
var ListBucketAnalyticsConfigurationsCommand;
var init_ListBucketAnalyticsConfigurationsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketAnalyticsConfigurationsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListBucketAnalyticsConfigurationsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListBucketAnalyticsConfigurations", {}).n("S3Client", "ListBucketAnalyticsConfigurationsCommand").sc(ListBucketAnalyticsConfigurations$).build() {
      static {
        __name(this, "ListBucketAnalyticsConfigurationsCommand");
      }
      static {
        __name2(this, "ListBucketAnalyticsConfigurationsCommand");
      }
    };
  }
});
var ListBucketIntelligentTieringConfigurationsCommand;
var init_ListBucketIntelligentTieringConfigurationsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketIntelligentTieringConfigurationsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListBucketIntelligentTieringConfigurationsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListBucketIntelligentTieringConfigurations", {}).n("S3Client", "ListBucketIntelligentTieringConfigurationsCommand").sc(ListBucketIntelligentTieringConfigurations$).build() {
      static {
        __name(this, "ListBucketIntelligentTieringConfigurationsCommand");
      }
      static {
        __name2(this, "ListBucketIntelligentTieringConfigurationsCommand");
      }
    };
  }
});
var ListBucketInventoryConfigurationsCommand;
var init_ListBucketInventoryConfigurationsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketInventoryConfigurationsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListBucketInventoryConfigurationsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListBucketInventoryConfigurations", {}).n("S3Client", "ListBucketInventoryConfigurationsCommand").sc(ListBucketInventoryConfigurations$).build() {
      static {
        __name(this, "ListBucketInventoryConfigurationsCommand");
      }
      static {
        __name2(this, "ListBucketInventoryConfigurationsCommand");
      }
    };
  }
});
var ListBucketMetricsConfigurationsCommand;
var init_ListBucketMetricsConfigurationsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketMetricsConfigurationsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListBucketMetricsConfigurationsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListBucketMetricsConfigurations", {}).n("S3Client", "ListBucketMetricsConfigurationsCommand").sc(ListBucketMetricsConfigurations$).build() {
      static {
        __name(this, "ListBucketMetricsConfigurationsCommand");
      }
      static {
        __name2(this, "ListBucketMetricsConfigurationsCommand");
      }
    };
  }
});
var ListBucketsCommand;
var init_ListBucketsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListBucketsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListBucketsCommand = class extends Command.classBuilder().ep(commonParams).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListBuckets", {}).n("S3Client", "ListBucketsCommand").sc(ListBuckets$).build() {
      static {
        __name(this, "ListBucketsCommand");
      }
      static {
        __name2(this, "ListBucketsCommand");
      }
    };
  }
});
var ListDirectoryBucketsCommand;
var init_ListDirectoryBucketsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListDirectoryBucketsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListDirectoryBucketsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListDirectoryBuckets", {}).n("S3Client", "ListDirectoryBucketsCommand").sc(ListDirectoryBuckets$).build() {
      static {
        __name(this, "ListDirectoryBucketsCommand");
      }
      static {
        __name2(this, "ListDirectoryBucketsCommand");
      }
    };
  }
});
var ListMultipartUploadsCommand;
var init_ListMultipartUploadsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListMultipartUploadsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListMultipartUploadsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Prefix: { type: "contextParams", name: "Prefix" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListMultipartUploads", {}).n("S3Client", "ListMultipartUploadsCommand").sc(ListMultipartUploads$).build() {
      static {
        __name(this, "ListMultipartUploadsCommand");
      }
      static {
        __name2(this, "ListMultipartUploadsCommand");
      }
    };
  }
});
var ListObjectsCommand;
var init_ListObjectsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListObjectsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListObjectsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Prefix: { type: "contextParams", name: "Prefix" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListObjects", {}).n("S3Client", "ListObjectsCommand").sc(ListObjects$).build() {
      static {
        __name(this, "ListObjectsCommand");
      }
      static {
        __name2(this, "ListObjectsCommand");
      }
    };
  }
});
var ListObjectsV2Command;
var init_ListObjectsV2Command = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListObjectsV2Command.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListObjectsV2Command = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Prefix: { type: "contextParams", name: "Prefix" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListObjectsV2", {}).n("S3Client", "ListObjectsV2Command").sc(ListObjectsV2$).build() {
      static {
        __name(this, "ListObjectsV2Command");
      }
      static {
        __name2(this, "ListObjectsV2Command");
      }
    };
  }
});
var ListObjectVersionsCommand;
var init_ListObjectVersionsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListObjectVersionsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListObjectVersionsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Prefix: { type: "contextParams", name: "Prefix" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "ListObjectVersions", {}).n("S3Client", "ListObjectVersionsCommand").sc(ListObjectVersions$).build() {
      static {
        __name(this, "ListObjectVersionsCommand");
      }
      static {
        __name2(this, "ListObjectVersionsCommand");
      }
    };
  }
});
var ListPartsCommand;
var init_ListPartsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/ListPartsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    ListPartsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "ListParts", {}).n("S3Client", "ListPartsCommand").sc(ListParts$).build() {
      static {
        __name(this, "ListPartsCommand");
      }
      static {
        __name2(this, "ListPartsCommand");
      }
    };
  }
});
var PutBucketAbacCommand;
var init_PutBucketAbacCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketAbacCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketAbacCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: false
        })
      ];
    }).s("AmazonS3", "PutBucketAbac", {}).n("S3Client", "PutBucketAbacCommand").sc(PutBucketAbac$).build() {
      static {
        __name(this, "PutBucketAbacCommand");
      }
      static {
        __name2(this, "PutBucketAbacCommand");
      }
    };
  }
});
var PutBucketAccelerateConfigurationCommand;
var init_PutBucketAccelerateConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketAccelerateConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketAccelerateConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: false
        })
      ];
    }).s("AmazonS3", "PutBucketAccelerateConfiguration", {}).n("S3Client", "PutBucketAccelerateConfigurationCommand").sc(PutBucketAccelerateConfiguration$).build() {
      static {
        __name(this, "PutBucketAccelerateConfigurationCommand");
      }
      static {
        __name2(this, "PutBucketAccelerateConfigurationCommand");
      }
    };
  }
});
var PutBucketAclCommand;
var init_PutBucketAclCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketAclCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketAclCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketAcl", {}).n("S3Client", "PutBucketAclCommand").sc(PutBucketAcl$).build() {
      static {
        __name(this, "PutBucketAclCommand");
      }
      static {
        __name2(this, "PutBucketAclCommand");
      }
    };
  }
});
var PutBucketAnalyticsConfigurationCommand;
var init_PutBucketAnalyticsConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketAnalyticsConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketAnalyticsConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "PutBucketAnalyticsConfiguration", {}).n("S3Client", "PutBucketAnalyticsConfigurationCommand").sc(PutBucketAnalyticsConfiguration$).build() {
      static {
        __name(this, "PutBucketAnalyticsConfigurationCommand");
      }
      static {
        __name2(this, "PutBucketAnalyticsConfigurationCommand");
      }
    };
  }
});
var PutBucketCorsCommand;
var init_PutBucketCorsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketCorsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketCorsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketCors", {}).n("S3Client", "PutBucketCorsCommand").sc(PutBucketCors$).build() {
      static {
        __name(this, "PutBucketCorsCommand");
      }
      static {
        __name2(this, "PutBucketCorsCommand");
      }
    };
  }
});
var PutBucketEncryptionCommand;
var init_PutBucketEncryptionCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketEncryptionCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketEncryptionCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketEncryption", {}).n("S3Client", "PutBucketEncryptionCommand").sc(PutBucketEncryption$).build() {
      static {
        __name(this, "PutBucketEncryptionCommand");
      }
      static {
        __name2(this, "PutBucketEncryptionCommand");
      }
    };
  }
});
var PutBucketIntelligentTieringConfigurationCommand;
var init_PutBucketIntelligentTieringConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketIntelligentTieringConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketIntelligentTieringConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "PutBucketIntelligentTieringConfiguration", {}).n("S3Client", "PutBucketIntelligentTieringConfigurationCommand").sc(PutBucketIntelligentTieringConfiguration$).build() {
      static {
        __name(this, "PutBucketIntelligentTieringConfigurationCommand");
      }
      static {
        __name2(this, "PutBucketIntelligentTieringConfigurationCommand");
      }
    };
  }
});
var PutBucketInventoryConfigurationCommand;
var init_PutBucketInventoryConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketInventoryConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketInventoryConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "PutBucketInventoryConfiguration", {}).n("S3Client", "PutBucketInventoryConfigurationCommand").sc(PutBucketInventoryConfiguration$).build() {
      static {
        __name(this, "PutBucketInventoryConfigurationCommand");
      }
      static {
        __name2(this, "PutBucketInventoryConfigurationCommand");
      }
    };
  }
});
var PutBucketLifecycleConfigurationCommand;
var init_PutBucketLifecycleConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketLifecycleConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketLifecycleConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "PutBucketLifecycleConfiguration", {}).n("S3Client", "PutBucketLifecycleConfigurationCommand").sc(PutBucketLifecycleConfiguration$).build() {
      static {
        __name(this, "PutBucketLifecycleConfigurationCommand");
      }
      static {
        __name2(this, "PutBucketLifecycleConfigurationCommand");
      }
    };
  }
});
var PutBucketLoggingCommand;
var init_PutBucketLoggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketLoggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketLoggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketLogging", {}).n("S3Client", "PutBucketLoggingCommand").sc(PutBucketLogging$).build() {
      static {
        __name(this, "PutBucketLoggingCommand");
      }
      static {
        __name2(this, "PutBucketLoggingCommand");
      }
    };
  }
});
var PutBucketMetricsConfigurationCommand;
var init_PutBucketMetricsConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketMetricsConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketMetricsConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "PutBucketMetricsConfiguration", {}).n("S3Client", "PutBucketMetricsConfigurationCommand").sc(PutBucketMetricsConfiguration$).build() {
      static {
        __name(this, "PutBucketMetricsConfigurationCommand");
      }
      static {
        __name2(this, "PutBucketMetricsConfigurationCommand");
      }
    };
  }
});
var PutBucketNotificationConfigurationCommand;
var init_PutBucketNotificationConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketNotificationConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketNotificationConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "PutBucketNotificationConfiguration", {}).n("S3Client", "PutBucketNotificationConfigurationCommand").sc(PutBucketNotificationConfiguration$).build() {
      static {
        __name(this, "PutBucketNotificationConfigurationCommand");
      }
      static {
        __name2(this, "PutBucketNotificationConfigurationCommand");
      }
    };
  }
});
var PutBucketOwnershipControlsCommand;
var init_PutBucketOwnershipControlsCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketOwnershipControlsCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketOwnershipControlsCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketOwnershipControls", {}).n("S3Client", "PutBucketOwnershipControlsCommand").sc(PutBucketOwnershipControls$).build() {
      static {
        __name(this, "PutBucketOwnershipControlsCommand");
      }
      static {
        __name2(this, "PutBucketOwnershipControlsCommand");
      }
    };
  }
});
var PutBucketPolicyCommand;
var init_PutBucketPolicyCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketPolicyCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketPolicyCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketPolicy", {}).n("S3Client", "PutBucketPolicyCommand").sc(PutBucketPolicy$).build() {
      static {
        __name(this, "PutBucketPolicyCommand");
      }
      static {
        __name2(this, "PutBucketPolicyCommand");
      }
    };
  }
});
var PutBucketReplicationCommand;
var init_PutBucketReplicationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketReplicationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketReplicationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketReplication", {}).n("S3Client", "PutBucketReplicationCommand").sc(PutBucketReplication$).build() {
      static {
        __name(this, "PutBucketReplicationCommand");
      }
      static {
        __name2(this, "PutBucketReplicationCommand");
      }
    };
  }
});
var PutBucketRequestPaymentCommand;
var init_PutBucketRequestPaymentCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketRequestPaymentCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketRequestPaymentCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketRequestPayment", {}).n("S3Client", "PutBucketRequestPaymentCommand").sc(PutBucketRequestPayment$).build() {
      static {
        __name(this, "PutBucketRequestPaymentCommand");
      }
      static {
        __name2(this, "PutBucketRequestPaymentCommand");
      }
    };
  }
});
var PutBucketTaggingCommand;
var init_PutBucketTaggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketTaggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketTaggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketTagging", {}).n("S3Client", "PutBucketTaggingCommand").sc(PutBucketTagging$).build() {
      static {
        __name(this, "PutBucketTaggingCommand");
      }
      static {
        __name2(this, "PutBucketTaggingCommand");
      }
    };
  }
});
var PutBucketVersioningCommand;
var init_PutBucketVersioningCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketVersioningCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketVersioningCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketVersioning", {}).n("S3Client", "PutBucketVersioningCommand").sc(PutBucketVersioning$).build() {
      static {
        __name(this, "PutBucketVersioningCommand");
      }
      static {
        __name2(this, "PutBucketVersioningCommand");
      }
    };
  }
});
var PutBucketWebsiteCommand;
var init_PutBucketWebsiteCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutBucketWebsiteCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutBucketWebsiteCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutBucketWebsite", {}).n("S3Client", "PutBucketWebsiteCommand").sc(PutBucketWebsite$).build() {
      static {
        __name(this, "PutBucketWebsiteCommand");
      }
      static {
        __name2(this, "PutBucketWebsiteCommand");
      }
    };
  }
});
var PutObjectAclCommand;
var init_PutObjectAclCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectAclCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutObjectAclCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "PutObjectAcl", {}).n("S3Client", "PutObjectAclCommand").sc(PutObjectAcl$).build() {
      static {
        __name(this, "PutObjectAclCommand");
      }
      static {
        __name2(this, "PutObjectAclCommand");
      }
    };
  }
});
var PutObjectCommand;
var init_PutObjectCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutObjectCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: false
        }),
        getCheckContentLengthHeaderPlugin(config),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "PutObject", {}).n("S3Client", "PutObjectCommand").sc(PutObject$).build() {
      static {
        __name(this, "PutObjectCommand");
      }
      static {
        __name2(this, "PutObjectCommand");
      }
    };
  }
});
var PutObjectLegalHoldCommand;
var init_PutObjectLegalHoldCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectLegalHoldCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutObjectLegalHoldCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "PutObjectLegalHold", {}).n("S3Client", "PutObjectLegalHoldCommand").sc(PutObjectLegalHold$).build() {
      static {
        __name(this, "PutObjectLegalHoldCommand");
      }
      static {
        __name2(this, "PutObjectLegalHoldCommand");
      }
    };
  }
});
var PutObjectLockConfigurationCommand;
var init_PutObjectLockConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectLockConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutObjectLockConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "PutObjectLockConfiguration", {}).n("S3Client", "PutObjectLockConfigurationCommand").sc(PutObjectLockConfiguration$).build() {
      static {
        __name(this, "PutObjectLockConfigurationCommand");
      }
      static {
        __name2(this, "PutObjectLockConfigurationCommand");
      }
    };
  }
});
var PutObjectRetentionCommand;
var init_PutObjectRetentionCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectRetentionCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutObjectRetentionCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "PutObjectRetention", {}).n("S3Client", "PutObjectRetentionCommand").sc(PutObjectRetention$).build() {
      static {
        __name(this, "PutObjectRetentionCommand");
      }
      static {
        __name2(this, "PutObjectRetentionCommand");
      }
    };
  }
});
var PutObjectTaggingCommand;
var init_PutObjectTaggingCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectTaggingCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutObjectTaggingCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "PutObjectTagging", {}).n("S3Client", "PutObjectTaggingCommand").sc(PutObjectTagging$).build() {
      static {
        __name(this, "PutObjectTaggingCommand");
      }
      static {
        __name2(this, "PutObjectTaggingCommand");
      }
    };
  }
});
var PutPublicAccessBlockCommand;
var init_PutPublicAccessBlockCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/PutPublicAccessBlockCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    PutPublicAccessBlockCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "PutPublicAccessBlock", {}).n("S3Client", "PutPublicAccessBlockCommand").sc(PutPublicAccessBlock$).build() {
      static {
        __name(this, "PutPublicAccessBlockCommand");
      }
      static {
        __name2(this, "PutPublicAccessBlockCommand");
      }
    };
  }
});
var RenameObjectCommand;
var init_RenameObjectCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/RenameObjectCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    RenameObjectCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "RenameObject", {}).n("S3Client", "RenameObjectCommand").sc(RenameObject$).build() {
      static {
        __name(this, "RenameObjectCommand");
      }
      static {
        __name2(this, "RenameObjectCommand");
      }
    };
  }
});
var RestoreObjectCommand;
var init_RestoreObjectCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/RestoreObjectCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    RestoreObjectCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: false
        }),
        getThrow200ExceptionsPlugin(config)
      ];
    }).s("AmazonS3", "RestoreObject", {}).n("S3Client", "RestoreObjectCommand").sc(RestoreObject$).build() {
      static {
        __name(this, "RestoreObjectCommand");
      }
      static {
        __name2(this, "RestoreObjectCommand");
      }
    };
  }
});
var SelectObjectContentCommand;
var init_SelectObjectContentCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/SelectObjectContentCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    SelectObjectContentCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "SelectObjectContent", {
      eventStream: {
        output: true
      }
    }).n("S3Client", "SelectObjectContentCommand").sc(SelectObjectContent$).build() {
      static {
        __name(this, "SelectObjectContentCommand");
      }
      static {
        __name2(this, "SelectObjectContentCommand");
      }
    };
  }
});
var UpdateBucketMetadataInventoryTableConfigurationCommand;
var init_UpdateBucketMetadataInventoryTableConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/UpdateBucketMetadataInventoryTableConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    UpdateBucketMetadataInventoryTableConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "UpdateBucketMetadataInventoryTableConfiguration", {}).n("S3Client", "UpdateBucketMetadataInventoryTableConfigurationCommand").sc(UpdateBucketMetadataInventoryTableConfiguration$).build() {
      static {
        __name(this, "UpdateBucketMetadataInventoryTableConfigurationCommand");
      }
      static {
        __name2(this, "UpdateBucketMetadataInventoryTableConfigurationCommand");
      }
    };
  }
});
var UpdateBucketMetadataJournalTableConfigurationCommand;
var init_UpdateBucketMetadataJournalTableConfigurationCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/UpdateBucketMetadataJournalTableConfigurationCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    UpdateBucketMetadataJournalTableConfigurationCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseS3ExpressControlEndpoint: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: true
        })
      ];
    }).s("AmazonS3", "UpdateBucketMetadataJournalTableConfiguration", {}).n("S3Client", "UpdateBucketMetadataJournalTableConfigurationCommand").sc(UpdateBucketMetadataJournalTableConfiguration$).build() {
      static {
        __name(this, "UpdateBucketMetadataJournalTableConfigurationCommand");
      }
      static {
        __name2(this, "UpdateBucketMetadataJournalTableConfigurationCommand");
      }
    };
  }
});
var UploadPartCommand;
var init_UploadPartCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/UploadPartCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es25();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    UploadPartCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      Bucket: { type: "contextParams", name: "Bucket" },
      Key: { type: "contextParams", name: "Key" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getFlexibleChecksumsPlugin(config, {
          requestAlgorithmMember: { "httpHeader": "x-amz-sdk-checksum-algorithm", "name": "ChecksumAlgorithm" },
          requestChecksumRequired: false
        }),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "UploadPart", {}).n("S3Client", "UploadPartCommand").sc(UploadPart$).build() {
      static {
        __name(this, "UploadPartCommand");
      }
      static {
        __name2(this, "UploadPartCommand");
      }
    };
  }
});
var UploadPartCopyCommand;
var init_UploadPartCopyCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/UploadPartCopyCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es30();
    init_dist_es57();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    UploadPartCopyCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      DisableS3ExpressSessionAuth: { type: "staticContextParams", value: true },
      Bucket: { type: "contextParams", name: "Bucket" }
    }).m(function(Command2, cs2, config, o2) {
      return [
        getEndpointPlugin(config, Command2.getEndpointParameterInstructions()),
        getThrow200ExceptionsPlugin(config),
        getSsecPlugin(config)
      ];
    }).s("AmazonS3", "UploadPartCopy", {}).n("S3Client", "UploadPartCopyCommand").sc(UploadPartCopy$).build() {
      static {
        __name(this, "UploadPartCopyCommand");
      }
      static {
        __name2(this, "UploadPartCopyCommand");
      }
    };
  }
});
var WriteGetObjectResponseCommand;
var init_WriteGetObjectResponseCommand = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/WriteGetObjectResponseCommand.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es39();
    init_dist_es20();
    init_EndpointParameters();
    init_schemas_0();
    WriteGetObjectResponseCommand = class extends Command.classBuilder().ep({
      ...commonParams,
      UseObjectLambdaEndpoint: { type: "staticContextParams", value: true }
    }).m(function(Command2, cs2, config, o2) {
      return [getEndpointPlugin(config, Command2.getEndpointParameterInstructions())];
    }).s("AmazonS3", "WriteGetObjectResponse", {}).n("S3Client", "WriteGetObjectResponseCommand").sc(WriteGetObjectResponse$).build() {
      static {
        __name(this, "WriteGetObjectResponseCommand");
      }
      static {
        __name2(this, "WriteGetObjectResponseCommand");
      }
    };
  }
});
var commands;
var S3;
var init_S3 = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/S3.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es20();
    init_AbortMultipartUploadCommand();
    init_CompleteMultipartUploadCommand();
    init_CopyObjectCommand();
    init_CreateBucketCommand();
    init_CreateBucketMetadataConfigurationCommand();
    init_CreateBucketMetadataTableConfigurationCommand();
    init_CreateMultipartUploadCommand();
    init_CreateSessionCommand();
    init_DeleteBucketAnalyticsConfigurationCommand();
    init_DeleteBucketCommand();
    init_DeleteBucketCorsCommand();
    init_DeleteBucketEncryptionCommand();
    init_DeleteBucketIntelligentTieringConfigurationCommand();
    init_DeleteBucketInventoryConfigurationCommand();
    init_DeleteBucketLifecycleCommand();
    init_DeleteBucketMetadataConfigurationCommand();
    init_DeleteBucketMetadataTableConfigurationCommand();
    init_DeleteBucketMetricsConfigurationCommand();
    init_DeleteBucketOwnershipControlsCommand();
    init_DeleteBucketPolicyCommand();
    init_DeleteBucketReplicationCommand();
    init_DeleteBucketTaggingCommand();
    init_DeleteBucketWebsiteCommand();
    init_DeleteObjectCommand();
    init_DeleteObjectsCommand();
    init_DeleteObjectTaggingCommand();
    init_DeletePublicAccessBlockCommand();
    init_GetBucketAbacCommand();
    init_GetBucketAccelerateConfigurationCommand();
    init_GetBucketAclCommand();
    init_GetBucketAnalyticsConfigurationCommand();
    init_GetBucketCorsCommand();
    init_GetBucketEncryptionCommand();
    init_GetBucketIntelligentTieringConfigurationCommand();
    init_GetBucketInventoryConfigurationCommand();
    init_GetBucketLifecycleConfigurationCommand();
    init_GetBucketLocationCommand();
    init_GetBucketLoggingCommand();
    init_GetBucketMetadataConfigurationCommand();
    init_GetBucketMetadataTableConfigurationCommand();
    init_GetBucketMetricsConfigurationCommand();
    init_GetBucketNotificationConfigurationCommand();
    init_GetBucketOwnershipControlsCommand();
    init_GetBucketPolicyCommand();
    init_GetBucketPolicyStatusCommand();
    init_GetBucketReplicationCommand();
    init_GetBucketRequestPaymentCommand();
    init_GetBucketTaggingCommand();
    init_GetBucketVersioningCommand();
    init_GetBucketWebsiteCommand();
    init_GetObjectAclCommand();
    init_GetObjectAttributesCommand();
    init_GetObjectCommand();
    init_GetObjectLegalHoldCommand();
    init_GetObjectLockConfigurationCommand();
    init_GetObjectRetentionCommand();
    init_GetObjectTaggingCommand();
    init_GetObjectTorrentCommand();
    init_GetPublicAccessBlockCommand();
    init_HeadBucketCommand();
    init_HeadObjectCommand();
    init_ListBucketAnalyticsConfigurationsCommand();
    init_ListBucketIntelligentTieringConfigurationsCommand();
    init_ListBucketInventoryConfigurationsCommand();
    init_ListBucketMetricsConfigurationsCommand();
    init_ListBucketsCommand();
    init_ListDirectoryBucketsCommand();
    init_ListMultipartUploadsCommand();
    init_ListObjectsCommand();
    init_ListObjectsV2Command();
    init_ListObjectVersionsCommand();
    init_ListPartsCommand();
    init_PutBucketAbacCommand();
    init_PutBucketAccelerateConfigurationCommand();
    init_PutBucketAclCommand();
    init_PutBucketAnalyticsConfigurationCommand();
    init_PutBucketCorsCommand();
    init_PutBucketEncryptionCommand();
    init_PutBucketIntelligentTieringConfigurationCommand();
    init_PutBucketInventoryConfigurationCommand();
    init_PutBucketLifecycleConfigurationCommand();
    init_PutBucketLoggingCommand();
    init_PutBucketMetricsConfigurationCommand();
    init_PutBucketNotificationConfigurationCommand();
    init_PutBucketOwnershipControlsCommand();
    init_PutBucketPolicyCommand();
    init_PutBucketReplicationCommand();
    init_PutBucketRequestPaymentCommand();
    init_PutBucketTaggingCommand();
    init_PutBucketVersioningCommand();
    init_PutBucketWebsiteCommand();
    init_PutObjectAclCommand();
    init_PutObjectCommand();
    init_PutObjectLegalHoldCommand();
    init_PutObjectLockConfigurationCommand();
    init_PutObjectRetentionCommand();
    init_PutObjectTaggingCommand();
    init_PutPublicAccessBlockCommand();
    init_RenameObjectCommand();
    init_RestoreObjectCommand();
    init_SelectObjectContentCommand();
    init_UpdateBucketMetadataInventoryTableConfigurationCommand();
    init_UpdateBucketMetadataJournalTableConfigurationCommand();
    init_UploadPartCommand();
    init_UploadPartCopyCommand();
    init_WriteGetObjectResponseCommand();
    init_S3Client();
    commands = {
      AbortMultipartUploadCommand,
      CompleteMultipartUploadCommand,
      CopyObjectCommand,
      CreateBucketCommand,
      CreateBucketMetadataConfigurationCommand,
      CreateBucketMetadataTableConfigurationCommand,
      CreateMultipartUploadCommand,
      CreateSessionCommand,
      DeleteBucketCommand,
      DeleteBucketAnalyticsConfigurationCommand,
      DeleteBucketCorsCommand,
      DeleteBucketEncryptionCommand,
      DeleteBucketIntelligentTieringConfigurationCommand,
      DeleteBucketInventoryConfigurationCommand,
      DeleteBucketLifecycleCommand,
      DeleteBucketMetadataConfigurationCommand,
      DeleteBucketMetadataTableConfigurationCommand,
      DeleteBucketMetricsConfigurationCommand,
      DeleteBucketOwnershipControlsCommand,
      DeleteBucketPolicyCommand,
      DeleteBucketReplicationCommand,
      DeleteBucketTaggingCommand,
      DeleteBucketWebsiteCommand,
      DeleteObjectCommand,
      DeleteObjectsCommand,
      DeleteObjectTaggingCommand,
      DeletePublicAccessBlockCommand,
      GetBucketAbacCommand,
      GetBucketAccelerateConfigurationCommand,
      GetBucketAclCommand,
      GetBucketAnalyticsConfigurationCommand,
      GetBucketCorsCommand,
      GetBucketEncryptionCommand,
      GetBucketIntelligentTieringConfigurationCommand,
      GetBucketInventoryConfigurationCommand,
      GetBucketLifecycleConfigurationCommand,
      GetBucketLocationCommand,
      GetBucketLoggingCommand,
      GetBucketMetadataConfigurationCommand,
      GetBucketMetadataTableConfigurationCommand,
      GetBucketMetricsConfigurationCommand,
      GetBucketNotificationConfigurationCommand,
      GetBucketOwnershipControlsCommand,
      GetBucketPolicyCommand,
      GetBucketPolicyStatusCommand,
      GetBucketReplicationCommand,
      GetBucketRequestPaymentCommand,
      GetBucketTaggingCommand,
      GetBucketVersioningCommand,
      GetBucketWebsiteCommand,
      GetObjectCommand,
      GetObjectAclCommand,
      GetObjectAttributesCommand,
      GetObjectLegalHoldCommand,
      GetObjectLockConfigurationCommand,
      GetObjectRetentionCommand,
      GetObjectTaggingCommand,
      GetObjectTorrentCommand,
      GetPublicAccessBlockCommand,
      HeadBucketCommand,
      HeadObjectCommand,
      ListBucketAnalyticsConfigurationsCommand,
      ListBucketIntelligentTieringConfigurationsCommand,
      ListBucketInventoryConfigurationsCommand,
      ListBucketMetricsConfigurationsCommand,
      ListBucketsCommand,
      ListDirectoryBucketsCommand,
      ListMultipartUploadsCommand,
      ListObjectsCommand,
      ListObjectsV2Command,
      ListObjectVersionsCommand,
      ListPartsCommand,
      PutBucketAbacCommand,
      PutBucketAccelerateConfigurationCommand,
      PutBucketAclCommand,
      PutBucketAnalyticsConfigurationCommand,
      PutBucketCorsCommand,
      PutBucketEncryptionCommand,
      PutBucketIntelligentTieringConfigurationCommand,
      PutBucketInventoryConfigurationCommand,
      PutBucketLifecycleConfigurationCommand,
      PutBucketLoggingCommand,
      PutBucketMetricsConfigurationCommand,
      PutBucketNotificationConfigurationCommand,
      PutBucketOwnershipControlsCommand,
      PutBucketPolicyCommand,
      PutBucketReplicationCommand,
      PutBucketRequestPaymentCommand,
      PutBucketTaggingCommand,
      PutBucketVersioningCommand,
      PutBucketWebsiteCommand,
      PutObjectCommand,
      PutObjectAclCommand,
      PutObjectLegalHoldCommand,
      PutObjectLockConfigurationCommand,
      PutObjectRetentionCommand,
      PutObjectTaggingCommand,
      PutPublicAccessBlockCommand,
      RenameObjectCommand,
      RestoreObjectCommand,
      SelectObjectContentCommand,
      UpdateBucketMetadataInventoryTableConfigurationCommand,
      UpdateBucketMetadataJournalTableConfigurationCommand,
      UploadPartCommand,
      UploadPartCopyCommand,
      WriteGetObjectResponseCommand
    };
    S3 = class extends S3Client {
      static {
        __name(this, "S3");
      }
      static {
        __name2(this, "S3");
      }
    };
    createAggregatedClient(commands, S3);
  }
});
var init_commands = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/commands/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_AbortMultipartUploadCommand();
    init_CompleteMultipartUploadCommand();
    init_CopyObjectCommand();
    init_CreateBucketCommand();
    init_CreateBucketMetadataConfigurationCommand();
    init_CreateBucketMetadataTableConfigurationCommand();
    init_CreateMultipartUploadCommand();
    init_CreateSessionCommand();
    init_DeleteBucketAnalyticsConfigurationCommand();
    init_DeleteBucketCommand();
    init_DeleteBucketCorsCommand();
    init_DeleteBucketEncryptionCommand();
    init_DeleteBucketIntelligentTieringConfigurationCommand();
    init_DeleteBucketInventoryConfigurationCommand();
    init_DeleteBucketLifecycleCommand();
    init_DeleteBucketMetadataConfigurationCommand();
    init_DeleteBucketMetadataTableConfigurationCommand();
    init_DeleteBucketMetricsConfigurationCommand();
    init_DeleteBucketOwnershipControlsCommand();
    init_DeleteBucketPolicyCommand();
    init_DeleteBucketReplicationCommand();
    init_DeleteBucketTaggingCommand();
    init_DeleteBucketWebsiteCommand();
    init_DeleteObjectCommand();
    init_DeleteObjectTaggingCommand();
    init_DeleteObjectsCommand();
    init_DeletePublicAccessBlockCommand();
    init_GetBucketAbacCommand();
    init_GetBucketAccelerateConfigurationCommand();
    init_GetBucketAclCommand();
    init_GetBucketAnalyticsConfigurationCommand();
    init_GetBucketCorsCommand();
    init_GetBucketEncryptionCommand();
    init_GetBucketIntelligentTieringConfigurationCommand();
    init_GetBucketInventoryConfigurationCommand();
    init_GetBucketLifecycleConfigurationCommand();
    init_GetBucketLocationCommand();
    init_GetBucketLoggingCommand();
    init_GetBucketMetadataConfigurationCommand();
    init_GetBucketMetadataTableConfigurationCommand();
    init_GetBucketMetricsConfigurationCommand();
    init_GetBucketNotificationConfigurationCommand();
    init_GetBucketOwnershipControlsCommand();
    init_GetBucketPolicyCommand();
    init_GetBucketPolicyStatusCommand();
    init_GetBucketReplicationCommand();
    init_GetBucketRequestPaymentCommand();
    init_GetBucketTaggingCommand();
    init_GetBucketVersioningCommand();
    init_GetBucketWebsiteCommand();
    init_GetObjectAclCommand();
    init_GetObjectAttributesCommand();
    init_GetObjectCommand();
    init_GetObjectLegalHoldCommand();
    init_GetObjectLockConfigurationCommand();
    init_GetObjectRetentionCommand();
    init_GetObjectTaggingCommand();
    init_GetObjectTorrentCommand();
    init_GetPublicAccessBlockCommand();
    init_HeadBucketCommand();
    init_HeadObjectCommand();
    init_ListBucketAnalyticsConfigurationsCommand();
    init_ListBucketIntelligentTieringConfigurationsCommand();
    init_ListBucketInventoryConfigurationsCommand();
    init_ListBucketMetricsConfigurationsCommand();
    init_ListBucketsCommand();
    init_ListDirectoryBucketsCommand();
    init_ListMultipartUploadsCommand();
    init_ListObjectVersionsCommand();
    init_ListObjectsCommand();
    init_ListObjectsV2Command();
    init_ListPartsCommand();
    init_PutBucketAbacCommand();
    init_PutBucketAccelerateConfigurationCommand();
    init_PutBucketAclCommand();
    init_PutBucketAnalyticsConfigurationCommand();
    init_PutBucketCorsCommand();
    init_PutBucketEncryptionCommand();
    init_PutBucketIntelligentTieringConfigurationCommand();
    init_PutBucketInventoryConfigurationCommand();
    init_PutBucketLifecycleConfigurationCommand();
    init_PutBucketLoggingCommand();
    init_PutBucketMetricsConfigurationCommand();
    init_PutBucketNotificationConfigurationCommand();
    init_PutBucketOwnershipControlsCommand();
    init_PutBucketPolicyCommand();
    init_PutBucketReplicationCommand();
    init_PutBucketRequestPaymentCommand();
    init_PutBucketTaggingCommand();
    init_PutBucketVersioningCommand();
    init_PutBucketWebsiteCommand();
    init_PutObjectAclCommand();
    init_PutObjectCommand();
    init_PutObjectLegalHoldCommand();
    init_PutObjectLockConfigurationCommand();
    init_PutObjectRetentionCommand();
    init_PutObjectTaggingCommand();
    init_PutPublicAccessBlockCommand();
    init_RenameObjectCommand();
    init_RestoreObjectCommand();
    init_SelectObjectContentCommand();
    init_UpdateBucketMetadataInventoryTableConfigurationCommand();
    init_UpdateBucketMetadataJournalTableConfigurationCommand();
    init_UploadPartCommand();
    init_UploadPartCopyCommand();
    init_WriteGetObjectResponseCommand();
  }
});
var init_Interfaces = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/pagination/Interfaces.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var paginateListBuckets;
var init_ListBucketsPaginator = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/pagination/ListBucketsPaginator.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    init_ListBucketsCommand();
    init_S3Client();
    paginateListBuckets = createPaginator(S3Client, ListBucketsCommand, "ContinuationToken", "ContinuationToken", "MaxBuckets");
  }
});
var paginateListDirectoryBuckets;
var init_ListDirectoryBucketsPaginator = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/pagination/ListDirectoryBucketsPaginator.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    init_ListDirectoryBucketsCommand();
    init_S3Client();
    paginateListDirectoryBuckets = createPaginator(S3Client, ListDirectoryBucketsCommand, "ContinuationToken", "ContinuationToken", "MaxDirectoryBuckets");
  }
});
var paginateListObjectsV2;
var init_ListObjectsV2Paginator = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/pagination/ListObjectsV2Paginator.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    init_ListObjectsV2Command();
    init_S3Client();
    paginateListObjectsV2 = createPaginator(S3Client, ListObjectsV2Command, "ContinuationToken", "NextContinuationToken", "MaxKeys");
  }
});
var paginateListParts;
var init_ListPartsPaginator = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/pagination/ListPartsPaginator.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es14();
    init_ListPartsCommand();
    init_S3Client();
    paginateListParts = createPaginator(S3Client, ListPartsCommand, "PartNumberMarker", "NextPartNumberMarker", "MaxParts");
  }
});
var init_pagination2 = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/pagination/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_Interfaces();
    init_ListBucketsPaginator();
    init_ListDirectoryBucketsPaginator();
    init_ListObjectsV2Paginator();
    init_ListPartsPaginator();
  }
});
var init_waitForBucketExists = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForBucketExists.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_waitForBucketNotExists = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForBucketNotExists.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_waitForObjectExists = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForObjectExists.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_waitForObjectNotExists = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/waiters/waitForObjectNotExists.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_waiters = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/waiters/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_waitForBucketExists();
    init_waitForBucketNotExists();
    init_waitForObjectExists();
    init_waitForObjectNotExists();
  }
});
var init_enums = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/models/enums.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_models_0 = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/models/models_0.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_models_1 = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/models/models_1.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
  }
});
var init_dist_es59 = __esm({
  "../node_modules/@aws-sdk/client-s3/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_S3Client();
    init_S3();
    init_commands();
    init_schemas_0();
    init_pagination2();
    init_waiters();
    init_enums();
    init_errors();
    init_models_0();
    init_models_1();
  }
});
function formatUrl(request) {
  const { port, query } = request;
  let { protocol, path, hostname } = request;
  if (protocol && protocol.slice(-1) !== ":") {
    protocol += ":";
  }
  if (port) {
    hostname += `:${port}`;
  }
  if (path && path.charAt(0) !== "/") {
    path = `/${path}`;
  }
  let queryString = query ? buildQueryString(query) : "";
  if (queryString && queryString[0] !== "?") {
    queryString = `?${queryString}`;
  }
  let auth = "";
  if (request.username != null || request.password != null) {
    const username = request.username ?? "";
    const password = request.password ?? "";
    auth = `${username}:${password}@`;
  }
  let fragment = "";
  if (request.fragment) {
    fragment = `#${request.fragment}`;
  }
  return `${protocol}//${auth}${hostname}${path}${queryString}${fragment}`;
}
__name(formatUrl, "formatUrl");
var init_dist_es60 = __esm({
  "../node_modules/@aws-sdk/util-format-url/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es9();
    __name2(formatUrl, "formatUrl");
  }
});
var UNSIGNED_PAYLOAD2;
var SHA256_HEADER2;
var init_constants15 = __esm({
  "../node_modules/@aws-sdk/s3-request-presigner/dist-es/constants.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    UNSIGNED_PAYLOAD2 = "UNSIGNED-PAYLOAD";
    SHA256_HEADER2 = "X-Amz-Content-Sha256";
  }
});
var S3RequestPresigner;
var init_presigner = __esm({
  "../node_modules/@aws-sdk/s3-request-presigner/dist-es/presigner.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es44();
    init_constants15();
    S3RequestPresigner = class {
      static {
        __name(this, "S3RequestPresigner");
      }
      static {
        __name2(this, "S3RequestPresigner");
      }
      signer;
      constructor(options) {
        const resolvedOptions = {
          service: options.signingName || options.service || "s3",
          uriEscapePath: options.uriEscapePath || false,
          applyChecksum: options.applyChecksum || false,
          ...options
        };
        this.signer = new SignatureV4MultiRegion(resolvedOptions);
      }
      presign(requestToSign, { unsignableHeaders = /* @__PURE__ */ new Set(), hoistableHeaders = /* @__PURE__ */ new Set(), unhoistableHeaders = /* @__PURE__ */ new Set(), ...options } = {}) {
        this.prepareRequest(requestToSign, {
          unsignableHeaders,
          unhoistableHeaders,
          hoistableHeaders
        });
        return this.signer.presign(requestToSign, {
          expiresIn: 900,
          unsignableHeaders,
          unhoistableHeaders,
          ...options
        });
      }
      presignWithCredentials(requestToSign, credentials, { unsignableHeaders = /* @__PURE__ */ new Set(), hoistableHeaders = /* @__PURE__ */ new Set(), unhoistableHeaders = /* @__PURE__ */ new Set(), ...options } = {}) {
        this.prepareRequest(requestToSign, {
          unsignableHeaders,
          unhoistableHeaders,
          hoistableHeaders
        });
        return this.signer.presignWithCredentials(requestToSign, credentials, {
          expiresIn: 900,
          unsignableHeaders,
          unhoistableHeaders,
          ...options
        });
      }
      prepareRequest(requestToSign, { unsignableHeaders = /* @__PURE__ */ new Set(), unhoistableHeaders = /* @__PURE__ */ new Set(), hoistableHeaders = /* @__PURE__ */ new Set() } = {}) {
        unsignableHeaders.add("content-type");
        Object.keys(requestToSign.headers).map((header) => header.toLowerCase()).filter((header) => header.startsWith("x-amz-server-side-encryption")).forEach((header) => {
          if (!hoistableHeaders.has(header)) {
            unhoistableHeaders.add(header);
          }
        });
        requestToSign.headers[SHA256_HEADER2] = UNSIGNED_PAYLOAD2;
        const currentHostHeader = requestToSign.headers.host;
        const port = requestToSign.port;
        const expectedHostHeader = `${requestToSign.hostname}${requestToSign.port != null ? ":" + port : ""}`;
        if (!currentHostHeader || currentHostHeader === requestToSign.hostname && requestToSign.port != null) {
          requestToSign.headers.host = expectedHostHeader;
        }
      }
    };
  }
});
var getSignedUrl;
var init_getSignedUrl = __esm({
  "../node_modules/@aws-sdk/s3-request-presigner/dist-es/getSignedUrl.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es60();
    init_dist_es39();
    init_dist_es2();
    init_presigner();
    getSignedUrl = /* @__PURE__ */ __name2(async (client, command, options = {}) => {
      let s3Presigner;
      let region;
      if (typeof client.config.endpointProvider === "function") {
        const endpointV2 = await getEndpointFromInstructions(command.input, command.constructor, client.config);
        const authScheme = endpointV2.properties?.authSchemes?.[0];
        if (authScheme?.name === "sigv4a") {
          region = authScheme?.signingRegionSet?.join(",");
        } else {
          region = authScheme?.signingRegion;
        }
        s3Presigner = new S3RequestPresigner({
          ...client.config,
          signingName: authScheme?.signingName,
          region: /* @__PURE__ */ __name2(async () => region, "region")
        });
      } else {
        s3Presigner = new S3RequestPresigner(client.config);
      }
      const presignInterceptMiddleware = /* @__PURE__ */ __name2((next, context) => async (args) => {
        const { request } = args;
        if (!HttpRequest.isInstance(request)) {
          throw new Error("Request to be presigned is not an valid HTTP request.");
        }
        delete request.headers["amz-sdk-invocation-id"];
        delete request.headers["amz-sdk-request"];
        delete request.headers["x-amz-user-agent"];
        let presigned2;
        const presignerOptions = {
          ...options,
          signingRegion: options.signingRegion ?? context["signing_region"] ?? region,
          signingService: options.signingService ?? context["signing_service"]
        };
        if (context.s3ExpressIdentity) {
          presigned2 = await s3Presigner.presignWithCredentials(request, context.s3ExpressIdentity, presignerOptions);
        } else {
          presigned2 = await s3Presigner.presign(request, presignerOptions);
        }
        return {
          response: {},
          output: {
            $metadata: { httpStatusCode: 200 },
            presigned: presigned2
          }
        };
      }, "presignInterceptMiddleware");
      const middlewareName = "presignInterceptMiddleware";
      const clientStack = client.middlewareStack.clone();
      clientStack.addRelativeTo(presignInterceptMiddleware, {
        name: middlewareName,
        relation: "before",
        toMiddleware: "awsAuthMiddleware",
        override: true
      });
      const handler = command.resolveMiddleware(clientStack, client.config, {});
      const { output } = await handler({ input: command.input });
      const { presigned } = output;
      return formatUrl(presigned);
    }, "getSignedUrl");
  }
});
var init_dist_es61 = __esm({
  "../node_modules/@aws-sdk/s3-request-presigner/dist-es/index.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_getSignedUrl();
    init_presigner();
  }
});
async function onRequest({ env, request }) {
  const fileName = "montreal.pmtiles";
  const bucketName = "map";
  try {
    const S32 = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY
      }
    });
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName
    });
    const url = await getSignedUrl(S32, command, { expiresIn: 3600 });
    return new Response(JSON.stringify({
      url,
      expiresAt: Date.now() + 3600 * 1e3
      // Utile pour que le front sache quand rafraîchir
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
        // Important pour le fetch du frontend
      }
    });
  } catch (error) {
    console.error("Presigning Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest, "onRequest");
async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      // Ajout de Authorization si tu l'utilises
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
var init_montreal_pmtiles = __esm({
  "tiles/montreal.pmtiles.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_dist_es59();
    init_dist_es61();
    __name2(onRequest, "onRequest");
    __name2(onRequestOptions, "onRequestOptions");
  }
});
async function onRequestGet2({ request, env }) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path || !path.startsWith("/")) {
    return new Response("Invalid path", { status: 400 });
  }
  const params = {};
  for (const [k2, v2] of searchParams.entries()) {
    if (k2 !== "path") params[k2] = v2;
  }
  const ttl = 120;
  const exp = Math.floor(Date.now() / 1e3) + ttl;
  const query = new URLSearchParams({
    ...params,
    exp
  }).toString();
  const base = `${path}?${query}`;
  const sig = await sign(base, env.TUNNEL_SECRET);
  return Response.json({
    url: `https://tunnel.frederic.dog${base}&sig=${sig}`,
    exp
  });
}
__name(onRequestGet2, "onRequestGet2");
async function sign(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return base64url(signature);
}
__name(sign, "sign");
function base64url(bytes) {
  let binary = "";
  const arr = new Uint8Array(bytes);
  for (let i2 = 0; i2 < arr.length; i2++) {
    binary += String.fromCharCode(arr[i2]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64url, "base64url");
var init_sign = __esm({
  "tunnel/sign.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(onRequestGet2, "onRequestGet");
    __name2(sign, "sign");
    __name2(base64url, "base64url");
  }
});
async function findUserByGoogleSub(googleSub, env) {
  return env.DB.prepare(
    "SELECT id, email, name FROM users WHERE google_sub = ?"
  ).bind(googleSub).first();
}
__name(findUserByGoogleSub, "findUserByGoogleSub");
async function createUserFromGoogle({ sub, email, name }, env) {
  const res = await env.DB.prepare(
    "INSERT INTO users (google_sub, email, name) VALUES (?, ?, ?)"
  ).bind(sub, email, name).run();
  return {
    id: res.meta.last_row_id,
    email,
    name
  };
}
__name(createUserFromGoogle, "createUserFromGoogle");
var init_userStore = __esm({
  "utils/db/userStore.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(findUserByGoogleSub, "findUserByGoogleSub");
    __name2(createUserFromGoogle, "createUserFromGoogle");
  }
});
async function verifyIdToken(idToken, clientId) {
  const [headerB64, payloadB64, signatureB64] = idToken.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error("Invalid token format");
  }
  const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")));
  const jwksRes = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  const { keys } = await jwksRes.json();
  const key = keys.find((k2) => k2.kid === header.kid);
  if (!key) throw new Error("Invalid key id");
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    key,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const enc = new TextEncoder();
  const data = enc.encode(`${headerB64}.${payloadB64}`);
  const signature = Uint8Array.from(
    atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
    (c2) => c2.charCodeAt(0)
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature,
    data
  );
  if (!valid) throw new Error("Invalid signature");
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
  if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") {
    throw new Error("Invalid issuer");
  }
  if (payload.aud !== clientId) throw new Error("Invalid audience");
  if (payload.exp * 1e3 < Date.now()) throw new Error("Token expired");
  return payload;
}
__name(verifyIdToken, "verifyIdToken");
function timingSafeEqual(a2, b2) {
  if (a2.length !== b2.length) return false;
  let result = 0;
  for (let i2 = 0; i2 < a2.length; i2++) {
    result |= a2.charCodeAt(i2) ^ b2.charCodeAt(i2);
  }
  return result === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
var init_googleOAuth = __esm({
  "utils/auth/googleOAuth.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    __name2(verifyIdToken, "verifyIdToken");
    __name2(timingSafeEqual, "timingSafeEqual");
  }
});
async function onRequest2({ request, env }) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const stateCookie = getCookie(request, "oauth_state");
    if (!code || !state || !stateCookie) return new Response("Requ\xEAte invalide", { status: 400 });
    if (!timingSafeEqual(state, stateCookie)) return new Response("\xC9tat invalide", { status: 400 });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code
      })
    });
    if (!tokenRes.ok) return new Response("Authentification \xE9chou\xE9e", { status: 500 });
    const { id_token } = await tokenRes.json();
    const payload = await verifyIdToken(id_token, env.GOOGLE_CLIENT_ID);
    const { sub, email, name } = payload;
    const whitelistedEmails = env.WHITELIST_EMAILS.split(",").map((e2) => e2.trim().toLowerCase());
    if (!whitelistedEmails.includes(email.toLowerCase())) {
      return new Response(
        "Acc\xE8s refus\xE9. Votre adresse courriel n'est pas autoris\xE9e.",
        { status: 403 }
      );
    }
    let user = await findUserByGoogleSub(sub, env);
    if (!user) user = await createUserFromGoogle({ sub, email, name }, env);
    const expiresAt = Math.floor(Date.now() / 1e3) + SESSION_DURATION;
    const sessionId = await createSession(user.id, expiresAt, env);
    const headers = new Headers();
    headers.set("Location", "/");
    headers.append("Set-Cookie", clearOAuthStateCookie());
    headers.append("Set-Cookie", buildSessionCookie(sessionId, request));
    return new Response(null, {
      status: 302,
      headers
    });
  } catch (error) {
    return new Response(`Authentification \xE9chou\xE9e`, { status: 500 });
  }
}
__name(onRequest2, "onRequest2");
var init_callback = __esm({
  "auth/callback.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_cookies();
    init_userStore();
    init_sessionStore();
    init_googleOAuth();
    init_constants();
    __name2(onRequest2, "onRequest");
  }
});
function onRequest3(context) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const state = crypto.randomUUID();
  url.searchParams.set("client_id", context.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", context.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": buildOAuthStateCookie(state, context.request)
    }
  });
}
__name(onRequest3, "onRequest3");
var init_login = __esm({
  "auth/login.js"() {
    init_functionsRoutes_0_09158093669534528();
    init_checked_fetch();
    init_cookies();
    __name2(onRequest3, "onRequest");
  }
});
var routes;
var init_functionsRoutes_0_09158093669534528 = __esm({
  "../.wrangler/tmp/pages-Y5luYW/functionsRoutes-0.09158093669534528.mjs"() {
    init_logout();
    init_me();
    init_montreal_pmtiles();
    init_sign();
    init_callback();
    init_login();
    init_montreal_pmtiles();
    routes = [
      {
        routePath: "/auth/logout",
        mountPath: "/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/auth/me",
        mountPath: "/auth",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/tiles/montreal.pmtiles",
        mountPath: "/tiles",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions]
      },
      {
        routePath: "/tunnel/sign",
        mountPath: "/tunnel",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/auth/callback",
        mountPath: "/auth",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/auth/login",
        mountPath: "/auth",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/tiles/montreal.pmtiles",
        mountPath: "/tiles",
        method: "",
        middlewares: [],
        modules: [onRequest]
      }
    ];
  }
});
init_functionsRoutes_0_09158093669534528();
init_checked_fetch();
init_functionsRoutes_0_09158093669534528();
init_checked_fetch();
init_functionsRoutes_0_09158093669534528();
init_checked_fetch();
init_functionsRoutes_0_09158093669534528();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i2 = 0;
  while (i2 < str.length) {
    var char = str[i2];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i2, value: str[i2++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i2++, value: str[i2++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i2, value: str[i2++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i2, value: str[i2++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j2 = i2 + 1;
      while (j2 < str.length) {
        var code = str.charCodeAt(j2);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j2++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i2));
      tokens.push({ type: "NAME", index: i2, value: name });
      i2 = j2;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j2 = i2 + 1;
      if (str[j2] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j2));
      }
      while (j2 < str.length) {
        if (str[j2] === "\\") {
          pattern += str[j2++] + str[j2++];
          continue;
        }
        if (str[j2] === ")") {
          count--;
          if (count === 0) {
            j2++;
            break;
          }
        } else if (str[j2] === "(") {
          count++;
          if (str[j2 + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j2));
          }
        }
        pattern += str[j2++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i2));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i2));
      tokens.push({ type: "PATTERN", index: i2, value: pattern });
      i2 = j2;
      continue;
    }
    tokens.push({ type: "CHAR", index: i2, value: str[i2++] });
  }
  tokens.push({ type: "END", index: i2, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i2 = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i2 < tokens.length && tokens[i2].type === type)
      return tokens[i2++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i2], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i2 = 0, delimiter_1 = delimiter; _i2 < delimiter_1.length; _i2++) {
      var char2 = delimiter_1[_i2];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i2 < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x2) {
    return x2;
  } : _a;
  return function(pathname) {
    var m2 = re.exec(pathname);
    if (!m2)
      return false;
    var path = m2[0], index = m2.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i3) {
      if (m2[i3] === void 0)
        return "continue";
      var key = keys[i3 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m2[i3].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m2[i3], key);
      }
    }, "_loop_1");
    for (var i2 = 1; i2 < m2.length; i2++) {
      _loop_1(i2);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c2 = options.end, end = _c2 === void 0 ? true : _c2, _d2 = options.encode, encode = _d2 === void 0 ? function(x2) {
    return x2;
  } : _d2, _e2 = options.delimiter, delimiter = _e2 === void 0 ? "/#?" : _e2, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i2 = 0, tokens_1 = tokens; _i2 < tokens_1.length; _i2++) {
    var token = tokens_1[_i2];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_09158093669534528();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e2) {
      console.error("Failed to drain the unused request body.", e2);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
init_functionsRoutes_0_09158093669534528();
init_checked_fetch();
function reduceError(e2) {
  return {
    name: e2?.name,
    message: e2?.message ?? String(e2),
    stack: e2?.stack,
    cause: e2?.cause === void 0 ? void 0 : reduceError(e2.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e2) {
    const error = reduceError(e2);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_09158093669534528();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../../../../usr/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e2) {
      console.error("Failed to drain the unused request body.", e2);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../../../../usr/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e2) {
  return {
    name: e2?.name,
    message: e2?.message ?? String(e2),
    stack: e2?.stack,
    cause: e2?.cause === void 0 ? void 0 : reduceError2(e2.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e2) {
    const error = reduceError2(e2);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-zfpkW7/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../../../../usr/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-zfpkW7/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.8271315489030241.js.map
