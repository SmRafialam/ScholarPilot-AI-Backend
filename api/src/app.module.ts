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
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { BillingModule } from './modules/billing/billing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DocumentModule } from './modules/document/document.module';
import { EmailModule } from './modules/email/email.module';
import { MatchingModule } from './modules/matching/matching.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TrackerModule } from './modules/tracker/tracker.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { ProfileModule } from './modules/profile/profile.module';
import { QueueModule } from './modules/queue/queue.module';
import { ScholarshipModule } from './modules/scholarship/scholarship.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { UniversityModule } from './modules/university/university.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Redis-backed background workers (scraper queue + cron). Disable on free hosts
 * that don't provide Redis by setting DISABLE_WORKERS=true — the rest of the API
 * (auth, profile, matching, AI, documents, …) runs fully without them.
 */
const WORKERS_ENABLED = process.env.DISABLE_WORKERS !== 'true';

@Module({
  imports: [
    // Global env config — validated, no hardcoded values anywhere else.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Global rate limiting (100 req / 60s per IP by default).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Background jobs (BullMQ/Redis) + cron scheduling — only when workers on.
    ScheduleModule.forRoot(),
    ...(WORKERS_ENABLED ? [QueueModule] : []),

    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    UniversityModule,
    ScholarshipModule,
    ProfessorModule,
    ...(WORKERS_ENABLED ? [ScraperModule] : []),
    AiModule,
    MatchingModule,
    AssistantModule,
    DocumentModule,
    EmailModule,
    TrackerModule,
    DashboardModule,
    AdminModule,
    NotificationModule,
    BillingModule,
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
