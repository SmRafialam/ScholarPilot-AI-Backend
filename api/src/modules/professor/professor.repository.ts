import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryProfessorDto } from './dto/professor.dto';

@Injectable()
export class ProfessorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyFiltered(query: QueryProfessorDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ProfessorWhereInput = {};
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { keywords: { has: query.q } },
      ];
    }
    if (query.universityId) where.universityId = query.universityId;
    if (query.acceptingStudents !== undefined) {
      where.acceptingStudents = query.acceptingStudents;
    }
    if (query.researchArea) {
      where.researchAreas = { some: { name: query.researchArea } };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.professor.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { university: true, researchAreas: true },
      }),
      this.prisma.professor.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.professor.findUnique({
      where: { id },
      include: {
        university: true,
        department: true,
        publications: { orderBy: { year: 'desc' } },
        researchAreas: true,
      },
    });
  }

  create(data: Prisma.ProfessorCreateInput) {
    return this.prisma.professor.create({ data });
  }
  update(id: string, data: Prisma.ProfessorUpdateInput) {
    return this.prisma.professor.update({ where: { id }, data });
  }
  delete(id: string) {
    return this.prisma.professor.delete({ where: { id } });
  }

  addPublication(
    professorId: string,
    data: Omit<Prisma.ProfessorPublicationCreateInput, 'professor'>,
  ) {
    return this.prisma.professorPublication.create({
      data: { ...data, professor: { connect: { id: professorId } } },
    });
  }
  deletePublication(professorId: string, id: string) {
    return this.prisma.professorPublication.deleteMany({
      where: { id, professorId },
    });
  }

  setResearchAreas(professorId: string, names: string[]) {
    return this.prisma.professor.update({
      where: { id: professorId },
      data: {
        researchAreas: {
          set: [],
          connectOrCreate: names.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { researchAreas: true },
    });
  }
}
