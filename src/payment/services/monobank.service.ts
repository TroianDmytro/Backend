// src/payment/services/monobank.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

export interface MonobankInvoiceRequest {
    amount: number; // Сумма в копейках
    currency?: string; // Код валюты (980 - UAH, 840 - USD, 978 - EUR)
    merchantPaymInfo: {
        reference: string; // Уникальный ID платежа в нашей системе
        destination: string; // Назначение платежа
        comment?: string; // Комментарий
        customerEmails?: string[]; // Email клиентов для отправки чека
    };
    redirectUrl?: string; // URL для редиректа после оплаты
    webHookUrl?: string; // URL webhook
    validity?: number; // Срок действия в секундах (по умолчанию 24 часа)
    paymentType?: 'debit' | 'hold'; // Тип операции
}

export interface MonobankInvoiceResponse {
    invoiceId: string; // ID инвойса
    pageUrl: string; // URL страницы оплаты
}

export interface MonobankWebhookData {
    invoiceId: string;
    status: 'processing' | 'hold' | 'success' | 'failure' | 'reversed';
    amount?: number;
    approvalCode?: string;
    rrn?: string; // ID транзакции
    failureReason?: string;
    reference?: Record<string, any>;
}

@Injectable()
export class MonobankService {
    private readonly logger = new Logger(MonobankService.name);
    private readonly httpClient: AxiosInstance;
    private readonly token: string;
    private readonly baseUrl: string;
    private readonly webhookUrl: string;
    private readonly isTestMode: boolean;

