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
exports.CourseResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CourseResponseDto {
    id;
    title;
    description;
    short_description;
    logo_url;
    cover_image_url;
    price;
    discount_price;
    currency;
    teacherId;
    teacher;
    category;
    tags;
    difficulty_level;
    isPublished;
    isActive;
    isFeatured;
    duration_hours;
    lessons_count;
    max_students;
    current_students_count;
    prerequisites;
    learning_outcomes;
    rating;
    reviews_count;
    language;
    has_certificate;
    promo_video_url;
    target_audience;
    start_date;
    end_date;
    createdAt;
    updatedAt;
}
exports.CourseResponseDto = CourseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID курса' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Основы веб-разработки', description: 'Название курса' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Полный курс по изучению веб-разработки', description: 'Описание курса' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Изучите веб-разработку с нуля', description: 'Краткое описание' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/logo.png', description: 'URL логотипа' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "logo_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/cover.jpg', description: 'URL обложки' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "cover_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 299.99, description: 'Цена курса' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.99, description: 'Цена со скидкой' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "discount_price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'Валюта' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439012', description: 'ID преподавателя' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Информация о преподавателе' }),
    __metadata("design:type", Object)
], CourseResponseDto.prototype, "teacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Программирование', description: 'Категория курса' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['JavaScript', 'React'], description: 'Теги курса' }),
    __metadata("design:type", Array)
], CourseResponseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'beginner', description: 'Уровень сложности' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "difficulty_level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Опубликован ли курс' }),
    __metadata("design:type", Boolean)
], CourseResponseDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Активен ли курс' }),
    __metadata("design:type", Boolean)
], CourseResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Рекомендуемый курс' }),
    __metadata("design:type", Boolean)
], CourseResponseDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40, description: 'Продолжительность в часах' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "duration_hours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Количество уроков' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "lessons_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Максимальное количество студентов' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "max_students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Текущее количество студентов' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "current_students_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Базовые знания HTML'], description: 'Предварительные требования' }),
    __metadata("design:type", Array)
], CourseResponseDto.prototype, "prerequisites", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Создание сайтов'], description: 'Что изучит студент' }),
    __metadata("design:type", Array)
], CourseResponseDto.prototype, "learning_outcomes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.5, description: 'Рейтинг курса' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 23, description: 'Количество отзывов' }),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "reviews_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ru', description: 'Язык курса' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Выдается ли сертификат' }),
    __metadata("design:type", Boolean)
], CourseResponseDto.prototype, "has_certificate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://youtube.com/watch?v=abc123', description: 'Промо-видео' }),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "promo_video_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Начинающие разработчики'], description: 'Целевая аудитория' }),
    __metadata("design:type", Array)
], CourseResponseDto.prototype, "target_audience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00Z', description: 'Дата начала курса' }),
    __metadata("design:type", Date)
], CourseResponseDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-06-15T00:00:00Z', description: 'Дата окончания курса' }),
    __metadata("design:type", Date)
], CourseResponseDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-12-01T10:30:00Z', description: 'Дата создания' }),
    __metadata("design:type", Date)
], CourseResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-12-15T14:20:00Z', description: 'Дата обновления' }),
    __metadata("design:type", Date)
], CourseResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=course-response.dto.js.map