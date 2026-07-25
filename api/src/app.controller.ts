import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getInfo() {
    return this.appService.getInfo();
  }

  @Public()
  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
