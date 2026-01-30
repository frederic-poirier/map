
function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}


async function hmac(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  )

  return base64urlEncode(sig)
}


export async function signSession(payload, secret) {
  const data = base64urlEncode(
    new TextEncoder().encode(JSON.stringify(payload))
  )

  const sig = await hmac(data, secret)
  return `${data}.${sig}`
}

export async function verifySession(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [data, sig] = parts

  const expected = await hmac(data, secret)

  const a = base64urlDecode(sig)
  const b = base64urlDecode(expected)

  if (
    a.length !== b.length ||
    !crypto.subtle.timingSafeEqual(a, b)
  ) {
    return null
  }

  try {
    return JSON.parse(
      new TextDecoder().decode(base64urlDecode(data))
    )
  } catch {
    return null
  }
}

