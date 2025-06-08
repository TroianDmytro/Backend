// src/subscriptions/schemas/subscription.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

/**
 * Схема подписки пользователя на курсы
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
export class Subscription {
    // Виртуальное поле ID
    id?: string;

    // Пользователь, который оформил подписку
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
    })
    userId: MongooseSchema.Types.ObjectId; // ID пользователя

    // Тип подписки
    @Prop({
        type: String,
        enum: ['course', 'period'],
        required: true
    })
    subscription_type: 'course' | 'period'; // Тип: на отдельный курс или на период

    // Подписка на отдельный курс
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Course'
    })
    courseId?: MongooseSchema.Types.ObjectId; // ID курса (для подписки типа 'course')

    // Подписка на период
    @Prop({
        type: String,
        enum: ['1_month', '3_months', '6_months', '12_months'],
        required: function () {
            return this.subscription_type === 'period';
        }
    })
    period_type?: '1_month' | '3_months' | '6_months' | '12_months'; // Тип периода

    // Даты действия подписки
    @Prop({ required: true, type: Date })
    start_date: Date; // Дата начала подписки

    @Prop({ required: true, type: Date })
    end_date: Date; // Дата окончания подписки

    // Статус подписки
    @Prop({
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending'],
        default: 'pending'
    })
    status: 'active' | 'expired' | 'cancelled' | 'pending';

    // Финансовая информация
    @Prop({ required: true, type: Number, min: 0 })
    price: number; // Цена подписки

    @Prop({ type: String, enum: ['USD', 'EUR', 'UAH'], default: 'USD' })
    currency: string; // Валюта

    @Prop({ type: Number, min: 0 })
    discount_amount?: number; // Размер скидки

    @Prop({ type: String })
    discount_code?: string; // Промокод, если применялся

    // Информация об оплате
    @Prop({ type: String })
    payment_method?: string; // Способ оплаты

    @Prop({ type: String })
    payment_transaction_id?: string; // ID транзакции оплаты

    @Prop({ type: Date })
    payment_date?: Date; // Дата оплаты

    @Prop({ type: Boolean, default: false })
    is_paid: boolean; // Оплачена ли подписка

    // Автоматическое продление
    @Prop({ type: Boolean, default: false })
    auto_renewal: boolean; // Автоматическое продление

    @Prop({ type: Date })
    next_billing_date?: Date; // Дата следующего списания

    // Доступ к курсам (для периодических подписок)
    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }],
        default: []
    })
    accessible_courses?: MongooseSchema.Types.ObjectId[]; // Курсы, доступные по подписке

    // Прогресс обучения
    @Prop({ type: Number, default: 0, min: 0, max: 100 })
    progress_percentage: number; // Процент прохождения курса

    @Prop({ type: Number, default: 0 })
    completed_lessons: number; // Количество пройденных уроков

    @Prop({ type: Number, default: 0 })
    total_lessons: number; // Общее количество уроков

    @Prop({ type: Date })
    last_accessed?: Date; // Дата последнего доступа

    // Дополнительные настройки
    @Prop({ type: Boolean, default: true })
    email_notifications: boolean; // Уведомления по email

    @Prop({ type: String })
    cancellation_reason?: string; // Причина отмены подписки

    @Prop({ type: Date })
    cancelled_at?: Date; // Дата отмены

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User'
    })
    cancelled_by?: MongooseSchema.Types.ObjectId; // Кто отменил подписку

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Виртуальное поле id
SubscriptionSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальные поля для связей
SubscriptionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

SubscriptionSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});

// Виртуальные поля для вычисляемых значений
SubscriptionSchema.virtual('is_active').get(function () {
    const now = new Date();
    return this.status === 'active' &&
        this.start_date <= now &&
        this.end_date >= now;
});

SubscriptionSchema.virtual('days_remaining').get(function () {
    const now = new Date();
    const timeDiff = this.end_date.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Индексы для оптимизации
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ courseId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ subscription_type: 1 });
SubscriptionSchema.index({ start_date: 1, end_date: 1 });
SubscriptionSchema.index({ end_date: 1 }); // Для поиска истекающих подписок
SubscriptionSchema.index({ next_billing_date: 1 }); // Для автопродления
SubscriptionSchema.index({ userId: 1, courseId: 1 }); // Составной индекс для быстрого поиска

// Уникальный индекс для предотвращения дублирования активных подписок на один курс
SubscriptionSchema.index(
    { userId: 1, courseId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ['active', 'pending'] },
            courseId: { $ne: null }
        }
    }
);