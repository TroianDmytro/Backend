// src/courses/courses.service.ts - ПОЛНАЯ ВЕРСИЯ
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
    ForbiddenException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import { Category } from '../categories/schemas/category.schema';
import { DifficultyLevel } from '../difficulty-levels/schemas/difficulty-level.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Subject, SubjectDocument } from 'src/subjects/schemas/subject.schema';
import { Subscription, SubscriptionDocument } from 'src/subscriptions/schemas/subscription.schema';


@Injectable()
export class CoursesService {
    private readonly logger = new Logger(CoursesService.name);

    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        @InjectModel(DifficultyLevel.name) private difficultyLevelModel: Model<DifficultyLevel>,
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    ) { }

    /**
     * МЕТОД: Создание нового курса с проверкой всех связей
     * 
     * Алгоритм работы:
     * 1. Проверяем существование всех связанных сущностей (преподаватель опционально, категория, уровень)
     * 2. Проверяем уникальность slug
     * 3. Создаем курс
     * 4. Обновляем статистику всех связанных сущностей
     */
    async create(createCourseDto: CreateCourseDto): Promise<Course> {
        this.logger.log(`Создание курса: ${createCourseDto.title}`);

        // 1. Проверяем существование преподавателя (если указан и не null)
        if (createCourseDto.teacherId && createCourseDto.teacherId !== 'null') {
            const teacher = await this.teacherModel.findById(createCourseDto.teacherId);
            if (!teacher) {
                throw new NotFoundException('Преподаватель не найден');
            }
        }

        // 2. Проверяем существование категории
        const category = await this.categoryModel.findById(createCourseDto.categoryId);
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        // 3. Проверяем существование уровня сложности
        const difficultyLevel = await this.difficultyLevelModel.findById(createCourseDto.difficultyLevelId);
        if (!difficultyLevel) {
            throw new NotFoundException('Уровень сложности не найден');
        }

        // 4. Проверяем уникальность slug
        const existingCourse = await this.courseModel.findOne({ slug: createCourseDto.slug });
        if (existingCourse) {
            throw new ConflictException('Курс с таким slug уже существует');
        }

        // 5. Определяем, есть ли валидный teacherId
        const hasValidTeacher = createCourseDto.teacherId &&
            createCourseDto.teacherId !== 'null' &&
            createCourseDto.teacherId.trim() !== '';

        // Создаем данные для курса
        const courseData: any = {
            ...createCourseDto,
            published_at: new Date(),
        };

        // Если нет валидного преподавателя, исключаем поле из данных
        if (!hasValidTeacher) {
            const { teacherId, ...courseDataWithoutTeacher } = courseData;
            const course = new this.courseModel(courseDataWithoutTeacher);
            const savedCourse = await course.save();

            // 6. Обновляем статистику связанных сущностей (без преподавателя)
            await Promise.all([
                this.updateCategoryStatistics(createCourseDto.categoryId),
                this.updateDifficultyLevelStatistics(createCourseDto.difficultyLevelId)
            ]);

            this.logger.log(`Курс создан с ID: ${savedCourse._id} без преподавателя`);
            return savedCourse;
        } else {
            // Создаем курс с преподавателем
            const course = new this.courseModel(courseData);
            const savedCourse = await course.save();

            // 6. Обновляем статистику связанных сущностей (включая преподавателя)
            await Promise.all([
                this.updateCategoryStatistics(createCourseDto.categoryId),
                this.updateDifficultyLevelStatistics(createCourseDto.difficultyLevelId),
                this.updateTeacherStatistics(createCourseDto.teacherId!) // Используем ! так как мы уже проверили
            ]);

            this.logger.log(`Курс создан с ID: ${savedCourse._id} и преподавателем ${createCourseDto.teacherId}`);
            return savedCourse;
        }
    }

    /**
     * МЕТОД: Получение всех курсов с расширенной фильтрацией
     * 
     * Поддерживаемые фильтры:
     * - category (ID или slug категории)
     * - difficulty_level (ID или slug уровня сложности)  
     * - teacher_id (ID преподавателя)
     * - is_active (статус активности)
     * - is_featured (рекомендуемые курсы)
     * - min_price, max_price (диапазон цен)
     * - search (поиск по названию и описанию)
     */
    async findAll(filters: any = {}, page: number = 1, limit: number = 10): Promise<{
        courses: Course[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        this.logger.log(`Получение курсов. Страница: ${page}, Лимит: ${limit}, Фильтры:`, filters);

        const skip = (page - 1) * limit;
        const query: any = {};

        // Фильтрация по категории (можно по ID или slug)
        if (filters.category) {
            if (this.isValidObjectId(filters.category)) {
                query.category = filters.category; // Исправлено на category
            } else {
                const category = await this.categoryModel.findOne({ slug: filters.category });
                if (category) {
                    query.category = category._id; // Исправлено на category
                } else {
                    return {
                        courses: [],
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: page
                    };
                }
            }
        }

        // Фильтрация по уровню сложности (можно по ID или slug/code)
        if (filters.difficulty_level) {
            if (this.isValidObjectId(filters.difficulty_level)) {
                query.difficultyLevel = filters.difficulty_level; // Исправлено на difficultyLevel
            } else {
                const difficultyLevel = await this.difficultyLevelModel.findOne({
                    $or: [
                        { slug: filters.difficulty_level },
                        { code: filters.difficulty_level }
                    ]
                });
                if (difficultyLevel) {
                    query.difficultyLevel = difficultyLevel._id; // Исправлено на difficultyLevel
                } else {
                    return {
                        courses: [],
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: page
                    };
                }
            }
        }

        // Остальные фильтры
        if (filters.teacher_id) {
            query.mainTeacher = filters.teacher_id; // Исправлено на mainTeacher
        }

        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }

        if (filters.isActive !== undefined) {
            // Поддержка camelCase варианта
            if (typeof filters.isActive === 'string') {
                query.is_active = filters.isActive.toLowerCase() === 'true';
            } else {
                query.is_active = filters.isActive;
            }
        }

        if (filters.is_featured !== undefined) {
            // Преобразуем строку в булево значение
            if (typeof filters.is_featured === 'string') {
                query.is_featured = filters.is_featured.toLowerCase() === 'true';
            } else {
                query.is_featured = filters.is_featured;
            }
        }

        if (filters.isFeatured !== undefined) {
            // Поддержка camelCase варианта
            if (typeof filters.isFeatured === 'string') {
                query.is_featured = filters.isFeatured.toLowerCase() === 'true';
            } else {
                query.is_featured = filters.isFeatured;
            }
        }

        if (filters.isPublished !== undefined) {
            // Преобразуем строку в булево значение
            if (typeof filters.isPublished === 'string') {
                query.isPublished = filters.isPublished.toLowerCase() === 'true';
            } else {
                query.isPublished = filters.isPublished;
            }
        }

        // Фильтрация по цене
        if (filters.min_price || filters.max_price) {
            query.price = {};
            if (filters.min_price) {
                query.price.$gte = Number(filters.min_price);
            }
            if (filters.max_price) {
                query.price.$lte = Number(filters.max_price);
            }
        }

        // Поиск по тексту (название и описание)
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
                { tags: { $in: [new RegExp(filters.search, 'i')] } }
            ];
        }

        // Выполняем запросы параллельно с populate для связанных данных
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query)
                .populate('mainTeacher', 'name second_name rating experience_years avatar_url')
                .populate('category', 'name slug description color icon') // Исправлено на category
                .populate('difficultyLevel', 'name slug level color description') // Исправлено на difficultyLevel
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);

        this.logger.log(`Найдено курсов: ${totalItems}`);

        return {
            courses,
            totalItems,
            totalPages,
            currentPage: page
        };
    }

    /**
     * МЕТОД: Получение курса по ID с полной информацией
     */
    async findById(id: string): Promise<Course | null> {
        this.logger.log(`Получение курса с ID: ${id}`);

        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID курса');
        }

        const course = await this.courseModel
            .findById(id)
            .populate('mainTeacher', 'name second_name email rating experience_years avatar_url bio')
            .populate('category', 'name slug description color icon parent_id') // Исправлено на category
            .populate('difficultyLevel', 'name slug level color description requirements') // Исправлено на difficultyLevel
            .exec();

        return course;
    }

    /**
     * МЕТОД: Получение курса по slug
     */
    async findBySlug(slug: string): Promise<Course | null> {
        this.logger.log(`Получение курса со slug: ${slug}`);

        const course = await this.courseModel
            .findOne({ slug, is_active: true })
            .populate('mainTeacher', 'name second_name email rating experience_years avatar_url bio')
            .populate('category', 'name slug description color icon parent_id') // Исправлено на category
            .populate('difficultyLevel', 'name slug level color description requirements') // Исправлено на difficultyLevel
            .exec();

        return course;
    }

    /**
     * МЕТОД: Обновление курса с проверкой связей
     */
    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
        this.logger.log(`Обновление курса с ID: ${id}`);

        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID курса');
        }

        // Проверяем существование курса
        const existingCourse = await this.courseModel.findById(id);
        if (!existingCourse) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем новые связи, если они переданы
        if (updateCourseDto.teacherId) {
            const teacher = await this.teacherModel.findById(updateCourseDto.teacherId);
            if (!teacher) {
                throw new NotFoundException('Преподаватель не найден');
            }
        }

        if (updateCourseDto.categoryId) {
            const category = await this.categoryModel.findById(updateCourseDto.categoryId);
            if (!category) {
                throw new NotFoundException('Категория не найдена');
            }
        }

        if (updateCourseDto.difficultyLevelId) {
            const difficultyLevel = await this.difficultyLevelModel.findById(updateCourseDto.difficultyLevelId);
            if (!difficultyLevel) {
                throw new NotFoundException('Уровень сложности не найден');
            }
        }

        // Проверяем уникальность slug, если он изменяется
        if (updateCourseDto.slug && updateCourseDto.slug !== existingCourse.slug) {
            const courseWithSlug = await this.courseModel.findOne({
                slug: updateCourseDto.slug,
                _id: { $ne: id }
            });
            if (courseWithSlug) {
                throw new ConflictException('Курс с таким slug уже существует');
            }
        }

        // Сохраняем старые связи для обновления статистики
        const oldTeacherId = existingCourse.mainTeacher;
        const oldCategoryId = existingCourse.category;
        const oldDifficultyLevelId = existingCourse.difficultyLevel;

        // Обновляем курс
        const updatedCourse = await this.courseModel
            .findByIdAndUpdate(
                id,
                { ...updateCourseDto, updated_at: new Date() },
                { new: true, runValidators: true }
            )
            .populate('mainTeacher', 'name second_name rating experience_years avatar_url')
            .populate('category', 'name slug description color icon') // Исправлено на category
            .populate('difficultyLevel', 'name slug level color description') // Исправлено на difficultyLevel
            .exec();

        if (!updatedCourse) {
            throw new NotFoundException(`Курс с ID ${id} не найден после обновления`);
        }

        // Обновляем статистику для всех затронутых сущностей
        const statsUpdates: Promise<void>[] = [];

        // Обновляем статистику преподавателей
        if (updateCourseDto.teacherId && updateCourseDto.teacherId !== oldTeacherId?.toString()) {
            statsUpdates.push(this.updateTeacherStatistics(oldTeacherId?._id.toString() || ''));
            statsUpdates.push(this.updateTeacherStatistics(updateCourseDto.teacherId));
        } else if (oldTeacherId) {
            statsUpdates.push(this.updateTeacherStatistics(oldTeacherId.toString()));
        }

        // Обновляем статистику категорий
        if (updateCourseDto.categoryId && updateCourseDto.categoryId !== oldCategoryId?.toString()) {
            statsUpdates.push(this.updateCategoryStatistics(oldTeacherId?._id.toString() || ''));
            statsUpdates.push(this.updateCategoryStatistics(updateCourseDto.categoryId));
        } else if (oldCategoryId) {
            statsUpdates.push(this.updateCategoryStatistics(oldCategoryId.toString()));
        }

        // Обновляем статистику уровней сложности
        if (updateCourseDto.difficultyLevelId && updateCourseDto.difficultyLevelId !== oldDifficultyLevelId?.toString()) {
            statsUpdates.push(this.updateDifficultyLevelStatistics(oldDifficultyLevelId?.toString() || ''));
            statsUpdates.push(this.updateDifficultyLevelStatistics(updateCourseDto.difficultyLevelId));
        } else if (oldDifficultyLevelId) {
            statsUpdates.push(this.updateDifficultyLevelStatistics(oldDifficultyLevelId.toString()));
        }

        await Promise.all(statsUpdates);

        this.logger.log(`Курс обновлен: ${updatedCourse._id}`);
        return updatedCourse;
    }

    /**
     * МЕТОД: Удаление курса
     */
    async delete(id: string): Promise<void> {
        this.logger.log(`Удаление курса с ID: ${id}`);

        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID курса');
        }

        const course = await this.courseModel.findById(id);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем, есть ли активные подписки на курс
        // (здесь можно добавить проверку subscriptions)

        // Сохраняем связи для обновления статистики
        const teacherId = course.mainTeacher;
        const categoryId = course.category;
        const difficultyLevelId = course.difficultyLevel;

        // Удаляем курс
        await this.courseModel.findByIdAndDelete(id);

        // Обновляем статистику связанных сущностей
        await Promise.all([
            this.updateTeacherStatistics(teacherId?._id.toString() || ''),
            this.updateCategoryStatistics(categoryId?.toString() || ''),
            this.updateDifficultyLevelStatistics(difficultyLevelId?.toString() || '')
        ]);

        this.logger.log(`Курс удален: ${id}`);
    }

    /**
  * Получение курсов по уровню сложности
  */
    async getCoursesByDifficultyLevel(
        difficultyLevelId: string,
        page: number = 1,
        limit: number = 12,
        detailLevel: 'card' | 'full' | 'admin' = 'card'
    ): Promise<{
        difficultyLevel: any;
        courses: any[];
        totalItems: number;
        currentPage: number;
        totalPages: number;
    }> {
        this.logger.log(`Получение курсов уровня сложности ${difficultyLevelId}, уровень: ${detailLevel}`);

        if (!this.isValidObjectId(difficultyLevelId)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        // Проверяем существование уровня сложности
        const difficultyLevel = await this.difficultyLevelModel.findById(difficultyLevelId);
        if (!difficultyLevel) {
            throw new NotFoundException('Уровень сложности не найден');
        }

        const skip = (page - 1) * limit;
        const query = { difficultyLevel: difficultyLevelId, is_active: true }; // Исправлено на difficultyLevel

        // Определяем поля для populate
        let teacherFields = 'name second_name rating';
        let courseFields = 'title slug price discount_percent currency average_rating students_count image_url';

        if (detailLevel === 'full') {
            teacherFields += ' experience_years avatar_url';
            courseFields += ' description duration_hours lessons_count tags preview_video_url is_featured';
        } else if (detailLevel === 'admin') {
            teacherFields += ' experience_years avatar_url bio email created_at';
            courseFields = '';
        }

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query, detailLevel === 'admin' ? {} : courseFields)
                .populate('mainTeacher', teacherFields)
                .populate('category', 'name slug color icon') // Исправлено на category
                .skip(skip)
                .limit(limit)
                .sort({ average_rating: -1, students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            difficultyLevel: {
                id: difficultyLevel._id,
                name: difficultyLevel.name,
                slug: difficultyLevel.slug,
                level: difficultyLevel.level,
                color: difficultyLevel.color,
                description: difficultyLevel.description
            },
            courses,
            totalItems,
            currentPage: page,
            totalPages
        };
    }

    /**
     * МЕТОД: Получение рекомендуемых курсов
     */
    async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
        this.logger.log(`Получение ${limit} рекомендуемых курсов`);

        const courses = await this.courseModel
            .find({
                is_active: true,
                is_featured: true
            })
            .populate('mainTeacher', 'name second_name rating experience_years avatar_url')
            .populate('category', 'name slug color icon') // Исправлено на category
            .populate('difficultyLevel', 'name slug level color') // Исправлено на difficultyLevel
            .sort({ average_rating: -1, students_count: -1 })
            .limit(limit)
            .exec();

        return courses;
    }

    /**
     * МЕТОД: Поиск курсов по тексту
     */
    /**
 * Поиск курсов по тексту
 */
    async searchCourses(
        searchQuery: string,
        page: number = 1,
        limit: number = 10,
        filters: any = {}
    ): Promise<{
        courses: Course[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
        searchQuery: string;
    }> {
        this.logger.log(`Поиск курсов по запросу: "${searchQuery}"`);

        const skip = (page - 1) * limit;
        const query: any = {
            is_active: true,
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } }
            ]
        };

        // Добавляем дополнительные фильтры
        if (filters.categoryId) {
            query.category = filters.categoryId; // Исправлено на category
        }

        if (filters.difficultyLevelId) {
            query.difficultyLevel = filters.difficultyLevelId; // Исправлено на difficultyLevel
        }

        if (filters.teacherId) {
            query.mainTeacher = filters.teacherId;
        }

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query)
                .populate('mainTeacher', 'name second_name rating experience_years avatar_url')
                .populate('category', 'name slug color icon') // Исправлено на category
                .populate('difficultyLevel', 'name slug level color') // Исправлено на difficultyLevel
                .skip(skip)
                .limit(limit)
                .sort({
                    average_rating: -1,
                    students_count: -1
                })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            courses,
            totalItems,
            totalPages,
            currentPage: page,
            searchQuery
        };
    }

    /**
     * МЕТОД: Назначение преподавателя на курс
     */
    async assignTeacherToCourse(courseId: string, teacherId: string): Promise<Course> {
        this.logger.log(`Назначение преподавателя ${teacherId} на курс ${courseId}`);

        if (!this.isValidObjectId(courseId)) {
            throw new BadRequestException('Некорректный ID курса');
        }

        if (!this.isValidObjectId(teacherId)) {
            throw new BadRequestException('Некорректный ID преподавателя');
        }

        // Проверяем существование курса
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем существование преподавателя
        const teacher = await this.teacherModel.findById(teacherId);
        if (!teacher) {
            throw new NotFoundException('Преподаватель не найден');
        }

        // Сохраняем старого преподавателя для обновления статистики
        const oldTeacherId = course.mainTeacher?.toString();

        // Назначаем нового преподавателя
        const updatedCourse = await this.courseModel
            .findByIdAndUpdate(
                courseId,
                {
                    mainTeacher: teacherId,
                    updated_at: new Date()
                },
                { new: true, runValidators: true }
            )
            .populate('mainTeacher', 'name second_name rating experience_years avatar_url')
            .populate('category', 'name slug description color icon')
            .populate('difficultyLevel', 'name slug level color description')
            .exec();

        if (!updatedCourse) {
            throw new NotFoundException('Не удалось обновить курс');
        }

        // Обновляем статистику преподавателей
        const statsUpdates = [this.updateTeacherStatistics(teacherId)];
        if (oldTeacherId && oldTeacherId !== teacherId) {
            statsUpdates.push(this.updateTeacherStatistics(oldTeacherId));
        }

        await Promise.all(statsUpdates);

        this.logger.log(`Преподаватель ${teacherId} назначен на курс ${courseId}`);
        return updatedCourse;
    }

    /**
     * МЕТОД: Удаление преподавателя с курса
     */
    async removeTeacherFromCourse(courseId: string): Promise<Course> {
        this.logger.log(`Удаление преподавателя с курса ${courseId}`);

        if (!this.isValidObjectId(courseId)) {
            throw new BadRequestException('Некорректный ID курса');
        }

        // Проверяем существование курса
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        const oldTeacherId = course.mainTeacher?.toString();

        // Удаляем преподавателя
        const updatedCourse = await this.courseModel
            .findByIdAndUpdate(
                courseId,
                {
                    $unset: { mainTeacher: 1 },
                    updated_at: new Date()
                },
                { new: true, runValidators: true }
            )
            .populate('category', 'name slug description color icon')
            .populate('difficultyLevel', 'name slug level color description')
            .exec();

        if (!updatedCourse) {
            throw new NotFoundException('Не удалось обновить курс');
        }

        // Обновляем статистику старого преподавателя
        if (oldTeacherId) {
            await this.updateTeacherStatistics(oldTeacherId);
        }

        this.logger.log(`Преподаватель удален с курса ${courseId}`);
        return updatedCourse;
    }

    /**
     * ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ для обновления статистики
     */
    private async updateTeacherStatistics(teacherId: string): Promise<void> {
        if (!teacherId || !this.isValidObjectId(teacherId)) {
            return; // Пропускаем обновление для невалидных ID
        }

        try {
            const stats = await this.courseModel.aggregate([
                { $match: { mainTeacher: new mongoose.Types.ObjectId(teacherId) } },
                {
                    $group: {
                        _id: null,
                        coursesCount: { $sum: 1 },
                        totalStudents: { $sum: '$students_count' },
                        avgRating: { $avg: '$average_rating' }
                    }
                }
            ]);

            if (stats.length > 0) {
                await this.teacherModel.findByIdAndUpdate(teacherId, {
                    courses_count: stats[0].coursesCount,
                    total_students: stats[0].totalStudents,
                    $set: { updated_at: new Date() }
                });
            } else {
                // Если у преподавателя больше нет курсов, обнуляем статистику
                await this.teacherModel.findByIdAndUpdate(teacherId, {
                    courses_count: 0,
                    total_students: 0,
                    $set: { updated_at: new Date() }
                });
            }
        } catch (error) {
            this.logger.error(`Ошибка обновления статистики преподавателя ${teacherId}:`, error);
        }
    }

    private async updateCategoryStatistics(categoryId: string): Promise<void> {
        try {
            const stats = await this.courseModel.aggregate([
                { $match: { category: new mongoose.Types.ObjectId(categoryId), is_active: true } }, // Исправлено на category
                {
                    $group: {
                        _id: null,
                        coursesCount: { $sum: 1 },
                        totalStudents: { $sum: '$students_count' },
                        avgPrice: { $avg: '$price' }
                    }
                }
            ]);

            if (stats.length > 0) {
                await this.categoryModel.findByIdAndUpdate(categoryId, {
                    courses_count: stats[0].coursesCount,
                    students_count: stats[0].totalStudents,
                    average_price: stats[0].avgPrice,
                    updated_at: new Date()
                });
            }
        } catch (error) {
            this.logger.error(`Ошибка обновления статистики категории ${categoryId}:`, error);
        }
    }

    private async updateDifficultyLevelStatistics(difficultyLevelId: string): Promise<void> {
        try {
            const stats = await this.courseModel.aggregate([
                { $match: { difficultyLevel: new mongoose.Types.ObjectId(difficultyLevelId), is_active: true } }, // Исправлено на difficultyLevel
                {
                    $group: {
                        _id: null,
                        coursesCount: { $sum: 1 },
                        totalStudents: { $sum: '$students_count' },
                        avgRating: { $avg: '$average_rating' }
                    }
                }
            ]);

            if (stats.length > 0) {
                await this.difficultyLevelModel.findByIdAndUpdate(difficultyLevelId, {
                    courses_count: stats[0].coursesCount,
                    students_count: stats[0].totalStudents,
                    average_rating: stats[0].avgRating,
                    updated_at: new Date()
                });
            }
        } catch (error) {
            this.logger.error(`Ошибка обновления статистики уровня сложности ${difficultyLevelId}:`, error);
        }
    }

    /**
     * Проверка валидности ObjectId
     */
    private isValidObjectId(id: string): boolean {
        return mongoose.Types.ObjectId.isValid(id);
    }

    /**
     * Метод обновления статуса публикации
    */
    async updatePublishStatus(id: string, isPublished: boolean): Promise<Course> {
        const course = await this.courseModel.findById(id).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${id} не найден`);
        }

        // Обновляем статус публикации
        course.isPublished = isPublished;
        return course.save();
    }

    /**
     * Получение уроков курса
     */
    async getCourseLessons(courseId: string): Promise<any[]> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Логика получения уроков курса
        // Зависит от структуры вашей базы данных
        return []; // Заглушка, замените на реальную логику
    }

    /**
     * Получение статистики курса
     */
    async getCourseStatistics(courseId: string): Promise<any> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Заглушка для статистики
        return {
            studentsCount: course.students_count || 0,
            lessonsCount: course.lessons_count || 0,
            averageRating: course.average_rating || 0,
            completionRate: 0, // Заглушка
            revenue: 0 // Заглушка
        };
    }

    /**
     * Получение популярных курсов
     */
    async getPopularCourses(limit: number = 10): Promise<Course[]> {
        return this.courseModel
            .find({ is_active: true, isPublished: true }) // Исправлено на is_active
            .sort({ students_count: -1, average_rating: -1 })
            .limit(limit)
            .populate('mainTeacher', 'name second_name rating')
            .populate('category', 'name slug')
            .populate('difficultyLevel', 'name level color')
            .exec();
    }

    /**
     * Получение категорий курсов
     */
    async getCategories(): Promise<any[]> {
        // Здесь нужно использовать categoryModel, если есть
        // Или сделать агрегацию по курсам
        return []; // Заглушка, замените на реальную логику
    }

    /**
     * Запись студента на курс
     */
    async enrollStudent(courseId: string, userId: string): Promise<any> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Здесь должна быть логика создания подписки на курс
        // И обновление счетчика студентов

        // Заглушка для результата записи
        return {
            courseId,
            userId,
            enrollmentDate: new Date()
        };
    }

    /**
     * Получение списка студентов курса
     */
    async getCourseStudents(courseId: string, page: number = 1, limit: number = 20): Promise<any> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Заглушка для списка студентов
        return {
            students: [],
            totalItems: 0,
            totalPages: 0
        };
    }

    /**
     * Дублирование курса
     */
    async duplicateCourse(courseId: string, newTitle: string, userId: string): Promise<Course> {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Создаем копию объекта курса без _id
        const courseData = course.toObject();
        const { _id, id, ...courseDataWithoutId } = courseData;

        // Изменяем название и отмечаем как неопубликованный
        const newCourse = new this.courseModel({
            ...courseDataWithoutId,
            title: newTitle,
            isPublished: false,
            students_count: 0,
            slug: `${courseData.slug}-copy-${Date.now().toString(36)}`
        });

        return newCourse.save();
    }

    /**
 * Получение курсов по категории с разными уровнями детализации
 * 
 * Уровни детализации:
 * - 'card': краткая информация для карточек
 * - 'full': полная информация без админских данных
 * - 'admin': вся информация включая админские данные
 */
    async getCoursesByCategory(
        categoryId: string,
        page: number = 1,
        limit: number = 12,
        detailLevel: 'card' | 'full' | 'admin' = 'card'
    ): Promise<{
        category: any;
        courses: any[];
        totalItems: number;
        currentPage: number;
        totalPages: number;
    }> {
        this.logger.log(`Получение курсов категории ${categoryId}, уровень: ${detailLevel}`);

        if (!this.isValidObjectId(categoryId)) {
            throw new BadRequestException('Некорректный ID категории');
        }

        // Проверяем существование категории
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        const skip = (page - 1) * limit;
        const query = { category: categoryId, is_active: true }; // Исправлено на category

        // Определяем поля для populate в зависимости от уровня детализации
        let teacherFields = 'name second_name rating';
        let courseFields = 'title slug price discount_percent currency average_rating students_count image_url';

        if (detailLevel === 'full') {
            teacherFields += ' experience_years avatar_url';
            courseFields += ' description duration_hours lessons_count tags preview_video_url is_featured';
        } else if (detailLevel === 'admin') {
            teacherFields += ' experience_years avatar_url bio email created_at';
            courseFields = ''; // Все поля
        }

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query, detailLevel === 'admin' ? {} : courseFields)
                .populate('mainTeacher', teacherFields)
                .populate('difficultyLevel', 'name slug level color') // Исправлено на difficultyLevel
                .skip(skip)
                .limit(limit)
                .sort({ average_rating: -1, students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            category: {
                id: category._id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                color: category.color,
                icon: category.icon
            },
            courses,
            totalItems,
            currentPage: page,
            totalPages
        };
    }

    /**
     * Получение курса с предметами
     */
    async findByIdWithSubjects(id: string) {
        return await this.courseModel
            .findById(id)
            .populate('courseSubjects.subject', 'name description')
            .populate('courseSubjects.teacher', 'firstName lastName email')
            .exec();
    }

    /**
     * НОВЫЙ МЕТОД: Добавить предмет к курсу с назначением преподавателя
     */
    async addSubjectToCourse(
        courseId: string,
        subjectId: string,
        teacherId: string,
        startDate: Date,
        userId: string,
        isAdmin: boolean
    ): Promise<CourseDocument> {
        this.logger.log(`Добавление предмета ${subjectId} к курсу ${courseId}`);

        // Проверяем существование курса
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher?.toString() !== userId) {
            throw new ForbiddenException('Только админ или владелец курса может добавлять предметы');
        }

        // Проверяем существование предмета
        const subject = await this.subjectModel.findById(subjectId);
        if (!subject) {
            throw new NotFoundException('Предмет не найден');
        }

        // Проверяем существование преподавателя
        const teacher = await this.teacherModel.findById(teacherId);
        if (!teacher) {
            throw new NotFoundException('Преподаватель не найден');
        }

        // Проверяем, не добавлен ли уже этот предмет
        const existingSubject = course.courseSubjects.find(
            cs => cs.subject.toString() === subjectId
        );

        if (existingSubject) {
            throw new ConflictException('Этот предмет уже добавлен к курсу');
        }

        // Добавляем предмет к курсу
        course.courseSubjects.push({
            subject: subjectId as any,
            teacher: teacherId as any,
            startDate,
            isActive: true,
            addedAt: new Date()
        });

        const updatedCourse = await course.save();
        this.logger.log(`Предмет добавлен к курсу: ${courseId}`);

        return updatedCourse.populate(['courseSubjects.subject', 'courseSubjects.teacher']);
    }

    /**
     * НОВЫЙ МЕТОД: Добавить предмет (без преподавателя и даты)
     */
    async addSubject(
        courseId: string,
        subjectId: string,
        userId: string,
        isAdmin: boolean
    ): Promise<CourseDocument> {
        this.logger.log(`(Шаг 1) Добавление предмета ${subjectId} к курсу ${courseId}`);

        const course = await this.courseModel.findById(courseId);
        if (!course) throw new NotFoundException('Курс не найден');
        if (!isAdmin && course.mainTeacher?.toString() !== userId) {
            throw new ForbiddenException('Нет прав добавлять предмет к этому курсу');
        }

        const subject = await this.subjectModel.findById(subjectId);
        if (!subject) throw new NotFoundException('Предмет не найден');

        const exists = course.courseSubjects.find(cs => cs.subject.toString() === subjectId);
        if (exists) throw new ConflictException('Этот предмет уже добавлен');

        course.courseSubjects.push({
            subject: subjectId as any,
            teacher: null as any,
            startDate: null as any,
            isActive: true,
            addedAt: new Date()
        });

        const updated = await course.save();
        return updated.populate(['courseSubjects.subject', 'courseSubjects.teacher']);
    }

    /**
     * НОВЫЙ МЕТОД: Назначить / изменить преподавателя предмета
     */
    async setSubjectTeacher(
        courseId: string,
        subjectId: string,
        teacherId: string,
        userId: string,
        isAdmin: boolean
    ): Promise<CourseDocument> {
        this.logger.log(`(Шаг 2) Назначение преподавателя ${teacherId} предмету ${subjectId} в курсе ${courseId}`);

        const course = await this.courseModel.findById(courseId);
        if (!course) throw new NotFoundException('Курс не найден');
        if (!isAdmin && course.mainTeacher?.toString() !== userId) {
            throw new ForbiddenException('Нет прав изменять преподавателя');
        }

        const subjectEntry = course.courseSubjects.find(cs => cs.subject.toString() === subjectId);
        if (!subjectEntry) throw new NotFoundException('Предмет не добавлен к курсу');

        const teacher = await this.teacherModel.findById(teacherId);
        if (!teacher) throw new NotFoundException('Преподаватель не найден');

        subjectEntry.teacher = teacherId as any;
        const updated = await course.save();
        return updated.populate(['courseSubjects.subject', 'courseSubjects.teacher']);
    }

    /**
     * НОВЫЙ МЕТОД: Установить / изменить дату начала предмета
     */
    async setSubjectStartDate(
        courseId: string,
        subjectId: string,
        startDate: Date,
        userId: string,
        isAdmin: boolean
    ): Promise<CourseDocument> {
        this.logger.log(`(Шаг 3) Установка даты начала для предмета ${subjectId} в курсе ${courseId}`);

        const course = await this.courseModel.findById(courseId);
        if (!course) throw new NotFoundException('Курс не найден');
        if (!isAdmin && course.mainTeacher?.toString() !== userId) {
            throw new ForbiddenException('Нет прав изменять дату начала');
        }

        const subjectEntry = course.courseSubjects.find(cs => cs.subject.toString() === subjectId);
        if (!subjectEntry) throw new NotFoundException('Предмет не добавлен к курсу');

        subjectEntry.startDate = startDate;
        const updated = await course.save();
        return updated.populate(['courseSubjects.subject', 'courseSubjects.teacher']);
    }

    /**
     * НОВЫЙ МЕТОД: Удалить предмет из курса
     */
    async removeSubjectFromCourse(
        courseId: string,
        subjectId: string,
        userId: string,
        isAdmin: boolean
    ): Promise<CourseDocument> {
        this.logger.log(`Удаление предмета ${subjectId} из курса ${courseId}`);

        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher?.toString() !== userId) {
            throw new ForbiddenException('Только админ или владелец курса может удалять предметы');
        }

        // Находим и удаляем предмет
        const subjectIndex = course.courseSubjects.findIndex(
            cs => cs.subject.toString() === subjectId
        );

        if (subjectIndex === -1) {
            throw new NotFoundException('Предмет не найден в курсе');
        }

        course.courseSubjects.splice(subjectIndex, 1);
        const updatedCourse = await course.save();

        this.logger.log(`Предмет удален из курса: ${courseId}`);
        return updatedCourse;
    }

    /**
     * НОВЫЙ МЕТОД: Запись на курс с проверкой оплаты и дат
     */
    async enrollInCourse(
        courseId: string,
        userId: string,
        isAdmin: boolean = false
    ): Promise<SubscriptionDocument> {
        this.logger.log(`Запись пользователя ${userId} на курс ${courseId}`);

        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем, не записан ли уже пользователь
        const existingSubscription = await this.subscriptionModel.findOne({
            user: userId,
            course: courseId,
            status: { $in: ['active', 'paid'] }
        });

        if (existingSubscription) {
            throw new ConflictException('Пользователь уже записан на этот курс');
        }

        // Проверяем, не начался ли уже курс
        const now = new Date();
        const courseStarted = course.startDate <= now;

        if (courseStarted && !isAdmin) {
            throw new BadRequestException(
                'Курс уже начался. Запись возможна только через администратора'
            );
        }

        // Проверяем лимит студентов
        if (course.current_students_count >= course.max_students) {
            throw new ConflictException('Достигнут максимум студентов на курсе');
        }

        // В реальном проекте здесь была бы проверка оплаты
        // const paymentRequired = course.price > 0 && !isAdmin;
        // if (paymentRequired) {
        //     const payment = await this.checkUserPaymentStatus(userId, courseId);
        //     if (!payment || payment.status !== 'paid') {
        //         throw new BadRequestException('Для записи на курс необходима оплата');
        //     }
        // }

        // Создаем подписку
        const subscription = new this.subscriptionModel({
            user: userId,
            course: courseId,
            status: 'active',
            enrolledAt: new Date(),
            enrolledBy: isAdmin ? 'admin' : 'self'
        });

        await subscription.save();

        // Обновляем счетчик студентов
        await this.courseModel.findByIdAndUpdate(courseId, {
            $inc: { current_students_count: 1 }
        });

        this.logger.log(`Пользователь записан на курс: ${courseId}`);
        return subscription;
    }

    /**
     * НОВЫЙ МЕТОД: Административная запись на курс (даже после начала)
     */
    async adminEnrollInCourse(
        courseId: string,
        enrollDto: { userId: string; forceEnroll?: boolean }
    ): Promise<SubscriptionDocument> {
        this.logger.log(`Административная запись пользователя ${enrollDto.userId} на курс ${courseId}`);

        // Используем обычную запись с флагом админа
        return this.enrollInCourse(courseId, enrollDto.userId, true);
    }

    /**
     * НОВЫЙ МЕТОД: Обновить дату начала курса (только админ)
     */
    async updateStartDate(courseId: string, startDate: Date): Promise<CourseDocument> {
        this.logger.log(`Обновление даты начала курса ${courseId} на ${startDate}`);

        const course = await this.courseModel.findByIdAndUpdate(
            courseId,
            { startDate },
            { new: true }
        );

        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        return course;
    }

    /**
     * НОВЫЙ МЕТОД: Получить предметы курса
     */
    async getCourseSubjects(courseId: string): Promise<any[]> {
        const course = await this.courseModel.findById(courseId)
            .populate({
                path: 'courseSubjects.subject',
                select: 'name description studyMaterials'
            })
            .populate({
                path: 'courseSubjects.teacher',
                select: 'name second_name email experience_years'
            });

        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        return course.courseSubjects;
    }

    // HELPER методы для проверки оплаты (заглушка)
    private async checkUserPaymentStatus(userId: string, courseId: string): Promise<{ status: string } | null> {
        // Заглушка для интеграции с платежной системой
        // В реальном проекте здесь будет проверка в базе платежей
        return { status: 'paid' };
    }
}


