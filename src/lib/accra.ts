import type { GeoPoint } from "@/lib/types";

/** Bounding box used to keep Road Assist trips inside Greater Accra. */
export const GREATER_ACCRA = {
  south: 5.48,
  north: 5.84,
  west: -0.45,
  east: 0.08,
};

export function inGreaterAccra(point: GeoPoint) {
  return (
    point.lat >= GREATER_ACCRA.south &&
    point.lat <= GREATER_ACCRA.north &&
    point.lng >= GREATER_ACCRA.west &&
    point.lng <= GREATER_ACCRA.east
  );
}

export const NOMINATIM_VIEWBOX = `${GREATER_ACCRA.west},${GREATER_ACCRA.north},${GREATER_ACCRA.east},${GREATER_ACCRA.south}`;
