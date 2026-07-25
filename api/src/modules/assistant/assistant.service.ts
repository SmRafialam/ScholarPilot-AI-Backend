import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { ProfileSnapshot, profileStrength } from '../matching/scoring';
import { AnalysisData, AssistantRepository } from './assistant.repository';

const DEFAULT_TARGETS = [
  'USA', 'Canada', 'Germany', 'UK', 'Australia', 'Finland', 'Sweden', 'Netherlands',
];

const SYSTEM_PROMPT = `You are an expert study-abroad admissions advisor.
Analyze the student's profile HONESTLY and realistically — never inflate chances to please them.
Base admission and funding chances on their academics (CGPA, IELTS, publications, experience)
relative to typical requirements for each target country's competitive universities.
Give a chance percentage (0-100 integer) per target country.
Respond ONLY with valid JSON in EXACTLY this shape:
{
  "admissionChances": { "<Country>": <int 0-100> },
  "fundingChances": { "<Country>": <int 0-100> },
  "strengths": [ "<short phrase>" ],
  "weaknesses": [ "<short phrase>" ],
  "roadmap": [ { "action": "<what to do>", "impact": "<expected effect>", "priority": "high|medium|low" } ],
  "estimatedBudget": { "tuitionUsdPerYear": <int>, "livingUsdPerYear": <int>, "notes": "<string>" },
  "timeline": [ { "phase": "<string>", "when": "<string>" } ],
  "requiredExams": [ "<string>" ]
}`;

@Injectable()
export class AssistantService {
  constructor(
    private readonly repo: AssistantRepository,
    private readonly ai: AiService,
  ) {}

  getLatest(userId: string) {
    return this.repo.getLatest(userId);
  }

  async analyze(userId: string) {
    const profile = await this.repo.getFullProfile(userId);
    if (!profile) throw new BadRequestException('Complete your profile first');

    const ielts = profile.testScores.find((t) => t.type === 'IELTS')?.score ?? null;
    const snapshot: ProfileSnapshot = {
      cgpa: profile.cgpa,
      cgpaScale: profile.cgpaScale ?? 4,
      ielts,
      publications: profile.publications.length,
      experiences: profile.experiences.length,
      skills: profile.skills.length,
      targetCountries: profile.targetCountries,
      budgetUsd: profile.budgetUsd,
      researchText: profile.researchInterest ?? '',
    };
    const strength = profileStrength(snapshot);
    const targets =
      profile.targetCountries.length > 0 ? profile.targetCountries : DEFAULT_TARGETS;

    const userPrompt = JSON.stringify({
      profileStrength: strength,
      academics: {
        cgpa: profile.cgpa,
        cgpaScale: profile.cgpaScale,
        currentUniversity: profile.currentUniversity,
        department: profile.department,
      },
      tests: profile.testScores.map((t) => ({ type: t.type, score: t.score })),
      research: profile.researchInterest,
      publications: profile.publications.length,
      experiences: profile.experiences.length,
      skills: profile.skills.map((s) => s.name),
      budgetUsd: profile.budgetUsd,
      fundingRequirement: profile.fundingRequirement,
      targetCountries: targets,
    });

    const { text } = await this.ai.chat(
      userPrompt,
      'assistant_analysis',
      { system: SYSTEM_PROMPT, json: true, maxTokens: 1200 },
      userId,
    );

    const parsed = this.parse(text);
    const data: AnalysisData = {
      profileStrength: strength,
      admissionChances: parsed.admissionChances ?? {},
      fundingChances: parsed.fundingChances ?? {},
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      roadmap: parsed.roadmap ?? [],
      estimatedBudget: parsed.estimatedBudget ?? {},
      timeline: {
        phases: parsed.timeline ?? [],
        requiredExams: parsed.requiredExams ?? [],
      },
    };

    return this.repo.saveAnalysis(userId, data);
  }

  private parse(text: string): {
    admissionChances?: Record<string, number>;
    fundingChances?: Record<string, number>;
    strengths?: string[];
    weaknesses?: string[];
    roadmap?: unknown[];
    estimatedBudget?: Record<string, unknown>;
    timeline?: unknown[];
    requiredExams?: string[];
  } {
    try {
      return JSON.parse(text);
    } catch {
      throw new InternalServerErrorException('AI returned an invalid analysis');
    }
  }
}
