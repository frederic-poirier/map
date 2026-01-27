import net from 'net'
import crypto from 'crypto';
import http from 'http'

const SECRET = process.env.SIGNING_SECRET;
if (!SECRET) throw new Error('SIGNING_SECRET missing');


const PORT = Number(process.env.PORT ?? 4000);

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://map.frederic.dog'
])

const TARGETS = new Map([
  ['/photon', 'http://127.0.0.1:5000'],
  ['/otp', 'http://127.0.0.1:8080']
])

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
  }
  return {};
}


function verifyAndCleanUrl(req) {
  const url = new URL(req.url, 'http://localhost');

  const sig = url.searchParams.get('sig');
  const exp = Number(url.searchParams.get('exp'));

  if (!sig || !exp) return null;
  if (Date.now() / 1000 > exp) return null;

  // Canonical base string
  url.searchParams.delete('sig');
  const base = url.pathname + '?' + url.searchParams.toString();

  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(base)
    .digest('base64url');

  try {
    if (
      !crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(expected)
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  // Nettoyage final
  url.searchParams.delete('exp');

  return url;
}


function checkPort(port) {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(300);

    socket
      .once('connect', () => {
        socket.destroy();
        resolve('up');
      })
      .once('timeout', () => {
        socket.destroy();
        resolve('down');
      })
      .once('error', () => resolve('down'))
      .connect(port, '127.0.0.1');
  });
}

async function handleStatus(req, res, cors) {
  if (req.method !== 'GET') {
    res.writeHead(405, cors);
    return res.end();
  }

  const [photon, otp] = await Promise.all([
    checkPort(5000),
    checkPort(8080)
  ]);

  res.writeHead(200, {
    'Content-Type': 'application/json',
    ...cors
  });

  res.end(JSON.stringify({
    photon,
    otp,
    tunnel: 'unknown'
  }));
}


function targetFor(pathname) {
  for (const [prefix, target] of TARGETS) {
    if (
      pathname === prefix ||
      pathname.startsWith(prefix + '/')
    ) {
      return { target, strip: prefix };
    }
  }
  return null;
}


http.createServer(async (req, res) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }

  if (req.url === '/status') {
    return handleStatus(req, res, cors);
  }

  /* ---- à partir d’ici : signé obligatoire ---- */
  const cleanUrl = verifyAndCleanUrl(req);
  if (!cleanUrl) {
    res.writeHead(401, cors);
    return res.end('Unauthorized');
  }

  const route = targetFor(cleanUrl.pathname);
  if (!route) {
    res.writeHead(404, cors);
    return res.end('Not found');
  }

  const backendPath =
    cleanUrl.pathname.replace(route.strip, '') +
    (cleanUrl.search || '');

  const proxyReq = http.request(
    route.target + backendPath,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(route.target).host
      }
    },
    proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        ...cors
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', () => {
    res.writeHead(502, cors);
    res.end('Bad gateway');
  });

  req.pipe(proxyReq);
}).listen(PORT);
