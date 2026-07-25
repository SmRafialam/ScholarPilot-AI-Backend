import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  profile(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { fullName: true, completionPercent: true },
    });
  }

  latestAnalysis(userId: string) {
    return this.prisma.profileAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { profileStrength: true, admissionChances: true, fundingChances: true, createdAt: true },
    });
  }

  counts(userId: string) {
    return this.prisma.$transaction([
      this.prisma.generatedDocument.count({ where: { userId } }),
      this.prisma.generatedEmail.count({ where: { userId } }),
      this.prisma.application.count({ where: { userId } }),
      this.prisma.matchResult.count({ where: { userId } }),
      this.prisma.bookmark.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);
  }

  upcomingDeadlines(userId: string) {
    return this.prisma.application.findMany({
      where: { userId, deadline: { gte: new Date() } },
      orderBy: { deadline: 'asc' },
      take: 5,
      select: { id: true, stage: true, deadline: true, universityId: true, scholarshipId: true },
    });
  }
}
