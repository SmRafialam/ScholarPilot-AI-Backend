import { Injectable } from '@nestjs/common';
import { EmailType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailRepository {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { userId },
      include: { skills: true, publications: true, testScores: true },
    });
  }

  findProfessor(id: string) {
    return this.prisma.professor.findUnique({
      where: { id },
      include: { university: true, researchAreas: true },
    });
  }

  create(data: Prisma.GeneratedEmailUncheckedCreateInput) {
    return this.prisma.generatedEmail.create({ data });
  }
  list(userId: string, type?: EmailType) {
    return this.prisma.generatedEmail.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, type: true, subject: true, status: true, version: true, updatedAt: true },
    });
  }
  findOwned(userId: string, id: string) {
    return this.prisma.generatedEmail.findFirst({ where: { id, userId } });
  }
  update(id: string, data: Prisma.GeneratedEmailUpdateInput) {
    return this.prisma.generatedEmail.update({ where: { id }, data });
  }
  delete(userId: string, id: string) {
    return this.prisma.generatedEmail.deleteMany({ where: { id, userId } });
  }
}
