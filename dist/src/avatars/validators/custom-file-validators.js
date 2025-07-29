"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageDimensionsValidator = exports.CustomMaxFileSizeValidator = exports.CustomFileTypeValidator = void 0;
const common_1 = require("@nestjs/common");
class CustomFileTypeValidator extends common_1.FileValidator {
    validationOptions;
    constructor(validationOptions) {
        super(validationOptions);
        this.validationOptions = validationOptions;
    }
    isValid(file) {
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
    buildErrorMessage() {
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
exports.CustomFileTypeValidator = CustomFileTypeValidator;
class CustomMaxFileSizeValidator extends common_1.FileValidator {
    validationOptions;
    constructor(validationOptions) {
        super(validationOptions);
        this.validationOptions = validationOptions;
    }
    isValid(file) {
        if (!file) {
            return false;
        }
        return file.size <= this.validationOptions.maxSize;
    }
    buildErrorMessage() {
        const { message, maxSize } = this.validationOptions;
        if (message) {
            return message;
        }
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return `Размер файла не должен превышать ${maxSizeMB}MB`;
    }
}
exports.CustomMaxFileSizeValidator = CustomMaxFileSizeValidator;
class ImageDimensionsValidator extends common_1.FileValidator {
    validationOptions;
    constructor(validationOptions) {
        super(validationOptions);
        this.validationOptions = validationOptions;
    }
    async isValid(file) {
        if (!file) {
            return false;
        }
        if (!file.mimetype.startsWith('image/')) {
            return false;
        }
        try {
            const sharp = require('sharp');
            const metadata = await sharp(file.buffer).metadata();
            const { minWidth, minHeight, maxWidth, maxHeight } = this.validationOptions;
            if (minWidth && metadata.width < minWidth)
                return false;
            if (minHeight && metadata.height < minHeight)
                return false;
            if (maxWidth && metadata.width > maxWidth)
                return false;
            if (maxHeight && metadata.height > maxHeight)
                return false;
            return true;
        }
        catch (error) {
            return false;
        }
    }
    buildErrorMessage() {
        const { message, minWidth, minHeight, maxWidth, maxHeight } = this.validationOptions;
        if (message) {
            return message;
        }
        const constraints = [];
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
        if (constraints.length === 0) {
            return 'Изображение не соответствует требованиям к размерам';
        }
        return `Изображение не соответствует требованиям: ${constraints.join(', ')}`;
    }
}
exports.ImageDimensionsValidator = ImageDimensionsValidator;
//# sourceMappingURL=custom-file-validators.js.map