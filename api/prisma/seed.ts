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
  'Software Engineering',
  'Cloud Computing',
];

/** Programs rotated across universities so every school has a couple of offerings. */
const PROGRAM_POOL = [
  'MSc Computer Science',
  'MSc Artificial Intelligence',
  'MSc Data Science',
  'MSc Machine Learning',
  'MSc Robotics',
  'MSc Cybersecurity',
  'MSc Software Engineering',
  'MSc Human-Computer Interaction',
];

/** [name, countryCode, city, qsRanking, tuitionFeeUsd] */
const U: [string, string, string, number, number][] = [
  // United States
  ['Massachusetts Institute of Technology', 'US', 'Cambridge', 1, 58000],
  ['Stanford University', 'US', 'Stanford', 5, 57000],
  ['Harvard University', 'US', 'Cambridge', 4, 54000],
  ['California Institute of Technology', 'US', 'Pasadena', 15, 56000],
  ['University of California, Berkeley', 'US', 'Berkeley', 12, 43000],
  ['Carnegie Mellon University', 'US', 'Pittsburgh', 52, 51000],
  ['University of California, Los Angeles', 'US', 'Los Angeles', 42, 41000],
  ['Princeton University', 'US', 'Princeton', 22, 55000],
  ['Yale University', 'US', 'New Haven', 23, 53000],
  ['Cornell University', 'US', 'Ithaca', 16, 52000],
  ['Columbia University', 'US', 'New York', 23, 54000],
  ['University of Michigan', 'US', 'Ann Arbor', 44, 40000],
  ['Georgia Institute of Technology', 'US', 'Atlanta', 84, 33000],
  ['University of Washington', 'US', 'Seattle', 63, 39000],
  ['University of Illinois Urbana-Champaign', 'US', 'Urbana', 64, 36000],
  ['University of Texas at Austin', 'US', 'Austin', 66, 38000],
  ['New York University', 'US', 'New York', 38, 51000],
  ['University of Chicago', 'US', 'Chicago', 21, 56000],
  ['Johns Hopkins University', 'US', 'Baltimore', 28, 55000],
  ['University of Pennsylvania', 'US', 'Philadelphia', 11, 55000],
  // United Kingdom
  ['University of Oxford', 'GB', 'Oxford', 3, 40000],
  ['University of Cambridge', 'GB', 'Cambridge', 2, 42000],
  ['Imperial College London', 'GB', 'London', 6, 39000],
  ['University College London', 'GB', 'London', 9, 38000],
  ['University of Edinburgh', 'GB', 'Edinburgh', 27, 35000],
  ["King's College London", 'GB', 'London', 40, 34000],
  ['University of Manchester', 'GB', 'Manchester', 34, 30000],
  ['University of Bristol', 'GB', 'Bristol', 54, 29000],
  ['University of Warwick', 'GB', 'Coventry', 69, 30000],
  ['University of Glasgow', 'GB', 'Glasgow', 76, 28000],
  ['University of Southampton', 'GB', 'Southampton', 80, 27000],
  ['University of Leeds', 'GB', 'Leeds', 82, 27000],
  // Canada
  ['University of Toronto', 'CA', 'Toronto', 21, 45000],
  ['University of British Columbia', 'CA', 'Vancouver', 34, 42000],
  ['McGill University', 'CA', 'Montreal', 30, 40000],
  ['University of Waterloo', 'CA', 'Waterloo', 112, 38000],
  ['University of Alberta', 'CA', 'Edmonton', 111, 34000],
  ['McMaster University', 'CA', 'Hamilton', 176, 33000],
  ['University of Montreal', 'CA', 'Montreal', 141, 30000],
  ['Western University', 'CA', 'London', 114, 32000],
  // Germany
  ['Technical University of Munich', 'DE', 'Munich', 28, 0],
  ['Ludwig Maximilian University of Munich', 'DE', 'Munich', 59, 0],
  ['Heidelberg University', 'DE', 'Heidelberg', 87, 0],
  ['RWTH Aachen University', 'DE', 'Aachen', 99, 0],
  ['Technical University of Berlin', 'DE', 'Berlin', 154, 0],
  ['Humboldt University of Berlin', 'DE', 'Berlin', 120, 0],
  ['Karlsruhe Institute of Technology', 'DE', 'Karlsruhe', 119, 0],
  ['Technical University of Darmstadt', 'DE', 'Darmstadt', 279, 0],
  ['University of Freiburg', 'DE', 'Freiburg', 192, 0],
  ['University of Stuttgart', 'DE', 'Stuttgart', 312, 0],
  // Australia
  ['University of Melbourne', 'AU', 'Melbourne', 14, 32000],
  ['University of Sydney', 'AU', 'Sydney', 18, 34000],
  ['Australian National University', 'AU', 'Canberra', 30, 33000],
  ['University of New South Wales', 'AU', 'Sydney', 19, 33000],
  ['University of Queensland', 'AU', 'Brisbane', 40, 31000],
  ['Monash University', 'AU', 'Melbourne', 37, 31000],
  ['University of Western Australia', 'AU', 'Perth', 77, 29000],
  ['University of Adelaide', 'AU', 'Adelaide', 82, 28000],
  // Netherlands
  ['Delft University of Technology', 'NL', 'Delft', 47, 18000],
  ['University of Amsterdam', 'NL', 'Amsterdam', 53, 16000],
  ['Eindhoven University of Technology', 'NL', 'Eindhoven', 124, 17000],
  ['Utrecht University', 'NL', 'Utrecht', 107, 15000],
  ['Leiden University', 'NL', 'Leiden', 126, 15000],
  ['University of Groningen', 'NL', 'Groningen', 139, 14000],
  // Switzerland
  ['ETH Zurich', 'CH', 'Zurich', 7, 1500],
  ['EPFL', 'CH', 'Lausanne', 26, 1600],
  ['University of Zurich', 'CH', 'Zurich', 91, 1500],
  // Sweden
  ['KTH Royal Institute of Technology', 'SE', 'Stockholm', 73, 15000],
  ['Lund University', 'SE', 'Lund', 85, 14000],
  ['Chalmers University of Technology', 'SE', 'Gothenburg', 129, 14000],
  ['Uppsala University', 'SE', 'Uppsala', 105, 14000],
  // Finland
  ['Aalto University', 'FI', 'Espoo', 100, 15000],
  ['University of Helsinki', 'FI', 'Helsinki', 106, 15000],
  ['University of Oulu', 'FI', 'Oulu', 301, 13000],
  // Denmark
  ['Technical University of Denmark', 'DK', 'Kongens Lyngby', 121, 0],
  ['University of Copenhagen', 'DK', 'Copenhagen', 100, 0],
  ['Aarhus University', 'DK', 'Aarhus', 156, 0],
  // Norway
  ['Norwegian University of Science and Technology', 'NO', 'Trondheim', 292, 0],
  ['University of Oslo', 'NO', 'Oslo', 117, 0],
  // Ireland
  ['Trinity College Dublin', 'IE', 'Dublin', 87, 20000],
  ['University College Dublin', 'IE', 'Dublin', 171, 19000],
  // France
  ['Sorbonne University', 'FR', 'Paris', 59, 5000],
  ['PSL University', 'FR', 'Paris', 24, 5000],
  ['Institut Polytechnique de Paris', 'FR', 'Palaiseau', 38, 6000],
  ['University of Paris-Saclay', 'FR', 'Gif-sur-Yvette', 71, 5000],
  ['Grenoble Alpes University', 'FR', 'Grenoble', 294, 4000],
  // Belgium
  ['KU Leuven', 'BE', 'Leuven', 61, 4000],
  ['Ghent University', 'BE', 'Ghent', 142, 4000],
  // Italy
  ['Politecnico di Milano', 'IT', 'Milan', 123, 4000],
  ['University of Bologna', 'IT', 'Bologna', 133, 3000],
  ['Sapienza University of Rome', 'IT', 'Rome', 134, 3000],
  // Japan
  ['University of Tokyo', 'JP', 'Tokyo', 28, 9000],
  ['Kyoto University', 'JP', 'Kyoto', 46, 9000],
  ['Tokyo Institute of Technology', 'JP', 'Tokyo', 91, 9000],
  ['Osaka University', 'JP', 'Osaka', 80, 9000],
  // South Korea
  ['Seoul National University', 'KR', 'Seoul', 41, 12000],
  ['KAIST', 'KR', 'Daejeon', 53, 11000],
  ['Yonsei University', 'KR', 'Seoul', 76, 12000],
  // Singapore
  ['National University of Singapore', 'SG', 'Singapore', 8, 20000],
  ['Nanyang Technological University', 'SG', 'Singapore', 15, 19000],
  // New Zealand
  ['University of Auckland', 'NZ', 'Auckland', 65, 25000],
  ['University of Otago', 'NZ', 'Dunedin', 206, 23000],
];

