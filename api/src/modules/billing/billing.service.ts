import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlanTier, SubscriptionStatus } from '@prisma/client';
import { BillingRepository } from './billing.repository';
import { Plan, PLANS, planFor } from './plans.config';

@Injectable()
export class BillingService {
  constructor(
    private readonly repo: BillingRepository,
    private readonly config: ConfigService,
  ) {}

  getPlans(): Plan[] {
    return PLANS;
  }

  /** Current subscription; everyone is on FREE until they upgrade. */
  async mySubscription(userId: string) {
    const sub = await this.repo.getSubscription(userId);
    const tier = sub?.tier ?? PlanTier.FREE;
    return {
      tier,
      status: sub?.status ?? SubscriptionStatus.ACTIVE,
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      plan: planFor(tier),
    };
  }

  /**
   * Starts a checkout. A real Stripe session is only created when
   * STRIPE_SECRET_KEY is configured — otherwise we return a clear, honest
   * "not configured" response instead of pretending to charge.
   */
  async checkout(userId: string, tier: PlanTier) {
    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return {
        configured: false,
        message:
          'Payments are not configured. Set STRIPE_SECRET_KEY to enable checkout.',
        selectedPlan: planFor(tier),
      };
    }
    // With a key present, this is where a Stripe Checkout Session would be
    // created and its URL returned. Left as an integration point.
    return {
      configured: true,
      message: 'Stripe configured — create a Checkout Session here.',
      selectedPlan: planFor(tier),
      userId,
    };
  }

  /**
   * Stripe webhook entry point. A real implementation verifies the signature
   * and, on checkout.session.completed / subscription events, updates the
   * user's Subscription via repo.upsertSubscription.
   */
  handleWebhook(): { received: true } {
    return { received: true };
  }
}
