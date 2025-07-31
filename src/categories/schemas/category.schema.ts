// src/categories/schemas/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

/**
 * Схема категории курсов
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
export class Category {
    // Виртуальное поле ID
    id?: string;

    // Основная информация о категории
    @Prop({ required: true, unique: true })
    name: string; // Название категории (уникальное)

    @Prop({ required: true, unique: true })
    slug: string; // URL-friendly название для роутинга

    @Prop({ required: true })
    description: string; // Описание категории

    @Prop({ type: String })
    short_description?: string; // Краткое описание для карточек

    // Визуальное оформление
    @Prop({ type: String })
    icon?: string; // Иконка категории (класс иконки или URL)

    @Prop({ type: String })
    image_url?: string; // Изображение категории

    @Prop({ type: String, default: '#3f51b5' })
    color?: string; // Цвет категории для UI

    // Иерархия категорий
    @Prop({ type: String, default: null })
    parent_id?: string; // ID родительской категории (для подкатегорий)

    // Статусы и настройки
    @Prop({ default: true })
    isActive: boolean; // Активна ли категория

    @Prop({ default: false })
    isFeatured: boolean; // Рекомендуемая категория

    @Prop({ type: Number, default: 0 })
    order: number; // Порядок отображения

    // SEO
    @Prop({ type: String })
    meta_title?: string; // SEO заголовок

    @Prop({ type: String })
    meta_description?: string; // SEO описание

    @Prop({ type: [String], default: [] })
    meta_keywords?: string[]; // SEO ключевые слова

    // Статистика
    @Prop({ type: Number, default: 0 })
    courses_count: number; // Количество курсов в категории

    @Prop({ type: Number, default: 0 })
    students_count: number; // Количество студентов в категории

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Виртуальное поле id
CategorySchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальные поля для связей
CategorySchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'categoryId'
});

CategorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent_id'
});

// Индексы для оптимизации
CategorySchema.index({ parent_id: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ name: 'text', description: 'text' }); // Текстовый поиск