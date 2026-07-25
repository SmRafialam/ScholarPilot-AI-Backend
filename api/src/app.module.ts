import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { AiModule } from './modules/ai/ai.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { ProfileModule } from './modules/profile/profile.module';
import { QueueModule } from './modules/queue/queue.module';
import { ScholarshipModule } from './modules/scholarship/scholarship.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { UniversityModule } from './modules/university/university.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Global env config — validated, no hardcoded values anywhere else.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Global rate limiting (100 req / 60s per IP by default).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Background jobs (BullMQ/Redis) + cron scheduling.
    ScheduleModule.forRoot(),
    QueueModule,

    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    UniversityModule,
    ScholarshipModule,
    ProfessorModule,
    ScraperModule,
    AiModule,
    MatchingModule,
    // Feature modules land here module-by-module:
    // AiAssistantModule, DocumentModule, EmailModule, ...
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: authenticate (JWT) → authorize (roles) → rate-limit.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
