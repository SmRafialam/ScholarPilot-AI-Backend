import { ForbiddenException, Injectable } from '@nestjs/common';
import { AiProvider, PlanTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { planFor } from './plans.config';

/**
 * Enforces the per-plan usage limits (see plans.config.ts).
 * Browsing the catalog is always free/unlimited — these caps apply only to the
 * AI-powered actions that cost real money: documents, emails, matching runs,
 * and professor matching.
 */
@Injectable()
export class PlanLimitService {
  constructor(private readonly prisma: PrismaService) {}

  async getTier(userId: string): Promise<PlanTier> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    return sub?.tier ?? PlanTier.FREE;
  }

  // ------------------------- assertions -------------------------

  async assertCanGenerateDocument(userId: string): Promise<void> {
    const plan = planFor(await this.getTier(userId));
    const limit = plan.limits.documentsPerMonth;
    if (limit === -1) return;
    const used = await this.prisma.generatedDocument.count({
      where: { userId, createdAt: { gte: startOfMonth() } },
    });
    if (used >= limit) {
      throw this.limitError(plan.name, `${limit} document${limit === 1 ? '' : 's'} per month`);
    }
  }

  async assertCanGenerateEmail(userId: string): Promise<void> {
    const plan = planFor(await this.getTier(userId));
    const limit = plan.limits.emailsPerMonth;
    if (limit === -1) return;
    const used = await this.prisma.generatedEmail.count({
      where: { userId, createdAt: { gte: startOfMonth() } },
    });
    if (used >= limit) {
      throw this.limitError(plan.name, `${limit} email${limit === 1 ? '' : 's'} per month`);
    }
  }

  async assertCanRunMatching(userId: string): Promise<void> {
    const plan = planFor(await this.getTier(userId));
    const limit = plan.limits.matchRunsPerDay;
    if (limit === -1) return;
    const used = await this.prisma.aiUsageLog.count({
      where: { userId, feature: MATCH_RUN, createdAt: { gte: startOfDay() } },
    });
    if (used >= limit) {
      throw this.limitError(plan.name, `${limit} matching run${limit === 1 ? '' : 's'} per day`);
    }
  }

  /** Records one matching run for daily-quota accounting. */
  recordMatchRun(userId: string) {
    return this.prisma.aiUsageLog.create({
      data: { userId, provider: AiProvider.OPENAI, model: 'system', feature: MATCH_RUN },
    });
  }

  async canProfessorMatching(userId: string): Promise<boolean> {
    return planFor(await this.getTier(userId)).limits.professorMatching;
  }

  /** Current usage vs limits — for showing "1/1 used" style meters in the UI. */
  async usage(userId: string) {
    const plan = planFor(await this.getTier(userId));
    const [documents, emails, matchRuns] = await Promise.all([
      this.prisma.generatedDocument.count({ where: { userId, createdAt: { gte: startOfMonth() } } }),
      this.prisma.generatedEmail.count({ where: { userId, createdAt: { gte: startOfMonth() } } }),
      this.prisma.aiUsageLog.count({ where: { userId, feature: MATCH_RUN, createdAt: { gte: startOfDay() } } }),
    ]);
    return {
      tier: plan.tier,
      plan: plan.name,
      limits: plan.limits,
      used: { documentsThisMonth: documents, emailsThisMonth: emails, matchRunsToday: matchRuns },
    };
  }

  private limitError(planName: string, quota: string): ForbiddenException {
    return new ForbiddenException(
      `You've reached your ${planName} plan limit of ${quota}. Upgrade your plan to do more.`,
    );
  }
}

const MATCH_RUN = 'match_run';

function startOfMonth(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function startOfDay(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
