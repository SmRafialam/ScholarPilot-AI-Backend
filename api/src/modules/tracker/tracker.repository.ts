import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrackerRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: Omit<Prisma.ApplicationUncheckedCreateInput, 'userId'>) {
    return this.prisma.application.create({ data: { ...data, userId } });
  }

  listByUser(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      orderBy: [{ stage: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  findOwned(userId: string, id: string) {
    return this.prisma.application.findFirst({ where: { id, userId } });
  }

  update(id: string, data: Prisma.ApplicationUpdateInput) {
    return this.prisma.application.update({ where: { id }, data });
  }

  delete(userId: string, id: string) {
    return this.prisma.application.deleteMany({ where: { id, userId } });
  }

  // ---- Name resolution for display ----
  async nameMap(
    model: 'university' | 'scholarship' | 'professor',
    ids: string[],
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (ids.length === 0) return map;
    const rows = await (this.prisma[model] as any).findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    for (const r of rows as { id: string; name: string }[]) map.set(r.id, r.name);
    return map;
  }
}
