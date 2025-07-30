import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe,Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = process.env.PORT || 3002;
  // Log current working directory for debugging
  console.log('Current working directory:', process.cwd());
  console.log('Static assets path:', join(process.cwd(), 'Uploads'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      disableErrorMessages: false,
      skipMissingProperties: true,
      validationError: { target: false, value: false },
    }),
  );
  // Serve static files from the Uploads directory
  app.useStaticAssets(join(process.cwd(), 'Uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.setHeader('Content-Type', 'image/jpeg');
    },
  });

  // Enable CORS
  app.enableCors({
    origin: '*', // Update with frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Apply global validation pipe
  app.useGlobalPipes(new ValidationPipe());

 try {
    await app.listen(port, '0.0.0.0');
    logger.log(`Server running on port ${port}`);
    logger.log(`Local: http://localhost:${port}`);
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}
bootstrap();
