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
var TeachersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const teachers_service_1 = require("./teachers.service");
const create_teacher_dto_1 = require("./dto/create-teacher.dto");
const update_teacher_dto_1 = require("./dto/update-teacher.dto");
const teacher_approval_dto_1 = require("./dto/teacher-approval.dto");
const teacher_response_dto_1 = require("./dto/teacher-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let TeachersController = TeachersController_1 = class TeachersController {
    teachersService;
    logger = new common_1.Logger(TeachersController_1.name);
    constructor(teachersService) {
        this.teachersService = teachersService;
    }
    async createTeacherApplication(createTeacherDto) {
        this.logger.log(`Подача заявки на регистрацию преподавателя: ${createTeacherDto.email}`);
        const teacher = await this.teachersService.createApplication(createTeacherDto);
        return {
            message: 'Заявка на регистрацию преподавателя успешно подана. Ожидайте одобрения администратора.',
            teacher: teacher
        };
    }
    async getAllTeachers(status, page = 1, limit = 10, req) {
        const isAdmin = true;
        this.logger.log(`Запрос списка преподавателей. Статус: ${status}, Страница: ${page}, Лимит: ${limit}`);
        const filterStatus = isAdmin ? status || 'all' : 'approved';
        const result = await this.teachersService.findAll(filterStatus, page, limit);
        return {
            teachers: result.teachers,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getTeacherById(id) {
        this.logger.log(`Запрос преподавателя с ID: ${id}`);
        const teacher = await this.teachersService.findById(id);
        if (!teacher) {
            throw new common_1.NotFoundException('Преподаватель не найден');
        }
        return { teacher };
    }
    async updateTeacher(id, updateTeacherDto, req) {
        const isAdmin = true;
        const isOwner = true;
        this.logger.log(`Обновление данных преподавателя с ID: ${id}`);
        const updatedTeacher = await this.teachersService.update(id, updateTeacherDto);
        return {
            message: 'Данные преподавателя успешно обновлены',
            teacher: updatedTeacher
        };
    }
    async approveTeacher(id, approvalDto, req) {
        const adminId = req?.user?.userId;
        this.logger.log(`Администратор изменяет статус заявки преподавателя ${id} на ${approvalDto.approvalStatus}`);
        if (approvalDto.approvalStatus === 'rejected' && !approvalDto.rejectionReason) {
            throw new common_1.BadRequestException('При отклонении заявки необходимо указать причину');
        }
        const result = await this.teachersService.approveApplication(id, approvalDto.approvalStatus, adminId, approvalDto.rejectionReason);
        return {
            message: approvalDto.approvalStatus === 'approved'
                ? 'Заявка преподавателя одобрена'
                : 'Заявка преподавателя отклонена',
            teacher: result
        };
    }
    async assignCourseToTeacher(teacherId, courseId) {
        this.logger.log(`Назначение курса ${courseId} преподавателю ${teacherId}`);
        const result = await this.teachersService.assignCourse(teacherId, courseId);
        return {
            message: 'Курс успешно назначен преподавателю',
            teacher: result
        };
    }
    async removeCourseFromTeacher(teacherId, courseId) {
        this.logger.log(`Удаление курса ${courseId} у преподавателя ${teacherId}`);
        const result = await this.teachersService.removeCourse(teacherId, courseId);
        return {
            message: 'Курс успешно удален у преподавателя',
            teacher: result
        };
    }
    async deleteTeacher(id) {
        this.logger.log(`Удаление преподавателя с ID: ${id}`);
        await this.teachersService.delete(id);
        return {
            message: 'Преподаватель успешно удален'
        };
    }
    async getPendingApplications(page = 1, limit = 10) {
        this.logger.log(`Получение заявок на рассмотрение. Страница: ${page}, Лимит: ${limit}`);
        const result = await this.teachersService.findAll('pending', page, limit);
        return {
            applications: result.teachers,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }
    async getTeacherStatistics(id) {
        this.logger.log(`Получение статистики преподавателя с ID: ${id}`);
        const statistics = await this.teachersService.getTeacherStatistics(id);
        return {
            teacherId: id,
            statistics: statistics
        };
    }
    async blockTeacher(id, isBlocked, reason) {
        this.logger.log(`Изменение статуса блокировки преподавателя ${id} на ${isBlocked}`);
        const teacher = await this.teachersService.blockTeacher(id, isBlocked, reason);
        return {
            message: isBlocked
                ? 'Преподаватель успешно заблокирован'
                : 'Преподаватель успешно разблокирован',
            teacher: teacher
        };
    }
    async getTeacherCourses(id) {
        this.logger.log(`Получение курсов преподавателя с ID: ${id}`);
        const teacher = await this.teachersService.findById(id);
        if (!teacher) {
            throw new common_1.NotFoundException('Преподаватель не найден');
        }
        const courses = teacher.assignedCourses || [];
        return {
            teacherId: id,
            courses: courses,
            totalCourses: courses.length,
            publishedCourses: courses.filter(c => c.isPublished).length,
            activeCourses: courses.filter(c => c.is_active).length
        };
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Подача заявки на регистрацию преподавателя',
        description: 'Создает заявку на регистрацию преподавателя. Статус заявки будет "pending" до одобрения администратором.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Заявка успешно подана',
        type: teacher_response_dto_1.TeacherResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Преподаватель с таким email уже существует' }),
    (0, swagger_1.ApiBody)({ type: create_teacher_dto_1.CreateTeacherDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_teacher_dto_1.CreateTeacherDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "createTeacherApplication", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Получение списка преподавателей' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['pending', 'approved', 'rejected', 'all'],
        description: 'Фильтр по статусу (только для админов)'
    }),
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
        description: 'Список преподавателей',
        type: [teacher_response_dto_1.TeacherResponseDto]
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getAllTeachers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получение преподавателя по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID преподавателя' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные преподавателя',
        type: teacher_response_dto_1.TeacherResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновление данных преподавателя' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID преподавателя' }),
    (0, swagger_1.ApiBody)({ type: update_teacher_dto_1.UpdateTeacherDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные преподавателя успешно обновлены',
        type: teacher_response_dto_1.TeacherResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав на редактирование' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_teacher_dto_1.UpdateTeacherDto, Object]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "updateTeacher", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Одобрение или отклонение заявки преподавателя',
        description: 'Только администраторы могут одобрять или отклонять заявки на регистрацию преподавателей'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID преподавателя' }),
    (0, swagger_1.ApiBody)({ type: teacher_approval_dto_1.TeacherApprovalDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус заявки изменен' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, teacher_approval_dto_1.TeacherApprovalDto, Object]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "approveTeacher", null);
__decorate([
    (0, common_1.Post)(':teacherId/courses/:courseId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Назначение курса преподавателю',
        description: 'Закрепляет курс за выбранным преподавателем'
    }),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'ID преподавателя' }),
    (0, swagger_1.ApiParam)({ name: 'courseId', description: 'ID курса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Курс успешно назначен преподавателю' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель или курс не найден' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Курс уже назначен этому преподавателю' }),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "assignCourseToTeacher", null);
__decorate([
    (0, common_1.Delete)(':teacherId/courses/:courseId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Удаление курса у преподавателя',
        description: 'Убирает назначение курса у преподавателя'
    }),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'ID преподавателя' }),
    (0, swagger_1.ApiParam)({ name: 'courseId', description: 'ID курса' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Курс успешно удален у преподавателя' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель или курс не найден' }),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "removeCourseFromTeacher", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Удаление заявки или профиля преподавателя',
        description: 'Полностью удаляет заявку или профиль преподавателя из системы. Также удаляет связанные курсы если они есть.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID преподавателя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Преподаватель успешно удален' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель не найден' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Нельзя удалить преподавателя с активными курсами' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "deleteTeacher", null);
__decorate([
    (0, common_1.Get)('pending/applications'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение заявок на рассмотрение',
        description: 'Возвращает список всех заявок на регистрацию преподавателей со статусом "pending"'
    }),
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
        description: 'Список заявок на рассмотрение',
        type: [teacher_response_dto_1.TeacherResponseDto]
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getPendingApplications", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение статистики преподавателя',
        description: 'Возвращает статистику по курсам, студентам и оценкам преподавателя'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID преподавателя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика преподавателя' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherStatistics", null);
__decorate([
    (0, common_1.Post)(':id/block'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Блокировка или разблокировка преподавателя',
        description: 'Изменяет статус блокировки преподавателя'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID преподавателя' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                isBlocked: { type: 'boolean' },
                reason: { type: 'string', description: 'Причина блокировки' }
            },
            required: ['isBlocked']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус блокировки изменен' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Преподаватель не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isBlocked')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "blockTeacher", null);
__decorate([
    (0, common_1.Get)(':id/courses'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение курсов преподавателя',
        description: 'Возвращает список всех курсов с полной информацией'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherCourses", null);
exports.TeachersController = TeachersController = TeachersController_1 = __decorate([
    (0, swagger_1.ApiTags)('teachers'),
    (0, common_1.Controller)('teachers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [teachers_service_1.TeachersService])
], TeachersController);
//# sourceMappingURL=teachers.controller.js.map