// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const swaggerReservePath = 'api/docs';
  // Получаем конфигурацию с проверкой на undefined и fallback значениями
  const port = configService.get<number>('port') || 8000;
  const host = configService.get<string>('host') || '0.0.0.0';
  const allowedOrigins = configService.get<string[]>('app.allowedOrigins') || ['*'] //[
  //   'http://localhost:3000',
  //   'http://localhost:8000',
  //   'https://neuronest.pp.ua'
  // ];
  const globalPrefix = configService.get<string>('app.globalPrefix') || 'api';
  const appUrl = configService.get<string>('app.url') || (process.env.APP_URL || 'https://neuronest.pp.ua');

  // Устанавливаем глобальный префикс для API
  app.setGlobalPrefix(globalPrefix);

  // 🌍 НАСТРОЙКА CORS - РАЗРЕШИТЬ ВСЕ ДОМЕНЫ
  app.enableCors({
    origin: true, // ✅ Разрешает запросы с ЛЮБЫХ доменов
    credentials: true, // Разрешает cookies и авторизацию
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Origin',
      'X-Forwarded-For',
      'X-Real-IP'
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });
  console.log('🌍 CORS: ✅ РАЗРЕШЕНЫ ВСЕ ДОМЕНЫ (origin: true)');


  // Настройка валидации
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
    }),
  );

  // Настройка Swagger только если включен
  const swaggerEnabled = configService.get<boolean>('swagger.enabled') !== false;
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('swagger.title') || 'Auth API')
      .setDescription(configService.get<string>('swagger.description') || 'API Documentation')
      .setVersion(configService.get<string>('swagger.version') || '1.0')
      .addTag('auth')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      })
      // Добавляем сервера для разных окружений
      // .addServer('http://localhost:8000', 'Local development')
      .addServer(appUrl, 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath = configService.get<string>('swagger.path') || swaggerReservePath;

    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        filter: true,
        displayRequestDuration: true,
      },
      customSiteTitle: 'Auth API Documentation',
    });

    console.log(`📚 Swagger UI доступен по адресу: ${appUrl}/${swaggerPath}`);
  }

  // Увеличиваем лимит для загрузки файлов
  app.use('/avatars', (req, res, next) => {
    req.setTimeout(30000); // 30 секунд на загрузку
    next();
  });

  // Middleware для логирования запросов в development
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
      next();
    });
  }

  // Запуск сервера
  await app.listen(port, host);

  console.log(`🚀 Приложение запущено на: ${await app.getUrl()}`);
  console.log(`🌍 API доступен по адресу: ${appUrl}/${globalPrefix}`);
  console.log(`📚 Swagger UI доступен по адресу: ${appUrl}/${swaggerReservePath}`);
  console.log(`🔧 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Разрешенные домены CORS: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch((error) => {
  console.error('❌ Ошибка запуска приложения:', error);
  process.exit(1);
});