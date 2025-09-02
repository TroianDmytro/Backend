//src/payment/payment.service.ts
import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Subscription, SubscriptionDocument } from '../subscriptions/schemas/subscription.schema';
import { MonobankService } from './monobank.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

interface CreatePaymentDto {
    subscriptionId: string;
    amount: number;
    currency: string;
    description: string;
    redirectUrl?: string;
}

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
        private readonly monobankService: MonobankService,
        private readonly subscriptionsService: SubscriptionsService
    ) { }

    /**
     * Создание платежа для подписки
     */
    async createPayment(createPaymentDto: CreatePaymentDto): Promise<{
        payment: PaymentDocument;
        pageUrl: string;
    }> {
        const { subscriptionId, amount, currency, description, redirectUrl } = createPaymentDto;

        // Проверяем существование подписки
        const subscription = await this.subscriptionModel.findById(subscriptionId).exec();
        if (!subscription) {
            throw new NotFoundException('Подписка не найдена');
        }

        // Проверяем, что подписка не оплачена
        if (subscription.status) {
            throw new BadRequestException('Подписка уже оплачена');
        }

        try {
            // Создаем инвойс в Monobank
            const monobankResponse = await this.monobankService.createInvoice({
                amount,
                currency,
                description,
                subscriptionId,
                redirectUrl
            });

            // Создаем запись платежа в БД
            const payment = new this.paymentModel({
                subscriptionId,
                userId: subscription.user,
                invoiceId: monobankResponse.invoiceId,
                pageUrl: monobankResponse.pageUrl,
                amount: Math.round(amount * 100), // в копейках
                currency,
                status: 'created',
                description,
                merchantPaymInfo: description,
                monobankResponse
            });

            const savedPayment = await payment.save();

            this.logger.log(`Создан платеж: ${savedPayment.id} для подписки ${subscriptionId}`);

            return {
                payment: savedPayment,
                pageUrl: monobankResponse.pageUrl
            };

        } catch (error) {
            this.logger.error(`Ошибка создания платежа: ${error.message}`);
            throw error;
        }
    }

    /**
     * Получение платежа по ID
     */
    async findById(paymentId: string): Promise<PaymentDocument | null> {
        return this.paymentModel
            .findById(paymentId)
            .populate('subscriptionId')
            .populate('userId', 'email name second_name')
            .exec();
    }

    /**
     * Получение платежа по invoiceId
     */
    async findByInvoiceId(invoiceId: string): Promise<PaymentDocument | null> {
        return this.paymentModel
            .findOne({ invoiceId })
            .populate('subscriptionId')
            .populate('userId', 'email name second_name')
            .exec();
    }

    /**
     * Обновление статуса платежа
     */
    async updatePaymentStatus(invoiceId: string, status: string, additionalData?: any): Promise<PaymentDocument> {
        const payment = await this.findByInvoiceId(invoiceId);
        if (!payment) {
            throw new NotFoundException(`Платеж с invoiceId ${invoiceId} не найден`);
        }

        payment.status = status;

        if (additionalData) {
            if (additionalData.reference) payment.reference = additionalData.reference;
            if (additionalData.approvalCode) payment.approvalCode = additionalData.approvalCode;
            if (additionalData.rrn) payment.rrn = additionalData.rrn;
            if (additionalData.failureReason) payment.failureReason = additionalData.failureReason;
        }

        if (status === 'success') {
            payment.paidAt = new Date();

            // Активируем подписку
            try {
                await this.subscriptionsService.activate(
                    payment.subscriptionId.toString(),
                    invoiceId,
                    'monobank'
                );
                this.logger.log(`Подписка ${payment.subscriptionId} активирована после оплаты`);
            } catch (error) {
                this.logger.error(`Ошибка активации подписки: ${error.message}`);
            }
        }

        const updatedPayment = await payment.save();
        this.logger.log(`Обновлен статус платежа ${payment.id}: ${status}`);

        return updatedPayment;
    }

    /**
     * Обработка вебхука от Monobank
     */
    async processWebhook(webhookData: any): Promise<void> {
        const { invoiceId, status, amount, finalAmount, reference, approvalCode, rrn, errCode, errText } = webhookData;

        this.logger.log(`Получен вебхук для инвойса ${invoiceId}: статус ${status}`);

        const payment = await this.findByInvoiceId(invoiceId);
        if (!payment) {
            this.logger.warn(`Платеж с invoiceId ${invoiceId} не найден в БД`);
            return;
        }

        // Обновляем статус платежа
        const additionalData: any = {
            reference,
            approvalCode,
            rrn
        };

        if (status === 'failure' && (errCode || errText)) {
            additionalData.failureReason = `${errCode}: ${errText}`;
        }

        await this.updatePaymentStatus(invoiceId, status, additionalData);
    }

    /**
     * Отмена платежа
     */
    async cancelPayment(paymentId: string): Promise<PaymentDocument> {
        const payment = await this.findById(paymentId);
        if (!payment) {
            throw new NotFoundException('Платеж не найден');
        }

        if (payment.status === 'success') {
            throw new BadRequestException('Нельзя отменить успешно оплаченный платеж');
        }

        try {
            // Отменяем инвойс в Monobank
            await this.monobankService.cancelInvoice(payment.invoiceId);

            // Обновляем статус в БД
            return this.updatePaymentStatus(payment.invoiceId, 'cancelled');
        } catch (error) {
            this.logger.error(`Ошибка отмены платежа: ${error.message}`);
            throw error;
        }
    }

    /**
     * Получение платежей подписки
     */
    async getSubscriptionPayments(subscriptionId: string): Promise<PaymentDocument[]> {
        return this.paymentModel
            .find({ subscriptionId })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Получение платежей пользователя
     */
    async getUserPayments(userId: string, page: number = 1, limit: number = 10): Promise<{
        payments: PaymentDocument[];
        totalItems: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        const [payments, totalItems] = await Promise.all([
            this.paymentModel
                .find({ userId })
                .populate('subscriptionId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.paymentModel.countDocuments({ userId }).exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return { payments, totalItems, totalPages };
    }

    /**
     * Синхронизация статуса платежа с Monobank
     */
    async syncPaymentStatus(invoiceId: string): Promise<PaymentDocument> {
        const payment = await this.findByInvoiceId(invoiceId);
        if (!payment) {
            throw new NotFoundException('Платеж не найден');
        }

        try {
            const status = await this.monobankService.getInvoiceStatus(invoiceId);

            const additionalData = {
                reference: status.reference,
                approvalCode: status.approvalCode,
                rrn: status.rrn,
                failureReason: status.errText
            };

            return this.updatePaymentStatus(invoiceId, status.status, additionalData);
        } catch (error) {
            this.logger.error(`Ошибка синхронизации статуса платежа: ${error.message}`);
            throw error;
        }
    }
}