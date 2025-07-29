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
exports.TeacherResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TeacherResponseDto {
    id;
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
    assignedCourses;
    isEmailVerified;
    isBlocked;
    isApproved;
    approvalStatus;
    rating;
    reviewsCount;
    createdAt;
    updatedAt;
}
exports.TeacherResponseDto = TeacherResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID преподавателя' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'teacher@example.com', description: 'Email преподавателя' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иван', description: 'Имя преподавателя' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Иванов', description: 'Фамилия преподавателя' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "second_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35, description: 'Возраст преподавателя' }),
    __metadata("design:type", Number)
], TeacherResponseDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+380 (67) 123-45-67', description: 'Номер телефона' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "telefon_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Описание преподавателя', description: 'Описание' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Веб-разработка', description: 'Специализация' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "specialization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'МГУ, факультет ВМК', description: 'Образование' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Опыт работы в годах' }),
    __metadata("design:type", Number)
], TeacherResponseDto.prototype, "experience_years", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['JavaScript', 'React', 'Node.js'], description: 'Навыки' }),
    __metadata("design:type", Array)
], TeacherResponseDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://drive.google.com/file/d/abc123/view', description: 'CV файл' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "cv_file_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['507f1f77bcf86cd799439012'],
        description: 'Список ID назначенных курсов'
    }),
    __metadata("design:type", Array)
], TeacherResponseDto.prototype, "assignedCourses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Подтвержден ли email' }),
    __metadata("design:type", Boolean)
], TeacherResponseDto.prototype, "isEmailVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Заблокирован ли преподаватель' }),
    __metadata("design:type", Boolean)
], TeacherResponseDto.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Одобрен ли преподаватель' }),
    __metadata("design:type", Boolean)
], TeacherResponseDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'approved', description: 'Статус заявки' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "approvalStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.5, description: 'Рейтинг преподавателя' }),
    __metadata("design:type", Number)
], TeacherResponseDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Количество отзывов' }),
    __metadata("design:type", Number)
], TeacherResponseDto.prototype, "reviewsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T10:30:00Z', description: 'Дата создания' }),
    __metadata("design:type", Date)
], TeacherResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-20T15:45:00Z', description: 'Дата обновления' }),
    __metadata("design:type", Date)
], TeacherResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=teacher-response.dto.js.map