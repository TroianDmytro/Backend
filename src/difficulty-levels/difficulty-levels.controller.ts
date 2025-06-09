// src/difficulty-levels/difficulty-levels.controller.ts
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
    Logger,
    NotFoundException,
    ParseIntPipe,
    ParseBoolPipe,
    DefaultValuePipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery
} from '@nestjs/swagger';
import { DifficultyLevelsService } from './difficulty-levels.service';
import { CreateDifficultyLevelDto } from './dto/create-difficulty-level.dto';
import { UpdateDifficultyLevelDto } from './dto/update-difficulty-level.dto';
import { DifficultyLevelResponseDto } from './dto/difficulty-level-response.dto';
import { DifficultyLevelWithCoursesDto } from './dto/difficulty-level-with-courses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiTags('difficulty-levels')
@Controller('difficulty-levels')
export class DifficultyLevelsController {
    private readonly logger = new Logger(DifficultyLevelsController.name);

    constructor(private readonly difficultyLevelsService: DifficultyLevelsService) { }

    /**
     * POST /difficulty-levels - Создание нового уровня сложности (только админ)
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Создание нового уровня сложности',
        description: 'Создает новый уровень сложности курсов. Доступно только администраторам.'
    })
    @ApiResponse({
        status: 201,
        description: 'Уровень сложности успешно создан',
        type: DifficultyLevelResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Уровень с таким slug/code/level уже существует' })
    async create(@Body() createDifficultyLevelDto: CreateDifficultyLevelDto) {
        this.logger.log(`Создание уровня сложности: ${createDifficultyLevelDto.name}`);

        const level = await this.difficultyLevelsService.create(createDifficultyLevelDto);

        return {
            message: 'Уровень сложности успешно создан',
            level
        };
    }

    /**
     * GET /difficulty-levels - Получение списка уровней сложности
     */
    @Get()
    @ApiOperation({
        summary: 'Получение списка уровней сложности',
        description: 'Возвращает список всех уровней сложности с возможностью фильтрации'
    })
    @ApiQuery({
        name: 'onlyActive',
        required: false,
        type: Boolean,
        description: 'Показывать только активные уровни'
    })
    @ApiResponse({
        status: 200,
        description: 'Список уровней сложности',
        type: [DifficultyLevelResponseDto]
    })
    async findAll(
        @Query('onlyActive', new DefaultValuePipe(false), ParseBoolPipe) onlyActive: boolean
    ) {
        this.logger.log('Получение списка уровней сложности');

        const levels = await this.difficultyLevelsService.findAll(onlyActive);

        return {
            levels,
            total: levels.length
        };
    }

