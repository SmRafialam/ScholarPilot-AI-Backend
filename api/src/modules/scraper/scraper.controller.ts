import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewStatus, Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateScrapeSourceDto, ReviewQueueQueryDto } from './dto/scraper.dto';
import { ScraperService } from './scraper.service';

/** All scraper operations are ADMIN-only. */
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('scrape')
export class ScraperController {
  constructor(private readonly service: ScraperService) {}

  @Post('sources')
  createSource(@Body() dto: CreateScrapeSourceDto) {
    return this.service.createSource(dto);
  }

  @Get('sources')
  listSources() {
    return this.service.listSources();
  }

  @Post('sources/:id/run')
  run(@Param('id') id: string) {
    return this.service.triggerScrape(id);
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    return this.service.getJob(id);
  }

  @Get('review')
  reviewQueue(@Query() query: ReviewQueueQueryDto) {
    return this.service.listReviewQueue(
      query.status ?? ReviewStatus.PENDING,
      query.type,
    );
  }

  @Post('review/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.approve(id, user.id);
  }

  @Post('review/:id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.reject(id, user.id);
  }
}
