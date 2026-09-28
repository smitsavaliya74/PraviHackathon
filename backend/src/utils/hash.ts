import crypto from 'crypto';

/**
 * Compute SHA-256 hash of a string.
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Compute SHA-256 hash of a file buffer (for photo duplicate detection).
 */
export function sha256Buffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Compute the audit log hash for tamper-evident chain.
 * hash = SHA-256(prevHash + action + entityType + entityId + JSON(before) + JSON(after) + timestamp)
 */
export function computeAuditHash(params: {
  prevHash: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  timestamp: string;
}): string {
  const payload = [
    params.prevHash || '',
    params.action,
    params.entityType,
    params.entityId || '',
    JSON.stringify(params.before || null),
    JSON.stringify(params.after || null),
    params.timestamp,
  ].join('|');

  return sha256(payload);
}

/**
 * Haversine formula: compute distance in meters between two lat/lng points.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
