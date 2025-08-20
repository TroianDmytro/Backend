//src/payment/payment.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    Logger,
    BadRequestException,
    Headers,
    HttpCode,
    HttpStatus,
    Res,
    SetMetadata
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { MonobankService } from './monobank.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly monobankService: MonobankService
    ) { }


    //Страница, на которую перенаправляет Monobank после оплаты
    @Get('success')
    @Public()
    @ApiOperation({
        summary: 'Страница успешной оплаты',
        description: 'Страница, на которую перенаправляет Monobank после оплаты',
    })
    @ApiResponse({ status: 200, description: 'Страница успешной оплаты' })
    async paymentSuccess(
        @Query('invoiceId') invoiceId: string,
        @Query('status') status: string,
        @Res() res: Response
    ) {
        this.logger.log(`Обработка успешного платежа. Invoice ID: ${invoiceId}, Status: ${status}`);

        if (!invoiceId) {
            return res.send(this.getGeneralSuccessPage());
        }

        try {
            const payment = await this.paymentService.findByInvoiceId(invoiceId);

            if (payment) {
                if (status === 'success' && payment.status !== 'success') {
                    await this.paymentService.syncPaymentStatus(invoiceId);
                }
                return res.send(this.getPaymentSuccessPage(payment, invoiceId));
            } else {
                const monobankStatus = await this.monobankService.getInvoiceStatus(invoiceId);
                return res.send(this.getPaymentStatusPage(monobankStatus));
            }
        } catch (error) {
            this.logger.error(`Ошибка при обработке успешного платежа: ${error.message}`);
            return res.send(this.getErrorPage(error.message));
        }
    }

    /**
     * ✅ Публичная страница ошибки оплаты
     */
    @Get('failure')
    @Public()
    @ApiOperation({
        summary: 'Страница ошибки оплаты',
        description: 'Страница, на которую перенаправляет Monobank при ошибке оплаты',
    })
    @ApiResponse({ status: 200, description: 'Страница ошибки оплаты' })
    async paymentFailure(@Query('invoiceId') invoiceId: string, @Res() res: Response) {
        this.logger.warn(`Оплата не удалась. Invoice ID: ${invoiceId}`);
        return res.send(this.getErrorPage(`Оплата не удалась. Invoice ID: ${invoiceId}`));
    }

    /**
     * POST /payments/create - Создание платежа
     */
    @Post('create')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Создание платежа',
        description: 'Создает платеж через Monobank для указанной подписки',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                subscriptionId: { type: 'string', description: 'ID подписки' },
                amount: { type: 'number', description: 'Сумма платежа в гривнах' },
                currency: { type: 'string', enum: ['UAH', 'USD', 'EUR'], description: 'Валюта' },
                description: { type: 'string', description: 'Описание платежа' },
                redirectUrl: { type: 'string', description: 'URL для редиректа после оплаты' }
            },
            required: ['subscriptionId', 'amount', 'currency', 'description']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Платеж создан',
        schema: {
            type: 'object',
            properties: {
                payment: { type: 'object' },
                pageUrl: { type: 'string', description: 'URL страницы оплаты' }
            }
        }
    })
    async createPayment(@Body() createPaymentDto: any, @Request() req?) {
        const currentUserId = req?.user?.userId || 'temp-user-id';

        this.logger.log(`Создание платежа для подписки: ${createPaymentDto.subscriptionId}`);

        const result = await this.paymentService.createPayment(createPaymentDto);

        return {
            message: 'Платеж создан успешно',
            payment: result.payment,
            pageUrl: result.pageUrl,
        };
    }

    /**
     * GET /payments/:id - Получение платежа по ID
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получение платежа по ID' })
    @ApiParam({ name: 'id', description: 'ID платежа' })
    @ApiResponse({ status: 200, description: 'Данные платежа' })
    async getPaymentById(@Param('id') id: string) {
        const payment = await this.paymentService.findById(id);

        return {
            payment,
            statusDescription: this.monobankService.getPaymentStatusDescription(payment?.status || ''),
        };
    }

    /**
     * GET /payments/subscription/:subscriptionId - Получение платежей подписки
     */
    @Get('subscription/:subscriptionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получение платежей подписки' })
    @ApiParam({ name: 'subscriptionId', description: 'ID подписки' })
    async getSubscriptionPayments(@Param('subscriptionId') subscriptionId: string) {
        const payments = await this.paymentService.getSubscriptionPayments(subscriptionId);

        return {
            subscriptionId,
            payments: payments.map(payment => ({
                ...payment.toJSON(),
                statusDescription: this.monobankService.getPaymentStatusDescription(payment.status)
            })),
            totalPayments: payments.length
        };
    }

    /**
     * GET /payments/user/:userId - Получение платежей пользователя
     */
    @Get('user/:userId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получение платежей пользователя' })
    @ApiParam({ name: 'userId', description: 'ID пользователя' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getUserPayments(
        @Param('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const result = await this.paymentService.getUserPayments(userId, page, limit);

        return {
            userId,
            payments: result.payments.map(payment => ({
                ...payment.toJSON(),
                statusDescription: this.monobankService.getPaymentStatusDescription(payment.status)
            })),
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * PUT /payments/:id/cancel - Отмена платежа
     */
    @Put(':id/cancel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Отмена платежа' })
    @ApiParam({ name: 'id', description: 'ID платежа' })
    async cancelPayment(@Param('id') id: string) {
        this.logger.log(`Отмена платежа: ${id}`);

        const payment = await this.paymentService.cancelPayment(id);

        return {
            message: 'Платеж отменен',
            payment
        };
    }

    /**
     * POST /payments/webhook - Вебхук от Monobank
     */
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Вебхук от Monobank',
        description: 'Обработка уведомлений о статусе платежей от Monobank'
    })
    async handleWebhook(
        @Body() body: any,
        @Headers('x-sign') signature?: string
    ) {
        this.logger.log(`Получен вебхук от Monobank: ${JSON.stringify(body)}`);

        // Проверяем подпись (в production обязательно)
        const bodyString = JSON.stringify(body);
        if (signature && !this.monobankService.verifyWebhookSignature(bodyString, signature)) {
            this.logger.warn('Неверная подпись вебхука');
            throw new BadRequestException('Invalid signature');
        }

        try {
            await this.paymentService.processWebhook(body);
            return { status: 'ok' };
        } catch (error) {
            this.logger.error(`Ошибка обработки вебхука: ${error.message}`);
            throw new BadRequestException('Webhook processing failed');
        }
    }

    /**
     * POST /payments/:invoiceId/sync - Синхронизация статуса платежа
     */
    @Post(':invoiceId/sync')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Синхронизация статуса платежа',
        description: 'Принудительная синхронизация статуса платежа с Monobank'
    })
    @ApiParam({ name: 'invoiceId', description: 'Invoice ID в Monobank' })
    async syncPaymentStatus(@Param('invoiceId') invoiceId: string) {
        this.logger.log(`Синхронизация статуса платежа: ${invoiceId}`);

        const payment = await this.paymentService.syncPaymentStatus(invoiceId);

        return {
            message: 'Статус платежа синхронизирован',
            payment: {
                ...payment.toJSON(),
                statusDescription: this.monobankService.getPaymentStatusDescription(payment.status)
            }
        };
    }



    /**
     * HTML страница успешной оплаты с деталями
     */
    private getPaymentSuccessPage(payment: any, invoiceId: string): string {
        return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Платеж успешно выполнен</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 500px;
                width: 100%;
                padding: 40px;
                text-align: center;
                animation: slideUp 0.5s ease-out;
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .success-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
                }
            }
            .checkmark {
                color: white;
                font-size: 40px;
                animation: scaleIn 0.5s ease-out 0.3s both;
            }
            @keyframes scaleIn {
                from {
                    transform: scale(0);
                }
                to {
                    transform: scale(1);
                }
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 28px;
            }
            .status {
                color: #4CAF50;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
            }
            .details {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                color: #6c757d;
                font-size: 14px;
            }
            .detail-value {
                color: #333;
                font-weight: 600;
                font-size: 14px;
            }
            .amount {
                color: #4CAF50;
                font-size: 32px;
                font-weight: bold;
                margin: 20px 0;
            }
            .currency {
                font-size: 20px;
                color: #6c757d;
            }
            .actions {
                margin-top: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                margin: 10px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .primary-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .primary-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            .secondary-button {
                background: #f8f9fa;
                color: #495057;
                border: 2px solid #dee2e6;
            }
            .secondary-button:hover {
                background: #e9ecef;
            }
            .info-message {
                background: #d1ecf1;
                color: #0c5460;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">
                <span class="checkmark">✓</span>
            </div>
            
            <h1>Платеж выполнен!</h1>
            <div class="status">Успешно оплачено</div>
            
            <div class="amount">
                ${payment.amount / 100} <span class="currency">${payment.currency}</span>
            </div>
            
            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">ID платежа:</span>
                    <span class="detail-value">${invoiceId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Описание:</span>
                    <span class="detail-value">${payment.description || 'Оплата подписки'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Дата:</span>
                    <span class="detail-value">${new Date().toLocaleString('ru-RU')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Статус:</span>
                    <span class="detail-value" style="color: #4CAF50;">✅ Оплачено</span>
                </div>
            </div>
            
            <div class="info-message">
                💡 Подписка активирована! Вы получите письмо с подтверждением на вашу электронную почту.
            </div>
            
            <div class="actions">
                <a href="https://neuronest.pp.ua/dashboard" class="button primary-button">
                    Перейти в личный кабинет
                </a>
                <a href="https://neuronest.pp.ua/subscriptions" class="button secondary-button">
                    Мои подписки
                </a>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    /**
     * Общая страница успеха (когда нет invoiceId)
     */
    private getGeneralSuccessPage(): string {
        return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Операция выполнена успешно</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .success-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: #4CAF50;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .checkmark {
                color: white;
                font-size: 40px;
            }
            h1 {
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                color: #666;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">
                <span class="checkmark">✓</span>
            </div>
            <h1>Успешно!</h1>
            <p class="message">Операция выполнена успешно</p>
            <a href="https://neuronest.pp.ua" class="button">На главную</a>
        </div>
    </body>
    </html>
    `;
    }

    /**
     * Страница с информацией о статусе из Monobank
     */
    private getPaymentStatusPage(status: any): string {
        const statusText = this.monobankService.getPaymentStatusDescription(status.status);
        const statusColor = status.status === 'success' ? '#4CAF50' : '#f44336';

        return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Статус платежа</title>
        <style>
            /* Используем те же стили */
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Статус платежа</h1>
            <p style="color: ${statusColor}; font-size: 24px; font-weight: bold;">
                ${statusText}
            </p>
            <p>ID инвойса: ${status.invoiceId}</p>
            <p>Сумма: ${status.amount / 100} ${status.ccy === 980 ? 'UAH' : 'USD'}</p>
        </div>
    </body>
    </html>
    `;
    }

    /**
     * Страница ошибки
     */
    private getErrorPage(error: string): string {
        return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ошибка</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                text-align: center;
            }
            .error-icon {
                color: #f44336;
                font-size: 48px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">⚠️</div>
            <h1>Произошла ошибка</h1>
            <p>${error}</p>
            <a href="https://neuronest.pp.ua">Вернуться на главную</a>
        </div>
    </body>
    </html>
    `;
    }
}
