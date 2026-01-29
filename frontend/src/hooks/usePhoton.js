import { createResource, createSignal } from "solid-js";
import { useTunnel } from "./useTunnel";

export default function usePhoton() {
  const { fetchSigned } = useTunnel();

  const fetchPhotonData = async (query) => {
    if (!query || query.length < 3) return [];

    const res = await fetchSigned("/photon/api", {
      q: query,
      bbox: "-74.15453186035158,45.31980593747679,-73.1243133544922,45.746922837378264",
      limit: 5
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.features || [];
  };

  const [query, setQuery] = createSignal("");
  const [results] = createResource(query, fetchPhotonData);

  return { query, results, setQuery };
}
