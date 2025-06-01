// src/lessons/schemas/lesson.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LessonDocument = Lesson & Document;

/**
 * Схема урока
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
export class Lesson {
    // Виртуальное поле ID
    id?: string;

    // Связь с курсом
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    })
    courseId: MongooseSchema.Types.ObjectId; // ID курса

    // Основная информация урока
    @Prop({ required: true })
    title: string; // Название урока

    @Prop({ required: true })
    description: string; // Описание урока

    @Prop({ type: String })
    short_description: string; // Краткое описание

    // Порядок урока в курсе
    @Prop({ required: true, type: Number })
    order: number; // Порядковый номер урока в курсе

    @Prop({ type: Number, default: 0 })
    duration_minutes: number; // Продолжительность урока в минутах

    // Контент урока
    @Prop({ type: String })
    text_content: string; // Текстовый контент урока

    @Prop({ type: String })
    content_html: string; // HTML контент (для форматированного текста)

    // Видео материалы (может быть несколько видео на урок)
    @Prop({
        type: [{
            title: { type: String, required: true },
            url: { type: String, required: true },
            duration_minutes: { type: Number, default: 0 },
            order: { type: Number, default: 0 }
        }],
        default: []
    })
    videos: Array<{
        title: string;
        url: string; // Ссылка на видео
        duration_minutes: number;
        order: number;
    }>;

    // Дополнительные материалы
    @Prop({
        type: [{
            title: { type: String, required: true },
            url: { type: String, required: true },
            type: {
                type: String,
                enum: ['pdf', 'doc', 'ppt', 'image', 'link', 'other'],
                required: true
            },
            size_bytes: { type: Number, default: 0 }
        }],
        default: []
    })
    materials: Array<{
        title: string;
        url: string; // Ссылка на файл
        type: 'pdf' | 'doc' | 'ppt' | 'image' | 'link' | 'other';
        size_bytes: number;
    }>;

    // Домашнее задание
    @Prop({ type: String })
    homework_description: string; // Описание домашнего задания

    @Prop({
        type: [{
            title: { type: String, required: true },
            url: { type: String, required: true }, // Ссылка на файл в Google Drive
            type: {
                type: String,
                enum: ['document', 'template', 'example'],
                default: 'document'
            }
        }],
        default: []
    })
    homework_files: Array<{
        title: string;
        url: string; // Ссылка на Google Drive
        type: 'document' | 'template' | 'example';
    }>;

    @Prop({ type: Date })
    homework_deadline?: Date; // Срок сдачи домашнего задания

    @Prop({ type: Number, min: 0, max: 100 })
    homework_max_score?: number; // Максимальная оценка за домашнее задание

    // Статусы урока
    @Prop({ default: true })
    isActive: boolean; // Активен ли урок

    @Prop({ default: false })
    isPublished: boolean; // Опубликован ли урок

    @Prop({ default: false })
    isFree: boolean; // Бесплатный ли урок (доступен без подписки)

    // Требования для доступа
    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }],
        default: []
    })
    prerequisites: MongooseSchema.Types.ObjectId[]; // Уроки, которые нужно пройти перед этим

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Виртуальное поле id
LessonSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальные поля для связей
LessonSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});

LessonSchema.virtual('homework_submissions', {
    ref: 'HomeworkSubmission',
    localField: '_id',
    foreignField: 'lessonId'
});

// Индексы для оптимизации
LessonSchema.index({ courseId: 1, order: 1 }); // Составной индекс для сортировки уроков в курсе
LessonSchema.index({ courseId: 1 });
LessonSchema.index({ isActive: 1, isPublished: 1 });
LessonSchema.index({ isFree: 1 });
LessonSchema.index({ order: 1 });

// Уникальный индекс для предотвращения дублирования порядка уроков в одном курсе
LessonSchema.index({ courseId: 1, order: 1 }, { unique: true });