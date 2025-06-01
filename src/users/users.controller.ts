import {
    Controller,
    Get,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    ForbiddenException,
    NotFoundException,
    Logger,
    Patch,
    Post
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    // @UseGuards(RolesGuard)
    // @Roles('admin')
    @ApiOperation({ summary: 'Получение профиля пользователя по ID ' })
    @ApiResponse({ status: 200, description: 'Профиль пользователя' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiParam({ name: 'id', description: 'ID пользователя' })
    async getUserById(@Param('id') id: string) {
        // this.logger.log(`Админ запрашивает профиль пользователя с ID: ${id}`);

        const user = await this.usersService.findById(id);
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
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

    @Put(':id')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles('admin', 'user')
    @ApiOperation({ summary: 'Обновление профиля пользователя' })
    @ApiResponse({ status: 200, description: 'Профиль успешно обновлен' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiParam({ name: 'id', description: 'ID пользователя' })
    @ApiBody({ type: UpdateUserDto })
    async updateUser(
        @Param('id') id: string,
        @Request() req,
        @Body() updateUserDto: UpdateUserDto
    ) {
        // Проверяем права доступа: обычный пользователь может обновить только свой профиль
        // const currentUserId = req.user.userId;
        // const isAdmin = req.user.roles && req.user.roles.includes('admin');

        // if (id !== currentUserId && !isAdmin) {
        //     throw new ForbiddenException('У вас нет прав на редактирование профиля другого пользователя');
        // }

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

    @Patch(':id/block')
    // @UseGuards(RolesGuard)
    // @Roles('admin')
    @ApiOperation({ summary: 'Блокировка/разблокировка пользователя ' })
    @ApiResponse({ status: 200, description: 'Статус пользователя изменен' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiParam({ name: 'id', description: 'ID пользователя' })
    @ApiBody({ schema: { type: 'object', properties: { isBlocked: { type: 'boolean' } } } })
    async blockUser(
        @Param('id') id: string,
        @Body('isBlocked') isBlocked: boolean,
        @Request() req
    ) {
        // Проверка, чтобы админ не заблокировал сам себя
        if (id === req.user.userId) {
            throw new ForbiddenException('Нельзя изменить статус блокировки своего аккаунта');
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

    @Delete(':id')
    // @UseGuards(RolesGuard)
    // @Roles('admin')
    @ApiOperation({ summary: 'Удаление пользователя' })
    @ApiResponse({ status: 200, description: 'Пользователь успешно удален' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiParam({ name: 'id', description: 'ID пользователя' })
    async deleteUser(@Param('id') id: string, @Request() req) {
        // Проверка, чтобы админ не удалил сам себя
        if (id === req.user.userId) {
            throw new ForbiddenException('Нельзя удалить свой аккаунт');
        }

        // this.logger.log(`Админ ${req.user.email} удаляет пользователя с ID: ${id}`);

        await this.usersService.deleteUser(id);

        return {
            message: 'Пользователь успешно удален'
        };
    }

    @Post(':userId/roles/:roleId')
    // @Roles('admin')
    @ApiOperation({ summary: 'Добавление роли пользователю' })
    @ApiResponse({ status: 200, description: 'Роль успешно добавлена' })
    @ApiResponse({ status: 404, description: 'Пользователь или роль не найдены' })
    addRoleToUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
        return this.usersService.addRoleToUser(userId, roleId);
    }

    @Delete(':userId/roles/:roleId')
    // @Roles('admin')
    @ApiOperation({ summary: 'Удаление роли у пользователя' })
    @ApiResponse({ status: 200, description: 'Роль успешно удалена' })
    @ApiResponse({ status: 404, description: 'Пользователь или роль не найдены' })
    removeRoleFromUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
        return this.usersService.removeRoleFromUser(userId, roleId);
    }


    @Get()
    // @UseGuards(RolesGuard)
    // @Roles('admin') // Только администраторы могут получать список всех пользователей
    @ApiOperation({ summary: 'Получение списка всех пользователей' })
    @ApiResponse({
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
    })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    async getAllUsers(@Request() req) {
        // this.logger.log(`Администратор ${req.user.email} запрашивает список всех пользователей`);

        const users = await this.usersService.findAll();

        // Преобразуем данные для ответа
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
}
