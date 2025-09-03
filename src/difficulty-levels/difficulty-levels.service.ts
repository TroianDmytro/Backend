// src/difficulty-levels/difficulty-levels.service.ts - ПОЛНАЯ ВЕРСИЯ
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { DifficultyLevel, DifficultyLevelDocument } from './schemas/difficulty-level.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateDifficultyLevelDto } from './dto/create-difficulty-level.dto';
import { UpdateDifficultyLevelDto } from './dto/update-difficulty-level.dto';

@Injectable()
export class DifficultyLevelsService {
    private readonly logger = new Logger(DifficultyLevelsService.name);

    constructor(
        @InjectModel(DifficultyLevel.name) private difficultyLevelModel: Model<DifficultyLevelDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>
    ) {
        this.initDefaultLevels();
    }

    /**
     * Инициализация стандартных уровней сложности при старте приложения
     */
    private async initDefaultLevels() {
        const count = await this.difficultyLevelModel.estimatedDocumentCount();
        if (count === 0) {
            const defaultLevels = [
                {
                    name: 'Начинающий',
                    slug: 'beginner',
                    code: 'beginner',
                    level: 1,
                    description: 'Для тех, кто только начинает изучать предмет',
                    short_description: 'Начните с основ',
                    icon: 'fas fa-seedling',
                    color: '#28a745',
                    order: 1,
                    prerequisites: ['Отсутствуют предварительные требования'],
                    target_audience: ['Новички', 'Студенты без опыта'],
                    recommended_hours: 20,
                    min_experience_years: 0,
                    isActive: true
                },
                {
                    name: 'Средний',
                    slug: 'intermediate',
                    code: 'intermediate',
                    level: 5,
                    description: 'Для тех, кто имеет базовые знания',
                    short_description: 'Развивайте навыки дальше',
                    icon: 'fas fa-chart-line',
                    color: '#ffc107',
                    order: 2,
                    prerequisites: ['Базовые знания предмета'],
                    target_audience: ['Изучающие с опытом', 'Специалисты начального уровня'],
                    recommended_hours: 40,
                    min_experience_years: 1,
                    isActive: true
                },
                {
                    name: 'Продвинутый',
                    slug: 'advanced',
                    code: 'advanced',
                    level: 9,
                    description: 'Для опытных изучающих предмет',
                    short_description: 'Для экспертов',
                    icon: 'fas fa-crown',
                    color: '#dc3545',
                    order: 3,
                    prerequisites: ['Глубокие знания предмета', 'Практический опыт'],
                    target_audience: ['Опытные специалисты', 'Эксперты'],
                    recommended_hours: 60,
                    min_experience_years: 3,
                    isActive: true
                }
            ];

            for (const level of defaultLevels) {
                await this.difficultyLevelModel.create(level);
            }

            this.logger.log('Созданы стандартные уровни сложности');
        }
    }

    /**
     * Создание нового уровня сложности
     */
    async create(createDifficultyLevelDto: CreateDifficultyLevelDto): Promise<DifficultyLevelDocument> {
        // Проверяем уникальность кода
        const existingLevelByCode = await this.difficultyLevelModel.findOne({
            code: createDifficultyLevelDto.code
        }).exec();

        if (existingLevelByCode) {
            throw new ConflictException(`Уровень сложности с кодом "${createDifficultyLevelDto.code}" уже существует`);
        }

        // Проверяем уникальность slug
        const existingLevelBySlug = await this.difficultyLevelModel.findOne({
            slug: createDifficultyLevelDto.slug
        }).exec();

        if (existingLevelBySlug) {
            throw new ConflictException(`Уровень сложности со slug "${createDifficultyLevelDto.slug}" уже существует`);
        }

        const newLevel = new this.difficultyLevelModel({
            ...createDifficultyLevelDto,
            courses_count: 0,
            students_count: 0,
            average_rating: 0
        });

        const savedLevel = await newLevel.save();
        this.logger.log(`Создан уровень сложности: ${savedLevel.name} (ID: ${savedLevel.id})`);

        return savedLevel;
    }

    /**
     * Получение всех уровней сложности
     */
    async findAll(includeInactive: boolean = false): Promise<DifficultyLevelDocument[]> {
        const filter: any = {};

        if (!includeInactive) {
            filter.isActive = true;
        }

        return this.difficultyLevelModel
            .find(filter)
            .sort({ level: 1, order: 1 })
            .exec();
    }

