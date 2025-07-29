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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const update_user_dto_1 = require("./dto/update-user.dto");
let UsersController = UsersController_1 = class UsersController {
    usersService;
    logger = new common_1.Logger(UsersController_1.name);
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getUserById(id) {
        const user = await this.usersService.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        return {
            id: user.id,
            avatar: user.avatarId,
            email: user.email,
            name: user.name,
            second_name: user.second_name,
            age: user.age,
            telefon_number: user.telefon_number,
            isEmailVerified: user.isEmailVerified,
            isBlocked: user.isBlocked,
            roles: user.roles?.map(role => typeof role === 'object' ? role.name : role),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
    async updateUser(id, req, updateUserDto) {
        this.logger.log(`Пользователь ${req.user.email} обновляет профиль пользователя с ID: ${id}`);
        const updatedUser = await this.usersService.updateUser(id, updateUserDto);
        return {
            message: 'Профиль успешно обновлен',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                second_name: updatedUser.second_name,
                age: updatedUser.age,
                telefon_number: updatedUser.telefon_number,
                isEmailVerified: updatedUser.isEmailVerified,
                roles: updatedUser.roles?.map(role => typeof role === 'object' ? role.name : role)
            }
        };
    }
    async blockUser(id, isBlocked, req) {
        if (id === req.user.userId) {
            throw new common_1.ForbiddenException('Нельзя изменить статус блокировки своего аккаунта');
        }
        this.logger.log(`Админ ${req.user.email} изменяет статус блокировки пользователя с ID: ${id} на ${isBlocked}`);
        const user = await this.usersService.blockUser(id, isBlocked);
        return {
            message: isBlocked
                ? 'Пользователь успешно заблокирован'
                : 'Пользователь успешно разблокирован',
            user: {
                id: user.id,
                email: user.email,
                isBlocked: user.isBlocked
            }
        };
    }
    async deleteUser(id, req) {
        if (id === req.user.userId) {
            throw new common_1.ForbiddenException('Нельзя удалить свой аккаунт');
        }
        await this.usersService.deleteUser(id);
        return {
            message: 'Пользователь успешно удален'
        };
    }
    addRoleToUser(userId, roleId) {
        return this.usersService.addRoleToUser(userId, roleId);
    }
    removeRoleFromUser(userId, roleId) {
        return this.usersService.removeRoleFromUser(userId, roleId);
    }
    async getAllUsers(req) {
        this.logger.log(`Администратор ${req.user.email} запрашивает список всех пользователей`);
        const users = await this.usersService.findAll();
        return users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            second_name: user.second_name,
            age: user.age,
            telefon_number: user.telefon_number,
            isEmailVerified: user.isEmailVerified,
            isBlocked: user.isBlocked,
            hasAvatar: !!user.avatarId,
            avatarUrl: user.avatarId ? `/avatars/${user.id}` : null,
            roles: user.roles?.map(role => typeof role === 'object' ? role.name : role) || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Получение профиля пользователя по ID ' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Профиль пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Не авторизован' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав доступа' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь не найден' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID пользователя' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновление профиля пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Профиль успешно обновлен' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Не авторизован' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав доступа' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь не найден' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID пользователя' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)(':id/block'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Блокировка/разблокировка пользователя ' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статус пользователя изменен' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Не авторизован' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав доступа' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь не найден' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID пользователя' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { isBlocked: { type: 'boolean' } } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isBlocked')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Удаление пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Пользователь успешно удален' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Не авторизован' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав доступа' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь не найден' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID пользователя' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)(':userId/roles/:roleId'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Добавление роли пользователю' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Роль успешно добавлена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь или роль не найдены' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addRoleToUser", null);
__decorate([
    (0, common_1.Delete)(':userId/roles/:roleId'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Удаление роли у пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Роль успешно удалена' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь или роль не найдены' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeRoleFromUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Получение списка всех пользователей' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Список пользователей',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    second_name: { type: 'string' },
                    age: { type: 'number' },
                    telefon_number: { type: 'string' },
                    isEmailVerified: { type: 'boolean' },
                    isBlocked: { type: 'boolean' },
                    hasAvatar: { type: 'boolean' },
                    roles: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Не авторизован' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Нет прав доступа' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map