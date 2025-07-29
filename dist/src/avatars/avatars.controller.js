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
var AvatarsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const avatars_service_1 = require("./avatars.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const upload_avatar_file_dto_1 = require("./dto/upload-avatar-file.dto");
const custom_file_validators_1 = require("./validators/custom-file-validators");
const avatar_schema_1 = require("./schemas/avatar.schema");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AvatarsController = AvatarsController_1 = class AvatarsController {
    avatarsService;
    logger = new common_1.Logger(AvatarsController_1.name);
    constructor(avatarsService) {
        this.avatarsService = avatarsService;
    }
    async getAvatar(userId, req) {
        this.logger.log(`Пользователь ${req.user.email} запрашивает аватар для пользователя ${userId}`);
        try {
            const avatar = await this.avatarsService.getAvatarByUserId(userId);
            if (!avatar) {
                throw new common_1.NotFoundException(`Аватар для пользователя ${userId} не найден`);
            }
            const cleanBase64 = avatar.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
            return {
                success: true,
                avatar: {
                    id: avatar.id,
                    userId: avatar.userId.toString(),
                    imageData: cleanBase64,
                    mimeType: avatar.mimeType,
                    size: avatar.size,
                    width: avatar.width,
                    height: avatar.height,
                    createdAt: avatar.createdAt
                }
            };
        }
        catch (error) {
            this.logger.error(`Ошибка получения аватара: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Ошибка при получении аватара');
        }
    }
    async uploadAvatar(userId, file, req) {
        this.logger.log(`Попытка загрузки аватара. ` +
            `Пользователь: ${req.user?.email || 'неизвестен'}, ` +
            `целевой userId: ${userId}, ` +
            `файл: ${file?.originalname || 'неизвестен'} ` +
            `(${file ? Math.round(file.size / 1024) + 'KB, ' + file.mimetype : 'данные недоступны'})`);
        if (!file) {
            throw new common_1.BadRequestException('Файл не был загружен. Убедитесь, что файл прикреплен к полю "avatar"');
        }
        if (!userId || userId.trim() === '') {
            throw new common_1.BadRequestException('ID пользователя не указан или пуст');
        }
        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        const isOwner = userId === req.user.userId;
        if (!isAdmin && !isOwner) {
            this.logger.warn(`Отказано в доступе. Пользователь ${req.user.email} ` +
                `(ID: ${req.user.userId}) пытается загрузить аватар для ${userId}. ` +
                `isAdmin: ${isAdmin}, isOwner: ${isOwner}`);
            throw new common_1.BadRequestException('У вас нет прав на загрузку аватара для этого пользователя');
        }
        await this.performAdditionalFileValidation(file);
        this.logger.log(`Все проверки пройдены. Загружаем аватар для пользователя ${userId}. ` +
            `Файл: ${file.originalname} (${Math.round(file.size / 1024)}KB, ${file.mimetype})`);
        try {
            const avatar = await this.avatarsService.uploadAvatarFromFile(userId, file);
            const response = {
                message: 'Аватар успешно загружен',
                avatar: {
                    id: avatar.id,
                    userId: avatar.userId.toString(),
                    mimeType: avatar.mimeType,
                    size: avatar.size,
                    width: avatar.width,
                    height: avatar.height,
                    createdAt: avatar.createdAt
                }
            };
            this.logger.log(`✅ Аватар успешно загружен и сохранен. ` +
                `ID аватара: ${avatar.id}, ` +
                `размер изображения: ${avatar.width}x${avatar.height}, ` +
                `размер файла: ${Math.round(avatar.size / 1024)}KB`);
            return response;
        }
        catch (error) {
            this.logger.error(`❌ Ошибка загрузки аватара для пользователя ${userId}: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Внутренняя ошибка при загрузке аватара: ${error.message}`);
        }
    }
    async performAdditionalFileValidation(file) {
        const validationErrors = [];
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
            validationErrors.push(`Недопустимый тип файла: ${file.mimetype}. ` +
                `Поддерживаются: ${allowedMimeTypes.join(', ')}`);
        }
        const fileSizeKB = Math.round(file.size / 1024);
        if (fileSizeKB < avatar_schema_1.minSizeKB) {
            validationErrors.push(`Размер файла (${fileSizeKB}KB) меньше минимального (${avatar_schema_1.minSizeKB}KB)`);
        }
        if (fileSizeKB > avatar_schema_1.maxSizeKB) {
            validationErrors.push(`Размер файла (${fileSizeKB}KB) превышает максимальный (${avatar_schema_1.maxSizeKB}KB)`);
        }
        if (!file.buffer || file.buffer.length === 0) {
            validationErrors.push('Файл пуст или поврежден');
        }
        const originalName = file.originalname.toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const hasValidExtension = allowedExtensions.some(ext => originalName.endsWith(ext));
        if (!hasValidExtension) {
            validationErrors.push(`Недопустимое расширение файла. ` +
                `Поддерживаются: ${allowedExtensions.join(', ')}`);
        }
        if (file.buffer && file.buffer.length > 0) {
            try {
                const sharp = require('sharp');
                const metadata = await sharp(file.buffer).metadata();
                if (!metadata.width || !metadata.height) {
                    validationErrors.push('Не удалось определить размеры изображения');
                }
                else {
                    if (metadata.width < 512) {
                        validationErrors.push(`Ширина изображения (${metadata.width}px) меньше минимальной (512px)`);
                    }
                    if (metadata.height < 512) {
                        validationErrors.push(`Высота изображения (${metadata.height}px) меньше минимальной (512px)`);
                    }
                    this.logger.debug(`Размеры изображения: ${metadata.width}x${metadata.height}px, ` +
                        `формат: ${metadata.format}, плотность: ${metadata.density || 'неизвестна'}`);
                }
            }
            catch (sharpError) {
                validationErrors.push(`Ошибка анализа изображения: ${sharpError.message}`);
            }
        }
        if (validationErrors.length > 0) {
            const errorMessage = `Файл не соответствует требованиям:\n${validationErrors.join('\n')}`;
            this.logger.warn(`Файл не прошел валидацию: ${file.originalname}. Ошибки: ${validationErrors.join('; ')}`);
            throw new common_1.BadRequestException(errorMessage);
        }
        this.logger.debug(`✅ Файл успешно прошел дополнительную валидацию: ${file.originalname}`);
    }
    validateUploadedFile(file) {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
            throw new common_1.BadRequestException(`Недопустимый тип файла: ${file.mimetype}. ` +
                `Поддерживаются: ${allowedMimeTypes.join(', ')}`);
        }
        const fileSizeKB = Math.round(file.size / 1024);
        if (fileSizeKB < avatar_schema_1.minSizeKB) {
            throw new common_1.BadRequestException(`Размер файла (${fileSizeKB}KB) меньше минимального (${avatar_schema_1.minSizeKB}KB)`);
        }
        if (fileSizeKB > avatar_schema_1.maxSizeKB) {
            throw new common_1.BadRequestException(`Размер файла (${fileSizeKB}KB) превышает максимальный (${avatar_schema_1.maxSizeKB}KB)`);
        }
        if (!file.buffer || file.buffer.length === 0) {
            throw new common_1.BadRequestException('Файл пуст или поврежден');
        }
        this.logger.debug(`Файл прошел валидацию: ${file.originalname}, ` +
            `тип: ${file.mimetype}, размер: ${fileSizeKB}KB`);
    }
    async replaceAvatar(userId, file, req) {
        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        const isOwner = userId === req.user.userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.BadRequestException('У вас нет прав на замену аватара для этого пользователя');
        }
        this.logger.log(`Пользователь ${req.user.email} заменяет аватар для пользователя ${userId}. ` +
            `Файл: ${file.originalname} (${Math.round(file.size / 1024)}KB)`);
        try {
            const avatar = await this.avatarsService.replaceAvatarFromFile(userId, file);
            return {
                message: 'Аватар успешно заменен',
                avatar: {
                    id: avatar.id,
                    userId: avatar.userId.toString(),
                    mimeType: avatar.mimeType,
                    size: avatar.size,
                    width: avatar.width,
                    height: avatar.height,
                    createdAt: avatar.createdAt
                }
            };
        }
        catch (error) {
            this.logger.error(`Ошибка замены аватара: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Ошибка при замене аватара');
        }
    }
    async deleteAvatar(userId, req) {
        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        const isOwner = userId === req.user.userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.BadRequestException('У вас нет прав на удаление аватара для этого пользователя');
        }
        this.logger.log(`Пользователь ${req.user.email} удаляет аватар для пользователя ${userId}`);
        try {
            await this.avatarsService.deleteAvatar(userId);
            return {
                message: `Аватар для пользователя ${userId} успешно удален`
            };
        }
        catch (error) {
            this.logger.error(`Ошибка удаления аватара: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Ошибка при удалении аватара');
        }
    }
};
exports.AvatarsController = AvatarsController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение аватара пользователя',
        description: 'Возвращает изображение аватара в формате base64'
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID пользователя' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Аватар успешно получен',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                avatar: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        imageData: { type: 'string', description: 'Base64 данные изображения без префикса' },
                        mimeType: { type: 'string', example: 'image/jpeg' },
                        size: { type: 'number', example: 524288 },
                        width: { type: 'number', example: 1024 },
                        height: { type: 'number', example: 1024 },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Аватар не найден' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AvatarsController.prototype, "getAvatar", null);
__decorate([
    (0, common_1.Post)('upload/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        limits: {
            fileSize: 1.5 * 1024 * 1024,
        },
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return callback(new common_1.BadRequestException('Поддерживаются только файлы JPG, JPEG и PNG'), false);
            }
            callback(null, true);
        },
    })),
    (0, swagger_1.ApiOperation)({
        summary: 'Загрузка аватара для пользователя',
        description: `
    Загружает файл изображения как аватар пользователя.
    
    **Требования к файлу:**
    - Форматы: JPEG, JPG, PNG
    - Минимальный размер: 512x512 пикселей
    - Размер файла: от 300KB до 1.5MB
    - Поле формы: 'avatar'
    
    **Права доступа:**
    - Пользователь может загружать только свой аватар
    - Администратор может загружать аватар любому пользователю
    `
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'ID пользователя, для которого загружается аватар',
        example: '507f1f77bcf86cd799439011'
    }),
    (0, swagger_1.ApiBody)({
        description: 'Файл изображения аватара',
        type: upload_avatar_file_dto_1.UploadAvatarFileDto,
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                    description: 'Файл изображения (JPEG/PNG)'
                }
            },
            required: ['avatar']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Аватар успешно загружен',
        type: upload_avatar_file_dto_1.AvatarUploadResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Ошибка валидации файла или прав доступа',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: {
                    type: 'string',
                    example: 'Файл не соответствует требованиям: Размер файла (250KB) меньше минимального (300KB)'
                },
                error: { type: 'string', example: 'Bad Request' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Пользователь не авторизован'
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Недостаточно прав доступа'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Пользователь не найден'
    }),
    (0, swagger_1.ApiResponse)({
        status: 413,
        description: 'Файл слишком большой'
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new custom_file_validators_1.CustomMaxFileSizeValidator({
                maxSize: 1.5 * 1024 * 1024,
                message: 'Размер файла не должен превышать 1.5MB'
            }),
            new custom_file_validators_1.CustomFileTypeValidator({
                fileType: /(jpeg|jpg|png)$/i,
                message: 'Поддерживаются только файлы формата JPEG, JPG и PNG'
            }),
            new custom_file_validators_1.ImageDimensionsValidator({
                minWidth: 512,
                minHeight: 512,
                message: 'Минимальный размер изображения: 512x512 пикселей'
            })
        ],
        fileIsRequired: true,
        exceptionFactory: (errors) => {
            const errorMessages = Array.isArray(errors) ? errors : [errors];
            return new common_1.BadRequestException(`Ошибка валидации файла: ${errorMessages.join(', ')}`);
        }
    }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AvatarsController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Put)('replace/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    (0, swagger_1.ApiOperation)({
        summary: 'Замена аватара пользователя',
        description: 'Старый аватар будет удален после успешной загрузки нового. Требования: JPEG/PNG файл, минимум 512x512px, 300KB-1.5MB'
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Аватар успешно заменен' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ошибка валидации файла' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1.5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpeg|jpg|png)$/ })
        ],
        fileIsRequired: true
    }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AvatarsController.prototype, "replaceAvatar", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Удаление аватара пользователя' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID пользователя' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Аватар успешно удален',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Аватар успешно удален' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь или аватар не найден' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AvatarsController.prototype, "deleteAvatar", null);
exports.AvatarsController = AvatarsController = AvatarsController_1 = __decorate([
    (0, swagger_1.ApiTags)('avatars'),
    (0, common_1.Controller)('avatars'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [avatars_service_1.AvatarsService])
], AvatarsController);
//# sourceMappingURL=avatars.controller.js.map