import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { PlanLimitService } from './plan-limit.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly service: BillingService,
    private readonly limits: PlanLimitService,
  ) {}

  @Get('plans')
  plans() {
    return this.service.getPlans();
  }

  @Get('subscription')
  subscription(@CurrentUser() u: AuthUser) {
    return this.service.mySubscription(u.id);
  }

  /** Current usage vs plan limits (for usage meters in the UI). */
  @Get('usage')
  usage(@CurrentUser() u: AuthUser) {
    return this.limits.usage(u.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('checkout')
  checkout(@CurrentUser() u: AuthUser, @Body() dto: CheckoutDto) {
    return this.service.checkout(u.id, dto.tier);
  }

  /** Stripe webhook (public — verified by signature in a real implementation). */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  webhook() {
    return this.service.handleWebhook();
  }
}
