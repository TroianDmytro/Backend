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
exports.CourseFilterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CourseFilterDto {
    category;
    difficulty_level;
    teacherId;
    minPrice;
    maxPrice;
    language;
    isPublished;
    isActive;
    isFeatured;
    tag;
    search;
}
exports.CourseFilterDto = CourseFilterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Программирование', description: 'Категория для фильтрации', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFilterDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'beginner', description: 'Уровень сложности', enum: ['beginner', 'intermediate', 'advanced'], required: false }),
    (0, class_validator_1.IsEnum)(['beginner', 'intermediate', 'advanced']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFilterDto.prototype, "difficulty_level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID преподавателя', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFilterDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'Минимальная цена', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CourseFilterDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500, description: 'Максимальная цена', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CourseFilterDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ru', description: 'Язык курса', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFilterDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Только опубликованные курсы', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CourseFilterDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Только активные курсы', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CourseFilterDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Только рекомендуемые курсы', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CourseFilterDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JavaScript', description: 'Поиск по тегам', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFilterDto.prototype, "tag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'веб-разработка', description: 'Поиск по названию и описанию', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourseFilterDto.prototype, "search", void 0);
//# sourceMappingURL=course-filter.dto.js.map