    constructor(private readonly configService: ConfigService) {
        this.token = this.configService.get<string>('monobank.token')!;
        this.baseUrl = this.configService.get<string>('monobank.baseUrl')!;
        this.webhookUrl = this.configService.get<string>('monobank.webhookUrl')!;
        this.isTestMode = this.configService.get<boolean>('monobank.isTestMode', true);

        if (!this.token) {
            this.logger.error('Monobank token не настроен');
            throw new Error('Monobank token is required');
        }

        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-Token': this.token,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 секунд таймаут
        });

        // Логирование запросов в тестовом режиме
        if (this.isTestMode) {
            this.httpClient.interceptors.request.use(request => {
                this.logger.debug(`Monobank Request: ${request.method?.toUpperCase()} ${request.url}`);
                this.logger.debug('Request data:', JSON.stringify(request.data, null, 2));
                return request;
            });

            this.httpClient.interceptors.response.use(
                response => {
                    this.logger.debug(`Monobank Response: ${response.status}`);
                    this.logger.debug('Response data:', JSON.stringify(response.data, null, 2));
                    return response;
                },
                error => {
                    this.logger.error(`Monobank Error: ${error.response?.status}`);
                    this.logger.error('Error data:', JSON.stringify(error.response?.data, null, 2));
                    return Promise.reject(error);
                }
            );
        }

        this.logger.log(`Monobank сервис инициализирован. Тестовый режим: ${this.isTestMode}`);
    }

    /**
     * Создание инвойса для оплаты
     */
    async createInvoice(request: MonobankInvoiceRequest): Promise<MonobankInvoiceResponse> {
        try {
            this.logger.log(`Создание инвойса для платежа ${request.merchantPaymInfo.reference}`);

            // Подготовка данных для запроса
            const invoiceData = {
                amount: request.amount,
                ccy: this.getCurrencyCode(request.currency || 'UAH'),
                merchantPaymInfo: {
                    reference: request.merchantPaymInfo.reference,
                    destination: request.merchantPaymInfo.destination,
                    comment: request.merchantPaymInfo.comment,
                    customerEmails: request.merchantPaymInfo.customerEmails
                },
                redirectUrl: request.redirectUrl,
                webHookUrl: request.webHookUrl || this.webhookUrl,
                validity: request.validity || 86400, // 24 часа по умолчанию
                paymentType: request.paymentType || 'debit'
            };

            const response = await this.httpClient.post('/merchant/invoice/create', invoiceData);

            this.logger.log(`Инвойс создан: ${response.data.invoiceId}`);

            return {
                invoiceId: response.data.invoiceId,
                pageUrl: response.data.pageUrl
            };

        } catch (error) {
            this.logger.error('Ошибка создания инвойса:', error.response?.data || error.message);
            throw new BadRequestException(
                error.response?.data?.errorDescription || 'Ошибка создания платежа'
            );
        }
    }

    /**
     * Получение статуса инвойса
     */
    async getInvoiceStatus(invoiceId: string): Promise<any> {
        try {
            this.logger.log(`Получение статуса инвойса: ${invoiceId}`);

            const response = await this.httpClient.get(`/merchant/invoice/status?invoiceId=${invoiceId}`);

            return response.data;

        } catch (error) {
            this.logger.error(`Ошибка получения статуса инвойса ${invoiceId}:`, error.response?.data || error.message);
            throw new BadRequestException(
                error.response?.data?.errorDescription || 'Ошибка получения статуса платежа'
            );
        }
    }

    /**
     * Отмена инвойса
     */
    async cancelInvoice(invoiceId: string): Promise<boolean> {
        try {
            this.logger.log(`Отмена инвойса: ${invoiceId}`);

            await this.httpClient.post('/merchant/invoice/cancel', { invoiceId });

            this.logger.log(`Инвойс ${invoiceId} отменен`);
            return true;

        } catch (error) {
            this.logger.error(`Ошибка отмены инвойса ${invoiceId}:`, error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Возврат средств
     */
    async refundPayment(invoiceId: string, amount?: number, comment?: string): Promise<any> {
        try {
            this.logger.log(`Возврат средств по инвойсу: ${invoiceId}, сумма: ${amount || 'полная'}`);

            const refundData = {
                invoiceId,
                ...(amount && { amount }),
                ...(comment && { comment })
            };

            const response = await this.httpClient.post('/merchant/invoice/refund', refundData);

            this.logger.log(`Возврат создан: ${response.data}`);
            return response.data;

        } catch (error) {
            this.logger.error(`Ошибка возврата по инвойсу ${invoiceId}:`, error.response?.data || error.message);
            throw new BadRequestException(
                error.response?.data?.errorDescription || 'Ошибка создания возврата'
            );
        }
    }

    /**
     * Проверка подписи webhook
     */
    verifyWebhookSignature(body: string, signature: string): boolean {
        try {
            if (this.isTestMode) {
                this.logger.debug('Тестовый режим: пропуск проверки подписи webhook');
                return true;
            }

            const expectedSignature = crypto
                .createHmac('sha256', this.token)
                .update(body)
                .digest('hex');

            const isValid = signature === expectedSignature;

            if (!isValid) {
                this.logger.warn('Неверная подпись webhook');
                this.logger.debug(`Ожидаемая подпись: ${expectedSignature}`);
                this.logger.debug(`Полученная подпись: ${signature}`);
            }

            return isValid;

        } catch (error) {
            this.logger.error('Ошибка проверки подписи webhook:', error.message);
            return false;
        }
    }

    /**
     * Получение информации о мерчанте
     */
    async getMerchantInfo(): Promise<any> {
        try {
            this.logger.log('Получение информации о мерчанте');

            const response = await this.httpClient.get('/merchant/details');

            return response.data;

        } catch (error) {
            this.logger.error('Ошибка получения информации о мерчанте:', error.response?.data || error.message);
            throw new BadRequestException(
                error.response?.data?.errorDescription || 'Ошибка получения информации о мерчанте'
            );
        }
    }

    /**
     * Получение выписки по платежам за период
     */
    async getPaymentStatement(from: Date, to?: Date): Promise<any> {
        try {
            const fromTimestamp = Math.floor(from.getTime() / 1000);
            const toTimestamp = to ? Math.floor(to.getTime() / 1000) : Math.floor(Date.now() / 1000);

            this.logger.log(`Получение выписки с ${from.toISOString()} по ${to?.toISOString() || 'сейчас'}`);

            const response = await this.httpClient.get(
                `/merchant/statement?from=${fromTimestamp}&to=${toTimestamp}`
            );

            return response.data;

        } catch (error) {
            this.logger.error('Ошибка получения выписки:', error.response?.data || error.message);
            throw new BadRequestException(
                error.response?.data?.errorDescription || 'Ошибка получения выписки'
            );
        }
    }

    /**
     * Преобразование кода валюты в числовой код для Monobank
     */
    private getCurrencyCode(currency: string): number {
        const codes = {
            'UAH': 980,
            'USD': 840,
            'EUR': 978
        };

        return codes[currency] || 980; // UAH по умолчанию
    }

    /**
     * Форматирование суммы в копейки
     */
    formatAmountToKopecks(amount: number, currency: string = 'UAH'): number {
        // Для UAH сумма уже в копейках
        if (currency === 'UAH') {
            return Math.round(amount);
        }

        // Для USD и EUR умножаем на 100 (центы)
        return Math.round(amount * 100);
    }

    /**
     * Форматирование суммы из копеек в основную валюту
     */
    formatAmountFromKopecks(amount: number, currency: string = 'UAH'): number {
        if (currency === 'UAH') {
            return amount / 100;
        }

        return amount / 100;
    }

    /**
     * Проверка доступности API Monobank
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.getMerchantInfo();
            return true;
        } catch (error) {
            this.logger.error('Monobank API недоступен:', error.message);
            return false;
        }
    }
}

/**
 * Объяснение сервиса Monobank:
 * 
 * 1. **ОСНОВНЫЕ МЕТОДЫ:**
 *    - createInvoice() - создание инвойса для оплаты
 *    - getInvoiceStatus() - получение статуса платежа
 *    - cancelInvoice() - отмена неоплаченного инвойса
 *    - refundPayment() - возврат средств
 * 
 * 2. **БЕЗОПАСНОСТЬ:**
 *    - verifyWebhookSignature() - проверка подписи webhook
 *    - Защищенное хранение токена в конфигурации
 * 
 * 3. **ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ:**
 *    - getCurrencyCode() - преобразование валют
 *    - formatAmountToKopecks() - форматирование сумм
 *    - healthCheck() - проверка доступности API
 * 
 * 4. **ЛОГИРОВАНИЕ:**
 *    - Подробное логирование в тестовом режиме
 *    - Отслеживание всех операций
 * 
 * 5. **ОБРАБОТКА ОШИБОК:**
 *    - Информативные сообщения об ошибках
 *    - Graceful handling недоступности API
 */