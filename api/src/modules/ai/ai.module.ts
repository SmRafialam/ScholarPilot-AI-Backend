import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpenAiProvider } from './providers/openai.provider';

/** Global so any feature module can inject the AI gateway. */
@Global()
@Module({
  providers: [AiService, OpenAiProvider],
  exports: [AiService],
})
export class AiModule {}
