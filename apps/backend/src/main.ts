import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.BACKEND_CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CostBase API')
      .setDescription('Plataforma de Inteligência Histórica de Custos')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger: http://localhost:' + (config.get('BACKEND_PORT') || 3001) + '/api/docs');
  }

  const port = config.get<number>('BACKEND_PORT', 3001);
  await app.listen(port);
  logger.log(`CostBase API rodando em http://localhost:${port}/api`);
}

bootstrap();
