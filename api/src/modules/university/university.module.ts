import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { UniversityRepository } from './university.repository';
import { UniversityService } from './university.service';

@Module({
  controllers: [UniversityController],
  providers: [UniversityService, UniversityRepository],
  exports: [UniversityService],
})
export class UniversityModule {}
