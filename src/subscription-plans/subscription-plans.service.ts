// src/subscription-plans/subscription-plans.service.ts
import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPlan, SubscriptionPlanDocument } from './schemas/subscription-plan.schema';

interface CreatePlanDto {
    name: string;
    slug: string;
    description: string;
    period_type: '1_month' | '3_months' | '6_months' | '12_months';
    price: number;
    currency?: string;
    discount_percent?: number;
    original_price?: number;
    is_popular?: boolean;
    is_featured?: boolean;
    features?: string[];
    benefits?: string[];
    color?: string;
    icon?: string;
    sort_order?: number;
}

@Injectable()
export class SubscriptionPlansService {
    private readonly logger = new Logger(SubscriptionPlansService.name);

    constructor(
        @InjectModel(SubscriptionPlan.name) private planModel: Model<SubscriptionPlanDocument>
    ) { }

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
     * Создание индивидуального плана
     */
    async createCustomPlan(planData: CreatePlanDto): Promise<SubscriptionPlanDocument> {
        // Проверяем уникальность slug
        const existingPlan = await this.planModel.findOne({ slug: planData.slug }).exec();
        if (existingPlan) {
            throw new ConflictException(`План с slug "${planData.slug}" уже существует`);
        }

        const newPlan = new this.planModel({
            ...planData,
            currency: planData.currency || 'UAH',
            is_active: true
        });

        const savedPlan = await newPlan.save();
        this.logger.log(`✨ Создан индивидуальный план: "${savedPlan.name}"`);

        return savedPlan;
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
}