// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { RolesModule } from './roles/roles.module';
import { AvatarsController } from './avatars/avatars.controller';
import { AvatarsModule } from './avatars/avatars.module';
import { TeachersModule } from './teachers/teachers.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CategoriesModule } from './categories/categories.module';
import { DifficultyLevelsModule } from './difficulty-levels/difficulty-levels.module';
import configuration from './config/configuration';
import { HomeworkModule } from './homework/homework.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { SubscriptionPlansModule } from './subscription-plans/subscription-plans.module';

@Module({
  imports: [
    // Подключаем конфигурацию из файла configuration.ts
    ConfigModule.forRoot({
      load: [configuration], // Загружаем нашу конфигурацию
      isGlobal: true,
    }),

    // Подключение к MongoDB через ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('database.uri');

        console.log('🔗 Подключение к MongoDB...');
        console.log('📍 URI:', mongoUri ? 'Найден' : 'Не найден, используется fallback');

        return {
          uri: mongoUri,
          // Дополнительные опции подключения
          retryWrites: true,
          w: 'majority',
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('✅ MongoDB успешно подключена');
              console.log(`📦 База данных: ${connection.db?.databaseName || 'неизвестно'}`);
            });

            connection.on('error', (error) => {
              console.error('❌ Ошибка подключения к MongoDB:', error.message);
            });

            connection.on('disconnected', () => {
              console.log('⚠️ MongoDB отключена');
            });

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),

    RolesModule, // Важно: сначала RolesModule
    UsersModule, // Затем UsersModule
    EmailModule,
    AuthModule,
    AvatarsModule,
    TeachersModule, // Модуль преподавателей
    CategoriesModule, // Модуль категорий курсов
    DifficultyLevelsModule, // Модуль уровней сложности
    CoursesModule,  // Модуль курсов
    LessonsModule,  // Модуль уроков
    HomeworkModule, // Модуль домашних заданий
    SubscriptionsModule, // Модуль подписок
    SubscriptionPlansModule,
    PaymentModule, // Добавить этот модуль
  ],
  controllers: [AppController, AvatarsController],
  providers: [AppService],
})
export class AppModule { }

/**
 * Объяснение работы с переменными окружения:
 * 
 * 1. **Локальная разработка:**
 *    - Переменные берутся из .env файла
 *    - Fallback: 'mongodb://localhost:27017/auth-api'
 * 
 * 2. **Production (GitHub Secrets):**
 *    - ConfigService автоматически получает MONGODB_URI из process.env
 *    - process.env заполняется из GitHub Secrets при деплое
 *    - Значение: mongodb+srv://troyant64:msfA0CqyZhkdF5NH@cluster0.icbj0hf.mongodb.net/
 * 
 * 3. **Как работает:**
 *    - GitHub Actions устанавливает переменные в process.env
 *    - ConfigService читает из process.env.MONGODB_URI
 *    - configuration.ts возвращает правильное значение
 *    - MongooseModule получает URI через ConfigService
 * 
 * 4. **Логирование:**
 *    - Показывает найден ли URI (без раскрытия значения)
 *    - Логирует успешное подключение
 *    - Отслеживает ошибки подключения
 */