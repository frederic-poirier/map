
import { createResource } from 'solid-js';

const BASE_URL =
  import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://tunnel.frederic.dog';

export default function useTunnel(source) {
  const fetcher = async (key) => {
    if (!key) return null;

    const { path, params } = key;
    const url = new URL(path, BASE_URL);

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v != null) url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url.toString(), {
      credentials: 'include'
    });

    if (!res.ok) return null;
    return res.json();
  };

  const [resource] = createResource(source, fetcher);
  return resource;
}

