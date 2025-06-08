// src/users/schemas/user.schema.ts (добавить поле isBlocked)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';


export type UserDocument = User & Document;

@Schema({
    timestamps: true, // Добавляем автоматические поля createdAt и updatedAt
    toJSON: {
        virtuals: true, // Добавляем виртуальные поля в JSON представление
        transform: (doc, ret) => {
            ret.id = ret._id.toString(); // Преобразуем _id в id
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
})

export class User {
    // Виртуальное поле ID (преобразуется из _id MongoDB)
    id?: string;

    // Ссылка на аватар в отдельной коллекции
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Avatar',
        default: null,
    })
    avatarId?: MongooseSchema.Types.ObjectId;

    // Основная информация пользователя
    @Prop({ required: true, unique: true })
    email: string; // Email адрес пользователя (уникальный, обязательный)

    @Prop({ required: true })
    password: string; // Хешированный пароль пользователя (обязательный)

    @Prop()
    name: string; // Имя пользователя (необязательное)

    @Prop()
    second_name: string; // Фамилия пользователя (необязательное)

    @Prop()
    age: number; // Возраст пользователя (необязательное)

    @Prop()
    telefon_number: string; // Номер телефона пользователя (необязательное)

    // Статусы и состояние аккаунта
    @Prop({ default: false })
    isEmailVerified: boolean; // Статус подтверждения email (по умолчанию false)

    @Prop({ default: false })
    isBlocked: boolean; // Статус блокировки пользователя (по умолчанию false)

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

    // Роли пользователя (связь с коллекцией ролей)
    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Role' }] })
    roles: Role[]; // Массив ролей пользователя (ссылки на документы Role)

    // Системные поля (автоматически управляются Mongoose при timestamps: true)
    createdAt?: Date; // Дата и время создания записи
    updatedAt?: Date; // Дата и время последнего обновления записи
}

export const UserSchema = SchemaFactory.createForClass(User);

// Добавляем виртуальное поле id
UserSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Индексы для оптимизации
UserSchema.index({ avatarId: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ isBlocked: 1 });
UserSchema.index({ isEmailVerified: 1 });