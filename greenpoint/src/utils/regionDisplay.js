/**
 * Helpers for showing region names instead of raw coordinates in feed and admin.
 * Old complaints may have region stored as "Lat: x, Lng: y".
 */

export function isCoordinateRegion(region) {
  return typeof region === 'string' && /^Lat:\s*-?\d/.test(region.trim());
}

export function getRegionDisplayName(region) {
  if (!region) return 'Unknown';
  return isCoordinateRegion(region) ? 'Other location' : region;
}
