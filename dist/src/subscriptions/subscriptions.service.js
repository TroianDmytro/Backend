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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_schema_1 = require("./schemas/subscription.schema");
const course_schema_1 = require("../courses/schemas/course.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const email_service_1 = require("../email/email.service");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    subscriptionModel;
    courseModel;
    userModel;
    emailService;
    logger = new common_1.Logger(SubscriptionsService_1.name);
    constructor(subscriptionModel, courseModel, userModel, emailService) {
        this.subscriptionModel = subscriptionModel;
        this.courseModel = courseModel;
        this.userModel = userModel;
        this.emailService = emailService;
    }
    async create(createSubscriptionDto) {
        const { userId, courseId, subscription_type, ...subscriptionData } = createSubscriptionDto;
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${userId} не найден`);
        }
        if (subscription_type === 'course') {
            if (!courseId) {
                throw new common_1.BadRequestException('Для подписки на курс необходимо указать courseId');
            }
            const course = await this.courseModel.findById(courseId).exec();
            if (!course) {
                throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
            }
            if (!course.isPublished || !course.is_active) {
                throw new common_1.BadRequestException('Курс недоступен для подписки');
            }
            const existingSubscription = await this.subscriptionModel.findOne({
                userId,
                courseId,
                status: { $in: ['active', 'pending'] }
            }).exec();
            if (existingSubscription) {
                throw new common_1.ConflictException('У пользователя уже есть активная подписка на этот курс');
            }
            if (course.max_students && course.max_students > 0 && course.current_students_count >= course.max_students) {
                throw new common_1.BadRequestException('Превышен лимит студентов для этого курса');
            }
        }
        const newSubscription = new this.subscriptionModel({
            userId,
            courseId: subscription_type === 'course' ? courseId : undefined,
            subscription_type,
            ...subscriptionData,
            status: 'pending',
            is_paid: false,
            progress_percentage: 0,
            completed_lessons: 0,
            total_lessons: subscription_type === 'course' ? (await this.courseModel.findById(courseId).exec())?.lessons_count || 0 : 0,
            email_notifications: true
        });
        const savedSubscription = await newSubscription.save();
        if (subscription_type === 'course' && courseId) {
            await this.courseModel.findByIdAndUpdate(courseId, {
                $inc: { current_students_count: 1 }
            }).exec();
        }
        this.logger.log(`Создана подписка: ${savedSubscription.id} для пользователя ${userId}`);
        const result = await this.findById(savedSubscription.id);
        if (!result) {
            throw new common_1.NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }
    async findAll(filters, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filters.userId) {
            query.userId = filters.userId;
        }
        if (filters.courseId) {
            query.courseId = filters.courseId;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.subscription_type) {
            query.subscription_type = filters.subscription_type;
        }
        if (filters.period_type) {
            query.period_type = filters.period_type;
        }
        if (filters.is_paid !== undefined) {
            query.is_paid = filters.is_paid;
        }
        if (filters.auto_renewal !== undefined) {
            query.auto_renewal = filters.auto_renewal;
        }
        if (filters.currency) {
            query.currency = filters.currency;
        }
        if (filters.start_date_from || filters.start_date_to) {
            query.start_date = {};
            if (filters.start_date_from) {
                query.start_date.$gte = new Date(filters.start_date_from);
            }
            if (filters.start_date_to) {
                query.start_date.$lte = new Date(filters.start_date_to);
            }
        }
        const [subscriptions, totalItems] = await Promise.all([
            this.subscriptionModel
                .find(query)
                .populate('userId', 'email name second_name')
                .populate('courseId', 'title description price teacherId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.subscriptionModel.countDocuments(query).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return { subscriptions, totalItems, totalPages };
    }
    async findById(id) {
        return this.subscriptionModel
            .findById(id)
            .populate('userId', 'email name second_name')
            .populate({
            path: 'courseId',
            select: 'title description price teacherId',
            populate: {
                path: 'teacherId',
                select: 'name second_name'
            }
        })
            .exec();
    }
    async update(id, updateSubscriptionDto, userId, isAdmin) {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new common_1.NotFoundException(`Подписка с ID ${id} не найдена`);
        }
        if (!isAdmin && subscription.userId.toString() !== userId) {
            throw new common_1.BadRequestException('У вас нет прав на редактирование этой подписки');
        }
        Object.assign(subscription, updateSubscriptionDto);
        const updatedSubscription = await subscription.save();
        this.logger.log(`Обновлена подписка: ${id}`);
        const result = await this.findById(subscription.id);
        if (!result) {
            throw new common_1.NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }
    async delete(id) {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new common_1.NotFoundException(`Подписка с ID ${id} не найдена`);
        }
        if (subscription.subscription_type === 'course' && subscription.courseId) {
            await this.courseModel.findByIdAndUpdate(subscription.courseId, {
                $inc: { current_students_count: -1 }
            }).exec();
        }
        await this.subscriptionModel.findByIdAndDelete(id).exec();
        this.logger.log(`Удалена подписка: ${id}`);
    }
    async cancel(id, reason, userId, isAdmin, immediate = false) {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new common_1.NotFoundException(`Подписка с ID ${id} не найдена`);
        }
        if (!isAdmin && subscription.userId.toString() !== userId) {
            throw new common_1.BadRequestException('У вас нет прав на отмену этой подписки');
        }
        if (subscription.status === 'cancelled') {
            throw new common_1.ConflictException('Подписка уже отменена');
        }
        subscription.status = 'cancelled';
        subscription.cancellation_reason = reason;
        subscription.cancelled_at = new Date();
        subscription.cancelled_by = userId;
        subscription.auto_renewal = false;
        if (immediate) {
            subscription.end_date = new Date();
        }
        const updatedSubscription = await subscription.save();
        if (subscription.subscription_type === 'course' && subscription.courseId) {
            await this.courseModel.findByIdAndUpdate(subscription.courseId, {
                $inc: { current_students_count: -1 }
            }).exec();
        }
        try {
            const user = await this.userModel.findById(subscription.userId).exec();
            if (user) {
                await this.emailService.sendSubscriptionCancellationNotification(user.email, user.name, reason, immediate);
            }
        }
        catch (error) {
            this.logger.error(`Ошибка отправки уведомления об отмене: ${error.message}`);
        }
        this.logger.log(`Подписка ${id} отменена. Причина: ${reason}`);
        const result = await this.findById(subscription.id);
        if (!result) {
            throw new common_1.NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }
    async renew(id, period, autoRenewal, userId, isAdmin) {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new common_1.NotFoundException(`Подписка с ID ${id} не найдена`);
        }
        if (!isAdmin && subscription.userId.toString() !== userId) {
            throw new common_1.BadRequestException('У вас нет прав на продление этой подписки');
        }
        if (subscription.status === 'cancelled') {
            throw new common_1.ConflictException('Нельзя продлить отмененную подписку');
        }
        const periodMap = {
            '1_month': 1,
            '3_months': 3,
            '6_months': 6,
            '12_months': 12
        };
        const monthsToAdd = periodMap[period];
        const newEndDate = new Date(subscription.end_date);
        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);
        subscription.end_date = newEndDate;
        subscription.auto_renewal = autoRenewal;
        subscription.status = 'active';
        if (autoRenewal) {
            const nextBillingDate = new Date(newEndDate);
            nextBillingDate.setDate(nextBillingDate.getDate() - 7);
            subscription.next_billing_date = nextBillingDate;
        }
        const updatedSubscription = await subscription.save();
        this.logger.log(`Подписка ${id} продлена на ${period}`);
        const result = await this.findById(subscription.id);
        if (!result) {
            throw new common_1.NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }
    async activate(id, transactionId, paymentMethod) {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new common_1.NotFoundException(`Подписка с ID ${id} не найдена`);
        }
        subscription.status = 'active';
        subscription.is_paid = true;
        subscription.payment_transaction_id = transactionId;
        subscription.payment_date = new Date();
        if (paymentMethod) {
            subscription.payment_method = paymentMethod;
        }
        const updatedSubscription = await subscription.save();
        try {
            const user = await this.userModel.findById(subscription.userId).exec();
            if (user) {
                await this.emailService.sendSubscriptionActivationNotification(user.email, user.name);
            }
        }
        catch (error) {
            this.logger.error(`Ошибка отправки уведомления об активации: ${error.message}`);
        }
        this.logger.log(`Подписка ${id} активирована. Транзакция: ${transactionId}`);
        const result = await this.findById(subscription.id);
        if (!result) {
            throw new common_1.NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }
    async findByUserId(userId, status) {
        const filter = { userId };
        if (status) {
            filter.status = status;
        }
        return this.subscriptionModel
            .find(filter)
            .populate('courseId', 'title description price teacherId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByCourseId(courseId, status, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const filter = { courseId };
        if (status) {
            filter.status = status;
        }
        const [subscriptions, totalItems] = await Promise.all([
            this.subscriptionModel
                .find(filter)
                .populate('userId', 'email name second_name')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.subscriptionModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return { subscriptions, totalItems, totalPages };
    }
    async getStatistics() {
        const [totalSubscriptions, activeSubscriptions, pendingSubscriptions, cancelledSubscriptions, expiredSubscriptions, totalRevenue, monthlyRevenue] = await Promise.all([
            this.subscriptionModel.countDocuments().exec(),
            this.subscriptionModel.countDocuments({ status: 'active' }).exec(),
            this.subscriptionModel.countDocuments({ status: 'pending' }).exec(),
            this.subscriptionModel.countDocuments({ status: 'cancelled' }).exec(),
            this.subscriptionModel.countDocuments({ status: 'expired' }).exec(),
            this.subscriptionModel.aggregate([
                { $match: { is_paid: true } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]).exec().then(result => result[0]?.total || 0),
            this.subscriptionModel.aggregate([
                {
                    $match: {
                        is_paid: true,
                        payment_date: {
                            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]).exec().then(result => result[0]?.total || 0)
        ]);
        return {
            total: totalSubscriptions,
            active: activeSubscriptions,
            pending: pendingSubscriptions,
            cancelled: cancelledSubscriptions,
            expired: expiredSubscriptions,
            revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue
            },
            conversionRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions * 100).toFixed(2) : 0
        };
    }
    async checkAndUpdateExpiredSubscriptions() {
        const now = new Date();
        const expiredSubscriptions = await this.subscriptionModel.find({
            status: 'active',
            end_date: { $lt: now }
        }).exec();
        let expiredCount = 0;
        let notifiedCount = 0;
        for (const subscription of expiredSubscriptions) {
            subscription.status = 'expired';
            await subscription.save();
            expiredCount++;
            if (subscription.subscription_type === 'course' && subscription.courseId) {
                await this.courseModel.findByIdAndUpdate(subscription.courseId, {
                    $inc: { current_students_count: -1 }
                }).exec();
            }
            try {
                const user = await this.userModel.findById(subscription.userId).exec();
                if (user && subscription.email_notifications) {
                    await this.emailService.sendSubscriptionExpirationNotification(user.email, user.name);
                    notifiedCount++;
                }
            }
            catch (error) {
                this.logger.error(`Ошибка отправки уведомления об истечении: ${error.message}`);
            }
        }
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const expiringSoonSubscriptions = await this.subscriptionModel.find({
            status: 'active',
            end_date: { $gte: now, $lte: weekFromNow },
            email_notifications: true
        }).populate('userId', 'email name').exec();
        for (const subscription of expiringSoonSubscriptions) {
            try {
                const user = subscription.userId;
                if (user) {
                    await this.emailService.sendSubscriptionExpiringNotification(user.email, user.name, subscription.end_date);
                }
            }
            catch (error) {
                this.logger.error(`Ошибка отправки уведомления о скором истечении: ${error.message}`);
            }
        }
        this.logger.log(`Обработано истекших подписок: ${expiredCount}, уведомлений отправлено: ${notifiedCount}`);
        return { expiredCount, notifiedCount };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __param(1, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map