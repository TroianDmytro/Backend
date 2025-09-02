// src/lessons/lessons.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { HomeworkSubmission, HomeworkSubmissionSchema } from '../homework/schemas/homework-submission.schema';
import { Subject, SubjectSchema } from 'src/subjects/schemas/subject.schema';
import { Teacher, TeacherSchema } from 'src/teachers/schemas/teacher.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { CoursesModule } from 'src/courses/courses.module';
import { HomeworkModule } from 'src/homework/homework.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Lesson.name, schema: LessonSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Subject.name, schema: SubjectSchema }, // НОВОЕ
            { name: Teacher.name, schema: TeacherSchema },
            { name: User.name, schema: UserSchema }
        ]),
        forwardRef(() => SubjectsModule),
        forwardRef(() => CoursesModule), // Избегаем циклических зависимостей
        forwardRef(() => HomeworkModule)
    ],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService],
})
export class LessonsModule { }


/**
 * ИНСТРУКЦИИ ПО НАСТРОЙКЕ И ИСПОЛЬЗОВАНИЮ:
 * 
 * ## 1. Установка зависимостей
 * 
 * Убедитесь, что у вас установлены все необходимые пакеты:
 * ```bash
 * npm install @nestjs/common @nestjs/core @nestjs/mongoose mongoose
 * npm install @nestjs/swagger swagger-ui-express
 * npm install class-validator class-transformer
 * npm install bcrypt uuid nodemailer
 * npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
 * npm install @nestjs/platform-express multer sharp
 * ```
 * 
 * ## 2. Создание недостающих файлов
 * 
 * Вам нужно создать следующие файлы сервисов:
 * 
 * ### src/lessons/lessons.service.ts (базовая структура)
 * ```typescript
 * import { Injectable, NotFoundException } from '@nestjs/common';
 * import { InjectModel } from '@nestjs/mongoose';
 * import { Model } from 'mongoose';
 * import { Lesson, LessonDocument } from './schemas/lesson.schema';
 * import { CreateLessonDto } from './dto/create-lesson.dto';
 * import { UpdateLessonDto } from './dto/update-lesson.dto';
 * 
 * @Injectable()
 * export class LessonsService {
 *     constructor(
 *         @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>
 *     ) {}
 * 
 *     async create(createLessonDto: CreateLessonDto, userId: string, isAdmin: boolean): Promise<LessonDocument> {
 *         // Реализация создания урока
 *         const lesson = new this.lessonModel(createLessonDto);
 *         return lesson.save();
 *     }
 * 
 *     async findById(id: string): Promise<LessonDocument | null> {
 *         return this.lessonModel.findById(id).exec();
 *     }
 * 
 *     async findByCourse(courseId: string, includeUnpublished = false): Promise<LessonDocument[]> {
 *         const filter: any = { courseId };
 *         if (!includeUnpublished) {
 *             filter.isPublished = true;
 *         }
 *         return this.lessonModel.find(filter).sort({ order: 1 }).exec();
 *     }
 * 
 *     // Добавьте остальные методы согласно контроллеру
 * }
 * ```
 * 
 * ### src/subscriptions/subscriptions.service.ts (базовая структура)
 * ```typescript
 * import { Injectable, NotFoundException } from '@nestjs/common';
 * import { InjectModel } from '@nestjs/mongoose';
 * import { Model } from 'mongoose';
 * import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';
 * import { CreateSubscriptionDto } from './dto/create-subscription.dto';
 * 
 * @Injectable()
 * export class SubscriptionsService {
 *     constructor(
 *         @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
 *     ) {}
 * 
 *     async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDocument> {
 *         const subscription = new this.subscriptionModel(createSubscriptionDto);
 *         return subscription.save();
 *     }
 * 
 *     async findById(id: string): Promise<SubscriptionDocument | null> {
 *         return this.subscriptionModel.findById(id).populate('userId courseId').exec();
 *     }
 * 
 *     // Добавьте остальные методы согласно контроллеру
 * }
**/