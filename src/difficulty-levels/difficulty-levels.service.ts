// src/difficulty-levels/difficulty-levels.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DifficultyLevel, DifficultyLevelDocument } from './schemas/difficulty-level.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Subscription, SubscriptionDocument } from '../subscriptions/schemas/subscription.schema';
import { CreateDifficultyLevelDto } from './dto/create-difficulty-level.dto';
import { UpdateDifficultyLevelDto } from './dto/update-difficulty-level.dto';

@Injectable()
export class DifficultyLevelsService {
    private readonly logger = new Logger(DifficultyLevelsService.name);

    constructor(
        @InjectModel(DifficultyLevel.name) private difficultyLevelModel: Model<DifficultyLevelDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
    ) {
        // Инициализация стандартных уровней при старте
        this.initDefaultLevels();
    }

    /**
     * Инициализация стандартных уровней сложности
     */
    private async initDefaultLevels() {
        const count = await this.difficultyLevelModel.estimatedDocumentCount();
        if (count === 0) {
            const defaultLevels = [
                {
                    name: 'Начальный',
                    slug: 'beginner',
                    code: 'beginner',
                    description: 'Для тех, кто только начинает изучать предмет',
                    short_description: 'Начните с основ',
                    icon: 'fas fa-user-graduate',
                    color: '#4caf50',
                    level: 1,
                    order: 1,
                    prerequisites: ['Базовые навыки работы с компьютером'],
                    target_audience: ['Новички', 'Студенты без опыта'],
                    recommended_hours: 20,
                    min_experience_years: 0
                },
                {
                    name: 'Средний',
                    slug: 'intermediate',
                    code: 'intermediate',
                    description: 'Для тех, кто уже имеет базовые знания',
                    short_description: 'Развивайте навыки',
                    icon: 'fas fa-user-cog',
                    color: '#ff9800',
                    level: 2,
                    order: 2,
                    prerequisites: ['Базовые знания в предметной области'],
                    target_audience: ['Студенты с базовыми знаниями', 'Начинающие специалисты'],
                    recommended_hours: 40,
                    min_experience_years: 1
                },
                {
                    name: 'Продвинутый',
                    slug: 'advanced',
                    code: 'advanced',
                    description: 'Для опытных специалистов',
                    short_description: 'Станьте экспертом',
                    icon: 'fas fa-user-tie',
                    color: '#f44336',
                    level: 3,
                    order: 3,
                    prerequisites: ['Глубокие знания в предметной области', 'Практический опыт'],
                    target_audience: ['Опытные специалисты', 'Профессионалы'],
                    recommended_hours: 60,
                    min_experience_years: 3
                }
            ];

            for (const level of defaultLevels) {
                await this.difficultyLevelModel.create(level);
            }

            this.logger.log('Стандартные уровни сложности созданы');
        }
    }

    /**
     * Создание нового уровня сложности
     */
    async create(createDifficultyLevelDto: CreateDifficultyLevelDto): Promise<DifficultyLevelDocument> {
        // Проверяем уникальность slug, code и level
        const existingBySlug = await this.difficultyLevelModel.findOne({
            slug: createDifficultyLevelDto.slug
        }).exec();

        if (existingBySlug) {
            throw new ConflictException(`Уровень со slug "${createDifficultyLevelDto.slug}" уже существует`);
        }

        const existingByCode = await this.difficultyLevelModel.findOne({
            code: createDifficultyLevelDto.code
        }).exec();

        if (existingByCode) {
            throw new ConflictException(`Уровень с кодом "${createDifficultyLevelDto.code}" уже существует`);
        }

        const existingByLevel = await this.difficultyLevelModel.findOne({
            level: createDifficultyLevelDto.level
        }).exec();

        if (existingByLevel) {
            throw new ConflictException(`Уровень с числовым значением ${createDifficultyLevelDto.level} уже существует`);
        }

        const newLevel = new this.difficultyLevelModel({
            ...createDifficultyLevelDto,
            courses_count: 0,
            students_count: 0,
            average_completion_rate: 0
        });

        const savedLevel = await newLevel.save();
        this.logger.log(`Создан уровень сложности: ${savedLevel.name} (ID: ${savedLevel.id})`);

        return savedLevel;
    }

    /**
     * Получение всех уровней сложности
     */
    async findAll(onlyActive: boolean = false): Promise<DifficultyLevelDocument[]> {
        const filter: any = {};

        if (onlyActive) {
            filter.isActive = true;
        }

        return this.difficultyLevelModel
            .find(filter)
            .sort({ level: 1, order: 1 })
            .exec();
    }

    /**
     * Получение уровня по ID
     */
    async findById(id: string): Promise<DifficultyLevelDocument | null> {
        return this.difficultyLevelModel.findById(id).exec();
    }

    /**
     * Получение уровня по slug
     */
    async findBySlug(slug: string): Promise<DifficultyLevelDocument | null> {
        return this.difficultyLevelModel.findOne({ slug }).exec();
    }

    /**
     * Получение уровня по коду
     */
    async findByCode(code: string): Promise<DifficultyLevelDocument | null> {
        return this.difficultyLevelModel.findOne({ code }).exec();
    }

