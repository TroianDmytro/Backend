// src/homework/schemas/homework.schema.ts - ИСПРАВЛЕННАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';

export type HomeworkDocument = Homework & Document;

@Schema({
    timestamps: true,
    collection: 'homeworks'
})
export class Homework {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
    lesson: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
    teacher: Types.ObjectId; // ИСПРАВЛЕНО: правильный тип связи

    @Prop()
    deadline?: Date;

    @Prop({ min: 1, max: 100, default: 100 })
    max_score?: number;

    @Prop({ default: 1, min: 1 })
    max_attempts?: number;

    @Prop({ default: false })
    allow_late_submission?: boolean;

    @Prop({ default: true })
    isPublished: boolean;

    // ИСПРАВЛЕНО: правильная структура файлов
    @Prop([{
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String },
        size: { type: Number },
        url: { type: String, required: true }
    }])
    files: Array<{
        filename: string;
        originalName: string;
        mimeType?: string;
        size?: number;
        url: string;
    }>;

    // Статистика задания
    @Prop({ default: 0 })
    submissions_count: number;

    @Prop({ default: 0 })
    completed_count: number;

    @Prop({ default: 0 })
    average_score: number;

    @Prop({ default: true })
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const HomeworkSchema = SchemaFactory.createForClass(Homework);

HomeworkSchema.index({ lesson: 1 });
HomeworkSchema.index({ teacher: 1 });
HomeworkSchema.index({ deadline: 1 });