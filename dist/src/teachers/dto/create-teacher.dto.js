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
exports.CreateTeacherDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTeacherDto {
    email;
    password;
    name;
    second_name;
    age;
    telefon_number;
    description;
    specialization;
    education;
    experience_years;
    skills;
    cv_file_url;
}
exports.CreateTeacherDto = CreateTeacherDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'teacher@example.com', description: 'Email преподавателя' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123', description: 'Пароль (минимум 6 символов)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иван', description: 'Имя преподавателя' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иванов', description: 'Фамилия преподавателя' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "second_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35, description: 'Возраст преподавателя', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTeacherDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+380 (67) 123-45-67', description: 'Номер телефона', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "telefon_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Опытный преподаватель программирования с 10-летним стажем',
        description: 'Описание преподавателя'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Веб-разработка', description: 'Специализация', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "specialization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'МГУ, факультет ВМК', description: 'Образование', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Опыт работы в годах', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTeacherDto.prototype, "experience_years", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['JavaScript', 'React', 'Node.js'],
        description: 'Навыки и умения',
        required: false
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTeacherDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://drive.google.com/file/d/abc123/view',
        description: 'Ссылка на CV файл',
        required: false
    }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "cv_file_url", void 0);
//# sourceMappingURL=create-teacher.dto.js.map