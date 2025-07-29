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
var DifficultyLevelsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultyLevelsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const difficulty_levels_service_1 = require("./difficulty-levels.service");
const create_difficulty_level_dto_1 = require("./dto/create-difficulty-level.dto");
const update_difficulty_level_dto_1 = require("./dto/update-difficulty-level.dto");
const difficulty_level_response_dto_1 = require("./dto/difficulty-level-response.dto");
const difficulty_level_with_courses_dto_1 = require("./dto/difficulty-level-with-courses.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let DifficultyLevelsController = DifficultyLevelsController_1 = class DifficultyLevelsController {
    difficultyLevelsService;
    logger = new common_1.Logger(DifficultyLevelsController_1.name);
    constructor(difficultyLevelsService) {
        this.difficultyLevelsService = difficultyLevelsService;
    }
    async create(createDifficultyLevelDto) {
        this.logger.log(`Создание уровня сложности: ${createDifficultyLevelDto.name}`);
        const level = await this.difficultyLevelsService.create(createDifficultyLevelDto);
        return {
            message: 'Уровень сложности успешно создан',
            level
        };
    }
    async findAll(onlyActive) {
        this.logger.log('Получение списка уровней сложности');
        const levels = await this.difficultyLevelsService.findAll(onlyActive);
        return {
            levels,
            total: levels.length
        };
    }
    async findById(id) {
        this.logger.log(`Получение уровня сложности с ID: ${id}`);
        const level = await this.difficultyLevelsService.findById(id);
        if (!level) {
            throw new common_1.NotFoundException('Уровень сложности не найден');
        }
        return { level };
    }
    async findBySlug(slug) {
        this.logger.log(`Получение уровня сложности со slug: ${slug}`);
        const level = await this.difficultyLevelsService.findBySlug(slug);
        if (!level) {
            throw new common_1.NotFoundException('Уровень сложности не найден');
        }
        return { level };
    }
    async update(id, updateDifficultyLevelDto) {
        this.logger.log(`Обновление уровня сложности с ID: ${id}`);
        const level = await this.difficultyLevelsService.update(id, updateDifficultyLevelDto);
        return {
            message: 'Уровень сложности успешно обновлен',
            level
        };
    }
    async delete(id) {
        this.logger.log(`Удаление уровня сложности с ID: ${id}`);
        await this.difficultyLevelsService.delete(id);
        return {
            message: 'Уровень сложности успешно удален'
        };
    }
    async getLevelCourses(id, page, limit) {
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
    async updateLevelStatistics(id) {
        this.logger.log(`Обновление статистики уровня сложности ${id}`);
        await this.difficultyLevelsService.updateLevelStatistics(id);
        return {
            message: 'Статистика уровня сложности успешно обновлена'
        };
    }
    async updateAllLevelsStatistics() {
        this.logger.log('Обновление статистики всех уровней сложности');
        await this.difficultyLevelsService.updateAllLevelsStatistics();
        return {
            message: 'Статистика всех уровней сложности успешно обновлена'
        };
    }
    async getLevelsStatistics() {
        this.logger.log('Получение статистики по всем уровням сложности');
        const statistics = await this.difficultyLevelsService.getLevelsStatistics();
        return {
            statistics: statistics
        };
    }
};
exports.DifficultyLevelsController = DifficultyLevelsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Создание нового уровня сложности',
        description: 'Создает новый уровень сложности курсов. Доступно только администраторам.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Уровень сложности успешно создан',
        type: difficulty_level_response_dto_1.DifficultyLevelResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Уровень с таким slug/code/level уже существует' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_difficulty_level_dto_1.CreateDifficultyLevelDto]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение списка уровней сложности',
        description: 'Возвращает список всех уровней сложности с возможностью фильтрации'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'onlyActive',
        required: false,
        type: Boolean,
        description: 'Показывать только активные уровни'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список уровней сложности',
        type: [difficulty_level_response_dto_1.DifficultyLevelResponseDto]
    }),
    __param(0, (0, common_1.Query)('onlyActive', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение уровня сложности по ID',
        description: 'Возвращает подробную информацию об уровне сложности'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID уровня сложности' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные уровня сложности',
        type: difficulty_level_response_dto_1.DifficultyLevelResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение уровня сложности по slug',
        description: 'Возвращает подробную информацию об уровне сложности по его slug'
    }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Slug уровня сложности' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные уровня сложности',
        type: difficulty_level_response_dto_1.DifficultyLevelResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление уровня сложности',
        description: 'Обновляет данные уровня сложности. Доступно только администраторам.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID уровня сложности' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Уровень сложности успешно обновлен',
        type: difficulty_level_response_dto_1.DifficultyLevelResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Уровень с таким slug/code/level уже существует' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_difficulty_level_dto_1.UpdateDifficultyLevelDto]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Удаление уровня сложности',
        description: 'Удаляет уровень сложности. Нельзя удалить уровень с курсами.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID уровня сложности' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Уровень сложности успешно удален' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Нельзя удалить уровень с курсами' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/courses'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов уровня сложности',
        description: 'Возвращает список курсов уровня сложности с краткой информацией для карточек'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID уровня сложности' }),
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
        description: 'Список курсов уровня сложности',
        type: difficulty_level_with_courses_dto_1.DifficultyLevelWithCoursesDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(12), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "getLevelCourses", null);
__decorate([
    (0, common_1.Post)(':id/update-statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление статистики уровня сложности',
        description: 'Пересчитывает количество курсов, студентов и средний процент завершения'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID уровня сложности' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика успешно обновлена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "updateLevelStatistics", null);
__decorate([
    (0, common_1.Post)('update-all-statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление статистики всех уровней сложности',
        description: 'Пересчитывает статистику для всех уровней сложности'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика успешно обновлена' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "updateAllLevelsStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение статистики по всем уровням сложности',
        description: 'Возвращает статистику по курсам и студентам для каждого уровня'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика по уровням сложности' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DifficultyLevelsController.prototype, "getLevelsStatistics", null);
exports.DifficultyLevelsController = DifficultyLevelsController = DifficultyLevelsController_1 = __decorate([
    (0, swagger_1.ApiTags)('difficulty-levels'),
    (0, common_1.Controller)('difficulty-levels'),
    __metadata("design:paramtypes", [difficulty_levels_service_1.DifficultyLevelsService])
], DifficultyLevelsController);
//# sourceMappingURL=difficulty-levels.controller.js.map