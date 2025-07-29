"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CategoriesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("./categories.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const category_response_dto_1 = require("./dto/category-response.dto");
const category_with_courses_dto_1 = require("./dto/category-with-courses.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let CategoriesController = CategoriesController_1 = class CategoriesController {
    categoriesService;
    logger = new common_1.Logger(CategoriesController_1.name);
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async create(createCategoryDto) {
        this.logger.log(`Создание категории: ${createCategoryDto.name}`);
        const category = await this.categoriesService.create(createCategoryDto);
        return {
            message: 'Категория успешно создана',
            category
        };
    }
    async findAll(onlyActive, onlyParent) {
        this.logger.log('Получение списка категорий');
        const categories = await this.categoriesService.findAll(onlyActive, onlyParent);
        return {
            categories,
            total: categories.length
        };
    }
    async getCategoriesTree() {
        this.logger.log('Получение дерева категорий');
        const tree = await this.categoriesService.getCategoriesTree();
        return {
            categories: tree
        };
    }
    async getFeaturedCategories(limit) {
        this.logger.log(`Получение рекомендуемых категорий. Лимит: ${limit}`);
        const categories = await this.categoriesService.getFeaturedCategories(limit);
        return {
            categories,
            total: categories.length
        };
    }
    async findById(id) {
        this.logger.log(`Получение категории с ID: ${id}`);
        const category = await this.categoriesService.findById(id);
        if (!category) {
            throw new common_1.NotFoundException('Категория не найдена');
        }
        return { category };
    }
    async findBySlug(slug) {
        this.logger.log(`Получение категории со slug: ${slug}`);
        const category = await this.categoriesService.findBySlug(slug);
        if (!category) {
            throw new common_1.NotFoundException('Категория не найдена');
        }
        return { category };
    }
    async update(id, updateCategoryDto) {
        this.logger.log(`Обновление категории с ID: ${id}`);
        const category = await this.categoriesService.update(id, updateCategoryDto);
        return {
            message: 'Категория успешно обновлена',
            category
        };
    }
    async delete(id) {
        this.logger.log(`Удаление категории с ID: ${id}`);
        await this.categoriesService.delete(id);
        return {
            message: 'Категория успешно удалена'
        };
    }
    async getCategoryCourses(id, page, limit) {
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
    async getCategoryCoursesDetailed(id, page, limit) {
        this.logger.log(`Получение детальной информации о курсах категории ${id}`);
        const result = await this.categoriesService.getCategoryCoursesDetailed(id, page, limit);
        return result;
    }
    async getCategoryCoursesAdmin(id, page, limit) {
        this.logger.log(`Админ запрашивает полную информацию о курсах категории ${id}`);
        const result = await this.categoriesService.getCategoryCoursesAdmin(id, page, limit);
        return result;
    }
    async updateCategoryStatistics(id) {
        this.logger.log(`Обновление статистики категории ${id}`);
        await this.categoriesService.updateCategoryStatistics(id);
        return {
            message: 'Статистика категории успешно обновлена'
        };
    }
    async updateAllCategoriesStatistics() {
        this.logger.log('Обновление статистики всех категорий');
        await this.categoriesService.updateAllCategoriesStatistics();
        return {
            message: 'Статистика всех категорий успешно обновлена'
        };
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Создание новой категории',
        description: 'Создает новую категорию курсов. Доступно только администраторам.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Категория успешно создана',
        type: category_response_dto_1.CategoryResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Категория с таким slug уже существует' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение списка категорий',
        description: 'Возвращает список всех категорий с возможностью фильтрации'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'onlyActive',
        required: false,
        type: Boolean,
        description: 'Показывать только активные категории'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'onlyParent',
        required: false,
        type: Boolean,
        description: 'Показывать только родительские категории'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список категорий',
        type: [category_response_dto_1.CategoryResponseDto]
    }),
    __param(0, (0, common_1.Query)('onlyActive', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __param(1, (0, common_1.Query)('onlyParent', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, Boolean]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение дерева категорий',
        description: 'Возвращает иерархическую структуру категорий'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Дерево категорий'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoriesTree", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение рекомендуемых категорий',
        description: 'Возвращает список рекомендуемых категорий'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество категорий (по умолчанию 6)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список рекомендуемых категорий',
        type: [category_response_dto_1.CategoryResponseDto]
    }),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(6), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getFeaturedCategories", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение категории по ID',
        description: 'Возвращает подробную информацию о категории'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID категории' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные категории',
        type: category_response_dto_1.CategoryResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение категории по slug',
        description: 'Возвращает подробную информацию о категории по её slug'
    }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Slug категории' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные категории',
        type: category_response_dto_1.CategoryResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление категории',
        description: 'Обновляет данные категории. Доступно только администраторам.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID категории' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Категория успешно обновлена',
        type: category_response_dto_1.CategoryResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Категория с таким slug уже существует' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Удаление категории',
        description: 'Удаляет категорию. Нельзя удалить категорию с курсами или подкатегориями.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID категории' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Категория успешно удалена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Нельзя удалить категорию с курсами или подкатегориями' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/courses'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов в категории',
        description: 'Возвращает список курсов в категории с краткой информацией для карточек'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID категории' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество элементов на странице (по умолчанию 12)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список курсов в категории',
        type: category_with_courses_dto_1.CategoryWithCoursesDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(12), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoryCourses", null);
__decorate([
    (0, common_1.Get)(':id/courses/detailed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов с полной информацией',
        description: 'Возвращает список курсов в категории с полной информацией для пользователей (без админских данных)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID категории' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество элементов на странице (по умолчанию 10)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список курсов с полной информацией'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoryCoursesDetailed", null);
__decorate([
    (0, common_1.Get)(':id/courses/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов с полной информацией для админов',
        description: 'Возвращает список курсов в категории со всей информацией включая статистику и служебные данные'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID категории' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество элементов на странице (по умолчанию 10)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список курсов с полной информацией и статистикой'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoryCoursesAdmin", null);
__decorate([
    (0, common_1.Post)(':id/update-statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление статистики категории',
        description: 'Пересчитывает количество курсов и студентов в категории'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID категории' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика успешно обновлена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "updateCategoryStatistics", null);
__decorate([
    (0, common_1.Post)('update-all-statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление статистики всех категорий',
        description: 'Пересчитывает количество курсов и студентов для всех категорий'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика успешно обновлена' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "updateAllCategoriesStatistics", null);
exports.CategoriesController = CategoriesController = CategoriesController_1 = __decorate([
    (0, swagger_1.ApiTags)('categories'),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map