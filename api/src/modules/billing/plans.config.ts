import { PlanTier } from '@prisma/client';

export interface PlanLimits {
  documentsPerMonth: number; // -1 = unlimited
  emailsPerMonth: number;
  matchRunsPerDay: number;
  professorMatching: boolean;
}

export interface Plan {
  tier: PlanTier;
  name: string;
  priceUsd: number;
  interval: 'forever' | 'month';
  features: string[];
  limits: PlanLimits;
}

/** Static plan catalog. Prices are indicative and finalized before launch. */
export const PLANS: Plan[] = [
  {
    tier: PlanTier.FREE,
    name: 'Free',
    priceUsd: 0,
    interval: 'forever',
    features: ['Academic profile', 'Limited matches', '1 prediction', '1 document / month', 'Basic tracker'],
    limits: { documentsPerMonth: 1, emailsPerMonth: 2, matchRunsPerDay: 1, professorMatching: false },
  },
  {
    tier: PlanTier.PRO,
    name: 'Pro',
    priceUsd: 12,
    interval: 'month',
    features: ['Unlimited matches', 'Full predictions', '10 documents / month', 'CV analyzer', 'Deadline reminders'],
    limits: { documentsPerMonth: 10, emailsPerMonth: 30, matchRunsPerDay: 20, professorMatching: false },
  },
  {
    tier: PlanTier.PREMIUM,
    name: 'Premium',
    priceUsd: 29,
    interval: 'month',
    features: ['Everything in Pro', 'Professor matching', 'Unlimited documents', 'Priority AI', 'Improvement roadmap'],
    limits: { documentsPerMonth: -1, emailsPerMonth: -1, matchRunsPerDay: 100, professorMatching: true },
  },
];

export function planFor(tier: PlanTier): Plan {
  return PLANS.find((p) => p.tier === tier) ?? PLANS[0];
}
