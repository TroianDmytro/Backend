// src/categories/categories.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Category.name, schema: CategorySchema },
            { name: Course.name, schema: CourseSchema }
        ]),
        // forwardRef(() => CoursesModule) // Если нужно избежать циклических зависимостей
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule { }

/**
 * Объяснение модуля категорий:
 * 
 * 1. **MongooseModule.forFeature()** - регистрируем схемы:
 *    - Category - основная схема категорий
 *    - Course - для связи и подсчета статистики
 * 
 * 2. **exports** - экспортируем CategoriesService для использования в других модулях
 * 
 * 3. **forwardRef()** - готов для предотвращения циклических зависимостей
 * 
 * Функциональность:
 * - CRUD операции с категориями
 * - Иерархическая структура (родительские/дочерние категории)
 * - Получение курсов по категориям с разными уровнями детализации
 * - Обновление статистики (количество курсов, студентов)
 */