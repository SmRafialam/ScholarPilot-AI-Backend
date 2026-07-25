import { DegreeLevel, FundingType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COUNTRIES: { name: string; code: string; region: string }[] = [
  { name: 'United States', code: 'US', region: 'North America' },
  { name: 'Canada', code: 'CA', region: 'North America' },
  { name: 'Germany', code: 'DE', region: 'Europe' },
  { name: 'United Kingdom', code: 'GB', region: 'Europe' },
  { name: 'Australia', code: 'AU', region: 'Oceania' },
  { name: 'Italy', code: 'IT', region: 'Europe' },
  { name: 'Finland', code: 'FI', region: 'Europe' },
  { name: 'Sweden', code: 'SE', region: 'Europe' },
  { name: 'Norway', code: 'NO', region: 'Europe' },
  { name: 'Denmark', code: 'DK', region: 'Europe' },
  { name: 'Ireland', code: 'IE', region: 'Europe' },
  { name: 'Netherlands', code: 'NL', region: 'Europe' },
  { name: 'France', code: 'FR', region: 'Europe' },
  { name: 'Belgium', code: 'BE', region: 'Europe' },
  { name: 'Switzerland', code: 'CH', region: 'Europe' },
  { name: 'Japan', code: 'JP', region: 'Asia' },
  { name: 'South Korea', code: 'KR', region: 'Asia' },
  { name: 'Singapore', code: 'SG', region: 'Asia' },
  { name: 'New Zealand', code: 'NZ', region: 'Oceania' },
];

const RESEARCH_AREAS = [
  'Machine Learning',
  'Artificial Intelligence',
  'Computer Vision',
  'Natural Language Processing',
  'Robotics',
  'Data Science',
  'Cybersecurity',
  'Bioinformatics',
  'Human-Computer Interaction',
  'Distributed Systems',
];

const UNIVERSITIES: {
  name: string;
  code: string; // country code
  qsRanking: number;
  tuitionFeeUsd: number;
  department: string;
  program: string;
  degree: DegreeLevel;
  ielts: number;
}[] = [
  { name: 'Massachusetts Institute of Technology', code: 'US', qsRanking: 1, tuitionFeeUsd: 58000, department: 'EECS', program: 'MSc Computer Science', degree: 'MASTER', ielts: 7.0 },
  { name: 'University of Oxford', code: 'GB', qsRanking: 3, tuitionFeeUsd: 40000, department: 'Computer Science', program: 'MSc Advanced Computer Science', degree: 'MASTER', ielts: 7.5 },
  { name: 'ETH Zurich', code: 'CH', qsRanking: 7, tuitionFeeUsd: 1500, department: 'Computer Science', program: 'MSc Computer Science', degree: 'MASTER', ielts: 7.0 },
  { name: 'National University of Singapore', code: 'SG', qsRanking: 8, tuitionFeeUsd: 20000, department: 'Computing', program: 'MComp Artificial Intelligence', degree: 'MASTER', ielts: 6.5 },
  { name: 'University of Melbourne', code: 'AU', qsRanking: 14, tuitionFeeUsd: 32000, department: 'Computing and Information Systems', program: 'Master of Data Science', degree: 'MASTER', ielts: 6.5 },
  { name: 'University of Toronto', code: 'CA', qsRanking: 21, tuitionFeeUsd: 45000, department: 'Computer Science', program: 'MSc Applied Computing', degree: 'MASTER', ielts: 7.0 },
  { name: 'Technical University of Munich', code: 'DE', qsRanking: 28, tuitionFeeUsd: 0, department: 'Informatics', program: 'MSc Informatics', degree: 'MASTER', ielts: 6.5 },
  { name: 'University of Amsterdam', code: 'NL', qsRanking: 53, tuitionFeeUsd: 16000, department: 'Informatics Institute', program: 'MSc Artificial Intelligence', degree: 'MASTER', ielts: 6.5 },
  { name: 'KTH Royal Institute of Technology', code: 'SE', qsRanking: 73, tuitionFeeUsd: 15000, department: 'Computer Science', program: 'MSc Machine Learning', degree: 'MASTER', ielts: 6.5 },
  { name: 'Aalto University', code: 'FI', qsRanking: 100, tuitionFeeUsd: 15000, department: 'Computer Science', program: 'MSc Computer Science', degree: 'MASTER', ielts: 6.5 },
];

async function main() {
  console.log('🌱 Seeding countries...');
  const codeToId = new Map<string, string>();
  for (const c of COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { code: c.code },
      create: c,
      update: { name: c.name, region: c.region },
    });
    codeToId.set(c.code, country.id);
  }

  console.log('🌱 Seeding research areas...');
  for (const name of RESEARCH_AREAS) {
    await prisma.researchArea.upsert({ where: { name }, create: { name }, update: {} });
  }

  console.log('🌱 Seeding universities...');
  for (const u of UNIVERSITIES) {
    const existing = await prisma.university.findFirst({ where: { name: u.name } });
    if (existing) continue;
    await prisma.university.create({
      data: {
        name: u.name,
        countryId: codeToId.get(u.code)!,
        qsRanking: u.qsRanking,
        tuitionFeeUsd: u.tuitionFeeUsd,
        website: null,
        departments: {
          create: [
            {
              name: u.department,
              programs: {
                create: [
                  {
                    name: u.program,
                    degree: u.degree,
                    durationMonths: 24,
                    tuitionFeeUsd: u.tuitionFeeUsd,
                    englishRequirement: { ielts: u.ielts },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  console.log('🌱 Seeding scholarships...');
  const SCHOLARSHIPS: {
    name: string;
    provider: string;
    code: string;
    fundingType: FundingType;
    coverage: string;
    benefits: string[];
    minCgpa: number;
    minIelts: number;
  }[] = [
    { name: 'DAAD EPOS Scholarship', provider: 'DAAD', code: 'DE', fundingType: 'FULLY_FUNDED', coverage: 'Full tuition + monthly stipend', benefits: ['Monthly stipend', 'Travel allowance', 'Health insurance'], minCgpa: 3.0, minIelts: 6.5 },
    { name: 'Erasmus Mundus Joint Masters', provider: 'European Commission', code: 'NL', fundingType: 'FULLY_FUNDED', coverage: 'Full tuition + living costs', benefits: ['Tuition waiver', 'Monthly allowance', 'Travel & installation'], minCgpa: 3.2, minIelts: 6.5 },
    { name: 'Vanier Canada Graduate Scholarship', provider: 'Government of Canada', code: 'CA', fundingType: 'FULLY_FUNDED', coverage: 'CAD $50,000/year for 3 years', benefits: ['Annual stipend'], minCgpa: 3.5, minIelts: 7.0 },
    { name: 'Swedish Institute Scholarship', provider: 'Swedish Institute', code: 'SE', fundingType: 'FULLY_FUNDED', coverage: 'Tuition + living + insurance', benefits: ['Tuition', 'Living expenses', 'Insurance', 'Travel grant'], minCgpa: 3.0, minIelts: 6.5 },
    { name: 'Australia Awards Scholarship', provider: 'Australian Government', code: 'AU', fundingType: 'FULLY_FUNDED', coverage: 'Full tuition + stipend', benefits: ['Tuition', 'Return air travel', 'Living allowance'], minCgpa: 3.0, minIelts: 6.5 },
  ];
  for (const s of SCHOLARSHIPS) {
    const existing = await prisma.scholarship.findFirst({ where: { name: s.name } });
    if (existing) continue;
    await prisma.scholarship.create({
      data: {
        name: s.name,
        provider: s.provider,
        countryId: codeToId.get(s.code)!,
        fundingType: s.fundingType,
        coverage: s.coverage,
        benefits: s.benefits,
        eligibility: {
          create: {
            minCgpa: s.minCgpa,
            minIelts: s.minIelts,
            degreeLevels: ['MASTER', 'PHD'],
          },
        },
      },
    });
  }

  console.log('🌱 Seeding professors...');
  const PROFESSORS: {
    name: string;
    uni: string;
    email: string;
    accepting: boolean;
    funding: boolean;
    keywords: string[];
    areas: string[];
    pubs: { title: string; venue: string; year: number }[];
  }[] = [
    { name: 'Prof. Dr. Anna Muller', uni: 'Technical University of Munich', email: 'a.mueller@tum.de', accepting: true, funding: true, keywords: ['machine learning', 'deep learning'], areas: ['Machine Learning', 'Artificial Intelligence'], pubs: [{ title: 'Efficient Transformers for Vision', venue: 'CVPR', year: 2024 }] },
    { name: 'Prof. Mikko Virtanen', uni: 'Aalto University', email: 'mikko.virtanen@aalto.fi', accepting: true, funding: false, keywords: ['reinforcement learning', 'robotics'], areas: ['Robotics', 'Machine Learning'], pubs: [{ title: 'Sample-Efficient RL for Manipulation', venue: 'NeurIPS', year: 2023 }] },
    { name: 'Prof. Sarah Chen', uni: 'University of Toronto', email: 's.chen@utoronto.ca', accepting: false, funding: true, keywords: ['computer vision', 'medical imaging'], areas: ['Computer Vision'], pubs: [{ title: 'Self-Supervised Medical Image Segmentation', venue: 'MICCAI', year: 2024 }] },
  ];
  for (const p of PROFESSORS) {
    const uni = await prisma.university.findFirst({ where: { name: p.uni } });
    if (!uni) continue;
    const existing = await prisma.professor.findFirst({
      where: { name: p.name, universityId: uni.id },
    });
    if (existing) continue;
    await prisma.professor.create({
      data: {
        name: p.name,
        universityId: uni.id,
        email: p.email,
        acceptingStudents: p.accepting,
        hasFunding: p.funding,
        keywords: p.keywords,
        researchAreas: {
          connectOrCreate: p.areas.map((name) => ({ where: { name }, create: { name } })),
        },
        publications: { create: p.pubs },
      },
    });
  }

  const [countries, universities, programs, areas, scholarships, professors] =
    await Promise.all([
      prisma.country.count(),
      prisma.university.count(),
      prisma.program.count(),
      prisma.researchArea.count(),
      prisma.scholarship.count(),
      prisma.professor.count(),
    ]);
  console.log(
    `✅ Seed done — countries=${countries}, universities=${universities}, programs=${programs}, researchAreas=${areas}, scholarships=${scholarships}, professors=${professors}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
