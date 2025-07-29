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
exports.SubscriptionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SubscriptionResponseDto {
    id;
    userId;
    user;
    subscription_type;
    courseId;
    course;
    period_type;
    start_date;
    end_date;
    status;
    price;
    currency;
    discount_amount;
    discount_code;
    payment_method;
    payment_transaction_id;
    payment_date;
    is_paid;
    auto_renewal;
    next_billing_date;
    progress_percentage;
    completed_lessons;
    total_lessons;
    last_accessed;
    email_notifications;
    cancellation_reason;
    cancelled_at;
    cancelled_by;
    createdAt;
    updatedAt;
    is_active;
    days_remaining;
}
exports.SubscriptionResponseDto = SubscriptionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011', description: 'ID подписки' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439012', description: 'ID пользователя' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Информация о пользователе' }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'course', description: 'Тип подписки' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "subscription_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439013', description: 'ID курса' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Информация о курсе' }),
    __metadata("design:type", Object)
], SubscriptionResponseDto.prototype, "course", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3_months', description: 'Тип периода' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "period_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00Z', description: 'Дата начала подписки' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-04-15T00:00:00Z', description: 'Дата окончания подписки' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'active', description: 'Статус подписки' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 299.99, description: 'Цена подписки' }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'Валюта' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'Размер скидки' }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "discount_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PROMO2024', description: 'Промокод' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "discount_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'credit_card', description: 'Способ оплаты' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "payment_method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TXN123456789', description: 'ID транзакции оплаты' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "payment_transaction_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:30:00Z', description: 'Дата оплаты' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "payment_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Оплачена ли подписка' }),
    __metadata("design:type", Boolean)
], SubscriptionResponseDto.prototype, "is_paid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Автоматическое продление' }),
    __metadata("design:type", Boolean)
], SubscriptionResponseDto.prototype, "auto_renewal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-04-15T00:00:00Z', description: 'Дата следующего списания' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "next_billing_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75, description: 'Процент прохождения курса' }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "progress_percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8, description: 'Количество пройденных уроков' }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "completed_lessons", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12, description: 'Общее количество уроков' }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "total_lessons", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-20T15:45:00Z', description: 'Дата последнего доступа' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "last_accessed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Уведомления по email' }),
    __metadata("design:type", Boolean)
], SubscriptionResponseDto.prototype, "email_notifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Не подходит формат обучения', description: 'Причина отмены' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "cancellation_reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-02-01T12:00:00Z', description: 'Дата отмены' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "cancelled_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439014', description: 'Кто отменил подписку' }),
    __metadata("design:type", String)
], SubscriptionResponseDto.prototype, "cancelled_by", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-20T15:45:00Z', description: 'Дата обновления' }),
    __metadata("design:type", Date)
], SubscriptionResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Активна ли подписка в данный момент' }),
    __metadata("design:type", Boolean)
], SubscriptionResponseDto.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Дней до окончания подписки' }),
    __metadata("design:type", Number)
], SubscriptionResponseDto.prototype, "days_remaining", void 0);
//# sourceMappingURL=subscription-response.dto.js.map