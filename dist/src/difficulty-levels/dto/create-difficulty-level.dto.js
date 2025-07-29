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
exports.CreateDifficultyLevelDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDifficultyLevelDto {
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
    min_experience_years;
    isActive;
}
exports.CreateDifficultyLevelDto = CreateDifficultyLevelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Начальный', description: 'Название уровня' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDifficultyLevelDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'beginner',
        description: 'URL-friendly название'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug должен содержать только строчные буквы, цифры и дефисы'
    }),
    __metadata("design:type", String)
], CreateDifficultyLevelDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'beginner',
        description: 'Код уровня'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z_]+$/, {
        message: 'Код должен содержать только строчные буквы и подчеркивания'
    }),
    __metadata("design:type", String)
], CreateDifficultyLevelDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Для тех, кто только начинает изучать предмет',
        description: 'Описание уровня'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDifficultyLevelDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Начните с основ',
        description: 'Краткое описание',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDifficultyLevelDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'fas fa-user-graduate',
        description: 'Иконка уровня',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDifficultyLevelDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '#4caf50',
        description: 'Цвет уровня',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, {
        message: 'Цвет должен быть в формате HEX (#RRGGBB)'
    }),
    __metadata("design:type", String)
], CreateDifficultyLevelDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Числовой уровень (1-начальный, 2-средний, 3-продвинутый)'
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateDifficultyLevelDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Порядок отображения',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDifficultyLevelDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Базовые знания компьютера'],
        description: 'Предварительные требования',
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDifficultyLevelDto.prototype, "prerequisites", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Новички', 'Студенты'],
        description: 'Целевая аудитория',
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDifficultyLevelDto.prototype, "target_audience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 40,
        description: 'Рекомендуемое количество часов',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDifficultyLevelDto.prototype, "recommended_hours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: 'Минимальный опыт в годах',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDifficultyLevelDto.prototype, "min_experience_years", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Активен ли уровень',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDifficultyLevelDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-difficulty-level.dto.js.map