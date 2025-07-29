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
exports.CourseCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CourseCardDto {
    id;
    title;
    short_description;
    logo_url;
    price;
    discount_price;
    currency;
    rating;
    reviews_count;
    current_students_count;
    duration_hours;
    lessons_count;
    difficulty_level;
    teacher;
}
exports.CourseCardDto = CourseCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID курса' }),
    __metadata("design:type", String)
], CourseCardDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Основы JavaScript', description: 'Название курса' }),
    __metadata("design:type", String)
], CourseCardDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Изучите JavaScript с нуля', description: 'Краткое описание' }),
    __metadata("design:type", String)
], CourseCardDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/logo.png', description: 'Логотип курса' }),
    __metadata("design:type", String)
], CourseCardDto.prototype, "logo_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 299.99, description: 'Цена курса' }),
    __metadata("design:type", Number)
], CourseCardDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.99, description: 'Цена со скидкой' }),
    __metadata("design:type", Number)
], CourseCardDto.prototype, "discount_price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'Валюта' }),
    __metadata("design:type", String)
], CourseCardDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.5, description: 'Рейтинг курса' }),
    __metadata("design:type", Number)
], CourseCardDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 23, description: 'Количество отзывов' }),
    __metadata("design:type", Number)
], CourseCardDto.prototype, "reviews_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Количество студентов' }),
    __metadata("design:type", Number)
], CourseCardDto.prototype, "current_students_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40, description: 'Продолжительность в часах' }),
    __metadata("design:type", Number)
], CourseCardDto.prototype, "duration_hours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Количество уроков' }),
    __metadata("design:type", Number)
], CourseCardDto.prototype, "lessons_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'beginner', description: 'Уровень сложности' }),
    __metadata("design:type", String)
], CourseCardDto.prototype, "difficulty_level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Информация о преподавателе',
        example: { id: '123', name: 'Иван', second_name: 'Иванов' }
    }),
    __metadata("design:type", Object)
], CourseCardDto.prototype, "teacher", void 0);
//# sourceMappingURL=course-card.dto.js.map