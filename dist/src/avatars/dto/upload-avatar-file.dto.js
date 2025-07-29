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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarUploadResponseDto = exports.UploadAvatarFileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UploadAvatarFileDto {
    avatar;
}
exports.UploadAvatarFileDto = UploadAvatarFileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'Файл изображения аватара',
        required: true,
        example: 'avatar.jpg'
    }),
    __metadata("design:type", Object)
], UploadAvatarFileDto.prototype, "avatar", void 0);
class AvatarUploadResponseDto {
    message;
    avatar;
}
exports.AvatarUploadResponseDto = AvatarUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Аватар успешно загружен',
        description: 'Сообщение о результате операции'
    }),
    __metadata("design:type", String)
], AvatarUploadResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        properties: {
            id: {
                type: 'string',
                example: '507f1f77bcf86cd799439011',
                description: 'ID созданного аватара'
            },
            userId: {
                type: 'string',
                example: '507f1f77bcf86cd799439012',
                description: 'ID пользователя'
            },
            mimeType: {
                type: 'string',
                example: 'image/jpeg',
                description: 'MIME тип файла'
            },
            size: {
                type: 'number',
                example: 524288,
                description: 'Размер файла в байтах'
            },
            width: {
                type: 'number',
                example: 1024,
                description: 'Ширина изображения в пикселях'
            },
            height: {
                type: 'number',
                example: 1024,
                description: 'Высота изображения в пикселях'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2023-01-15T10:30:00Z',
                description: 'Дата создания аватара'
            }
        }
    }),
    __metadata("design:type", Object)
], AvatarUploadResponseDto.prototype, "avatar", void 0);
//# sourceMappingURL=upload-avatar-file.dto.js.map