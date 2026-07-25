import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ReviewStatus,
  ScrapeEntityType,
  ScrapeStatus,
} from '@prisma/client';
import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { ProfessorService } from '../professor/professor.service';
import { ScholarshipService } from '../scholarship/scholarship.service';
import { UniversityService } from '../university/university.service';
import { AdapterRegistry } from './adapters/adapter.registry';
import { CreateScrapeSourceDto } from './dto/scraper.dto';
import { ScraperRepository } from './scraper.repository';

export const SCRAPE_QUEUE = 'scrape';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly repo: ScraperRepository,
    private readonly adapters: AdapterRegistry,
    @InjectQueue(SCRAPE_QUEUE) private readonly queue: Queue,
    private readonly universities: UniversityService,
    private readonly scholarships: ScholarshipService,
    private readonly professors: ProfessorService,
  ) {}

  // ------------------------- Sources & triggering -------------------------

  createSource(dto: CreateScrapeSourceDto) {
    return this.repo.createSource(dto);
  }

  listSources() {
    return this.repo.listSources();
  }

  /** Creates a job row and enqueues it for a worker to process. */
  async triggerScrape(sourceId: string) {
    const source = await this.repo.findSource(sourceId);
    if (!source) throw new NotFoundException('Scrape source not found');
    if (!source.enabled) throw new BadRequestException('Source is disabled');

    const job = await this.repo.createJob(source.id);
    await this.queue.add('scrape-source', { jobId: job.id });
    return job;
  }

  async runAllEnabledSources() {
    const sources = await this.repo.listEnabledSources();
    for (const source of sources) {
      const job = await this.repo.createJob(source.id);
      await this.queue.add('scrape-source', { jobId: job.id });
    }
    return { queued: sources.length };
  }

  getJob(id: string) {
    return this.repo.findJob(id);
  }

  // ------------------------- Worker processing -------------------------

  /** Called by the BullMQ processor. Runs the adapter, dedupes, stores records. */
  async processJob(jobId: string): Promise<void> {
    const job = await this.repo.findJob(jobId);
    if (!job) throw new NotFoundException('Job not found');

    await this.repo.updateJob(job.id, {
      status: ScrapeStatus.RUNNING,
      startedAt: new Date(),
    });

    try {
      const adapter = this.adapters.resolve(job.source);
      const items = await adapter.scrape(job.source);

      let newCount = 0;
      for (const item of items) {
        const dedupeHash = createHash('sha256')
          .update(`${job.source.id}:${item.dedupeKey}`)
          .digest('hex');
        const created = await this.repo.createRecordIfNew(
          job.id,
          item.type,
          item.data,
          dedupeHash,
        );
        if (created) newCount += 1;
      }

      await this.repo.updateJob(job.id, {
        status: ScrapeStatus.SUCCESS,
        itemsFound: newCount,
        finishedAt: new Date(),
      });
      await this.repo.touchSourceRun(job.source.id);
      this.logger.log(`Job ${job.id}: ${newCount} new record(s) queued for review`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await this.repo.updateJob(job.id, {
        status: ScrapeStatus.FAILED,
        error: message,
        finishedAt: new Date(),
      });
      throw err; // let BullMQ retry per backoff policy
    }
  }

  // ------------------------- Admin review -------------------------

  listReviewQueue(status: ReviewStatus, type?: ScrapeEntityType) {
    return this.repo.listReviewQueue(status, type);
  }

  async reject(recordId: string, adminUserId: string) {
    const record = await this.repo.findRecord(recordId);
    if (!record) throw new NotFoundException('Record not found');
    return this.repo.setRecordStatus(recordId, ReviewStatus.REJECTED, adminUserId);
  }

  /** Approves a scraped record → creates the real entity via the engine services. */
  async approve(recordId: string, adminUserId: string) {
    const record = await this.repo.findRecord(recordId);
    if (!record) throw new NotFoundException('Record not found');
    if (record.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Record already reviewed');
    }

    const data = record.rawData as Record<string, unknown>;
    let created: unknown;

    switch (record.type) {
      case ScrapeEntityType.UNIVERSITY:
        created = await this.createUniversity(data);
        break;
      case ScrapeEntityType.SCHOLARSHIP:
        created = await this.createScholarship(data);
        break;
      case ScrapeEntityType.PROFESSOR:
        created = await this.createProfessor(data);
        break;
      default:
        throw new BadRequestException(`Unsupported type ${record.type}`);
    }

    await this.repo.setRecordStatus(recordId, ReviewStatus.APPROVED, adminUserId);
    return created;
  }

  // ------------------------- Approval mappers -------------------------

  private async createUniversity(data: Record<string, unknown>) {
    const country = await this.resolveCountry(String(data.countryCode ?? ''));
    return this.universities.create({
      name: String(data.name),
      countryId: country.id,
      qsRanking: data.qsRanking as number | undefined,
      tuitionFeeUsd: data.tuitionFeeUsd as number | undefined,
      website: data.website as string | undefined,
    });
  }

  private async createScholarship(data: Record<string, unknown>) {
    const country = data.countryCode
      ? await this.resolveCountry(String(data.countryCode))
      : null;
    return this.scholarships.create({
      name: String(data.name),
      provider: data.provider as string | undefined,
      countryId: country?.id,
    });
  }

  private async createProfessor(data: Record<string, unknown>) {
    const university = await this.repo.findUniversityByName(
      String(data.universityName ?? ''),
    );
    if (!university) {
      throw new BadRequestException('University for professor not found');
    }
    return this.professors.create({
      name: String(data.name),
      universityId: university.id,
      email: data.email as string | undefined,
    });
  }

  private async resolveCountry(code: string) {
    const country = await this.repo.findCountryByCode(code.toUpperCase());
    if (!country) {
      throw new BadRequestException(`Unknown country code: ${code}`);
    }
    return country;
  }
}
