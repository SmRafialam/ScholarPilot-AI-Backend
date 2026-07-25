import { Module } from '@nestjs/common';
import { TrackerController } from './tracker.controller';
import { TrackerRepository } from './tracker.repository';
import { TrackerService } from './tracker.service';

@Module({
  controllers: [TrackerController],
  providers: [TrackerService, TrackerRepository],
  exports: [TrackerService],
})
export class TrackerModule {}
