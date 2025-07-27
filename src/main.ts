import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SecretsConfig } from './config/secrets.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Загружаем секреты перед созданием приложения
    logger.log('🔐 Загрузка секретов...');
    const secrets = SecretsConfig.getAllSecrets();

    // Логируем замаскированную информацию
    logger.log('🏁 Конфигурация приложения:');
    logger.log(`📊 NODE_ENV: ${secrets.nodeEnv}`);
    logger.log(`🌐 PORT: ${secrets.port}`);
    logger.log(`🗄️  MongoDB URI: ${secrets.mongodbUri.replace(/:([^:@]+)@/, ':***@')}`);
    logger.log(`🔑 JWT Secret: ${SecretsConfig.maskSensitiveData(secrets.jwtSecret)}`);
    logger.log(`📧 Email Host: ${secrets.emailHost}:${secrets.emailPort}`);

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

    // Настройка Swagger только для development
    if (secrets.nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('NestJS Backend API')
        .setDescription('API документация для NestJS приложения')
        .setVersion('1.0')
        .addTag('auth')
        .addBearerAuth()// Добавляем поддержку Bearer токена для Swagger
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });

      logger.log(`📚 Swagger доступен по адресу: http://localhost:${secrets.port}/api`);
    }

    // Включение CORS
    app.enableCors({
      origin: process.env.CORS_ORIGINS?.split(',') || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('🛑 SIGTERM получен, завершаем приложение...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('🛑 SIGINT получен, завершаем приложение...');
      await app.close();
      process.exit(0);
    });
    // Запуск сервера
    await app.listen(secrets.port);
    logger.log(`🚀 Приложение запущено на порту ${secrets.port}`);
    logger.log(`🌍 Приложение доступно по адресу: ${secrets.appUrl}`);

  } catch (error) {
    logger.error('❌ Ошибка запуска приложения:', error);
    process.exit(1);
  }
}

bootstrap();