// src/users/schemas/user.schema.ts - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret: any) => {
            if (ret._id) ret.id = ret._id.toString();
            if (ret._id !== undefined) delete ret._id;
            if (ret.__v !== undefined) delete ret.__v;
            if (ret.password !== undefined) delete ret.password;
            return ret;
        }
    }
})
export class User {
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    second_name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    // Дополнительные поля, используемые в сервисах/контроллерах
    @Prop({ unique: true, sparse: true })
    login?: string; // Уникальный логин

    @Prop()
    age?: number;

    @Prop()
    telefon_number?: string;

    // Google OAuth поля
    @Prop({ unique: true, sparse: true })
    googleId?: string;

    @Prop({ default: false })
    is_google_user?: boolean;

    @Prop()
    avatar_url?: string;

    @Prop()
    google_access_token?: string;

    @Prop()
    google_refresh_token?: string;

    @Prop()
    google_token_expires_at?: Date;

    @Prop()
    last_google_login?: Date;

    @Prop()
    phone?: string;

    @Prop({ enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop()
    dateOfBirth?: Date;

    // Блокировка
    @Prop({ default: false })
    isBlocked: boolean;

    // Система ролей (отдельная коллекция Role). В коде используется user.roles
    @Prop({ type: [Types.ObjectId], ref: 'Role', default: [] })
    roles?: Types.ObjectId[];

    // Поля для токенов верификации (legacy + текущая логика)
    @Prop({ type: String, default: null })
    verificationToken?: string | null;

    @Prop({ type: Date, default: null })
    verificationTokenExpires?: Date | null;

    @Prop({ type: String, default: null })
    resetPasswordToken?: string | null;

    @Prop({ type: Date, default: null })
    resetPasswordExpires?: Date | null;

    // Поля для кода подтверждения email (новая регистрация)
    @Prop({ type: String, default: null })
    verificationCode?: string | null;

    @Prop({ type: Date, default: null })
    verificationCodeExpires?: Date | null;

    // Поля для изменения email
    @Prop({ type: String, default: null })
    pendingEmail?: string | null;

    @Prop({ type: String, default: null })
    emailChangeCode?: string | null;

    @Prop({ type: Date, default: null })
    emailChangeCodeExpires?: Date | null;

    // Аватар (связь на коллекцию Avatar)
    @Prop({ type: Types.ObjectId, ref: 'Avatar' })
    avatarId?: Types.ObjectId | null;

    createdAt: Date;
    updatedAt: Date;

    // Метод для обновления Google токенов (используется в сервисе)
    updateGoogleTokens?(accessToken: string, refreshToken?: string): void;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Реализация метода экземпляра
UserSchema.methods.updateGoogleTokens = function (accessToken: string, refreshToken?: string) {
    this.google_access_token = accessToken;
    if (refreshToken) this.google_refresh_token = refreshToken;
    // Токен считаем действительным 55 минут
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 55);
    this.google_token_expires_at = expires;
    this.last_google_login = new Date();
};

UserSchema.index({ role: 1 });