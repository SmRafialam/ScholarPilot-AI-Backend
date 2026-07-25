import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  /** Compute and persist matches for the current user. */
  @HttpCode(HttpStatus.OK)
  @Post('run')
  run(@CurrentUser() user: AuthUser) {
    return this.service.runMatching(user.id);
  }

  /** Previously computed matches. */
  @Get('results')
  results(@CurrentUser() user: AuthUser) {
    return this.service.getResults(user.id);
  }
}
