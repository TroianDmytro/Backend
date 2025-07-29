"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DifficultyLevelsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultyLevelsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const difficulty_level_schema_1 = require("./schemas/difficulty-level.schema");
const course_schema_1 = require("../courses/schemas/course.schema");
const subscription_schema_1 = require("../subscriptions/schemas/subscription.schema");
let DifficultyLevelsService = DifficultyLevelsService_1 = class DifficultyLevelsService {
    difficultyLevelModel;
    courseModel;
    subscriptionModel;
    logger = new common_1.Logger(DifficultyLevelsService_1.name);
    constructor(difficultyLevelModel, courseModel, subscriptionModel) {
        this.difficultyLevelModel = difficultyLevelModel;
        this.courseModel = courseModel;
        this.subscriptionModel = subscriptionModel;
        this.initDefaultLevels();
    }
    async initDefaultLevels() {
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
    async create(createDifficultyLevelDto) {
        const existingBySlug = await this.difficultyLevelModel.findOne({
            slug: createDifficultyLevelDto.slug
        }).exec();
        if (existingBySlug) {
            throw new common_1.ConflictException(`Уровень со slug "${createDifficultyLevelDto.slug}" уже существует`);
        }
        const existingByCode = await this.difficultyLevelModel.findOne({
            code: createDifficultyLevelDto.code
        }).exec();
        if (existingByCode) {
            throw new common_1.ConflictException(`Уровень с кодом "${createDifficultyLevelDto.code}" уже существует`);
        }
        const existingByLevel = await this.difficultyLevelModel.findOne({
            level: createDifficultyLevelDto.level
        }).exec();
        if (existingByLevel) {
            throw new common_1.ConflictException(`Уровень с числовым значением ${createDifficultyLevelDto.level} уже существует`);
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
    async findAll(onlyActive = false) {
        const filter = {};
        if (onlyActive) {
            filter.isActive = true;
        }
        return this.difficultyLevelModel
            .find(filter)
            .sort({ level: 1, order: 1 })
            .exec();
    }
    async findById(id) {
        return this.difficultyLevelModel.findById(id).exec();
    }
    async findBySlug(slug) {
        return this.difficultyLevelModel.findOne({ slug }).exec();
    }
    async findByCode(code) {
        return this.difficultyLevelModel.findOne({ code }).exec();
    }
    async update(id, updateDto) {
        const level = await this.difficultyLevelModel.findById(id).exec();
        if (!level) {
            throw new common_1.NotFoundException(`Уровень сложности с ID ${id} не найден`);
        }
        if (updateDto.slug && updateDto.slug !== level.slug) {
            const existing = await this.difficultyLevelModel.findOne({
                slug: updateDto.slug,
                _id: { $ne: id }
            }).exec();
            if (existing) {
                throw new common_1.ConflictException(`Уровень со slug "${updateDto.slug}" уже существует`);
            }
        }
        if (updateDto.code && updateDto.code !== level.code) {
            const existing = await this.difficultyLevelModel.findOne({
                code: updateDto.code,
                _id: { $ne: id }
            }).exec();
            if (existing) {
                throw new common_1.ConflictException(`Уровень с кодом "${updateDto.code}" уже существует`);
            }
        }
        if (updateDto.level && updateDto.level !== level.level) {
            const existing = await this.difficultyLevelModel.findOne({
                level: updateDto.level,
                _id: { $ne: id }
            }).exec();
            if (existing) {
                throw new common_1.ConflictException(`Уровень с числовым значением ${updateDto.level} уже существует`);
            }
        }
        Object.assign(level, updateDto);
        const updatedLevel = await level.save();
        this.logger.log(`Обновлен уровень сложности: ${id}`);
        return updatedLevel;
    }
    async delete(id) {
        const level = await this.difficultyLevelModel.findById(id).exec();
        if (!level) {
            throw new common_1.NotFoundException(`Уровень сложности с ID ${id} не найден`);
        }
        const coursesCount = await this.courseModel.countDocuments({
            difficultyLevelId: id
        }).exec();
        if (coursesCount > 0) {
            throw new common_1.ConflictException(`Нельзя удалить уровень сложности с курсами. Количество курсов: ${coursesCount}`);
        }
        await this.difficultyLevelModel.findByIdAndDelete(id).exec();
        this.logger.log(`Удален уровень сложности: ${id}`);
    }
    async getLevelCourses(levelId, page = 1, limit = 12, onlyPublished = true) {
        const level = await this.difficultyLevelModel.findById(levelId).exec();
        if (!level) {
            throw new common_1.NotFoundException(`Уровень сложности с ID ${levelId} не найден`);
        }
        const skip = (page - 1) * limit;
        const filter = { difficultyLevelId: levelId };
        if (onlyPublished) {
            filter.isPublished = true;
            filter.isActive = true;
        }
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .select('title description image_url price discount_percent currency average_rating reviews_count students_count duration_hours lessons_count')
                .populate('teacherId', 'name second_name rating')
                .populate('categoryId', 'name slug')
                .skip(skip)
                .limit(limit)
                .sort({ average_rating: -1, students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        const courseCards = courses.map(course => ({
            id: course.id,
            title: course.title,
            short_description: course.short_description || course.description?.substring(0, 100) + '...',
            logo_url: course.logo_url || course.image_url,
            price: course.price,
            discount_price: course.price * (1 - course.discount_percent / 100),
            currency: course.currency,
            rating: course.rating || course.average_rating || 0,
            reviews_count: course.reviews_count,
            current_students_count: course.current_students_count || course.students_count || 0,
            duration_hours: course.duration_hours,
            lessons_count: course.lessons_count,
            category: course.categoryId ? {
                id: course.categoryId.id,
                name: course.categoryId.name,
                slug: course.categoryId.slug
            } : null,
            teacher: course.teacherId ? {
                id: course.teacherId.id,
                name: course.teacherId.name,
                second_name: course.teacherId.second_name,
                rating: course.teacherId.rating
            } : null
        }));
        return {
            courses: courseCards,
            totalItems,
            totalPages,
            level
        };
    }
    async updateLevelStatistics(levelId) {
        const coursesCount = await this.courseModel.countDocuments({
            difficultyLevelId: levelId,
            isActive: true,
            isPublished: true
        }).exec();
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
            return sum + (course.students_count || 0);
        }, 0);
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
        await this.difficultyLevelModel.findByIdAndUpdate(levelId, {
            courses_count: coursesCount,
            students_count: studentsCount,
            average_completion_rate: Math.round(averageCompletionRate * 100) / 100
        }).exec();
        this.logger.log(`Обновлена статистика уровня ${levelId}: ` +
            `курсов - ${coursesCount}, студентов - ${studentsCount}, ` +
            `средний процент завершения - ${averageCompletionRate}%`);
    }
    async updateAllLevelsStatistics() {
        this.logger.log('Начало обновления статистики всех уровней сложности');
        const levels = await this.difficultyLevelModel.find().exec();
        for (const level of levels) {
            await this.updateLevelStatistics(level.id);
        }
        this.logger.log('Статистика всех уровней сложности обновлена');
    }
    async getLevelsStatistics() {
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
};
exports.DifficultyLevelsService = DifficultyLevelsService;
exports.DifficultyLevelsService = DifficultyLevelsService = DifficultyLevelsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(difficulty_level_schema_1.DifficultyLevel.name)),
    __param(1, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(2, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DifficultyLevelsService);
//# sourceMappingURL=difficulty-levels.service.js.map