import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryUniversityDto } from './dto/university.dto';

@Injectable()
export class UniversityRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------- University -------------------------

  async findManyFiltered(query: QueryUniversityDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.UniversityWhereInput = {};
    if (query.q) where.name = { contains: query.q, mode: 'insensitive' };
    if (query.country) where.country = { code: query.country.toUpperCase() };
    if (query.city) where.city = { name: query.city };
    if (query.maxRanking) where.qsRanking = { lte: query.maxRanking };

    const orderBy: Prisma.UniversityOrderByWithRelationInput =
      query.sort === 'name'
        ? { name: 'asc' }
        : { qsRanking: { sort: 'asc', nulls: 'last' } };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.university.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { country: true, city: true },
      }),
      this.prisma.university.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.university.findUnique({
      where: { id },
      include: {
        country: true,
        city: true,
        departments: { include: { programs: true } },
        researchAreas: true,
      },
    });
  }

  /** Distinct city names, optionally scoped to a country code. */
  async listCities(countryCode?: string): Promise<string[]> {
    const rows = await this.prisma.city.findMany({
      where: countryCode ? { country: { code: countryCode.toUpperCase() } } : {},
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => r.name);
  }

  createUniversity(data: Prisma.UniversityCreateInput) {
    return this.prisma.university.create({ data });
  }
  updateUniversity(id: string, data: Prisma.UniversityUpdateInput) {
    return this.prisma.university.update({ where: { id }, data });
  }
  deleteUniversity(id: string) {
    return this.prisma.university.delete({ where: { id } });
  }

  // ------------------------- Department -------------------------

  createDepartment(universityId: string, name: string) {
    return this.prisma.department.create({ data: { universityId, name } });
  }
  updateDepartment(id: string, data: Prisma.DepartmentUpdateInput) {
    return this.prisma.department.update({ where: { id }, data });
  }
  deleteDepartment(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
  findDepartment(id: string) {
    return this.prisma.department.findUnique({ where: { id } });
  }

  // ------------------------- Program -------------------------

  createProgram(departmentId: string, data: Omit<Prisma.ProgramCreateInput, 'department'>) {
    return this.prisma.program.create({
      data: { ...data, department: { connect: { id: departmentId } } },
    });
  }
  updateProgram(id: string, data: Prisma.ProgramUpdateInput) {
    return this.prisma.program.update({ where: { id }, data });
  }
  deleteProgram(id: string) {
    return this.prisma.program.delete({ where: { id } });
  }
  findProgram(id: string) {
    return this.prisma.program.findUnique({
      where: { id },
      include: { department: { include: { university: true } } },
    });
  }
  findProgramsByUniversity(universityId: string) {
    return this.prisma.program.findMany({
      where: { department: { universityId } },
      include: { department: true },
    });
  }

  // ------------------------- Research area -------------------------

  listResearchAreas() {
    return this.prisma.researchArea.findMany({ orderBy: { name: 'asc' } });
  }
  createResearchArea(name: string) {
    return this.prisma.researchArea.create({ data: { name } });
  }
  deleteResearchArea(id: string) {
    return this.prisma.researchArea.delete({ where: { id } });
  }
}