/** [name, provider, countryCode, universityName|null, fundingType, minCgpa, minIelts] */
const S: [string, string, string, string | null, FundingType, number, number][] = [
  ['DAAD EPOS Scholarship', 'DAAD', 'DE', null, 'FULLY_FUNDED', 3.0, 6.5],
  ['Erasmus Mundus Joint Masters', 'European Commission', 'NL', null, 'FULLY_FUNDED', 3.2, 6.5],
  ['Vanier Canada Graduate Scholarship', 'Government of Canada', 'CA', null, 'FULLY_FUNDED', 3.5, 7.0],
  ['Swedish Institute Scholarship', 'Swedish Institute', 'SE', null, 'FULLY_FUNDED', 3.0, 6.5],
  ['Australia Awards Scholarship', 'Australian Government', 'AU', null, 'FULLY_FUNDED', 3.0, 6.5],
  ['Chevening Scholarship', 'UK Government (FCDO)', 'GB', null, 'FULLY_FUNDED', 3.0, 6.5],
  ['Gates Cambridge Scholarship', 'Gates Cambridge Trust', 'GB', 'University of Cambridge', 'FULLY_FUNDED', 3.7, 7.5],
  ['Rhodes Scholarship', 'Rhodes Trust', 'GB', 'University of Oxford', 'FULLY_FUNDED', 3.7, 7.5],
  ['Fulbright Foreign Student Program', 'US Government', 'US', null, 'FULLY_FUNDED', 3.3, 7.0],
  ['Knight-Hennessy Scholars', 'Stanford University', 'US', 'Stanford University', 'FULLY_FUNDED', 3.5, 7.0],
  ['MIT Presidential Fellowship', 'MIT', 'US', 'Massachusetts Institute of Technology', 'STIPEND', 3.6, 7.0],
  ['Eiffel Excellence Scholarship', 'Campus France', 'FR', null, 'FULLY_FUNDED', 3.2, 6.5],
  ['Holland Scholarship', 'Dutch Ministry of Education', 'NL', null, 'PARTIAL', 3.0, 6.5],
  ['Orange Tulip Scholarship', 'Nuffic Neso', 'NL', null, 'PARTIAL', 3.0, 6.5],
  ['ETH Excellence Scholarship', 'ETH Zurich', 'CH', 'ETH Zurich', 'FULLY_FUNDED', 3.5, 7.0],
  ['EPFL Excellence Fellowship', 'EPFL', 'CH', 'EPFL', 'FULLY_FUNDED', 3.5, 7.0],
  ['NTU Research Scholarship', 'Nanyang Technological University', 'SG', 'Nanyang Technological University', 'FULLY_FUNDED', 3.3, 6.5],
  ['NUS Research Scholarship', 'National University of Singapore', 'SG', 'National University of Singapore', 'FULLY_FUNDED', 3.3, 6.5],
  ['Aalto Science Institute Scholarship', 'Aalto University', 'FI', 'Aalto University', 'PARTIAL', 3.0, 6.5],
  ['Finland Government Scholarship', 'Finnish National Agency', 'FI', null, 'TUITION_WAIVER', 3.0, 6.5],
  ['DTU Scholarship', 'Technical University of Denmark', 'DK', 'Technical University of Denmark', 'PARTIAL', 3.0, 6.5],
  ['Denmark Government Scholarship', 'Danish Government', 'DK', null, 'TUITION_WAIVER', 3.0, 6.5],
  ['Quota Scheme Scholarship', 'Norwegian Government', 'NO', null, 'FULLY_FUNDED', 3.0, 6.5],
  ['Government of Ireland Scholarship', 'Irish Research Council', 'IE', null, 'FULLY_FUNDED', 3.2, 6.5],
  ['MEXT Scholarship', 'Government of Japan', 'JP', null, 'FULLY_FUNDED', 3.2, 6.0],
  ['Global Korea Scholarship', 'Korean Government (NIIED)', 'KR', null, 'FULLY_FUNDED', 3.2, 5.5],
  ['University of Melbourne Graduate Scholarship', 'University of Melbourne', 'AU', 'University of Melbourne', 'PARTIAL', 3.2, 6.5],
  ['Lester B. Pearson Scholarship', 'University of Toronto', 'CA', 'University of Toronto', 'FULLY_FUNDED', 3.6, 7.0],
  ['UBC Graduate Fellowship', 'University of British Columbia', 'CA', 'University of British Columbia', 'PARTIAL', 3.3, 6.5],
  ['KU Leuven Science Scholarship', 'KU Leuven', 'BE', 'KU Leuven', 'PARTIAL', 3.2, 6.5],
];

