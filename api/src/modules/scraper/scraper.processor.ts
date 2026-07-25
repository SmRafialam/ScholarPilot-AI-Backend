import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SCRAPE_QUEUE, ScraperService } from './scraper.service';

/** BullMQ worker: consumes queued scrape jobs and delegates to the service. */
@Processor(SCRAPE_QUEUE)
export class ScraperProcessor extends WorkerHost {
  private readonly logger = new Logger(ScraperProcessor.name);

  constructor(private readonly service: ScraperService) {
    super();
  }

  async process(job: Job<{ jobId: string }>): Promise<void> {
    this.logger.log(`Processing scrape job ${job.data.jobId}`);
    await this.service.processJob(job.data.jobId);
  }
}
