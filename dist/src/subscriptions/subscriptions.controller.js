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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SubscriptionsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscriptions_service_1 = require("./subscriptions.service");
const create_subscription_dto_1 = require("./dto/create-subscription.dto");
const update_subscription_dto_1 = require("./dto/update-subscription.dto");
const subscription_response_dto_1 = require("./dto/subscription-response.dto");
const subscription_filter_dto_1 = require("./dto/subscription-filter.dto");
const cancel_subscription_dto_1 = require("./dto/cancel-subscription.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let SubscriptionsController = SubscriptionsController_1 = class SubscriptionsController {
    subscriptionsService;
    logger = new common_1.Logger(SubscriptionsController_1.name);
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    async createSubscription(createSubscriptionDto, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Создание подписки для пользователя: ${createSubscriptionDto.userId}`);
        const subscription = await this.subscriptionsService.create(createSubscriptionDto);
        return {
            message: 'Подписка успешно создана',
            subscription: subscription
        };
    }
    async getAllSubscriptions(page = 1, limit = 10, filters, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Запрос списка подписок. Страница: ${page}, Лимит: ${limit}`);
        const result = await this.subscriptionsService.findAll(filters, page, limit);
        return {
            subscriptions: result.subscriptions,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            },
            filters: filters
        };
    }
    async getSubscriptionById(id, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Запрос подписки с ID: ${id}`);
        const subscription = await this.subscriptionsService.findById(id);
        if (!subscription) {
            throw new common_1.NotFoundException('Подписка не найдена');
        }
        return { subscription };
    }
    async updateSubscription(id, updateSubscriptionDto, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Обновление подписки с ID: ${id}`);
        const updatedSubscription = await this.subscriptionsService.update(id, updateSubscriptionDto, currentUserId, isAdmin);
        return {
            message: 'Подписка успешно обновлена',
            subscription: updatedSubscription
        };
    }
    async deleteSubscription(id) {
        this.logger.log(`Удаление подписки с ID: ${id}`);
        await this.subscriptionsService.delete(id);
        return {
            message: 'Подписка успешно удалена'
        };
    }
    async cancelSubscription(id, cancelDto, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Отмена подписки ${id}. Причина: ${cancelDto.reason}`);
        const cancelledSubscription = await this.subscriptionsService.cancel(id, cancelDto.reason, currentUserId, isAdmin, cancelDto.immediate);
        return {
            message: cancelDto.immediate
                ? 'Подписка немедленно отменена'
                : 'Подписка будет отменена в конце периода',
            subscription: cancelledSubscription
        };
    }
    async renewSubscription(id, period, autoRenewal = false, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Продление подписки ${id} на период: ${period}`);
        const renewedSubscription = await this.subscriptionsService.renew(id, period, autoRenewal, currentUserId, isAdmin);
        return {
            message: 'Подписка успешно продлена',
            subscription: renewedSubscription
        };
    }
    async activateSubscription(id, transactionId, paymentMethod) {
        this.logger.log(`Активация подписки ${id}. Транзакция: ${transactionId}`);
        const activatedSubscription = await this.subscriptionsService.activate(id, transactionId, paymentMethod);
        return {
            message: 'Подписка успешно активирована',
            subscription: activatedSubscription
        };
    }
    async getUserSubscriptions(userId, status, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Получение подписок пользователя: ${userId}`);
        const subscriptions = await this.subscriptionsService.findByUserId(userId, status);
        return {
            userId: userId,
            subscriptions: subscriptions,
            totalSubscriptions: subscriptions.length
        };
    }
    async getCourseSubscriptions(courseId, status, page = 1, limit = 20) {
        this.logger.log(`Получение подписок на курс: ${courseId}`);
        const result = await this.subscriptionsService.findByCourseId(courseId, status, page, limit);
        return {
            courseId: courseId,
            subscriptions: result.subscriptions,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getSubscriptionsStatistics() {
        this.logger.log('Получение статистики подписок');
        const statistics = await this.subscriptionsService.getStatistics();
        return {
            statistics: statistics
        };
    }
    async checkExpiringSubscriptions() {
        this.logger.log('Проверка истекающих подписок');
        const result = await this.subscriptionsService.checkAndUpdateExpiredSubscriptions();
        return {
            message: 'Проверка истекающих подписок завершена',
            expiredCount: result.expiredCount,
            notifiedCount: result.notifiedCount
        };
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Создание новой подписки',
        description: 'Создает подписку на курс или на определенный период'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Подписка успешно создана',
        type: subscription_response_dto_1.SubscriptionResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Подписка уже существует' }),
    (0, swagger_1.ApiBody)({ type: create_subscription_dto_1.CreateSubscriptionDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_dto_1.CreateSubscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение списка подписок',
        description: 'Возвращает список подписок с возможностью фильтрации'
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Номер страницы (по умолчанию 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице (по умолчанию 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String, description: 'Фильтр по пользователю' }),
    (0, swagger_1.ApiQuery)({ name: 'courseId', required: false, type: String, description: 'Фильтр по курсу' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled', 'pending'], description: 'Фильтр по статусу' }),
    (0, swagger_1.ApiQuery)({ name: 'subscription_type', required: false, enum: ['course', 'period'], description: 'Фильтр по типу подписки' }),
    (0, swagger_1.ApiQuery)({ name: 'is_paid', required: false, type: Boolean, description: 'Только оплаченные подписки' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список подписок',
        type: [subscription_response_dto_1.SubscriptionResponseDto]
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, subscription_filter_dto_1.SubscriptionFilterDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getAllSubscriptions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение подписки по ID',
        description: 'Возвращает подробную информацию о подписке'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID подписки' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные подписки',
        type: subscription_response_dto_1.SubscriptionResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Подписка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление подписки',
        description: 'Обновляет данные подписки. Пользователь может редактировать только свои подписки.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID подписки' }),
    (0, swagger_1.ApiBody)({ type: update_subscription_dto_1.UpdateSubscriptionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Подписка успешно обновлена',
        type: subscription_response_dto_1.SubscriptionResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав на редактирование' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Подписка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_dto_1.UpdateSubscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Удаление подписки',
        description: 'Полностью удаляет подписку из системы (только для админов)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID подписки' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Подписка успешно удалена' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав на удаление' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Подписка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "deleteSubscription", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Отмена подписки',
        description: 'Отменяет подписку с указанием причины'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID подписки' }),
    (0, swagger_1.ApiBody)({ type: cancel_subscription_dto_1.CancelSubscriptionDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Подписка успешно отменена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Подписка не найдена' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Подписка уже отменена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_subscription_dto_1.CancelSubscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)(':id/renew'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Продление подписки',
        description: 'Продлевает подписку на следующий период'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID подписки' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                period: {
                    type: 'string',
                    enum: ['1_month', '3_months', '6_months', '12_months'],
                    description: 'Период продления'
                },
                auto_renewal: {
                    type: 'boolean',
                    description: 'Включить автопродление'
                }
            },
            required: ['period']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Подписка успешно продлена',
        type: subscription_response_dto_1.SubscriptionResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Подписка не найдена' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Подписка не может быть продлена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('period')),
    __param(2, (0, common_1.Body)('auto_renewal')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "renewSubscription", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Активация подписки',
        description: 'Активирует подписку после оплаты (только для админов)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID подписки' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                payment_transaction_id: {
                    type: 'string',
                    description: 'ID транзакции оплаты'
                },
                payment_method: {
                    type: 'string',
                    description: 'Способ оплаты'
                }
            },
            required: ['payment_transaction_id']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Подписка успешно активирована' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Подписка не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('payment_transaction_id')),
    __param(2, (0, common_1.Body)('payment_method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "activateSubscription", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение подписок пользователя',
        description: 'Возвращает все подписки конкретного пользователя'
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID пользователя' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled', 'pending'], description: 'Фильтр по статусу' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список подписок пользователя',
        type: [subscription_response_dto_1.SubscriptionResponseDto]
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getUserSubscriptions", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение подписок на курс',
        description: 'Возвращает все подписки на конкретный курс'
    }),
    (0, swagger_1.ApiParam)({ name: 'courseId', description: 'ID курса' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled', 'pending'], description: 'Фильтр по статусу' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Номер страницы' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список подписок на курс',
        type: [subscription_response_dto_1.SubscriptionResponseDto]
    }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getCourseSubscriptions", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Общая статистика подписок',
        description: 'Возвращает общую статистику по подпискам'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика подписок' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionsStatistics", null);
__decorate([
    (0, common_1.Post)('expire-check'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Проверка истекающих подписок',
        description: 'Проверяет и обновляет статусы истекающих подписок'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Проверка завершена' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "checkExpiringSubscriptions", null);
exports.SubscriptionsController = SubscriptionsController = SubscriptionsController_1 = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map