import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SignInResDto, SignUpResDto } from './auth/dto/res.dto';
import { User } from './schema/user/user';
import { PageResDto } from './user/dto/res.dto';
import { PageReqDto } from './user/dto/req.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Lumir-Web-Gis API')
    .setDescription('Lumir-Web-Gis API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const options = {
    extraModels: [SignInResDto, SignUpResDto, User, PageResDto, PageReqDto],
  };

  const swaggerOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document, swaggerOptions);

  await app.listen(4000);
}
bootstrap();
