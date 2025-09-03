// src/subscriptions/subscriptions.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    Logger,
    NotFoundException,
    BadRequestException
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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { SubscriptionFilterDto } from './dto/subscription-filter.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentService } from '../payment/payment.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { SubscriptionStatus } from './schemas/subscription.schema';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard) // Закомментировано для работы без JWT
@ApiBearerAuth()
export class SubscriptionsController {
    private readonly logger = new Logger(SubscriptionsController.name);

    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly paymentService: PaymentService
    ) { }

    /**
     * POST /subscriptions - Создание новой подписки
     */
    @Post()
    @UseGuards(RolesGuard)
    @Roles('user')
    @ApiOperation({
        summary: 'Создание новой подписки',
        description: 'Создает подписку на курс или на определенный период'
    })
    @ApiResponse({
        status: 201,
        description: 'Подписка успешно создана',
        type: SubscriptionResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Подписка уже существует' })
    @ApiBody({ type: CreateSubscriptionDto })
    async createSubscription(
        @Body() createSubscriptionDto: CreateSubscriptionDto,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Создание подписки для пользователя: ${createSubscriptionDto.userId}`);

        const subscription = await this.subscriptionsService.create(createSubscriptionDto);

        return {
            message: 'Подписка успешно создана',
            subscription: subscription
        };
    }


    //GET /subscriptions - Получение списка подписок с фильтрацией
    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Получение списка подписок',
        description: 'Возвращает список подписок с возможностью фильтрации'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы (по умолчанию 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице (по умолчанию 10)' })
    @ApiQuery({ name: 'userId', required: false, type: String, description: 'Фильтр по пользователю' })
    @ApiQuery({ name: 'courseId', required: false, type: String, description: 'Фильтр по курсу' })
    @ApiQuery({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled', 'pending'], description: 'Фильтр по статусу' })
    @ApiQuery({ name: 'subscription_type', required: false, enum: ['course', 'period'], description: 'Фильтр по типу подписки' })
    @ApiQuery({ name: 'is_paid', required: false, type: Boolean, description: 'Только оплаченные подписки' })
    @ApiResponse({
        status: 200,
        description: 'Список подписок',
        type: [SubscriptionResponseDto]
    })
    async getAllSubscriptions(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query() filters: SubscriptionFilterDto,
        @Request() req?
    ) {
        // const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        // const isAdmin = true; // Временно для работы без JWT

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

    /**
     * GET /subscriptions/:id - Получение подписки по ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Получение подписки по ID',
        description: 'Возвращает подробную информацию о подписке'
    })
    @ApiParam({ name: 'id', description: 'ID подписки' })
    @ApiResponse({
        status: 200,
        description: 'Данные подписки',
        type: SubscriptionResponseDto
    })
    @ApiResponse({ status: 404, description: 'Подписка не найдена' })
    async getSubscriptionById(
        @Param('id') id: string,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Запрос подписки с ID: ${id}`);

        const subscription = await this.subscriptionsService.findById(id);
        if (!subscription) {
            throw new NotFoundException('Подписка не найдена');
        }

        return { subscription };
    }

    /**
     * PUT /subscriptions/:id - Обновление подписки
     */
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Обновление подписки',
        description: 'Обновляет данные подписки. Пользователь может редактировать только свои подписки.'
    })
    @ApiParam({ name: 'id', description: 'ID подписки' })
    @ApiBody({ type: UpdateSubscriptionDto })
    @ApiResponse({
        status: 200,
        description: 'Подписка успешно обновлена',
        type: SubscriptionResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 403, description: 'Нет прав на редактирование' })
    @ApiResponse({ status: 404, description: 'Подписка не найдена' })
    async updateSubscription(
        @Param('id') id: string,
        @Body() updateSubscriptionDto: UpdateSubscriptionDto,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Обновление подписки с ID: ${id}`);

        const updatedSubscription = await this.subscriptionsService.update(id, updateSubscriptionDto, currentUserId, isAdmin);

        return {
            message: 'Подписка успешно обновлена',
            subscription: updatedSubscription
        };
    }


    /**
     * DELETE /subscriptions/:id - Удаление подписки
     */
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Удаление подписки',
        description: 'Полностью удаляет подписку из системы (только для админов)'
    })
    @ApiParam({ name: 'id', description: 'ID подписки' })
    @ApiResponse({ status: 200, description: 'Подписка успешно удалена' })
    @ApiResponse({ status: 403, description: 'Нет прав на удаление' })
    @ApiResponse({ status: 404, description: 'Подписка не найдена' })
    async deleteSubscription(@Param('id') id: string) {
        this.logger.log(`Удаление подписки с ID: ${id}`);

        await this.subscriptionsService.delete(id);

        return {
            message: 'Подписка успешно удалена'
        };
    }

    /**
     * POST /subscriptions/:id/cancel - Отмена подписки
     */
    @Post(':id/cancel')
    @UseGuards(RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Отмена подписки',
        description: 'Отменяет подписку с указанием причины'
    })
    @ApiParam({ name: 'id', description: 'ID подписки' })
    @ApiBody({ type: CancelSubscriptionDto })
    @ApiResponse({ status: 200, description: 'Подписка успешно отменена' })
    @ApiResponse({ status: 404, description: 'Подписка не найдена' })
    @ApiResponse({ status: 409, description: 'Подписка уже отменена' })
    async cancelSubscription(
        @Param('id') id: string,
        @Body() cancelDto: CancelSubscriptionDto,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Отмена подписки ${id}. Причина: ${cancelDto.reason}`);

        const cancelledSubscription = await this.subscriptionsService.cancel(
            id,
            cancelDto.reason,
            currentUserId,
            isAdmin,
            cancelDto.immediate
        );

        return {
            message: cancelDto.immediate
                ? 'Подписка немедленно отменена'
                : 'Подписка будет отменена в конце периода',
            subscription: cancelledSubscription
        };
    }


    /**
     * POST /subscriptions/:id/renew - Продление подписки
     */
    @Post(':id/renew')
    @UseGuards(RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Продление подписки',
        description: 'Продлевает подписку на следующий период'
    })
    @ApiParam({ name: 'id', description: 'ID подписки' })
    @ApiBody({
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
    })
    @ApiResponse({
        status: 200,
        description: 'Подписка успешно продлена',
        type: SubscriptionResponseDto
    })
    @ApiResponse({ status: 404, description: 'Подписка не найдена' })
    @ApiResponse({ status: 409, description: 'Подписка не может быть продлена' })
    async renewSubscription(
        @Param('id') id: string,
        @Body('period') period: '1_month' | '3_months' | '6_months' | '12_months',
        @Body('auto_renewal') autoRenewal: boolean = false,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Продление подписки ${id} на период: ${period}`);

        const renewedSubscription = await this.subscriptionsService.renew(
            id,
            period,
            autoRenewal,
            currentUserId,
            isAdmin
        );

        return {
            message: 'Подписка успешно продлена',
            subscription: renewedSubscription
        };
    }

    /**
     * POST /subscriptions/:id/activate - Активация подписки
     */
    @Post(':id/activate')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Активация подписки',
        description: 'Активирует подписку после оплаты (только для админов)'
    })
    @ApiParam({ name: 'id', description: 'ID подписки' })
    @ApiBody({
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
    })
    @ApiResponse({ status: 200, description: 'Подписка успешно активирована' })
    @ApiResponse({ status: 404, description: 'Подписка не найдена' })
    async activateSubscription(
        @Param('id') id: string,
        @Body('payment_transaction_id') transactionId: string,
        @Body('payment_method') paymentMethod?: string
    ) {
        this.logger.log(`Активация подписки ${id}. Транзакция: ${transactionId}`);

        const activatedSubscription = await this.subscriptionsService.activate(
            id,
            transactionId,
            paymentMethod
        );

        return {
            message: 'Подписка успешно активирована',
            subscription: activatedSubscription
        };
    }


    //***POST /subscriptions/:id/pay - Создание платежа для подписки
    @Post(':id/pay')
    @UseGuards(RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Создание платежа для подписки',
        description: 'Создает платеж через Monobank для указанной подписки'
    })
    @ApiParam({ name: 'id', description: 'ID подписки' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                currency: {
                    type: 'string',
                    enum: ['UAH', 'USD', 'EUR'],
                    default: 'UAH',
                    description: 'Валюта платежа'
                },
                redirectUrl: {
                    type: 'string',
                    description: 'URL для редиректа после оплаты',
                    example: 'https://mysite.com/payment/success'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Платеж создан',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                paymentId: { type: 'string', description: 'ID созданного платежа' },
                pageUrl: { type: 'string', description: 'URL страницы оплаты Monobank' },
                amount: { type: 'number', description: 'Сумма платежа' },
                currency: { type: 'string', description: 'Валюта' },
                subscription: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { type: 'string' },
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Подписка уже оплачена или недоступна для оплаты' })
    @ApiResponse({ status: 404, description: 'Подписка не найдена' })
    async createSubscriptionPayment(
        @Param('id') subscriptionId: string,
        @Body('currency') currency: string = 'UAH',
        @Body('redirectUrl') redirectUrl?: string,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Создание платежа для подписки: ${subscriptionId}`);

        // Получаем подписку
        const subscription = await this.subscriptionsService.findById(subscriptionId);
        if (!subscription) {
            throw new NotFoundException('Подписка не найдена');
        }

        // Проверяем, что подписка не оплачена
        if (subscription.status) {
            throw new BadRequestException('Подписка уже оплачена');
        }

        // ИСПРАВЛЕНО: используем инжектированный PaymentService
        const result = await this.paymentService.createPayment({
            subscriptionId,
            amount: subscription.price,
            currency,
            description: `Оплата подписки на ${subscription.subscription_type === 'course' ? 'курс' : 'период'}`,
            redirectUrl
        });

        return {
            message: 'Платеж создан. Перейдите по ссылке для оплаты.',
            paymentId: result.payment.id,
            pageUrl: result.pageUrl,
            amount: subscription.price,
            currency: currency,
            subscription: {
                id: subscription.id,
                type: subscription.subscription_type,
                startDate: subscription.start_date,
                endDate: subscription.end_date
            }
        };
    }


    /**
     * GET /subscriptions/user/:userId - Получение подписок пользователя
     */
    @Get('user/:userId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Получение подписок пользователя',
        description: 'Возвращает все подписки конкретного пользователя'
    })
    @ApiParam({ name: 'userId', description: 'ID пользователя' })
    @ApiQuery({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled', 'pending'], description: 'Фильтр по статусу' })
    @ApiResponse({
        status: 200,
        description: 'Список подписок пользователя',
        type: [SubscriptionResponseDto]
    })
    async getUserSubscriptions(
        @Param('userId') userId: string,
        @Query('status') status?: 'active' | 'expired' | 'cancelled' | 'pending',
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Получение подписок пользователя: ${userId}`);

        const subscriptions = await this.subscriptionsService.findByUserId(userId, status);

        return {
            userId: userId,
            subscriptions: subscriptions,
            totalSubscriptions: subscriptions.length
        };
    }
    /**
     * GET /subscriptions/course/:courseId - Получение подписок на курс
     */
    @Get('course/:courseId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({
        summary: 'Получение подписок на курс',
        description: 'Возвращает все подписки на конкретный курс'
    })
    @ApiParam({ name: 'courseId', description: 'ID курса' })
    @ApiQuery({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled', 'pending'], description: 'Фильтр по статусу' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
    @ApiResponse({
        status: 200,
        description: 'Список подписок на курс',
        type: [SubscriptionResponseDto]
    })
    async getCourseSubscriptions(
        @Param('courseId') courseId: string,
        @Query('status') status?: 'active' | 'expired' | 'cancelled' | 'pending',
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20
    ) {
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

    /**
     * GET /subscriptions/statistics/overview - Общая статистика подписок
     */
    @Get('statistics/overview')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Общая статистика подписок',
        description: 'Возвращает общую статистику по подпискам'
    })
    @ApiResponse({ status: 200, description: 'Статистика подписок' })
    async getSubscriptionsStatistics() {
        this.logger.log('Получение статистики подписок');

        const statistics = await this.subscriptionsService.getStatistics();

        return {
            statistics: statistics
        };
    }

    /**
     * POST /subscriptions/expire-check - Проверка истекающих подписок
     */
    @Post('expire-check')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Проверка истекающих подписок',
        description: 'Проверяет и обновляет статусы истекающих подписок'
    })
    @ApiResponse({ status: 200, description: 'Проверка завершена' })
    async checkExpiringSubscriptions() {
        this.logger.log('Проверка истекающих подписок');

        const result = await this.subscriptionsService.checkAndUpdateExpiredSubscriptions();

        return {
            message: 'Проверка истекающих подписок завершена',
            expiredCount: result.expiredCount,
            notifiedCount: result.notifiedCount
        };
    }

    /**
 * Записаться на курс с проверкой условий
 */
    @Post('enroll')
    @UseGuards(RolesGuard)
    @Roles('student')
    @ApiOperation({ summary: 'Записаться на курс' })
    @ApiResponse({ status: 201, description: 'Успешная запись на курс' })
    @ApiResponse({ status: 400, description: 'Невозможно записаться на курс' })
    async enrollInCourse(
        @Body() enrollDto: {
            courseId: string;
            paidAmount: number;
        },
        @GetUser() student: any
    ) {
        this.logger.log(`Запись студента ${student._id} на курс ${enrollDto.courseId}`);
        return this.subscriptionsService.enrollInCourse(enrollDto.courseId, student._id, enrollDto.paidAmount);
    }

    /**
     * Принудительная запись на курс (только админ)
     */
    @Post('admin-enroll')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Принудительная запись на курс (админ)' })
    @ApiResponse({ status: 201, description: 'Студент записан на курс' })
    async adminEnrollStudent(
        @Body() enrollDto: {
            courseId: string;
            userId: string;
            paidAmount: number;
            canEnrollAfterStart?: boolean;
        }
    ) {
        this.logger.log(`Админская запись пользователя ${enrollDto.userId} на курс ${enrollDto.courseId}`);
        return this.subscriptionsService.adminEnrollStudent(enrollDto);
    }

    /**
     * Обновить статус подписки (только админ)
     */
    @Put(':id/status')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Обновить статус подписки' })
    @ApiResponse({ status: 200, description: 'Статус подписки обновлен' })
    async updateSubscriptionStatus(
        @Param('id') subscriptionId: string,
        @Body() statusDto: {
            status: SubscriptionStatus.ACTIVE | SubscriptionStatus.EXPIRED | SubscriptionStatus.CANCELLED | SubscriptionStatus.PENDING;
        }
    ) {
        this.logger.log(`Обновление статуса подписки ${subscriptionId}`);
        return this.subscriptionsService.updateStatus(subscriptionId, statusDto.status);
    }
}