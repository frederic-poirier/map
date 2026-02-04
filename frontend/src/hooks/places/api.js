import { createStore } from "solid-js/store";
import { toast } from "solid-sonner";
import { tunnelFetch } from "../useTunnel";
import { encodeGeohash, geohashPrecisionFromZoom } from "../../utils/geohash";
import { addPlaceCache, getPlaceCache } from "./store";
import { encodePlaceId, decodePlaceId } from "./utils";

const [searchResultsCache, setSearchResultsCache] = createStore({});

function makeSearchCacheKey({ query, bias }) {
  if (!bias) return query;

  const precision = geohashPrecisionFromZoom(bias.zoom);
  const hash = encodeGeohash(bias.lat, bias.lon, precision);
  const formattedQuery = query.toLowerCase().trim();

  return `${formattedQuery}|${hash}|z${bias.zoom}`;
}

function makePhotonParams({ query, bias }) {
  const params = {
    q: query,
    limit: 5,
    bbox: "-74.15453186035158,45.31980593747679,-73.1243133544922,45.746922837378264",
  };

  if (bias) {
    params.lat = bias.lat;
    params.lon = bias.lon;
    params.zoom = bias.zoom;
    params.location_bias_scale = 0.1;
  }

  return params;
}

export async function reverseResult(placeId) {
  const { lat, lng } = decodePlaceId(placeId);

  try {
    const data = await tunnelFetch({
      path: "/photon/reverse",
      params: { lat, lon: lng },
    });

    const place = data.features[0];
    if (place) {
      const id = encodePlaceId(place);
      addPlaceCache(place, id);
      return place;
    }
  } catch (e) {
    toast.error(e.message);
  }
}

export async function searchResults(searchQuery) {
  if (!searchQuery?.query || searchQuery.query.length < 3) return null;

  const cacheKey = makeSearchCacheKey(searchQuery);
  const cache = searchResultsCache[cacheKey];

  if (cache) return cache.map((id) => getPlaceCache(id));

  try {
    const data = await tunnelFetch({
      path: "/photon/api",
      params: makePhotonParams(searchQuery),
    });

    const results = data.features;
    const ids = [];

    for (const result of results) {
      const id = encodePlaceId(result);
      addPlaceCache(result, id);
      ids.push(id);
    }

    setSearchResultsCache(cacheKey, ids);
    return results;
  } catch (e) {
    toast.error(e.message);
  }
}

export { searchResultsCache, setSearchResultsCache };
