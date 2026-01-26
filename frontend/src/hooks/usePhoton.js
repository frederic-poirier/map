import { createResource, createSignal } from "solid-js";
import { auth } from "./useAuth";

export default function usePhoton() {
    const fetchPhotonData = async (query) => {
        if (!query || query.length < 3) return [];
        const res = await fetch(`/edge/photon/api?q=${query}&bbox=-74.15453186035158,45.31980593747679,-73.1243133544922,45.746922837378264&limit=5`, {
          headers: {
            Authorization: `Bearer ${auth().user.edgeToken}`
          }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.features || [];
      } 

      const [query, setQuery] = createSignal("");
      const [results] = createResource(query, fetchPhotonData);

      return { query, results, setQuery };
}