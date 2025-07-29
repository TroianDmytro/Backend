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
exports.LessonResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class LessonResponseDto {
    id;
    courseId;
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
    createdAt;
    updatedAt;
}
exports.LessonResponseDto = LessonResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID урока' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439012', description: 'ID курса' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Введение в веб-разработку', description: 'Название урока' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'В этом уроке мы изучим основы HTML и CSS', description: 'Описание урока' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Основы HTML и CSS', description: 'Краткое описание' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Порядковый номер урока в курсе' }),
    __metadata("design:type", Number)
], LessonResponseDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Продолжительность урока в минутах' }),
    __metadata("design:type", Number)
], LessonResponseDto.prototype, "duration_minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HTML - это язык разметки...', description: 'Текстовый контент урока' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "text_content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '<h1>HTML Basics</h1>', description: 'HTML контент урока' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "content_html", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Видео материалы урока' }),
    __metadata("design:type", Array)
], LessonResponseDto.prototype, "videos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Дополнительные материалы урока' }),
    __metadata("design:type", Array)
], LessonResponseDto.prototype, "materials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Создайте простую HTML страницу', description: 'Описание домашнего задания' }),
    __metadata("design:type", String)
], LessonResponseDto.prototype, "homework_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Файлы домашнего задания' }),
    __metadata("design:type", Array)
], LessonResponseDto.prototype, "homework_files", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-02-01T23:59:59Z', description: 'Срок сдачи домашнего задания' }),
    __metadata("design:type", Date)
], LessonResponseDto.prototype, "homework_deadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Максимальная оценка за домашнее задание' }),
    __metadata("design:type", Number)
], LessonResponseDto.prototype, "homework_max_score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Активен ли урок' }),
    __metadata("design:type", Boolean)
], LessonResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Опубликован ли урок' }),
    __metadata("design:type", Boolean)
], LessonResponseDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Бесплатный ли урок' }),
    __metadata("design:type", Boolean)
], LessonResponseDto.prototype, "isFree", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['507f1f77bcf86cd799439013'], description: 'ID предварительных уроков' }),
    __metadata("design:type", Array)
], LessonResponseDto.prototype, "prerequisites", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-12-01T10:30:00Z', description: 'Дата создания' }),
    __metadata("design:type", Date)
], LessonResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-12-15T14:20:00Z', description: 'Дата обновления' }),
    __metadata("design:type", Date)
], LessonResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=lesson-response.dto.js.map