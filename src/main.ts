// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SecretsConfig } from './config/secrets.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Загружаем секреты
    logger.log('🔐 Загрузка конфигурации...');
    const secrets = SecretsConfig.getAllSecrets();

    // Создаем приложение
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

    // Swagger только для development
    if (secrets.nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('NestJS Backend API')
        .setDescription('API документация')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });

      logger.log(`📚 Swagger доступен по адресу: http://localhost:${secrets.port}/api#`);
    }

    // CORS
    app.enableCors({
      origin: secrets.corsOrigins.split(','),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('🛑 SIGTERM получен, завершаем работу...');
      await app.close();
      process.exit(0);
    });

    // Запуск
    await app.listen(secrets.port);
    logger.log(`🚀 Приложение запущено на порту ${secrets.port}`);
    logger.log(`🌍 URL: ${secrets.appUrl}`);

  } catch (error) {
    logger.error('❌ Ошибка запуска:', error);
    process.exit(1);
  }
}

bootstrap();