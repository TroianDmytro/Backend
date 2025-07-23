// src/subscriptions/subscriptions.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionFilterDto } from './dto/subscription-filter.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SubscriptionsService {
    private readonly logger = new Logger(SubscriptionsService.name);

    constructor(
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly emailService: EmailService
    ) { }

    /**
     * Создание новой подписки
     */
    async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDocument> {
        const { userId, courseId, subscription_type, ...subscriptionData } = createSubscriptionDto;

        // Проверяем существование пользователя
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }

        // Если подписка на курс, проверяем курс
        if (subscription_type === 'course') {
            if (!courseId) {
                throw new BadRequestException('Для подписки на курс необходимо указать courseId');
            }

            const course = await this.courseModel.findById(courseId).exec();
            if (!course) {
                throw new NotFoundException(`Курс с ID ${courseId} не найден`);
            }

            if (!course.isPublished || !course.is_active) {
                throw new BadRequestException('Курс недоступен для подписки');
            }

            // Проверяем, нет ли уже активной подписки на этот курс
            const existingSubscription = await this.subscriptionModel.findOne({
                userId,
                courseId,
                status: { $in: ['active', 'pending'] }
            }).exec();

            if (existingSubscription) {
                throw new ConflictException('У пользователя уже есть активная подписка на этот курс');
            }

            // Проверяем лимит студентов
            if (course.max_students && course.max_students > 0 && course.current_students_count >= course.max_students) {
                throw new BadRequestException('Превышен лимит студентов для этого курса');
            }
        }

        // Создаем подписку
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

        // Если подписка на курс, обновляем счетчик студентов
        if (subscription_type === 'course' && courseId) {
            await this.courseModel.findByIdAndUpdate(courseId, {
                $inc: { current_students_count: 1 }
            }).exec();
        }

        this.logger.log(`Создана подписка: ${savedSubscription.id} для пользователя ${userId}`);
        const result = await this.findById(savedSubscription.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }

    /**
     * Получение списка подписок с фильтрацией
     */
    async findAll(
        filters: SubscriptionFilterDto,
        page: number = 1,
        limit: number = 10
    ): Promise<{ subscriptions: SubscriptionDocument[]; totalItems: number; totalPages: number }> {
        const skip = (page - 1) * limit;

        // Строим фильтр запроса
        const query: any = {};

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

        // Фильтр по датам
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

    /**
     * Получение подписки по ID
     */
    async findById(id: string): Promise<SubscriptionDocument | null> {
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

    /**
     * Обновление подписки
     */
    async update(
        id: string,
        updateSubscriptionDto: UpdateSubscriptionDto,
        userId: string,
        isAdmin: boolean
    ): Promise<SubscriptionDocument> {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new NotFoundException(`Подписка с ID ${id} не найдена`);
        }

        // Проверяем права доступа
        if (!isAdmin && subscription.userId.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на редактирование этой подписки');
        }

        // Обновляем поля подписки
        Object.assign(subscription, updateSubscriptionDto);

        const updatedSubscription = await subscription.save();
        this.logger.log(`Обновлена подписка: ${id}`);

        const result = await this.findById(subscription.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }

    /**
     * Удаление подписки (только для админов)
     */
    async delete(id: string): Promise<void> {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new NotFoundException(`Подписка с ID ${id} не найдена`);
        }

        // Если подписка на курс, уменьшаем счетчик студентов
        if (subscription.subscription_type === 'course' && subscription.courseId) {
            await this.courseModel.findByIdAndUpdate(subscription.courseId, {
                $inc: { current_students_count: -1 }
            }).exec();
        }

        await this.subscriptionModel.findByIdAndDelete(id).exec();
        this.logger.log(`Удалена подписка: ${id}`);
    }

    /**
     * Отмена подписки
     */
    async cancel(
        id: string,
        reason: string,
        userId: string,
        isAdmin: boolean,
        immediate: boolean = false
    ): Promise<SubscriptionDocument> {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new NotFoundException(`Подписка с ID ${id} не найдена`);
        }

        // Проверяем права доступа
        if (!isAdmin && subscription.userId.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на отмену этой подписки');
        }

        if (subscription.status === 'cancelled') {
            throw new ConflictException('Подписка уже отменена');
        }

        // Отменяем подписку
        subscription.status = 'cancelled';
        subscription.cancellation_reason = reason;
        subscription.cancelled_at = new Date();
        subscription.cancelled_by = userId as any;
        subscription.auto_renewal = false;

        if (immediate) {
            subscription.end_date = new Date();
        }

        const updatedSubscription = await subscription.save();

        // Если подписка на курс, уменьшаем счетчик студентов
        if (subscription.subscription_type === 'course' && subscription.courseId) {
            await this.courseModel.findByIdAndUpdate(subscription.courseId, {
                $inc: { current_students_count: -1 }
            }).exec();
        }

        // Отправляем уведомление пользователю
        try {
            const user = await this.userModel.findById(subscription.userId).exec();
            if (user) {
                await this.emailService.sendSubscriptionCancellationNotification(
                    user.email,
                    user.name,
                    reason,
                    immediate
                );
            }
        } catch (error) {
            this.logger.error(`Ошибка отправки уведомления об отмене: ${error.message}`);
        }

        this.logger.log(`Подписка ${id} отменена. Причина: ${reason}`);
        const result = await this.findById(subscription.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }

    /**
     * Продление подписки
     */
    async renew(
        id: string,
        period: '1_month' | '3_months' | '6_months' | '12_months',
        autoRenewal: boolean,
        userId: string,
        isAdmin: boolean
    ): Promise<SubscriptionDocument> {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new NotFoundException(`Подписка с ID ${id} не найдена`);
        }

        // Проверяем права доступа
        if (!isAdmin && subscription.userId.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на продление этой подписки');
        }

        if (subscription.status === 'cancelled') {
            throw new ConflictException('Нельзя продлить отмененную подписку');
        }

        // Рассчитываем новую дату окончания
        const periodMap = {
            '1_month': 1,
            '3_months': 3,
            '6_months': 6,
            '12_months': 12
        };

        const monthsToAdd = periodMap[period];
        const newEndDate = new Date(subscription.end_date);
        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);

        // Обновляем подписку
        subscription.end_date = newEndDate;
        subscription.auto_renewal = autoRenewal;
        subscription.status = 'active';

        if (autoRenewal) {
            const nextBillingDate = new Date(newEndDate);
            nextBillingDate.setDate(nextBillingDate.getDate() - 7); // За неделю до окончания
            subscription.next_billing_date = nextBillingDate;
        }

        const updatedSubscription = await subscription.save();

        this.logger.log(`Подписка ${id} продлена на ${period}`);
        const result = await this.findById(subscription.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }

    /**
     * Активация подписки после оплаты
     */
    async activate(
        id: string,
        transactionId: string,
        paymentMethod?: string
    ): Promise<SubscriptionDocument> {
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new NotFoundException(`Подписка с ID ${id} не найдена`);
        }

        // Активируем подписку
        subscription.status = 'active';
        subscription.is_paid = true;
        subscription.payment_transaction_id = transactionId;
        subscription.payment_date = new Date();
        if (paymentMethod) {
            subscription.payment_method = paymentMethod;
        }

        const updatedSubscription = await subscription.save();

        // Отправляем уведомление об активации
        try {
            const user = await this.userModel.findById(subscription.userId).exec();
            if (user) {
                await this.emailService.sendSubscriptionActivationNotification(
                    user.email,
                    user.name
                );
            }
        } catch (error) {
            this.logger.error(`Ошибка отправки уведомления об активации: ${error.message}`);
        }

        this.logger.log(`Подписка ${id} активирована. Транзакция: ${transactionId}`);
        const result = await this.findById(subscription.id);
        if (!result) {
            throw new NotFoundException('Ошибка при получении подписки');
        }
        return result;
    }

    /**
     * Получение подписок пользователя
     */
    async findByUserId(
        userId: string,
        status?: 'active' | 'expired' | 'cancelled' | 'pending'
    ): Promise<SubscriptionDocument[]> {
        const filter: any = { userId };
        if (status) {
            filter.status = status;
        }

        return this.subscriptionModel
            .find(filter)
            .populate('courseId', 'title description price teacherId')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Получение подписок на курс
     */
    async findByCourseId(
        courseId: string,
        status?: 'active' | 'expired' | 'cancelled' | 'pending',
        page: number = 1,
        limit: number = 20
    ): Promise<{ subscriptions: SubscriptionDocument[]; totalItems: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const filter: any = { courseId };
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

    /**
     * Получение общей статистики подписок
     */
    async getStatistics(): Promise<any> {
        const [
            totalSubscriptions,
            activeSubscriptions,
            pendingSubscriptions,
            cancelledSubscriptions,
            expiredSubscriptions,
            totalRevenue,
            monthlyRevenue
        ] = await Promise.all([
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

    /**
     * Проверка и обновление истекших подписок
     */
    async checkAndUpdateExpiredSubscriptions(): Promise<{ expiredCount: number; notifiedCount: number }> {
        const now = new Date();

        // Находим подписки, которые истекли
        const expiredSubscriptions = await this.subscriptionModel.find({
            status: 'active',
            end_date: { $lt: now }
        }).exec();

        let expiredCount = 0;
        let notifiedCount = 0;

        for (const subscription of expiredSubscriptions) {
            // Обновляем статус на истекший
            subscription.status = 'expired';
            await subscription.save();
            expiredCount++;

            // Уменьшаем счетчик студентов в курсе
            if (subscription.subscription_type === 'course' && subscription.courseId) {
                await this.courseModel.findByIdAndUpdate(subscription.courseId, {
                    $inc: { current_students_count: -1 }
                }).exec();
            }

            // Отправляем уведомление пользователю
            try {
                const user = await this.userModel.findById(subscription.userId).exec();
                if (user && subscription.email_notifications) {
                    await this.emailService.sendSubscriptionExpirationNotification(
                        user.email,
                        user.name
                    );
                    notifiedCount++;
                }
            } catch (error) {
                this.logger.error(`Ошибка отправки уведомления об истечении: ${error.message}`);
            }
        }

        // Находим подписки, которые истекают в течение 7 дней
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        const expiringSoonSubscriptions = await this.subscriptionModel.find({
            status: 'active',
            end_date: { $gte: now, $lte: weekFromNow },
            email_notifications: true
        }).populate('userId', 'email name').exec();

        for (const subscription of expiringSoonSubscriptions) {
            try {
                const user = subscription.userId as any;
                if (user) {
                    await this.emailService.sendSubscriptionExpiringNotification(
                        user.email,
                        user.name,
                        subscription.end_date
                    );
                }
            } catch (error) {
                this.logger.error(`Ошибка отправки уведомления о скором истечении: ${error.message}`);
            }
        }

        this.logger.log(`Обработано истекших подписок: ${expiredCount}, уведомлений отправлено: ${notifiedCount}`);

        return { expiredCount, notifiedCount };
    }
}