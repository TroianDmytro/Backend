// src/subscription-plans/schemas/subscription-plan.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

/**
 * Схема планов подписки
 * Поддерживает два типа:
 * - course - подписка на конкретный курс (3 месяца)
 * - period - подписка на все курсы на определенный период
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

    // Основная информация плана
    @Prop({ required: true })
    name: string; // Название плана (например: "Базовая подписка", "Премиум на год")

    @Prop({ required: true })
    description: string; // Описание плана

    @Prop({
        type: String,
        enum: ['course', 'period'],
        required: true
    })
    type: 'course' | 'period'; // Тип подписки

    // Цена и валюта
    @Prop({ required: true, min: 0 })
    price: number; // Цена в копейках (для Monobank)

    @Prop({
        type: String,
        enum: ['UAH', 'USD', 'EUR'],
        default: 'UAH'
    })
    currency: string; // Валюта

    @Prop({ min: 0, max: 100, default: 0 })
    discount_percent: number; // Процент скидки

    // Параметры подписки
    @Prop({ required: true, min: 1 })
    duration_months: number; // Длительность в месяцах

    // Для подписки на курс
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Course',
        required: function () { return this.type === 'course'; }
    })
    courseId?: MongooseSchema.Types.ObjectId; // ID курса (только для type: 'course')

    // Для периодической подписки
    @Prop({ default: false })
    includes_all_courses: boolean; // Включает ли все курсы

    @Prop({ type: [String], default: [] })
    included_features: string[]; // Дополнительные возможности

    @Prop({ type: [String], default: [] })
    excluded_courses: string[]; // Исключенные курсы (для периодических подписок)

    // Настройки доступности
    @Prop({ default: true })
    is_active: boolean; // Активен ли план

    @Prop({ default: true })
    is_available: boolean; // Доступен ли для покупки

    @Prop({ type: Date })
    available_from?: Date; // Доступен с даты

    @Prop({ type: Date })
    available_until?: Date; // Доступен до даты

    // Лимиты
    @Prop({ min: 0, default: 0 })
    max_subscriptions: number; // Максимальное количество подписок (0 = без лимита)

    @Prop({ min: 0, default: 0 })
    current_subscriptions: number; // Текущее количество активных подписок

    // Статистика
    @Prop({ min: 0, default: 0 })
    total_purchases: number; // Общее количество покупок

    @Prop({ min: 0, default: 0 })
    total_revenue: number; // Общая выручка в копейках

    @Prop({ min: 0, max: 5, default: 0 })
    average_rating: number; // Средняя оценка плана

    // Метаданные для Monobank
    @Prop({ type: String })
    monobank_item_id?: string; // ID товара в Monobank

    @Prop({ type: Object, default: {} })
    payment_metadata: Record<string, any>; // Дополнительные данные для платежа

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);

// Виртуальные поля
SubscriptionPlanSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальное поле для расчета цены со скидкой
SubscriptionPlanSchema.virtual('discounted_price').get(function () {
    if (this.discount_percent > 0) {
        return Math.round(this.price * (1 - this.discount_percent / 100));
    }
    return this.price;
});

// Виртуальное поле для статуса доступности
SubscriptionPlanSchema.virtual('is_available_now').get(function () {
    const now = new Date();
    if (!this.is_available || !this.is_active) return false;
    if (this.available_from && this.available_from > now) return false;
    if (this.available_until && this.available_until < now) return false;
    if (this.max_subscriptions > 0 && this.current_subscriptions >= this.max_subscriptions) return false;
    return true;
});

// Связи
SubscriptionPlanSchema.virtual('subscriptions', {
    ref: 'Subscription',
    localField: '_id',
    foreignField: 'planId'
});

SubscriptionPlanSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});

// Индексы
SubscriptionPlanSchema.index({ type: 1, is_active: 1, is_available: 1 });
SubscriptionPlanSchema.index({ price: 1 });
SubscriptionPlanSchema.index({ courseId: 1 });
SubscriptionPlanSchema.index({ duration_months: 1 });
SubscriptionPlanSchema.index({ available_from: 1, available_until: 1 });

/**
 * Объяснение схемы планов подписки:
 * 
 * 1. **ДВА ТИПА ПЛАНОВ:**
 *    - 'course' - подписка на конкретный курс на 3 месяца
 *    - 'period' - подписка на все курсы на период (1, 3, 6, 12 месяцев)
 * 
 * 2. **ГИБКИЕ НАСТРОЙКИ:**
 *    - Цена и скидки
 *    - Ограничения по времени и количеству
 *    - Включение/исключение курсов
 * 
 * 3. **ИНТЕГРАЦИЯ С MONOBANK:**
 *    - Цена в копейках
 *    - Метаданные для платежей
 *    - ID товара в системе банка
 * 
 * 4. **СТАТИСТИКА:**
 *    - Количество покупок
 *    - Выручка
 *    - Рейтинги
 * 
 * 5. **ВИРТУАЛЬНЫЕ ПОЛЯ:**
 *    - Цена со скидкой
 *    - Статус доступности
 */