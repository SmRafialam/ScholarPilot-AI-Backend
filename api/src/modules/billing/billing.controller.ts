import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Get('plans')
  plans() {
    return this.service.getPlans();
  }

  @Get('subscription')
  subscription(@CurrentUser() u: AuthUser) {
    return this.service.mySubscription(u.id);
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
