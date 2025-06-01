// src/avatars/validators/custom-file-validators.ts
import { FileValidator } from '@nestjs/common';

export interface CustomFileTypeValidatorOptions {
    fileType: string | RegExp;
    message?: string;
}

export class CustomFileTypeValidator extends FileValidator<CustomFileTypeValidatorOptions> {
    constructor(protected readonly validationOptions: CustomFileTypeValidatorOptions) {
        super(validationOptions);
    }

    isValid(file?: Express.Multer.File): boolean {
        if (!file) {
            return false;
        }

        const { fileType } = this.validationOptions;

        if (typeof fileType === 'string') {
            return file.mimetype === fileType;
        }

        if (fileType instanceof RegExp) {
            return fileType.test(file.mimetype);
        }

        return false;
    }

    buildErrorMessage(): string {
        const { message, fileType } = this.validationOptions;

        if (message) {
            return message;
        }

        if (typeof fileType === 'string') {
            return `Ожидается файл типа: ${fileType}`;
        }

        if (fileType instanceof RegExp) {
            return `Файл должен соответствовать типу: ${fileType.toString()}`;
        }

        return 'Недопустимый тип файла';
    }
}

export interface CustomMaxFileSizeValidatorOptions {
    maxSize: number;
    message?: string;
}

export class CustomMaxFileSizeValidator extends FileValidator<CustomMaxFileSizeValidatorOptions> {
    constructor(protected readonly validationOptions: CustomMaxFileSizeValidatorOptions) {
        super(validationOptions);
    }

    isValid(file?: Express.Multer.File): boolean {
        if (!file) {
            return false;
        }

        return file.size <= this.validationOptions.maxSize;
    }

    buildErrorMessage(): string {
        const { message, maxSize } = this.validationOptions;

        if (message) {
            return message;
        }

        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return `Размер файла не должен превышать ${maxSizeMB}MB`;
    }
}

export interface ImageDimensionsValidatorOptions {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    message?: string;
}

export class ImageDimensionsValidator extends FileValidator<ImageDimensionsValidatorOptions> {
    constructor(protected readonly validationOptions: ImageDimensionsValidatorOptions) {
        super(validationOptions);
    }

    async isValid(file?: Express.Multer.File): Promise<boolean> {
        if (!file) {
            return false;
        }

        // Проверяем, что это изображение
        if (!file.mimetype.startsWith('image/')) {
            return false;
        }

        try {
            // Используем sharp для получения размеров изображения
            const sharp = require('sharp');
            const metadata = await sharp(file.buffer).metadata();

            const { minWidth, minHeight, maxWidth, maxHeight } = this.validationOptions;

            if (minWidth && metadata.width < minWidth) return false;
            if (minHeight && metadata.height < minHeight) return false;
            if (maxWidth && metadata.width > maxWidth) return false;
            if (maxHeight && metadata.height > maxHeight) return false;

            return true;
        } catch (error) {
            return false;
        }
    }

    buildErrorMessage(): string {
        const { message, minWidth, minHeight, maxWidth, maxHeight } = this.validationOptions;

        if (message) {
            return message;
        }

        // ИСПРАВЛЕНО: Явно указываем тип массива как string[]
        const constraints: string[] = [];

        // Добавляем ограничения в зависимости от настроек
        if (minWidth) {
            constraints.push(`минимальная ширина: ${minWidth}px`);
        }

        if (minHeight) {
            constraints.push(`минимальная высота: ${minHeight}px`);
        }

        if (maxWidth) {
            constraints.push(`максимальная ширина: ${maxWidth}px`);
        }

        if (maxHeight) {
            constraints.push(`максимальная высота: ${maxHeight}px`);
        }

        // Если нет ограничений, возвращаем общее сообщение
        if (constraints.length === 0) {
            return 'Изображение не соответствует требованиям к размерам';
        }

        return `Изображение не соответствует требованиям: ${constraints.join(', ')}`;
    }
}