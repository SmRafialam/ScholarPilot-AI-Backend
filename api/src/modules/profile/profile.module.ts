import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, CvService],
  exports: [ProfileService],
})
export class ProfileModule {}
