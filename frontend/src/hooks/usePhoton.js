import { toast } from 'solid-sonner';
import { createStore } from 'solid-js/store';
import { tunnelFetch } from './useTunnel';
import usePlaces from './usePlaces';
import { encodeGeohash, geohashPrecisionFromZoom } from '../utils/geohash';

const [searchResultsCache, setSearchResultsCache] = createStore({})


function makeSearchCacheKey({query, bias}) {
  if (!bias) return query
  
  const precision = geohashPrecisionFromZoom(bias.zoom)
  const hash = encodeGeohash(bias.lat, bias.lon, precision)

  return `${query}|${hash}|z${bias.zoom}`
}

function makePhotonParams({ query, bias }) {
  const params = {
    q: query,
    limit: 5,
    bbox: '-74.15453186035158,45.31980593747679,-73.1243133544922,45.746922837378264'
  }

  if (bias) {
    params.lat = bias.lat
    params.lon = bias.lon
    params.zoom = Math.trunc(bias.zoom)
    params.location_bias_scale = 0.1
  }

  return params
}

export default function usePhoton() {
  const {
    addPlaceCache,
    encodePlaceId,
    decodePlaceId,
    getPlaceCache,
    hasPlaceCache,
  } = usePlaces()

  async function reverseResult(placeId) {
    const { lat, lng } = decodePlaceId(placeId)

    try {
      const data = await tunnelFetch({
        path: "/photon/reverse",
        params: { lat, lon: lng },
      })

      const place = data.features[0]
      addPlaceCache(place)
      return place
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function searchResults(searchQuery) {
    if (!searchQuery?.query || searchQuery.query.length < 3) return null

    const cacheKey = makeSearchCacheKey(searchQuery)
    const cachedIds = searchResultsCache[cacheKey]

    if (cachedIds) {
      const results = []

      for (const id of cachedIds) {
        if (!hasPlaceCache(id)) return null
        results.push(getPlaceCache(id))
      }

      return results
    }

    try {
      const data = await tunnelFetch({
        path: "/photon/api",
        params: makePhotonParams(searchQuery),
      })

      const results = data.features
      const ids = []

      for (const result of results) {
        addPlaceCache(result)
        ids.push(encodePlaceId(result))
      }

      setSearchResultsCache(cacheKey, ids)
      return results
    } catch (e) {
      toast.error(e.message)
    }
  }

  return { reverseResult, searchResults }
}