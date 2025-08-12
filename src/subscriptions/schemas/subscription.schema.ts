// src/subscriptions/schemas/subscription.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

/**
 * Схема подписки пользователя
 * Содержит информацию о покупке и статусе подписки
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
    id?: string;

    // Связи
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true
    })
    userId: MongooseSchema.Types.ObjectId; // ID пользователя

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    })
    planId: MongooseSchema.Types.ObjectId; // ID плана подписки

    // Даты подписки
    @Prop({ required: true })
    start_date: Date; // Дата начала подписки

    @Prop({ required: true })
    end_date: Date; // Дата окончания подписки

    // Статус подписки
    @Prop({
        type: String,
        enum: ['pending', 'active', 'expired', 'cancelled', 'suspended'],
        default: 'pending'
    })
    status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';

    // Информация об оплате
    @Prop({ required: true, min: 0 })
    paid_amount: number; // Оплаченная сумма в копейках

    @Prop({
        type: String,
        enum: ['UAH', 'USD', 'EUR'],
        default: 'UAH'
    })
    paid_currency: string; // Валюта оплаты

    @Prop({ type: String })
    payment_method: string; // Способ оплаты (например, 'monobank')

    @Prop({ type: String })
    payment_transaction_id: string; // ID транзакции в платежной системе

    @Prop({ type: Date })
    payment_date: Date; // Дата оплаты

    // Информация о плане на момент покупки (снимок)
    @Prop({ type: Object, required: true })
    plan_snapshot: {
        name: string;
        description: string;
        type: 'course' | 'period';
        duration_months: number;
        price: number;
        currency: string;
        discount_percent: number;
        courseId?: string;
        includes_all_courses?: boolean;
        included_features?: string[];
    };

    // Автопродление
    @Prop({ default: false })
    auto_renewal: boolean; // Включено ли автопродление

    @Prop({ type: Date })
    auto_renewal_date?: Date; // Дата следующего автоматического продления

    @Prop({ default: false })
    auto_renewal_failed: boolean; // Не удалось автопродлить

    // Отмена и приостановка
    @Prop({ type: Date })
    cancelled_at?: Date; // Дата отмены

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User'
    })
    cancelled_by?: MongooseSchema.Types.ObjectId; // Кем отменена (пользователем или админом)

    @Prop({ type: String })
    cancellation_reason?: string; // Причина отмены

    @Prop({ type: Date })
    suspended_at?: Date; // Дата приостановки

    @Prop({ type: String })
    suspension_reason?: string; // Причина приостановки

    // Использование
    @Prop({ min: 0, default: 0 })
    usage_count: number; // Количество использований (например, просмотренных уроков)

    @Prop({ type: Date })
    last_used_at?: Date; // Последнее использование

    // Уведомления
    @Prop({ default: false })
    expiry_notification_sent: boolean; // Отправлено ли уведомление об истечении

    @Prop({ default: false })
    renewal_notification_sent: boolean; // Отправлено ли уведомление о продлении

    // Метаданные
    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>; // Дополнительные данные

    @Prop({ type: String })
    notes?: string; // Заметки администратора

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Виртуальные поля
SubscriptionSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальное поле для проверки активности
SubscriptionSchema.virtual('is_active').get(function () {
    const now = new Date();
    return this.status === 'active' &&
        this.start_date <= now &&
        this.end_date > now;
});

// Виртуальное поле для оставшихся дней
SubscriptionSchema.virtual('days_remaining').get(function () {
    if (this.status !== 'active') return 0;
    const now = new Date();
    const remaining = Math.ceil((this.end_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
});

// Виртуальное поле для прогресса (в процентах)
SubscriptionSchema.virtual('progress_percent').get(function () {
    const now = new Date();
    const total = this.end_date.getTime() - this.start_date.getTime();
    const elapsed = now.getTime() - this.start_date.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
});

// Связи
SubscriptionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

SubscriptionSchema.virtual('plan', {
    ref: 'SubscriptionPlan',
    localField: 'planId',
    foreignField: '_id',
    justOne: true
});

// Методы схемы
SubscriptionSchema.methods.canAccess = function (courseId?: string): boolean {
    if (!this.is_active) return false;

    // Если подписка на конкретный курс
    if (this.plan_snapshot.type === 'course') {
        return this.plan_snapshot.courseId === courseId;
    }

    // Если подписка на все курсы
    if (this.plan_snapshot.includes_all_courses) {
        return true;
    }

    return false;
};

SubscriptionSchema.methods.extend = function (months: number): void {
    const currentEndDate = new Date(this.end_date);
    currentEndDate.setMonth(currentEndDate.getMonth() + months);
    this.end_date = currentEndDate;
};

// Индексы
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ planId: 1 });
SubscriptionSchema.index({ status: 1, end_date: 1 });
SubscriptionSchema.index({ start_date: 1, end_date: 1 });
SubscriptionSchema.index({ payment_transaction_id: 1 });
SubscriptionSchema.index({ auto_renewal_date: 1 });

// Составные индексы
SubscriptionSchema.index({ userId: 1, status: 1, end_date: -1 });
SubscriptionSchema.index({ 'plan_snapshot.type': 1, 'plan_snapshot.courseId': 1 });

/**
 * Объяснение схемы подписок:
 * 
 * 1. **СТАТУСЫ ПОДПИСКИ:**
 *    - pending - ожидает оплаты
 *    - active - активна
 *    - expired - истекла
 *    - cancelled - отменена
 *    - suspended - приостановлена
 * 
 * 2. **СНИМОК ПЛАНА:**
 *    - Сохраняется информация о плане на момент покупки
 *    - Защищает от изменений в планах после покупки
 * 
 * 3. **АВТОПРОДЛЕНИЕ:**
 *    - Возможность настроить автоматическое продление
 *    - Отслеживание неудачных попыток продления
 * 
 * 4. **ВИРТУАЛЬНЫЕ ПОЛЯ:**
 *    - is_active - проверка активности
 *    - days_remaining - оставшиеся дни
 *    - progress_percent - прогресс в процентах
 * 
 * 5. **МЕТОДЫ:**
 *    - canAccess() - проверка доступа к курсу
 *    - extend() - продление подписки
 */