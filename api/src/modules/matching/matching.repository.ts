import { Injectable } from '@nestjs/common';
import { MatchTargetType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MatchingRepository {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        testScores: true,
        skills: true,
        publications: true,
        experiences: true,
      },
    });
  }

  listUniversities() {
    return this.prisma.university.findMany({
      include: {
        country: true,
        departments: { include: { programs: true } },
      },
    });
  }

  listScholarships() {
    return this.prisma.scholarship.findMany({
      include: { country: true, eligibility: true },
    });
  }

  listProfessors() {
    return this.prisma.professor.findMany({
      include: { university: true, researchAreas: true },
    });
  }

  saveMatch(
    userId: string,
    targetType: MatchTargetType,
    targetId: string,
    score: number,
    breakdown: Prisma.InputJsonValue,
    reasoning?: string,
  ) {
    return this.prisma.matchResult.upsert({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
      create: { userId, targetType, targetId, score, breakdown, reasoning },
      update: { score, breakdown, reasoning },
    });
  }

  getResults(userId: string) {
    return this.prisma.matchResult.findMany({
      where: { userId },
      orderBy: [{ targetType: 'asc' }, { score: 'desc' }],
    });
  }
}
