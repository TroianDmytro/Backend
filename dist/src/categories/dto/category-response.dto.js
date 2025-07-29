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
exports.CategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CategoryResponseDto {
    id;
    name;
    slug;
    description;
    short_description;
    icon;
    image_url;
    color;
    parent_id;
    isActive;
    isFeatured;
    order;
    courses_count;
    students_count;
    createdAt;
    updatedAt;
}
exports.CategoryResponseDto = CategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID категории' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Программирование', description: 'Название категории' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'programming', description: 'URL-friendly название' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Курсы по программированию', description: 'Описание' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Изучите программирование', description: 'Краткое описание' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'fas fa-code', description: 'Иконка' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/cat.jpg', description: 'Изображение' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#3f51b5', description: 'Цвет' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, description: 'ID родительской категории' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "parent_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Активна ли категория' }),
    __metadata("design:type", Boolean)
], CategoryResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Рекомендуемая категория' }),
    __metadata("design:type", Boolean)
], CategoryResponseDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Порядок отображения' }),
    __metadata("design:type", Number)
], CategoryResponseDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Количество курсов' }),
    __metadata("design:type", Number)
], CategoryResponseDto.prototype, "courses_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 250, description: 'Количество студентов' }),
    __metadata("design:type", Number)
], CategoryResponseDto.prototype, "students_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T10:30:00Z', description: 'Дата создания' }),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-20T15:45:00Z', description: 'Дата обновления' }),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=category-response.dto.js.map