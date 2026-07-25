import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateScholarshipDto,
  QueryScholarshipDto,
  UpdateScholarshipDto,
  UpsertEligibilityDto,
} from './dto/scholarship.dto';
import { ScholarshipRepository } from './scholarship.repository';

@Injectable()
export class ScholarshipService {
  constructor(private readonly repo: ScholarshipRepository) {}

  list(query: QueryScholarshipDto) {
    return this.repo.findManyFiltered(query);
  }

  async getById(id: string) {
    const scholarship = await this.repo.findById(id);
    if (!scholarship) throw new NotFoundException('Scholarship not found');
    return scholarship;
  }

  async create(dto: CreateScholarshipDto) {
    const { countryId, universityId, ...rest } = dto;
    const data: Prisma.ScholarshipCreateInput = {
      ...rest,
      ...(countryId ? { country: { connect: { id: countryId } } } : {}),
      ...(universityId ? { university: { connect: { id: universityId } } } : {}),
    };
    try {
      return await this.repo.create(data);
    } catch (e) {
      throw this.mapRelationError(e, 'Country or university not found');
    }
  }

  async update(id: string, dto: UpdateScholarshipDto) {
    const { countryId, universityId, ...rest } = dto;
    const data: Prisma.ScholarshipUpdateInput = { ...rest };
    if (countryId) data.country = { connect: { id: countryId } };
    if (universityId) data.university = { connect: { id: universityId } };
    return this.orThrow(this.repo.update(id, data), 'Scholarship');
  }

  remove(id: string) {
    return this.orThrow(this.repo.delete(id), 'Scholarship');
  }

  async upsertEligibility(scholarshipId: string, dto: UpsertEligibilityDto) {
    await this.getById(scholarshipId);
    return this.repo.upsertEligibility(
      scholarshipId,
      dto as Omit<Prisma.ScholarshipEligibilityCreateInput, 'scholarship'>,
    );
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
