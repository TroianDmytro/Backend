// src/lessons/schemas/lesson.schema.ts - ОБНОВЛЕНО для связи с домашними заданиями
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LessonDocument = Lesson & Document;

/**
 * Схема урока с поддержкой домашних заданий
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

    // УСТАРЕВШИЕ ПОЛЯ домашнего задания (оставлены для совместимости)
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

    // НОВЫЕ ПОЛЯ для статистики домашних заданий
    @Prop({ type: Number, default: 0 })
    homework_count: number; // Количество домашних заданий в уроке

    @Prop({ type: Number, default: 0 })
    homework_submissions_count: number; // Общее количество отправок по всем заданиям

    @Prop({ type: Number, default: 0, min: 0, max: 5 })
    homework_average_score: number; // Средняя оценка по всем домашним заданиям урока

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

// НОВОЕ: Виртуальное поле для домашних заданий
LessonSchema.virtual('homeworks', {
    ref: 'Homework',
    localField: '_id',
    foreignField: 'lessonId'
});

// НОВОЕ: Виртуальное поле для отправок домашних заданий
LessonSchema.virtual('homework_submissions', {
    ref: 'HomeworkSubmission',
    localField: '_id',
    foreignField: 'lessonId'
});

// Индексы для оптимизации
LessonSchema.index({ courseId: 1 });
LessonSchema.index({ isActive: 1, isPublished: 1 });
LessonSchema.index({ isFree: 1 });
LessonSchema.index({ order: 1 });
LessonSchema.index({ homework_count: 1 }); // НОВЫЙ индекс для домашних заданий

// Уникальный индекс для предотвращения дублирования порядка уроков в одном курсе
LessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

/**
 * Объяснение изменений в схеме уроков:
 * 
 * 1. **ОБРАТНАЯ СОВМЕСТИМОСТЬ:**
 *    - Оставлены старые поля homework_* для совместимости
 *    - Новые задания используют отдельную коллекцию Homework
 * 
 * 2. **НОВЫЕ ПОЛЯ СТАТИСТИКИ:**
 *    - homework_count - количество заданий в уроке
 *    - homework_submissions_count - общее количество отправок
 *    - homework_average_score - средняя оценка по заданиям
 * 
 * 3. **ВИРТУАЛЬНЫЕ ПОЛЯ:**
 *    - homeworks - связь с коллекцией домашних заданий
 *    - homework_submissions - связь с отправками заданий
 * 
 * 4. **ИНДЕКСЫ:**
 *    - Добавлен индекс для homework_count для быстрой фильтрации
 * 
 * Использование:
 * - Можно получить все задания урока через populate('homeworks')
 * - Статистика обновляется автоматически при добавлении/удалении заданий
 * - Поддерживается как старый, так и новый формат домашних заданий
 */