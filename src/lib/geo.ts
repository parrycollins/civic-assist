import type { GeoPoint } from "./types";

const EARTH_KM = 6371;

export function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

/** Round coordinates to ~300m so the public map never shows an exact private pin. */
export function approximateLocation(point: GeoPoint): GeoPoint {
  const step = 0.0027;
  return {
    lat: Math.round(point.lat / step) * step,
    lng: Math.round(point.lng / step) * step,
  };
}

export function jitter(point: GeoPoint, amount = 0.006): GeoPoint {
  return {
    lat: point.lat + (Math.random() - 0.5) * amount,
    lng: point.lng + (Math.random() - 0.5) * amount,
  };
}

export function pointToSegmentDistanceKm(
  point: GeoPoint,
  a: GeoPoint,
  b: GeoPoint,
) {
  const toXY = (p: GeoPoint) => {
    const x = p.lng * 111.32 * Math.cos(toRad((a.lat + b.lat) / 2));
    const y = p.lat * 110.57;
    return { x, y };
  };
  const p = toXY(point);
  const pa = toXY(a);
  const pb = toXY(b);
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((p.x - pa.x) * dx + (p.y - pa.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: pa.x + t * dx, y: pa.y + t * dy };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

export function minDistanceToPolylineKm(point: GeoPoint, line: GeoPoint[]) {
  let min = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    min = Math.min(min, pointToSegmentDistanceKm(point, line[i], line[i + 1]));
  }
  return min;
}

export function polylineLengthKm(line: GeoPoint[]) {
  let total = 0;
  for (let i = 0; i < line.length - 1; i++) {
    total += haversineKm(line[i], line[i + 1]);
  }
  return total;
}

export function decodePolyline(encoded: string): GeoPoint[] {
  const points: GeoPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}
