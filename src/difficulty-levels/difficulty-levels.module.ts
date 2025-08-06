// src/difficulty-levels/difficulty-levels.module.ts - ОБНОВЛЕННАЯ ВЕРСИЯ
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DifficultyLevelsService } from './difficulty-levels.service';
import { DifficultyLevelsController } from './difficulty-levels.controller';
import { DifficultyLevel, DifficultyLevelSchema } from './schemas/difficulty-level.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DifficultyLevel.name, schema: DifficultyLevelSchema },
            { name: Course.name, schema: CourseSchema }
        ]),
        forwardRef(() => CoursesModule) // Избегаем циклических зависимостей при необходимости
    ],
    controllers: [DifficultyLevelsController],
    providers: [DifficultyLevelsService],
    exports: [DifficultyLevelsService], // Экспортируем для использования в других модулях
})
export class DifficultyLevelsModule { }

/**
 * Объяснение модуля уровней сложности:
 *
 * 1. **MongooseModule.forFeature()** - регистрируем схемы:
 *    - DifficultyLevel - основная схема уровней сложности
 *    - Course - для связи и подсчета статистики курсов
 *
 * 2. **Контроллер и сервис:**
 *    - DifficultyLevelsController - REST API эндпоинты
 *    - DifficultyLevelsService - бизнес-логика
 *
 * 3. **exports** - экспортируем DifficultyLevelsService для использования в:
 *    - CoursesModule (для назначения уровней курсам)
 *    - Других модулях, которым нужна информация об уровнях
 *
 * 4. **forwardRef()** - готов для предотвращения циклических зависимостей
 *
 * Функциональность модуля:
 * - CRUD операции с уровнями сложности
 * - Автоматическая инициализация стандартных уровней при первом запуске
 * - Получение курсов по уровням сложности с разными уровнями детализации
 * - Обновление статистики (количество курсов, студентов, рейтинг)
 * - Поиск и фильтрация уровней
 * - Рекомендации уровня для новых курсов
 * - Административные функции управления
 */

// Дополнительно: Обновление главного модуля app.module.ts
/**
 * В файле src/app.module.ts убедитесь, что DifficultyLevelsModule импортирован:
 * 
 * imports: [
 *   // ... другие модули
 *   DifficultyLevelsModule, // Добавьте эту строку
 *   // ... остальные модули
 * ]
 * 
 * И добавьте импорт в начало файла:
 * import { DifficultyLevelsModule } from './difficulty-levels/difficulty-levels.module';
 */