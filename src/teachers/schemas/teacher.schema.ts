// src/teachers/schemas/teacher.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TeacherDocument = Teacher & Document;

/**
 * Схема преподавателя
 * Содержит все основные поля пользователя + специфичные поля для преподавателя
 */
@Schema({
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
    toJSON: {
        virtuals: true, // Включает виртуальные поля в JSON
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            // Скрываем чувствительную информацию
            delete ret.password;
            delete ret.verificationToken;
            delete ret.resetPasswordToken;
            return ret;
        }
    }
})
export class Teacher {
    // Виртуальное поле ID (преобразуется из _id MongoDB)
    id?: string;

    // Ссылка на аватар в отдельной коллекции
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Avatar',
        default: null,
        index: true
    })
    avatarId?: MongooseSchema.Types.ObjectId;

    // Основная информация преподавателя
    @Prop({ required: true, unique: true })
    email: string; // Email адрес преподавателя (уникальный, обязательный)

    @Prop({ required: true })
    password: string; // Хешированный пароль преподавателя (обязательный)

    @Prop({ required: true })
    name: string; // Имя преподавателя (обязательное для преподавателей)

    @Prop({ required: true })
    second_name: string; // Фамилия преподавателя (обязательное для преподавателей)

    @Prop()
    age: number; // Возраст преподавателя (необязательное)

    @Prop()
    telefon_number: string; // Номер телефона преподавателя (необязательное)

    // Специфичные поля для преподавателя
    @Prop({ required: true, type: String })
    description: string; // Описание преподавателя (обязательное)

    @Prop({ type: String })
    specialization: string; // Специализация преподавателя

    @Prop({ type: String })
    education: string; // Образование преподавателя

    @Prop({ type: Number, default: 0 })
    experience_years: number; // Опыт работы в годах

    @Prop({ type: [String], default: [] })
    skills: string[]; // Навыки и умения преподавателя

    @Prop({ type: String })
    cv_file_url: string; // Ссылка на CV файл

    // Список курсов, которые ведет преподаватель (ссылки на курсы)
    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }],
        default: []
    })
    courses: MongooseSchema.Types.ObjectId[]; // Массив ID курсов

    // Статусы и состояние аккаунта
    @Prop({ default: false })
    isEmailVerified: boolean; // Статус подтверждения email (по умолчанию false)

    @Prop({ default: false })
    isBlocked: boolean; // Статус блокировки преподавателя (по умолчанию false)

    @Prop({ default: false })
    isApproved: boolean; // Статус одобрения администратором (по умолчанию false)

    @Prop({ default: 'pending' })
    approvalStatus: 'pending' | 'approved' | 'rejected'; // Статус заявки

    @Prop({ type: String })
    rejectionReason?: string; // Причина отклонения заявки

    @Prop({ type: Date })
    approvedAt?: Date; // Дата одобрения заявки

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User'
    })
    approvedBy?: MongooseSchema.Types.ObjectId; // Кто одобрил заявку

    // Токены для верификации email
    @Prop({ type: String, default: null })
    verificationToken: string | null; // Токен для подтверждения email

    @Prop({ type: Date, default: null })
    verificationTokenExpires: Date | null; // Срок действия токена верификации

    // Токены для сброса пароля
    @Prop({ type: String, default: null })
    resetPasswordToken: string | null; // Токен для сброса пароля

    @Prop({ type: Date, default: null })
    resetPasswordExpires: Date | null; // Срок действия токена сброса пароля

    // Рейтинг преподавателя
    @Prop({ type: Number, default: 0, min: 0, max: 5 })
    rating: number; // Средний рейтинг преподавателя

    @Prop({ type: Number, default: 0 })
    reviewsCount: number; // Количество отзывов

    // Системные поля (автоматически управляются Mongoose при timestamps: true)
    createdAt?: Date; // Дата и время создания записи
    updatedAt?: Date; // Дата и время последнего обновления записи
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);

// Добавляем виртуальное поле id
TeacherSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Создаем индексы для оптимизации поиска
TeacherSchema.index({ email: 1 }, { unique: true });
TeacherSchema.index({ avatarId: 1 });
TeacherSchema.index({ isBlocked: 1 });
TeacherSchema.index({ isEmailVerified: 1 });
TeacherSchema.index({ isApproved: 1 });
TeacherSchema.index({ approvalStatus: 1 });
TeacherSchema.index({ rating: -1 }); // Сортировка по рейтингу (убывание)
TeacherSchema.index({ courses: 1 }); // Индекс для поиска по курсам