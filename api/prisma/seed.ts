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

/** Typical international master's tuition (USD/yr) by country. */
const TUITION: Record<string, number> = {
  US: 45000, GB: 32000, CA: 38000, DE: 0, AU: 33000, NL: 16000, CH: 1600,
  SE: 15000, FI: 14000, DK: 0, NO: 0, IE: 20000, FR: 5000, BE: 4000,
  IT: 3500, JP: 9000, KR: 11000, SG: 20000, NZ: 25000,
};

/** [name, countryCode, city, qsRanking] — tuition derived from country. */
const U: [string, string, string, number][] = [
  // ---------------- United States ----------------
  ['Massachusetts Institute of Technology', 'US', 'Cambridge', 1],
  ['Stanford University', 'US', 'Stanford', 5],
  ['Harvard University', 'US', 'Cambridge', 4],
  ['California Institute of Technology', 'US', 'Pasadena', 15],
  ['University of California, Berkeley', 'US', 'Berkeley', 12],
  ['Carnegie Mellon University', 'US', 'Pittsburgh', 52],
  ['University of California, Los Angeles', 'US', 'Los Angeles', 42],
  ['Princeton University', 'US', 'Princeton', 22],
  ['Yale University', 'US', 'New Haven', 23],
  ['Cornell University', 'US', 'Ithaca', 16],
  ['Columbia University', 'US', 'New York', 23],
  ['University of Michigan', 'US', 'Ann Arbor', 44],
  ['Georgia Institute of Technology', 'US', 'Atlanta', 84],
  ['University of Washington', 'US', 'Seattle', 63],
  ['University of Illinois Urbana-Champaign', 'US', 'Urbana', 64],
  ['University of Texas at Austin', 'US', 'Austin', 66],
  ['New York University', 'US', 'New York', 38],
  ['University of Chicago', 'US', 'Chicago', 21],
  ['Johns Hopkins University', 'US', 'Baltimore', 28],
  ['University of Pennsylvania', 'US', 'Philadelphia', 11],
  ['University of California, San Diego', 'US', 'San Diego', 72],
  ['University of Wisconsin-Madison', 'US', 'Madison', 89],
  ['Purdue University', 'US', 'West Lafayette', 99],
  ['University of Maryland', 'US', 'College Park', 156],
  ['University of Southern California', 'US', 'Los Angeles', 116],
  ['Boston University', 'US', 'Boston', 108],
  ['Northeastern University', 'US', 'Boston', 189],
  ['University of Massachusetts Amherst', 'US', 'Amherst', 262],
  ['Ohio State University', 'US', 'Columbus', 151],
  ['Pennsylvania State University', 'US', 'University Park', 105],
  ['University of Minnesota', 'US', 'Minneapolis', 185],
  ['University of California, Davis', 'US', 'Davis', 103],
  ['University of California, Irvine', 'US', 'Irvine', 205],
  ['Rutgers University', 'US', 'New Brunswick', 260],
  ['Texas A&M University', 'US', 'College Station', 154],
  // ---------------- United Kingdom ----------------
  ['University of Oxford', 'GB', 'Oxford', 3],
  ['University of Cambridge', 'GB', 'Cambridge', 2],
  ['Imperial College London', 'GB', 'London', 6],
  ['University College London', 'GB', 'London', 9],
  ['University of Edinburgh', 'GB', 'Edinburgh', 27],
  ["King's College London", 'GB', 'London', 40],
  ['University of Manchester', 'GB', 'Manchester', 34],
  ['University of Bristol', 'GB', 'Bristol', 54],
  ['University of Warwick', 'GB', 'Coventry', 69],
  ['University of Glasgow', 'GB', 'Glasgow', 76],
  ['University of Southampton', 'GB', 'Southampton', 80],
  ['University of Leeds', 'GB', 'Leeds', 82],
  ['University of Birmingham', 'GB', 'Birmingham', 84],
  ['University of Sheffield', 'GB', 'Sheffield', 105],
  ['University of Nottingham', 'GB', 'Nottingham', 108],
  ['University of Bath', 'GB', 'Bath', 150],
  ['Queen Mary University of London', 'GB', 'London', 145],
  ['Lancaster University', 'GB', 'Lancaster', 168],
  ['University of York', 'GB', 'York', 162],
  ['Newcastle University', 'GB', 'Newcastle', 129],
  ['University of Liverpool', 'GB', 'Liverpool', 176],
  ['Durham University', 'GB', 'Durham', 78],
  ['Cardiff University', 'GB', 'Cardiff', 165],
  ['University of Aberdeen', 'GB', 'Aberdeen', 236],
  ['University of Sussex', 'GB', 'Brighton', 218],
  // ---------------- Canada ----------------
  ['University of Toronto', 'CA', 'Toronto', 21],
  ['University of British Columbia', 'CA', 'Vancouver', 34],
  ['McGill University', 'CA', 'Montreal', 30],
  ['University of Waterloo', 'CA', 'Waterloo', 112],
  ['University of Alberta', 'CA', 'Edmonton', 111],
  ['McMaster University', 'CA', 'Hamilton', 176],
  ['University of Montreal', 'CA', 'Montreal', 141],
  ['Western University', 'CA', 'London', 114],
  ['University of Ottawa', 'CA', 'Ottawa', 189],
  ['University of Calgary', 'CA', 'Calgary', 182],
  ["Queen's University", 'CA', 'Kingston', 209],
  ['Simon Fraser University', 'CA', 'Burnaby', 318],
  ['University of Victoria', 'CA', 'Victoria', 334],
  ['Dalhousie University', 'CA', 'Halifax', 298],
  ['York University', 'CA', 'Toronto', 353],
  ['Concordia University', 'CA', 'Montreal', 415],
  ['University of Manitoba', 'CA', 'Winnipeg', 601],
  ['Carleton University', 'CA', 'Ottawa', 631],
  // ---------------- Germany ----------------
  ['Technical University of Munich', 'DE', 'Munich', 28],
  ['Ludwig Maximilian University of Munich', 'DE', 'Munich', 59],
  ['Heidelberg University', 'DE', 'Heidelberg', 87],
  ['RWTH Aachen University', 'DE', 'Aachen', 99],
  ['Technical University of Berlin', 'DE', 'Berlin', 154],
  ['Humboldt University of Berlin', 'DE', 'Berlin', 120],
  ['Karlsruhe Institute of Technology', 'DE', 'Karlsruhe', 119],
  ['Technical University of Darmstadt', 'DE', 'Darmstadt', 279],
  ['University of Freiburg', 'DE', 'Freiburg', 192],
  ['University of Stuttgart', 'DE', 'Stuttgart', 312],
  ['Free University of Berlin', 'DE', 'Berlin', 98],
  ['University of Tübingen', 'DE', 'Tübingen', 213],
  ['University of Bonn', 'DE', 'Bonn', 239],
  ['University of Göttingen', 'DE', 'Göttingen', 251],
  ['University of Hamburg', 'DE', 'Hamburg', 205],
  ['University of Cologne', 'DE', 'Cologne', 331],
  ['TU Dresden', 'DE', 'Dresden', 258],
  ['University of Mannheim', 'DE', 'Mannheim', 411],
  ['University of Erlangen-Nuremberg', 'DE', 'Erlangen', 315],
  ['Ulm University', 'DE', 'Ulm', 501],
  ['Technical University of Dortmund', 'DE', 'Dortmund', 611],
  ['Bielefeld University', 'DE', 'Bielefeld', 701],
  // ---------------- Australia ----------------
  ['University of Melbourne', 'AU', 'Melbourne', 14],
  ['University of Sydney', 'AU', 'Sydney', 18],
  ['Australian National University', 'AU', 'Canberra', 30],
  ['University of New South Wales', 'AU', 'Sydney', 19],
  ['University of Queensland', 'AU', 'Brisbane', 40],
  ['Monash University', 'AU', 'Melbourne', 37],
  ['University of Western Australia', 'AU', 'Perth', 77],
  ['University of Adelaide', 'AU', 'Adelaide', 82],
  ['University of Technology Sydney', 'AU', 'Sydney', 88],
  ['University of Wollongong', 'AU', 'Wollongong', 167],
  ['RMIT University', 'AU', 'Melbourne', 140],
  ['Macquarie University', 'AU', 'Sydney', 130],
  ['Queensland University of Technology', 'AU', 'Brisbane', 189],
  ['Curtin University', 'AU', 'Perth', 183],
  ['Deakin University', 'AU', 'Geelong', 233],
  ['University of Newcastle', 'AU', 'Newcastle', 173],
  ['Griffith University', 'AU', 'Gold Coast', 300],
  ['La Trobe University', 'AU', 'Melbourne', 242],
  // ---------------- Netherlands ----------------
  ['Delft University of Technology', 'NL', 'Delft', 47],
  ['University of Amsterdam', 'NL', 'Amsterdam', 53],
  ['Eindhoven University of Technology', 'NL', 'Eindhoven', 124],
  ['Utrecht University', 'NL', 'Utrecht', 107],
  ['Leiden University', 'NL', 'Leiden', 126],
  ['University of Groningen', 'NL', 'Groningen', 139],
  ['Wageningen University', 'NL', 'Wageningen', 124],
  ['Erasmus University Rotterdam', 'NL', 'Rotterdam', 176],
  ['VU Amsterdam', 'NL', 'Amsterdam', 220],
  ['University of Twente', 'NL', 'Enschede', 210],
  ['Radboud University', 'NL', 'Nijmegen', 226],
  ['Tilburg University', 'NL', 'Tilburg', 375],
  // ---------------- Switzerland ----------------
  ['ETH Zurich', 'CH', 'Zurich', 7],
  ['EPFL', 'CH', 'Lausanne', 26],
  ['University of Zurich', 'CH', 'Zurich', 91],
  ['University of Geneva', 'CH', 'Geneva', 161],
  ['University of Bern', 'CH', 'Bern', 156],
  ['University of Basel', 'CH', 'Basel', 136],
  ['University of Lausanne', 'CH', 'Lausanne', 210],
  // ---------------- Sweden ----------------
  ['KTH Royal Institute of Technology', 'SE', 'Stockholm', 73],
  ['Lund University', 'SE', 'Lund', 85],
  ['Chalmers University of Technology', 'SE', 'Gothenburg', 129],
  ['Uppsala University', 'SE', 'Uppsala', 105],
  ['Stockholm University', 'SE', 'Stockholm', 153],
  ['University of Gothenburg', 'SE', 'Gothenburg', 187],
  ['Linköping University', 'SE', 'Linköping', 268],
  ['Umeå University', 'SE', 'Umeå', 347],
  // ---------------- Finland ----------------
  ['Aalto University', 'FI', 'Espoo', 100],
  ['University of Helsinki', 'FI', 'Helsinki', 106],
  ['University of Oulu', 'FI', 'Oulu', 301],
  ['University of Turku', 'FI', 'Turku', 296],
  ['Tampere University', 'FI', 'Tampere', 361],
  ['University of Jyväskylä', 'FI', 'Jyväskylä', 350],
  // ---------------- Denmark ----------------
  ['Technical University of Denmark', 'DK', 'Kongens Lyngby', 121],
  ['University of Copenhagen', 'DK', 'Copenhagen', 100],
  ['Aarhus University', 'DK', 'Aarhus', 156],
  ['Aalborg University', 'DK', 'Aalborg', 273],
  ['University of Southern Denmark', 'DK', 'Odense', 340],
  // ---------------- Norway ----------------
  ['Norwegian University of Science and Technology', 'NO', 'Trondheim', 292],
  ['University of Oslo', 'NO', 'Oslo', 117],
  ['University of Bergen', 'NO', 'Bergen', 234],
  ['UiT Arctic University of Norway', 'NO', 'Tromsø', 448],
  // ---------------- Ireland ----------------
  ['Trinity College Dublin', 'IE', 'Dublin', 87],
  ['University College Dublin', 'IE', 'Dublin', 171],
  ['University of Galway', 'IE', 'Galway', 289],
  ['University College Cork', 'IE', 'Cork', 273],
  ['Dublin City University', 'IE', 'Dublin', 436],
  // ---------------- France ----------------
  ['Sorbonne University', 'FR', 'Paris', 59],
  ['PSL University', 'FR', 'Paris', 24],
  ['Institut Polytechnique de Paris', 'FR', 'Palaiseau', 38],
  ['University of Paris-Saclay', 'FR', 'Gif-sur-Yvette', 71],
  ['Grenoble Alpes University', 'FR', 'Grenoble', 294],
  ['University of Paris Cité', 'FR', 'Paris', 236],
  ['Aix-Marseille University', 'FR', 'Marseille', 381],
  ['INSA Lyon', 'FR', 'Lyon', 431],
  ['Sciences Po', 'FR', 'Paris', 319],
  ['University of Strasbourg', 'FR', 'Strasbourg', 421],
  // ---------------- Belgium ----------------
  ['KU Leuven', 'BE', 'Leuven', 61],
  ['Ghent University', 'BE', 'Ghent', 142],
  ['UCLouvain', 'BE', 'Louvain-la-Neuve', 191],
  ['University of Antwerp', 'BE', 'Antwerp', 232],
  ['Vrije Universiteit Brussel', 'BE', 'Brussels', 209],
  // ---------------- Italy ----------------
  ['Politecnico di Milano', 'IT', 'Milan', 123],
  ['University of Bologna', 'IT', 'Bologna', 133],
  ['Sapienza University of Rome', 'IT', 'Rome', 134],
  ['University of Padua', 'IT', 'Padua', 219],
  ['University of Milan', 'IT', 'Milan', 276],
  ['Politecnico di Torino', 'IT', 'Turin', 252],
  ['University of Pisa', 'IT', 'Pisa', 349],
  ['University of Naples Federico II', 'IT', 'Naples', 415],
  // ---------------- Japan ----------------
  ['University of Tokyo', 'JP', 'Tokyo', 28],
  ['Kyoto University', 'JP', 'Kyoto', 46],
  ['Tokyo Institute of Technology', 'JP', 'Tokyo', 91],
  ['Osaka University', 'JP', 'Osaka', 80],
  ['Tohoku University', 'JP', 'Sendai', 113],
  ['Nagoya University', 'JP', 'Nagoya', 176],
  ['Kyushu University', 'JP', 'Fukuoka', 164],
  ['Hokkaido University', 'JP', 'Sapporo', 196],
  // ---------------- South Korea ----------------
  ['Seoul National University', 'KR', 'Seoul', 41],
  ['KAIST', 'KR', 'Daejeon', 53],
  ['Yonsei University', 'KR', 'Seoul', 76],
  ['Korea University', 'KR', 'Seoul', 79],
  ['POSTECH', 'KR', 'Pohang', 98],
  ['Sungkyunkwan University', 'KR', 'Suwon', 123],
  // ---------------- Singapore ----------------
  ['National University of Singapore', 'SG', 'Singapore', 8],
  ['Nanyang Technological University', 'SG', 'Singapore', 15],
  // ---------------- New Zealand ----------------
  ['University of Auckland', 'NZ', 'Auckland', 65],
  ['University of Otago', 'NZ', 'Dunedin', 206],
  ['Victoria University of Wellington', 'NZ', 'Wellington', 241],
  ['University of Canterbury', 'NZ', 'Christchurch', 256],
  ['Massey University', 'NZ', 'Palmerston North', 239],
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

// Pools used to synthesize one professor per university (so every country has faculty).
const FIRST = ['Anna', 'Michael', 'Sarah', 'David', 'Elena', 'James', 'Yuki', 'Laura', 'Ahmed', 'Sophie', 'Marco', 'Hana', 'Daniel', 'Fatima', 'Ingrid', 'Kenji', 'Priya', 'Lars', 'Chloe', 'Robert', 'Olivia', 'Thomas', 'Maria', 'John', 'Wei', 'Ana', 'Peter', 'Linda', 'Omar', 'Nadia', 'Carlos', 'Emma', 'Raj', 'Sofia', 'Lucas', 'Mei', 'Ivan', 'Julia', 'Hassan', 'Klara'];
const LAST = ['Muller', 'Chen', 'Smith', 'Kim', 'Rossi', 'Wilson', 'Tanaka', 'Schmidt', 'Hassan', 'Martin', 'Brown', 'Park', 'Nielsen', 'Dubois', 'Larsson', 'Sato', 'Nair', 'Weber', 'Bennett', 'Bianchi', 'Garcia', 'Johnson', 'Wang', 'Silva', 'Novak', 'Andersson', 'Petrov', 'Kumar', 'Lopez', 'Costa', 'Nakamura', 'Meyer', 'Jensen', 'Ali', 'Fischer', 'Moreau', 'Ivanov', 'Yang', 'Reddy', 'Haddad'];
const VENUES = ['NeurIPS', 'ICML', 'CVPR', 'ACL', 'ICLR', 'KDD', 'AAAI', 'EMNLP', 'ICRA', 'SIGIR', 'CHI', 'MICCAI'];
const PUB_ADJ = ['Learning', 'Scalable', 'Robust', 'Efficient', 'Neural', 'Generative', 'Interpretable', 'Federated'];

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

  console.log('🧹 Resetting catalog (scholarships, professors, universities, cities)...');
  await prisma.scholarship.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.university.deleteMany(); // cascades departments + programs
  await prisma.city.deleteMany();

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

  console.log(`🌱 Seeding ${U.length} universities (+1 professor each)...`);
  for (let i = 0; i < U.length; i++) {
    const [name, code, city, qsRanking] = U[i];
    const countryId = codeToId.get(code)!;
    const cid = await cityId(city, countryId);
    const tuition = TUITION[code] ?? 15000;
    const ielts = qsRanking <= 25 ? 7.0 : 6.5;
    const p1 = PROGRAM_POOL[i % PROGRAM_POOL.length];
    const p2 = PROGRAM_POOL[(i + 3) % PROGRAM_POOL.length];
    const a1 = RESEARCH_AREAS[i % RESEARCH_AREAS.length];
    const a2 = RESEARCH_AREAS[(i + 4) % RESEARCH_AREAS.length];

    const created = await prisma.university.create({
      data: {
        name,
        countryId,
        cityId: cid,
        qsRanking,
        tuitionFeeUsd: tuition,
        acceptanceRate: Math.max(4, Math.min(70, Math.round(qsRanking / 6 + 8))),
        applicationFeeUsd: tuition === 0 ? 75 : 100,
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
                  tuitionFeeUsd: tuition,
                  englishRequirement: { ielts },
                })),
              },
            },
          ],
        },
      },
    });

    // One professor per university → faculty in every country/city.
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 3 + 7) % LAST.length];
    const pa1 = RESEARCH_AREAS[(i + 2) % RESEARCH_AREAS.length];
    const pa2 = RESEARCH_AREAS[(i + 6) % RESEARCH_AREAS.length];
    await prisma.professor.create({
      data: {
        name: `Prof. ${first} ${last}`,
        universityId: created.id,
        email: null,
        acceptingStudents: i % 3 !== 0,
        hasFunding: i % 2 === 0,
        keywords: [pa1.toLowerCase(), pa2.toLowerCase()],
        researchAreas: {
          connectOrCreate: [pa1, pa2].map((n) => ({ where: { name: n }, create: { name: n } })),
        },
        publications: {
          create: [
            {
              title: `${PUB_ADJ[i % PUB_ADJ.length]} Methods for ${pa1}`,
              venue: VENUES[i % VENUES.length],
              year: 2023 + (i % 2),
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
          create: { minCgpa, minIelts, degreeLevels: ['MASTER', 'PHD'] },
        },
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
