// src/courses/schemas/course.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({
    timestamps: true, // автоматически добавляет createdAt и updatedAt
    collection: 'courses'
})
export class Course {
    @Prop({ required: true, trim: true })
    title: string; // Название курса

    @Prop({ required: true, unique: true, trim: true })
    slug: string; // URL-дружелюбный идентификатор

    @Prop({ required: true })
    description: string; // Описание курса

    @Prop({ type: String })
    image_url?: string; // URL изображения курса

    @Prop({ required: true, min: 0 })
    price: number; // Цена курса

    @Prop({ min: 0, max: 100, default: 0 })
    discount_percent: number; // Процент скидки

    @Prop({ required: true, enum: ['USD', 'EUR', 'UAH', 'RUB'], default: 'USD' })
    currency: string; // Валюта

    @Prop({ default: true })
    is_active: boolean; // Активен ли курс

    @Prop({ default: false })
    is_featured: boolean; // Рекомендуемый курс

    @Prop({ min: 0, default: 0 })
    duration_hours: number; // Продолжительность в часах

    @Prop({ min: 0, default: 0 })
    lessons_count: number; // Количество уроков

    @Prop({ type: [String], default: [] })
    tags: string[]; // Теги курса

    @Prop({ type: String })
    preview_video_url?: string; // URL превью видео

    @Prop({ type: String })
    certificate_template?: string; // Шаблон сертификата

    @Prop({ default: true })
    allow_comments: boolean; // Разрешены ли комментарии

    @Prop({ default: false })
    requires_approval: boolean; // Требует ли подтверждения

    //Связь с преподавателем через ObjectId
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    })
    teacherId: MongooseSchema.Types.ObjectId; // ID преподавателя

    // Связи с категорией и уровнем сложности
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Category',
        required: true
    })
    categoryId: MongooseSchema.Types.ObjectId; // ID категории курса

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'DifficultyLevel',
        required: true
    })
    difficultyLevelId: MongooseSchema.Types.ObjectId; // ID уровня сложности

    // Статистические поля (обновляются автоматически)
    @Prop({ min: 0, default: 0 })
    students_count: number; // Количество студентов

    @Prop({ min: 0, max: 5, default: 0 })
    average_rating: number; // Средняя оценка

    @Prop({ min: 0, default: 0 })
    reviews_count: number; // Количество отзывов

    @Prop({ min: 0, default: 0 })
    completed_count: number; // Количество завершенных курсов

    @Prop({ min: 0, max: 100, default: 0 })
    completion_rate: number; // Процент завершения

    // Метаданные
    @Prop({ type: Date, default: Date.now })
    published_at: Date; // Дата публикации

    @Prop({ type: Date })
    updated_at?: Date; // Дата последнего обновления

}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Создаем индексы для оптимизации запросов
CourseSchema.index({ slug: 1 }, { unique: true });
CourseSchema.index({ categoryId: 1 }); // Индекс для поиска по категориям
CourseSchema.index({ difficultyLevelId: 1 }); // Индекс для поиска по уровням сложности
CourseSchema.index({ teacherId: 1 }); // Индекс для поиска по преподавателям
CourseSchema.index({ is_active: 1, is_featured: 1 }); // Составной индекс для активных и рекомендуемых
CourseSchema.index({ price: 1 }); // Индекс для сортировки по цене
CourseSchema.index({ average_rating: 1 }); // Индекс для сортировки по рейтингу
CourseSchema.index({ created_at: -1 }); // Индекс для сортировки по дате создания

/**
 * Объяснение изменений в схеме курсов:
 * 
 * 1. **УДАЛЕННЫЕ ПОЛЯ:**
 *    - category: string → убрано (заменено на categoryId)
 *    - difficulty_level: string → убрано (заменено на difficultyLevelId)
 * 
 * 2. **НОВЫЕ ПОЛЯ-СВЯЗИ:**
 *    - categoryId: ObjectId - связь с коллекцией categories
 *    - difficultyLevelId: ObjectId - связь с коллекцией difficulty_levels
 * 
 * 3. **ПРЕИМУЩЕСТВА НОВОЙ СТРУКТУРЫ:**
 *    - Нормализация данных (избежание дублирования)
 *    - Возможность получать детальную информацию через populate()
 *    - Централизованное управление категориями и уровнями
 *    - Автоматическое обновление статистики
 * 
 * 4. **ИНДЕКСЫ:**
 *    - Добавлены индексы для новых полей связей
 *    - Оптимизированы запросы по категориям и уровням сложности
 * 
 * 5. **POPULATE ВОЗМОЖНОСТИ:**
 *    - .populate('categoryId') - получение данных категории
 *    - .populate('difficultyLevelId') - получение данных уровня
 *    - .populate('teacherId') - получение данных преподавателя
 */