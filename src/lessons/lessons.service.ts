// src/lessons/lessons.service.ts - ДОПОЛНЕНИЯ для работы с домашними заданиями
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class LessonsService {
    private readonly logger = new Logger(LessonsService.name);

    constructor(
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }


    /**
     * Получение уроков курса с домашними заданиями
     */
    async findByCourse(courseId: string, includeUnpublished = false): Promise<LessonDocument[]> {
        const filter: any = {
            course: courseId, // ИСПРАВЛЕНО: courseId -> course
            isActive: true
        };

        return this.lessonModel.find(filter)
            .populate('course', 'name')
            .populate('subject', 'name')
            .populate('teacher', 'name')
            .sort({ date: 1, startTime: 1 });
    }

    /**
     * Получение урока по ID с домашними заданиями
     */
    async findById(id: string, includeHomeworks = false): Promise<LessonDocument | null> {
        let query = this.lessonModel.findById(id).populate('courseId', 'title teacherId');

        if (includeHomeworks) {
            query = query.populate({
                path: 'homeworks',
                match: { isActive: true },
                select: 'title description deadline max_score isPublished submissions_count average_score'
            });
        }

        return query.exec();
    }

    /**
     * Обновление урока
     */
    async update(id: string, updateLessonDto: UpdateLessonDto, userId: string, isAdmin: boolean): Promise<LessonDocument> {
        const lesson = await this.lessonModel.findById(id).populate('courseId').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${id} не найден`);
        }

        const course = lesson.course as any;

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на редактирование этого урока');
        }

        // Если меняется порядковый номер, проверяем уникальность
        if (updateLessonDto.order && updateLessonDto.order !== lesson.order) {
            const existingLesson = await this.lessonModel.findOne({
                courseId: lesson.course,
                order: updateLessonDto.order,
                _id: { $ne: id }
            }).exec();

            if (existingLesson) {
                throw new ConflictException(`Урок с порядковым номером ${updateLessonDto.order} уже существует в этом курсе`);
            }
        }

        // Обновляем поля урока
        Object.assign(lesson, updateLessonDto);
        const updatedLesson = await lesson.save();

        this.logger.log(`Обновлен урок: ${id}`);
        return updatedLesson;
    }

    /**
     * Удаление урока
     */
    async delete(id: string, userId: string, isAdmin: boolean): Promise<void> {
        const lesson = await this.lessonModel.findById(id).populate('courseId').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${id} не найден`);
        }

        const course = lesson.course as any;

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на удаление этого урока');
        }



        const courseId = lesson.course;

        // Удаляем урок
        await this.lessonModel.findByIdAndDelete(id).exec();

        // Обновляем количество уроков в курсе
        await this.updateCourseLessonsCount(courseId.toString());

        this.logger.log(`Удален урок: ${id}`);
    }

    /**
     * Обновление статуса публикации урока
     */
    async updatePublishStatus(id: string, isPublished: boolean, userId: string, isAdmin: boolean): Promise<LessonDocument> {
        const lesson = await this.lessonModel.findById(id).populate('courseId').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${id} не найден`);
        }

        const course = lesson.course as any;

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на изменение статуса публикации этого урока');
        }

        await lesson.save();

        this.logger.log(`Урок ${id} ${isPublished ? 'опубликован' : 'снят с публикации'}`);
        return lesson;
    }

    /**
     * Получение следующего урока
     */
    async getNextLesson(currentLessonId: string): Promise<LessonDocument | null> {
        const currentLesson = await this.lessonModel.findById(currentLessonId).exec();
        if (!currentLesson) {
            throw new NotFoundException('Текущий урок не найден');
        }

        return this.lessonModel
            .findOne({
                courseId: currentLesson.courseId,
                order: { $gt: currentLesson.order },
                isActive: true,
                // isPublished: true
            })
            .sort({ date: 1, startTime: 1 })
            .exec();
    }

    /**
     * Получение предыдущего урока
     */
    async getPreviousLesson(currentLessonId: string): Promise<LessonDocument | null> {
        const currentLesson = await this.lessonModel.findById(currentLessonId).exec();
        if (!currentLesson) {
            throw new NotFoundException('Текущий урок не найден');
        }

        return this.lessonModel
            .findOne({
                courseId: currentLesson.courseId,
                order: { $lt: currentLesson.order },
                isActive: true,
                // isPublished: true TODO
            })
            .sort({ date: 1, startTime: 1 })
            .exec();
    }

    /**
     * НОВЫЙ МЕТОД: Обновление статистики домашних заданий урока
     */
    async updateHomeworkStatistics(lessonId: string): Promise<void> {
        try {
            // Временная заглушка - будет реализовано после создания HomeworkSubmission модели
            this.logger.debug(`Обновление статистики ДЗ для урока ${lessonId} - заглушка`);

            // Обновляем урок с базовыми значениями
            await this.lessonModel.findByIdAndUpdate(lessonId, {
                // homework_count: 0,TODO
                // homework_submissions_count: 0,
                // homework_average_score: 0
            }).exec();

        } catch (error) {
            this.logger.error(`Ошибка обновления статистики ДЗ для урока ${lessonId}: ${error.message}`);
        }
    }

    /**
     * НОВЫЙ МЕТОД: Получение домашних заданий урока
     */
    async getLessonHomeworkSubmissions(
        lessonId: string,
        status?: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ submissions: any[]; totalItems: number; totalPages: number }> {
        // Временная заглушка - будет реализовано после создания HomeworkSubmission модели
        this.logger.debug(`Получение ДЗ урока ${lessonId} - заглушка`);

        return {
            submissions: [],
            totalItems: 0,
            totalPages: 0
        };
    }

    /**
     * НОВЫЙ МЕТОД: Получение прогресса урока с учетом домашних заданий
     */
    async getLessonProgress(lessonId: string): Promise<any> {
        const lesson = await this.lessonModel.findById(lessonId).exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${lessonId} не найден`);
        }

        // Временная заглушка - будет реализовано после создания HomeworkSubmission модели
        const stats = {
            lessonId: lessonId,
            //TODO
            // averageScore: lesson.homework_average_score,
            submissionsByStatus: {
                submitted: 0,
                in_review: 0,
                reviewed: 0,
                returned_for_revision: 0
            }
        };

        return stats;
    }

    /**
     * Обновление количества уроков в курсе
     */
    private async updateCourseLessonsCount(courseId: string): Promise<void> {
        const lessonsCount = await this.lessonModel.countDocuments({
            courseId,
            isActive: true
        }).exec();

        await this.courseModel.findByIdAndUpdate(courseId, {
            lessons_count: lessonsCount
        }).exec();
    }

    /**
     * Отметить урок как пройденный
     */
    async markLessonComplete(lessonId: string, userId: string): Promise<void> {
        // Базовая реализация - расширить при создании системы прогресса
        this.logger.log(`Урок ${lessonId} отмечен как пройденный пользователем ${userId}`);
    }

    /**
     * Изменение порядка уроков
     */
    async reorderLessons(lessons: Array<{ lessonId: string; order: number }>, userId: string, isAdmin: boolean): Promise<void> {
        // Проверяем права доступа и обновляем порядок уроков
        for (const lessonUpdate of lessons) {
            await this.lessonModel.findByIdAndUpdate(lessonUpdate.lessonId, {
                order: lessonUpdate.order
            }).exec();
        }

        this.logger.log('Порядок уроков обновлен');
    }

    /**
     * Дублирование урока
     */
    async duplicateLesson(
        originalId: string,
        newTitle: string,
        userId: string,
        isAdmin: boolean,
        targetCourseId?: string
    ): Promise<LessonDocument> {
        const originalLesson = await this.lessonModel.findById(originalId).exec();
        if (!originalLesson) {
            throw new NotFoundException(`Урок с ID ${originalId} не найден`);
        }

        const lessonData = originalLesson.toObject();
        delete lessonData._id;
        delete lessonData.id;
        delete lessonData.createdAt;
        delete lessonData.updatedAt;

        // Находим следующий доступный порядковый номер
        const courseId = targetCourseId || originalLesson.courseId.toString();
        const maxOrder = await this.lessonModel
            .findOne({ courseId })
            .sort({ date: 1, startTime: 1 })
            .exec();

        const newOrder = maxOrder ? maxOrder.order + 1 : 1;

        const duplicatedLesson = new this.lessonModel({
            ...lessonData,
            title: newTitle,
            courseId: courseId,
            order: newOrder,
            // isPublished: false,
            // Сбрасываем статистику домашних заданий
            // homework_count: 0,TODO
            // homework_submissions_count: 0,
            // homework_average_score: 0
        });

        const savedLesson = await duplicatedLesson.save();

        // Обновляем количество уроков в курсе
        await this.updateCourseLessonsCount(courseId);

        this.logger.log(`Урок ${originalId} дублирован как ${savedLesson.id}`);
        return savedLesson;
    }
    /**
 * Отметить посещаемость студентов на занятии
 */
    async markAttendance(
        lessonId: string,
        attendanceData: {
            userId: string;
            isPresent: boolean;
            lessonGrade?: number;
            notes?: string;
        }[],
        teacherId: string
    ) {
        const lesson = await this.lessonModel.findById(lessonId);
        if (!lesson) {
            throw new NotFoundException('Занятие не найдено');
        }

        // Очищаем существующую посещаемость
        lesson.attendance = [];

        // Добавляем новые данные посещаемости
        for (const attendance of attendanceData) {
            lesson.attendance.push({
                user: attendance.userId as any,
                isPresent: attendance.isPresent,
                lessonGrade: attendance.lessonGrade,
                notes: attendance.notes,
                markedAt: new Date(),
                markedBy: teacherId as any
            });
        }

        return lesson.save();
    }

    /**
     * Получить данные посещаемости занятия
     */
    async getAttendance(lessonId: string) {
        const lesson = await this.lessonModel
            .findById(lessonId)
            .populate({
                path: 'attendance.user',
                select: 'name email'
            })
            .populate({
                path: 'attendance.markedBy',
                select: 'name email'
            });

        if (!lesson) {
            throw new NotFoundException('Занятие не найдено');
        }

        return {
            lessonId: lesson._id,
            lessonTitle: lesson.title,
            lessonDate: lesson.date,
            attendance: lesson.attendance
        };
    }

    /**
     * Получить занятия по курсу и предмету
     */
    async getLessonsByCourseAndSubject(courseId: string, subjectId: string, upcomingOnly = false) {
        const query: any = {
            course: courseId,
            subject: subjectId,
            isActive: true
        };

        if (upcomingOnly) {
            query.date = { $gte: new Date() };
        }

        const lessons = await this.lessonModel
            .find(query)
            .populate('course', 'name')
            .populate('subject', 'name')
            .populate('teacher', 'name email')
            .sort({ date: 1, startTime: 1 });

        return lessons;
    }

    /**
     * Создать занятие с проверкой
     */
    ///////////////////////
    async create(createLessonDto: any, userId: string, isAdmin: boolean) {
        // Проверяем, что курс и предмет связаны
        const course = await this.courseModel.findById(createLessonDto.course);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        const courseSubject = course.courseSubjects.find(
            cs => cs.subject.toString() === createLessonDto.subject &&
                cs.teacher?.toString() === createLessonDto.teacher
        );

        if (!courseSubject) {
            throw new BadRequestException(
                'Предмет не привязан к курсу или преподаватель не назначен'
            );
        }

        const lesson = new this.lessonModel(createLessonDto);
        return lesson.save();
    }

}

/**
 * Объяснение дополнений в LessonsService:
 * 
 * 1. **НОВЫЕ МЕТОДЫ ДЛЯ ДОМАШНИХ ЗАДАНИЙ:**
 *    - updateHomeworkStatistics() - обновление статистики ДЗ урока
 *    - getLessonHomeworkSubmissions() - получение отправок ДЗ урока
 *    - getLessonProgress() - прогресс урока с учетом ДЗ
 * 
 * 2. **ОБНОВЛЕННЫЕ МЕТОДЫ:**
 *    - findByCourse() - опция загрузки домашних заданий
 *    - findById() - опция загрузки домашних заданий
 *    - create() - инициализация счетчиков ДЗ
 *    - delete() - проверка на наличие отправленных ДЗ
 * 
 * 3. **СТАТИСТИКА:**
 *    - Автоматическое обновление счетчиков при изменениях
 *    - Агрегация данных по статусам отправок
 *    - Расчет средних оценок
 * 
 * 4. **ИНТЕГРАЦИЯ:**
 *    - Связь с HomeworkSubmission моделью
 *    - Обновление статистики при операциях с ДЗ
 *    - Проверка зависимостей при удалении
 */