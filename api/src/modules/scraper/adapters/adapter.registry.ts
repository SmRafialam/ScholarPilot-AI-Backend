import { Injectable } from '@nestjs/common';
import { ScrapeSource } from '@prisma/client';
import { SampleAdapter } from './sample.adapter';
import { SourceAdapter } from './source-adapter.interface';

/**
 * Resolves the correct adapter for a source. As real site adapters are added,
 * pick them here by source host / config. Defaults to the sample adapter.
 */
@Injectable()
export class AdapterRegistry {
  constructor(private readonly sample: SampleAdapter) {}

  resolve(_source: ScrapeSource): SourceAdapter {
    return this.sample;
  }
}
