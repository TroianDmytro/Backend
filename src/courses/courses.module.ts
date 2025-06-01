// src/courses/courses.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { Teacher, TeacherSchema } from '../teachers/schemas/teacher.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { Subscription, SubscriptionSchema } from '../subscriptions/schemas/subscription.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Course.name, schema: CourseSchema },
            { name: Teacher.name, schema: TeacherSchema },
            { name: Lesson.name, schema: LessonSchema },
            { name: Subscription.name, schema: SubscriptionSchema }
        ]),
        // forwardRef(() => TeachersModule), // Добавим когда потребуется избежать циклической зависимости
        // forwardRef(() => LessonsModule),
        // forwardRef(() => SubscriptionsModule)
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService], // Экспортируем сервис для использования в других модулях
})
export class CoursesModule { }

/**
 * Объяснение модуля курсов:
 * 
 * 1. **MongooseModule.forFeature()** - регистрируем все необходимые схемы:
 *    - Course - основная схема курсов
 *    - Teacher - для связи с преподавателями
 *    - Lesson - для работы с уроками курса
 *    - Subscription - для управления подписками студентов
 * 
 * 2. **forwardRef()** - закомментированы, но готовы для использования
 *    при возникновении циклических зависимостей между модулями
 * 
 * 3. **exports** - экспортируем CoursesService для использования в:
 *    - TeachersModule (для назначения курсов преподавателям)
 *    - LessonsModule (для работы с уроками курса)
 *    - SubscriptionsModule (для создания подписок на курсы)
 * 
 * Функциональность модуля:
 * - Создание, редактирование и удаление курсов
 * - Управление публикацией курсов
 * - Назначение преподавателей курсам
 * - Запись студентов на курсы
 * - Получение статистики и аналитики
 * - Фильтрация и поиск курсов
 * - Дублирование курсов
 */