import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryScholarshipDto } from './dto/scholarship.dto';

@Injectable()
export class ScholarshipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyFiltered(query: QueryScholarshipDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ScholarshipWhereInput = {};
    if (query.q) where.name = { contains: query.q, mode: 'insensitive' };
    if (query.country) where.country = { code: query.country.toUpperCase() };
    if (query.fundingType) where.fundingType = query.fundingType;
    if (query.deadlineBefore) where.deadline = { lte: query.deadlineBefore };

    const orderBy: Prisma.ScholarshipOrderByWithRelationInput =
      query.sort === 'name'
        ? { name: 'asc' }
        : { deadline: { sort: 'asc', nulls: 'last' } };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.scholarship.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { country: true, university: true },
      }),
      this.prisma.scholarship.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.scholarship.findUnique({
      where: { id },
      include: { country: true, university: true, eligibility: true, requirements: true },
    });
  }

  create(data: Prisma.ScholarshipCreateInput) {
    return this.prisma.scholarship.create({ data });
  }
  update(id: string, data: Prisma.ScholarshipUpdateInput) {
    return this.prisma.scholarship.update({ where: { id }, data });
  }
  delete(id: string) {
    return this.prisma.scholarship.delete({ where: { id } });
  }

  upsertEligibility(
    scholarshipId: string,
    data: Omit<Prisma.ScholarshipEligibilityCreateInput, 'scholarship'>,
  ) {
    return this.prisma.scholarshipEligibility.upsert({
      where: { scholarshipId },
      create: { ...data, scholarship: { connect: { id: scholarshipId } } },
      update: data,
    });
  }
}
