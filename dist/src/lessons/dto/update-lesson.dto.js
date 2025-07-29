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
exports.UpdateLessonDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const create_lesson_dto_1 = require("./create-lesson.dto");
class UpdateLessonDto {
    title;
    description;
    short_description;
    order;
    duration_minutes;
    text_content;
    content_html;
    videos;
    materials;
    homework_description;
    homework_files;
    homework_deadline;
    homework_max_score;
    isActive;
    isPublished;
    isFree;
    prerequisites;
}
exports.UpdateLessonDto = UpdateLessonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Обновленное название урока', description: 'Название урока', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Обновленное описание урока', description: 'Описание урока', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Новое краткое описание', description: 'Краткое описание', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'Порядковый номер урока', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 60, description: 'Продолжительность в минутах', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "duration_minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Обновленный текстовый контент', description: 'Текстовый контент', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "text_content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '<h1>Updated Content</h1>', description: 'HTML контент', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "content_html", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Видео материалы', type: [create_lesson_dto_1.VideoDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_lesson_dto_1.VideoDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLessonDto.prototype, "videos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дополнительные материалы', type: [create_lesson_dto_1.MaterialDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_lesson_dto_1.MaterialDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLessonDto.prototype, "materials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Обновленное задание', description: 'Описание домашнего задания', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "homework_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Файлы домашнего задания', type: [create_lesson_dto_1.HomeworkFileDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_lesson_dto_1.HomeworkFileDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLessonDto.prototype, "homework_files", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-02-15T23:59:59Z', description: 'Срок сдачи задания', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "homework_deadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 90, description: 'Максимальная оценка', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "homework_max_score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Активен ли урок', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Опубликован ли урок', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Бесплатный ли урок', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLessonDto.prototype, "isFree", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['507f1f77bcf86cd799439013'], description: 'ID предварительных уроков', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateLessonDto.prototype, "prerequisites", void 0);
//# sourceMappingURL=update-lesson.dto.js.map