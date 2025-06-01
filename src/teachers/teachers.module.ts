// src/teachers/teachers.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher, TeacherSchema } from './schemas/teacher.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Teacher.name, schema: TeacherSchema },
            { name: Course.name, schema: CourseSchema }
        ]),
        EmailModule,
        // forwardRef(() => CoursesModule) // Добавим когда создадим CoursesModule
    ],
    controllers: [TeachersController],
    providers: [TeachersService],
    exports: [TeachersService], // Экспортируем сервис для использования в других модулях
})
export class TeachersModule { }

/**
 * Объяснение модуля преподавателей:
 * 
 * 1. **MongooseModule.forFeature()** - регистрируем схемы Teacher и Course
 *    - Teacher - основная схема для работы с преподавателями
 *    - Course - нужна для назначения курсов преподавателям
 * 
 * 2. **EmailModule** - импортируем для отправки уведомлений:
 *    - Подтверждение email при регистрации
 *    - Уведомления об одобрении/отклонении заявок
 *    - Уведомления о блокировке/разблокировке
 * 
 * 3. **forwardRef()** - используется для предотвращения циклических зависимостей
 *    между модулями преподавателей и курсов
 * 
 * 4. **exports** - экспортируем TeachersService чтобы другие модули могли
 *    использовать функциональность работы с преподавателями
 * 
 * Использование модуля:
 * - Создание заявок на регистрацию преподавателей
 * - Одобрение/отклонение заявок администраторами  
 * - CRUD операции с профилями преподавателей
 * - Назначение и удаление курсов у преподавателей
 * - Получение статистики и аналитики
 */