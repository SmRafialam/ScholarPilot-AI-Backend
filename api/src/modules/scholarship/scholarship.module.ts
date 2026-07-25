import { Module } from '@nestjs/common';
import { ScholarshipController } from './scholarship.controller';
import { ScholarshipRepository } from './scholarship.repository';
import { ScholarshipService } from './scholarship.service';

@Module({
  controllers: [ScholarshipController],
  providers: [ScholarshipService, ScholarshipRepository],
  exports: [ScholarshipService],
})
export class ScholarshipModule {}
