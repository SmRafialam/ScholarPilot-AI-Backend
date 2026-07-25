import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { QueryUsersDto, UpdateRoleDto, UpdateStatusDto } from './dto/admin.dto';

@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('users')
  listUsers(@Query() query: QueryUsersDto) {
    return this.service.listUsers(query);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.service.getUser(id);
  }

  @Patch('users/:id/role')
  changeRole(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.changeRole(u.id, id, dto.role);
  }

  @Patch('users/:id/status')
  setStatus(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.setStatus(u.id, id, dto.isActive);
  }

  @Get('analytics')
  analytics() {
    return this.service.analytics();
  }
}
