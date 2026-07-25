import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly service: AssistantService) {}

  /** Deep AI analysis of the profile (admission/funding %, roadmap, budget, timeline). */
  @HttpCode(HttpStatus.OK)
  @Post('analyze')
  analyze(@CurrentUser() user: AuthUser) {
    return this.service.analyze(user.id);
  }

  /** Most recent analysis. */
  @Get('analysis')
  latest(@CurrentUser() user: AuthUser) {
    return this.service.getLatest(user.id);
  }
}
