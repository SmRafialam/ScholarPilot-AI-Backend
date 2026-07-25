/**
 * Pure, deterministic scoring functions. No AI, no I/O — fully testable.
 * Every score is 0-100 and returns a breakdown so the UI can explain "why".
 */

export interface ProfileSnapshot {
  cgpa: number | null;
  cgpaScale: number;
  ielts: number | null;
  publications: number;
  experiences: number;
  skills: number;
  targetCountries: string[];
  budgetUsd: number | null;
  researchText: string;
}

export interface ScoreResult {
  score: number;
  breakdown: Record<string, number>;
}

/** Overall academic strength 0-100 from the profile. */
export function profileStrength(p: ProfileSnapshot): number {
  const cgpaPart = p.cgpa != null ? (p.cgpa / (p.cgpaScale || 4)) * 40 : 20;
  const ieltsPart = p.ielts != null ? (p.ielts / 9) * 25 : 10;
  const pubPart = (Math.min(p.publications, 3) / 3) * 15;
  const expPart = (Math.min(p.experiences, 3) / 3) * 10;
  const skillPart = (Math.min(p.skills, 5) / 5) * 10;
  return clamp(Math.round(cgpaPart + ieltsPart + pubPart + expPart + skillPart));
}

export interface UniInput {
  countryName: string;
  countryCode: string;
  qsRanking: number | null;
  tuitionFeeUsd: number | null;
  ieltsReq: number | null;
}

export function scoreUniversity(
  p: ProfileSnapshot,
  u: UniInput,
  strength: number,
): ScoreResult {
  const country = countryMatch(p.targetCountries, u.countryName, u.countryCode);
  const budget = budgetScore(p.budgetUsd, u.tuitionFeeUsd);
  const academic = academicFit(strength, u.qsRanking);
  const english = englishScore(p.ielts, u.ieltsReq);
  const score = clamp(
    Math.round(0.3 * country + 0.25 * budget + 0.25 * academic + 0.2 * english),
  );
  return { score, breakdown: { country, budget, academic, english } };
}

export interface SchInput {
  countryName: string | null;
  countryCode: string | null;
  fundingType: string;
  minCgpa: number | null;
  minIelts: number | null;
}

export function scoreScholarship(p: ProfileSnapshot, s: SchInput): ScoreResult {
  const country =
    s.countryName || s.countryCode
      ? countryMatch(p.targetCountries, s.countryName ?? '', s.countryCode ?? '')
      : 60;
  const eligibility = eligibilityScore(p, s.minCgpa, s.minIelts);
  const funding = fundingScore(s.fundingType);
  const score = clamp(
    Math.round(0.45 * eligibility + 0.3 * country + 0.25 * funding),
  );
  return { score, breakdown: { eligibility, country, funding } };
}

export function scoreProfessor(
  researchSimilarity: number, // 0-1 (cosine)
  acceptingStudents: boolean,
): ScoreResult {
  const sim = clamp(Math.round(researchSimilarity * 100));
  const accepting = acceptingStudents ? 100 : 40;
  const score = clamp(Math.round(0.75 * sim + 0.25 * accepting));
  return { score, breakdown: { researchSimilarity: sim, accepting } };
}

// --------------------------- helpers ---------------------------

function countryMatch(targets: string[], name: string, code: string): number {
  if (!targets.length) return 60; // no preference set
  const t = targets.map((x) => x.toLowerCase());
  return t.includes(name.toLowerCase()) || t.includes(code.toLowerCase())
    ? 100
    : 20;
}

function budgetScore(budget: number | null, tuition: number | null): number {
  if (tuition == null) return 60;
  if (tuition === 0) return 100;
  if (budget == null) return 60;
  if (tuition <= budget) return 100;
  return clamp(Math.round(100 - ((tuition - budget) / budget) * 100));
}

function academicFit(strength: number, ranking: number | null): number {
  const expected =
    ranking == null
      ? 55
      : ranking <= 20
        ? 85
        : ranking <= 50
          ? 72
          : ranking <= 100
            ? 60
            : 50;
  if (strength >= expected) return 100;
  return clamp(Math.round(100 - (expected - strength) * 2));
}

function englishScore(ielts: number | null, req: number | null): number {
  const need = req ?? 6.5;
  if (ielts == null) return 50;
  if (ielts >= need) return 100;
  return clamp(Math.round(100 - (need - ielts) * 40));
}

function eligibilityScore(
  p: ProfileSnapshot,
  minCgpa: number | null,
  minIelts: number | null,
): number {
  let score = 100;
  if (minCgpa != null && p.cgpa != null && p.cgpa < minCgpa) {
    score -= Math.min(60, (minCgpa - p.cgpa) * 60);
  }
  if (minIelts != null && p.ielts != null && p.ielts < minIelts) {
    score -= Math.min(40, (minIelts - p.ielts) * 40);
  }
  return clamp(Math.round(score));
}

function fundingScore(fundingType: string): number {
  switch (fundingType) {
    case 'FULLY_FUNDED':
      return 100;
    case 'TUITION_WAIVER':
      return 70;
    case 'PARTIAL':
      return 60;
    case 'STIPEND':
      return 65;
    default:
      return 50;
  }
}

/** Cosine similarity of two equal-length vectors, clamped to [0, 1]. */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return Math.max(0, Math.min(1, dot / (Math.sqrt(na) * Math.sqrt(nb))));
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}
