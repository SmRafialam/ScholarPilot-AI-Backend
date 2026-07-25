import { BadRequestException, Injectable } from '@nestjs/common';
import { DegreeLevel, Prisma } from '@prisma/client';
import pdfParse from 'pdf-parse';
import { AiService } from '../ai/ai.service';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

interface ExtractedCv {
  fullName?: string;
  researchInterest?: string;
  skills?: string[];
  educations?: { institution?: string; degree?: string; major?: string }[];
  experiences?: { title?: string; organization?: string }[];
  publications?: { title?: string; venue?: string; year?: number }[];
}

const SYSTEM = `You extract structured data from a student's CV / resume text.
Return ONLY valid JSON in EXACTLY this shape (omit unknown fields, use [] for empty lists):
{
  "fullName": "<string>",
  "researchInterest": "<one line summary of their research interests>",
  "skills": ["<skill>"],
  "educations": [{ "institution": "<string>", "degree": "BACHELOR|MASTER|PHD|DIPLOMA|CERTIFICATE", "major": "<string>" }],
  "experiences": [{ "title": "<role>", "organization": "<org>" }],
  "publications": [{ "title": "<string>", "venue": "<string>", "year": <int> }]
}
Only include real information found in the CV. Do not invent anything.`;

@Injectable()
export class CvService {
  constructor(
    private readonly repo: ProfileRepository,
    private readonly profileService: ProfileService,
    private readonly ai: AiService,
  ) {}

  async importFromPdf(userId: string, buffer: Buffer) {
    let text: string;
    try {
      text = (await pdfParse(buffer)).text;
    } catch {
      throw new BadRequestException('Could not read the PDF file.');
    }
    if (!text || text.trim().length < 50) {
      throw new BadRequestException('No readable text found (is the PDF scanned/an image?).');
    }

    const data = await this.extract(userId, text.slice(0, 12000));
    const profile = await this.repo.getByUserId(userId);
    if (!profile) throw new BadRequestException('Profile not found');

    const counts = { educations: 0, experiences: 0, publications: 0, skills: 0 };

    const core: Prisma.StudentProfileUpdateInput = {};
    if (data.fullName && !profile.fullName) core.fullName = data.fullName;
    if (data.researchInterest && !profile.researchInterest) {
      core.researchInterest = data.researchInterest;
    }
    if (Object.keys(core).length) await this.repo.updateCore(profile.id, core);

    const existingSkills = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    for (const name of data.skills ?? []) {
      if (name && !existingSkills.has(name.toLowerCase())) {
        await this.repo.createSkill(profile.id, { name });
        existingSkills.add(name.toLowerCase());
        counts.skills += 1;
      }
    }
    for (const e of data.educations ?? []) {
      if (!e.institution) continue;
      await this.repo.createEducation(profile.id, {
        institution: e.institution,
        degree: this.toDegree(e.degree),
        major: e.major,
      });
      counts.educations += 1;
    }
    for (const x of data.experiences ?? []) {
      if (!x.title || !x.organization) continue;
      await this.repo.createExperience(profile.id, {
        title: x.title,
        organization: x.organization,
      });
      counts.experiences += 1;
    }
    for (const p of data.publications ?? []) {
      if (!p.title) continue;
      await this.repo.createPublication(profile.id, {
        title: p.title,
        venue: p.venue,
        year: typeof p.year === 'number' ? p.year : undefined,
      });
      counts.publications += 1;
    }

    const updated = await this.profileService.recompute(userId);
    return { extracted: counts, profile: updated };
  }

  private async extract(userId: string, text: string): Promise<ExtractedCv> {
    const { text: out } = await this.ai.chat(
      text,
      'cv_extract',
      { system: SYSTEM, json: true, maxTokens: 1300 },
      userId,
    );
    try {
      return JSON.parse(out) as ExtractedCv;
    } catch {
      return {};
    }
  }

  private toDegree(v?: string): DegreeLevel {
    const up = (v ?? '').toUpperCase();
    return (Object.values(DegreeLevel) as string[]).includes(up)
      ? (up as DegreeLevel)
      : DegreeLevel.BACHELOR;
  }
}
