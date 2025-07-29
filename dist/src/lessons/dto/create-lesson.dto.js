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
exports.CreateLessonDto = exports.HomeworkFileDto = exports.MaterialDto = exports.VideoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class VideoDto {
    title;
    url;
    duration_minutes;
    order;
}
exports.VideoDto = VideoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Введение в JavaScript', description: 'Название видео' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://youtube.com/watch?v=abc123', description: 'Ссылка на видео' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Продолжительность видео в минутах' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VideoDto.prototype, "duration_minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Порядковый номер видео в уроке' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VideoDto.prototype, "order", void 0);
class MaterialDto {
    title;
    url;
    type;
    size_bytes;
}
exports.MaterialDto = MaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Конспект урока', description: 'Название материала' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MaterialDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://drive.google.com/file/d/abc123', description: 'Ссылка на файл' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MaterialDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'pdf',
        description: 'Тип материала',
        enum: ['pdf', 'doc', 'ppt', 'image', 'link', 'other']
    }),
    (0, class_validator_1.IsEnum)(['pdf', 'doc', 'ppt', 'image', 'link', 'other']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MaterialDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1024000, description: 'Размер файла в байтах' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MaterialDto.prototype, "size_bytes", void 0);
class HomeworkFileDto {
    title;
    url;
    type;
}
exports.HomeworkFileDto = HomeworkFileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Задание 1', description: 'Название файла задания' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], HomeworkFileDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://drive.google.com/file/d/xyz789', description: 'Ссылка на файл в Google Drive' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], HomeworkFileDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'document',
        description: 'Тип файла',
        enum: ['document', 'template', 'example']
    }),
    (0, class_validator_1.IsEnum)(['document', 'template', 'example']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], HomeworkFileDto.prototype, "type", void 0);
class CreateLessonDto {
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
}
exports.CreateLessonDto = CreateLessonDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439011',
        description: 'ID курса, к которому относится урок'
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Введение в веб-разработку', description: 'Название урока' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'В этом уроке мы изучим основы HTML и CSS',
        description: 'Описание урока'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Основы HTML и CSS',
        description: 'Краткое описание',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "short_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Порядковый номер урока в курсе' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 45,
        description: 'Продолжительность урока в минутах',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "duration_minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'HTML - это язык разметки гипертекста...',
        description: 'Текстовый контент урока',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "text_content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '<h1>HTML Basics</h1><p>HTML - это...</p>',
        description: 'HTML контент урока',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "content_html", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Видео материалы урока',
        type: [VideoDto],
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VideoDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLessonDto.prototype, "videos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дополнительные материалы урока',
        type: [MaterialDto],
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MaterialDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLessonDto.prototype, "materials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Создайте простую HTML страницу с заголовком и абзацем',
        description: 'Описание домашнего задания',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "homework_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Файлы домашнего задания',
        type: [HomeworkFileDto],
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => HomeworkFileDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLessonDto.prototype, "homework_files", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-02-01T23:59:59Z',
        description: 'Срок сдачи домашнего задания',
        required: false
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "homework_deadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: 'Максимальная оценка за домашнее задание',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "homework_max_score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Активен ли урок',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Опубликован ли урок',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Бесплатный ли урок',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isFree", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['507f1f77bcf86cd799439012'],
        description: 'ID уроков-предварительных требований',
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLessonDto.prototype, "prerequisites", void 0);
//# sourceMappingURL=create-lesson.dto.js.map