    /**
     * Обновление уровня сложности
     */
    async update(id: string, updateDto: UpdateDifficultyLevelDto): Promise<DifficultyLevelDocument> {
        const level = await this.difficultyLevelModel.findById(id).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${id} не найден`);
        }

        // Проверяем уникальность при изменении
        if (updateDto.slug && updateDto.slug !== level.slug) {
            const existing = await this.difficultyLevelModel.findOne({
                slug: updateDto.slug,
                _id: { $ne: id }
            }).exec();

            if (existing) {
                throw new ConflictException(`Уровень со slug "${updateDto.slug}" уже существует`);
            }
        }

        if (updateDto.code && updateDto.code !== level.code) {
            const existing = await this.difficultyLevelModel.findOne({
                code: updateDto.code,
                _id: { $ne: id }
            }).exec();

            if (existing) {
                throw new ConflictException(`Уровень с кодом "${updateDto.code}" уже существует`);
            }
        }

        if (updateDto.level && updateDto.level !== level.level) {
            const existing = await this.difficultyLevelModel.findOne({
                level: updateDto.level,
                _id: { $ne: id }
            }).exec();

            if (existing) {
                throw new ConflictException(`Уровень с числовым значением ${updateDto.level} уже существует`);
            }
        }

        Object.assign(level, updateDto);
        const updatedLevel = await level.save();

        this.logger.log(`Обновлен уровень сложности: ${id}`);
        return updatedLevel;
    }

    /**
     * Удаление уровня сложности
     */
    async delete(id: string): Promise<void> {
        const level = await this.difficultyLevelModel.findById(id).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${id} не найден`);
        }

        // Проверяем наличие курсов с этим уровнем
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
     * Получение курсов по уровню сложности (краткая информация)
     */
    async getLevelCourses(
        levelId: string,
        page: number = 1,
        limit: number = 12,
        onlyPublished: boolean = true
    ): Promise<{
        courses: any[];
        totalItems: number;
        totalPages: number;
        level: DifficultyLevelDocument;
    }> {
        const level = await this.difficultyLevelModel.findById(levelId).exec();
        if (!level) {
            throw new NotFoundException(`Уровень сложности с ID ${levelId} не найден`);
        }

        const skip = (page - 1) * limit;
        const filter: any = { difficultyLevelId: levelId };

        if (onlyPublished) {
            filter.isPublished = true;
            filter.isActive = true;
        }

        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .select('title short_description logo_url price discount_price currency rating reviews_count current_students_count duration_hours lessons_count')
                .populate('teacherId', 'name second_name rating')
                .populate('categoryId', 'name slug')
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
            discount_price: course.discount_price,
            currency: course.currency,
            rating: course.rating,
            reviews_count: course.reviews_count,
            current_students_count: course.current_students_count,
            duration_hours: course.duration_hours,
            lessons_count: course.lessons_count,
            category: course.categoryId ? {
                id: (course.categoryId as any).id,
                name: (course.categoryId as any).name,
                slug: (course.categoryId as any).slug
            } : null,
            teacher: course.teacherId ? {
                id: (course.teacherId as any).id,
                name: (course.teacherId as any).name,
                second_name: (course.teacherId as any).second_name,
                rating: (course.teacherId as any).rating
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
     * Обновление статистики уровня сложности
     */
    async updateLevelStatistics(levelId: string): Promise<void> {
        // Подсчитываем количество курсов
        const coursesCount = await this.courseModel.countDocuments({
            difficultyLevelId: levelId,
            isActive: true,
            isPublished: true
        }).exec();

        // Получаем все курсы для подсчета студентов
        const courses = await this.courseModel
            .find({
                difficultyLevelId: levelId,
                isActive: true,
                isPublished: true
            })
            .select('_id current_students_count')
            .exec();

        const courseIds = courses.map(c => c._id);
        const studentsCount = courses.reduce((sum, course) => {
            return sum + (course.current_students_count || 0);
        }, 0);

        // Подсчитываем средний процент завершения
        let averageCompletionRate = 0;
        if (courseIds.length > 0) {
            const completionData = await this.subscriptionModel.aggregate([
                {
                    $match: {
                        courseId: { $in: courseIds },
                        status: { $in: ['active', 'completed'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgCompletion: { $avg: '$progress_percentage' }
                    }
                }
            ]).exec();

            averageCompletionRate = completionData[0]?.avgCompletion || 0;
        }

        // Обновляем статистику
        await this.difficultyLevelModel.findByIdAndUpdate(levelId, {
            courses_count: coursesCount,
            students_count: studentsCount,
            average_completion_rate: Math.round(averageCompletionRate * 100) / 100
        }).exec();

        this.logger.log(
            `Обновлена статистика уровня ${levelId}: ` +
            `курсов - ${coursesCount}, студентов - ${studentsCount}, ` +
            `средний процент завершения - ${averageCompletionRate}%`
        );
    }

    /**
     * Массовое обновление статистики всех уровней
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
     * Получение статистики по уровням
     */
    async getLevelsStatistics(): Promise<any[]> {
        const levels = await this.difficultyLevelModel
            .find({ isActive: true })
            .sort({ level: 1 })
            .exec();

        const statistics = [];

        for (const level of levels) {
            const coursesByCategory = await this.courseModel.aggregate([
                {
                    $match: {
                        difficultyLevelId: level._id,
                        isActive: true,
                        isPublished: true
                    }
                },
                {
                    $group: {
                        _id: '$categoryId',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $unwind: '$category'
                },
                {
                    $project: {
                        categoryName: '$category.name',
                        count: 1
                    }
                }
            ]).exec();

            statistics.push({
                level: {
                    id: level.id,
                    name: level.name,
                    code: level.code,
                    color: level.color
                },
                coursesCount: level.courses_count,
                studentsCount: level.students_count,
                averageCompletionRate: level.average_completion_rate,
                coursesByCategory
            });
        }

        return statistics;
    }
}