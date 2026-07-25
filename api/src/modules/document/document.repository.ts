import { Injectable } from '@nestjs/common';
import { DocumentType, MatchTargetType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        testScores: true,
        skills: true,
        educations: true,
        publications: true,
        experiences: true,
        projects: true,
      },
    });
  }

  /** Resolve a display name for an optional target (university / program). */
  async resolveTargetName(type: MatchTargetType, id: string): Promise<string | null> {
    if (type === MatchTargetType.UNIVERSITY) {
      const u = await this.prisma.university.findUnique({ where: { id } });
      return u?.name ?? null;
    }
    if (type === MatchTargetType.PROGRAM) {
      const p = await this.prisma.program.findUnique({ where: { id } });
      return p?.name ?? null;
    }
    if (type === MatchTargetType.SCHOLARSHIP) {
      const s = await this.prisma.scholarship.findUnique({ where: { id } });
      return s?.name ?? null;
    }
    return null;
  }

  create(data: Prisma.GeneratedDocumentUncheckedCreateInput) {
    return this.prisma.generatedDocument.create({ data });
  }
  list(userId: string, type?: DocumentType) {
    return this.prisma.generatedDocument.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, type: true, title: true, status: true, version: true, updatedAt: true },
    });
  }
  findOwned(userId: string, id: string) {
    return this.prisma.generatedDocument.findFirst({ where: { id, userId } });
  }
  update(id: string, data: Prisma.GeneratedDocumentUpdateInput) {
    return this.prisma.generatedDocument.update({ where: { id }, data });
  }
  delete(userId: string, id: string) {
    return this.prisma.generatedDocument.deleteMany({ where: { id, userId } });
  }
}
