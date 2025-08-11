// src/subscription-plans/subscription-plans.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Logger,
    BadRequestException,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiQuery
} from '@nestjs/swagger';
import { SubscriptionPlansService } from './subscription-plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/subscription-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('subscription-plans')
@Controller('subscription-plans')
export class SubscriptionPlansController {
    private readonly logger = new Logger(SubscriptionPlansController.name);

    constructor(private readonly plansService: SubscriptionPlansService) { }

    /**
     * GET /subscription-plans - Получение всех активных планов
     */
    @Get()
    @ApiOperation({
        summary: 'Получение всех тарифных планов',
        description: 'Возвращает список всех активных тарифных планов с пагинацией'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы (по умолчанию 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице (по умолчанию 10)' })
    @ApiQuery({ name: 'active_only', required: false, type: Boolean, description: 'Только активные планы (по умолчанию true)' })
    @ApiResponse({ status: 200, description: 'Список тарифных планов' })
    async getAllPlans(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('active_only') activeOnly: boolean = true
    ) {
        this.logger.log(`Запрос всех тарифных планов. Страница: ${page}, Лимит: ${limit}, Только активные: ${activeOnly}`);

        const result = await this.plansService.getAllPlans(page, limit, activeOnly);

        return {
            plans: result.plans,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /subscription-plans/popular - Получение популярных планов
     */
    @Get('popular')
    @ApiOperation({
        summary: 'Получение популярных планов',
        description: 'Возвращает список популярных тарифных планов'
    })
    async getPopularPlans() {
        this.logger.log('Запрос популярных тарифных планов');

        const plans = await this.plansService.getPopularPlans();

        return {
            plans,
            totalPlans: plans.length
        };
    }

    /**
     * GET /subscription-plans/featured - Получение рекомендуемых планов
     */
    @Get('featured')
    @ApiOperation({
        summary: 'Получение рекомендуемых планов',
        description: 'Возвращает список рекомендуемых тарифных планов'
    })
    async getFeaturedPlans() {
        this.logger.log('Запрос рекомендуемых тарифных планов');

        const plans = await this.plansService.getFeaturedPlans();

        return {
            plans,
            totalPlans: plans.length
        };
    }

    /**
     * POST /subscription-plans - Создание нового тарифного плана
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Создание нового тарифного плана',
        description: 'Создает новый тарифный план (только для админов)'
    })
    @ApiBody({ type: CreatePlanDto })
    @ApiResponse({
        status: 201,
        description: 'Тарифный план успешно создан',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                plan: { type: 'object' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'План с таким slug уже существует' })
    async createPlan(@Body() createPlanDto: CreatePlanDto) {
        this.logger.log(`Создание нового тарифного плана: ${createPlanDto.name}`);

        // Валидация данных
        if (createPlanDto.discount_percent && createPlanDto.discount_percent > 0 && !createPlanDto.original_price) {
            throw new BadRequestException('Для скидочного плана необходимо указать оригинальную цену');
        }

        const plan = await this.plansService.createCustomPlan(createPlanDto);

        return {
            message: 'Тарифный план успешно создан',
            plan
        };
    }

    /**
     * GET /subscription-plans/:id - Получение плана по ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Получение плана по ID',
        description: 'Возвращает тарифный план по его ID'
    })
    @ApiParam({ name: 'id', description: 'ID тарифного плана' })
    @ApiResponse({
        status: 200,
        description: 'Данные тарифного плана',
        schema: {
            type: 'object',
            properties: {
                plan: { type: 'object' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Тарифный план не найден' })
    async getPlanById(@Param('id') id: string) {
        this.logger.log(`Запрос тарифного плана с ID: ${id}`);

        const plan = await this.plansService.getPlanById(id);

        return { plan };
    }

    /**
     * GET /subscription-plans/slug/:slug - Получение плана по slug
     */
    @Get('slug/:slug')
    @ApiOperation({
        summary: 'Получение плана по slug',
        description: 'Возвращает тарифный план по его URL-дружелюбному идентификатору'
    })
    @ApiParam({ name: 'slug', description: 'Slug тарифного плана' })
    async getPlanBySlug(@Param('slug') slug: string) {
        this.logger.log(`Запрос тарифного плана с slug: ${slug}`);

        const plan = await this.plansService.getPlanBySlug(slug);

        return { plan };
    }

    /**
     * PUT /subscription-plans/:id - Обновление тарифного плана
     */
    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление тарифного плана',
        description: 'Обновляет существующий тарифный план (только для админов)'
    })
    @ApiParam({ name: 'id', description: 'ID тарифного плана' })
    @ApiBody({ type: UpdatePlanDto })
    @ApiResponse({
        status: 200,
        description: 'Тарифный план успешно обновлен',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                plan: { type: 'object' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Тарифный план не найден' })
    @ApiResponse({ status: 409, description: 'План с таким slug уже существует' })
    async updatePlan(
        @Param('id') id: string,
        @Body() updatePlanDto: UpdatePlanDto
    ) {
        this.logger.log(`Обновление тарифного плана с ID: ${id}`);

        // Валидация данных
        if (updatePlanDto.discount_percent && updatePlanDto.discount_percent > 0 && !updatePlanDto.original_price) {
            throw new BadRequestException('Для скидочного плана необходимо указать оригинальную цену');
        }

        const plan = await this.plansService.updatePlan(id, updatePlanDto);

        return {
            message: 'Тарифный план успешно обновлен',
            plan
        };
    }

    /**
     * DELETE /subscription-plans/:id - Удаление тарифного плана
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Удаление тарифного плана',
        description: 'Удаляет тарифный план или деактивирует его (только для админов)'
    })
    @ApiParam({ name: 'id', description: 'ID тарифного плана' })
    @ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Принудительное удаление (по умолчанию false - деактивация)' })
    @ApiResponse({
        status: 200,
        description: 'Тарифный план удален или деактивирован',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                deleted: { type: 'boolean' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Тарифный план не найден' })
    @ApiResponse({ status: 409, description: 'Нельзя удалить план с активными подписками' })
    async deletePlan(
        @Param('id') id: string,
        @Query('force') force: boolean = false
    ) {
        this.logger.log(`${force ? 'Удаление' : 'Деактивация'} тарифного плана с ID: ${id}`);

        const result = await this.plansService.deletePlan(id, force);

        return {
            message: result.deleted
                ? 'Тарифный план окончательно удален'
                : 'Тарифный план деактивирован',
            deleted: result.deleted
        };
    }

    /**
     * PATCH /subscription-plans/:id/activate - Активация/деактивация плана
     */
    @Put(':id/activate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Активация/деактивация плана',
        description: 'Изменяет статус активности тарифного плана (только для админов)'
    })
    @ApiParam({ name: 'id', description: 'ID тарифного плана' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                is_active: { type: 'boolean', description: 'Новый статус активности' }
            },
            required: ['is_active']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Статус плана изменен',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                plan: { type: 'object' }
            }
        }
    })
    async togglePlanActivation(
        @Param('id') id: string,
        @Body('is_active') isActive: boolean
    ) {
        this.logger.log(`${isActive ? 'Активация' : 'Деактивация'} тарифного плана с ID: ${id}`);

        const plan = await this.plansService.toggleActivation(id, isActive);

        return {
            message: isActive
                ? 'Тарифный план активирован'
                : 'Тарифный план деактивирован',
            plan
        };
    }

    /**
     * POST /subscription-plans/seed - Создание базовых планов (только для админов)
     */
    @Post('seed')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Создание базовых тарифных планов',
        description: 'Создает стандартные тарифные планы в базе данных'
    })
    @ApiResponse({ status: 201, description: 'Базовые планы созданы' })
    async seedBasicPlans() {
        this.logger.log('Запуск создания базовых тарифных планов');

        const plans = await this.plansService.seedBasicPlans();

        return {
            message: 'Базовые тарифные планы созданы успешно',
            plans,
            totalCreated: plans.length
        };
    }

