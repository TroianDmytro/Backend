
// src/payment/monobank.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

// Интерфейсы для API Monobank
interface CreateInvoiceRequest {
    amount: number; // сума в мінімальних одиницях валюти (копійки для гривні)
    ccy?: number; // код валюти (980 - UAH, 840 - USD, 978 - EUR)
    merchantPaymInfo?: string; // призначення платежу
    redirectUrl?: string; // адреса для редіректу
    webHookUrl?: string; // адреса для отримання колбеків
    validity?: number; // строк дії в секундах (за замовчуванням 24 години)
    paymentType?: string; // тип операції (debit/hold)
}

interface CreateInvoiceResponse {
    invoiceId: string;
    pageUrl: string;
}

interface InvoiceStatus {
    invoiceId: string;
    status: string;
    amount: number;
    ccy: number;
    finalAmount?: number;
    createdDate: string;
    modifiedDate: string;
    reference?: string;
    approvalCode?: string;
    rrn?: string;
    cancelList?: any[];
    errCode?: string;
    errText?: string;
}

@Injectable()
export class MonobankService {
    private readonly logger = new Logger(MonobankService.name);
    private readonly baseUrl: string;
    private readonly token: string;
    private readonly webHookUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.baseUrl = 'https://api.monobank.ua/api/merchant';
        this.token = this.configService.get<string>('monobank.token')!;
        this.webHookUrl = this.configService.get<string>('monobank.webhookUrl')!;

        if (!this.token) {
            this.logger.warn('Monobank token не настроен в переменных окружения');
        }
    }

    /**
     * Создание инвойса в Monobank
     */
    async createInvoice(params: {
        amount: number; // в гривнах
        currency: string;
        description: string;
        subscriptionId: string;
        redirectUrl?: string;
    }): Promise<CreateInvoiceResponse> {
        try {
            // Конвертируем сумму в копейки
            const amountInMinorUnits = Math.round(params.amount * 100);

            // Определяем код валюты
            const currencyCode = this.getCurrencyCode(params.currency);

            const requestData: CreateInvoiceRequest = {
                amount: amountInMinorUnits,
                ccy: currencyCode,
                merchantPaymInfo: params.description,
                redirectUrl: params.redirectUrl || `${this.configService.get('app.frontendUrl')}/payment/success`,
                webHookUrl: this.webHookUrl,
                validity: 3600, // 1 час
                paymentType: 'debit'
            };

            this.logger.log(`Создание инвойса Monobank: ${JSON.stringify(requestData)}`);

            const response = await firstValueFrom(
                this.httpService.post<CreateInvoiceResponse>(
                    `${this.baseUrl}/invoice/create`,
                    requestData,
                    {
                        headers: {
                            'X-Token': this.token,
                            'Content-Type': 'application/json'
                        }
                    }
                )
            );

            this.logger.log(`Инвойс создан: ${response.data.invoiceId}`);
            return response.data;

        } catch (error) {
            this.logger.error(`Ошибка создания инвойса: ${error.message}`);
            if (error.response?.data) {
                this.logger.error(`Monobank error: ${JSON.stringify(error.response.data)}`);
            }
            throw new BadRequestException('Ошибка создания платежа');
        }
    }

    /**
     * Получение статуса инвойса
     */
    async getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus> {
        try {
            this.logger.log(`Получение статуса инвойса: ${invoiceId}`);

            const response = await firstValueFrom(
                this.httpService.get<InvoiceStatus>(
                    `${this.baseUrl}/invoice/status?invoiceId=${invoiceId}`,
                    {
                        headers: {
                            'X-Token': this.token
                        }
                    }
                )
            );

            return response.data;

        } catch (error) {
            this.logger.error(`Ошибка получения статуса инвойса: ${error.message}`);
            throw new BadRequestException('Ошибка получения статуса платежа');
        }
    }

    /**
     * Отмена инвойса
     */
    async cancelInvoice(invoiceId: string): Promise<{ status: string }> {
        try {
            this.logger.log(`Отмена инвойса: ${invoiceId}`);

            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.baseUrl}/invoice/cancel`,
                    { invoiceId },
                    {
                        headers: {
                            'X-Token': this.token,
                            'Content-Type': 'application/json'
                        }
                    }
                )
            );

            this.logger.log(`Инвойс отменен: ${invoiceId}`);
            return response.data;

        } catch (error) {
            this.logger.error(`Ошибка отмены инвойса: ${error.message}`);
            throw new BadRequestException('Ошибка отмены платежа');
        }
    }

    /**
     * Проверка подписи вебхука
     */
    verifyWebhookSignature(body: string, signature: string): boolean {
        if (!this.token) {
            this.logger.warn('Токен не настроен, пропускаем проверку подписи');
            return true; // В тестовом режиме
        }

        try {
            const expectedSignature = crypto
                .createHmac('sha256', this.token)
                .update(body)
                .digest('base64');

            return signature === expectedSignature;
        } catch (error) {
            this.logger.error(`Ошибка проверки подписи: ${error.message}`);
            return false;
        }
    }

    /**
     * Получение кода валюты
     */
    private getCurrencyCode(currency: string): number {
        const currencyMap = {
            'UAH': 980,
            'USD': 840,
            'EUR': 978
        };

        return currencyMap[currency] || 980; // По умолчанию UAH
    }

    /**
     * Получение статуса платежа в понятном формате
     */
    getPaymentStatusDescription(status: string): string {
        const statusMap = {
            'created': 'Создан',
            'processing': 'В обработке',
            'hold': 'Заблокирован',
            'success': 'Успешно оплачен',
            'failure': 'Не оплачен',
            'reversed': 'Возвращен',
            'expired': 'Истек срок действия'
        };

        return statusMap[status] || status;
    }
}