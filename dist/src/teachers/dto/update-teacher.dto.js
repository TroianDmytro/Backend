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
exports.UpdateTeacherDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateTeacherDto {
    email;
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
    password;
}
exports.UpdateTeacherDto = UpdateTeacherDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'teacher@example.com', description: 'Email преподавателя', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иван', description: 'Имя преподавателя', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иванов', description: 'Фамилия преподавателя', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "second_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35, description: 'Возраст преподавателя', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTeacherDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+380 (67) 123-45-67', description: 'Номер телефона', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "telefon_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Обновленное описание преподавателя',
        description: 'Описание преподавателя',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Веб-разработка', description: 'Специализация', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "specialization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'МГУ, факультет ВМК', description: 'Образование', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, description: 'Опыт работы в годах', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTeacherDto.prototype, "experience_years", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        description: 'Навыки и умения',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateTeacherDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://drive.google.com/file/d/abc123/view',
        description: 'Ссылка на CV файл',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "cv_file_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123', description: 'Новый пароль', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "password", void 0);
//# sourceMappingURL=update-teacher.dto.js.map