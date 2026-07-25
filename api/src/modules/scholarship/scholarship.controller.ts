import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateScholarshipDto,
  QueryScholarshipDto,
  UpdateScholarshipDto,
  UpsertEligibilityDto,
} from './dto/scholarship.dto';
import { ScholarshipService } from './scholarship.service';

@Controller('scholarships')
export class ScholarshipController {
  constructor(private readonly service: ScholarshipService) {}

  @Get()
  list(@Query() query: QueryScholarshipDto) {
    return this.service.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateScholarshipDto) {
    return this.service.create(dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScholarshipDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id/eligibility')
  upsertEligibility(@Param('id') id: string, @Body() dto: UpsertEligibilityDto) {
    return this.service.upsertEligibility(id, dto);
  }
}
