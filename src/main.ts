// Главный файл (main.ts)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка валидации
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Education Platform API')
    .setDescription('API для образовательной платформы')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('teachers')
    .addTag('courses')
    .addTag('lessons')
    .addTag('subscriptions')
    .addTag('categories')
    .addTag('difficulty-levels')
    .addTag('avatars')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Настройка CORS для продакшена
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-HTTP-Method-Override'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  });

  // Увеличиваем лимит для загрузки файлов
  app.use('/avatars', (req, res, next) => {
    req.setTimeout(30000);
    next();
  });

  // Запуск сервера
  await app.listen(process.env.PORT || 8000);
  console.log(`🚀 Приложение запущено на порту: ${process.env.PORT || 8000}`);
  console.log(`📚 Swagger UI доступен по адресу: ${process.env.APP_URL}/api`);
}

bootstrap();