// src/subscription-plans/subscription-plans.service.ts
import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPlan, SubscriptionPlanDocument } from './schemas/subscription-plan.schema';
import { CreatePlanDto, UpdatePlanDto } from './dto/subscription-plan.dto';

@Injectable()
export class SubscriptionPlansService {
    private readonly logger = new Logger(SubscriptionPlansService.name);

    constructor(
        @InjectModel(SubscriptionPlan.name) private planModel: Model<SubscriptionPlanDocument>
    ) { }

    /**
     * Получение всех планов с пагинацией
     */
    async getAllPlans(page: number = 1, limit: number = 10, activeOnly: boolean = true): Promise<{
        plans: SubscriptionPlanDocument[];
        totalItems: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        const filter = activeOnly ? { is_active: true } : {};

        const [plans, totalItems] = await Promise.all([
            this.planModel
                .find(filter)
                .sort({ sort_order: 1, price: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.planModel.countDocuments(filter).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return { plans, totalItems, totalPages };
    }

    /**
     * Получение плана по ID
     */
    async getPlanById(id: string): Promise<SubscriptionPlanDocument> {
        const plan = await this.planModel.findById(id).exec();
        if (!plan) {
            throw new NotFoundException(`Тарифный план с ID ${id} не найден`);
        }
        return plan;
    }

    /**
     * Создание индивидуального плана
     */
    async createCustomPlan(planData: CreatePlanDto): Promise<SubscriptionPlanDocument> {
        // Проверяем уникальность slug
        const existingPlan = await this.planModel.findOne({ slug: planData.slug }).exec();
        if (existingPlan) {
            throw new ConflictException(`План с slug "${planData.slug}" уже существует`);
        }

        // Проверяем уникальность названия
        const existingName = await this.planModel.findOne({ name: planData.name }).exec();
        if (existingName) {
            throw new ConflictException(`План с названием "${planData.name}" уже существует`);
        }

        // Валидируем скидку
        if (planData.discount_percent && planData.discount_percent > 0) {
            if (!planData.original_price) {
                throw new BadRequestException('Для скидочного плана необходимо указать оригинальную цену');
            }
            if (planData.original_price <= planData.price) {
                throw new BadRequestException('Оригинальная цена должна быть больше текущей цены');
            }
        }

        const newPlan = new this.planModel({
            ...planData,
            currency: planData.currency || 'UAH',
            is_active: planData.is_active !== undefined ? planData.is_active : true,
            subscribers_count: 0,
            total_revenue: 0
        });

        const savedPlan = await newPlan.save();
        this.logger.log(`✨ Создан индивидуальный план: "${savedPlan.name}"`);

        return savedPlan;
    }

    /**
     * Обновление тарифного плана
     */
    async updatePlan(id: string, updateData: UpdatePlanDto): Promise<SubscriptionPlanDocument> {
        const plan = await this.planModel.findById(id).exec();
        if (!plan) {
            throw new NotFoundException(`Тарифный план с ID ${id} не найден`);
        }

        // Проверяем уникальность slug (если он изменяется)
        if (updateData.slug && updateData.slug !== plan.slug) {
            const existingSlug = await this.planModel.findOne({
                slug: updateData.slug,
                _id: { $ne: id }
            }).exec();
            if (existingSlug) {
                throw new ConflictException(`План с slug "${updateData.slug}" уже существует`);
            }
        }

        // Проверяем уникальность названия (если оно изменяется)
        if (updateData.name && updateData.name !== plan.name) {
            const existingName = await this.planModel.findOne({
                name: updateData.name,
                _id: { $ne: id }
            }).exec();
            if (existingName) {
                throw new ConflictException(`План с названием "${updateData.name}" уже существует`);
            }
        }

        // Валидируем скидку
        const finalPrice = updateData.price !== undefined ? updateData.price : plan.price;
        const finalOriginalPrice = updateData.original_price !== undefined ? updateData.original_price : plan.original_price;
        const finalDiscountPercent = updateData.discount_percent !== undefined ? updateData.discount_percent : plan.discount_percent;

        if (finalDiscountPercent && finalDiscountPercent > 0) {
            if (!finalOriginalPrice) {
                throw new BadRequestException('Для скидочного плана необходимо указать оригинальную цену');
            }
            if (finalOriginalPrice <= finalPrice) {
                throw new BadRequestException('Оригинальная цена должна быть больше текущей цены');
            }
        }

        // Обновляем план
        Object.assign(plan, updateData);
        const updatedPlan = await plan.save();

        this.logger.log(`📝 Обновлен план: "${updatedPlan.name}"`);
        return updatedPlan;
    }

    /**
     * Удаление или деактивация плана
     */
    async deletePlan(id: string, force: boolean = false): Promise<{ deleted: boolean }> {
        const plan = await this.planModel.findById(id).exec();
        if (!plan) {
            throw new NotFoundException(`Тарифный план с ID ${id} не найден`);
        }

        // Проверяем, есть ли активные подписки на этот план
        // TODO: Добавить проверку через SubscriptionsService когда он будет доступен
        // const activeSubscriptions = await this.subscriptionsService.countActiveSubscriptionsByPlan(id);
        // if (activeSubscriptions > 0 && force) {
        //     throw new ConflictException(`Нельзя удалить план с ${activeSubscriptions} активными подписками`);
        // }

        if (force) {
            // Принудительное удаление
            await this.planModel.findByIdAndDelete(id).exec();
            this.logger.log(`🗑️ Удален план: "${plan.name}"`);
            return { deleted: true };
        } else {
            // Деактивация
            plan.is_active = false;
            await plan.save();
            this.logger.log(`🔒 Деактивирован план: "${plan.name}"`);
            return { deleted: false };
        }
    }

    /**
     * Активация/деактивация плана
     */
    async toggleActivation(id: string, isActive: boolean): Promise<SubscriptionPlanDocument> {
        const plan = await this.planModel.findById(id).exec();
        if (!plan) {
            throw new NotFoundException(`Тарифный план с ID ${id} не найден`);
        }

        plan.is_active = isActive;
        const updatedPlan = await plan.save();

        this.logger.log(`${isActive ? '✅ Активирован' : '❌ Деактивирован'} план: "${plan.name}"`);
        return updatedPlan;
    }

    /**
     * Получение статистики планов
     */
    async getStatistics(): Promise<any> {
        const [
            totalPlans,
            activePlans,
            popularPlans,
            featuredPlans,
            totalSubscribers,
            totalRevenue,
            topPlans
        ] = await Promise.all([
            this.planModel.countDocuments().exec(),
            this.planModel.countDocuments({ is_active: true }).exec(),
            this.planModel.countDocuments({ is_popular: true, is_active: true }).exec(),
            this.planModel.countDocuments({ is_featured: true, is_active: true }).exec(),
            this.planModel.aggregate([
                { $group: { _id: null, total: { $sum: '$subscribers_count' } } }
            ]).exec().then(result => result[0]?.total || 0),
            this.planModel.aggregate([
                { $group: { _id: null, total: { $sum: '$total_revenue' } } }
            ]).exec().then(result => result[0]?.total || 0),
            this.planModel
                .find({ is_active: true })
                .sort({ subscribers_count: -1 })
                .limit(5)
                .select('name subscribers_count total_revenue')
                .exec()
        ]);

        return {
            totalPlans,
            activePlans,
            inactivePlans: totalPlans - activePlans,
            popularPlans,
            featuredPlans,
            totalSubscribers,
            totalRevenue,
            averageRevenuePerPlan: totalPlans > 0 ? Math.round(totalRevenue / totalPlans) : 0,
            topPlans: topPlans.map(plan => ({
                id: plan.id,
                name: plan.name,
                subscribers: plan.subscribers_count,
                revenue: plan.total_revenue
            }))
        };
    }

    /**
     * Создание базовых тарифных планов
     */
    async seedBasicPlans(): Promise<SubscriptionPlanDocument[]> {
        this.logger.log('🌱 Создание базовых тарифных планов...');

        const basicPlans: CreatePlanDto[] = [
            {
                name: 'Базовый 1 месяц',
                slug: 'basic-1-month',
                description: 'Доступ ко всем курсам на 1 месяц',
                period_type: '1_month',
                price: 500,
                currency: 'UAH',
                features: [
                    'Доступ ко всем курсам',
                    'Онлайн поддержка',
                    'Мобильное приложение'
                ],
                benefits: [
                    'Быстрый старт обучения',
                    'Низкая стоимость входа'
                ],
                color: '#74C0FC',
                icon: '📱',
                sort_order: 1
            },
            {
                name: 'Стандарт 3 месяца',
                slug: 'standard-3-months',
                description: 'Оптимальный план для серьезного обучения',
                period_type: '3_months',
                price: 1000,
                original_price: 1500,
                discount_percent: 33,
                currency: 'UAH',
                is_popular: true,
                features: [
                    'Доступ ко всем курсам',
                    'Персональная поддержка',
                    'Сертификаты об окончании',
                    'Домашние задания с проверкой',
                    'Группы в Telegram'
                ],
                benefits: [
                    'Экономия 500 грн',
                    'Достаточно времени для изучения',
                    'Популярный выбор студентов'
                ],
                color: '#51CF66',
                icon: '🎯',
                sort_order: 2
            },
            {
                name: 'Премиум 6 месяцев',
                slug: 'premium-6-months',
                description: 'Максимальный результат за полгода',
                period_type: '6_months',
                price: 2000,
                original_price: 3000,
                discount_percent: 33,
                currency: 'UAH',
                is_featured: true,
                features: [
                    'Доступ ко всем курсам',
                    'Приоритетная поддержка 24/7',
                    'Сертификаты об окончании',
                    'Индивидуальные консультации',
                    'Карьерная поддержка',
                    'Доступ к закрытым вебинарам',
                    'Скидки на дополнительные курсы'
                ],
                benefits: [
                    'Экономия 1000 грн',
                    'Индивидуальный подход',
                    'Карьерная поддержка',
                    'Максимальный результат'
                ],
                color: '#FFD43B',
                icon: '👑',
                sort_order: 3
            },
            {
                name: 'Профессиональный 12 месяцев',
                slug: 'professional-12-months',
                description: 'Годовая подписка для профессионального роста',
                period_type: '12_months',
                price: 3500,
                original_price: 6000,
                discount_percent: 42,
                currency: 'UAH',
                features: [
                    'Доступ ко всем курсам',
                    'VIP поддержка',
                    'Все сертификаты',
                    'Личный ментор',
                    'Помощь в трудоустройстве',
                    'Участие в проектах',
                    'Доступ к корпоративным курсам',
                    'Networking с экспертами',
                    'Скидки на конференции'
                ],
                benefits: [
                    'Максимальная экономия 2500 грн',
                    'Личный ментор',
                    'Помощь в карьере',
                    'Сетевые возможности',
                    'Полное погружение'
                ],
                color: '#9775FA',
                icon: '🚀',
                sort_order: 4
            }
        ];

        const createdPlans: SubscriptionPlanDocument[] = [];

        for (const planData of basicPlans) {
            try {
                // Проверяем, существует ли уже план с таким slug
                const existingPlan = await this.planModel.findOne({ slug: planData.slug }).exec();

                if (existingPlan) {
                    this.logger.warn(`📋 План "${planData.name}" уже существует, пропускаем...`);
                    createdPlans.push(existingPlan);
                    continue;
                }

                // Создаем новый план
                const newPlan = new this.planModel(planData);
                const savedPlan = await newPlan.save();

                this.logger.log(`✅ Создан план: "${savedPlan.name}" - ${savedPlan.price} ${savedPlan.currency}`);
                createdPlans.push(savedPlan);

            } catch (error) {
                this.logger.error(`❌ Ошибка создания плана "${planData.name}": ${error.message}`);
            }
        }

        this.logger.log(`🎉 Создано ${createdPlans.length} тарифных планов`);
        return createdPlans;
    }

    /**
     * Получение всех активных планов
     */
    async getActivePlans(): Promise<SubscriptionPlanDocument[]> {
        return this.planModel
            .find({ is_active: true })
            .sort({ sort_order: 1, price: 1 })
            .exec();
    }

    /**
     * Получение плана по slug
     */
    async getPlanBySlug(slug: string): Promise<SubscriptionPlanDocument | null> {
        return this.planModel.findOne({ slug, is_active: true }).exec();
    }

    /**
     * Обновление статистики плана
     */
    async updatePlanStats(planId: string, subscribersCount: number, revenue: number): Promise<void> {
        await this.planModel.findByIdAndUpdate(planId, {
            $inc: {
                subscribers_count: subscribersCount,
                total_revenue: revenue
            }
        }).exec();
    }

    /**
     * Получение популярных планов
     */
    async getPopularPlans(): Promise<SubscriptionPlanDocument[]> {
        return this.planModel
            .find({ is_active: true, is_popular: true })
            .sort({ sort_order: 1 })
            .exec();
    }

    /**
     * Получение рекомендуемых планов
     */
    async getFeaturedPlans(): Promise<SubscriptionPlanDocument[]> {
        return this.planModel
            .find({ is_active: true, is_featured: true })
            .sort({ sort_order: 1 })
            .exec();
    }

    /**
     * Удаление всех планов (для тестирования)
     */
    async clearAllPlans(): Promise<void> {
        await this.planModel.deleteMany({}).exec();
        this.logger.log('🗑️ Все тарифные планы удалены');
    }

    /**
     * Пересоздание базовых планов
     */
    async recreateBasicPlans(): Promise<SubscriptionPlanDocument[]> {
        await this.clearAllPlans();
        return this.seedBasicPlans();
    }

    /**
     * Поиск планов по критериям
     */
    async searchPlans(query: {
        name?: string;
        period_type?: string;
        currency?: string;
        min_price?: number;
        max_price?: number;
        is_popular?: boolean;
        is_featured?: boolean;
    }): Promise<SubscriptionPlanDocument[]> {
        const filter: any = { is_active: true };

        if (query.name) {
            filter.name = { $regex: query.name, $options: 'i' };
        }

        if (query.period_type) {
            filter.period_type = query.period_type;
        }

        if (query.currency) {
            filter.currency = query.currency;
        }

        if (query.min_price !== undefined || query.max_price !== undefined) {
            filter.price = {};
            if (query.min_price !== undefined) filter.price.$gte = query.min_price;
            if (query.max_price !== undefined) filter.price.$lte = query.max_price;
        }

        if (query.is_popular !== undefined) {
            filter.is_popular = query.is_popular;
        }

        if (query.is_featured !== undefined) {
            filter.is_featured = query.is_featured;
        }

        return this.planModel
            .find(filter)
            .sort({ sort_order: 1, price: 1 })
            .exec();
    }

    /**
     * Получение планов по периоду
     */
    async getPlansByPeriod(periodType: string): Promise<SubscriptionPlanDocument[]> {
        return this.planModel
            .find({
                period_type: periodType,
                is_active: true
            })
            .sort({ price: 1 })
            .exec();
    }
}