import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlanTier, Role } from '@prisma/client';
import { AdminRepository } from './admin.repository';
import { QueryUsersDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  listUsers(query: QueryUsersDto) {
    return this.repo.listUsers(query);
  }

  async getUser(id: string) {
    const user = await this.repo.findUser(id);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }

  async changeRole(actingUserId: string, targetId: string, role: Role) {
    if (actingUserId === targetId) {
      throw new BadRequestException('You cannot change your own role');
    }
    await this.getUser(targetId);
    const updated = await this.repo.updateRole(targetId, role);
    const { passwordHash: _omit, ...safe } = updated;
    return safe;
  }

  async setStatus(actingUserId: string, targetId: string, isActive: boolean) {
    if (actingUserId === targetId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }
    await this.getUser(targetId);
    const updated = await this.repo.updateStatus(targetId, isActive);
    const { passwordHash: _omit, ...safe } = updated;
    return safe;
  }

  async changePlan(targetId: string, tier: PlanTier) {
    await this.getUser(targetId);
    return this.repo.updatePlan(targetId, tier);
  }

  analytics() {
    return this.repo.analytics();
  }
}
