// src/payment/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

/**
 * Схема платежа
 * Отслеживает все платежные операции через Monobank
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
export class Payment {
    id?: string;

    // Основная информация о платеже
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

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Subscription'
    })
    subscriptionId?: MongooseSchema.Types.ObjectId; // ID созданной подписки

    // Сумма и валюта
    @Prop({ required: true, min: 0 })
    amount: number; // Сумма в копейках

    @Prop({
        type: String,
        enum: ['UAH', 'USD', 'EUR'],
        default: 'UAH'
    })
    currency: string; // Валюта

    @Prop({ min: 0, default: 0 })
    discount_amount: number; // Размер скидки в копейках

    @Prop({ min: 0, default: 0 })
    final_amount: number; // Финальная сумма к оплате

    // Статус платежа
    @Prop({
        type: String,
        enum: ['created', 'pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'],
        default: 'created'
    })
    status: 'created' | 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';

    // Данные Monobank
    @Prop({ type: String, unique: true })
    monobank_invoice_id: string; // ID инвойса в Monobank

    @Prop({ type: String })
    monobank_transaction_id?: string; // ID транзакции в Monobank

    @Prop({ type: String })
    payment_url?: string; // URL для оплаты

    @Prop({ type: Date })
    payment_link_expires_at?: Date; // Срок действия ссылки на оплату

    // Webhook данные от Monobank
    @Prop({ type: Object })
    webhook_data?: Record<string, any>; // Данные от webhook

    @Prop({ type: Date })
    webhook_received_at?: Date; // Время получения webhook

    // Даты
    @Prop({ type: Date })
    paid_at?: Date; // Дата успешной оплаты

    @Prop({ type: Date })
    failed_at?: Date; // Дата неудачной оплаты

    @Prop({ type: Date })
    cancelled_at?: Date; // Дата отмены

    @Prop({ type: Date })
    refunded_at?: Date; // Дата возврата

    // Дополнительная информация
    @Prop({ type: String })
    failure_reason?: string; // Причина неудачи

    @Prop({ type: String })
    cancellation_reason?: string; // Причина отмены

    @Prop({ type: String })
    refund_reason?: string; // Причина возврата

    @Prop({ min: 0 })
    refund_amount?: number; // Сумма возврата

    // Метаданные
    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>; // Дополнительные данные

    @Prop({ type: String })
    user_agent?: string; // User-Agent пользователя

    @Prop({ type: String })
    ip_address?: string; // IP адрес пользователя

    // Попытки оплаты
    @Prop({ min: 0, default: 1 })
    attempt_number: number; // Номер попытки

    @Prop({ type: Array, default: [] })
    attempt_history: Array<{
        attempt_number: number;
        status: string;
        created_at: Date;
        failed_reason?: string;
    }>;

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Виртуальные поля
PaymentSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальное поле для проверки успешности
PaymentSchema.virtual('is_successful').get(function () {
    return this.status === 'success' && this.paid_at;
});

// Виртуальное поле для проверки завершенности
PaymentSchema.virtual('is_completed').get(function () {
    return ['success', 'failed', 'cancelled', 'refunded'].includes(this.status);
});

// Виртуальное поле для времени до истечения ссылки
PaymentSchema.virtual('link_expires_in_minutes').get(function () {
    if (!this.payment_link_expires_at) return 0;
    const now = new Date();
    const remaining = Math.ceil((this.payment_link_expires_at.getTime() - now.getTime()) / (1000 * 60));
    return Math.max(0, remaining);
});

// Связи
PaymentSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

PaymentSchema.virtual('plan', {
    ref: 'SubscriptionPlan',
    localField: 'planId',
    foreignField: '_id',
    justOne: true
});

PaymentSchema.virtual('subscription', {
    ref: 'Subscription',
    localField: 'subscriptionId',
    foreignField: '_id',
    justOne: true
});

// Методы схемы
PaymentSchema.methods.markAsPaid = function (transactionId: string, webhookData?: any): void {
    this.status = 'success';
    this.monobank_transaction_id = transactionId;
    this.paid_at = new Date();
    if (webhookData) {
        this.webhook_data = webhookData;
        this.webhook_received_at = new Date();
    }
};

PaymentSchema.methods.markAsFailed = function (reason: string): void {
    this.status = 'failed';
    this.failure_reason = reason;
    this.failed_at = new Date();
};

PaymentSchema.methods.addAttempt = function (status: string, failedReason?: string): void {
    this.attempt_number += 1;
    this.attempt_history.push({
        attempt_number: this.attempt_number,
        status,
        created_at: new Date(),
        failed_reason: failedReason
    });
};

// Индексы
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ planId: 1 });
PaymentSchema.index({ subscriptionId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ monobank_invoice_id: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ monobank_transaction_id: 1 });
PaymentSchema.index({ payment_link_expires_at: 1 });

// TTL индекс для автоматического удаления неоплаченных платежей
PaymentSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 24 * 60 * 60, // 24 часа
        partialFilterExpression: {
            status: { $in: ['created', 'pending'] }
        }
    }
);

/**
 * Объяснение схемы платежей:
 * 
 * 1. **СТАТУСЫ ПЛАТЕЖА:**
 *    - created - создан, ожидает инициализации
 *    - pending - ссылка создана, ожидает оплаты
 *    - processing - обрабатывается банком
 *    - success - успешно оплачен
 *    - failed - неудачная оплата
 *    - cancelled - отменен пользователем
 *    - refunded - возвращен
 * 
 * 2. **ИНТЕГРАЦИЯ С MONOBANK:**
 *    - Хранение ID инвойса и транзакции
 *    - Обработка webhook данных
 *    - Отслеживание сроков действия ссылок
 * 
 * 3. **ОТСЛЕЖИВАНИЕ ПОПЫТОК:**
 *    - История попыток оплаты
 *    - Причины неудач
 * 
 * 4. **ВИРТУАЛЬНЫЕ ПОЛЯ:**
 *    - is_successful - проверка успешности
 *    - link_expires_in_minutes - время до истечения
 * 
 * 5. **TTL ИНДЕКС:**
 *    - Автоматическое удаление старых неоплаченных платежей
 */