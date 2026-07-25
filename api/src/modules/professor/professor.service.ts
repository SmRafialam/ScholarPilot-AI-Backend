import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateProfessorDto,
  CreatePublicationDto,
  QueryProfessorDto,
  UpdateProfessorDto,
} from './dto/professor.dto';
import { ProfessorRepository } from './professor.repository';

@Injectable()
export class ProfessorService {
  constructor(private readonly repo: ProfessorRepository) {}

  list(query: QueryProfessorDto) {
    return this.repo.findManyFiltered(query);
  }

  async getById(id: string) {
    const professor = await this.repo.findById(id);
    if (!professor) throw new NotFoundException('Professor not found');
    return professor;
  }

  async create(dto: CreateProfessorDto) {
    const { universityId, departmentId, ...rest } = dto;
    const data: Prisma.ProfessorCreateInput = {
      ...rest,
      university: { connect: { id: universityId } },
      ...(departmentId ? { department: { connect: { id: departmentId } } } : {}),
    };
    try {
      return await this.repo.create(data);
    } catch (e) {
      throw this.mapRelationError(e, 'University or department not found');
    }
  }

  async update(id: string, dto: UpdateProfessorDto) {
    const { universityId, departmentId, ...rest } = dto;
    const data: Prisma.ProfessorUpdateInput = { ...rest };
    if (universityId) data.university = { connect: { id: universityId } };
    if (departmentId) data.department = { connect: { id: departmentId } };
    return this.orThrow(this.repo.update(id, data), 'Professor');
  }

  remove(id: string) {
    return this.orThrow(this.repo.delete(id), 'Professor');
  }

  async addPublication(professorId: string, dto: CreatePublicationDto) {
    await this.getById(professorId);
    return this.repo.addPublication(professorId, dto);
  }

  async removePublication(professorId: string, id: string) {
    const res = await this.repo.deletePublication(professorId, id);
    if (res.count === 0) throw new NotFoundException('Publication not found');
    return { success: true };
  }

  async setResearchAreas(professorId: string, areas: string[]) {
    await this.getById(professorId);
    return this.repo.setResearchAreas(professorId, areas);
  }

  private async orThrow<T>(p: Promise<T>, entity: string): Promise<T> {
    try {
      return await p;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`${entity} not found`);
      }
      throw e;
    }
  }

  private mapRelationError(e: unknown, message: string) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === 'P2025' || e.code === 'P2003')
    ) {
      return new BadRequestException(message);
    }
    return e as Error;
  }
}
