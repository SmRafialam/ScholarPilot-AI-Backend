import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailRepository } from './email.repository';
import { EmailService } from './email.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService, EmailRepository],
  exports: [EmailService],
})
export class EmailModule {}
