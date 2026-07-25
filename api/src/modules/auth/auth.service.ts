import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenType, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { SafeUser, UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { AuthRepository } from './auth.repository';
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignupDto,
} from './dto/auth.dto';
import { AuthTokens, GoogleUser, JwtPayload } from './types/auth.types';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly users: UsersService,
    private readonly authRepo: AuthRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  // ============================ Public flows ==============================

  async signup(dto: SignupDto): Promise<{ user: SafeUser } & AuthTokens> {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersRepo.create({
      email: dto.email,
      passwordHash,
      profile: { create: { fullName: dto.fullName } },
    });

    await this.sendVerificationEmail(user);
    const tokens = await this.issueTokens(user);
    return { user: this.users.toSafe(user), ...tokens };
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser } & AuthTokens> {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account disabled');

    const tokens = await this.issueTokens(user);
    return { user: this.users.toSafe(user), ...tokens };
  }

  /** Rotating refresh: the presented token is revoked and a fresh pair issued. */
  async refresh(rawToken: string): Promise<AuthTokens> {
    const record = await this.authRepo.findRefreshTokenByHash(
      this.sha256(rawToken),
    );
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.authRepo.revokeRefreshToken(record.id);

    const user = await this.usersRepo.findById(record.userId);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  async logout(rawToken: string): Promise<{ success: true }> {
    const record = await this.authRepo.findRefreshTokenByHash(
      this.sha256(rawToken),
    );
    if (record && !record.revokedAt) {
      await this.authRepo.revokeRefreshToken(record.id);
    }
    return { success: true };
  }

  async verifyEmail(rawToken: string): Promise<{ success: true }> {
    const vt = await this.authRepo.findValidVerificationToken(
      this.sha256(rawToken),
      TokenType.EMAIL_VERIFICATION,
    );
    if (!vt) throw new BadRequestException('Invalid or expired token');

    await this.authRepo.markVerificationTokenUsed(vt.id);
    await this.usersRepo.update(vt.userId, { emailVerified: true });
    return { success: true };
  }

  /** Always returns success to avoid leaking which emails are registered. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (user) {
      const raw = randomBytes(32).toString('hex');
      await this.authRepo.createVerificationToken(
        user.id,
        this.sha256(raw),
        TokenType.PASSWORD_RESET,
        new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      );
      const link = `${this.config.get('FRONTEND_URL')}/reset-password?token=${raw}`;
      await this.mail.sendPasswordReset(user.email, link);
    }
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: true }> {
    const vt = await this.authRepo.findValidVerificationToken(
      this.sha256(dto.token),
      TokenType.PASSWORD_RESET,
    );
    if (!vt) throw new BadRequestException('Invalid or expired token');

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.usersRepo.update(vt.userId, { passwordHash });
    await this.authRepo.markVerificationTokenUsed(vt.id);
    await this.authRepo.revokeAllUserRefreshTokens(vt.userId); // force re-login
    return { success: true };
  }

  async googleLogin(googleUser: GoogleUser): Promise<AuthTokens> {
    let user = await this.usersRepo.findByGoogleId(googleUser.googleId);

    if (!user) {
      const byEmail = await this.usersRepo.findByEmail(googleUser.email);
      user = byEmail
        ? await this.usersRepo.update(byEmail.id, {
            googleId: googleUser.googleId,
            emailVerified: true,
          })
        : await this.usersRepo.create({
            email: googleUser.email,
            googleId: googleUser.googleId,
            emailVerified: true,
            profile: { create: { fullName: googleUser.fullName } },
          });
    }
    return this.issueTokens(user);
  }

  // ============================ Helpers ==================================

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const signOptions = {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    } as JwtSignOptions;
    const accessToken = await this.jwt.signAsync(payload, signOptions);

    // Opaque, high-entropy refresh token; only its hash is stored.
    const refreshToken = randomBytes(48).toString('hex');
    const ttlMs = this.parseDuration(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    );
    await this.authRepo.createRefreshToken(
      user.id,
      this.sha256(refreshToken),
      new Date(Date.now() + ttlMs),
    );

    return { accessToken, refreshToken };
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const raw = randomBytes(32).toString('hex');
    await this.authRepo.createVerificationToken(
      user.id,
      this.sha256(raw),
      TokenType.EMAIL_VERIFICATION,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    );
    const link = `${this.config.get('FRONTEND_URL')}/verify-email?token=${raw}`;
    await this.mail.sendEmailVerification(user.email, link);
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  /** Parse durations like "15m", "7d", "12h", "30s" into milliseconds. */
  private parseDuration(input: string): number {
    const match = /^(\d+)([smhd])$/.exec(input.trim());
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }
}
