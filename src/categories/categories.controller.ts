// src/categories/categories.controller.ts
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryWithCoursesDto } from './dto/category-with-courses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    private readonly logger = new Logger(CategoriesController.name);

    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * POST /categories - Создание новой категории (только админ)
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Создание новой категории',
        description: 'Создает новую категорию курсов. Доступно только администраторам.'
    })
    @ApiResponse({
        status: 201,
        description: 'Категория успешно создана',
        type: CategoryResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Категория с таким slug уже существует' })
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        this.logger.log(`Создание категории: ${createCategoryDto.name}`);

        const category = await this.categoriesService.create(createCategoryDto);

        return {
            message: 'Категория успешно создана',
            category
        };
    }

    /**
     * GET /categories - Получение списка категорий
     */
    @Get()
    @Public()
    @ApiOperation({
        summary: 'Получение списка категорий',
        description: 'Возвращает список всех категорий с возможностью фильтрации'
    })
    @ApiQuery({
        name: 'onlyActive',
        required: false,
        type: Boolean,
        description: 'Показывать только активные категории'
    })
    @ApiQuery({
        name: 'onlyParent',
        required: false,
        type: Boolean,
        description: 'Показывать только родительские категории'
    })
    @ApiResponse({
        status: 200,
        description: 'Список категорий',
        type: [CategoryResponseDto]
    })
    async findAll(
        @Query('onlyActive', new DefaultValuePipe(false), ParseBoolPipe) onlyActive: boolean,
        @Query('onlyParent', new DefaultValuePipe(false), ParseBoolPipe) onlyParent: boolean
    ) {
        this.logger.log('Получение списка категорий');

        const categories = await this.categoriesService.findAll(onlyActive, onlyParent);

        return {
            categories,
            total: categories.length
        };
    }

    /**
     * GET /categories/tree - Получение дерева категорий
     */
    @Get('tree')
    @Public()
    @ApiOperation({
        summary: 'Получение дерева категорий',
        description: 'Возвращает иерархическую структуру категорий'
    })
    @ApiResponse({
        status: 200,
        description: 'Дерево категорий'
    })
    async getCategoriesTree() {
        this.logger.log('Получение дерева категорий');

        const tree = await this.categoriesService.getCategoriesTree();

        return {
            categories: tree
        };
    }

    /**
     * GET /categories/featured - Получение рекомендуемых категорий
     */
    @Get('featured')
    @Public()
    @ApiOperation({
        summary: 'Получение рекомендуемых категорий',
        description: 'Возвращает список рекомендуемых категорий'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество категорий (по умолчанию 6)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список рекомендуемых категорий',
        type: [CategoryResponseDto]
    })
    async getFeaturedCategories(
        @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение рекомендуемых категорий. Лимит: ${limit}`);

        const categories = await this.categoriesService.getFeaturedCategories(limit);

        return {
            categories,
            total: categories.length
        };
    }

    /**
     * GET /categories/:id - Получение категории по ID
     */
    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'Получение категории по ID',
        description: 'Возвращает подробную информацию о категории'
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiResponse({
        status: 200,
        description: 'Данные категории',
        type: CategoryResponseDto
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async findById(@Param('id') id: string) {
        this.logger.log(`Получение категории с ID: ${id}`);

        const category = await this.categoriesService.findById(id);
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        return { category };
    }

    /**
     * GET /categories/slug/:slug - Получение категории по slug
     */
    @Get('slug/:slug')
    @Public()
    @ApiOperation({
        summary: 'Получение категории по slug',
        description: 'Возвращает подробную информацию о категории по её slug'
    })
    @ApiParam({ name: 'slug', description: 'Slug категории' })
    @ApiResponse({
        status: 200,
        description: 'Данные категории',
        type: CategoryResponseDto
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async findBySlug(@Param('slug') slug: string) {
        this.logger.log(`Получение категории со slug: ${slug}`);

        const category = await this.categoriesService.findBySlug(slug);
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        return { category };
    }

    /**
     * PUT /categories/:id - Обновление категории (только админ)
     */
    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление категории',
        description: 'Обновляет данные категории. Доступно только администраторам.'
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiResponse({
        status: 200,
        description: 'Категория успешно обновлена',
        type: CategoryResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    @ApiResponse({ status: 409, description: 'Категория с таким slug уже существует' })
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto
    ) {
        this.logger.log(`Обновление категории с ID: ${id}`);

        const category = await this.categoriesService.update(id, updateCategoryDto);

        return {
            message: 'Категория успешно обновлена',
            category
        };
    }

    /**
     * DELETE /categories/:id - Удаление категории (только админ)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Удаление категории',
        description: 'Удаляет категорию. Нельзя удалить категорию с курсами или подкатегориями.'
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiResponse({ status: 200, description: 'Категория успешно удалена' })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    @ApiResponse({ status: 409, description: 'Нельзя удалить категорию с курсами или подкатегориями' })
    async delete(@Param('id') id: string) {
        this.logger.log(`Удаление категории с ID: ${id}`);

        await this.categoriesService.delete(id);

        return {
            message: 'Категория успешно удалена'
        };
    }

    /**
     * GET /categories/:id/courses - Получение курсов в категории (карточки)
     */
    @Get(':id/courses')
    @Public()
    @ApiOperation({
        summary: 'Получение курсов в категории',
        description: 'Возвращает список курсов в категории с краткой информацией для карточек'
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
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
        description: 'Список курсов в категории',
        type: CategoryWithCoursesDto
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async getCategoryCourses(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение курсов категории ${id}. Страница: ${page}, Лимит: ${limit}`);

        const result = await this.categoriesService.getCategoryCourses(id, page, limit);

        return {
            category: {
                id: result.category.id,
                name: result.category.name,
                slug: result.category.slug,
                description: result.category.description
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
     * GET /categories/:id/courses/detailed - Получение курсов с полной информацией (для пользователей)
     */
    @Get(':id/courses/detailed')
    @Public()
    @ApiOperation({
        summary: 'Получение курсов с полной информацией',
        description: 'Возвращает список курсов в категории с полной информацией для пользователей (без админских данных)'
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
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
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async getCategoryCoursesDetailed(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение детальной информации о курсах категории ${id}`);

        const result = await this.categoriesService.getCategoryCoursesDetailed(id, page, limit);

        return result;
    }

    /**
     * GET /categories/:id/courses/admin - Получение курсов с полной информацией (для админов)
     */
    @Get(':id/courses/admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение курсов с полной информацией для админов',
        description: 'Возвращает список курсов в категории со всей информацией включая статистику и служебные данные'
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
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
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async getCategoryCoursesAdmin(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Админ запрашивает полную информацию о курсах категории ${id}`);

        const result = await this.categoriesService.getCategoryCoursesAdmin(id, page, limit);

        return result;
    }

    /**
     * POST /categories/:id/update-statistics - Обновление статистики категории (только админ)
     */
    @Post(':id/update-statistics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление статистики категории',
        description: 'Пересчитывает количество курсов и студентов в категории'
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiResponse({ status: 200, description: 'Статистика успешно обновлена' })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async updateCategoryStatistics(@Param('id') id: string) {
        this.logger.log(`Обновление статистики категории ${id}`);

        await this.categoriesService.updateCategoryStatistics(id);

        return {
            message: 'Статистика категории успешно обновлена'
        };
    }

    /**
     * POST /categories/update-all-statistics - Обновление статистики всех категорий (только админ)
     */
    @Post('update-all-statistics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Обновление статистики всех категорий',
        description: 'Пересчитывает количество курсов и студентов для всех категорий'
    })
    @ApiResponse({ status: 200, description: 'Статистика успешно обновлена' })
    async updateAllCategoriesStatistics() {
        this.logger.log('Обновление статистики всех категорий');

        await this.categoriesService.updateAllCategoriesStatistics();

        return {
            message: 'Статистика всех категорий успешно обновлена'
        };
    }
}