/** [name, universityName, email, accepting, funding, keywords, areas, [pub titles+venue+year]] */
const P: [
  string,
  string,
  string,
  boolean,
  boolean,
  string[],
  string[],
  { title: string; venue: string; year: number }[],
][] = [
  ['Prof. Dr. Anna Muller', 'Technical University of Munich', 'a.mueller@tum.de', true, true, ['machine learning', 'deep learning'], ['Machine Learning', 'Artificial Intelligence'], [{ title: 'Efficient Transformers for Vision', venue: 'CVPR', year: 2024 }]],
  ['Prof. Mikko Virtanen', 'Aalto University', 'mikko.virtanen@aalto.fi', true, false, ['reinforcement learning', 'robotics'], ['Robotics', 'Machine Learning'], [{ title: 'Sample-Efficient RL for Manipulation', venue: 'NeurIPS', year: 2023 }]],
  ['Prof. Sarah Chen', 'University of Toronto', 's.chen@utoronto.ca', false, true, ['computer vision', 'medical imaging'], ['Computer Vision'], [{ title: 'Self-Supervised Medical Image Segmentation', venue: 'MICCAI', year: 2024 }]],
  ['Prof. David Kim', 'Stanford University', 'dkim@stanford.edu', true, true, ['nlp', 'large language models'], ['Natural Language Processing', 'Machine Learning'], [{ title: 'Retrieval-Augmented Reasoning in LLMs', venue: 'ACL', year: 2024 }]],
  ['Prof. Elena Rossi', 'EPFL', 'elena.rossi@epfl.ch', true, true, ['data science', 'graph learning'], ['Data Science', 'Machine Learning'], [{ title: 'Scalable Graph Neural Networks', venue: 'ICML', year: 2023 }]],
  ['Prof. James Wilson', 'University of Oxford', 'j.wilson@ox.ac.uk', false, true, ['ai safety', 'nlp'], ['Artificial Intelligence', 'Natural Language Processing'], [{ title: 'Alignment Objectives for Language Agents', venue: 'ICLR', year: 2024 }]],
  ['Prof. Yuki Tanaka', 'National University of Singapore', 'yuki.tanaka@nus.edu.sg', true, false, ['computer vision', 'robotics'], ['Computer Vision', 'Robotics'], [{ title: 'Visual Servoing for Dexterous Grasping', venue: 'ICRA', year: 2023 }]],
  ['Prof. Laura Schmidt', 'ETH Zurich', 'laura.schmidt@ethz.ch', true, true, ['distributed systems', 'security'], ['Distributed Systems', 'Cybersecurity'], [{ title: 'Byzantine-Robust Federated Learning', venue: 'USENIX Security', year: 2024 }]],
  ['Prof. Ahmed Hassan', 'University of Edinburgh', 'a.hassan@ed.ac.uk', true, true, ['nlp', 'machine translation'], ['Natural Language Processing', 'Machine Learning'], [{ title: 'Low-Resource Neural Machine Translation', venue: 'EMNLP', year: 2023 }]],
  ['Prof. Sophie Martin', 'Delft University of Technology', 's.martin@tudelft.nl', true, false, ['robotics', 'control'], ['Robotics'], [{ title: 'Learning Agile Locomotion', venue: 'RSS', year: 2024 }]],
  ['Prof. Michael Brown', 'Carnegie Mellon University', 'mbrown@cmu.edu', true, true, ['machine learning', 'optimization'], ['Machine Learning', 'Data Science'], [{ title: 'Second-Order Methods for Deep Nets', venue: 'NeurIPS', year: 2024 }]],
  ['Prof. Priya Nair', 'Imperial College London', 'p.nair@imperial.ac.uk', false, true, ['computer vision', 'generative models'], ['Computer Vision', 'Artificial Intelligence'], [{ title: 'Diffusion Models for 3D Synthesis', venue: 'CVPR', year: 2024 }]],
  ['Prof. Lars Nielsen', 'Technical University of Denmark', 'lars.nielsen@dtu.dk', true, true, ['bioinformatics', 'data science'], ['Bioinformatics', 'Data Science'], [{ title: 'Deep Learning for Protein Folding', venue: 'Nature Methods', year: 2023 }]],
  ['Prof. Chloe Dubois', 'University of Amsterdam', 'c.dubois@uva.nl', true, false, ['nlp', 'multimodal'], ['Natural Language Processing', 'Artificial Intelligence'], [{ title: 'Grounded Vision-Language Pretraining', venue: 'ACL', year: 2024 }]],
  ['Prof. Robert Zhang', 'University of British Columbia', 'r.zhang@ubc.ca', true, true, ['hci', 'data science'], ['Human-Computer Interaction', 'Data Science'], [{ title: 'Explainable Interfaces for ML Models', venue: 'CHI', year: 2024 }]],
  ['Prof. Ingrid Larsson', 'KTH Royal Institute of Technology', 'ingrid.larsson@kth.se', true, true, ['machine learning', 'signal processing'], ['Machine Learning', 'Data Science'], [{ title: 'Probabilistic Time-Series Forecasting', venue: 'ICML', year: 2023 }]],
  ['Prof. Kenji Sato', 'University of Tokyo', 'k.sato@u-tokyo.ac.jp', true, false, ['robotics', 'reinforcement learning'], ['Robotics', 'Machine Learning'], [{ title: 'Sim-to-Real Transfer for Humanoids', venue: 'CoRL', year: 2024 }]],
  ['Prof. Min-jun Park', 'KAIST', 'mjpark@kaist.ac.kr', true, true, ['computer vision', 'efficient ai'], ['Computer Vision', 'Machine Learning'], [{ title: 'Quantization-Aware Vision Transformers', venue: 'ECCV', year: 2024 }]],
  ['Prof. Thomas Weber', 'RWTH Aachen University', 't.weber@rwth-aachen.de', false, true, ['cybersecurity', 'distributed systems'], ['Cybersecurity', 'Distributed Systems'], [{ title: 'Zero-Trust Architectures at Scale', venue: 'CCS', year: 2023 }]],
  ['Prof. Olivia Bennett', 'University of Melbourne', 'o.bennett@unimelb.edu.au', true, true, ['data science', 'health informatics'], ['Data Science', 'Bioinformatics'], [{ title: 'Causal Inference in EHR Data', venue: 'KDD', year: 2024 }]],
  ['Prof. Marco Bianchi', 'Politecnico di Milano', 'marco.bianchi@polimi.it', true, false, ['software engineering', 'cloud'], ['Software Engineering', 'Cloud Computing'], [{ title: 'Serverless Autoscaling Policies', venue: 'ICSE', year: 2023 }]],
  ['Prof. Hana Kim', 'Seoul National University', 'hana.kim@snu.ac.kr', true, true, ['nlp', 'speech'], ['Natural Language Processing', 'Machine Learning'], [{ title: 'End-to-End Multilingual Speech Recognition', venue: 'INTERSPEECH', year: 2024 }]],
  ['Prof. Daniel O’Brien', 'Trinity College Dublin', 'daniel.obrien@tcd.ie', true, false, ['hci', 'accessibility'], ['Human-Computer Interaction'], [{ title: 'Adaptive Interfaces for Assistive Tech', venue: 'UIST', year: 2023 }]],
  ['Prof. Fatima Al-Sayed', 'University of New South Wales', 'f.alsayed@unsw.edu.au', true, true, ['machine learning', 'fairness'], ['Machine Learning', 'Artificial Intelligence'], [{ title: 'Fairness Constraints in Ranking', venue: 'FAccT', year: 2024 }]],
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

  // ---- Reset the catalog so re-seeding always yields the full, current set ----
  console.log('🧹 Resetting catalog (scholarships, professors, universities, cities)...');
  await prisma.scholarship.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.university.deleteMany(); // cascades departments + programs
  await prisma.city.deleteMany();

  // City cache so we upsert each (name, country) once.
  const cityCache = new Map<string, string>();
  async function cityId(name: string, countryId: string): Promise<string> {
    const key = `${countryId}:${name}`;
    const cached = cityCache.get(key);
    if (cached) return cached;
    const city = await prisma.city.upsert({
      where: { name_countryId: { name, countryId } },
      create: { name, countryId },
      update: {},
    });
    cityCache.set(key, city.id);
    return city.id;
  }

  console.log(`🌱 Seeding ${U.length} universities...`);
  for (let i = 0; i < U.length; i++) {
    const [name, code, city, qsRanking, tuitionFeeUsd] = U[i];
    const countryId = codeToId.get(code)!;
    const cid = await cityId(city, countryId);
    const ielts = qsRanking <= 25 ? 7.0 : 6.5;
    const p1 = PROGRAM_POOL[i % PROGRAM_POOL.length];
    const p2 = PROGRAM_POOL[(i + 3) % PROGRAM_POOL.length];
    const a1 = RESEARCH_AREAS[i % RESEARCH_AREAS.length];
    const a2 = RESEARCH_AREAS[(i + 4) % RESEARCH_AREAS.length];

    await prisma.university.create({
      data: {
        name,
        countryId,
        cityId: cid,
        qsRanking,
        tuitionFeeUsd,
        acceptanceRate: Math.max(4, Math.min(65, Math.round(qsRanking / 5 + 8))),
        applicationFeeUsd: tuitionFeeUsd === 0 ? 75 : 100,
        website: null,
        researchAreas: {
          connectOrCreate: [a1, a2].map((n) => ({ where: { name: n }, create: { name: n } })),
        },
        departments: {
          create: [
            {
              name: 'School of Computing',
              programs: {
                create: [p1, p2].map((pname) => ({
                  name: pname,
                  degree: 'MASTER' as DegreeLevel,
                  durationMonths: 24,
                  tuitionFeeUsd,
                  englishRequirement: { ielts },
                })),
              },
            },
          ],
        },
      },
    });
  }

  console.log(`🌱 Seeding ${S.length} scholarships...`);
  for (const [name, provider, code, uniName, fundingType, minCgpa, minIelts] of S) {
    const university = uniName
      ? await prisma.university.findFirst({ where: { name: uniName } })
      : null;
    await prisma.scholarship.create({
      data: {
        name,
        provider,
        countryId: codeToId.get(code)!,
        universityId: university?.id ?? null,
        fundingType,
        coverage:
          fundingType === 'FULLY_FUNDED'
            ? 'Full tuition + living stipend'
            : fundingType === 'TUITION_WAIVER'
              ? 'Full tuition waiver'
              : 'Partial tuition support',
        benefits:
          fundingType === 'FULLY_FUNDED'
            ? ['Tuition', 'Monthly stipend', 'Travel allowance', 'Health insurance']
            : ['Tuition support'],
        eligibility: {
          create: {
            minCgpa,
            minIelts,
            degreeLevels: ['MASTER', 'PHD'],
          },
        },
      },
    });
  }

  console.log(`🌱 Seeding ${P.length} professors...`);
  for (const [name, uniName, email, accepting, funding, keywords, areas, pubs] of P) {
    const uni = await prisma.university.findFirst({ where: { name: uniName } });
    if (!uni) continue;
    await prisma.professor.create({
      data: {
        name,
        universityId: uni.id,
        email,
        acceptingStudents: accepting,
        hasFunding: funding,
        keywords,
        researchAreas: {
          connectOrCreate: areas.map((n) => ({ where: { name: n }, create: { name: n } })),
        },
        publications: { create: pubs },
      },
    });
  }

  const [countries, cities, universities, programs, areas, scholarships, professors] =
    await Promise.all([
      prisma.country.count(),
      prisma.city.count(),
      prisma.university.count(),
      prisma.program.count(),
      prisma.researchArea.count(),
      prisma.scholarship.count(),
      prisma.professor.count(),
    ]);
  console.log(
    `✅ Seed done — countries=${countries}, cities=${cities}, universities=${universities}, programs=${programs}, researchAreas=${areas}, scholarships=${scholarships}, professors=${professors}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
