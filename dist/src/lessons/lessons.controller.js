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
var LessonsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lessons_service_1 = require("./lessons.service");
const create_lesson_dto_1 = require("./dto/create-lesson.dto");
const update_lesson_dto_1 = require("./dto/update-lesson.dto");
let LessonsController = LessonsController_1 = class LessonsController {
    lessonsService;
    logger = new common_1.Logger(LessonsController_1.name);
    constructor(lessonsService) {
        this.lessonsService = lessonsService;
    }
    async createLesson(createLessonDto, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Создание урока: ${createLessonDto.title} для курса ${createLessonDto.courseId}`);
        const lesson = await this.lessonsService.create(createLessonDto, currentUserId, isAdmin);
        return {
            message: 'Урок успешно создан',
            lesson: lesson
        };
    }
    async getLessonsByCourse(courseId, includeUnpublished = false, req) {
        const isAdmin = true;
        const isTeacher = true;
        this.logger.log(`Получение уроков курса ${courseId}`);
        const showUnpublished = includeUnpublished && (isAdmin || isTeacher);
        const lessons = await this.lessonsService.findByCourse(courseId, showUnpublished);
        return {
            courseId: courseId,
            lessons: lessons,
            totalLessons: lessons.length
        };
    }
    async getLessonById(id) {
        this.logger.log(`Запрос урока с ID: ${id}`);
        const lesson = await this.lessonsService.findById(id);
        if (!lesson) {
            throw new common_1.NotFoundException('Урок не найден');
        }
        return { lesson };
    }
    async updateLesson(id, updateLessonDto, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Обновление урока с ID: ${id}`);
        const updatedLesson = await this.lessonsService.update(id, updateLessonDto, currentUserId, isAdmin);
        return {
            message: 'Урок успешно обновлен',
            lesson: updatedLesson
        };
    }
    async deleteLesson(id, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Удаление урока с ID: ${id}`);
        await this.lessonsService.delete(id, currentUserId, isAdmin);
        return {
            message: 'Урок успешно удален'
        };
    }
    async publishLesson(id, isPublished, req) {
        const currentUserId = 'temp-user-id';
        const isAdmin = true;
        this.logger.log(`Изменение статуса публикации урока ${id} на ${isPublished}`);
        const lesson = await this.lessonsService.updatePublishStatus(id, isPublished, currentUserId, isAdmin);
        return {
            message: isPublished
                ? 'Урок успешно опубликован'
                : 'Урок снят с публикации',
            lesson: lesson
        };
    }
    async getNextLesson(currentLessonId) {
        this.logger.log(`Получение следующего урока после ${currentLessonId}`);
        const nextLesson = await this.lessonsService.getNextLesson(currentLessonId);
        if (!nextLesson) {
            return {
                message: 'Это последний урок в курсе',
                nextLesson: null
            };
        }
        return {
            nextLesson: nextLesson
        };
    }
    async getPreviousLesson(currentLessonId) {
        this.logger.log(`Получение предыдущего урока перед ${currentLessonId}`);
        const previousLesson = await this.lessonsService.getPreviousLesson(currentLessonId);
        if (!previousLesson) {
            return {
                message: 'Это первый урок в курсе',
                previousLesson: null
            };
        }
        return {
            previousLesson: previousLesson
        };
    }
};
exports.LessonsController = LessonsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Создание нового урока',
        description: 'Создает новый урок и добавляет его к определенному курсу'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Урок успешно создан' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lesson_dto_1.CreateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "createLesson", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение всех уроков курса',
        description: 'Возвращает список всех уроков курса в правильном порядке'
    }),
    (0, swagger_1.ApiParam)({ name: 'courseId', description: 'ID курса' }),
    (0, swagger_1.ApiQuery)({
        name: 'includeUnpublished',
        required: false,
        type: Boolean,
        description: 'Включать ли неопубликованные уроки (только для преподавателей и админов)'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список уроков курса' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Курс не найден' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Query)('includeUnpublished')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "getLessonsByCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение урока по ID',
        description: 'Возвращает подробную информацию об уроке'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID урока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Данные урока' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Урок не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "getLessonById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновление урока',
        description: 'Обновляет данные урока. Преподаватель может редактировать только уроки своих курсов.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID урока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Урок успешно обновлен' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Урок не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lesson_dto_1.UpdateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Удаление урока',
        description: 'Удаляет урок и все связанные с ним домашние задания'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID урока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Урок успешно удален' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Урок не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "deleteLesson", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, swagger_1.ApiOperation)({
        summary: 'Публикация или снятие с публикации урока',
        description: 'Изменяет статус публикации урока'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID урока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус публикации изменен' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Урок не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isPublished')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "publishLesson", null);
__decorate([
    (0, common_1.Get)(':id/next'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение следующего урока в курсе',
        description: 'Возвращает следующий урок в порядке изучения'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID текущего урока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Следующий урок' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Следующий урок не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "getNextLesson", null);
__decorate([
    (0, common_1.Get)(':id/previous'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение предыдущего урока в курсе',
        description: 'Возвращает предыдущий урок в порядке изучения'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID текущего урока' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Предыдущий урок' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Предыдущий урок не найден' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LessonsController.prototype, "getPreviousLesson", null);
exports.LessonsController = LessonsController = LessonsController_1 = __decorate([
    (0, swagger_1.ApiTags)('lessons'),
    (0, common_1.Controller)('lessons'),
    __metadata("design:paramtypes", [lessons_service_1.LessonsService])
], LessonsController);
//# sourceMappingURL=lessons.controller.js.map