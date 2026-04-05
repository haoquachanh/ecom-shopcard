import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Nest's default Logger (colored) instead of custom Winston logger for now

  const helmet = require('helmet');
  const compression = require('compression');

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: appConfig.corsOrigin === '*' ? true : appConfig.corsOrigin.split(','),
    credentials: true,
  });

  setupSwagger(app);

  await app.listen(appConfig.port);
}

bootstrap();
