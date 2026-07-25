import { Injectable } from '@nestjs/common';
import { RefreshToken, TokenType, VerificationToken } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Data-access for auth tokens (refresh + verification/reset). */
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Refresh tokens ----

  createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({ where: { tokenHash } });
  }

  revokeRefreshToken(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ---- Verification / reset tokens ----

  createVerificationToken(
    userId: string,
    tokenHash: string,
    type: TokenType,
    expiresAt: Date,
  ): Promise<VerificationToken> {
    return this.prisma.verificationToken.create({
      data: { userId, tokenHash, type, expiresAt },
    });
  }

  findValidVerificationToken(
    tokenHash: string,
    type: TokenType,
  ): Promise<VerificationToken | null> {
    return this.prisma.verificationToken.findFirst({
      where: { tokenHash, type, usedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  markVerificationTokenUsed(id: string): Promise<VerificationToken> {
    return this.prisma.verificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
