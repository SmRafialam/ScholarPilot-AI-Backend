import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AiProvider, EmailType, GenerationStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { CreateEmailDto, UpdateEmailDto } from './dto/email.dto';
import { EmailRepository } from './email.repository';

const GUIDANCE: Record<EmailType, string> = {
  COLD: 'a concise cold outreach email introducing the student and their interest.',
  PROFESSOR: 'a professional email to a professor expressing interest in their research and asking about supervision/openings.',
  FOLLOW_UP: 'a polite follow-up email to a previously contacted professor or office.',
  REMINDER: 'a courteous reminder email.',
  INTERVIEW_REPLY: 'a professional reply to an interview invitation, confirming availability.',
  THANK_YOU: 'a warm, professional thank-you email after an interview or meeting.',
};

@Injectable()
export class EmailService {
  constructor(
    private readonly repo: EmailRepository,
    private readonly ai: AiService,
  ) {}

  list(userId: string) {
    return this.repo.list(userId);
  }

  async get(userId: string, id: string) {
    const email = await this.repo.findOwned(userId, id);
    if (!email) throw new NotFoundException('Email not found');
    return email;
  }

  async generate(userId: string, dto: CreateEmailDto) {
    const { subject, body } = await this.produce(userId, dto);
    return this.repo.create({
      userId,
      type: dto.type,
      professorId: dto.professorId ?? null,
      subject,
      body,
      version: 1,
      status: GenerationStatus.DRAFT,
      provider: AiProvider.OPENAI,
    });
  }

  async regenerate(userId: string, id: string) {
    const email = await this.get(userId, id);
    const { subject, body } = await this.produce(userId, {
      type: email.type,
      professorId: email.professorId ?? undefined,
    });
    return this.repo.update(id, { subject, body, version: email.version + 1 });
  }

  async update(userId: string, id: string, dto: UpdateEmailDto) {
    await this.get(userId, id);
    return this.repo.update(id, dto);
  }

  async remove(userId: string, id: string) {
    const res = await this.repo.delete(userId, id);
    if (res.count === 0) throw new NotFoundException('Email not found');
    return { success: true };
  }

  // --------------------------- internals ---------------------------

  private async produce(
    userId: string,
    dto: CreateEmailDto,
  ): Promise<{ subject: string; body: string }> {
    const profile = await this.repo.getProfile(userId);
    if (!profile) throw new BadRequestException('Complete your profile first');

    let professor: Awaited<ReturnType<EmailRepository['findProfessor']>> = null;
    if (dto.professorId) {
      professor = await this.repo.findProfessor(dto.professorId);
      if (!professor) throw new NotFoundException('Professor not found');
    }

    const userPrompt = JSON.stringify({
      emailType: dto.type,
      extraInstructions: dto.context ?? null,
      student: {
        fullName: profile.fullName,
        researchInterest: profile.researchInterest,
        skills: profile.skills.map((s) => s.name),
        publications: profile.publications.map((p) => p.title),
      },
      professor: professor
        ? {
            name: professor.name,
            university: professor.university.name,
            researchAreas: professor.researchAreas.map((a) => a.name),
            keywords: professor.keywords,
          }
        : null,
    });

    const { text } = await this.ai.chat(
      userPrompt,
      `email_${dto.type.toLowerCase()}`,
      {
        system:
          `You are an expert at academic outreach. Write ${GUIDANCE[dto.type]} ` +
          'Keep it concise, specific and authentic — reference real details from the student and, if present, the professor. ' +
          'Never fabricate. Respond ONLY as JSON: {"subject":"<subject>","body":"<email body>"}.',
        json: true,
        maxTokens: 700,
      },
      userId,
    );

    try {
      const parsed = JSON.parse(text) as { subject?: string; body?: string };
      return { subject: parsed.subject ?? 'Draft email', body: parsed.body ?? '' };
    } catch {
      throw new InternalServerErrorException('AI returned an invalid email');
    }
  }
}
