import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versioned API prefix
  app.setGlobalPrefix('api/v1');

  // Global input validation — strips unknown props, transforms payloads.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow the frontend + admin dashboard to call the API in development
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3100',
      process.env.ADMIN_URL ?? 'http://localhost:3200',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 ScholarPilot API running on http://localhost:${port}/api/v1`);
}
bootstrap();
