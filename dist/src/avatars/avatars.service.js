"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AvatarsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const avatar_schema_1 = require("./schemas/avatar.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const file_upload_validator_1 = require("./validators/file-upload.validator");
let AvatarsService = AvatarsService_1 = class AvatarsService {
    avatarModel;
    userModel;
    fileUploadValidator;
    logger = new common_1.Logger(AvatarsService_1.name);
    constructor(avatarModel, userModel, fileUploadValidator) {
        this.avatarModel = avatarModel;
        this.userModel = userModel;
        this.fileUploadValidator = fileUploadValidator;
    }
    async uploadAvatarFromFile(userId, file) {
        this.logger.log(`Загрузка аватара из файла для пользователя: ${userId}`);
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${userId} не найден`);
        }
        const existingAvatar = await this.getAvatarByUserId(userId);
        if (existingAvatar) {
            throw new common_1.BadRequestException('У пользователя уже есть аватар. Используйте метод замены аватара.');
        }
        const validationResult = await this.fileUploadValidator.validateUploadedFile(file, {
            minSizeKB: avatar_schema_1.minSizeKB,
            maxSizeKB: avatar_schema_1.maxSizeKB,
            minWidth: avatar_schema_1.minWidth,
            minHeight: avatar_schema_1.minHeight
        });
        if (!validationResult.isValid || !validationResult.imageData) {
            const errorMessage = `Файл не соответствует требованиям:\n${validationResult.errors.join('\n')}`;
            throw new common_1.BadRequestException(errorMessage);
        }
        const newAvatar = new this.avatarModel({
            userId: userId,
            imageData: validationResult.imageData.base64,
            mimeType: validationResult.imageData.mimeType,
            size: validationResult.imageData.size,
            width: validationResult.imageData.width,
            height: validationResult.imageData.height
        });
        const savedAvatar = await newAvatar.save();
        await this.userModel.findByIdAndUpdate(userId, {
            avatarId: savedAvatar._id
        });
        this.logger.log(`Аватар успешно загружен из файла: ID=${savedAvatar.id}, ` +
            `файл=${file.originalname}, размер=${validationResult.imageData.width}x${validationResult.imageData.height}, ` +
            `размер файла=${Math.round(validationResult.imageData.size / 1024)}KB`);
        return savedAvatar;
    }
    async replaceAvatarFromFile(userId, file) {
        this.logger.log(`Замена аватара файлом для пользователя: ${userId}`);
        const existingAvatar = await this.getAvatarByUserId(userId);
        const validationResult = await this.fileUploadValidator.validateUploadedFile(file, {
            minSizeKB: avatar_schema_1.minSizeKB,
            maxSizeKB: avatar_schema_1.maxSizeKB,
            minWidth: avatar_schema_1.minWidth,
            minHeight: avatar_schema_1.minHeight
        });
        if (!validationResult.isValid || !validationResult.imageData) {
            const errorMessage = `Файл не соответствует требованиям:\n${validationResult.errors.join('\n')}`;
            throw new common_1.BadRequestException(errorMessage);
        }
        const newAvatar = new this.avatarModel({
            userId: userId,
            imageData: validationResult.imageData.base64,
            mimeType: validationResult.imageData.mimeType,
            size: validationResult.imageData.size,
            width: validationResult.imageData.width,
            height: validationResult.imageData.height
        });
        const savedAvatar = await newAvatar.save();
        await this.userModel.findByIdAndUpdate(userId, {
            avatarId: savedAvatar._id
        });
        if (existingAvatar) {
            try {
                await this.avatarModel.findByIdAndDelete(existingAvatar._id);
                this.logger.log(`Старый аватар удален: ${existingAvatar.id}`);
            }
            catch (error) {
                this.logger.error(`Ошибка при удалении старого аватара: ${error.message}`);
            }
        }
        this.logger.log(`Аватар успешно заменен: ID=${savedAvatar.id}, ` +
            `файл=${file.originalname}, размер=${validationResult.imageData.width}x${validationResult.imageData.height}`);
        return savedAvatar;
    }
    async getAvatarByUserId(userId) {
        this.logger.log(`Поиск аватара для пользователя: ${userId}`);
        return this.avatarModel.findOne({ userId }).exec();
    }
    async deleteAvatar(userId) {
        this.logger.log(`Удаление аватара для пользователя: ${userId}`);
        const avatar = await this.getAvatarByUserId(userId);
        if (!avatar) {
            throw new common_1.NotFoundException(`Аватар для пользователя ${userId} не найден`);
        }
        await this.avatarModel.findByIdAndDelete(avatar._id);
        await this.userModel.findByIdAndUpdate(userId, {
            $unset: { avatarId: 1 }
        });
        this.logger.log(`Аватар успешно удален для пользователя: ${userId}`);
    }
    async hasAvatar(userId) {
        const count = await this.avatarModel.countDocuments({ userId }).exec();
        return count > 0;
    }
    async getAvatarImageDataById(userId) {
        this.logger.log(`Получение данных изображения для пользователя: ${userId}`);
        const avatar = await this.avatarModel
            .findOne({ userId })
            .select('imageData mimeType')
            .exec();
        if (!avatar) {
            return null;
        }
        return {
            imageData: avatar.imageData,
            mimeType: avatar.mimeType
        };
    }
};
exports.AvatarsService = AvatarsService;
exports.AvatarsService = AvatarsService = AvatarsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(avatar_schema_1.Avatar.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        file_upload_validator_1.FileUploadValidator])
], AvatarsService);
//# sourceMappingURL=avatars.service.js.map