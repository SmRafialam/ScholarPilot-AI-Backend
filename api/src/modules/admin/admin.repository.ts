import { Injectable } from '@nestjs/common';
import { PlanTier, Prisma, Role, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryUsersDto } from './dto/admin.dto';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = query.q
      ? { email: { contains: query.q, mode: 'insensitive' } }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          profile: { select: { fullName: true, completionPercent: true } },
          subscription: { select: { tier: true, status: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  findUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateRole(id: string, role: Role) {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  updateStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  /** Set a user's subscription tier (used by admins to grant Pro/Premium). */
  updatePlan(userId: string, tier: PlanTier) {
    return this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, tier, status: SubscriptionStatus.ACTIVE },
      update: { tier, status: SubscriptionStatus.ACTIVE },
    });
  }

  async analytics() {
    const [
      users,
      students,
      universities,
      scholarships,
      professors,
      applications,
      documents,
      emails,
      matches,
      pendingReview,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.university.count(),
      this.prisma.scholarship.count(),
      this.prisma.professor.count(),
      this.prisma.application.count(),
      this.prisma.generatedDocument.count(),
      this.prisma.generatedEmail.count(),
      this.prisma.matchResult.count(),
      this.prisma.scrapedRecord.count({ where: { status: 'PENDING' } }),
    ]);

    const usage = await this.prisma.aiUsageLog.aggregate({
      _sum: { tokensIn: true, tokensOut: true, costCents: true },
      _count: true,
    });

    return {
      users,
      students,
      knowledgeBase: { universities, scholarships, professors },
      activity: { applications, documents, emails, matches },
      moderation: { pendingReview },
      ai: {
        calls: usage._count,
        tokensIn: usage._sum.tokensIn ?? 0,
        tokensOut: usage._sum.tokensOut ?? 0,
        costCents: usage._sum.costCents ?? 0,
      },
    };
  }
}
