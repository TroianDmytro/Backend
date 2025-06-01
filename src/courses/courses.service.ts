// src/courses/courses.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { Subscription, SubscriptionDocument } from '../subscriptions/schemas/subscription.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';

@Injectable()
export class CoursesService {
    private readonly logger = new Logger(CoursesService.name);

    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
    ) { }

    /**
     * Создание нового курса
     */
    async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
        const { teacherId, ...courseData } = createCourseDto;

        // Проверяем существование и статус преподавателя
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        if (!teacher.isApproved) {
            throw new BadRequestException('Курсы могут создавать только одобренные преподаватели');
        }

        if (teacher.isBlocked) {
            throw new BadRequestException('Заблокированный преподаватель не может создавать курсы');
        }

        // Создаем новый курс
        const newCourse = new this.courseModel({
            ...courseData,
            teacherId: teacherId,
            isPublished: false, // По умолчанию курс не опубликован
            isActive: true,
            isFeatured: false,
            lessons_count: 0,
            current_students_count: 0,
            rating: 0,
            reviews_count: 0
        });

        const savedCourse = await newCourse.save();

        // Добавляем курс в список курсов преподавателя
        if (!teacher.courses.push(savedCourse._id as any)) {
            teacher.courses.push(savedCourse._id as any);
            await teacher.save();
        }

        this.logger.log(`Создан курс: ${savedCourse.title} (ID: ${savedCourse.id})`);
        const result = await this.findById(savedCourse.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении созданного курса');
        }
        return result;
    }

    /**
     * Получение списка курсов с фильтрацией и пагинацией
     */
    async findAll(
        filters: CourseFilterDto,
        page: number = 1,
        limit: number = 10
    ): Promise<{ courses: CourseDocument[]; totalItems: number; totalPages: number }> {
        const skip = (page - 1) * limit;

        // Строим фильтр запроса
        const query: any = {};

        if (filters.category) {
            query.category = { $regex: filters.category, $options: 'i' };
        }

        if (filters.difficulty_level) {
            query.difficulty_level = filters.difficulty_level;
        }

        if (filters.teacherId) {
            query.teacherId = filters.teacherId;
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.price = {};
            if (filters.minPrice !== undefined) {
                query.price.$gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                query.price.$lte = filters.maxPrice;
            }
        }

        if (filters.language) {
            query.language = filters.language;
        }

        if (filters.isPublished !== undefined) {
            query.isPublished = filters.isPublished;
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        if (filters.isFeatured !== undefined) {
            query.isFeatured = filters.isFeatured;
        }

        if (filters.tag) {
            query.tags = { $in: [filters.tag] };
        }

        // Текстовый поиск по названию и описанию
        if (filters.search) {
            query.$text = { $search: filters.search };
        }

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query)
                .populate('teacherId', 'name second_name rating experience_years')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return { courses, totalItems, totalPages };
    }

    /**
     * Получение курса по ID
     */
    async findById(id: string, includeLessons: boolean = false): Promise<CourseDocument | null> {
        let query = this.courseModel
            .findById(id)
            .populate('teacherId', 'name second_name rating experience_years specialization');

        if (includeLessons) {
            query = query.populate({
                path: 'lessons',
                options: { sort: { order: 1 } }
            });
        }

        return query.exec();
    }

    /**
     * Обновление курса
     */
    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseDocument> {
        const course = await this.courseModel.findById(id).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${id} не найден`);
        }

        // Если меняется преподаватель, проверяем его статус
        if (updateCourseDto.teacherId && updateCourseDto.teacherId !== course.teacherId.toString()) {
            const newTeacher = await this.teacherModel.findById(updateCourseDto.teacherId).exec();
            if (!newTeacher) {
                throw new NotFoundException(`Преподаватель с ID ${updateCourseDto.teacherId} не найден`);
            }

            if (!newTeacher.isApproved || newTeacher.isBlocked) {
                throw new BadRequestException('Курс можно назначить только одобренному и не заблокированному преподавателю');
            }

            // Удаляем курс из списка старого преподавателя
            const oldTeacher = await this.teacherModel.findById(course.teacherId).exec();
            if (oldTeacher) {
                oldTeacher.courses = oldTeacher.courses.filter(courseId => courseId.toString() !== id);
                await oldTeacher.save();
            }

            // Добавляем курс в список нового преподавателя
            if (!newTeacher.courses.includes(id as any)) {
                newTeacher.courses.push(id as any);
                await newTeacher.save();
            }
        }

        // Обновляем поля курса
        Object.assign(course, updateCourseDto);

        const updatedCourse = await course.save();
        this.logger.log(`Обновлен курс: ${id}`);

        const result = await this.findById(course.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении созданного курса');
        }
        return result;
    }

    /**
     * Удаление курса
     */
    async delete(id: string): Promise<void> {
        const course = await this.courseModel.findById(id).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${id} не найден`);
        }

        // Проверяем наличие активных подписок
        const activeSubscriptions = await this.subscriptionModel.countDocuments({
            courseId: id,
            status: 'active'
        }).exec();

        if (activeSubscriptions > 0) {
            throw new ConflictException('Нельзя удалить курс с активными подписками');
        }

        // Удаляем все уроки курса
        await this.lessonModel.deleteMany({ courseId: id }).exec();

        // Удаляем курс из списка преподавателя
        const teacher = await this.teacherModel.findById(course.teacherId).exec();
        if (teacher) {
            teacher.courses = teacher.courses.filter(courseId => courseId.toString() !== id);
            await teacher.save();
        }

        // Удаляем курс
        await this.courseModel.findByIdAndDelete(id).exec();

        this.logger.log(`Удален курс: ${id}`);
    }

    /**
     * Обновление статуса публикации
     */
    async updatePublishStatus(id: string, isPublished: boolean): Promise<CourseDocument> {
        const course = await this.courseModel.findById(id).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${id} не найден`);
        }

        // Проверяем готовность курса к публикации
        if (isPublished) {
            const lessonsCount = await this.lessonModel.countDocuments({
                courseId: id,
                isActive: true
            }).exec();

            if (lessonsCount === 0) {
                throw new BadRequestException('Нельзя опубликовать курс без уроков');
            }
        }

        course.isPublished = isPublished;
        await course.save();

        this.logger.log(`Курс ${id} ${isPublished ? 'опубликован' : 'снят с публикации'}`);
        const result = await this.findById(course.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении созданного курса');
        }
        return result;
    }

    /**
     * Получение уроков курса
     */
    async getCourseLessons(courseId: string): Promise<LessonDocument[]> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        return this.lessonModel
            .find({ courseId })
            .sort({ order: 1 })
            .exec();
    }

    /**
     * Получение статистики курса
     */
    async getCourseStatistics(courseId: string): Promise<any> {
        const course = await this.findById(courseId);
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        const [
            lessonsCount,
            publishedLessonsCount,
            activeSubscriptionsCount,
            totalRevenue,
            averageProgress
        ] = await Promise.all([
            this.lessonModel.countDocuments({ courseId }).exec(),
            this.lessonModel.countDocuments({ courseId, isPublished: true }).exec(),
            this.subscriptionModel.countDocuments({ courseId, status: 'active' }).exec(),
            this.subscriptionModel.aggregate([
                { $match: { courseId: courseId, is_paid: true } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]).exec().then(result => result[0]?.total || 0),
            this.subscriptionModel.aggregate([
                { $match: { courseId: courseId } },
                { $group: { _id: null, avgProgress: { $avg: '$progress_percentage' } } }
            ]).exec().then(result => result[0]?.avgProgress || 0)
        ]);

        return {
            totalLessons: lessonsCount,
            publishedLessons: publishedLessonsCount,
            activeStudents: activeSubscriptionsCount,
            totalRevenue: totalRevenue,
            averageProgress: Math.round(averageProgress),
            rating: course.rating,
            reviewsCount: course.reviews_count
        };
    }

    /**
     * Получение рекомендуемых курсов
     */
    async getFeaturedCourses(limit: number = 6): Promise<CourseDocument[]> {
        return this.courseModel
            .find({
                isFeatured: true,
                isPublished: true,
                isActive: true
            })
            .populate('teacherId', 'name second_name rating experience_years')
            .sort({ rating: -1, current_students_count: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Получение популярных курсов
     */
    async getPopularCourses(limit: number = 10): Promise<CourseDocument[]> {
        return this.courseModel
            .find({
                isPublished: true,
                isActive: true
            })
            .populate('teacherId', 'name second_name rating experience_years')
            .sort({
                current_students_count: -1,
                rating: -1,
                reviews_count: -1
            })
            .limit(limit)
            .exec();
    }

    /**
     * Получение списка категорий
     */
    async getCategories(): Promise<Array<{ name: string; count: number }>> {
        const categories = await this.courseModel.aggregate([
            {
                $match: {
                    isPublished: true,
                    isActive: true,
                    category: {
                        status: { $in: ['active', 'pending'] },
                        courseId: { $ne: null }
                    }
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]).exec();

        return categories;
    }

    /**
     * Запись студента на курс
     */
    async enrollStudent(courseId: string, userId: string): Promise<SubscriptionDocument> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        if (!course.isPublished || !course.isActive) {
            throw new BadRequestException('Курс недоступен для записи');
        }

        // Проверяем лимит студентов
        if (course.max_students > 0 && course.current_students_count >= course.max_students) {
            throw new BadRequestException('Превышен лимит студентов для этого курса');
        }

        // Проверяем, не записан ли уже студент на этот курс
        const existingSubscription = await this.subscriptionModel.findOne({
            userId,
            courseId,
            status: { $in: ['active', 'pending'] }
        }).exec();

        if (existingSubscription) {
            throw new ConflictException('Вы уже записаны на этот курс');
        }

        // Создаем подписку
        const subscription = new this.subscriptionModel({
            userId,
            courseId,
            subscription_type: 'course',
            start_date: new Date(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 год
            status: 'pending',
            price: course.discount_price || course.price,
            currency: course.currency,
            is_paid: false,
            progress_percentage: 0,
            completed_lessons: 0,
            total_lessons: course.lessons_count
        });

        const savedSubscription = await subscription.save();

        // Обновляем счетчик студентов в курсе
        course.current_students_count += 1;
        await course.save();

        this.logger.log(`Студент ${userId} записан на курс ${courseId}`);
        return savedSubscription;
    }

    /**
     * Получение списка студентов курса
     */
    async getCourseStudents(
        courseId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ students: any[]; totalItems: number; totalPages: number }> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        const skip = (page - 1) * limit;

        const [subscriptions, totalItems] = await Promise.all([
            this.subscriptionModel
                .find({ courseId })
                .populate('userId', 'email name second_name')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.subscriptionModel.countDocuments({ courseId }).exec()
        ]);

        const students = subscriptions.map(sub => ({
            subscription: {
                id: sub.id,
                status: sub.status,
                progress_percentage: sub.progress_percentage,
                completed_lessons: sub.completed_lessons,
                start_date: sub.start_date,
                last_accessed: sub.last_accessed
            },
            student: sub.userId
        }));

        const totalPages = Math.ceil(totalItems / limit);

        return { students, totalItems, totalPages };
    }

    /**
     * Дублирование курса
     */
    async duplicateCourse(originalId: string, newTitle: string, teacherId: string): Promise<CourseDocument> {
        const originalCourse = await this.courseModel.findById(originalId).exec();
        if (!originalCourse) {
            throw new NotFoundException(`Курс с ID ${originalId} не найден`);
        }

        // Создаем копию курса
        const courseData = originalCourse.toObject();
        delete courseData._id;
        delete courseData.id;
        delete courseData.createdAt;
        delete courseData.updatedAt;

        const duplicatedCourse = new this.courseModel({
            ...courseData,
            title: newTitle,
            teacherId: teacherId,
            isPublished: false,
            current_students_count: 0,
            rating: 0,
            reviews_count: 0,
            lessons_count: 0
        });

        const savedCourse = await duplicatedCourse.save();

        // Копируем уроки
        const originalLessons = await this.lessonModel.find({ courseId: originalId }).sort({ order: 1 }).exec();

        for (const lesson of originalLessons) {
            const lessonData = lesson.toObject();
            delete lessonData._id;
            delete lessonData.id;
            delete lessonData.createdAt;
            delete lessonData.updatedAt;

            const duplicatedLesson = new this.lessonModel({
                ...lessonData,
                courseId: savedCourse._id
            });

            await duplicatedLesson.save();
        }

        // Обновляем количество уроков
        savedCourse.lessons_count = originalLessons.length;
        await savedCourse.save();

        this.logger.log(`Курс ${originalId} дублирован как ${savedCourse.id}`);
        const result = await this.findById(savedCourse.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении созданного курса');
        }
        return result;
    }

    /**
     * Обновление количества уроков в курсе
     */
    async updateLessonsCount(courseId: string): Promise<void> {
        const lessonsCount = await this.lessonModel.countDocuments({
            courseId,
            isActive: true
        }).exec();

        await this.courseModel.findByIdAndUpdate(courseId, {
            lessons_count: lessonsCount
        }).exec();
    }
}