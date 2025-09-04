// src/avatars/schemas/avatar.schema.ts

// Импортируем декораторы для работы с MongoDB
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Импортируем схему пользователя для связи
import { User } from '../../users/schemas/user.schema';

// Создаем тип документа для TypeScript
export type AvatarDocument = Avatar & Document;

// Декоратор @Schema создает схему MongoDB
@Schema({
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
    toJSON: {
        virtuals: true, // Включает виртуальные поля в JSON
        transform: (_doc, ret: any) => {
            if (ret._id) ret.id = ret._id.toString();
            if (ret._id !== undefined) delete ret._id;
            if (ret.__v !== undefined) delete ret.__v;
            return ret;
        }
    }
})
export class Avatar {
    // Виртуальное поле id
    id?: string;

    // Связь с пользователем через ObjectId
    @Prop({
        type: MongooseSchema.Types.ObjectId, // Тип поля - ObjectId MongoDB
        ref: 'User', // Ссылка на коллекцию User
        required: true // Обязательное поле
    })
    userId: User;

    // Base64 строка изображения
    @Prop({ required: true })
    imageData: string;

    // MIME тип файла
    @Prop({ required: true })
    mimeType: string;

    // Размер файла в байтах
    @Prop({ required: true })
    size: number;

    // Обязательные поля для размеров (теперь не optional)
    @Prop({ required: true })
    width: number;

    @Prop({ required: true })
    height: number;

    // Поля timestamps добавляются автоматически
    createdAt?: Date;
    updatedAt?: Date;
}

// Создаем схему из класса
export const AvatarSchema = SchemaFactory.createForClass(Avatar);

// Добавляем виртуальное поле id
AvatarSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Создаем индекс для быстрого поиска по userId
AvatarSchema.index({ userId: 1 });

export const minSizeKB = 10;
export const maxSizeKB = 1536;
export const minWidth = 256;
export const minHeight = 256;
