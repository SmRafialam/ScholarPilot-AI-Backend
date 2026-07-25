import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  CreateEducationDto,
  CreateExperienceDto,
  CreateLanguageDto,
  CreateProjectDto,
  CreatePublicationDto,
  CreateResearchDto,
  CreateSkillDto,
  UpdateEducationDto,
  UpdateExperienceDto,
  UpdateLanguageDto,
  UpdateProjectDto,
  UpdatePublicationDto,
  UpdateResearchDto,
  UpdateSkillDto,
  UpsertTestScoreDto,
} from './dto/sub-items.dto';

type FullProfile = NonNullable<
  Awaited<ReturnType<ProfileRepository['getByUserId']>>
>;

@Injectable()
export class ProfileService {
  constructor(private readonly repo: ProfileRepository) {}

  // ============================ Core ============================

  async getMyProfile(userId: string): Promise<FullProfile> {
    const profile = await this.repo.getByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateCore(userId: string, dto: UpdateProfileDto): Promise<FullProfile> {
    const { id } = await this.getMyProfile(userId);
    await this.repo.updateCore(id, dto as Prisma.StudentProfileUpdateInput);
    return this.refreshCompletion(userId, id);
  }

  // ============================ Education ============================
  async addEducation(userId: string, dto: CreateEducationDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.createEducation(id, dto);
    return this.refreshCompletion(userId, id);
  }
  async updateEducation(userId: string, itemId: string, dto: UpdateEducationDto) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.updateEducation(id, itemId, dto), 'Education');
    return this.refreshCompletion(userId, id);
  }
  async removeEducation(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deleteEducation(id, itemId), 'Education');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Experience ============================
  async addExperience(userId: string, dto: CreateExperienceDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.createExperience(id, dto);
    return this.refreshCompletion(userId, id);
  }
  async updateExperience(userId: string, itemId: string, dto: UpdateExperienceDto) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.updateExperience(id, itemId, dto), 'Experience');
    return this.refreshCompletion(userId, id);
  }
  async removeExperience(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deleteExperience(id, itemId), 'Experience');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Research ============================
  async addResearch(userId: string, dto: CreateResearchDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.createResearch(id, dto);
    return this.refreshCompletion(userId, id);
  }
  async updateResearch(userId: string, itemId: string, dto: UpdateResearchDto) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.updateResearch(id, itemId, dto), 'Research');
    return this.refreshCompletion(userId, id);
  }
  async removeResearch(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deleteResearch(id, itemId), 'Research');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Project ============================
  async addProject(userId: string, dto: CreateProjectDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.createProject(id, dto);
    return this.refreshCompletion(userId, id);
  }
  async updateProject(userId: string, itemId: string, dto: UpdateProjectDto) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.updateProject(id, itemId, dto), 'Project');
    return this.refreshCompletion(userId, id);
  }
  async removeProject(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deleteProject(id, itemId), 'Project');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Skill ============================
  async addSkill(userId: string, dto: CreateSkillDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.createSkill(id, dto);
    return this.refreshCompletion(userId, id);
  }
  async updateSkill(userId: string, itemId: string, dto: UpdateSkillDto) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.updateSkill(id, itemId, dto), 'Skill');
    return this.refreshCompletion(userId, id);
  }
  async removeSkill(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deleteSkill(id, itemId), 'Skill');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Language ============================
  async addLanguage(userId: string, dto: CreateLanguageDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.createLanguage(id, dto);
    return this.refreshCompletion(userId, id);
  }
  async updateLanguage(userId: string, itemId: string, dto: UpdateLanguageDto) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.updateLanguage(id, itemId, dto), 'Language');
    return this.refreshCompletion(userId, id);
  }
  async removeLanguage(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deleteLanguage(id, itemId), 'Language');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Publication ============================
  async addPublication(userId: string, dto: CreatePublicationDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.createPublication(id, dto);
    return this.refreshCompletion(userId, id);
  }
  async updatePublication(userId: string, itemId: string, dto: UpdatePublicationDto) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.updatePublication(id, itemId, dto), 'Publication');
    return this.refreshCompletion(userId, id);
  }
  async removePublication(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deletePublication(id, itemId), 'Publication');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Test scores ============================
  async upsertTestScore(userId: string, dto: UpsertTestScoreDto) {
    const { id } = await this.getMyProfile(userId);
    await this.repo.upsertTestScore(id, dto.type, dto.score, dto.takenAt);
    return this.refreshCompletion(userId, id);
  }
  async removeTestScore(userId: string, itemId: string) {
    const { id } = await this.getMyProfile(userId);
    this.assertFound(await this.repo.deleteTestScore(id, itemId), 'Test score');
    return this.refreshCompletion(userId, id);
  }

  // ============================ Helpers ============================

  /** Re-fetches the profile, recomputes completion %, persists if changed. */
  private async refreshCompletion(
    userId: string,
    profileId: string,
  ): Promise<FullProfile> {
    const profile = await this.getMyProfile(userId);
    const percent = this.computeCompletion(profile);
    if (percent !== profile.completionPercent) {
      await this.repo.setCompletion(profileId, percent);
      profile.completionPercent = percent;
    }
    return profile;
  }

  private assertFound(result: { count: number }, entity: string): void {
    if (result.count === 0) throw new NotFoundException(`${entity} not found`);
  }

  /** Weighted checklist → 0-100 profile completeness. */
  private computeCompletion(p: FullProfile): number {
    const checks: boolean[] = [
      !!p.fullName,
      !!p.countryId,
      !!p.currentUniversity,
      !!p.department,
      p.cgpa != null,
      !!p.researchInterest,
      p.budgetUsd != null,
      !!p.preferredIntake,
      p.targetCountries.length > 0,
      p.educations.length > 0,
      p.skills.length > 0,
      p.testScores.length > 0,
      p.experiences.length > 0,
      p.projects.length > 0,
      p.publications.length > 0,
    ];
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
  }
}
