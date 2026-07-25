import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ProfessorModule } from '../professor/professor.module';
import { ScholarshipModule } from '../scholarship/scholarship.module';
import { UniversityModule } from '../university/university.module';
import { AdapterRegistry } from './adapters/adapter.registry';
import { SampleAdapter } from './adapters/sample.adapter';
import { ScraperController } from './scraper.controller';
import { ScraperProcessor } from './scraper.processor';
import { ScraperRepository } from './scraper.repository';
import { ScraperScheduler } from './scraper.scheduler';
import { SCRAPE_QUEUE, ScraperService } from './scraper.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: SCRAPE_QUEUE }),
    UniversityModule,
    ScholarshipModule,
    ProfessorModule,
  ],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    ScraperRepository,
    SampleAdapter,
    AdapterRegistry,
    ScraperProcessor,
    ScraperScheduler,
  ],
  exports: [ScraperService],
})
export class ScraperModule {}
