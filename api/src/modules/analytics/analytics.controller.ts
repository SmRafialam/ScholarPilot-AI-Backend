import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { TrackDto } from './dto/track.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  /** Public, unthrottled beacon fired by the frontend on each page view. */
  @Public()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post('track')
  track(@Body() dto: TrackDto, @Headers('user-agent') userAgent?: string) {
    return this.service.track(dto, userAgent);
  }

  /** Traffic dashboard data — admins only. */
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('traffic')
  traffic() {
    return this.service.traffic();
  }
}
