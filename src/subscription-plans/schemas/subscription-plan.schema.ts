// src / subscription - plans / schemas / subscription - plan.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

/**
 * Схема тарифного плана для подписок
 */
@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
})
export class SubscriptionPlan {
    id?: string;

    @Prop({ required: true, unique: true })
    name: string; // Название плана (например: "Премиум 3 месяца")

    @Prop({ required: true, unique: true })
    slug: string; // URL-дружелюбный идентификатор (например: "premium-3-months")

    @Prop({ required: true })
    description: string; // Описание плана

    @Prop({
        required: true,
        enum: ['1_month', '3_months', '6_months', '12_months'],
    })
    period_type: '1_month' | '3_months' | '6_months' | '12_months'; // Тип периода

    @Prop({ required: true, min: 0 })
    price: number; // Цена в гривнах

    @Prop({ required: true, enum: ['UAH', 'USD', 'EUR'], default: 'UAH' })
    currency: string; // Валюта

    @Prop({ min: 0, max: 100, default: 0 })
    discount_percent: number; // Процент скидки

    @Prop({ min: 0, default: 0 })
    original_price?: number; // Оригинальная цена (до скидки)

    @Prop({ default: true })
    is_active: boolean; // Активен ли план

    @Prop({ default: false })
    is_popular: boolean; // Популярный план (для выделения в UI)

    @Prop({ default: false })
    is_featured: boolean; // Рекомендуемый план

    @Prop({ type: [String], default: [] })
    features: string[]; // Особенности плана

    @Prop({ type: [String], default: [] })
    benefits: string[]; // Преимущества плана

    @Prop({ type: String })
    color?: string; // Цвет для UI (например: "#FF6B6B")

    @Prop({ type: String })
    icon?: string; // Иконка плана

    @Prop({ type: Number, default: 0 })
    sort_order: number; // Порядок сортировки

    // Статистика
    @Prop({ min: 0, default: 0 })
    subscribers_count: number; // Количество подписчиков

    @Prop({ min: 0, default: 0 })
    total_revenue: number; // Общий доход

    createdAt?: Date;
    updatedAt?: Date;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);

// Индексы для оптимизации
SubscriptionPlanSchema.index({ period_type: 1 });
SubscriptionPlanSchema.index({ is_active: 1 });
SubscriptionPlanSchema.index({ is_popular: 1 });
SubscriptionPlanSchema.index({ sort_order: 1 });
SubscriptionPlanSchema.index({ price: 1 });