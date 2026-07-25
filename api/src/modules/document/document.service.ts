import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AiProvider, DocumentType, GenerationStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { DocumentRepository } from './document.repository';

const GUIDANCE: Record<DocumentType, string> = {
  SOP: 'a Statement of Purpose (600-800 words): motivation, academic background, research interests, why this program, career goals.',
  MOTIVATION_LETTER: 'a motivation letter (400-600 words): genuine passion, fit, and goals.',
  RESEARCH_PROPOSAL: 'a concise research proposal (600-900 words): problem, objectives, methodology, expected contribution.',
  PERSONAL_STATEMENT: 'a personal statement (500-700 words): personal journey, strengths, aspirations.',
  COVER_LETTER: 'a professional cover letter (300-400 words).',
  CV: 'a well-structured academic CV in clean markdown with clear sections.',
  RESUME: 'a concise one-page resume in clean markdown.',
};

@Injectable()
export class DocumentService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly ai: AiService,
  ) {}

  list(userId: string) {
    return this.repo.list(userId);
  }

  async get(userId: string, id: string) {
    const doc = await this.repo.findOwned(userId, id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async generate(userId: string, dto: CreateDocumentDto) {
    const content = await this.produce(userId, dto);
    const targetName =
      dto.targetType && dto.targetId
        ? await this.repo.resolveTargetName(dto.targetType, dto.targetId)
        : null;
    return this.repo.create({
      userId,
      type: dto.type,
      targetType: dto.targetType ?? null,
      targetId: dto.targetId ?? null,
      title: this.titleFor(dto.type, targetName),
      content,
      version: 1,
      status: GenerationStatus.DRAFT,
      provider: AiProvider.OPENAI,
    });
  }

  async regenerate(userId: string, id: string) {
    const doc = await this.get(userId, id);
    const content = await this.produce(userId, {
      type: doc.type,
      targetType: doc.targetType ?? undefined,
      targetId: doc.targetId ?? undefined,
    });
    return this.repo.update(id, { content, version: doc.version + 1 });
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    await this.get(userId, id);
    return this.repo.update(id, dto);
  }

  async remove(userId: string, id: string) {
    const res = await this.repo.delete(userId, id);
    if (res.count === 0) throw new NotFoundException('Document not found');
    return { success: true };
  }

  // --------------------------- internals ---------------------------

  private async produce(userId: string, dto: CreateDocumentDto): Promise<string> {
    const profile = await this.repo.getProfile(userId);
    if (!profile) throw new BadRequestException('Complete your profile first');

    const targetName =
      dto.targetType && dto.targetId
        ? await this.repo.resolveTargetName(dto.targetType, dto.targetId)
        : null;

    const userPrompt = JSON.stringify({
      documentType: dto.type,
      target: targetName,
      extraInstructions: dto.context ?? null,
      profile: {
        fullName: profile.fullName,
        currentUniversity: profile.currentUniversity,
        department: profile.department,
        cgpa: profile.cgpa,
        researchInterest: profile.researchInterest,
        tests: profile.testScores.map((t) => ({ type: t.type, score: t.score })),
        skills: profile.skills.map((s) => s.name),
        educations: profile.educations.map((e) => ({ institution: e.institution, degree: e.degree, major: e.major })),
        experiences: profile.experiences.map((e) => ({ title: e.title, organization: e.organization })),
        projects: profile.projects.map((p) => ({ name: p.name, description: p.description })),
        publications: profile.publications.map((p) => p.title),
      },
    });

    const { text } = await this.ai.chat(
      userPrompt,
      `document_${dto.type.toLowerCase()}`,
      {
        system:
          `You are an expert academic writing assistant. Using ONLY the student's real profile, write ${GUIDANCE[dto.type]} ` +
          'Be authentic and specific — never fabricate achievements, awards, or experiences not present in the profile. ' +
          'Return only the document text (markdown allowed), no preamble.',
        maxTokens: 1500,
      },
      userId,
    );
    return text.trim();
  }

  private titleFor(type: DocumentType, target: string | null): string {
    const label = type.replace(/_/g, ' ');
    return target ? `${label} — ${target}` : label;
  }
}
