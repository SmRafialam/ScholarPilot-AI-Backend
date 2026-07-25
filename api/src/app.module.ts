import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Global env config — validated, no hardcoded values anywhere else.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    // Feature modules land here module-by-module:
    // AuthModule, ProfileModule, UniversityModule, ScholarshipModule,
    // ProfessorModule, ScrapingModule, MatchingModule, AiModule, ...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
