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
exports.SubscriptionFilterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubscriptionFilterDto {
    userId;
    courseId;
    status;
    subscription_type;
    period_type;
    is_paid;
    auto_renewal;
    start_date_from;
    start_date_to;
    currency;
}
exports.SubscriptionFilterDto = SubscriptionFilterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439011',
        description: 'Фильтр по пользователю',
        required: false
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439012',
        description: 'Фильтр по курсу',
        required: false
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'active',
        description: 'Фильтр по статусу',
        enum: ['active', 'expired', 'cancelled', 'pending'],
        required: false
    }),
    (0, class_validator_1.IsEnum)(['active', 'expired', 'cancelled', 'pending']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'course',
        description: 'Фильтр по типу подписки',
        enum: ['course', 'period'],
        required: false
    }),
    (0, class_validator_1.IsEnum)(['course', 'period']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "subscription_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '3_months',
        description: 'Фильтр по типу периода',
        enum: ['1_month', '3_months', '6_months', '12_months'],
        required: false
    }),
    (0, class_validator_1.IsEnum)(['1_month', '3_months', '6_months', '12_months']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "period_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Только оплаченные подписки',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SubscriptionFilterDto.prototype, "is_paid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Только подписки с автопродлением',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SubscriptionFilterDto.prototype, "auto_renewal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-01',
        description: 'Дата начала периода (от)',
        required: false
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "start_date_from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-12-31',
        description: 'Дата начала периода (до)',
        required: false
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "start_date_to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'USD',
        description: 'Фильтр по валюте',
        enum: ['USD', 'EUR', 'UAH'],
        required: false
    }),
    (0, class_validator_1.IsEnum)(['USD', 'EUR', 'UAH']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionFilterDto.prototype, "currency", void 0);
//# sourceMappingURL=subscription-filter.dto.js.map