import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Read cookies from incoming requests (req.cookies.access_token)
  app.use(cookieParser());

  // Reject extra fields and convert types automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow the frontend to call the backend with cookies.
  // FRONTEND_ORIGIN is set in production (e.g. https://my-app.vercel.app);
  // it falls back to localhost:3001 for local dev.
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3001',
    credentials: true,
  });

  // Railway / Heroku / etc. inject the PORT env var.
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
bootstrap();
