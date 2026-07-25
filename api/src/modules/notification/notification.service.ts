import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { NotificationRepository } from './notification.repository';
import { QueryNotificationsDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  /** Emit a notification — called by other modules (matching, tracker, …). */
  emit(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    data?: Prisma.InputJsonValue,
  ) {
    return this.repo.create(userId, type, title, body, data);
  }

  list(userId: string, query: QueryNotificationsDto) {
    return this.repo.list(userId, query);
  }

  unreadCount(userId: string) {
    return this.repo.unreadCount(userId).then((count) => ({ count }));
  }

  async markRead(userId: string, id: string) {
    const res = await this.repo.markRead(userId, id);
    if (res.count === 0) throw new NotFoundException('Notification not found');
    return { success: true };
  }

  async markAllRead(userId: string) {
    const res = await this.repo.markAllRead(userId);
    return { updated: res.count };
  }

  async remove(userId: string, id: string) {
    const res = await this.repo.delete(userId, id);
    if (res.count === 0) throw new NotFoundException('Notification not found');
    return { success: true };
  }
}
