export const onRequest = async ({ request, env, next }) => {

  const url = new URL(request.url)


  if (url.pathname.startsWith("/tiles/")) {
    const key = url.pathname.replace("/tiles/", "");
    if (!env.TILES_BUCKET) {
      return new Response("TILES_BUCKET missing", { status: 500 });
    }

    console.log("R2 key:", key);
    const range = request.headers.get("range") ?? undefined;

    const object = await env.TILES_BUCKET.get(key, {
      range: range ? parseRange(range) : undefined,
    });

    if (!object) return new Response("Not Found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.etag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    if (range && object.range) {
      headers.set(
        "Content-Range",
        `bytes ${object.range.offset}-${object.range.end}/${object.size}`
      );
      return new Response(object.body, { status: 206, headers });
    }

    return new Response(object.body, { headers });
  }

  function parseRange(range) {
    const m = range.match(/bytes=(\d+)-(\d+)?/);
    if (!m) return undefined;
    return { offset: Number(m[1]), length: m[2] ? Number(m[2]) - Number(m[1]) + 1 : undefined };
  }


  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) {
    if (!env.BACKEND_ORIGIN) {
      return new Response("BACKEND_ORIGIN missing", { status: 500 });
    }

    const backendUrl = new URL(env.BACKEND_ORIGIN);
    backendUrl.pathname = url.pathname;
    backendUrl.search = url.search;

    const headers = new Headers(request.headers);
    headers.set("X-Forwarded-Host", url.host);
    headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

    return fetch(backendUrl.toString(), {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "manual",
    });
  }
  return next();
}
