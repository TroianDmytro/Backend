// src/subscription-plans/subscription-plans.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { SubscriptionPlan, SubscriptionPlanDocument } from './schemas/subscription-plan.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlanFilterDto } from './dto/subscription-plan-filter.dto';

@Injectable()
export class SubscriptionPlansService {
    private readonly logger = new Logger(SubscriptionPlansService.name);

    constructor(
        @InjectModel(SubscriptionPlan.name) private subscriptionPlanModel: Model<SubscriptionPlanDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    ) {
        this.initializeDefaultPlans();
    }

    /**
     * Инициализация стандартных планов подписки при старте приложения
     */
    private async initializeDefaultPlans(): Promise<void> {
        try {
            const count = await this.subscriptionPlanModel.estimatedDocumentCount();
            if (count === 0) {
                this.logger.log('Создание стандартных планов подписки...');

                const defaultPlans = [
                    {
                        name: 'Базовая подписка на месяц',
                        description: 'Доступ ко всем курсам на 1 месяц',
                        type: 'period' as const,
                        price: 49900, // 499 грн
                        currency: 'UAH',
                        duration_months: 1,
                        includes_all_courses: true,
                        included_features: ['Все курсы', 'Мобильное приложение', 'Поддержка']
                    },
                    {
                        name: 'Стандартная подписка на 3 месяца',
                        description: 'Доступ ко всем курсам на 3 месяца со скидкой',
                        type: 'period' as const,
                        price: 119900, // 1199 грн
                        currency: 'UAH',
                        duration_months: 3,
                        discount_percent: 20,
                        includes_all_courses: true,
                        included_features: ['Все курсы', 'Мобильное приложение', 'Поддержка', 'Сертификаты']
                    },
                    {
                        name: 'Премиум подписка на год',
                        description: 'Годовая подписка со всеми возможностями',
                        type: 'period' as const,
                        price: 399900, // 3999 грн
                        currency: 'UAH',
                        duration_months: 12,
                        discount_percent: 33,
                        includes_all_courses: true,
                        included_features: [
                            'Все курсы',
                            'Приоритетная поддержка',
                            'Сертификаты',
                            'Закрытые вебинары',
                            'Личный ментор'
                        ]
                    }
                ];

                for (const planData of defaultPlans) {
                    await this.subscriptionPlanModel.create(planData);
                }

                this.logger.log('Стандартные планы подписки созданы');
            }
        } catch (error) {
            this.logger.error('Ошибка инициализации стандартных планов:', error);
        }
    }

