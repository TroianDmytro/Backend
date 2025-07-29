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
exports.CreateCourseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCourseDto {
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
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Основы JavaScript для начинающих',
        description: 'Название курса'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'javascript-basics-for-beginners',
        description: 'URL-дружелюбный идентификатор курса'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Полный курс по изучению JavaScript с нуля',
        description: 'Описание курса'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/course-image.jpg',
        description: 'URL изображения курса',
        required: false
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 99.99,
        description: 'Цена курса'
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 15,
        description: 'Процент скидки (0-100)',
        required: false,
        minimum: 0,
        maximum: 100
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "discount_percent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'USD',
        description: 'Валюта курса',
        enum: ['USD', 'EUR', 'UAH', 'RUB']
    }),
    (0, class_validator_1.IsEnum)(['USD', 'EUR', 'UAH', 'RUB']),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Активен ли курс',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Рекомендуемый курс',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "is_featured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 40,
        description: 'Продолжительность курса в часах',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "duration_hours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['javascript', 'programming', 'web-development'],
        description: 'Теги курса',
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/preview-video.mp4',
        description: 'URL превью видео',
        required: false
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "preview_video_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Разрешены ли комментарии',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "allow_comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Требует ли курс подтверждения для записи',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "requires_approval", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439011',
        description: 'ID преподавателя курса'
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439012',
        description: 'ID категории курса'
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439013',
        description: 'ID уровня сложности курса'
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "difficultyLevelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Изучите JavaScript с нуля за 30 дней',
        description: 'Краткое описание курса',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/logo.png',
        description: 'URL логотипа курса',
        required: false
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "logo_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: 'Максимальное количество студентов (0 = без ограничений)',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "max_students", void 0);
//# sourceMappingURL=create-course.dto.js.map