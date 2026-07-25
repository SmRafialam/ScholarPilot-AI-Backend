import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { TrackerRepository } from './tracker.repository';
import { NotificationService } from '../notification/notification.service';

describe('TrackerService', () => {
  let service: TrackerService;
  let repo: jest.Mocked<Partial<TrackerRepository>>;
  let notifications: jest.Mocked<Partial<NotificationService>>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findOwned: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    notifications = { emit: jest.fn() };
    service = new TrackerService(
      repo as unknown as TrackerRepository,
      notifications as unknown as NotificationService,
    );
  });

  it('rejects creating an application with no target', async () => {
    await expect(service.create('u1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates an application when a target is provided', async () => {
    (repo.create as jest.Mock).mockResolvedValue({ id: 'a1' });
    await service.create('u1', { universityId: 'uni1' });
    expect(repo.create).toHaveBeenCalled();
  });

  it('update throws NotFound for an application the user does not own', async () => {
    (repo.findOwned as jest.Mock).mockResolvedValue(null);
    await expect(service.update('u1', 'a1', { stage: 'APPLIED' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('emits a STATUS notification when the stage changes', async () => {
    (repo.findOwned as jest.Mock).mockResolvedValue({ id: 'a1', stage: 'PLANNING' });
    (repo.update as jest.Mock).mockResolvedValue({ id: 'a1', stage: 'APPLIED' });
    await service.update('u1', 'a1', { stage: 'APPLIED' });
    expect(notifications.emit).toHaveBeenCalled();
  });

  it('does NOT notify when the stage is unchanged', async () => {
    (repo.findOwned as jest.Mock).mockResolvedValue({ id: 'a1', stage: 'APPLIED' });
    (repo.update as jest.Mock).mockResolvedValue({ id: 'a1', stage: 'APPLIED' });
    await service.update('u1', 'a1', { notes: 'hi' });
    expect(notifications.emit).not.toHaveBeenCalled();
  });
});
