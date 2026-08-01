import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository, DaySeries } from './analytics.repository';
import { GeoService } from './geo.service';
import { PingDto, TrackDto } from './dto/track.dto';

const DAY_MS = 86_400_000;
const PRESENCE_WINDOW_MS = 2 * 60_000; // "online" = active in the last 2 minutes

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly repo: AnalyticsRepository,
    private readonly geo: GeoService,
  ) {}

  /** Fire-and-forget: never fail a page load because tracking hiccuped. */
  async track(dto: TrackDto, ip?: string, userAgent?: string): Promise<{ ok: true }> {
    try {
      const view = await this.repo.record({
        path: dto.path,
        visitorId: dto.visitorId,
        referrer: dto.referrer ?? null,
        userAgent: userAgent ?? null,
      });
      // Resolve country + refresh presence in the background — don't block the beacon.
      void this.enrich(view.id, dto.visitorId, dto.path, ip);
    } catch (err) {
      this.logger.warn(`Failed to record page view: ${String(err)}`);
    }
    return { ok: true };
  }

  /** Heartbeat from open tabs — keeps the visitor counted as "online". */
  async ping(dto: PingDto, ip?: string): Promise<{ ok: true }> {
    try {
      const geo = await this.geo.lookup(ip);
      await this.repo.upsertPresence(dto.visitorId, dto.path ?? null, geo);
    } catch (err) {
      this.logger.debug(`Ping failed: ${String(err)}`);
    }
    return { ok: true };
  }

  async online() {
    const cutoff = new Date(Date.now() - PRESENCE_WINDOW_MS);
    return this.repo.online(cutoff);
  }

  private async enrich(viewId: string, visitorId: string, path: string, ip?: string): Promise<void> {
    try {
      const geo = await this.geo.lookup(ip);
      await Promise.all([
        geo.country ? this.repo.setGeo(viewId, geo) : Promise.resolve(),
        this.repo.upsertPresence(visitorId, path, geo),
      ]);
    } catch (err) {
      this.logger.debug(`Enrich failed: ${String(err)}`);
    }
  }

  async traffic() {
    const now = Date.now();
    const startOfDay = new Date(new Date(now).toISOString().slice(0, 10) + 'T00:00:00.000Z');
    const weekAgo = new Date(now - 7 * DAY_MS);
    const raw = await this.repo.traffic(startOfDay, weekAgo);

    // Fill the last 14 days so the chart is continuous even with gaps.
    const map = new Map(raw.series.map((s) => [s.date, s]));
    const series: DaySeries[] = [];
    for (let i = 13; i >= 0; i--) {
      const key = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
      const found = map.get(key);
      series.push({ date: key, views: found?.views ?? 0, visitors: found?.visitors ?? 0 });
    }

    return { ...raw, series };
  }
}
