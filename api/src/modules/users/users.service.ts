import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

/** Public sanitized shape of a user (never leaks passwordHash). */
export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async getById(id: string): Promise<User> {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Strips sensitive fields before returning a user to a client. */
  toSafe(user: User): SafeUser {
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }
}
