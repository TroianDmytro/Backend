// src/difficulty-levels/schemas/difficulty-level.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DifficultyLevelDocument = DifficultyLevel & Document;

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
export class DifficultyLevel {
    id?: string;

    @Prop({ required: true, unique: true })
    name: string; // Название уровня сложности

    @Prop({ required: true, unique: true })
    slug: string; // URL-friendly название

    @Prop({ required: true, unique: true })
    code: string; // Короткий код (beginner, intermediate, advanced)

    @Prop({ required: true, min: 1, max: 10 })
    level: number; // Числовой уровень сложности (1-10)

    @Prop({ required: true })
    description: string; // Описание уровня

    @Prop({ default: '#28a745' })
    color: string; // Цвет для UI

    @Prop({ type: [String], default: [] })
    requirements: string[]; // Требования для этого уровня

    @Prop({ default: true })
    isActive: boolean; // Активен ли уровень

    @Prop({ type: Number, default: 0 })
    courses_count: number; // Количество курсов с этим уровнем

    @Prop({ type: Number, default: 0 })
    students_count: number; // Количество студентов

    @Prop({ type: Number, default: 0, min: 0, max: 5 })
    average_rating: number; // Средний рейтинг курсов

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

// Индексы
DifficultyLevelSchema.index({ level: 1 });
DifficultyLevelSchema.index({ isActive: 1 });