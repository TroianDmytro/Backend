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
      // Важно для работы с файлами
      skipMissingProperties: false,
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API \'Diplom\'')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth() // Добавляем поддержку Bearer токена для Swagger
    .build();

  // Создание документации
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Включение CORS
  app.enableCors();

  // Увеличиваем лимит для загрузки файлов
  app.use('/avatars', (req, res, next) => {
    req.setTimeout(30000); // 30 секунд на загрузку
    next();
  });

  // Запуск сервера
  await app.listen(process.env.PORT || 8001);
  console.log(`Приложение запущено на порту: ${process.env.PORT || 8001}`);
  console.log(`📚 Swagger UI доступен по адресу: http://localhost:${process.env.PORT}/api#`);
}

bootstrap();