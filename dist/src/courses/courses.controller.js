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
var CoursesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const courses_service_1 = require("./courses.service");
const create_course_dto_1 = require("./dto/create-course.dto");
const update_course_dto_1 = require("./dto/update-course.dto");
const course_response_dto_1 = require("./dto/course-response.dto");
const course_filter_dto_1 = require("./dto/course-filter.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const teachers_service_1 = require("../teachers/teachers.service");
const common_2 = require("@nestjs/common");
let CoursesController = CoursesController_1 = class CoursesController {
    coursesService;
    teachersService;
    logger = new common_1.Logger(CoursesController_1.name);
    constructor(coursesService, teachersService) {
        this.coursesService = coursesService;
        this.teachersService = teachersService;
    }
    async createCourse(createCourseDto, req) {
        const currentUserId = req?.user?.userId;
        const isAdmin = req?.user?.roles?.includes('admin');
        this.logger.log(`Создание курса: ${createCourseDto.title}`);
        if (!isAdmin && createCourseDto.teacherId !== currentUserId) {
            throw new common_1.ForbiddenException('Вы можете создавать курсы только для себя');
        }
        const course = await this.coursesService.create(createCourseDto);
        return {
            message: 'Курс успешно создан',
            course: course
        };
    }
    async getAllCourses(page = 1, limit = 10, filters, req) {
        const isAdmin = true;
        this.logger.log(`Запрос списка курсов. Страница: ${page}, Лимит: ${limit}`);
        if (!isAdmin) {
            filters.isPublished = true;
            filters.isActive = true;
        }
        const result = await this.coursesService.findAll(filters, page, limit);
        return {
            courses: result.courses,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            },
            filters: filters
        };
    }
    async getCourseById(id, includeLessons = false) {
        this.logger.log(`Запрос курса с ID: ${id}`);
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new common_1.NotFoundException('Курс не найден');
        }
        return { course };
    }
    async updateCourse(id, updateCourseDto, req) {
        const currentUserId = req?.user?.userId;
        const isAdmin = req?.user?.roles?.includes('admin');
        this.logger.log(`Обновление курса с ID: ${id}`);
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new common_1.NotFoundException('Курс не найден');
        }
        if (!isAdmin && course.teacherId.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('У вас нет прав на редактирование этого курса');
        }
        const updatedCourse = await this.coursesService.update(id, updateCourseDto);
        return {
            message: 'Курс успешно обновлен',
            course: updatedCourse
        };
    }
    async deleteCourse(id, req) {
        const currentUserId = req?.user?.userId;
        const isAdmin = req?.user?.roles?.includes('admin');
        this.logger.log(`Удаление курса с ID: ${id}`);
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new common_1.NotFoundException('Курс не найден');
        }
        if (!isAdmin && course.teacherId.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('У вас нет прав на удаление этого курса');
        }
        await this.coursesService.delete(id);
        return {
            message: 'Курс успешно удален'
        };
    }
    async publishCourse(id, isPublished, req) {
        const currentUserId = req?.user?.userId;
        const isAdmin = req?.user?.roles?.includes('admin');
        this.logger.log(`Изменение статуса публикации курса ${id} на ${isPublished}`);
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new common_1.NotFoundException('Курс не найден');
        }
        const isOwner = course.teacherId.toString() === currentUserId;
        if (!isAdmin && !isOwner) {
            this.logger.warn(`Отказано в доступе. Пользователь ${req?.user?.email} ` +
                `(ID: ${currentUserId}) пытается изменить статус публикации курса ${id}. ` +
                `Владелец курса: ${course.teacherId}`);
            throw new common_1.ForbiddenException('У вас нет прав на изменение статуса публикации этого курса. ' +
                'Только владелец курса или администратор могут изменять статус публикации.');
        }
        if (!isAdmin && isOwner) {
            const teacher = await this.teachersService.findById(currentUserId);
            if (!teacher) {
                throw new common_1.NotFoundException('Преподаватель не найден');
            }
            if (!teacher.isApproved) {
                throw new common_1.ForbiddenException('Только одобренные преподаватели могут публиковать курсы');
            }
            if (teacher.isBlocked) {
                throw new common_1.ForbiddenException('Заблокированные преподаватели не могут изменять статус публикации курсов');
            }
        }
        const updatedCourse = await this.coursesService.updatePublishStatus(id, isPublished);
        return {
            message: isPublished
                ? 'Курс успешно опубликован'
                : 'Курс снят с публикации',
            course: updatedCourse
        };
    }
    async getCourseLessons(id) {
        this.logger.log(`Получение уроков курса с ID: ${id}`);
        const lessons = await this.coursesService.getCourseLessons(id);
        return {
            courseId: id,
            lessons: lessons,
            totalLessons: lessons.length
        };
    }
    async getCourseStatistics(id) {
        this.logger.log(`Получение статистики курса с ID: ${id}`);
        const statistics = await this.coursesService.getCourseStatistics(id);
        return {
            courseId: id,
            statistics: statistics
        };
    }
    async getFeaturedCourses(limit = 6) {
        this.logger.log(`Получение рекомендуемых курсов. Лимит: ${limit}`);
        const courses = await this.coursesService.getFeaturedCourses(limit);
        return {
            courses: courses,
            totalCourses: courses.length
        };
    }
    async getPopularCourses(limit = 10) {
        this.logger.log(`Получение популярных курсов. Лимит: ${limit}`);
        const courses = await this.coursesService.getPopularCourses(limit);
        return {
            courses: courses,
            totalCourses: courses.length
        };
    }
    async getCategories() {
        this.logger.log('Получение списка категорий курсов');
        const categories = await this.coursesService.getCategories();
        return {
            categories: categories
        };
    }
    async enrollInCourse(courseId, req) {
        const userId = 'temp-user-id';
        this.logger.log(`Пользователь ${userId} записывается на курс ${courseId}`);
        const enrollment = await this.coursesService.enrollStudent(courseId, userId);
        return {
            message: 'Вы успешно записались на курс',
            enrollment: enrollment
        };
    }
    async getCourseStudents(id, page = 1, limit = 20) {
        this.logger.log(`Получение списка студентов курса с ID: ${id}`);
        const result = await this.coursesService.getCourseStudents(id, page, limit);
        return {
            courseId: id,
            students: result.students,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async duplicateCourse(id, newTitle, req) {
        const currentUserId = 'temp-user-id';
        this.logger.log(`Дублирование курса ${id} с новым названием: ${newTitle}`);
        const duplicatedCourse = await this.coursesService.duplicateCourse(id, newTitle, currentUserId);
        return {
            message: 'Курс успешно дублирован',
            originalCourseId: id,
            duplicatedCourse: duplicatedCourse
        };
    }
    async getCoursesByCategory(categoryId, page, limit) {
        this.logger.log(`Получение курсов категории ${categoryId}. Страница: ${page}, Лимит: ${limit}`);
        const result = await this.coursesService.getCoursesByCategory(categoryId, page, limit, 'card');
        return {
            category: result.category,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getCoursesByCategoryFull(categoryId, page, limit) {
        this.logger.log(`Получение полных данных курсов категории ${categoryId}`);
        const result = await this.coursesService.getCoursesByCategory(categoryId, page, limit, 'full');
        return {
            category: result.category,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getCoursesByCategoryAdmin(categoryId, page, limit) {
        this.logger.log(`Получение админских данных курсов категории ${categoryId}`);
        const result = await this.coursesService.getCoursesByCategory(categoryId, page, limit, 'admin');
        return {
            category: result.category,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getCoursesByDifficultyLevel(difficultyLevelId, page, limit) {
        this.logger.log(`Получение курсов уровня сложности ${difficultyLevelId}. Страница: ${page}, Лимит: ${limit}`);
        const result = await this.coursesService.getCoursesByDifficultyLevel(difficultyLevelId, page, limit, 'card');
        return {
            difficultyLevel: result.difficultyLevel,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getCoursesByDifficultyLevelFull(difficultyLevelId, page, limit) {
        this.logger.log(`Получение полных данных курсов уровня сложности ${difficultyLevelId}`);
        const result = await this.coursesService.getCoursesByDifficultyLevel(difficultyLevelId, page, limit, 'full');
        return {
            difficultyLevel: result.difficultyLevel,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getCoursesByDifficultyLevelAdmin(difficultyLevelId, page, limit) {
        this.logger.log(`Получение админских данных курсов уровня сложности ${difficultyLevelId}`);
        const result = await this.coursesService.getCoursesByDifficultyLevel(difficultyLevelId, page, limit, 'admin');
        return {
            difficultyLevel: result.difficultyLevel,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Создание нового курса',
        description: 'Создает новый курс. Только одобренные преподаватели могут создавать курсы.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Курс успешно создан',
        type: course_response_dto_1.CourseResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав на создание курса' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель не найден' }),
    (0, swagger_1.ApiBody)({ type: create_course_dto_1.CreateCourseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_dto_1.CreateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение списка курсов',
        description: 'Возвращает список курсов с возможностью фильтрации и поиска'
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Номер страницы (по умолчанию 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице (по умолчанию 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String, description: 'Фильтр по категории' }),
    (0, swagger_1.ApiQuery)({ name: 'difficulty_level', required: false, enum: ['beginner', 'intermediate', 'advanced'], description: 'Фильтр по уровню сложности' }),
    (0, swagger_1.ApiQuery)({ name: 'teacherId', required: false, type: String, description: 'Фильтр по преподавателю' }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', required: false, type: Number, description: 'Минимальная цена' }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false, type: Number, description: 'Максимальная цена' }),
    (0, swagger_1.ApiQuery)({ name: 'language', required: false, type: String, description: 'Язык курса' }),
    (0, swagger_1.ApiQuery)({ name: 'isPublished', required: false, type: Boolean, description: 'Только опубликованные курсы' }),
    (0, swagger_1.ApiQuery)({ name: 'isFeatured', required: false, type: Boolean, description: 'Только рекомендуемые курсы' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Поиск по названию и описанию' }),
    (0, swagger_1.ApiQuery)({ name: 'tag', required: false, type: String, description: 'Поиск по тегам' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список курсов',
        type: [course_response_dto_1.CourseResponseDto]
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, course_filter_dto_1.CourseFilterDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getAllCourses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курса по ID',
        description: 'Возвращает подробную информацию о курсе включая уроки'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные курса',
        type: course_response_dto_1.CourseResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('includeLessons')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление курса',
        description: 'Обновляет данные курса. Преподаватель может редактировать только свои курсы.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiBody)({ type: update_course_dto_1.UpdateCourseDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Курс успешно обновлен',
        type: course_response_dto_1.CourseResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав на редактирование' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_course_dto_1.UpdateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Удаление курса',
        description: 'Удаляет курс и все связанные с ним уроки. Нельзя удалить курс с активными подписками.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Курс успешно удален' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав на удаление' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Нельзя удалить курс с активными подписками' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Публикация или снятие с публикации курса',
        description: 'Изменяет статус публикации курса'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                isPublished: { type: 'boolean' }
            },
            required: ['isPublished']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус публикации изменен' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isPublished')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "publishCourse", null);
__decorate([
    (0, common_1.Get)(':id/lessons'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение уроков курса',
        description: 'Возвращает список всех уроков курса в правильном порядке'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список уроков курса' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseLessons", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение статистики курса',
        description: 'Возвращает статистику по студентам, урокам и доходам курса'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика курса' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseStatistics", null);
__decorate([
    (0, common_1.Get)('featured/list'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение рекомендуемых курсов',
        description: 'Возвращает список рекомендуемых курсов'
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Количество курсов (по умолчанию 6)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список рекомендуемых курсов',
        type: [course_response_dto_1.CourseResponseDto]
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getFeaturedCourses", null);
__decorate([
    (0, common_1.Get)('popular/list'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение популярных курсов',
        description: 'Возвращает список популярных курсов по количеству студентов и рейтингу'
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Количество курсов (по умолчанию 10)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список популярных курсов',
        type: [course_response_dto_1.CourseResponseDto]
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getPopularCourses", null);
__decorate([
    (0, common_1.Get)('categories/list'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение списка категорий курсов',
        description: 'Возвращает список всех доступных категорий с количеством курсов в каждой'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список категорий курсов' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)(':id/enroll'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Записаться на курс',
        description: 'Создает подписку пользователя на курс'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Успешная запись на курс' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Курс недоступен для записи' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Пользователь уже записан на этот курс' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "enrollInCourse", null);
__decorate([
    (0, common_1.Get)(':id/students'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение списка студентов курса',
        description: 'Возвращает список студентов, записанных на курс'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Номер страницы' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список студентов курса' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourseStudents", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Дублирование курса',
        description: 'Создает копию курса со всеми уроками'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID курса для дублирования' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Новое название курса' }
            },
            required: ['title']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Курс успешно дублирован',
        type: course_response_dto_1.CourseResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "duplicateCourse", null);
__decorate([
    (0, common_1.Get)('category/:categoryId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов категории',
        description: 'Возвращает курсы указанной категории с краткой информацией для карточек'
    }),
    (0, swagger_1.ApiParam)({ name: 'categoryId', description: 'ID категории' }),
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
        description: 'Список курсов категории'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Query)('page', new common_2.DefaultValuePipe(1), common_2.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_2.DefaultValuePipe(12), common_2.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByCategory", null);
__decorate([
    (0, common_1.Get)('category/:categoryId/full'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов категории с полной информацией',
        description: 'Возвращает курсы категории с подробной информацией (без админских данных)'
    }),
    (0, swagger_1.ApiParam)({ name: 'categoryId', description: 'ID категории' }),
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
        description: 'Список курсов категории с полной информацией'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Query)('page', new common_2.DefaultValuePipe(1), common_2.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_2.DefaultValuePipe(12), common_2.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByCategoryFull", null);
__decorate([
    (0, common_1.Get)('category/:categoryId/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'owner'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов категории со всей информацией',
        description: 'Возвращает курсы категории со всей информацией (только для админов и владельцев)'
    }),
    (0, swagger_1.ApiParam)({ name: 'categoryId', description: 'ID категории' }),
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
        description: 'Список курсов категории со всей информацией'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Категория не найдена' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Query)('page', new common_2.DefaultValuePipe(1), common_2.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_2.DefaultValuePipe(12), common_2.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByCategoryAdmin", null);
__decorate([
    (0, common_1.Get)('difficulty/:difficultyLevelId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов по уровню сложности',
        description: 'Возвращает курсы указанного уровня сложности с краткой информацией для карточек'
    }),
    (0, swagger_1.ApiParam)({ name: 'difficultyLevelId', description: 'ID уровня сложности' }),
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
        description: 'Список курсов уровня сложности'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    __param(0, (0, common_1.Param)('difficultyLevelId')),
    __param(1, (0, common_1.Query)('page', new common_2.DefaultValuePipe(1), common_2.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_2.DefaultValuePipe(12), common_2.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByDifficultyLevel", null);
__decorate([
    (0, common_1.Get)('difficulty/:difficultyLevelId/full'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов по уровню сложности с полной информацией',
        description: 'Возвращает курсы уровня сложности с подробной информацией (без админских данных)'
    }),
    (0, swagger_1.ApiParam)({ name: 'difficultyLevelId', description: 'ID уровня сложности' }),
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
        description: 'Список курсов уровня сложности с полной информацией'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    __param(0, (0, common_1.Param)('difficultyLevelId')),
    __param(1, (0, common_1.Query)('page', new common_2.DefaultValuePipe(1), common_2.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_2.DefaultValuePipe(12), common_2.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByDifficultyLevelFull", null);
__decorate([
    (0, common_1.Get)('difficulty/:difficultyLevelId/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'owner'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов по уровню сложности со всей информацией',
        description: 'Возвращает курсы уровня сложности со всей информацией (только для админов и владельцев)'
    }),
    (0, swagger_1.ApiParam)({ name: 'difficultyLevelId', description: 'ID уровня сложности' }),
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
        description: 'Список курсов уровня сложности со всей информацией'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Уровень сложности не найден' }),
    __param(0, (0, common_1.Param)('difficultyLevelId')),
    __param(1, (0, common_1.Query)('page', new common_2.DefaultValuePipe(1), common_2.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_2.DefaultValuePipe(12), common_2.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCoursesByDifficultyLevelAdmin", null);
exports.CoursesController = CoursesController = CoursesController_1 = __decorate([
    (0, swagger_1.ApiTags)('courses'),
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [courses_service_1.CoursesService, teachers_service_1.TeachersService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map