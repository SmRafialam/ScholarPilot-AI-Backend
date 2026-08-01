import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { PingDto, TrackDto } from './dto/track.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  /** Public, unthrottled beacon fired by the frontend on each page view. */
  @Public()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post('track')
  track(
    @Body() dto: TrackDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') xff?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.service.track(dto, clientIp(xff, ip), userAgent);
  }

  /** Public heartbeat that keeps a visitor counted as "online now". */
  @Public()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post('ping')
  ping(@Body() dto: PingDto, @Ip() ip: string, @Headers('x-forwarded-for') xff?: string) {
    return this.service.ping(dto, clientIp(xff, ip));
  }

  /** Traffic dashboard data — admins only. */
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('traffic')
  traffic() {
    return this.service.traffic();
  }

  /** Live "online now" count + country breakdown — admins only (polled). */
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('online')
  online() {
    return this.service.online();
  }
}

/** Prefer the real client IP behind Render's proxy. */
function clientIp(xff?: string, fallback?: string): string | undefined {
  return (xff ?? '').split(',')[0].trim() || fallback;
}
