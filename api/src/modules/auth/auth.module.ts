import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Secrets are passed per-sign call in AuthService, so register empty.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
