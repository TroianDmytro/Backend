// src/difficulty-levels/difficulty-levels.controller.ts - ПОЛНАЯ ВЕРСИЯ
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
    BadRequestException,
    ParseIntPipe,
    DefaultValuePipe
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
    @ApiResponse({ status: 409, description: 'Уровень с таким кодом уже существует' })
    @ApiBody({ type: CreateDifficultyLevelDto })
    async create(@Body() createDifficultyLevelDto: CreateDifficultyLevelDto) {
        this.logger.log(`Создание уровня сложности: ${createDifficultyLevelDto.name}`);

        const level = await this.difficultyLevelsService.create(createDifficultyLevelDto);

        return {
            message: 'Уровень сложности успешно создан',
            level
        };
    }

    /**
     * GET /difficulty-levels - Получение всех уровней сложности
     */
    @Get()
    @ApiOperation({
        summary: 'Получение всех уровней сложности',
        description: 'Возвращает список всех активных уровней сложности, отсортированных по уровню'
    })
    @ApiQuery({
        name: 'includeInactive',
        required: false,
        type: Boolean,
        description: 'Включать неактивные уровни (только для админов)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список уровней сложности',
        type: [DifficultyLevelResponseDto]
    })
    async findAll(
        @Query('includeInactive') includeInactive: boolean = false
    ) {
        this.logger.log('Получение списка уровней сложности');

        const levels = await this.difficultyLevelsService.findAll(includeInactive);

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
     * GET /difficulty-levels/code/:code - Получение уровня сложности по коду
     */
    @Get('code/:code')
    @ApiOperation({
        summary: 'Получение уровня сложности по коду',
        description: 'Возвращает подробную информацию об уровне сложности по его коду'
    })
    @ApiParam({ name: 'code', description: 'Код уровня сложности (beginner, intermediate, advanced)' })
    @ApiResponse({
        status: 200,
        description: 'Данные уровня сложности',
        type: DifficultyLevelResponseDto
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async findByCode(@Param('code') code: string) {
        this.logger.log(`Получение уровня сложности с кодом: ${code}`);

        const level = await this.difficultyLevelsService.findByCode(code);
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
    @ApiBody({ type: UpdateDifficultyLevelDto })
    @ApiResponse({
        status: 200,
        description: 'Уровень сложности успешно обновлен',
        type: DifficultyLevelResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    @ApiResponse({ status: 409, description: 'Уровень с таким кодом уже существует' })
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
        description: 'Возвращает список курсов данного уровня сложности с краткой информацией для карточек'
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
            difficultyLevel: {
                id: result.level.id,
                name: result.level.name,
                slug: result.level.slug,
                code: result.level.code,
                level: result.level.level,
                color: result.level.color,
                description: result.level.description
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
     * GET /difficulty-levels/:id/courses/detailed - Получение курсов с полной информацией
     */
    @Get(':id/courses/detailed')
    @ApiOperation({
        summary: 'Получение курсов с полной информацией',
        description: 'Возвращает список курсов уровня сложности с полной информацией для пользователей'
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
        description: 'Количество элементов на странице (по умолчанию 10)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов с полной информацией'
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async getLevelCoursesDetailed(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение детальной информации о курсах уровня сложности ${id}`);

        const result = await this.difficultyLevelsService.getLevelCoursesDetailed(id, page, limit);

        return result;
    }

    /**
     * GET /difficulty-levels/:id/courses/admin - Получение курсов с полной информацией (для админов)
     */
    @Get(':id/courses/admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение курсов с полной информацией для админов',
        description: 'Возвращает список курсов уровня сложности со всей информацией включая статистику'
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
        description: 'Количество элементов на странице (по умолчанию 10)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов с полной информацией и статистикой'
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async getLevelCoursesAdmin(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Админ запрашивает полную информацию о курсах уровня сложности ${id}`);

        const result = await this.difficultyLevelsService.getLevelCoursesAdmin(id, page, limit);

        return result;
    }

    /**
     * POST /difficulty-levels/:id/update-statistics - Обновление статистики уровня сложности (только админ)
     */
    @Post(':id/update-statistics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление статистики уровня сложности',
        description: 'Пересчитывает количество курсов и студентов для уровня сложности'
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
        description: 'Пересчитывает количество курсов и студентов для всех уровней сложности'
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
     * GET /difficulty-levels/statistics/overview - Общая статистика уровней сложности
     */
    @Get('statistics/overview')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Общая статистика уровней сложности',
        description: 'Возвращает статистику по всем уровням сложности'
    })
    @ApiResponse({ status: 200, description: 'Статистика уровней сложности' })
    async getStatistics() {
        this.logger.log('Получение общей статистики уровней сложности');

        const statistics = await this.difficultyLevelsService.getStatistics();

        return {
            statistics
        };
    }
}

/**
 * Объяснение полного контроллера уровней сложности:
 * 
 * 1. **CRUD ОПЕРАЦИИ:**
 *    - POST / - создание нового уровня (только админ)
 *    - GET / - получение всех уровней
 *    - GET /:id - получение по ID
 *    - GET /code/:code - получение по коду (beginner, intermediate, advanced)
 *    - PUT /:id - обновление уровня (только админ)
 *    - DELETE /:id - удаление уровня (только админ)
 * 
 * 2. **РАБОТА С КУРСАМИ:**
 *    - GET /:id/courses - курсы уровня (карточки)
 *    - GET /:id/courses/detailed - курсы с полной информацией
 *    - GET /:id/courses/admin - курсы с админской информацией
 * 
 * 3. **СТАТИСТИКА:**
 *    - POST /:id/update-statistics - обновление статистики конкретного уровня
 *    - POST /update-all-statistics - обновление статистики всех уровней
 *    - GET /statistics/overview - общая статистика
 * 
 * 4. **АВТОРИЗАЦИЯ:**
 *    - Публичные эндпоинты: GET запросы для курсов и уровней
 *    - Админские эндпоинты: создание, обновление, удаление, статистика
 * 
 * 5. **ПАГИНАЦИЯ:**
 *    - Все эндпоинты с курсами поддерживают пагинацию
 *    - По умолчанию: page=1, limit=12 для карточек, limit=10 для детальных данных
 */