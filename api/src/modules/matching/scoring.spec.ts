import {
  cosineSimilarity,
  profileStrength,
  ProfileSnapshot,
  scoreProfessor,
  scoreScholarship,
  scoreUniversity,
} from './scoring';

const baseProfile: ProfileSnapshot = {
  cgpa: 3.4,
  cgpaScale: 4,
  ielts: 7,
  publications: 1,
  experiences: 2,
  skills: 4,
  targetCountries: ['Germany', 'Finland'],
  budgetUsd: 20000,
  researchText: 'machine learning',
};

describe('profileStrength', () => {
  it('rewards a strong profile more than a weak one', () => {
    const weak: ProfileSnapshot = {
      ...baseProfile,
      cgpa: 2.5,
      ielts: 5.5,
      publications: 0,
      experiences: 0,
      skills: 0,
    };
    expect(profileStrength(baseProfile)).toBeGreaterThan(profileStrength(weak));
  });

  it('stays within 0-100', () => {
    const s = profileStrength(baseProfile);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe('scoreUniversity', () => {
  const strength = profileStrength(baseProfile);

  it('boosts universities in a target country', () => {
    const inTarget = scoreUniversity(baseProfile, {
      countryName: 'Germany', countryCode: 'DE', qsRanking: 30, tuitionFeeUsd: 0, ieltsReq: 6.5,
    }, strength);
    const offTarget = scoreUniversity(baseProfile, {
      countryName: 'Japan', countryCode: 'JP', qsRanking: 30, tuitionFeeUsd: 0, ieltsReq: 6.5,
    }, strength);
    expect(inTarget.breakdown.country).toBe(100);
    expect(offTarget.breakdown.country).toBe(20);
    expect(inTarget.score).toBeGreaterThan(offTarget.score);
  });

  it('penalizes tuition above budget', () => {
    const affordable = scoreUniversity(baseProfile, {
      countryName: 'Germany', countryCode: 'DE', qsRanking: 30, tuitionFeeUsd: 10000, ieltsReq: 6.5,
    }, strength);
    const expensive = scoreUniversity(baseProfile, {
      countryName: 'Germany', countryCode: 'DE', qsRanking: 30, tuitionFeeUsd: 60000, ieltsReq: 6.5,
    }, strength);
    expect(affordable.breakdown.budget).toBeGreaterThan(expensive.breakdown.budget);
  });

  it('gives full english score when IELTS meets the requirement', () => {
    const r = scoreUniversity(baseProfile, {
      countryName: 'Germany', countryCode: 'DE', qsRanking: 30, tuitionFeeUsd: 0, ieltsReq: 6.5,
    }, strength);
    expect(r.breakdown.english).toBe(100);
  });
});

describe('scoreScholarship', () => {
  it('drops eligibility when CGPA is below the minimum', () => {
    const eligible = scoreScholarship(baseProfile, {
      countryName: 'Germany', countryCode: 'DE', fundingType: 'FULLY_FUNDED', minCgpa: 3.0, minIelts: 6.5,
    });
    const ineligible = scoreScholarship(
      { ...baseProfile, cgpa: 2.6 },
      { countryName: 'Germany', countryCode: 'DE', fundingType: 'FULLY_FUNDED', minCgpa: 3.5, minIelts: 6.5 },
    );
    expect(eligible.breakdown.eligibility).toBeGreaterThan(ineligible.breakdown.eligibility);
  });

  it('scores fully-funded higher than partial', () => {
    const full = scoreScholarship(baseProfile, {
      countryName: 'Germany', countryCode: 'DE', fundingType: 'FULLY_FUNDED', minCgpa: null, minIelts: null,
    });
    const partial = scoreScholarship(baseProfile, {
      countryName: 'Germany', countryCode: 'DE', fundingType: 'PARTIAL', minCgpa: null, minIelts: null,
    });
    expect(full.breakdown.funding).toBeGreaterThan(partial.breakdown.funding);
  });
});

describe('scoreProfessor', () => {
  it('rewards higher research similarity and accepting students', () => {
    const strong = scoreProfessor(0.9, true);
    const weak = scoreProfessor(0.2, false);
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.breakdown.researchSimilarity).toBe(90);
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 5);
  });
  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });
  it('handles zero vectors safely', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
