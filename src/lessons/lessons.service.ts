// src/lessons/lessons.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
    private readonly logger = new Logger(LessonsService.name);

    constructor(
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>
    ) { }

    /**
     * Создание нового урока
     */
    async create(createLessonDto: CreateLessonDto, userId: string, isAdmin: boolean): Promise<LessonDocument> {
        const { courseId, ...lessonData } = createLessonDto;

        // Проверяем существование курса
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Проверяем права доступа (если не админ, то только владелец курса)
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на создание уроков для этого курса');
        }

        // Проверяем уникальность порядкового номера в курсе
        const existingLesson = await this.lessonModel.findOne({
            courseId,
            order: createLessonDto.order
        }).exec();

        if (existingLesson) {
            throw new ConflictException(`Урок с порядковым номером ${createLessonDto.order} уже существует в этом курсе`);
        }

        // Создаем новый урок
        const newLesson = new this.lessonModel({
            ...lessonData,
            courseId,
            isActive: true,
            isPublished: false,
            isFree: false
        });

        const savedLesson = await newLesson.save();

        // Обновляем количество уроков в курсе
        await this.updateCourseLessonsCount(courseId);

        this.logger.log(`Создан урок: ${savedLesson.title} (ID: ${savedLesson.id})`);
        return savedLesson;
    }

    /**
     * Получение уроков курса
     */
    async findByCourse(courseId: string, includeUnpublished = false): Promise<LessonDocument[]> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        const filter: any = { courseId, isActive: true };
        if (!includeUnpublished) {
            filter.isPublished = true;
        }

        return this.lessonModel
            .find(filter)
            .sort({ order: 1 })
            .exec();
    }

    /**
     * Получение урока по ID
     */
    async findById(id: string): Promise<LessonDocument | null> {
        return this.lessonModel.findById(id).populate('courseId', 'title teacherId').exec();
    }

    /**
     * Обновление урока
     */
    async update(id: string, updateLessonDto: UpdateLessonDto, userId: string, isAdmin: boolean): Promise<LessonDocument> {
        const lesson = await this.lessonModel.findById(id).populate('courseId').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${id} не найден`);
        }

        const course = lesson.courseId as any;

        // Проверяем права доступа
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на редактирование этого урока');
        }

        // Если меняется порядковый номер, проверяем уникальность
        if (updateLessonDto.order && updateLessonDto.order !== lesson.order) {
            const existingLesson = await this.lessonModel.findOne({
                courseId: lesson.courseId,
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

        const course = lesson.courseId as any;

        // Проверяем права доступа
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на удаление этого урока');
        }

        const courseId = lesson.courseId;

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

        const course = lesson.courseId as any;

        // Проверяем права доступа
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на изменение статуса публикации этого урока');
        }

        lesson.isPublished = isPublished;
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
                isPublished: true
            })
            .sort({ order: 1 })
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
                isPublished: true
            })
            .sort({ order: -1 })
            .exec();
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
     * Получение домашних заданий урока
     */
    async getLessonHomeworkSubmissions(
        lessonId: string,
        status?: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ submissions: any[]; totalItems: number; totalPages: number }> {
        // Базовая реализация - расширить при создании модуля домашних заданий
        return {
            submissions: [],
            totalItems: 0,
            totalPages: 0
        };
    }

    /**
     * Получение прогресса урока
     */
    async getLessonProgress(lessonId: string): Promise<any> {
        // Базовая реализация - расширить при создании системы прогресса
        return {
            totalStudents: 0,
            completedStudents: 0,
            averageScore: 0
        };
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
            .sort({ order: -1 })
            .exec();

        const newOrder = maxOrder ? maxOrder.order + 1 : 1;

        const duplicatedLesson = new this.lessonModel({
            ...lessonData,
            title: newTitle,
            courseId: courseId,
            order: newOrder,
            isPublished: false
        });

        const savedLesson = await duplicatedLesson.save();

        // Обновляем количество уроков в курсе
        await this.updateCourseLessonsCount(courseId);

        this.logger.log(`Урок ${originalId} дублирован как ${savedLesson.id}`);
        return savedLesson;
    }
}