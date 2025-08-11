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
    Logger
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam
} from '@nestjs/swagger';
import { SubscriptionPlansService } from './subscription-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('subscription-plans')
@Controller('subscription-plans')
export class SubscriptionPlansController {
    private readonly logger = new Logger(SubscriptionPlansController.name);

    constructor(private readonly plansService: SubscriptionPlansService) {}

    /**
     * GET /subscription-plans - Получение всех активных планов
     */
    @Get()
    @ApiOperation({
        summary: 'Получение всех тарифных планов',
        description: 'Возвращает список всех активных тарифных планов'
    })
    @ApiResponse({ status: 200, description: 'Список тарифных планов' })
    async getAllPlans() {
        this.logger.log('Запрос всех тарифных планов');
        
        const plans = await this.plansService.getActivePlans();
        
        return {
            plans,
            totalPlans: plans.length
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
        const plans = await this.plansService.getFeaturedPlans();
        
        return {
            plans,
            totalPlans: plans.length
        };
    }

    /**
     * GET /subscription-plans/:slug - Получение плана по slug
     */
    @Get(':slug')
    @ApiOperation({ summary: 'Получение плана по slug' })
    @ApiParam({ name: 'slug', description: 'Slug тарифного плана' })
    async getPlanBySlug(@Param('slug') slug: string) {
        const plan = await this.plansService.getPlanBySlug(slug);
        
        return { plan };
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
}