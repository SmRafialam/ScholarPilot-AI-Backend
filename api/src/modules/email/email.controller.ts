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
import { CreateEmailDto, UpdateEmailDto } from './dto/email.dto';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly service: EmailService) {}

  @Post()
  generate(@CurrentUser() u: AuthUser, @Body() dto: CreateEmailDto) {
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
  update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateEmailDto) {
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
