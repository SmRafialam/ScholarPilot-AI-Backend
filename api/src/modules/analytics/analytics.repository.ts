import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Geo } from './geo.service';

export interface DaySeries {
  date: string;
  views: number;
  visitors: number;
}

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  record(data: {
    path: string;
    visitorId: string;
    userId?: string | null;
    referrer?: string | null;
    userAgent?: string | null;
  }) {
    return this.prisma.pageView.create({
      data: {
        path: data.path.slice(0, 512),
        visitorId: data.visitorId.slice(0, 128),
        userId: data.userId ?? null,
        referrer: data.referrer ? data.referrer.slice(0, 512) : null,
        userAgent: data.userAgent ? data.userAgent.slice(0, 512) : null,
      },
    });
  }

  setGeo(id: string, geo: Geo) {
    return this.prisma.pageView.update({
      where: { id },
      data: { country: geo.country ?? null, countryCode: geo.countryCode ?? null, city: geo.city ?? null },
    });
  }

  upsertPresence(visitorId: string, path: string | null, geo: Geo) {
    const now = new Date();
    return this.prisma.visitorPresence.upsert({
      where: { visitorId },
      create: { visitorId, path, country: geo.country ?? null, countryCode: geo.countryCode ?? null, lastSeen: now },
      update: { path, country: geo.country ?? null, countryCode: geo.countryCode ?? null, lastSeen: now },
    });
  }

  async online(cutoff: Date) {
    const onlineNow = await this.prisma.visitorPresence.count({ where: { lastSeen: { gte: cutoff } } });
    const byCountry = await this.prisma.$queryRaw<{ country: string; count: number }[]>`
      SELECT COALESCE("country", 'Unknown') AS country, COUNT(*)::int AS count
      FROM "VisitorPresence"
      WHERE "lastSeen" >= ${cutoff}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 8`;
    return { onlineNow, byCountry };
  }

  async traffic(startOfDay: Date, weekAgo: Date) {
    const [totalViews, viewsToday, viewsThisWeek] = await Promise.all([
      this.prisma.pageView.count(),
      this.prisma.pageView.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);

    const uniq = await this.prisma.$queryRaw<{ c: number }[]>`
      SELECT COUNT(DISTINCT "visitorId")::int AS c FROM "PageView"`;
    const uniqToday = await this.prisma.$queryRaw<{ c: number }[]>`
      SELECT COUNT(DISTINCT "visitorId")::int AS c FROM "PageView" WHERE "createdAt" >= ${startOfDay}`;

    const series = await this.prisma.$queryRaw<DaySeries[]>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
             COUNT(*)::int AS views,
             COUNT(DISTINCT "visitorId")::int AS visitors
      FROM "PageView"
      WHERE "createdAt" >= NOW() - INTERVAL '13 days'
      GROUP BY 1
      ORDER BY 1`;

    const topPaths = await this.prisma.$queryRaw<{ path: string; views: number }[]>`
      SELECT "path", COUNT(*)::int AS views
      FROM "PageView"
      GROUP BY "path"
      ORDER BY views DESC
      LIMIT 8`;

    const topCountries = await this.prisma.$queryRaw<{ country: string; views: number }[]>`
      SELECT COALESCE("country", 'Unknown') AS country, COUNT(*)::int AS views
      FROM "PageView"
      GROUP BY 1
      ORDER BY views DESC
      LIMIT 8`;

    return {
      totalViews,
      viewsToday,
      viewsThisWeek,
      uniqueVisitors: uniq[0]?.c ?? 0,
      visitorsToday: uniqToday[0]?.c ?? 0,
      series,
      topPaths,
      topCountries,
    };
  }
}
