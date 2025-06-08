// src/courses/schemas/course.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CourseDocument = Course & Document;

/**
 * Схема курса
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
export class Course {
    // Виртуальное поле ID
    id?: string;

    // Основная информация о курсе
    @Prop({ required: true })
    title: string; // Название курса

    @Prop({ required: true })
    description: string; // Описание курса

    @Prop({ type: String })
    short_description: string; // Краткое описание для карточек

    // Логотип курса (base64 или ссылка на файл)
    @Prop({ type: String })
    logo_url: string; // URL логотипа курса

    @Prop({ type: String })
    cover_image_url: string; // URL обложки курса

    // Цена и финансовая информация
    @Prop({ required: true, type: Number, min: 0 })
    price: number; // Цена курса

    @Prop({ type: Number, min: 0 })
    discount_price?: number; // Цена со скидкой

    @Prop({ type: String, enum: ['USD', 'EUR', 'UAH'], default: 'USD' })
    currency: string; // Валюта

    // Преподаватель курса (один преподаватель на курс)
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    })
    teacherId: MongooseSchema.Types.ObjectId; // ID преподавателя

    // Категория и теги
    @Prop({ type: String })
    category: string; // Категория курса

    @Prop({ type: [String], default: [] })
    tags: string[]; // Теги для поиска

    @Prop({ type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
    difficulty_level: string; // Уровень сложности

    // Статусы курса
    @Prop({ default: false })
    isPublished: boolean; // Опубликован ли курс

    @Prop({ default: true })
    isActive: boolean; // Активен ли курс

    @Prop({ default: false })
    isFeatured: boolean; // Рекомендуемый курс

    // Временные характеристики
    @Prop({ type: Number, default: 0 })
    duration_hours: number; // Продолжительность в часах

    @Prop({ type: Number, default: 0 })
    lessons_count: number; // Количество уроков (обновляется автоматически)

    @Prop({ type: Date })
    start_date?: Date; // Дата начала курса

    @Prop({ type: Date })
    end_date?: Date; // Дата окончания курса

    // Ограничения и требования
    @Prop({ type: Number, default: 0 })
    max_students: number; // Максимальное количество студентов (0 = без ограничений)

    @Prop({ type: Number, default: 0 })
    current_students_count: number; // Текущее количество студентов

    @Prop({
        type: [{ type: Types.ObjectId, ref: 'Course' }],
        default: []
    })
    prerequisites: Types.ObjectId[] | Course[]; // Предварительные требования

    @Prop({ type: [String], default: [] })
    learning_outcomes: string[]; // Что изучит студент

    // Рейтинг и отзывы
    @Prop({ type: Number, default: 0, min: 0, max: 5 })
    rating: number; // Средний рейтинг курса

    @Prop({ type: Number, default: 0 })
    reviews_count: number; // Количество отзывов

    // Дополнительные настройки
    @Prop({ type: String })
    language: string; // Язык курса

    @Prop({ type: Boolean, default: false })
    has_certificate: boolean; // Выдается ли сертификат

    @Prop({ type: String })
    certificate_template_url: string; // Шаблон сертификата

    // Маркетинговая информация
    @Prop({ type: String })
    promo_video_url: string; // Промо-видео курса

    @Prop({ type: [String], default: [] })
    target_audience: string[]; // Целевая аудитория

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Виртуальное поле id
CourseSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальные поля для связей
CourseSchema.virtual('lessons', {
    ref: 'Lesson',
    localField: '_id',
    foreignField: 'courseId'
});

CourseSchema.virtual('enrollments', {
    ref: 'Subscription',
    localField: '_id',
    foreignField: 'courseId'
});

CourseSchema.virtual('teacher', {
    ref: 'Teacher',
    localField: 'teacherId',
    foreignField: '_id',
    justOne: true
});

// Индексы для оптимизации
CourseSchema.index({ teacherId: 1 });
CourseSchema.index({ isPublished: 1, isActive: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ difficulty_level: 1 });
CourseSchema.index({ rating: -1 });
CourseSchema.index({ price: 1 });
CourseSchema.index({ created_at: -1 });
CourseSchema.index({ title: 'text', description: 'text' }); // Текстовый поиск