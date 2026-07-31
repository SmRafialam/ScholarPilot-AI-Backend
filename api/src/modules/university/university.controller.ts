import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateDepartmentDto,
  CreateProgramDto,
  CreateResearchAreaDto,
  UpdateDepartmentDto,
  UpdateProgramDto,
} from './dto/catalog.dto';
import {
  CreateUniversityDto,
  QueryUniversityDto,
  UpdateUniversityDto,
} from './dto/university.dto';
import { UniversityService } from './university.service';

/** Reads are open to any authenticated user; writes are ADMIN-only. */
@Controller()
export class UniversityController {
  constructor(private readonly service: UniversityService) {}

  // ---- Universities ----
  @Get('universities')
  list(@Query() query: QueryUniversityDto) {
    return this.service.list(query);
  }

  /** Distinct city names for the filter dropdown, optionally scoped to ?country=XX. */
  @Get('cities')
  listCities(@Query('country') country?: string) {
    return this.service.listCities(country);
  }

  @Get('universities/:id')
  getOne(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get('universities/:id/programs')
  getPrograms(@Param('id') id: string) {
    return this.service.getUniversityPrograms(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('universities')
  create(@Body() dto: CreateUniversityDto) {
    return this.service.create(dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('universities/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUniversityDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('universities/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ---- Departments ----
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('universities/:id/departments')
  addDepartment(@Param('id') id: string, @Body() dto: CreateDepartmentDto) {
    return this.service.addDepartment(id, dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('departments/:id')
  updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.service.updateDepartment(id, dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('departments/:id')
  removeDepartment(@Param('id') id: string) {
    return this.service.removeDepartment(id);
  }

  // ---- Programs ----
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('departments/:id/programs')
  addProgram(@Param('id') id: string, @Body() dto: CreateProgramDto) {
    return this.service.addProgram(id, dto);
  }

  @Get('programs/:id')
  getProgram(@Param('id') id: string) {
    return this.service.getProgram(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('programs/:id')
  updateProgram(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.service.updateProgram(id, dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('programs/:id')
  removeProgram(@Param('id') id: string) {
    return this.service.removeProgram(id);
  }

  // ---- Research areas ----
  @Get('research-areas')
  listResearchAreas() {
    return this.service.listResearchAreas();
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('research-areas')
  createResearchArea(@Body() dto: CreateResearchAreaDto) {
    return this.service.createResearchArea(dto.name);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('research-areas/:id')
  removeResearchArea(@Param('id') id: string) {
    return this.service.removeResearchArea(id);
  }
}
