const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function encodeGeohash(
  lat,
  lng,
  precision = 10
) {
  let idx = 0;
  let bit = 0;
  let even = true;
  let geohash = "";

  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;

  while (geohash.length < precision) {
    if (even) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        idx = (idx << 1) + 1;
        lngMin = mid;
      } else {
        idx = idx << 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        idx = (idx << 1) + 1;
        latMin = mid;
      } else {
        idx = idx << 1;
        latMax = mid;
      }
    }

    even = !even;
    bit++;

    if (bit === 5) {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

export function decodeGeohash(hash) {
  let even = true;
  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;

  for (const char of hash) {
    const idx = BASE32.indexOf(char);

    for (let n = 4; n >= 0; n--) {
      const bit = (idx >> n) & 1;

      if (even) {
        const mid = (lngMin + lngMax) / 2;
        bit ? (lngMin = mid) : (lngMax = mid);
      } else {
        const mid = (latMin + latMax) / 2;
        bit ? (latMin = mid) : (latMax = mid);
      }

      even = !even;
    }
  }

  return {
    lat: (latMin + latMax) / 2,
    lng: (lngMin + lngMax) / 2,
  };
}


export function geohashPrecisionFromZoom(zoom) {
  if (zoom >= 15) return 7
  if (zoom >= 13) return 6
  if (zoom >= 10) return 5
  return 4
}
