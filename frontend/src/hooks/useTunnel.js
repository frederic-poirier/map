
const BASE_URL =
  import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://tunnel.frederic.dog';

export async function tunnelFetch({ path, params }) {
  const url = new URL(path, BASE_URL);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    credentials: 'include'
  });

  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

