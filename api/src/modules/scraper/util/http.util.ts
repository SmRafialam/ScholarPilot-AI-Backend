import { ForbiddenException } from '@nestjs/common';
import { isScrapeAllowed } from './robots.util';

const USER_AGENT = 'ScholarPilotBot/1.0 (+https://scholarpilot.ai/bot)';

/**
 * Robots-aware HTML fetcher. Refuses to fetch any URL disallowed by robots.txt.
 * Real site adapters use this so compliance is enforced in one place.
 */
export async function fetchHtml(url: string): Promise<string> {
  const allowed = await isScrapeAllowed(url, USER_AGENT);
  if (!allowed) {
    throw new ForbiddenException(`robots.txt disallows scraping ${url}`);
  }
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`);
  }
  return res.text();
}
