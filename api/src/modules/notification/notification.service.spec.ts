import { NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';

describe('NotificationService', () => {
  let service: NotificationService;
  let repo: jest.Mocked<Partial<NotificationRepository>>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      markRead: jest.fn(),
      unreadCount: jest.fn(),
    };
    service = new NotificationService(repo as unknown as NotificationRepository);
  });

  it('emit delegates to the repository', async () => {
    (repo.create as jest.Mock).mockResolvedValue({ id: 'n1' });
    await service.emit('u1', NotificationType.MATCH, 'Title', 'Body');
    expect(repo.create).toHaveBeenCalledWith('u1', NotificationType.MATCH, 'Title', 'Body', undefined);
  });

  it('markRead throws NotFound when nothing was updated', async () => {
    (repo.markRead as jest.Mock).mockResolvedValue({ count: 0 });
    await expect(service.markRead('u1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('markRead succeeds when a row is updated', async () => {
    (repo.markRead as jest.Mock).mockResolvedValue({ count: 1 });
    await expect(service.markRead('u1', 'n1')).resolves.toEqual({ success: true });
  });

  it('unreadCount wraps the number in an object', async () => {
    (repo.unreadCount as jest.Mock).mockResolvedValue(3);
    await expect(service.unreadCount('u1')).resolves.toEqual({ count: 3 });
  });
});
