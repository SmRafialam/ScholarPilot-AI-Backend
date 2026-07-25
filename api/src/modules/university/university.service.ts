import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateDepartmentDto,
  CreateProgramDto,
  UpdateDepartmentDto,
  UpdateProgramDto,
} from './dto/catalog.dto';
import {
  CreateUniversityDto,
  QueryUniversityDto,
  UpdateUniversityDto,
} from './dto/university.dto';
import { UniversityRepository } from './university.repository';

@Injectable()
export class UniversityService {
  constructor(private readonly repo: UniversityRepository) {}

  // ------------------------- University -------------------------

  list(query: QueryUniversityDto) {
    return this.repo.findManyFiltered(query);
  }

  async getById(id: string) {
    const university = await this.repo.findById(id);
    if (!university) throw new NotFoundException('University not found');
    return university;
  }

  async create(dto: CreateUniversityDto) {
    const { countryId, cityId, ...rest } = dto;
    const data: Prisma.UniversityCreateInput = {
      ...rest,
      country: { connect: { id: countryId } },
      ...(cityId ? { city: { connect: { id: cityId } } } : {}),
    };
    try {
      return await this.repo.createUniversity(data);
    } catch (e) {
      throw this.mapRelationError(e, 'Country or city not found');
    }
  }

  async update(id: string, dto: UpdateUniversityDto) {
    const { countryId, cityId, ...rest } = dto;
    const data: Prisma.UniversityUpdateInput = { ...rest };
    if (countryId) data.country = { connect: { id: countryId } };
    if (cityId) data.city = { connect: { id: cityId } };
    return this.orThrow(this.repo.updateUniversity(id, data), 'University');
  }

  remove(id: string) {
    return this.orThrow(this.repo.deleteUniversity(id), 'University');
  }

  // ------------------------- Department -------------------------

  async addDepartment(universityId: string, dto: CreateDepartmentDto) {
    await this.getById(universityId); // 404 if university missing
    return this.repo.createDepartment(universityId, dto.name);
  }

  updateDepartment(id: string, dto: UpdateDepartmentDto) {
    return this.orThrow(
      this.repo.updateDepartment(id, dto as Prisma.DepartmentUpdateInput),
      'Department',
    );
  }

  removeDepartment(id: string) {
    return this.orThrow(this.repo.deleteDepartment(id), 'Department');
  }

  // ------------------------- Program -------------------------

  async addProgram(departmentId: string, dto: CreateProgramDto) {
    const department = await this.repo.findDepartment(departmentId);
    if (!department) throw new NotFoundException('Department not found');
    return this.repo.createProgram(
      departmentId,
      dto as unknown as Prisma.ProgramCreateWithoutDepartmentInput,
    );
  }

  updateProgram(id: string, dto: UpdateProgramDto) {
    return this.orThrow(
      this.repo.updateProgram(
        id,
        dto as unknown as Prisma.ProgramUpdateInput,
      ),
      'Program',
    );
  }

  removeProgram(id: string) {
    return this.orThrow(this.repo.deleteProgram(id), 'Program');
  }

  async getProgram(id: string) {
    const program = await this.repo.findProgram(id);
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async getUniversityPrograms(universityId: string) {
    await this.getById(universityId);
    return this.repo.findProgramsByUniversity(universityId);
  }

  // ------------------------- Research areas -------------------------

  listResearchAreas() {
    return this.repo.listResearchAreas();
  }
  createResearchArea(name: string) {
    return this.repo.createResearchArea(name);
  }
  removeResearchArea(id: string) {
    return this.orThrow(this.repo.deleteResearchArea(id), 'Research area');
  }

  // ------------------------- Helpers -------------------------

  /** Maps Prisma "record not found" (P2025) to a 404 for a given entity. */
  private async orThrow<T>(p: Promise<T>, entity: string): Promise<T> {
    try {
      return await p;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
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
