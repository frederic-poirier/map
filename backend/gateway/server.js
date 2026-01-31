import http from 'http';
import net from 'net';
import crypto from 'crypto';

const PORT = Number(process.env.PORT ?? 4000);
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw new Error('SESSION_SECRET missing');

const SESSION_COOKIE = 'session'; // doit matcher le worker

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://map.frederic.dog'
]);

const TARGETS = new Map([
  ['/photon', 'http://localhost:5000'],
  ['/otp', 'http://127.0.0.1:8080']
]);

function base64urlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(str, 'base64');
}

function hmac(data, secret) {
  return base64urlEncode(
    crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest()
  );
}

function verifySession(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [data, sig] = parts;
  const expected = hmac(data, secret);

  const a = base64urlDecode(sig);
  const b = base64urlDecode(expected);

  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(base64urlDecode(data).toString('utf8'));
  } catch {
    return null;
  }
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
  }
  return {};
}

function getCookie(req, name) {
  const cookie = req.headers.cookie || '';
  const match = cookie
    .split('; ')
    .find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function targetFor(pathname) {
  for (const [prefix, target] of TARGETS) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return { target, strip: prefix };
    }
  }
  return null;
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

  res.end(JSON.stringify({ photon, otp, tunnel: 'ok' }));
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

  const token = getCookie(req, SESSION_COOKIE);
  const session = token && verifySession(token, SESSION_SECRET);

  if (!session) {
    res.writeHead(401, cors);
    return res.end('Unauthorized');
  }

  const url = new URL(req.url, 'http://localhost');
  const route = targetFor(url.pathname);

  if (!route) {
    res.writeHead(404, cors);
    return res.end('Not found');
  }

  const backendPath =
    url.pathname.replace(route.strip, '') + url.search;

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

