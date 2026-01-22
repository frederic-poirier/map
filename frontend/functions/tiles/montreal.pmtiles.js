export async function onRequest({ env, request }) {
  const path = 'montreal.pmtiles';

  try {
    const range = request.headers.get('Range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : undefined;

      const head = await env.R2_BUCKET.head(path);
      if (!head) {
        return new Response('File not found', { status: 404 });
      }

      const objectSize = head.size;
      const rangeEnd = end !== undefined ? end : objectSize - 1;

      const object = await env.R2_BUCKET.get(path, {
        range: {
          offset: start,
          length: rangeEnd - start + 1
        }
      });

      if (!object) {
        return new Response('File not found', { status: 404 });
      }

      return new Response(object.body, {
        status: 206,
        headers: {
          'Content-Type': 'application/x-protobuf',
          'Content-Length': (rangeEnd - start + 1).toString(),
          'Content-Range': `bytes ${start}-${rangeEnd}/${objectSize}`,
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=31536000, immutable',
        }
      });
    }

    const object = await env.R2_BUCKET.get(path);

    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-protobuf',
        'Content-Length': object.size.toString(),
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });

  } catch (error) {
    console.error('R2 Error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Max-Age': '86400',
    }
  });
}
