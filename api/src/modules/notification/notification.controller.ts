import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { QueryNotificationsDto } from './dto/notification.dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query() query: QueryNotificationsDto) {
    return this.service.list(u.id, query);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() u: AuthUser) {
    return this.service.unreadCount(u.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() u: AuthUser) {
    return this.service.markAllRead(u.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.markRead(u.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.remove(u.id, id);
  }
}
