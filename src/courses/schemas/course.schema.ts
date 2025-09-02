// src/courses/schemas/course.schema.ts - ОБНОВЛЕННАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { Teacher } from '../../teachers/schemas/teacher.schema';
import { Subject } from '../../subjects/schemas/subject.schema';

export type CourseDocument = Course & Document;

@Schema({
    timestamps: true,
    collection: 'courses'
})
export class Course {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isPublished: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Teacher' })
    @Type(() => Teacher)
    mainTeacher?: Teacher;

    // НОВОЕ: Предметы курса с привязанными преподавателями
    @Prop([{
        subject: { type: Types.ObjectId, ref: 'Subject', required: true },
        teacher: { type: Types.ObjectId, ref: 'Teacher' },
        startDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        addedAt: { type: Date, default: Date.now }
    }])
    courseSubjects: {
        subject: Subject;
        teacher?: Teacher;
        startDate: Date;
        isActive: boolean;
        addedAt: Date;
    }[];

    @Prop({ type: Types.ObjectId, ref: 'Category' })
    category?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'DifficultyLevel' })
    difficultyLevel?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Индексы для оптимизации поиска
CourseSchema.index({ 'courseSubjects.subject': 1 });
CourseSchema.index({ 'courseSubjects.teacher': 1 });
CourseSchema.index({ startDate: 1 });