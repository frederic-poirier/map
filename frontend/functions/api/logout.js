
function log(message, data = {}) {
  console.log(`[LOGOUT] ${message}`, JSON.stringify(data));
}

export async function onRequest() {
  log("Logging out");

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.append("Set-Cookie", "auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  headers.append("Set-Cookie", "refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");

  log("Cookies cleared");

  return new Response(JSON.stringify({ success: true }), {
    headers,
  });
}
