// src/homework/schemas/homework.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type HomeworkDocument = Homework & Document;

/**
 * Схема домашнего задания для урока
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
export class Homework {
    // Виртуальное поле ID
    id?: string;

    // Связи с основными сущностями
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    })
    lessonId: MongooseSchema.Types.ObjectId; // ID урока

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Course',
        required: true,
    })
    courseId: MongooseSchema.Types.ObjectId; // ID курса

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    })
    teacherId: MongooseSchema.Types.ObjectId; // ID преподавателя

    // Основная информация о задании
    @Prop({ required: true })
    title: string; // Название задания

    @Prop({ required: true })
    description: string; // Описание задания

    @Prop({ type: String })
    requirements?: string; // Требования к выполнению

    // Файлы задания (хранятся как Base64 в MongoDB)
    @Prop({
        type: [{
            filename: { type: String, required: true },
            original_name: { type: String, required: true },
            data: { type: String, required: true }, // Base64 данные ZIP файла
            size_bytes: { type: Number, required: true },
            mime_type: { type: String, default: 'application/zip' },
            uploaded_at: { type: Date, default: Date.now }
        }],
        required: true,
        validate: {
            validator: function (files: any[]) {
                return files && files.length > 0;
            },
            message: 'Необходимо загрузить хотя бы один файл задания'
        }
    })
    files: Array<{
        filename: string;
        original_name: string;
        data: string; // Base64 строка
        size_bytes: number;
        mime_type: string;
        uploaded_at: Date;
    }>;

    // Настройки задания
    @Prop({ type: Date })
    deadline?: Date; // Срок сдачи

    @Prop({ type: Number, min: 0, max: 100, default: 100 })
    max_score: number; // Максимальная оценка

    @Prop({ type: Number, default: 3, min: 1 })
    max_attempts: number; // Максимальное количество попыток

    @Prop({ type: Boolean, default: true })
    allow_late_submission: boolean; // Разрешить сдачу после дедлайна

    // Статус и видимость
    @Prop({ type: Boolean, default: true })
    isActive: boolean; // Активно ли задание

    @Prop({ type: Boolean, default: false })
    isPublished: boolean; // Опубликовано ли задание

    // Статистика
    @Prop({ type: Number, default: 0 })
    submissions_count: number; // Количество отправленных работ

    @Prop({ type: Number, default: 0 })
    completed_count: number; // Количество проверенных работ

    @Prop({ type: Number, default: 0, min: 0, max: 5 })
    average_score: number; // Средняя оценка

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const HomeworkSchema = SchemaFactory.createForClass(Homework);

// Виртуальное поле id
HomeworkSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальные поля для связей
HomeworkSchema.virtual('lesson', {
    ref: 'Lesson',
    localField: 'lessonId',
    foreignField: '_id',
    justOne: true
});

HomeworkSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});

HomeworkSchema.virtual('teacher', {
    ref: 'Teacher',
    localField: 'teacherId',
    foreignField: '_id',
    justOne: true
});

HomeworkSchema.virtual('submissions', {
    ref: 'HomeworkSubmission',
    localField: '_id',
    foreignField: 'homeworkId'
});

// Индексы для оптимизации
HomeworkSchema.index({ lessonId: 1 });
HomeworkSchema.index({ courseId: 1 });
HomeworkSchema.index({ teacherId: 1 });
HomeworkSchema.index({ isActive: 1, isPublished: 1 });
HomeworkSchema.index({ deadline: 1 });

// Составной индекс для уникальности заданий в уроке
HomeworkSchema.index({ lessonId: 1, title: 1 }, { unique: true });

/**
 * Объяснение схемы домашних заданий:
 * 
 * 1. **ОСНОВНЫЕ СВЯЗИ:**
 *    - lessonId - связь с уроком
 *    - courseId - связь с курсом (для удобства фильтрации)
 *    - teacherId - связь с преподавателем (копируется из курса)
 * 
 * 2. **ХРАНЕНИЕ ФАЙЛОВ:**
 *    - Файлы хранятся как Base64 строки в MongoDB
 *    - Поддерживается только ZIP формат
 *    - Сохраняется оригинальное имя файла и размер
 * 
 * 3. **НАСТРОЙКИ ЗАДАНИЯ:**
 *    - deadline - срок сдачи
 *    - max_score - максимальная оценка
 *    - max_attempts - количество попыток
 *    - allow_late_submission - разрешить опоздание
 * 
 * 4. **СТАТИСТИКА:**
 *    - submissions_count - количество отправок
 *    - completed_count - количество проверенных
 *    - average_score - средняя оценка
 * 
 * 5. **ВИРТУАЛЬНЫЕ ПОЛЯ:**
 *    - submissions - список отправленных работ
 *    - lesson, course, teacher - связанные сущности
 */