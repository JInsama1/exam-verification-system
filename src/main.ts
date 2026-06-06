import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import * as compression from 'compression';

import {
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';

import {
  Reflector,
} from '@nestjs/core';

import { AppModule } from './app.module';



async function bootstrap() {

  const app =
    await NestFactory.create(AppModule);


  app.use(helmet());

  app.use(compression());


  const corsOrigins = (
    process.env.CORS_ORIGINS ??
    'http://localhost:3000,http://localhost:3001'
  ).split(',');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });


  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(
      app.get(Reflector),
    ),
  );


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  await app.listen(process.env.PORT ?? 3000);

}


bootstrap();
