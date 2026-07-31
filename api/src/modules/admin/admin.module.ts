import { Module } from '@nestjs/common';
import { AdminBootstrapService } from './admin-bootstrap.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, AdminBootstrapService],
})
export class AdminModule {}
