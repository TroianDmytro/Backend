// src/avatars/avatars.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avatar, AvatarDocument, maxSizeKB, minHeight, minSizeKB, minWidth } from './schemas/avatar.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { FileUploadValidator, FileValidationResult } from './validators/file-upload.validator';

@Injectable()
export class AvatarsService {
    private readonly logger = new Logger(AvatarsService.name);

    constructor(
        @InjectModel(Avatar.name) private avatarModel: Model<AvatarDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly fileUploadValidator: FileUploadValidator
    ) { }

    /**
    * Загрузка аватара из файла для пользователя
    */
    async uploadAvatarFromFile(
        userId: string,
        file: Express.Multer.File
    ): Promise<AvatarDocument> {
        this.logger.log(`Загрузка аватара из файла для пользователя: ${userId}`);

        // Шаг 1: Проверяем существование пользователя
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }

        // Шаг 2: Проверяем, есть ли уже аватар у пользователя
        const existingAvatar = await this.getAvatarByUserId(userId);
        if (existingAvatar) {
            throw new BadRequestException('У пользователя уже есть аватар. Используйте метод замены аватара.');
        }

        // Шаг 3: Валидируем загруженный файл с новыми ограничениями
        const validationResult = await this.fileUploadValidator.validateUploadedFile(file, {
            minSizeKB,   // 300 КБ минимум
            maxSizeKB,  // 1.5 МБ максимум
            minWidth,
            minHeight
        });

        if (!validationResult.isValid || !validationResult.imageData) {
            const errorMessage = `Файл не соответствует требованиям:\n${validationResult.errors.join('\n')}`;
            throw new BadRequestException(errorMessage);
        }

        // Шаг 4: Создаем новый аватар с чистыми base64 данными (без префикса)
        const newAvatar = new this.avatarModel({
            userId: userId,
            imageData: validationResult.imageData.base64, // Уже чистый base64 без префикса
            mimeType: validationResult.imageData.mimeType,
            size: validationResult.imageData.size,
            width: validationResult.imageData.width,
            height: validationResult.imageData.height
        });

        // Шаг 5: Сохраняем аватар
        const savedAvatar = await newAvatar.save();

        // Шаг 6: Обновляем ссылку на аватар у пользователя
        await this.userModel.findByIdAndUpdate(userId, {
            avatarId: savedAvatar._id
        });

        this.logger.log(
            `Аватар успешно загружен из файла: ID=${savedAvatar.id}, ` +
            `файл=${file.originalname}, размер=${validationResult.imageData.width}x${validationResult.imageData.height}, ` +
            `размер файла=${Math.round(validationResult.imageData.size / 1024)}KB`
        );

        return savedAvatar;
    }

    /**
     * Замена существующего аватара файлом
     */
    async replaceAvatarFromFile(
        userId: string,
        file: Express.Multer.File
    ): Promise<AvatarDocument> {
        this.logger.log(`Замена аватара файлом для пользователя: ${userId}`);

        // Находим существующий аватар
        const existingAvatar = await this.getAvatarByUserId(userId);

        // Валидируем новый файл
        const validationResult = await this.fileUploadValidator.validateUploadedFile(file, {
            minSizeKB,   // 300 КБ минимум
            maxSizeKB,  // 1.5 МБ максимум
            minWidth,
            minHeight
        });

        if (!validationResult.isValid || !validationResult.imageData) {
            const errorMessage = `Файл не соответствует требованиям:\n${validationResult.errors.join('\n')}`;
            throw new BadRequestException(errorMessage);
        }

        // Создаем новый аватар
        const newAvatar = new this.avatarModel({
            userId: userId,
            imageData: validationResult.imageData.base64, // Чистый base64 без префикса
            mimeType: validationResult.imageData.mimeType,
            size: validationResult.imageData.size,
            width: validationResult.imageData.width,
            height: validationResult.imageData.height
        });

        // Сохраняем новый аватар
        const savedAvatar = await newAvatar.save();

        // Обновляем ссылку на аватар у пользователя
        await this.userModel.findByIdAndUpdate(userId, {
            avatarId: savedAvatar._id
        });

        // Удаляем старый аватар, если он существовал
        if (existingAvatar) {
            try {
                await this.avatarModel.findByIdAndDelete(existingAvatar._id);
                this.logger.log(`Старый аватар удален: ${existingAvatar.id}`);
            } catch (error) {
                this.logger.error(`Ошибка при удалении старого аватара: ${error.message}`);
            }
        }

        this.logger.log(
            `Аватар успешно заменен: ID=${savedAvatar.id}, ` +
            `файл=${file.originalname}, размер=${validationResult.imageData.width}x${validationResult.imageData.height}`
        );

        return savedAvatar;
    }

    /**
     * Получение аватара пользователя по ID пользователя
     */
    async getAvatarByUserId(userId: string): Promise<AvatarDocument | null> {
        this.logger.log(`Поиск аватара для пользователя: ${userId}`);
        return this.avatarModel.findOne({ userId }).exec();
    }

    /**
     * Удаление аватара пользователя
     */
    async deleteAvatar(userId: string): Promise<void> {
        this.logger.log(`Удаление аватара для пользователя: ${userId}`);

        const avatar = await this.getAvatarByUserId(userId);

        if (!avatar) {
            throw new NotFoundException(`Аватар для пользователя ${userId} не найден`);
        }

        // Удаляем аватар из базы данных
        await this.avatarModel.findByIdAndDelete(avatar._id);

        // Обнуляем ссылку на аватар у пользователя
        await this.userModel.findByIdAndUpdate(userId, {
            $unset: { avatarId: 1 } // Полностью удаляем поле avatarId
        });

        this.logger.log(`Аватар успешно удален для пользователя: ${userId}`);
    }

    /**
     * Проверка существования аватара у пользователя
     */
    async hasAvatar(userId: string): Promise<boolean> {
        const count = await this.avatarModel.countDocuments({ userId }).exec();
        return count > 0;
    }

    /**
     * Получение только данных изображения (для оптимизации)
     */
    async getAvatarImageDataById(userId: string): Promise<{
        imageData: string;
        mimeType: string;
    } | null> {
        this.logger.log(`Получение данных изображения для пользователя: ${userId}`);

        const avatar = await this.avatarModel
            .findOne({ userId })
            .select('imageData mimeType') // Выбираем только нужные поля для оптимизации
            .exec();

        if (!avatar) {
            return null;
        }

        return {
            imageData: avatar.imageData,
            mimeType: avatar.mimeType
        };
    }

    
}