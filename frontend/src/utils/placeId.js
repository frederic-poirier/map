export const generatePlaceId = (GeoJSON) => {
  if (!GeoJSON || !GeoJSON.geometry || !GeoJSON.geometry.coordinates) {
    return null;
  }
  const [lon, lat] = GeoJSON.geometry.coordinates;
  const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
  const lonNum = typeof lon === "string" ? parseFloat(lon) : lon;
  return `${latNum.toFixed(6)}_${lonNum.toFixed(6)}`.replace(/\./g, "-");
};

export const parsePlaceId = (id) => {
  if (!id) return null;

  const [lat, lon] = id
    .split("_")
    .map((s) => s.replace(/(?<=\d).(?=\d)/, "."))

  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
};


