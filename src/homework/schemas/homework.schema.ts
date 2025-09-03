// src/homework/schemas/homework.schema.ts - ОБНОВЛЕННАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { Lesson } from '../../lessons/schemas/lesson.schema';
import { Teacher } from '../../teachers/schemas/teacher.schema';

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
    @Type(() => Lesson)
    lesson: Lesson;

    @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
    @Type(() => Teacher)
    teacher: Teacher; // ИСПРАВЛЕНО: вместо teacherId

    @Prop()
    deadline?: Date; // ДОБАВЛЕНО

    @Prop({ min: 1, max: 100 })
    max_score?: number; // ДОБАВЛЕНО

    @Prop({ default: 1, min: 1 })
    max_attempts?: number; // ДОБАВЛЕНО

    @Prop({ default: false })
    allow_late_submission?: boolean; // ДОБАВЛЕНО

    @Prop({ default: false })
    isPublished: boolean; // ДОБАВЛЕНО

    @Prop({ default: 0 })
    submissions_count: number; // ДОБАВЛЕНО

    @Prop({ default: 0 })
    completed_count: number; // ДОБАВЛЕНО

    @Prop({ default: 0 })
    average_score: number; // ДОБАВЛЕНО

    @Prop([{
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String },
        size: { type: Number },
        url: { type: String, required: true }
    }])
    files: {
        filename: string;
        originalName: string;
        mimeType?: string;
        size?: number;
        url: string;
    }[]; // ДОБАВЛЕНО

    @Prop({ default: true })
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const HomeworkSchema = SchemaFactory.createForClass(Homework);

HomeworkSchema.index({ lesson: 1 });
HomeworkSchema.index({ teacher: 1 });