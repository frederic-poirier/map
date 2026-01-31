
import { tunnelFetch } from './useTunnel';

export default function usePhoton() {
  async function reverseResult({ lat, lng }) {
    return tunnelFetch({
      path: '/photon/reverse',
      params: { lat, lon: lng }
    });
  }

  async function searchResults(q) {
    if (!q || q.length < 3) return null;

    return tunnelFetch({
      path: '/photon/api',
      params: {
        q,
        limit: 5,
        bbox: '-74.15453186035158,45.31980593747679,-73.1243133544922,45.746922837378264'
      }
    });
  }

  return { reverseResult, searchResults };
}

