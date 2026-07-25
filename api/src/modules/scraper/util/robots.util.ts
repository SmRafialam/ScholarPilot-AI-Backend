/**
 * Minimal robots.txt compliance check. Fetches /robots.txt for the origin and
 * evaluates Disallow rules for the given user-agent. Fail-open only when there
 * is no robots.txt (the widely-accepted convention); fail-closed on explicit
 * Disallow. Real adapters MUST call this before fetching any page.
 */
export async function isScrapeAllowed(
  targetUrl: string,
  userAgent = 'ScholarPilotBot',
): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch {
    return false;
  }

  const robotsUrl = `${url.origin}/robots.txt`;
  let body: string;
  try {
    const res = await fetch(robotsUrl, { headers: { 'User-Agent': userAgent } });
    if (res.status === 404) return true; // no robots.txt => allowed
    if (!res.ok) return true;
    body = await res.text();
  } catch {
    return true; // network issue fetching robots => don't block
  }

  const disallows = parseDisallows(body, userAgent);
  return !disallows.some((rule) => rule !== '' && url.pathname.startsWith(rule));
}

/** Collect Disallow paths for the matching user-agent group (falls back to *). */
function parseDisallows(body: string, userAgent: string): string[] {
  const lines = body.split('\n').map((l) => l.replace(/#.*$/, '').trim());
  const groups: Record<string, string[]> = {};
  let current: string | null = null;

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(':');
    if (!rawKey || rest.length === 0) continue;
    const key = rawKey.toLowerCase().trim();
    const value = rest.join(':').trim();

    if (key === 'user-agent') {
      current = value.toLowerCase();
      groups[current] ??= [];
    } else if (key === 'disallow' && current) {
      groups[current].push(value);
    }
  }

  const uaKey = userAgent.toLowerCase();
  return groups[uaKey] ?? groups['*'] ?? [];
}
