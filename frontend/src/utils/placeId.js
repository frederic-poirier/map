// Utility for generating and parsing deterministic place IDs based on coordinates
// Format: lat_lon with 6 decimals, dots replaced by hyphens for URL safety
export const generatePlaceId = (lat, lon) => {
  const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
  const lonNum = typeof lon === "string" ? parseFloat(lon) : lon;
  return `${latNum.toFixed(6)}_${lonNum.toFixed(6)}`.replace(/\./g, "-");
};

export const parsePlaceId = (id) => {
  if (!id) return null;
  const [lat, lon] = id
    .split("_")
    .map((s) => parseFloat(s.replace(/-/g, ".")));
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
};
