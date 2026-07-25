import { Injectable } from '@nestjs/common';
import { PlanTier, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  upsertSubscription(
    userId: string,
    tier: PlanTier,
    status: SubscriptionStatus,
    providerRef?: string,
    currentPeriodEnd?: Date,
  ) {
    return this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, tier, status, provider: 'stripe', providerRef, currentPeriodEnd },
      update: { tier, status, providerRef, currentPeriodEnd },
    });
  }
}
