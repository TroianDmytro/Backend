import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SecretsConfig } from './config/secrets.config';
//----------------------------------------------------
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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    MongooseModule.forRoot(SecretsConfig.getAllSecrets().mongodbUri, {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('✅ MongoDB успешно подключена');
        });
        connection.on('error', (error) => {
          console.error('❌ Ошибка подключения к MongoDB:', error);
        });
        return connection;
      },
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
    SubscriptionsModule // Модуль подписок
  ],
  controllers: [AvatarsController],
})
export class AppModule { }


/**
 * Cтруктуры модулей:
 *
 * 1. Базовые модули (в начале):
 *    - ConfigModule - глобальная конфигурация
 *    - MongooseModule - подключение к MongoDB
 *    - RolesModule - система ролей (базовая функциональность)
 *    - UsersModule - пользователи
 *    - EmailModule - отправка уведомлений
 *    - AuthModule - аутентификация и авторизация
 *    - AvatarsModule - аватары пользователей
 * 
 * 2. Образовательные модули:
 *    - TeachersModule - управление преподавателями
 *    - CoursesModule - управление курсами
 *    - LessonsModule - управление уроками
 *    - SubscriptionsModule - управление подписками
 * 
 * Порядок импорта важен для правильной инициализации зависимостей.
 * Например, TeachersModule должен быть загружен после RolesModule и UsersModule,
 * но до CoursesModule, так как курсы связаны с преподавателями.
 */
