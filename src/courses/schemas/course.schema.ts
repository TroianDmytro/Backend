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

    // ИСПРАВЛЕНО: добавлены отсутствующие поля
    @Prop({ required: true, trim: true })
    title: string; // вместо name

    @Prop({ trim: true })
    short_description?: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop()
    logo_url?: string;

    @Prop({ min: 0, max: 100, default: 0 })
    discount_percent?: number;

    @Prop({ default: 'USD' })
    currency: string;

    @Prop({ default: 0, min: 0, max: 5 })
    rating: number;

    @Prop({ default: 0, min: 0 })
    reviews_count: number;

    @Prop({ default: 0, min: 0 })
    current_students_count: number;

    @Prop({ min: 0 })
    duration_hours?: number;

    @Prop({ default: 0, min: 0 })
    lessons_count: number;

    @Prop({ required: true })
    startDate: Date;

    // ИСПРАВЛЕНО: правильное имя поля
    @Prop({ default: true })
    isActive: boolean; // вместо is_active

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

    // ИСПРАВЛЕНО: правильные имена полей
    @Prop({ type: Types.ObjectId, ref: 'Category' })
    category?: Types.ObjectId; // вместо categoryId

    @Prop({ type: Types.ObjectId, ref: 'DifficultyLevel' })
    difficultyLevel?: Types.ObjectId; // вместо difficultyLevelId

    @Prop({ default: 0, min: 0 })
    students_count: number;

    @Prop({ default: 0, min: 0, max: 5 })
    average_rating: number;

    @Prop({ default: 50, min: 1 })
    max_students: number;

    @Prop()
    slug?: string;

    @Prop({ default: false })
    paymentRequired: boolean; // Требуется ли оплата для записи

    @Prop({ default: false })
    allowLateEnrollment: boolean; // Разрешена ли запись после начала курса (только админ)

    @Prop({ default: Date.now })
    enrollmentDeadline?: Date; // Крайний срок для записи

    createdAt: Date;
    updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Индексы для оптимизации поиска
CourseSchema.index({ 'courseSubjects.subject': 1 });
CourseSchema.index({ 'courseSubjects.teacher': 1 });
CourseSchema.index({ startDate: 1 });
CourseSchema.index({ slug: 1 }, { unique: true, sparse: true });