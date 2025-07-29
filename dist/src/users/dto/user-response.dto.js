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
exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class UserResponseDto {
    id;
    email;
    name;
    second_name;
    age;
    telefon_number;
    isEmailVerified;
    isBlocked;
    avatarId;
    hasAvatar;
    avatarUrl;
    roles;
    createdAt;
    updatedAt;
    password;
    verificationToken;
    resetPasswordToken;
    verificationTokenExpires;
    resetPasswordExpires;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439011',
        description: 'ID пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj._id?.toString() || obj.id),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'user@example.com',
        description: 'Email пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Иван',
        description: 'Имя пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Иванов',
        description: 'Фамилия пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "second_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 25,
        description: 'Возраст пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UserResponseDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+380 (67) 123-45-67',
        description: 'Номер телефона'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "telefon_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Статус подтверждения email'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isEmailVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Статус блокировки пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439012',
        description: 'ID аватара (используйте GET /avatars/:userId для получения аватара)',
        required: false
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj.avatarId?.toString() || null),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "avatarId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Есть ли аватар у пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => !!obj.avatarId),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "hasAvatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/avatars/507f1f77bcf86cd799439011',
        description: 'URL для получения аватара пользователя',
        required: false
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj.avatarId ? `/avatars/${obj._id?.toString() || obj.id}` : null),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['user'],
        description: 'Роли пользователя'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => {
        if (!obj.roles)
            return [];
        return obj.roles.map(role => typeof role === 'object' ? role.name : role);
    }),
    __metadata("design:type", Array)
], UserResponseDto.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-15T10:30:00Z',
        description: 'Дата создания'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-20T15:45:00Z',
        description: 'Дата последнего обновления'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "password", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "verificationToken", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "verificationTokenExpires", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "resetPasswordExpires", void 0);
//# sourceMappingURL=user-response.dto.js.map