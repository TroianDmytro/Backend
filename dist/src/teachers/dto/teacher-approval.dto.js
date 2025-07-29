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
exports.TeacherApprovalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TeacherApprovalDto {
    approvalStatus;
    rejectionReason;
}
exports.TeacherApprovalDto = TeacherApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'approved',
        description: 'Статус одобрения заявки',
        enum: ['approved', 'rejected']
    }),
    (0, class_validator_1.IsEnum)(['approved', 'rejected']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TeacherApprovalDto.prototype, "approvalStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Недостаточно опыта работы',
        description: 'Причина отклонения (обязательна при отклонении)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeacherApprovalDto.prototype, "rejectionReason", void 0);
//# sourceMappingURL=teacher-approval.dto.js.map