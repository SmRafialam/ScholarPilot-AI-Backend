import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versioned API prefix
  app.setGlobalPrefix('api/v1');

  // Allow the frontend + admin dashboard to call the API in development
  app.enableCors({
    origin: [
      'http://localhost:3100', // student frontend
      'http://localhost:3200', // admin dashboard
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 ScholarPilot API running on http://localhost:${port}/api/v1`);
}
bootstrap();