    /**
     * Создание нового плана подписки
     */
    async create(createDto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanDocument> {
        this.logger.log(`Создание плана подписки: ${createDto.name}`);

        // Валидация для планов курсов
        if (createDto.type === 'course') {
            if (!createDto.courseId) {
                throw new BadRequestException('ID курса обязателен для планов типа "course"');
            }

            // Проверяем существование курса
            const course = await this.courseModel.findById(createDto.courseId).exec();
            if (!course) {
                throw new NotFoundException(`Курс с ID ${createDto.courseId} не найден`);
            }

            // Проверяем, нет ли уже плана для этого курса
            const existingCoursePlan = await this.subscriptionPlanModel.findOne({
                type: 'course',
                courseId: createDto.courseId,
                is_active: true
            }).exec();

            if (existingCoursePlan) {
                throw new ConflictException(`План подписки для курса ${createDto.courseId} уже существует`);
            }
        }

        // Валидация для периодических планов
        if (createDto.type === 'period' && !createDto.includes_all_courses && !createDto.excluded_courses?.length) {
            throw new BadRequestException('Для периодических планов должно быть указано includes_all_courses или excluded_courses');
        }

        const newPlan = new this.subscriptionPlanModel({
            ...createDto,
            current_subscriptions: 0,
            total_purchases: 0,
            total_revenue: 0,
            average_rating: 0,
            available_from: createDto.available_from ? new Date(createDto.available_from) : undefined,
            available_until: createDto.available_until ? new Date(createDto.available_until) : undefined
        });

        const savedPlan = await newPlan.save();
        this.logger.log(`План подписки создан: ${savedPlan.id}`);

        // Возвращаем с populate для course
        return this.findByIdWithPopulate(savedPlan.id);
    }

    /**
     * Получение всех планов с фильтрацией и пагинацией
     */
    async findAll(
        filters: SubscriptionPlanFilterDto = {},
        page: number = 1,
        limit: number = 10,
        includeInactive: boolean = false
    ): Promise<{
        plans: SubscriptionPlanDocument[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        this.logger.log(`Получение планов подписки. Страница: ${page}, Лимит: ${limit}`);

        const skip = (page - 1) * limit;
        const query: any = {};

        // Фильтры
        if (filters.type) {
            query.type = filters.type;
        }

        if (!includeInactive) {
            query.is_active = true;
        }

        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }

        if (filters.is_available !== undefined) {
            query.is_available = filters.is_available;
        }

        if (filters.courseId) {
            query.courseId = filters.courseId;
        }

        // Фильтр по цене
        if (filters.min_price || filters.max_price) {
            query.price = {};
            if (filters.min_price) {
                query.price.$gte = filters.min_price;
            }
            if (filters.max_price) {
                query.price.$lte = filters.max_price;
            }
        }

        // Поиск по названию
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const [plans, totalItems] = await Promise.all([
            this.subscriptionPlanModel
                .find(query)
                .populate('courseId', 'title image_url teacherId')
                .populate({
                    path: 'courseId',
                    populate: {
                        path: 'teacherId',
                        select: 'name second_name'
                    }
                })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.subscriptionPlanModel.countDocuments(query).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            plans,
            totalItems,
            totalPages,
            currentPage: page
        };
    }

    /**
     * Получение плана по ID
     */
    async findById(id: string): Promise<SubscriptionPlanDocument | null> {
        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID плана');
        }

        return this.subscriptionPlanModel.findById(id).exec();
    }

    /**
     * Получение плана по ID с populate
     */
    async findByIdWithPopulate(id: string): Promise<SubscriptionPlanDocument | null> {
        if (!this.isValidObjectId(id)) {
            throw new BadRequestException('Некорректный ID плана');
        }

        return this.subscriptionPlanModel
            .findById(id)
            .populate('courseId', 'title image_url teacherId price discount_percent')
            .populate({
                path: 'courseId',
                populate: {
                    path: 'teacherId',
                    select: 'name second_name'
                }
            })
            .exec();
    }

    /**
     * Обновление плана подписки
     */
    async update(id: string, updateDto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanDocument> {
        this.logger.log(`Обновление плана подписки: ${id}`);

        const plan = await this.findById(id);
        if (!plan) {
            throw new NotFoundException(`План подписки с ID ${id} не найден`);
        }

        // Валидация при изменении типа или курса
        if (updateDto.type === 'course' || (updateDto.courseId && plan.type === 'course')) {
            const courseId = updateDto.courseId || plan.courseId;

            if (courseId) {
                const course = await this.courseModel.findById(courseId).exec();
                if (!course) {
                    throw new NotFoundException(`Курс с ID ${courseId} не найден`);
                }

                // Проверяем конфликты только если меняется курс
                if (updateDto.courseId && updateDto.courseId !== plan.courseId?.toString()) {
                    const existingPlan = await this.subscriptionPlanModel.findOne({
                        type: 'course',
                        courseId: updateDto.courseId,
                        is_active: true,
                        _id: { $ne: id }
                    }).exec();

                    if (existingPlan) {
                        throw new ConflictException(`План для курса ${updateDto.courseId} уже существует`);
                    }
                }
            }
        }

        // Обновляем даты если переданы как строки
        if (updateDto.available_from) {
            (updateDto as any).available_from = new Date(updateDto.available_from);
        }
        if (updateDto.available_until) {
            (updateDto as any).available_until = new Date(updateDto.available_until);
        }

        Object.assign(plan, updateDto);
        const updatedPlan = await plan.save();

        this.logger.log(`План подписки обновлен: ${id}`);
        return this.findByIdWithPopulate(updatedPlan.id);
    }

    /**
     * Удаление плана подписки
     */
    async delete(id: string): Promise<void> {
        this.logger.log(`Удаление плана подписки: ${id}`);

        const plan = await this.findById(id);
        if (!plan) {
            throw new NotFoundException(`План подписки с ID ${id} не найден`);
        }

        // Проверяем, есть ли активные подписки
        if (plan.current_subscriptions > 0) {
            throw new ConflictException(
                `Нельзя удалить план с активными подписками. Активных подписок: ${plan.current_subscriptions}`
            );
        }

        await this.subscriptionPlanModel.findByIdAndDelete(id).exec();
        this.logger.log(`План подписки удален: ${id}`);
    }

    /**
     * Получение доступных планов для покупки
     */
    async getAvailablePlans(type?: 'course' | 'period'): Promise<SubscriptionPlanDocument[]> {
        const query: any = {
            is_active: true,
            is_available: true
        };

        if (type) {
            query.type = type;
        }

        // Фильтрация по датам доступности
        const now = new Date();
        query.$or = [
            { available_from: { $exists: false } },
            { available_from: null },
            { available_from: { $lte: now } }
        ];

        query.$and = [
            {
                $or: [
                    { available_until: { $exists: false } },
                    { available_until: null },
                    { available_until: { $gte: now } }
                ]
            }
        ];

        return this.subscriptionPlanModel
            .find(query)
            .populate('courseId', 'title image_url teacherId')
            .populate({
                path: 'courseId',
                populate: {
                    path: 'teacherId',
                    select: 'name second_name'
                }
            })
            .sort({ type: 1, duration_months: 1, price: 1 })
            .exec();
    }

    /**
     * Получение планов по курсу
     */
    async getPlansByCourse(courseId: string): Promise<SubscriptionPlanDocument[]> {
        if (!this.isValidObjectId(courseId)) {
            throw new BadRequestException('Некорректный ID курса');
        }

        return this.subscriptionPlanModel
            .find({
                type: 'course',
                courseId,
                is_active: true,
                is_available: true
            })
            .populate('courseId', 'title image_url teacherId')
            .exec();
    }

    /**
     * Получение популярных планов
     */
    async getPopularPlans(limit: number = 5): Promise<SubscriptionPlanDocument[]> {
        return this.subscriptionPlanModel
            .find({
                is_active: true,
                is_available: true,
                total_purchases: { $gt: 0 }
            })
            .populate('courseId', 'title image_url')
            .sort({ total_purchases: -1, average_rating: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Обновление статистики плана при покупке
     */
    async updatePurchaseStatistics(planId: string, amount: number): Promise<void> {
        try {
            await this.subscriptionPlanModel.findByIdAndUpdate(planId, {
                $inc: {
                    total_purchases: 1,
                    total_revenue: amount,
                    current_subscriptions: 1
                }
            }).exec();

            this.logger.log(`Статистика плана ${planId} обновлена: +${amount} копеек`);
        } catch (error) {
            this.logger.error(`Ошибка обновления статистики плана ${planId}:`, error);
        }
    }

    /**
     * Обновление статистики при отмене подписки
     */
    async updateCancellationStatistics(planId: string): Promise<void> {
        try {
            const plan = await this.subscriptionPlanModel.findById(planId).exec();
            if (plan && plan.current_subscriptions > 0) {
                await this.subscriptionPlanModel.findByIdAndUpdate(planId, {
                    $inc: { current_subscriptions: -1 }
                }).exec();

                this.logger.log(`Статистика плана ${planId} обновлена: -1 активная подписка`);
            }
        } catch (error) {
            this.logger.error(`Ошибка обновления статистики отмены для плана ${planId}:`, error);
        }
    }

    /**
     * Получение статистики планов
     */
    async getStatistics(): Promise<any> {
        const [
            totalPlans,
            activePlans,
            courseTypePlans,
            periodTypePlans,
            totalRevenue,
            totalSubscriptions
        ] = await Promise.all([
            this.subscriptionPlanModel.countDocuments().exec(),
            this.subscriptionPlanModel.countDocuments({ is_active: true }).exec(),
            this.subscriptionPlanModel.countDocuments({ type: 'course', is_active: true }).exec(),
            this.subscriptionPlanModel.countDocuments({ type: 'period', is_active: true }).exec(),
            this.subscriptionPlanModel.aggregate([
                { $group: { _id: null, total: { $sum: '$total_revenue' } } }
            ]).exec().then(result => result[0]?.total || 0),
            this.subscriptionPlanModel.aggregate([
                { $group: { _id: null, total: { $sum: '$current_subscriptions' } } }
            ]).exec().then(result => result[0]?.total || 0)
        ]);

        // Статистика по валютам
        const revenueByCurrency = await this.subscriptionPlanModel.aggregate([
            {
                $group: {
                    _id: '$currency',
                    total_revenue: { $sum: '$total_revenue' },
                    total_purchases: { $sum: '$total_purchases' },
                    avg_price: { $avg: '$price' }
                }
            }
        ]).exec();

        // Топ планов по продажам
        const topPlansByRevenue = await this.subscriptionPlanModel
            .find({ total_revenue: { $gt: 0 } })
            .populate('courseId', 'title')
            .sort({ total_revenue: -1 })
            .limit(10)
            .select('name type total_revenue total_purchases current_subscriptions')
            .exec();

        return {
            total_plans: totalPlans,
            active_plans: activePlans,
            plans_by_type: {
                course: courseTypePlans,
                period: periodTypePlans
            },
            total_revenue: totalRevenue,
            active_subscriptions: totalSubscriptions,
            revenue_by_currency: revenueByCurrency.reduce((acc, item) => {
                acc[item._id] = {
                    total_revenue: item.total_revenue,
                    total_purchases: item.total_purchases,
                    average_price: Math.round(item.avg_price || 0)
                };
                return acc;
            }, {}),
            top_plans: topPlansByRevenue
        };
    }

    /**
     * Создание плана для курса автоматически
     */
    async createCourseAutoplan(courseId: string, teacherId: string): Promise<SubscriptionPlanDocument> {
        const course = await this.courseModel.findById(courseId).populate('teacherId').exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Проверяем права (только преподаватель курса или админ)
        if (course.teacherId.toString() !== teacherId) {
            throw new BadRequestException('Только автор курса может создать план подписки');
        }

        // Проверяем, нет ли уже плана
        const existingPlan = await this.subscriptionPlanModel.findOne({
            type: 'course',
            courseId,
            is_active: true
        }).exec();

        if (existingPlan) {
            throw new ConflictException('План подписки для этого курса уже существует');
        }

        // Создаем автоматический план (цена на основе цены курса)
        const basePrice = course.price || 99900; // Fallback 999 грн
        const subscriptionPrice = Math.round(basePrice * 0.8); // 80% от цены курса

        const planData: CreateSubscriptionPlanDto = {
            name: `Подписка на курс "${course.title}"`,
            description: `Полный доступ к курсу "${course.title}" на 3 месяца`,
            type: 'course',
            price: subscriptionPrice,
            currency: course.currency || 'UAH',
            duration_months: 3,
            courseId: courseId,
            is_active: true,
            is_available: true
        };

        return this.create(planData);
    }

    /**
     * Проверка валидности ObjectId
     */
    private isValidObjectId(id: string): boolean {
        return mongoose.Types.ObjectId.isValid(id);
    }
}

/**
 * Объяснение сервиса планов подписки:
 * 
 * 1. **ИНИЦИАЛИЗАЦИЯ:**
 *    - Создает стандартные планы при первом запуске
 *    - 3 базовых плана: месяц, квартал, год
 * 
 * 2. **CRUD ОПЕРАЦИИ:**
 *    - Создание с валидацией типов и курсов
 *    - Обновление с проверкой конфликтов
 *    - Удаление с проверкой активных подписок
 * 
 * 3. **СПЕЦИАЛЬНЫЕ МЕТОДЫ:**
 *    - getAvailablePlans() - планы доступные для покупки
 *    - getPlansByCourse() - планы конкретного курса
 *    - getPopularPlans() - популярные планы
 *    - createCourseAutoplan() - автосоздание плана для курса
 * 
 * 4. **СТАТИСТИКА:**
 *    - updatePurchaseStatistics() - обновление при покупке
 *    - updateCancellationStatistics() - обновление при отмене
 *    - getStatistics() - общая статистика
 * 
 * 5. **ВАЛИДАЦИЯ:**
 *    - Проверка существования курсов
 *    - Проверка конфликтов планов
 *    - Валидация дат доступности
 */