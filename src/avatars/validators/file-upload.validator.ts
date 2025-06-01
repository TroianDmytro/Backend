// src/avatars/validators/file-upload.validator.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import { maxSizeKB, minHeight, minSizeKB, minWidth } from '../schemas/avatar.schema';

export interface FileValidationResult {
    isValid: boolean;
    errors: string[];
    imageData?: {
        width: number;
        height: number;
        size: number;
        mimeType: string;
        base64: string;
    };
}

export interface FileValidationConfig {
    minWidth: number;
    minHeight: number;
    minSizeKB: number;
    maxSizeKB: number;
    allowedMimeTypes: string[];
}

@Injectable()
export class FileUploadValidator {
    private readonly logger = new Logger(FileUploadValidator.name);

    // Обновленная конфигурация для аватаров согласно новым требованиям
    private readonly defaultConfig: FileValidationConfig = {
        minWidth,
        minHeight,
        minSizeKB, 
        maxSizeKB, 
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png']
    };

    /**
     * Валидация загруженного файла изображения
     */
    async validateUploadedFile(
        file: Express.Multer.File,
        config?: Partial<FileValidationConfig>
    ): Promise<FileValidationResult> {
        const validationConfig: FileValidationConfig = {
            ...this.defaultConfig,
            ...config
        };

        const errors: string[] = [];

        this.logger.log(`Валидация файла: ${file.originalname}`);

        try {
            // Шаг 1: Проверка MIME типа
            if (!this.validateMimeType(file.mimetype, validationConfig.allowedMimeTypes)) {
                errors.push(
                    `Неподдерживаемый формат файла: ${file.mimetype}. ` +
                    `Поддерживаются: ${validationConfig.allowedMimeTypes.join(', ')}`
                );
            }

            // Шаг 2: Проверка размера файла
            const fileSizeKB = Math.round(file.size / 1024);
            if (fileSizeKB < validationConfig.minSizeKB) {
                errors.push(
                    `Размер файла (${fileSizeKB}KB) меньше минимального (${validationConfig.minSizeKB}KB)`
                );
            }

            if (fileSizeKB > validationConfig.maxSizeKB) {
                errors.push(
                    `Размер файла (${fileSizeKB}KB) превышает максимальный (${validationConfig.maxSizeKB}KB)`
                );
            }

            // Шаг 3: Анализ изображения с помощью Sharp
            const imageMetadata = await this.analyzeImage(file.buffer);

            // Шаг 4: Проверка размеров изображения
            if (imageMetadata.width < validationConfig.minWidth ||
                imageMetadata.height < validationConfig.minHeight) {
                errors.push(
                    `Размер изображения (${imageMetadata.width}x${imageMetadata.height}) ` +
                    `меньше минимального (${validationConfig.minWidth}x${validationConfig.minHeight})`
                );
            }

            // Шаг 5: Конвертация в чистый base64 (БЕЗ data:image/type;base64, префикса)
            const base64String = this.convertToCleanBase64(file.buffer);

            const result: FileValidationResult = {
                isValid: errors.length === 0,
                errors: errors,
                imageData: errors.length === 0 ? {
                    width: imageMetadata.width,
                    height: imageMetadata.height,
                    size: file.size,
                    mimeType: file.mimetype,
                    base64: base64String // Чистый base64 без префикса
                } : undefined
            };

            this.logValidationResult(result, file.originalname);
            return result;

        } catch (error) {
            this.logger.error(`Ошибка валидации файла ${file.originalname}: ${error.message}`);
            throw new BadRequestException(`Ошибка обработки файла: ${error.message}`);
        }
    }

    /**
     * Анализ изображения для получения метаданных
     */
    private async analyzeImage(buffer: Buffer): Promise<{
        width: number;
        height: number;
    }> {
        try {
            const metadata = await sharp(buffer).metadata();

            if (!metadata.width || !metadata.height) {
                throw new BadRequestException('Не удалось определить размеры изображения');
            }

            return {
                width: metadata.width,
                height: metadata.height
            };
        } catch (error) {
            throw new BadRequestException(`Ошибка анализа изображения: ${error.message}`);
        }
    }

    /**
     * Конвертация буфера в чистый base64 БЕЗ data URL префикса
     * Это важно для соответствия требованию "не должно быть ничего лишнего"
     */
    private convertToCleanBase64(buffer: Buffer): string {
        return buffer.toString('base64');
    }

    /**
     * Конвертация буфера в base64 строку с data URL префиксом (для обратной совместимости)
     */
    private convertToBase64WithPrefix(buffer: Buffer, mimeType: string): string {
        const base64Data = buffer.toString('base64');
        return `data:${mimeType};base64,${base64Data}`;
    }

    /**
     * Валидация MIME типа
     */
    private validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
        return allowedTypes.includes(mimeType.toLowerCase());
    }

    /**
     * Логирование результата валидации
     */
    private logValidationResult(result: FileValidationResult, fileName: string): void {
        if (result.isValid && result.imageData) {
            this.logger.log(
                `Файл ${fileName} прошел валидацию: ` +
                `${result.imageData.width}x${result.imageData.height}, ` +
                `${Math.round(result.imageData.size / 1024)}KB, ` +
                `база64 длина: ${result.imageData.base64.length} символов`
            );
        } else {
            this.logger.warn(`Файл ${fileName} не прошел валидацию: ${result.errors.join('; ')}`);
        }
    }
}