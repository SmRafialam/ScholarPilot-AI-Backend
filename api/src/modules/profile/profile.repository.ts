import { Injectable } from '@nestjs/common';
import { Prisma, StudentProfile, TestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Data-access for StudentProfile and its child collections.
 * Every child mutation is scoped by profileId so a user can only ever
 * touch their own records (ownership enforced at the query level).
 */
@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Full profile with all relations, keyed by the owning user. */
  getByUserId(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        educations: true,
        experiences: true,
        researches: true,
        projects: true,
        skills: true,
        languages: true,
        publications: true,
        testScores: true,
      },
    });
  }

  updateCore(
    profileId: string,
    data: Prisma.StudentProfileUpdateInput,
  ): Promise<StudentProfile> {
    return this.prisma.studentProfile.update({ where: { id: profileId }, data });
  }

  setCompletion(profileId: string, completionPercent: number) {
    return this.prisma.studentProfile.update({
      where: { id: profileId },
      data: { completionPercent },
    });
  }

  // ------------------------- Education -------------------------
  createEducation(profileId: string, data: Prisma.EducationCreateWithoutProfileInput) {
    return this.prisma.education.create({ data: { ...data, profileId } });
  }
  updateEducation(profileId: string, id: string, data: Prisma.EducationUpdateInput) {
    return this.prisma.education.updateMany({ where: { id, profileId }, data });
  }
  deleteEducation(profileId: string, id: string) {
    return this.prisma.education.deleteMany({ where: { id, profileId } });
  }

  // ------------------------- Experience -------------------------
  createExperience(profileId: string, data: Prisma.ExperienceCreateWithoutProfileInput) {
    return this.prisma.experience.create({ data: { ...data, profileId } });
  }
  updateExperience(profileId: string, id: string, data: Prisma.ExperienceUpdateInput) {
    return this.prisma.experience.updateMany({ where: { id, profileId }, data });
  }
  deleteExperience(profileId: string, id: string) {
    return this.prisma.experience.deleteMany({ where: { id, profileId } });
  }

  // ------------------------- Research -------------------------
  createResearch(profileId: string, data: Prisma.ResearchCreateWithoutProfileInput) {
    return this.prisma.research.create({ data: { ...data, profileId } });
  }
  updateResearch(profileId: string, id: string, data: Prisma.ResearchUpdateInput) {
    return this.prisma.research.updateMany({ where: { id, profileId }, data });
  }
  deleteResearch(profileId: string, id: string) {
    return this.prisma.research.deleteMany({ where: { id, profileId } });
  }

  // ------------------------- Project -------------------------
  createProject(profileId: string, data: Prisma.ProjectCreateWithoutProfileInput) {
    return this.prisma.project.create({ data: { ...data, profileId } });
  }
  updateProject(profileId: string, id: string, data: Prisma.ProjectUpdateInput) {
    return this.prisma.project.updateMany({ where: { id, profileId }, data });
  }
  deleteProject(profileId: string, id: string) {
    return this.prisma.project.deleteMany({ where: { id, profileId } });
  }

  // ------------------------- Skill -------------------------
  createSkill(profileId: string, data: Prisma.SkillCreateWithoutProfileInput) {
    return this.prisma.skill.create({ data: { ...data, profileId } });
  }
  updateSkill(profileId: string, id: string, data: Prisma.SkillUpdateInput) {
    return this.prisma.skill.updateMany({ where: { id, profileId }, data });
  }
  deleteSkill(profileId: string, id: string) {
    return this.prisma.skill.deleteMany({ where: { id, profileId } });
  }

  // ------------------------- Language -------------------------
  createLanguage(profileId: string, data: Prisma.LanguageCreateWithoutProfileInput) {
    return this.prisma.language.create({ data: { ...data, profileId } });
  }
  updateLanguage(profileId: string, id: string, data: Prisma.LanguageUpdateInput) {
    return this.prisma.language.updateMany({ where: { id, profileId }, data });
  }
  deleteLanguage(profileId: string, id: string) {
    return this.prisma.language.deleteMany({ where: { id, profileId } });
  }

  // ------------------------- Publication -------------------------
  createPublication(profileId: string, data: Prisma.PublicationCreateWithoutProfileInput) {
    return this.prisma.publication.create({ data: { ...data, profileId } });
  }
  updatePublication(profileId: string, id: string, data: Prisma.PublicationUpdateInput) {
    return this.prisma.publication.updateMany({ where: { id, profileId }, data });
  }
  deletePublication(profileId: string, id: string) {
    return this.prisma.publication.deleteMany({ where: { id, profileId } });
  }

  // ------------------------- Test score (one per type) -------------------------
  upsertTestScore(profileId: string, type: TestType, score: number, takenAt?: Date) {
    return this.prisma.testScore.upsert({
      where: { profileId_type: { profileId, type } },
      create: { profileId, type, score, takenAt },
      update: { score, takenAt },
    });
  }
  deleteTestScore(profileId: string, id: string) {
    return this.prisma.testScore.deleteMany({ where: { id, profileId } });
  }
}
