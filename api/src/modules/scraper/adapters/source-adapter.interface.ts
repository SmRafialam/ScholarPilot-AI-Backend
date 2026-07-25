import { ScrapeEntityType, ScrapeSource } from '@prisma/client';

/** A single normalized record produced by an adapter, awaiting review. */
export interface ScrapedItem {
  type: ScrapeEntityType;
  /** Stable key used for duplicate detection within a source. */
  dedupeKey: string;
  data: Record<string, unknown>;
}

/** A source-specific scraper. Implementations MUST respect robots.txt. */
export interface SourceAdapter {
  readonly key: string;
  scrape(source: ScrapeSource): Promise<ScrapedItem[]>;
}
