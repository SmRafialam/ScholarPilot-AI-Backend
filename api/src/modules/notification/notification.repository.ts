import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryNotificationsDto } from './dto/notification.dto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    data?: Prisma.InputJsonValue,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, title, body: body ?? null, data: data ?? undefined },
    });
  }

  async list(userId: string, query: QueryNotificationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.unread ? { read: false } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  delete(userId: string, id: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }
}