    /**
     * Получение уровня сложности по ID
     */
    async findById(id: string): Promise<DifficultyLevelDocument | null> {
        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        return this.difficultyLevelModel.findById(id).exec();
    }

    /**
     * Получение уровня сложности по коду
     */
    async findByCode(code: string): Promise<DifficultyLevelDocument | null> {
        return this.difficultyLevelModel.findOne({ code, isActive: true }).exec();
    }

    /**
     * Получение уровня сложности по slug
     */
    async findBySlug(slug: string): Promise<DifficultyLevelDocument | null> {
        return this.difficultyLevelModel.findOne({ slug, isActive: true }).exec();
    }

    /**
     * Обновление уровня сложности
     */
    async update(id: string, updateDifficultyLevelDto: UpdateDifficultyLevelDto): Promise<DifficultyLevelDocument> {
        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        const level = await this.difficultyLevelModel.findById(id).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${id} не найден`);
        }

        // Проверяем уникальность кода, если он меняется
        if (updateDifficultyLevelDto.code && updateDifficultyLevelDto.code !== level.code) {
            const existingLevel = await this.difficultyLevelModel.findOne({
                code: updateDifficultyLevelDto.code,
                _id: { $ne: id }
            }).exec();

            if (existingLevel) {
                throw new ConflictException(`Уровень сложности с кодом "${updateDifficultyLevelDto.code}" уже существует`);
            }
        }

        // Проверяем уникальность slug, если он меняется
        if (updateDifficultyLevelDto.slug && updateDifficultyLevelDto.slug !== level.slug) {
            const existingLevel = await this.difficultyLevelModel.findOne({
                slug: updateDifficultyLevelDto.slug,
                _id: { $ne: id }
            }).exec();

            if (existingLevel) {
                throw new ConflictException(`Уровень сложности со slug "${updateDifficultyLevelDto.slug}" уже существует`);
            }
        }

        Object.assign(level, updateDifficultyLevelDto);
        const updatedLevel = await level.save();

        this.logger.log(`Обновлен уровень сложности: ${id}`);
        return updatedLevel;
    }

    /**
     * Удаление уровня сложности
     */
    async delete(id: string): Promise<void> {
        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        const level = await this.difficultyLevelModel.findById(id).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${id} не найден`);
        }

        // Проверяем наличие курсов с этим уровнем сложности
        const coursesCount = await this.courseModel.countDocuments({
            difficultyLevelId: id
        }).exec();

        if (coursesCount > 0) {
            throw new ConflictException(
                `Нельзя удалить уровень сложности с курсами. Количество курсов: ${coursesCount}`
            );
        }

        await this.difficultyLevelModel.findByIdAndDelete(id).exec();
        this.logger.log(`Удален уровень сложности: ${id}`);
    }

    /**
     * Получение курсов уровня сложности (краткая информация для карточек)
     */
    async getLevelCourses(
        levelId: string,
        page: number = 1,
        limit: number = 12,
        onlyPublished: boolean = true
    ) {
        if (!this.isValidObjectId(levelId)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        const level = await this.difficultyLevelModel.findById(levelId).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${levelId} не найден`);
        }

        const skip = (page - 1) * limit;
        const filter: any = { difficultyLevelId: levelId };

        if (onlyPublished) {
            filter.isPublished = true;
            filter.is_active = true;
        }

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .select('title short_description logo_url price discount_price currency rating reviews_count current_students_count duration_hours lessons_count')
                .populate('teacherId', 'name second_name rating')
                .populate('categoryId', 'name slug color icon')
                .skip(skip)
                .limit(limit)
                .sort({ rating: -1, current_students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(filter).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        // Преобразуем данные для карточек
        const courseCards = courses.map(course => ({
            id: course.id,
            title: course.title,
            short_description: course.short_description,
            logo_url: course.logo_url,
            price: course.price,
            discount_price: course.price * (1 - (course.discount_percent || 0) / 100),
            currency: course.currency,
            rating: course.rating,
            reviews_count: course.reviews_count,
            current_students_count: course.current_students_count,
            duration_hours: course.duration_hours,
            lessons_count: course.lessons_count,
            category: course.category ? {
                name: (course.category as any).name,
                slug: (course.category as any).slug,
                color: (course.category as any).color,
                icon: (course.category as any).icon
            } : null,
            teacher: course.mainTeacher ? {
                id: (course.mainTeacher as any).id,
                name: (course.mainTeacher as any).name,
                second_name: (course.mainTeacher as any).second_name,
                rating: (course.mainTeacher as any).rating
            } : null
        }));

        return {
            courses: courseCards,
            totalItems,
            totalPages,
            level
        };
    }

    /**
     * Получение полной информации о курсах уровня сложности (для пользователей)
     */
    async getLevelCoursesDetailed(
        levelId: string,
        page: number = 1,
        limit: number = 10
    ) {
        if (!this.isValidObjectId(levelId)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        const level = await this.difficultyLevelModel.findById(levelId).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${levelId} не найден`);
        }

        const skip = (page - 1) * limit;
        const filter: any = {
            difficultyLevelId: levelId,
            isPublished: true,
            is_active: true
        };

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .select('-__v')
                .populate('teacherId', '-password -verificationToken -resetPasswordToken')
                .populate('categoryId')
                .skip(skip)
                .limit(limit)
                .sort({ rating: -1, current_students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(filter).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            level,
            courses,
            totalItems,
            totalPages,
            currentPage: page
        };
    }

    /**
     * Получение полной информации о курсах уровня сложности (для админов)
     */
    async getLevelCoursesAdmin(
        levelId: string,
        page: number = 1,
        limit: number = 10
    ) {
        if (!this.isValidObjectId(levelId)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        const level = await this.difficultyLevelModel.findById(levelId).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${levelId} не найден`);
        }

        const skip = (page - 1) * limit;
        const filter: any = { difficultyLevelId: levelId };

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .populate('teacherId')
                .populate('categoryId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.courseModel.countDocuments(filter).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            level,
            courses,
            totalItems,
            totalPages,
            currentPage: page,
            statistics: {
                totalCourses: totalItems,
                publishedCourses: courses.filter(c => c.isPublished).length,
                activeCourses: courses.filter(c => c.isActive).length,
                totalStudents: courses.reduce((sum, c) => sum + (c.current_students_count || 0), 0),
                averageRating: courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length || 0
            }
        };
    }

    /**
     * Обновление статистики уровня сложности
     */
    async updateLevelStatistics(levelId: string): Promise<void> {
        if (!this.isValidObjectId(levelId)) {
            throw new BadRequestException('Некорректный ID уровня сложности');
        }

        // Подсчитываем количество курсов
        const coursesCount = await this.courseModel.countDocuments({
            difficultyLevelId: levelId,
            is_active: true,
            isPublished: true
        }).exec();

        // Получаем все курсы для подсчета студентов и рейтинга
        const courses = await this.courseModel
            .find({
                difficultyLevelId: levelId,
                is_active: true,
                isPublished: true
            })
            .select('current_students_count rating')
            .exec();

        const studentsCount = courses.reduce((sum, course) => {
            return sum + (course.current_students_count || 0);
        }, 0);

        const averageRating = courses.length > 0
            ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length
            : 0;

        // Обновляем статистику
        await this.difficultyLevelModel.findByIdAndUpdate(levelId, {
            courses_count: coursesCount,
            students_count: studentsCount,
            average_rating: Math.round(averageRating * 100) / 100
        }).exec();

        this.logger.log(`Обновлена статистика уровня сложности ${levelId}: курсов - ${coursesCount}, студентов - ${studentsCount}, рейтинг - ${averageRating.toFixed(2)}`);
    }

    /**
     * Массовое обновление статистики всех уровней сложности
     */
    async updateAllLevelsStatistics(): Promise<void> {
        this.logger.log('Начало обновления статистики всех уровней сложности');

        const levels = await this.difficultyLevelModel.find().exec();

        for (const level of levels) {
            await this.updateLevelStatistics(level.id);
        }

        this.logger.log('Статистика всех уровней сложности обновлена');
    }

    /**
     * Получение общей статистики уровней сложности
     */
    async getStatistics() {
        const levels = await this.difficultyLevelModel.find().exec();

        const statistics = {
            totalLevels: levels.length,
            activeLevels: levels.filter(l => l.isActive).length,
            inactiveLevels: levels.filter(l => !l.isActive).length,
            totalCourses: levels.reduce((sum, l) => sum + l.courses_count, 0),
            totalStudents: levels.reduce((sum, l) => sum + l.students_count, 0),
            averageRating: levels.length > 0
                ? levels.reduce((sum, l) => sum + l.average_rating, 0) / levels.length
                : 0,
            levelBreakdown: levels.map(level => ({
                id: level.id,
                name: level.name,
                code: level.code,
                level: level.level,
                courses_count: level.courses_count,
                students_count: level.students_count,
                average_rating: level.average_rating,
                isActive: level.isActive
            })).sort((a, b) => a.level - b.level)
        };

        return statistics;
    }

    /**
     * Получение популярных уровней сложности
     */
    async getPopularLevels(limit: number = 3): Promise<DifficultyLevelDocument[]> {
        return this.difficultyLevelModel
            .find({ isActive: true })
            .sort({ students_count: -1, courses_count: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Поиск уровней сложности по тексту
     */
    async searchLevels(searchQuery: string): Promise<DifficultyLevelDocument[]> {
        return this.difficultyLevelModel
            .find({
                isActive: true,
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { code: { $regex: searchQuery, $options: 'i' } }
                ]
            })
            .sort({ level: 1 })
            .exec();
    }

    /**
     * Получение рекомендуемого уровня для курса на основе его характеристик
     */
    async getRecommendedLevel(courseData: {
        prerequisites?: string[];
        targetAudience?: string[];
        estimatedHours?: number;
    }): Promise<DifficultyLevelDocument | null> {
        const { prerequisites = [], targetAudience = [], estimatedHours = 0 } = courseData;

        // Простая логика определения уровня
        const hasPrerequisites = prerequisites.length > 0;
        const isForBeginners = targetAudience.some(audience =>
            audience.toLowerCase().includes('начинающ') ||
            audience.toLowerCase().includes('новичок')
        );
        const isForAdvanced = targetAudience.some(audience =>
            audience.toLowerCase().includes('опытн') ||
            audience.toLowerCase().includes('эксперт')
        );

        let recommendedCode = 'beginner';

        if (isForAdvanced || estimatedHours > 50) {
            recommendedCode = 'advanced';
        } else if (hasPrerequisites || estimatedHours > 25) {
            recommendedCode = 'intermediate';
        } else if (isForBeginners) {
            recommendedCode = 'beginner';
        }

        return this.findByCode(recommendedCode);
    }

    /**
     * Проверка валидности ObjectId
     */
    private isValidObjectId(id: string): boolean {
        return mongoose.Types.ObjectId.isValid(id);
    }
}

/**
 * ПОДРОБНОЕ ОБЪЯСНЕНИЕ СЕРВИСА УРОВНЕЙ СЛОЖНОСТИ:
 * 
 * 1. **ИНИЦИАЛИЗАЦИЯ:**
 *    - При запуске создает 3 стандартных уровня: начинающий, средний, продвинутый
 *    - Каждый уровень имеет уникальный код, slug, числовой уровень и цвет
 * 
 * 2. **CRUD ОПЕРАЦИИ:**
 *    - create() - создание с проверкой уникальности кода и slug
 *    - findAll() - получение всех с возможностью включения неактивных
 *    - findById/findByCode/findBySlug - разные способы поиска
 *    - update() - обновление с проверкой уникальности
 *    - delete() - удаление с проверкой связанных курсов
 * 
 * 3. **РАБОТА С КУРСАМИ:**
 *    - getLevelCourses() - карточки курсов для каталога
 *    - getLevelCoursesDetailed() - полная информация для пользователей
 *    - getLevelCoursesAdmin() - административная информация
 * 
 * 4. **СТАТИСТИКА:**
 *    - updateLevelStatistics() - пересчет для одного уровня
 *    - updateAllLevelsStatistics() - массовое обновление
 *    - getStatistics() - общая статистика по всем уровням
 * 
 * 5. **ДОПОЛНИТЕЛЬНЫЕ ВОЗМОЖНОСТИ:**
 *    - getPopularLevels() - популярные уровни по количеству студентов
 *    - searchLevels() - поиск по названию, описанию, коду
 *    - getRecommendedLevel() - рекомендация уровня для курса
 * 
 * 6. **АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ:**
 *    - Статистика обновляется при изменениях курсов
 *    - Подсчет студентов, курсов, среднего рейтинга
 */