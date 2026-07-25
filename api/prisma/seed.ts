import { DegreeLevel, PrismaClient } from '@prisma/client';

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

  const [countries, universities, programs, areas] = await Promise.all([
    prisma.country.count(),
    prisma.university.count(),
    prisma.program.count(),
    prisma.researchArea.count(),
  ]);
  console.log(
    `✅ Seed done — countries=${countries}, universities=${universities}, programs=${programs}, researchAreas=${areas}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
