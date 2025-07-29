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
exports.DifficultyLevelResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DifficultyLevelResponseDto {
    id;
    name;
    slug;
    code;
    description;
    short_description;
    icon;
    color;
    level;
    order;
    prerequisites;
    target_audience;
    recommended_hours;
    isActive;
    courses_count;
    students_count;
    average_completion_rate;
    createdAt;
    updatedAt;
}
exports.DifficultyLevelResponseDto = DifficultyLevelResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID уровня' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Начальный', description: 'Название уровня' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'beginner', description: 'URL-friendly название' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'beginner', description: 'Код уровня' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Для начинающих', description: 'Описание' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Начните с основ', description: 'Краткое описание' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'fas fa-user-graduate', description: 'Иконка' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#4caf50', description: 'Цвет' }),
    __metadata("design:type", String)
], DifficultyLevelResponseDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Числовой уровень' }),
    __metadata("design:type", Number)
], DifficultyLevelResponseDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Порядок отображения' }),
    __metadata("design:type", Number)
], DifficultyLevelResponseDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Базовые знания'], description: 'Требования' }),
    __metadata("design:type", Array)
], DifficultyLevelResponseDto.prototype, "prerequisites", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Новички'], description: 'Целевая аудитория' }),
    __metadata("design:type", Array)
], DifficultyLevelResponseDto.prototype, "target_audience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40, description: 'Рекомендуемые часы' }),
    __metadata("design:type", Number)
], DifficultyLevelResponseDto.prototype, "recommended_hours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Активен ли уровень' }),
    __metadata("design:type", Boolean)
], DifficultyLevelResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25, description: 'Количество курсов' }),
    __metadata("design:type", Number)
], DifficultyLevelResponseDto.prototype, "courses_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500, description: 'Количество студентов' }),
    __metadata("design:type", Number)
], DifficultyLevelResponseDto.prototype, "students_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75.5, description: 'Средний процент завершения' }),
    __metadata("design:type", Number)
], DifficultyLevelResponseDto.prototype, "average_completion_rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T10:30:00Z', description: 'Дата создания' }),
    __metadata("design:type", Date)
], DifficultyLevelResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-20T15:45:00Z', description: 'Дата обновления' }),
    __metadata("design:type", Date)
], DifficultyLevelResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=difficulty-level-response.dto.js.map