import { Injectable, Logger } from '@nestjs/common';

export interface Geo {
  country?: string;
  countryCode?: string;
  city?: string;
}

/**
 * Resolves a client IP to a country/city via the free ip-api.com service.
 * Results are cached in-memory per IP to stay well under the free rate limit.
 */
@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly cache = new Map<string, Geo>();

  async lookup(rawIp?: string): Promise<Geo> {
    const ip = (rawIp ?? '').split(',')[0].trim();
    if (!ip || this.isPrivate(ip)) return {};

    const cached = this.cache.get(ip);
    if (cached) return cached;

    let geo: Geo = {};
    try {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city`,
        { signal: AbortSignal.timeout(2500) },
      );
      const j = (await res.json()) as {
        status?: string;
        country?: string;
        countryCode?: string;
        city?: string;
      };
      if (j.status === 'success') {
        geo = { country: j.country, countryCode: j.countryCode, city: j.city };
      }
    } catch (err) {
      this.logger.debug(`Geo lookup failed for ${ip}: ${String(err)}`);
    }

    if (this.cache.size > 5000) this.cache.clear();
    this.cache.set(ip, geo);
    return geo;
  }

  private isPrivate(ip: string): boolean {
    return (
      ip === '::1' ||
      ip.startsWith('127.') ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
      ip.startsWith('fc') ||
      ip.startsWith('fd')
    );
  }
}
