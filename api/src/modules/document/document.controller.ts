import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @Post()
  generate(@CurrentUser() u: AuthUser, @Body() dto: CreateDocumentDto) {
    return this.service.generate(u.id, dto);
  }

  @Get()
  list(@CurrentUser() u: AuthUser) {
    return this.service.list(u.id);
  }

  @Get(':id')
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.get(u.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.service.update(u.id, id, dto);
  }

  @Post(':id/regenerate')
  regenerate(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.regenerate(u.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.remove(u.id, id);
  }
}
