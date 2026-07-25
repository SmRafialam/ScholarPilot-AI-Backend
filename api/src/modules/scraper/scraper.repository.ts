import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ReviewStatus,
  ScrapeEntityType,
  ScrapeStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ScraperRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------- Sources -------------------------
  createSource(data: Prisma.ScrapeSourceCreateInput) {
    return this.prisma.scrapeSource.create({ data });
  }
  listSources() {
    return this.prisma.scrapeSource.findMany({ orderBy: { name: 'asc' } });
  }
  findSource(id: string) {
    return this.prisma.scrapeSource.findUnique({ where: { id } });
  }
  listEnabledSources() {
    return this.prisma.scrapeSource.findMany({ where: { enabled: true } });
  }
  touchSourceRun(id: string) {
    return this.prisma.scrapeSource.update({
      where: { id },
      data: { lastRunAt: new Date() },
    });
  }

  // ------------------------- Jobs -------------------------
  createJob(sourceId: string) {
    return this.prisma.scrapeJob.create({ data: { sourceId } });
  }
  findJob(id: string) {
    return this.prisma.scrapeJob.findUnique({
      where: { id },
      include: { source: true },
    });
  }
  updateJob(id: string, data: Prisma.ScrapeJobUpdateInput) {
    return this.prisma.scrapeJob.update({ where: { id }, data });
  }

  // ------------------------- Records -------------------------

  /** Insert a scraped record; returns null if a duplicate (same hash) exists. */
  async createRecordIfNew(
    jobId: string,
    type: ScrapeEntityType,
    data: Record<string, unknown>,
    dedupeHash: string,
  ) {
    const existing = await this.prisma.scrapedRecord.findUnique({
      where: { dedupeHash },
    });
    if (existing) return null;
    return this.prisma.scrapedRecord.create({
      data: {
        jobId,
        type,
        rawData: data as Prisma.InputJsonValue,
        dedupeHash,
      },
    });
  }

  listReviewQueue(status: ReviewStatus, type?: ScrapeEntityType) {
    return this.prisma.scrapedRecord.findMany({
      where: { status, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  findRecord(id: string) {
    return this.prisma.scrapedRecord.findUnique({ where: { id } });
  }
  setRecordStatus(id: string, status: ReviewStatus, reviewedBy: string) {
    return this.prisma.scrapedRecord.update({
      where: { id },
      data: { status, reviewedBy, reviewedAt: new Date() },
    });
  }

  // ------------------------- Lookups for approval -------------------------
  findCountryByCode(code: string) {
    return this.prisma.country.findUnique({ where: { code } });
  }
  findUniversityByName(name: string) {
    return this.prisma.university.findFirst({ where: { name } });
  }

  // Enum passthroughs for the service
  readonly ScrapeStatus = ScrapeStatus;
  readonly ReviewStatus = ReviewStatus;
}
