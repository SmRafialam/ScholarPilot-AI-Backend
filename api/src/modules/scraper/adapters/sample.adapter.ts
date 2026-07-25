import { Injectable } from '@nestjs/common';
import { ScrapeSource } from '@prisma/client';
import { ScrapedItem, SourceAdapter } from './source-adapter.interface';

/**
 * Deterministic sample adapter — returns curated records WITHOUT any external
 * request. It exists so the full pipeline (enqueue → process → dedupe → review
 * → approve) can run and be tested safely. Real site adapters implement the
 * same interface and fetch via the robots-aware `fetchHtml` helper.
 */
@Injectable()
export class SampleAdapter implements SourceAdapter {
  readonly key = 'sample';

  async scrape(_source: ScrapeSource): Promise<ScrapedItem[]> {
    const universities = [
      { name: 'University of British Columbia', countryCode: 'CA', qsRanking: 34, tuitionFeeUsd: 42000 },
      { name: 'University of Copenhagen', countryCode: 'DK', qsRanking: 100, tuitionFeeUsd: 0 },
      { name: 'Trinity College Dublin', countryCode: 'IE', qsRanking: 87, tuitionFeeUsd: 25000 },
    ];
    return universities.map((u) => ({
      type: 'UNIVERSITY',
      dedupeKey: u.name,
      data: u,
    }));
  }
}
