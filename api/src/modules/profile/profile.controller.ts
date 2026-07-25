import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CvService } from './cv.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** Minimal shape of the multer file (avoids a hard dependency on @types/multer). */
interface UploadedPdf {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}
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
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profile: ProfileService,
    private readonly cv: CvService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.profile.getMyProfile(user.id);
  }

  /** Upload a CV (PDF) — AI extracts education, experience, publications & skills. */
  @Post('cv')
  @UseInterceptors(FileInterceptor('file'))
  importCv(@CurrentUser() user: AuthUser, @UploadedFile() file: UploadedPdf) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Please upload a PDF file');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large (max 5MB)');
    }
    return this.cv.importFromPdf(user.id, file.buffer);
  }

  @Patch()
  updateCore(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.profile.updateCore(user.id, dto);
  }

  // -------- Education --------
  @Post('educations')
  addEducation(@CurrentUser() u: AuthUser, @Body() dto: CreateEducationDto) {
    return this.profile.addEducation(u.id, dto);
  }
  @Patch('educations/:id')
  updateEducation(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateEducationDto) {
    return this.profile.updateEducation(u.id, id, dto);
  }
  @Delete('educations/:id')
  removeEducation(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removeEducation(u.id, id);
  }

  // -------- Experience --------
  @Post('experiences')
  addExperience(@CurrentUser() u: AuthUser, @Body() dto: CreateExperienceDto) {
    return this.profile.addExperience(u.id, dto);
  }
  @Patch('experiences/:id')
  updateExperience(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return this.profile.updateExperience(u.id, id, dto);
  }
  @Delete('experiences/:id')
  removeExperience(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removeExperience(u.id, id);
  }

  // -------- Research --------
  @Post('researches')
  addResearch(@CurrentUser() u: AuthUser, @Body() dto: CreateResearchDto) {
    return this.profile.addResearch(u.id, dto);
  }
  @Patch('researches/:id')
  updateResearch(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateResearchDto) {
    return this.profile.updateResearch(u.id, id, dto);
  }
  @Delete('researches/:id')
  removeResearch(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removeResearch(u.id, id);
  }

  // -------- Project --------
  @Post('projects')
  addProject(@CurrentUser() u: AuthUser, @Body() dto: CreateProjectDto) {
    return this.profile.addProject(u.id, dto);
  }
  @Patch('projects/:id')
  updateProject(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.profile.updateProject(u.id, id, dto);
  }
  @Delete('projects/:id')
  removeProject(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removeProject(u.id, id);
  }

  // -------- Skill --------
  @Post('skills')
  addSkill(@CurrentUser() u: AuthUser, @Body() dto: CreateSkillDto) {
    return this.profile.addSkill(u.id, dto);
  }
  @Patch('skills/:id')
  updateSkill(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateSkillDto) {
    return this.profile.updateSkill(u.id, id, dto);
  }
  @Delete('skills/:id')
  removeSkill(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removeSkill(u.id, id);
  }

  // -------- Language --------
  @Post('languages')
  addLanguage(@CurrentUser() u: AuthUser, @Body() dto: CreateLanguageDto) {
    return this.profile.addLanguage(u.id, dto);
  }
  @Patch('languages/:id')
  updateLanguage(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.profile.updateLanguage(u.id, id, dto);
  }
  @Delete('languages/:id')
  removeLanguage(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removeLanguage(u.id, id);
  }

  // -------- Publication --------
  @Post('publications')
  addPublication(@CurrentUser() u: AuthUser, @Body() dto: CreatePublicationDto) {
    return this.profile.addPublication(u.id, dto);
  }
  @Patch('publications/:id')
  updatePublication(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdatePublicationDto) {
    return this.profile.updatePublication(u.id, id, dto);
  }
  @Delete('publications/:id')
  removePublication(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removePublication(u.id, id);
  }

  // -------- Test scores (one per type) --------
  @Put('test-scores')
  upsertTestScore(@CurrentUser() u: AuthUser, @Body() dto: UpsertTestScoreDto) {
    return this.profile.upsertTestScore(u.id, dto);
  }
  @Delete('test-scores/:id')
  removeTestScore(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.profile.removeTestScore(u.id, id);
  }
}
