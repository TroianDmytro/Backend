// src/difficulty-levels/schemas/difficulty-level.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DifficultyLevelDocument = DifficultyLevel & Document;

/**
 * Схема уровня сложности курсов
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
export class DifficultyLevel {
    // Виртуальное поле ID
    id?: string;

    // Основная информация
    @Prop({ required: true, unique: true })
    name: string; // Название уровня (например, "Начальный")

    @Prop({ required: true, unique: true })
    slug: string; // URL-friendly название (например, "beginner")

    @Prop({ required: true, unique: true })
    code: string; // Код уровня (например, "beginner", "intermediate", "advanced")

    @Prop({ required: true })
    description: string; // Описание уровня

    @Prop({ type: String })
    short_description?: string; // Краткое описание

    // Визуальное оформление
    @Prop({ type: String })
    icon?: string; // Иконка уровня

    @Prop({ type: String, default: '#4caf50' })
    color?: string; // Цвет уровня для UI

    // Порядок и приоритет
    @Prop({ type: Number, required: true, unique: true })
    level: number; // Числовой уровень (1 - начальный, 2 - средний, 3 - продвинутый и т.д.)

    @Prop({ type: Number, default: 0 })
    order: number; // Порядок отображения

    // Требования и рекомендации
    @Prop({ type: [String], default: [] })
    prerequisites: string[]; // Предварительные требования

    @Prop({ type: [String], default: [] })
    target_audience: string[]; // Целевая аудитория

    @Prop({ type: Number, min: 0 })
    recommended_hours?: number; // Рекомендуемое количество часов обучения

    @Prop({ type: Number, min: 0 })
    min_experience_years?: number; // Минимальный опыт в годах

    // Статусы
    @Prop({ default: true })
    isActive: boolean; // Активен ли уровень

    // Статистика
    @Prop({ type: Number, default: 0 })
    courses_count: number; // Количество курсов этого уровня

    @Prop({ type: Number, default: 0 })
    students_count: number; // Количество студентов на этом уровне

    @Prop({ type: Number, min: 0, max: 100, default: 0 })
    average_completion_rate: number; // Средний процент завершения курсов

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const DifficultyLevelSchema = SchemaFactory.createForClass(DifficultyLevel);

// Виртуальное поле id
DifficultyLevelSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальные поля для связей
DifficultyLevelSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'difficultyLevelId'
});

// Индексы для оптимизации
DifficultyLevelSchema.index({ isActive: 1 });
DifficultyLevelSchema.index({ order: 1 });