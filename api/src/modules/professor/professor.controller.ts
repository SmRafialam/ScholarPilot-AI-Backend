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
  CreateProfessorDto,
  CreatePublicationDto,
  QueryProfessorDto,
  SetResearchAreasDto,
  UpdateProfessorDto,
} from './dto/professor.dto';
import { ProfessorService } from './professor.service';

@Controller()
export class ProfessorController {
  constructor(private readonly service: ProfessorService) {}

  @Get('professors')
  list(@Query() query: QueryProfessorDto) {
    return this.service.list(query);
  }

  @Get('professors/:id')
  getOne(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('professors')
  create(@Body() dto: CreateProfessorDto) {
    return this.service.create(dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('professors/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProfessorDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('professors/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('professors/:id/publications')
  addPublication(@Param('id') id: string, @Body() dto: CreatePublicationDto) {
    return this.service.addPublication(id, dto);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('professors/:id/publications/:pubId')
  removePublication(@Param('id') id: string, @Param('pubId') pubId: string) {
    return this.service.removePublication(id, pubId);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('professors/:id/research-areas')
  setResearchAreas(@Param('id') id: string, @Body() dto: SetResearchAreasDto) {
    return this.service.setResearchAreas(id, dto.areas);
  }
}
