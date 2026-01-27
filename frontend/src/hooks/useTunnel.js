import { toast } from 'solid-sonner'

export function useTunnel() {
  async function fetchSigned(path, params = {}) {
    const query = new URLSearchParams({
      path,
      ...params
    });

    const r = await fetch(`tunnel/sign?${query.toString()}`);
    if (!r.ok) toast.error('Failed to sign the Tunnel URL')


    const { url } = await r.json();

    const res = await fetch(url);
    if (!res.ok) toast.error(`Tunnel request failed (${res.status})`);
    return res;
  }

  return { fetchSigned };
}
