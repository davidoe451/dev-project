import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Interceptor & Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Enable CORS for Angular Frontend
  app.enableCors({
    origin: configService.get<string>('cors.origin') || 'http://localhost:4200',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Online Clothing Store API')
    .setDescription(
      'Enterprise RESTful API for Online Clothing Store platform supporting Customer and Admin flows.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your Bearer JWT token',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Health', 'System uptime & health verification')
    .addTag('Auth', 'Registration, login, and authentication tokens')
    .addTag('Users', 'User profile management and admin user accounts')
    .addTag('Products', 'Product catalog, search, filtering, and admin CRUD')
    .addTag('Cart', 'Shopping cart management and total calculation')
    .addTag('Orders', 'Checkout, order history, and admin order tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger API documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
