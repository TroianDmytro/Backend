// src/users/schemas/user.schema.ts - ДОПОЛНЕНИЯ для Google OAuth
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';
import { Course } from 'src/courses/schemas/course.schema';

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
export class User {
    id?: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Avatar',
        default: null,
    })
    avatarId?: MongooseSchema.Types.ObjectId;

    // Основная информация пользователя
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: false, unique: true, sparse: true }) // sparse для null значений
    login?: string; // Делаем необязательным для Google пользователей

    @Prop({ required: false }) // Необязательно для Google пользователей
    password?: string;

    @Prop()
    name?: string;

    @Prop()
    second_name?: string;

    @Prop()
    age?: number;

    @Prop()
    telefon_number?: string;

    // === НОВЫЕ ПОЛЯ ДЛЯ GOOGLE OAUTH ===

    @Prop({ type: String, unique: true, sparse: true })
    googleId?: string; // ID пользователя в Google

    @Prop({ type: String })
    avatar_url?: string; // URL аватара от Google

    @Prop({ type: String })
    google_access_token?: string; // Токен доступа Google (можно шифровать)

    @Prop({ type: String })
    google_refresh_token?: string; // Токен обновления Google (можно шифровать)

    @Prop({ type: Date })
    google_token_expires_at?: Date; // Срок действия Google токена

    @Prop({ type: Boolean, default: false })
    is_google_user: boolean; // Флаг, что пользователь зарегистрирован через Google

    @Prop({ type: Date })
    last_google_login?: Date; // Последний вход через Google

    // === ОСТАЛЬНЫЕ ПОЛЯ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ ===

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop({ default: false })
    isBlocked: boolean;

    // Коды верификации
    @Prop({ type: String, default: null })
    verificationCode: string | null;

    @Prop({ type: Date, default: null })
    verificationCodeExpires: Date | null;

    // Старые токены (для обратной совместимости)
    @Prop({ type: String, default: null })
    verificationToken: string | null;

    @Prop({ type: Date, default: null })
    verificationTokenExpires: Date | null;

    // Токены для сброса пароля
    @Prop({ type: String, default: null })
    resetPasswordToken: string | null;

    @Prop({ type: Date, default: null })
    resetPasswordExpires: Date | null;

    // Роли пользователя
    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Role' }] })
    roles: Role[];

    @Prop({
        type: [{ type: Types.ObjectId, ref: 'Course' }],
        default: []
    })
    assignedCourses: Types.ObjectId[] | Course[];

    createdAt?: Date;
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Добавляем виртуальное поле id
UserSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальное поле для определения типа авторизации
UserSchema.virtual('auth_provider').get(function () {
    if (this.is_google_user) return 'google';
    return 'local';
});

// Индексы для оптимизации
UserSchema.index({ avatarId: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ isBlocked: 1 });
UserSchema.index({ isEmailVerified: 1 });
UserSchema.index({ verificationCode: 1 });
UserSchema.index({ googleId: 1 }); // Индекс для Google ID
UserSchema.index({ is_google_user: 1 }); // Индекс для типа пользователя

// Добавляем методы в интерфейс UserDocument
export interface UserMethods {
    updateGoogleTokens(accessToken: string, refreshToken?: string): void;
    isGoogleTokenValid(): boolean;
}

// Обновляем тип UserDocument
export type UserDocument = User & Document & UserMethods;

/**
 * Методы для работы с Google токенами
 */
UserSchema.methods.updateGoogleTokens = function (accessToken: string, refreshToken?: string) {
    this.google_access_token = accessToken;
    if (refreshToken) {
        this.google_refresh_token = refreshToken;
    }
    this.google_token_expires_at = new Date(Date.now() + 3600 * 1000); // 1 час
    this.last_google_login = new Date();
};

UserSchema.methods.isGoogleTokenValid = function () {
    return this.google_token_expires_at && this.google_token_expires_at > new Date();
};