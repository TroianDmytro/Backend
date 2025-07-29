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
exports.UpdateSubscriptionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateSubscriptionDto {
    status;
    end_date;
    price;
    is_paid;
    payment_transaction_id;
    payment_date;
    auto_renewal;
    next_billing_date;
    progress_percentage;
    completed_lessons;
    email_notifications;
    cancellation_reason;
}
exports.UpdateSubscriptionDto = UpdateSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'active',
        description: 'Статус подписки',
        enum: ['active', 'expired', 'cancelled', 'pending'],
        required: false
    }),
    (0, class_validator_1.IsEnum)(['active', 'expired', 'cancelled', 'pending']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-07-15T00:00:00Z',
        description: 'Новая дата окончания подписки',
        required: false
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 399.99,
        description: 'Новая цена подписки',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSubscriptionDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Оплачена ли подписка',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSubscriptionDto.prototype, "is_paid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'TXN123456789',
        description: 'ID транзакции оплаты',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "payment_transaction_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Дата оплаты',
        required: false
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "payment_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Автоматическое продление',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSubscriptionDto.prototype, "auto_renewal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-04-15T00:00:00Z',
        description: 'Дата следующего списания',
        required: false
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "next_billing_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 75,
        description: 'Процент прохождения курса',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSubscriptionDto.prototype, "progress_percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 8,
        description: 'Количество пройденных уроков',
        required: false
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSubscriptionDto.prototype, "completed_lessons", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Уведомления по email',
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSubscriptionDto.prototype, "email_notifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Не подходит формат обучения',
        description: 'Причина отмены подписки',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "cancellation_reason", void 0);
//# sourceMappingURL=update-subscription.dto.js.map