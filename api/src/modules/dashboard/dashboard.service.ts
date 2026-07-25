import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async summary(userId: string) {
    const [profile, analysis, counts, upcomingDeadlines] = await Promise.all([
      this.repo.profile(userId),
      this.repo.latestAnalysis(userId),
      this.repo.counts(userId),
      this.repo.upcomingDeadlines(userId),
    ]);

    const [documents, emails, applications, matches, saved, unreadNotifications] =
      counts;

    return {
      profile: {
        fullName: profile?.fullName ?? null,
        completionPercent: profile?.completionPercent ?? 0,
      },
      analysis,
      counts: { documents, emails, applications, matches, saved },
      upcomingDeadlines,
      unreadNotifications,
    };
  }
}
