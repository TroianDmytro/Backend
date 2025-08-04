// src/difficulty-levels/difficulty-levels.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DifficultyLevelsService } from './difficulty-levels.service';
import { DifficultyLevelsController } from './difficulty-levels.controller';
import { DifficultyLevel, DifficultyLevelSchema } from './schemas/difficulty-level.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Subscription, SubscriptionSchema } from '../subscriptions/schemas/subscription.schema';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DifficultyLevel.name, schema: DifficultyLevelSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Subscription.name, schema: SubscriptionSchema }
        ]),
        forwardRef(() => CoursesModule) // При необходимости избежать циклических зависимостей
    ],
    controllers: [DifficultyLevelsController],
    providers: [DifficultyLevelsService],
    exports: [DifficultyLevelsService],
})
export class DifficultyLevelsModule { }

/**
 * Объяснение модуля уровней сложности:
 * 
 * 1. **MongooseModule.forFeature()** - регистрируем схемы:
 *    - DifficultyLevel - основная схема уровней сложности
 *    - Course - для связи с курсами и статистики
 *    - Subscription - для расчета процента завершения курсов
 * 
 * 2. **exports** - экспортируем DifficultyLevelsService для других модулей
 * 
 * 3. **Автоинициализация** - сервис автоматически создает стандартные уровни:
 *    - Начальный (beginner)
 *    - Средний (intermediate) 
 *    - Продвинутый (advanced)
 * 
 * Функциональность:
 * - CRUD операции с уровнями сложности
 * - Получение курсов по уровням сложности
 * - Статистика по каждому уровню
 * - Валидация уникальности полей (slug, code, level)
 */