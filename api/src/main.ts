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

  // Allow the frontend + admin dashboard (local dev + deployed on Vercel).
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3100',
      process.env.ADMIN_URL ?? 'http://localhost:3200',
      'https://scholar-pilot-ai-flame.vercel.app',
      /\.vercel\.app$/, // Vercel preview deployments
    ],
    credentials: true,
  });

  // Bind to 0.0.0.0 and honor the platform PORT (Railway/Render/etc.).
  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`🚀 ScholarPilot API running on port ${port} (/api/v1)`);
}
bootstrap();
