import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { TrackerService } from './tracker.service';

@Controller('applications')
export class TrackerController {
  constructor(private readonly service: TrackerService) {}

  /** Kanban board grouped by stage. */
  @Get()
  board(@CurrentUser() u: AuthUser) {
    return this.service.board(u.id);
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.service.create(u.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.service.update(u.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.remove(u.id, id);
  }
}
