import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AnalysisData {
  profileStrength: number;
  admissionChances: unknown;
  fundingChances: unknown;
  strengths: string[];
  weaknesses: string[];
  roadmap: unknown;
  estimatedBudget?: unknown;
  timeline?: unknown;
}

@Injectable()
export class AssistantRepository {
  constructor(private readonly prisma: PrismaService) {}

  getFullProfile(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        country: true,
        testScores: true,
        skills: true,
        publications: true,
        experiences: true,
        educations: true,
      },
    });
  }

  saveAnalysis(userId: string, data: AnalysisData) {
    return this.prisma.profileAnalysis.create({
      data: {
        userId,
        profileStrength: data.profileStrength,
        admissionChances: data.admissionChances as Prisma.InputJsonValue,
        fundingChances: data.fundingChances as Prisma.InputJsonValue,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        roadmap: data.roadmap as Prisma.InputJsonValue,
        estimatedBudget: (data.estimatedBudget ?? {}) as Prisma.InputJsonValue,
        timeline: (data.timeline ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  getLatest(userId: string) {
    return this.prisma.profileAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
