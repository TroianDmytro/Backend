"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FileUploadValidator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadValidator = void 0;
const common_1 = require("@nestjs/common");
const sharp = require("sharp");
const avatar_schema_1 = require("../schemas/avatar.schema");
let FileUploadValidator = FileUploadValidator_1 = class FileUploadValidator {
    logger = new common_1.Logger(FileUploadValidator_1.name);
    defaultConfig = {
        minWidth: avatar_schema_1.minWidth,
        minHeight: avatar_schema_1.minHeight,
        minSizeKB: avatar_schema_1.minSizeKB,
        maxSizeKB: avatar_schema_1.maxSizeKB,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png']
    };
    async validateUploadedFile(file, config) {
        const validationConfig = {
            ...this.defaultConfig,
            ...config
        };
        const errors = [];
        this.logger.log(`Валидация файла: ${file.originalname}`);
        try {
            if (!this.validateMimeType(file.mimetype, validationConfig.allowedMimeTypes)) {
                errors.push(`Неподдерживаемый формат файла: ${file.mimetype}. ` +
                    `Поддерживаются: ${validationConfig.allowedMimeTypes.join(', ')}`);
            }
            const fileSizeKB = Math.round(file.size / 1024);
            if (fileSizeKB < validationConfig.minSizeKB) {
                errors.push(`Размер файла (${fileSizeKB}KB) меньше минимального (${validationConfig.minSizeKB}KB)`);
            }
            if (fileSizeKB > validationConfig.maxSizeKB) {
                errors.push(`Размер файла (${fileSizeKB}KB) превышает максимальный (${validationConfig.maxSizeKB}KB)`);
            }
            const imageMetadata = await this.analyzeImage(file.buffer);
            if (imageMetadata.width < validationConfig.minWidth ||
                imageMetadata.height < validationConfig.minHeight) {
                errors.push(`Размер изображения (${imageMetadata.width}x${imageMetadata.height}) ` +
                    `меньше минимального (${validationConfig.minWidth}x${validationConfig.minHeight})`);
            }
            const base64String = this.convertToCleanBase64(file.buffer);
            const result = {
                isValid: errors.length === 0,
                errors: errors,
                imageData: errors.length === 0 ? {
                    width: imageMetadata.width,
                    height: imageMetadata.height,
                    size: file.size,
                    mimeType: file.mimetype,
                    base64: base64String
                } : undefined
            };
            this.logValidationResult(result, file.originalname);
            return result;
        }
        catch (error) {
            this.logger.error(`Ошибка валидации файла ${file.originalname}: ${error.message}`);
            throw new common_1.BadRequestException(`Ошибка обработки файла: ${error.message}`);
        }
    }
    async analyzeImage(buffer) {
        try {
            const metadata = await sharp(buffer).metadata();
            if (!metadata.width || !metadata.height) {
                throw new common_1.BadRequestException('Не удалось определить размеры изображения');
            }
            return {
                width: metadata.width,
                height: metadata.height
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Ошибка анализа изображения: ${error.message}`);
        }
    }
    convertToCleanBase64(buffer) {
        return buffer.toString('base64');
    }
    convertToBase64WithPrefix(buffer, mimeType) {
        const base64Data = buffer.toString('base64');
        return `data:${mimeType};base64,${base64Data}`;
    }
    validateMimeType(mimeType, allowedTypes) {
        return allowedTypes.includes(mimeType.toLowerCase());
    }
    logValidationResult(result, fileName) {
        if (result.isValid && result.imageData) {
            this.logger.log(`Файл ${fileName} прошел валидацию: ` +
                `${result.imageData.width}x${result.imageData.height}, ` +
                `${Math.round(result.imageData.size / 1024)}KB, ` +
                `база64 длина: ${result.imageData.base64.length} символов`);
        }
        else {
            this.logger.warn(`Файл ${fileName} не прошел валидацию: ${result.errors.join('; ')}`);
        }
    }
};
exports.FileUploadValidator = FileUploadValidator;
exports.FileUploadValidator = FileUploadValidator = FileUploadValidator_1 = __decorate([
    (0, common_1.Injectable)()
], FileUploadValidator);
//# sourceMappingURL=file-upload.validator.js.map