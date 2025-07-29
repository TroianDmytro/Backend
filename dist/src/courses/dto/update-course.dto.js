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
exports.UpdateCourseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateCourseDto {
    title;
    slug;
    description;
    image_url;
    price;
    discount_percent;
    currency;
    is_active;
    is_featured;
    duration_hours;
    tags;
    preview_video_url;
    allow_comments;
    requires_approval;
    teacherId;
    categoryId;
    difficultyLevelId;
    short_description;
    logo_url;
    max_students;
}
exports.UpdateCourseDto = UpdateCourseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Продвинутый JavaScript', description: 'Название курса', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'advanced-javascript', description: 'URL-дружелюбный идентификатор', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Углубленное изучение JavaScript', description: 'Описание курса', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/new-image.jpg', description: 'URL изображения', required: false }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 149.99, description: 'Цена курса', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20, description: 'Процент скидки (0-100)', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "discount_percent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EUR', description: 'Валюта', enum: ['USD', 'EUR', 'UAH', 'RUB'], required: false }),
    (0, class_validator_1.IsEnum)(['USD', 'EUR', 'UAH', 'RUB']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Активен ли курс', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCourseDto.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Рекомендуемый курс', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCourseDto.prototype, "is_featured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 60, description: 'Продолжительность в часах', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "duration_hours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['javascript', 'advanced', 'es6'], description: 'Теги курса', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateCourseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/new-preview.mp4', description: 'URL превью видео', required: false }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "preview_video_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Разрешены ли комментарии', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCourseDto.prototype, "allow_comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Требует ли подтверждения', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCourseDto.prototype, "requires_approval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439014', description: 'ID преподавателя', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439015', description: 'ID категории курса', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439016', description: 'ID уровня сложности курса', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "difficultyLevelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Обновленное краткое описание',
        description: 'Краткое описание курса',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/new-logo.png',
        description: 'URL логотипа курса',
        required: false
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "logo_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 150,
        description: 'Максимальное количество студентов',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "max_students", void 0);
//# sourceMappingURL=update-course.dto.js.map