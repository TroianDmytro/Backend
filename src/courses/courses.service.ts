// src/courses/courses.service.ts - ПОЛНАЯ ВЕРСИЯ
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import { Category } from '../categories/schemas/category.schema';
import { DifficultyLevel } from '../difficulty-levels/schemas/difficulty-level.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';


@Injectable()
export class CoursesService {
    private readonly logger = new Logger(CoursesService.name);

    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        @InjectModel(DifficultyLevel.name) private difficultyLevelModel: Model<DifficultyLevel>,
    ) { }

    /**
     * МЕТОД: Создание нового курса с проверкой всех связей
     * 
     * Алгоритм работы:
     * 1. Проверяем существование всех связанных сущностей (преподаватель, категория, уровень)
     * 2. Проверяем уникальность slug
     * 3. Создаем курс
     * 4. Обновляем статистику всех связанных сущностей
     */
    async create(createCourseDto: CreateCourseDto): Promise<Course> {
        this.logger.log(`Создание курса: ${createCourseDto.title}`);

        // 1. Проверяем существование преподавателя
        const teacher = await this.teacherModel.findById(createCourseDto.teacherId);
        if (!teacher) {
            throw new NotFoundException('Преподаватель не найден');
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

        // 5. Создаем курс
        const course = new this.courseModel({
            ...createCourseDto,
            published_at: new Date(),
        });

        const savedCourse = await course.save();

        // 6. Обновляем статистику связанных сущностей
        await Promise.all([
            this.updateTeacherStatistics(createCourseDto.teacherId),
            this.updateCategoryStatistics(createCourseDto.categoryId),
            this.updateDifficultyLevelStatistics(createCourseDto.difficultyLevelId)
        ]);

        this.logger.log(`Курс создан с ID: ${savedCourse._id}`);
        return savedCourse;
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
                query.categoryId = filters.category;
            } else {
                const category = await this.categoryModel.findOne({ slug: filters.category });
                if (category) {
                    query.categoryId = category._id;
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
                query.difficultyLevelId = filters.difficulty_level;
            } else {
                const difficultyLevel = await this.difficultyLevelModel.findOne({
                    $or: [
                        { slug: filters.difficulty_level },
                        { code: filters.difficulty_level }
                    ]
                });
                if (difficultyLevel) {
                    query.difficultyLevelId = difficultyLevel._id;
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
            query.teacherId = filters.teacher_id;
        }

        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }

        if (filters.is_featured !== undefined) {
            query.is_featured = filters.is_featured;
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
                .populate('teacherId', 'name second_name rating experience_years avatar_url')
                .populate('categoryId', 'name slug description color icon')
                .populate('difficultyLevelId', 'name slug level color description')
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
            .populate('teacherId', 'name second_name email rating experience_years avatar_url bio')
            .populate('categoryId', 'name slug description color icon parent_id')
            .populate('difficultyLevelId', 'name slug level color description requirements')
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
            .populate('teacherId', 'name second_name email rating experience_years avatar_url bio')
            .populate('categoryId', 'name slug description color icon parent_id')
            .populate('difficultyLevelId', 'name slug level color description requirements')
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
        const oldTeacherId = existingCourse.teacherId;
        const oldCategoryId = existingCourse.categoryId;
        const oldDifficultyLevelId = existingCourse.difficultyLevelId;

        // Обновляем курс
        const updatedCourse = await this.courseModel
            .findByIdAndUpdate(
                id,
                { ...updateCourseDto, updated_at: new Date() },
                { new: true, runValidators: true }
            )
            .populate('teacherId', 'name second_name rating experience_years avatar_url')
            .populate('categoryId', 'name slug description color icon')
            .populate('difficultyLevelId', 'name slug level color description')
            .exec();

        if (!updatedCourse) {
            throw new NotFoundException(`Курс с ID ${id} не найден после обновления`);
        }

        // Обновляем статистику для всех затронутых сущностей
        const statsUpdates: Promise<void>[] = [];

        // Обновляем статистику преподавателей
        if (updateCourseDto.teacherId && updateCourseDto.teacherId !== oldTeacherId.toString()) {
            statsUpdates.push(this.updateTeacherStatistics(oldTeacherId.toString()));
            statsUpdates.push(this.updateTeacherStatistics(updateCourseDto.teacherId));
        } else if (oldTeacherId) {
            statsUpdates.push(this.updateTeacherStatistics(oldTeacherId.toString()));
        }

        // Обновляем статистику категорий
        if (updateCourseDto.categoryId && updateCourseDto.categoryId !== oldCategoryId.toString()) {
            statsUpdates.push(this.updateCategoryStatistics(oldCategoryId.toString()));
            statsUpdates.push(this.updateCategoryStatistics(updateCourseDto.categoryId));
        } else if (oldCategoryId) {
            statsUpdates.push(this.updateCategoryStatistics(oldCategoryId.toString()));
        }

        // Обновляем статистику уровней сложности
        if (updateCourseDto.difficultyLevelId && updateCourseDto.difficultyLevelId !== oldDifficultyLevelId.toString()) {
            statsUpdates.push(this.updateDifficultyLevelStatistics(oldDifficultyLevelId.toString()));
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
        const teacherId = course.teacherId;
        const categoryId = course.categoryId;
        const difficultyLevelId = course.difficultyLevelId;

        // Удаляем курс
        await this.courseModel.findByIdAndDelete(id);

        // Обновляем статистику связанных сущностей
        await Promise.all([
            this.updateTeacherStatistics(teacherId.toString()),
            this.updateCategoryStatistics(categoryId.toString()),
            this.updateDifficultyLevelStatistics(difficultyLevelId.toString())
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
        const query = { difficultyLevelId, is_active: true };

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
                .populate('teacherId', teacherFields)
                .populate('categoryId', 'name slug color icon')
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
            .populate('teacherId', 'name second_name rating experience_years avatar_url')
            .populate('categoryId', 'name slug color icon')
            .populate('difficultyLevelId', 'name slug level color')
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
            query.categoryId = filters.categoryId;
        }

        if (filters.difficultyLevelId) {
            query.difficultyLevelId = filters.difficultyLevelId;
        }

        if (filters.teacherId) {
            query.teacherId = filters.teacherId;
        }

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query)
                .populate('teacherId', 'name second_name rating experience_years avatar_url')
                .populate('categoryId', 'name slug color icon')
                .populate('difficultyLevelId', 'name slug level color')
                .skip(skip)
                .limit(limit)
                .sort({
                    // Используем простую сортировку вместо сложного выражения
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
     * ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ для обновления статистики
     */
    private async updateTeacherStatistics(teacherId: string): Promise<void> {
        try {
            const stats = await this.courseModel.aggregate([
                { $match: { teacherId: new mongoose.Types.ObjectId(teacherId) } },
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
            }
        } catch (error) {
            this.logger.error(`Ошибка обновления статистики преподавателя ${teacherId}:`, error);
        }
    }

    private async updateCategoryStatistics(categoryId: string): Promise<void> {
        try {
            const stats = await this.courseModel.aggregate([
                { $match: { categoryId: new mongoose.Types.ObjectId(categoryId), is_active: true } },
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
                { $match: { difficultyLevelId: new mongoose.Types.ObjectId(difficultyLevelId), is_active: true } },
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
            .find({ isActive: true, isPublished: true })
            .sort({ students_count: -1, average_rating: -1 })
            .limit(limit)
            .populate('teacherId', 'name second_name rating')
            .populate('categoryId', 'name slug')
            .populate('difficultyLevelId', 'name level color')
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
        delete courseData._id;
        delete courseData.id;

        // Изменяем название и отмечаем как неопубликованный
        const newCourse = new this.courseModel({
            ...courseData,
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
        const query = { categoryId, is_active: true };

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
                .populate('teacherId', teacherFields)
                .populate('difficultyLevelId', 'name slug level color')
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
}

/**
 * ПОДРОБНОЕ ОБЪЯСНЕНИЕ СЕРВИСА КУРСОВ:
 * 
 * 1. **ОСНОВНЫЕ CRUD ОПЕРАЦИИ:**
 *    - create() - создание с валидацией связей и обновлением статистики
 *    - findAll() - получение с расширенной фильтрацией и поиском
 *    - findById() - получение по ID с полным populate
 *    - findBySlug() - получение по slug для SEO-дружелюбных URL
 *    - update() - обновление с проверкой изменений связей
 *    - delete() - удаление с каскадным обновлением статистики
 * 
 * 2. **СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ:**
 *    - getCoursesByCategory() - курсы категории с уровнями детализации
 *    - getCoursesByDifficultyLevel() - курсы по уровню сложности
 *    - getFeaturedCourses() - рекомендуемые курсы
 *    - searchCourses() - полнотекстовый поиск с фильтрами
 * 
 * 3. **УРОВНИ ДЕТАЛИЗАЦИИ:**
 *    - 'card' - для карточек курсов (минимум данных)
 *    - 'full' - полная информация для пользователей
 *    - 'admin' - вся информация включая админские данные
 * 
 * 4. **АВТОМАТИЧЕСКАЯ СТАТИСТИКА:**
 *    - Обновление количества курсов у преподавателей
 *    - Обновление количества курсов в категориях
 *    - Обновление статистики уровней сложности
 * 
 * 5. **ВАЛИДАЦИЯ И ПРОВЕРКИ:**
 *    - Проверка существования связанных сущностей
 *    - Валидация ObjectId
 *    - Проверка уникальности slug
 *    - Обработка ошибок с подробными сообщениями
 * 
 * 6. **ПРОИЗВОДИТЕЛЬНОСТЬ:**
 *    - Параллельные запросы где возможно
 *    - Индексы на часто используемые поля
 *    - Селективный populate в завис
 **/