// src/homework/homework.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { HomeworkService } from './homework.service';
import { HomeworkController } from './homework.controller';
import { Homework, HomeworkSchema } from './schemas/homework.schema';
import { HomeworkSubmission, HomeworkSubmissionSchema } from './schemas/homework-submission.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Teacher, TeacherSchema } from '../teachers/schemas/teacher.schema';
import { Subscription, SubscriptionSchema } from 'src/subscriptions/schemas/subscription.schema';
import { LessonsModule } from 'src/lessons/lessons.module';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users/users.module';
import { TeachersModule } from 'src/teachers/teachers.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Homework.name, schema: HomeworkSchema },
            { name: HomeworkSubmission.name, schema: HomeworkSubmissionSchema },
            { name: Lesson.name, schema: LessonSchema },
            { name: Course.name, schema: CourseSchema },
            { name: User.name, schema: UserSchema },
            { name: Teacher.name, schema: TeacherSchema },
            { name: Subscription.name, schema: SubscriptionSchema }
        ]),
        // Настройка Multer для загрузки файлов
        MulterModule.register({
            dest: './temp', // Временная папка
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
                files: 10, // Максимум 10 файлов за раз
            },
        }),
        // Избегаем циклических зависимостей
        forwardRef(() => LessonsModule),
        forwardRef(() => CoursesModule),
        forwardRef(() => UsersModule),
        forwardRef(() => TeachersModule)
    ],
    controllers: [HomeworkController],
    providers: [HomeworkService],
    exports: [HomeworkService],
})
export class HomeworkModule { }

/**
 * Объяснение модуля домашних заданий:
 * 
 * 1. **ОСНОВНЫЕ СХЕМЫ:**
 *    - Homework - схема домашних заданий
 *    - HomeworkSubmission - схема отправленных работ студентов
 * 
 * 2. **СВЯЗАННЫЕ СХЕМЫ:**
 *    - Lesson - для привязки заданий к урокам
 *    - Course - для получения информации о курсе
 *    - User - для работы со студентами
 *    - Teacher - для работы с преподавателями
 * 
 * 3. **MULTER КОНФИГУРАЦИЯ:**
 *    - Поддержка загрузки ZIP файлов
 *    - Лимит размера файла: 50MB
 *    - Максимум 10 файлов за один запрос
 * 
 * 4. **ОСНОВНОЙ ФУНКЦИОНАЛ:**
 *    - Создание домашних заданий преподавателями
 *    - Отправка выполненных работ студентами
 *    - Проверка и оценивание работ преподавателями
 *    - Скачивание файлов заданий и отправок
 *    - Статистика по заданиям
 * 
 * 5. **ФАЙЛОВАЯ СИСТЕМА:**
 *    - ZIP файлы хранятся как Base64 в MongoDB
 *    - Поддержка множественных файлов для каждого задания
 *    - Контроль размера и типа файлов
 * 
 * Использование модуля:
 * - Преподаватели создают задания для уроков
 * - Студенты отправляют выполненные работы
 * - Преподаватели проверяют и оценивают работы
 * - Система отслеживает прогресс и статистику
 */