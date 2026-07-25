import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScraperService } from './scraper.service';

/** Incremental crawling — re-queues all enabled sources on a schedule. */
@Injectable()
export class ScraperScheduler {
  private readonly logger = new Logger(ScraperScheduler.name);

  constructor(private readonly service: ScraperService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleIncrementalCrawl(): Promise<void> {
    const { queued } = await this.service.runAllEnabledSources();
    this.logger.log(`Incremental crawl queued ${queued} source(s)`);
  }
}