    /**
     * GET /difficulty-levels/:id - Получение уровня сложности по ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Получение уровня сложности по ID',
        description: 'Возвращает подробную информацию об уровне сложности'
    })
    @ApiParam({ name: 'id', description: 'ID уровня сложности' })
    @ApiResponse({
        status: 200,
        description: 'Данные уровня сложности',
        type: DifficultyLevelResponseDto
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async findById(@Param('id') id: string) {
        this.logger.log(`Получение уровня сложности с ID: ${id}`);

        const level = await this.difficultyLevelsService.findById(id);
        if (!level) {
            throw new NotFoundException('Уровень сложности не найден');
        }

        return { level };
    }

    /**
     * GET /difficulty-levels/slug/:slug - Получение уровня сложности по slug
     */
    @Get('slug/:slug')
    @ApiOperation({
        summary: 'Получение уровня сложности по slug',
        description: 'Возвращает подробную информацию об уровне сложности по его slug'
    })
    @ApiParam({ name: 'slug', description: 'Slug уровня сложности' })
    @ApiResponse({
        status: 200,
        description: 'Данные уровня сложности',
        type: DifficultyLevelResponseDto
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async findBySlug(@Param('slug') slug: string) {
        this.logger.log(`Получение уровня сложности со slug: ${slug}`);

        const level = await this.difficultyLevelsService.findBySlug(slug);
        if (!level) {
            throw new NotFoundException('Уровень сложности не найден');
        }

        return { level };
    }

    /**
     * PUT /difficulty-levels/:id - Обновление уровня сложности (только админ)
     */
    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление уровня сложности',
        description: 'Обновляет данные уровня сложности. Доступно только администраторам.'
    })
    @ApiParam({ name: 'id', description: 'ID уровня сложности' })
    @ApiResponse({
        status: 200,
        description: 'Уровень сложности успешно обновлен',
        type: DifficultyLevelResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    @ApiResponse({ status: 409, description: 'Уровень с таким slug/code/level уже существует' })
    async update(
        @Param('id') id: string,
        @Body() updateDifficultyLevelDto: UpdateDifficultyLevelDto
    ) {
        this.logger.log(`Обновление уровня сложности с ID: ${id}`);

        const level = await this.difficultyLevelsService.update(id, updateDifficultyLevelDto);

        return {
            message: 'Уровень сложности успешно обновлен',
            level
        };
    }

    /**
     * DELETE /difficulty-levels/:id - Удаление уровня сложности (только админ)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Удаление уровня сложности',
        description: 'Удаляет уровень сложности. Нельзя удалить уровень с курсами.'
    })
    @ApiParam({ name: 'id', description: 'ID уровня сложности' })
    @ApiResponse({ status: 200, description: 'Уровень сложности успешно удален' })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    @ApiResponse({ status: 409, description: 'Нельзя удалить уровень с курсами' })
    async delete(@Param('id') id: string) {
        this.logger.log(`Удаление уровня сложности с ID: ${id}`);

        await this.difficultyLevelsService.delete(id);

        return {
            message: 'Уровень сложности успешно удален'
        };
    }

    /**
     * GET /difficulty-levels/:id/courses - Получение курсов уровня сложности (карточки)
     */
    @Get(':id/courses')
    @ApiOperation({
        summary: 'Получение курсов уровня сложности',
        description: 'Возвращает список курсов уровня сложности с краткой информацией для карточек'
    })
    @ApiParam({ name: 'id', description: 'ID уровня сложности' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество элементов на странице (по умолчанию 12)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов уровня сложности',
        type: DifficultyLevelWithCoursesDto
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async getLevelCourses(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение курсов уровня сложности ${id}. Страница: ${page}, Лимит: ${limit}`);

        const result = await this.difficultyLevelsService.getLevelCourses(id, page, limit);

        return {
            level: {
                id: result.level.id,
                name: result.level.name,
                slug: result.level.slug,
                description: result.level.description,
                color: result.level.color,
                level: result.level.level
            },
            courses: result.courses,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(result.totalItems / limit),
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * POST /difficulty-levels/:id/update-statistics - Обновление статистики уровня (только админ)
     */
    @Post(':id/update-statistics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление статистики уровня сложности',
        description: 'Пересчитывает количество курсов, студентов и средний процент завершения'
    })
    @ApiParam({ name: 'id', description: 'ID уровня сложности' })
    @ApiResponse({ status: 200, description: 'Статистика успешно обновлена' })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async updateLevelStatistics(@Param('id') id: string) {
        this.logger.log(`Обновление статистики уровня сложности ${id}`);

        await this.difficultyLevelsService.updateLevelStatistics(id);

        return {
            message: 'Статистика уровня сложности успешно обновлена'
        };
    }

    /**
     * POST /difficulty-levels/update-all-statistics - Обновление статистики всех уровней (только админ)
     */
    @Post('update-all-statistics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление статистики всех уровней сложности',
        description: 'Пересчитывает статистику для всех уровней сложности'
    })
    @ApiResponse({ status: 200, description: 'Статистика успешно обновлена' })
    async updateAllLevelsStatistics() {
        this.logger.log('Обновление статистики всех уровней сложности');

        await this.difficultyLevelsService.updateAllLevelsStatistics();

        return {
            message: 'Статистика всех уровней сложности успешно обновлена'
        };
    }

    /**
     * GET /difficulty-levels/statistics/overview - Статистика по всем уровням
     */
    @Get('statistics/overview')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение статистики по всем уровням сложности',
        description: 'Возвращает статистику по курсам и студентам для каждого уровня'
    })
    @ApiResponse({ status: 200, description: 'Статистика по уровням сложности' })
    async getLevelsStatistics() {
        this.logger.log('Получение статистики по всем уровням сложности');

        const statistics = await this.difficultyLevelsService.getLevelsStatistics();

        return {
            statistics: statistics
        };
    }
}