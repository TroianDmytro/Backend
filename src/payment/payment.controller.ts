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
    HttpStatus
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

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly monobankService: MonobankService
    ) { }

    /**
     * POST /payments/create - Создание платежа для подписки
     */
    @Post('create')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Создание платежа для подписки',
        description: 'Создает платеж через Monobank для указанной подписки'
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
    async createPayment(
        @Body() createPaymentDto: any,
        @Request() req?
    ) {
        // const currentUserId = req?.user?.userId;
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT

        this.logger.log(`Создание платежа для подписки: ${createPaymentDto.subscriptionId}`);

        const result = await this.paymentService.createPayment(createPaymentDto);

        return {
            message: 'Платеж создан успешно',
            payment: result.payment,
            pageUrl: result.pageUrl
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
            statusDescription: this.monobankService.getPaymentStatusDescription(payment?.status || '')
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
}
