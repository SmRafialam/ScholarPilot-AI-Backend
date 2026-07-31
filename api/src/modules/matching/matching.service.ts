import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MatchTargetType, NotificationType } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PlanLimitService } from '../billing/plan-limit.service';
import { NotificationService } from '../notification/notification.service';
import { MatchingRepository } from './matching.repository';
import {
  cosineSimilarity,
  ProfileSnapshot,
  profileStrength,
  scoreProfessor,
  scoreScholarship,
  scoreUniversity,
  SchInput,
  UniInput,
} from './scoring';

export interface Scored {
  id: string;
  name: string;
  subtitle: string;
  score: number;
  breakdown: Record<string, number>;
  reasoning?: string;
}

const TOP_SAVED = 10;
const TOP_EXPLAINED = 3;

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly repo: MatchingRepository,
    private readonly ai: AiService,
    private readonly notifications: NotificationService,
    private readonly limits: PlanLimitService,
  ) {}

  getResults(userId: string) {
    return this.repo.getResults(userId);
  }

  async runMatching(userId: string) {
    await this.limits.assertCanRunMatching(userId);

    const profile = await this.repo.getProfile(userId);
    if (!profile) throw new BadRequestException('Complete your profile first');

    // Professor matching is a Premium-only feature — skip it (and its embedding
    // cost) for lower tiers, and tell the client so it can prompt an upgrade.
    const professorMatchingAllowed = await this.limits.canProfessorMatching(userId);

    const snapshot = this.buildSnapshot(profile);
    const strength = profileStrength(snapshot);

    const [universities, scholarships, professors] = await Promise.all([
      this.repo.listUniversities(),
      this.repo.listScholarships(),
      this.repo.listProfessors(),
    ]);

    // ---- Universities (deterministic) ----
    const uniScored: Scored[] = universities
      .map((u) => {
        const input: UniInput = {
          countryName: u.country.name,
          countryCode: u.country.code,
          qsRanking: u.qsRanking,
          tuitionFeeUsd: u.tuitionFeeUsd,
          ieltsReq: this.extractIeltsReq(u),
        };
        const { score, breakdown } = scoreUniversity(snapshot, input, strength);
        return { id: u.id, name: u.name, subtitle: u.country.name, score, breakdown };
      })
      .sort((a, b) => b.score - a.score);

    // ---- Scholarships (deterministic) ----
    const schScored: Scored[] = scholarships
      .map((s) => {
        const input: SchInput = {
          countryName: s.country?.name ?? null,
          countryCode: s.country?.code ?? null,
          fundingType: s.fundingType,
          minCgpa: s.eligibility?.minCgpa ?? null,
          minIelts: s.eligibility?.minIelts ?? null,
        };
        const { score, breakdown } = scoreScholarship(snapshot, input);
        return { id: s.id, name: s.name, subtitle: s.provider ?? '', score, breakdown };
      })
      .sort((a, b) => b.score - a.score);

    // ---- Professors (AI embeddings for research similarity) — Premium only ----
    const profScored = professorMatchingAllowed
      ? await this.scoreProfessors(userId, snapshot, professors)
      : [];

    // ---- AI explanations for the top matches ----
    await this.attachExplanations(userId, snapshot, strength, uniScored, schScored, profScored);

    // ---- Persist ----
    await this.persist(userId, uniScored, schScored, profScored);

    // Count this run against the user's daily quota.
    await this.limits.recordMatchRun(userId);

    await this.notifications.emit(
      userId,
      NotificationType.MATCH,
      'Your matches are ready',
      `We found ${uniScored.length} universities, ${schScored.length} scholarships and ${profScored.length} professors for you.`,
    );

    return {
      profileStrength: strength,
      universities: uniScored.slice(0, TOP_SAVED),
      scholarships: schScored.slice(0, TOP_SAVED),
      professors: profScored.slice(0, TOP_SAVED),
      professorMatchingLocked: !professorMatchingAllowed,
    };
  }

  // --------------------------- internals ---------------------------

  private buildSnapshot(profile: {
    cgpa: number | null;
    cgpaScale: number | null;
    researchInterest: string | null;
    targetCountries: string[];
    budgetUsd: number | null;
    testScores: { type: string; score: number }[];
    skills: { name: string }[];
    publications: unknown[];
    experiences: unknown[];
  }): ProfileSnapshot {
    const ielts = profile.testScores.find((t) => t.type === 'IELTS')?.score ?? null;
    return {
      cgpa: profile.cgpa,
      cgpaScale: profile.cgpaScale ?? 4,
      ielts,
      publications: profile.publications.length,
      experiences: profile.experiences.length,
      skills: profile.skills.length,
      targetCountries: profile.targetCountries,
      budgetUsd: profile.budgetUsd,
      researchText: [profile.researchInterest, ...profile.skills.map((s) => s.name)]
        .filter(Boolean)
        .join(', '),
    };
  }

  private async scoreProfessors(
    userId: string,
    snapshot: ProfileSnapshot,
    professors: {
      id: string;
      name: string;
      acceptingStudents: boolean;
      keywords: string[];
      university: { name: string };
      researchAreas: { name: string }[];
    }[],
  ): Promise<Scored[]> {
    if (professors.length === 0) return [];

    let similarities: number[];
    if (snapshot.researchText) {
      const profTexts = professors.map((p) =>
        [...p.keywords, ...p.researchAreas.map((a) => a.name)].join(', '),
      );
      try {
        const { vectors } = await this.ai.embed(
          [snapshot.researchText, ...profTexts],
          'matching_professor_embed',
          userId,
        );
        const profileVec = vectors[0];
        similarities = professors.map((_, i) => cosineSimilarity(profileVec, vectors[i + 1]));
      } catch (err) {
        this.logger.warn(`Embedding failed, falling back to neutral similarity: ${String(err)}`);
        similarities = professors.map(() => 0.3);
      }
    } else {
      similarities = professors.map(() => 0.3);
    }

    return professors
      .map((p, i) => {
        const { score, breakdown } = scoreProfessor(similarities[i], p.acceptingStudents);
        return { id: p.id, name: p.name, subtitle: p.university.name, score, breakdown };
      })
      .sort((a, b) => b.score - a.score);
  }

  private async attachExplanations(
    userId: string,
    snapshot: ProfileSnapshot,
    strength: number,
    unis: Scored[],
    schs: Scored[],
    profs: Scored[],
  ): Promise<void> {
    const items = [
      ...unis.slice(0, TOP_EXPLAINED).map((x) => ({ id: x.id, kind: 'university', name: x.name })),
      ...schs.slice(0, TOP_EXPLAINED).map((x) => ({ id: x.id, kind: 'scholarship', name: x.name })),
      ...profs.slice(0, TOP_EXPLAINED).map((x) => ({ id: x.id, kind: 'professor', name: x.name })),
    ];
    if (items.length === 0) return;

    const prompt = JSON.stringify({
      student: {
        strength,
        cgpa: snapshot.cgpa,
        ielts: snapshot.ielts,
        research: snapshot.researchText,
        targetCountries: snapshot.targetCountries,
        budgetUsd: snapshot.budgetUsd,
      },
      matches: items,
    });

    try {
      const { text } = await this.ai.chat(
        prompt,
        'matching_explain',
        {
          system:
            'You are an admissions advisor. For each match, write ONE concise sentence (max 20 words) on why it fits this student. Be honest, not salesy. Respond ONLY as JSON: {"reasons":{"<id>":"<sentence>"}}.',
          json: true,
          maxTokens: 500,
        },
        userId,
      );
      const parsed = JSON.parse(text) as { reasons?: Record<string, string> };
      const reasons = parsed.reasons ?? {};
      for (const list of [unis, schs, profs]) {
        for (const item of list) {
          if (reasons[item.id]) item.reasoning = reasons[item.id];
        }
      }
    } catch (err) {
      this.logger.warn(`Explanation generation failed: ${String(err)}`);
    }
  }

  private async persist(
    userId: string,
    unis: Scored[],
    schs: Scored[],
    profs: Scored[],
  ): Promise<void> {
    const tasks: Promise<unknown>[] = [];
    const save = (list: Scored[], type: MatchTargetType) => {
      for (const item of list.slice(0, TOP_SAVED)) {
        tasks.push(
          this.repo.saveMatch(userId, type, item.id, item.score, item.breakdown, item.reasoning),
        );
      }
    };
    save(unis, MatchTargetType.UNIVERSITY);
    save(schs, MatchTargetType.SCHOLARSHIP);
    save(profs, MatchTargetType.PROFESSOR);
    await Promise.all(tasks);
  }

  private extractIeltsReq(u: {
    departments: { programs: { englishRequirement: unknown }[] }[];
  }): number | null {
    for (const d of u.departments) {
      for (const p of d.programs) {
        const req = p.englishRequirement as { ielts?: number } | null;
        if (req?.ielts != null) return req.ielts;
      }
    }
    return null;
  }
}
