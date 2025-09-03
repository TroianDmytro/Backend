// src/lessons/schemas/lesson.schema.ts - ОБНОВЛЕННАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { Course } from '../../courses/schemas/course.schema';
import { Subject } from '../../subjects/schemas/subject.schema';
import { Teacher } from '../../teachers/schemas/teacher.schema';
import { User } from '../../users/schemas/user.schema';

export type LessonDocument = Lesson & Document;

@Schema({
    timestamps: true,
    collection: 'lessons'
})
export class Lesson {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    startTime: string; // формат HH:MM

    @Prop({ required: true })
    endTime: string; // формат HH:MM

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    @Type(() => Course)
    course: Course;

    @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
    @Type(() => Subject)
    subject: Subject;

    @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
    @Type(() => Teacher)
    teacher: Teacher;

    // НОВОЕ: Посещаемость студентов с оценками за занятие
    @Prop([{
        user: { type: Types.ObjectId, ref: 'User', required: true },
        isPresent: { type: Boolean, default: false },
        lessonGrade: { type: Number, min: 1, max: 5 },
        notes: { type: String },
        markedAt: { type: Date, default: Date.now },
        markedBy: { type: Types.ObjectId, ref: 'Teacher' }
    }])
    attendance: {
        user: Types.ObjectId;
        isPresent: boolean;
        lessonGrade?: number;
        notes?: string;
        markedAt: Date;
        markedBy: Types.ObjectId;
    }[];

    @Prop({ default: 0, min: 1 })
    order: number; // ДОБАВЛЕНО: порядок урока

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isCompleted: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Индексы
LessonSchema.index({ course: 1, subject: 1 });
LessonSchema.index({ teacher: 1 });
LessonSchema.index({ date: 1 });