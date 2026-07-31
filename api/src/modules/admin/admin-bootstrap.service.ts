import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * On startup, ensures a SUPER_ADMIN account exists when ADMIN_EMAIL and
 * ADMIN_PASSWORD are configured. Idempotent: creates the account on first run,
 * and on later boots just guarantees the SUPER_ADMIN role + active status.
 * Set ADMIN_RESET_PASSWORD=true to also reset the password from the env value.
 */
@Injectable()
export class AdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    try {
      const existing = await this.prisma.user.findUnique({ where: { email } });

      if (!existing) {
        const passwordHash = await bcrypt.hash(password, 12);
        await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            role: Role.SUPER_ADMIN,
            emailVerified: true,
            isActive: true,
            profile: { create: { fullName: 'Administrator' } },
          },
        });
        this.logger.log(`Created SUPER_ADMIN account: ${email}`);
        return;
      }

      const data: {
        role: Role;
        isActive: boolean;
        emailVerified: boolean;
        passwordHash?: string;
      } = { role: Role.SUPER_ADMIN, isActive: true, emailVerified: true };

      if (process.env.ADMIN_RESET_PASSWORD === 'true') {
        data.passwordHash = await bcrypt.hash(password, 12);
      }

      await this.prisma.user.update({ where: { email }, data });
      this.logger.log(`Ensured SUPER_ADMIN role for existing account: ${email}`);
    } catch (err) {
      this.logger.error(`Admin bootstrap failed: ${String(err)}`);
    }
  }
}
