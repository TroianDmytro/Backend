// src/subscriptions/schemas/subscription.schema.ts - ОБНОВЛЕННАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { Course } from '../../courses/schemas/course.schema';

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionStatus {
    PENDING = 'pending',     // Ожидает оплаты
    PAID = 'paid',           // Оплачен, но курс еще не начался
    ACTIVE = 'active',       // Активная подписка (курс идет)
    COMPLETED = 'completed', // Курс завершен
    CANCELLED = 'cancelled'  // Отменен
}

@Schema({
    timestamps: true,
    collection: 'subscriptions'
})
export class Subscription {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @Type(() => User)
    user: User;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    @Type(() => Course)
    course: Course;

    @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
    status: SubscriptionStatus;

    @Prop({ required: true, min: 0 })
    paidAmount: number;

    @Prop()
    paidAt?: Date;

    // НОВОЕ: проверка доступности записи
    @Prop({ default: false })
    canEnrollAfterStart: boolean; // может ли записаться после начала курса (только админ)

    createdAt: Date;
    updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Уникальный индекс для предотвращения дублирования подписок
SubscriptionSchema.index({ user: 1, course: 1 }, { unique: true });