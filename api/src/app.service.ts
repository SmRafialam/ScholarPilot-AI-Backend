import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'ScholarPilot AI API',
      version: '1.0.0',
      status: 'running',
      health: '/api/v1/health',
    };
  }
}
