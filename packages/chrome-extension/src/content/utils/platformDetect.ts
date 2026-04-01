// ─── URL / hostname matching helpers ───────────────────────────────

/**
 * Returns true when the current page matches a given hostname
 * (and optional path prefix).
 */
export function matchesSite(
  hostname: string,
  pathPrefix?: string,
): boolean {
  const loc = window.location;
  if (loc.hostname !== hostname) return false;
  if (pathPrefix && !loc.pathname.startsWith(pathPrefix)) return false;
  return true;
}

/**
 * Returns the first hostname match from a list, or null.
 */
export function detectPlatform(
  hostnames: { hostname: string; pathPrefix?: string; id: string }[],
): string | null {
  for (const entry of hostnames) {
    if (matchesSite(entry.hostname, entry.pathPrefix)) {
      return entry.id;
    }
  }
  return null;
}
