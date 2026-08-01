import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository, DaySeries } from './analytics.repository';
import { TrackDto } from './dto/track.dto';

const DAY_MS = 86_400_000;

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly repo: AnalyticsRepository) {}

  /** Fire-and-forget: never fail a page load because tracking hiccuped. */
  async track(dto: TrackDto, userAgent?: string): Promise<{ ok: true }> {
    try {
      await this.repo.record({
        path: dto.path,
        visitorId: dto.visitorId,
        referrer: dto.referrer ?? null,
        userAgent: userAgent ?? null,
      });
    } catch (err) {
      this.logger.warn(`Failed to record page view: ${String(err)}`);
    }
    return { ok: true };
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
