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
exports.CreateSubscriptionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSubscriptionDto {
    userId;
    subscription_type;
    courseId;
    period_type;
    start_date;
    end_date;
    price;
    currency;
    discount_amount;
    discount_code;
    payment_method;
    auto_renewal;
    email_notifications;
}
exports.CreateSubscriptionDto = CreateSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439011',
        description: 'ID пользователя'
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'course',
        description: 'Тип подписки: на отдельный курс или на период',
        enum: ['course', 'period']
    }),
    (0, class_validator_1.IsEnum)(['course', 'period']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "subscription_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439012',
        description: 'ID курса (обязательно для типа "course")',
        required: false
    }),
    (0, class_validator_1.ValidateIf)(o => o.subscription_type === 'course'),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '3_months',
        description: 'Тип периода (обязательно для типа "period")',
        enum: ['1_month', '3_months', '6_months', '12_months'],
        required: false
    }),
    (0, class_validator_1.ValidateIf)(o => o.subscription_type === 'period'),
    (0, class_validator_1.IsEnum)(['1_month', '3_months', '6_months', '12_months']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "period_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T00:00:00Z',
        description: 'Дата начала подписки'
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-04-15T00:00:00Z',
        description: 'Дата окончания подписки'
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 299.99,
        description: 'Цена подписки'
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSubscriptionDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'USD',
        description: 'Валюта',
        enum: ['USD', 'EUR', 'UAH'],
        default: 'USD'
    }),
    (0, class_validator_1.IsEnum)(['USD', 'EUR', 'UAH']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: 'Размер скидки',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSubscriptionDto.prototype, "discount_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'PROMO2024',
        description: 'Промокод',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "discount_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'credit_card',
        description: 'Способ оплаты',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "payment_method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Автоматическое продление',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionDto.prototype, "auto_renewal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Уведомления по email',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionDto.prototype, "email_notifications", void 0);
//# sourceMappingURL=create-subscription.dto.js.map