import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Global env config — validated, no hardcoded values anywhere else.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Global rate limiting (100 req / 60s per IP by default).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    // Feature modules land here module-by-module:
    // ProfileModule, UniversityModule, ScholarshipModule, ProfessorModule,
    // ScrapingModule, MatchingModule, AiModule, ...
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