    /**
     * POST /subscription-plans/recreate - Пересоздание планов (только для админов)
     */
    @Post('recreate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Пересоздание базовых планов',
        description: 'Удаляет все планы и создает заново'
    })
    async recreateBasicPlans() {
        this.logger.log('Пересоздание базовых тарифных планов');

        const plans = await this.plansService.recreateBasicPlans();

        return {
            message: 'Базовые тарифные планы пересозданы успешно',
            plans,
            totalCreated: plans.length
        };
    }

    /**
     * GET /subscription-plans/statistics/overview - Статистика по планам
     */
    @Get('statistics/overview')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Статистика тарифных планов',
        description: 'Возвращает статистику по всем тарифным планам'
    })
    @ApiResponse({
        status: 200,
        description: 'Статистика планов',
        schema: {
            type: 'object',
            properties: {
                totalPlans: { type: 'number' },
                activePlans: { type: 'number' },
                popularPlans: { type: 'number' },
                featuredPlans: { type: 'number' },
                totalSubscribers: { type: 'number' },
                totalRevenue: { type: 'number' },
                topPlans: { type: 'array' }
            }
        }
    })
    async getPlansStatistics() {
        this.logger.log('Получение статистики тарифных планов');

        const statistics = await this.plansService.getStatistics();

        return { statistics };
    }
}