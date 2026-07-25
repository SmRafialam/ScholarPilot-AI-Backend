import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Application, ApplicationStage, NotificationType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { TrackerRepository } from './tracker.repository';

const STAGES: ApplicationStage[] = [
  'INTERESTED', 'PLANNING', 'DOCUMENTS_PENDING', 'APPLIED',
  'WAITING', 'INTERVIEW', 'OFFER', 'REJECTED', 'ACCEPTED',
];

export interface AppView extends Application {
  targetName: string | null;
  targetType: 'university' | 'scholarship' | 'professor' | null;
}

@Injectable()
export class TrackerService {
  constructor(
    private readonly repo: TrackerRepository,
    private readonly notifications: NotificationService,
  ) {}

  async create(userId: string, dto: CreateApplicationDto) {
    if (!dto.universityId && !dto.scholarshipId && !dto.professorId) {
      throw new BadRequestException(
        'Provide at least one of universityId, scholarshipId or professorId',
      );
    }
    return this.repo.create(userId, {
      universityId: dto.universityId ?? null,
      programId: dto.programId ?? null,
      scholarshipId: dto.scholarshipId ?? null,
      professorId: dto.professorId ?? null,
      stage: dto.stage ?? ApplicationStage.INTERESTED,
      notes: dto.notes ?? null,
      deadline: dto.deadline ?? null,
    });
  }

  /** Kanban board: applications grouped by stage, with resolved target names. */
  async board(userId: string) {
    const apps = await this.repo.listByUser(userId);
    const views = await this.attachNames(apps);

    const columns: Record<string, AppView[]> = {};
    for (const stage of STAGES) columns[stage] = [];
    for (const v of views) columns[v.stage].push(v);

    return { stages: STAGES, columns, total: apps.length };
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    const existing = await this.repo.findOwned(userId, id);
    if (!existing) throw new NotFoundException('Application not found');
    const updated = await this.repo.update(id, dto);

    if (dto.stage && dto.stage !== existing.stage) {
      await this.notifications.emit(
        userId,
        NotificationType.STATUS,
        'Application updated',
        `An application moved to ${dto.stage.replace(/_/g, ' ')}.`,
        { applicationId: id, stage: dto.stage },
      );
    }
    return updated;
  }

  async remove(userId: string, id: string) {
    const res = await this.repo.delete(userId, id);
    if (res.count === 0) throw new NotFoundException('Application not found');
    return { success: true };
  }

  // --------------------------- internals ---------------------------

  private async attachNames(apps: Application[]): Promise<AppView[]> {
    const [uniMap, schMap, profMap] = await Promise.all([
      this.repo.nameMap('university', ids(apps, 'universityId')),
      this.repo.nameMap('scholarship', ids(apps, 'scholarshipId')),
      this.repo.nameMap('professor', ids(apps, 'professorId')),
    ]);

    return apps.map((a) => {
      let targetName: string | null = null;
      let targetType: AppView['targetType'] = null;
      if (a.universityId && uniMap.has(a.universityId)) {
        targetName = uniMap.get(a.universityId)!;
        targetType = 'university';
      } else if (a.scholarshipId && schMap.has(a.scholarshipId)) {
        targetName = schMap.get(a.scholarshipId)!;
        targetType = 'scholarship';
      } else if (a.professorId && profMap.has(a.professorId)) {
        targetName = profMap.get(a.professorId)!;
        targetType = 'professor';
      }
      return { ...a, targetName, targetType };
    });
  }
}

function ids(apps: Application[], key: keyof Application): string[] {
  return [...new Set(apps.map((a) => a[key]).filter((x): x is string => !!x))];
}
