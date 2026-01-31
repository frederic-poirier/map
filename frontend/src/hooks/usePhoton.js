
import useTunnel from './useTunnel';

export default function usePhoton(searchSignal) {

  const results = useTunnel(() => {
    const q = searchSignal();
    if (!q || q.length < 3) return null;

    return {
      path: '/photon/api',
      params: {
        q,
        limit: 5,
        bbox: '-74.15453186035158,45.31980593747679,-73.1243133544922,45.746922837378264'
      }
    };
  });

  return [results];
}

