
// src/payment/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

/**
 * Схема платежа для интеграции с Monobank
 */
@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret: any) => {
            if (ret._id) ret.id = ret._id.toString();
            if (ret._id !== undefined) delete ret._id;
            if (ret.__v !== undefined) delete ret.__v;
            return ret;
        }
    }
})
export class Payment {
    id?: string;

    // Связь с подпиской
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    })
    subscriptionId: MongooseSchema.Types.ObjectId;

    // Связь с пользователем
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true
    })
    userId: MongooseSchema.Types.ObjectId;

    // Данные Monobank
    @Prop({ required: true, unique: true })
    invoiceId: string; // ID инвойса в Monobank

    @Prop({ type: String })
    pageUrl?: string; // URL страницы оплаты

    @Prop({ required: true })
    amount: number; // Сумма в копейках

    @Prop({ required: true, enum: ['UAH', 'USD', 'EUR'], default: 'UAH' })
    currency: string;

    @Prop({
        type: String,
        enum: ['created', 'processing', 'hold', 'success', 'failure', 'reversed', 'expired'],
        default: 'created'
    })
    status: string;

    @Prop({ type: String })
    failureReason?: string; // Причина неудачи

    @Prop({ type: Date })
    paidAt?: Date; // Дата оплаты

    @Prop({ type: String })
    reference?: string; // Референс транзакции

    @Prop({ type: String })
    approvalCode?: string; // Код авторизации

    @Prop({ type: String })
    rrn?: string; // Retrieval Reference Number

    // Метаданные
    @Prop({ type: Object })
    monobankResponse?: any; // Полный ответ от Monobank

    @Prop({ type: String })
    description: string; // Описание платежа

    @Prop({ type: String })
    merchantPaymInfo?: string; // Призначення платежу

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Индексы
PaymentSchema.index({ subscriptionId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });
