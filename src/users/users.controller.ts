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
    Post,
    HttpException,
    InternalServerErrorException,
    BadRequestException
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
import { UserProfileDto } from './dto/user-profile.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { BlockUserResponseDto } from './dto/block-user-response.dto';
import { LoggerHelper } from 'src/common/logger.helper';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Получение профиля пользователя по ID' })
    @ApiResponse({
        status: 200,
        description: 'Профиль пользователя',
        type: UserProfileDto
    })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiParam({
        name: 'id',
        description: 'ID пользователя',
        type: String,
        example: '507f1f77bcf86cd799439011'
    })
    async getUserById(
        @Param('id') id: string,
        @Request() req
    ): Promise<UserProfileDto> {
        try {
            this.logger.log(`Запрос профиля пользователя с ID: ${id}`);

            // Проверяем права доступа
            const currentUserId = req.user.userId;
            const isAdmin = req.user.roles && req.user.roles.includes('admin');

            // Определяем кто просматривает профиль
            LoggerHelper.logAccessType(this.logger, currentUserId, id, isAdmin);

            // Обычный пользователь может видеть только свой профиль
            if (id !== currentUserId && !isAdmin) {
                this.logger.warn(`Пользователь ${req.user.email} пытался получить доступ к чужому профилю: ${id}`);
                throw new ForbiddenException('У вас нет прав на просмотр профиля другого пользователя');
            }

            // Получаем пользователя из сервиса
            const user = await this.usersService.findById(id);

            // Проверка существования пользователя
            if (!user) {
                this.logger.warn(`Пользователь с ID: ${id} не найден`);
                throw new NotFoundException('Пользователь не найден');
            }

            // Возвращаем DTO с типизированными данными
            return new UserProfileDto(user);

        } catch (error) {
            // Если это HttpException (например, NotFoundException или ForbiddenException)
            if (error instanceof HttpException) {
                throw error;
            }
            else {
                error = new NotFoundException('Пользователь не найден');
            }

            this.logger.error(`Ошибка при получении профиля пользователя с ID: ${id}`, error.stack);
            throw error;
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Обновление профиля пользователя' })
    @ApiResponse({
        status: 200,
        description: 'Профиль успешно обновлен',
        type: UpdateUserResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiParam({
        name: 'id',
        description: 'ID пользователя',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({ type: UpdateUserDto })
    async updateUser(
        @Param('id') id: string,
        @Request() req,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<UpdateUserResponseDto> {
        try {
            // Проверяем права доступа
            const currentUserId = req.user.userId;
            const isAdmin = req.user.roles && req.user.roles.includes('admin');

            // Определяем кто редактирует профиль
            LoggerHelper.logAccessType(this.logger, currentUserId, id, isAdmin, 'update');

            if (id !== currentUserId && !isAdmin) {
                throw new ForbiddenException('У вас нет прав на редактирование профиля другого пользователя');
            }

            const updatedUser = await this.usersService.updateUser(id, updateUserDto, isAdmin);

            return new UpdateUserResponseDto('Профиль успешно обновлен', updatedUser);

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            this.logger.error(`Ошибка при обновлении профиля пользователя с ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Произошла ошибка при обновлении профиля');
        }
    }

    //метод blockUser:
    @Patch(':id/block')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Блокировка/разблокировка пользователя' })
    @ApiResponse({
        status: 200,
        description: 'Статус пользователя изменен',
        type: BlockUserResponseDto
    })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiParam({
        name: 'id',
        description: 'ID пользователя',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                isBlocked: {
                    type: 'boolean',
                    example: true,
                    description: 'Статус блокировки'
                }
            },
            required: ['isBlocked']
        }
    })
    async blockUser(
        @Param('id') id: string,
        @Body('isBlocked') isBlocked: boolean,
        @Request() req
    ): Promise<BlockUserResponseDto> {
        try {
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
                    id: user.id || user._id?.toString(),
                    email: user.email,
                    isBlocked: user.isBlocked
                }
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            this.logger.error(`Ошибка при изменении статуса блокировки пользователя с ID: ${id}`, error.stack);
            throw new InternalServerErrorException('Произошла ошибка при изменении статуса блокировки');
        }
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
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
    @Roles('admin')
    @ApiOperation({ summary: 'Добавление роли пользователю' })
    @ApiResponse({ status: 200, description: 'Роль успешно добавлена' })
    @ApiResponse({ status: 404, description: 'Пользователь или роль не найдены' })
    addRoleToUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
        return this.usersService.addRoleToUser(userId, roleId);
    }

    @Delete(':userId/roles/:roleId')
    @Roles('admin')
    @ApiOperation({ summary: 'Удаление роли у пользователя' })
    @ApiResponse({ status: 200, description: 'Роль успешно удалена' })
    @ApiResponse({ status: 404, description: 'Пользователь или роль не найдены' })
    removeRoleFromUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
        return this.usersService.removeRoleFromUser(userId, roleId);
    }


    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Получение списка всех пользователей' })
    @ApiResponse({
        status: 200,
        description: 'Список пользователей',
        type: [UserProfileDto]
    })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    async getAllUsers(@Request() req): Promise<UserProfileDto[]> {
        try {
            this.logger.log(`Администратор ${req.user.email} запрашивает список всех пользователей`);

            const users = await this.usersService.findAll();

            // Преобразуем каждого пользователя в DTO
            return users.map(user => new UserProfileDto(user));

        } catch (error) {
            this.logger.error('Ошибка при получении списка пользователей', error.stack);
            throw new InternalServerErrorException('Произошла ошибка при получении списка пользователей');
        }
    }

    @Post(':id/confirm-email-change')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Подтверждение изменения email с помощью кода' })
    @ApiResponse({
        status: 200,
        description: 'Email успешно изменен',
        type: UpdateUserResponseDto
    })
    @ApiResponse({ status: 400, description: 'Неверный код или просроченный запрос' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiParam({
        name: 'id',
        description: 'ID пользователя',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    example: '123456',
                    description: '6-значный код подтверждения'
                }
            },
            required: ['code']
        }
    })
    async confirmEmailChange(
        @Param('id') id: string,
        @Request() req,
        @Body('code') code: string
    ): Promise<UpdateUserResponseDto> {
        try {
            // Проверяем права доступа
            const currentUserId = req.user.userId;
            const isAdmin = req.user.roles && req.user.roles.includes('admin');

            if (id !== currentUserId && !isAdmin) {
                throw new ForbiddenException('У вас нет прав на подтверждение изменения email другого пользователя');
            }

            if (!code) {
                throw new BadRequestException('Код подтверждения обязателен');
            }

            this.logger.log(`Подтверждение изменения email для пользователя: ${id}`);

            const updatedUser = await this.usersService.confirmEmailChange(id, code);

            return new UpdateUserResponseDto('Email успешно изменен', updatedUser);

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            this.logger.error(`Ошибка при подтверждении изменения email для пользователя ${id}:`, error.stack);
            throw new InternalServerErrorException('Произошла ошибка при подтверждении изменения email');
        }
    }

    @Post(':id/resend-email-change-code')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Повторная отправка кода для изменения email' })
    @ApiResponse({
        status: 200,
        description: 'Код повторно отправлен'
    })
    @ApiResponse({ status: 400, description: 'Нет активного запроса на изменение email' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiParam({
        name: 'id',
        description: 'ID пользователя',
        example: '507f1f77bcf86cd799439011'
    })
    async resendEmailChangeCode(
        @Param('id') id: string,
        @Request() req
    ): Promise<{ message: string }> {
        try {
            // Проверяем права доступа
            const currentUserId = req.user.userId;
            const isAdmin = req.user.roles && req.user.roles.includes('admin');

            if (id !== currentUserId && !isAdmin) {
                throw new ForbiddenException('У вас нет прав на повторную отправку кода другому пользователю');
            }

            this.logger.log(`Повторная отправка кода изменения email для пользователя: ${id}`);

            await this.usersService.resendEmailChangeCode(id);

            return {
                message: 'Код подтверждения повторно отправлен на новый email адрес'
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            this.logger.error(`Ошибка при повторной отправке кода изменения email для пользователя ${id}:`, error.stack);
            throw new InternalServerErrorException('Произошла ошибка при отправке кода');
        }
    }

    @Post(':id/cancel-email-change')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Отмена изменения email' })
    @ApiResponse({
        status: 200,
        description: 'Изменение email отменено',
        type: UpdateUserResponseDto
    })
    @ApiResponse({ status: 400, description: 'Нет активного запроса на изменение email' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiParam({
        name: 'id',
        description: 'ID пользователя',
        example: '507f1f77bcf86cd799439011'
    })
    async cancelEmailChange(
        @Param('id') id: string,
        @Request() req
    ): Promise<UpdateUserResponseDto> {
        try {
            // Проверяем права доступа
            const currentUserId = req.user.userId;
            const isAdmin = req.user.roles && req.user.roles.includes('admin');

            if (id !== currentUserId && !isAdmin) {
                throw new ForbiddenException('У вас нет прав на отмену изменения email другого пользователя');
            }

            this.logger.log(`Отмена изменения email для пользователя: ${id}`);

            const user = await this.usersService.cancelEmailChange(id);

            return new UpdateUserResponseDto('Изменение email отменено', user);

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            this.logger.error(`Ошибка при отмене изменения email для пользователя ${id}:`, error.stack);
            throw new InternalServerErrorException('Произошла ошибка при отмене изменения email');
        }
    }

    @Get(':id/email-change-status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Статус изменения email' })
    @ApiResponse({
        status: 200,
        description: 'Статус изменения email',
        schema: {
            type: 'object',
            properties: {
                hasPendingEmailChange: { type: 'boolean', example: true },
                currentEmail: { type: 'string', example: 'old@example.com' },
                pendingEmail: { type: 'string', example: 'new@example.com' },
                codeExpiresAt: { type: 'string', example: '2025-01-01T10:15:00Z' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    @ApiParam({
        name: 'id',
        description: 'ID пользователя',
        example: '507f1f77bcf86cd799439011'
    })
    async getEmailChangeStatus(
        @Param('id') id: string,
        @Request() req
    ): Promise<{
        hasPendingEmailChange: boolean;
        currentEmail: string;
        pendingEmail?: string;
        codeExpiresAt?: Date;
    }> {
        try {
            // Проверяем права доступа
            const currentUserId = req.user.userId;
            const isAdmin = req.user.roles && req.user.roles.includes('admin');

            if (id !== currentUserId && !isAdmin) {
                throw new ForbiddenException('У вас нет прав на просмотр статуса изменения email другого пользователя');
            }

            const user = await this.usersService.findById(id);
            if (!user) {
                throw new NotFoundException('Пользователь не найден');
            }

            return {
                hasPendingEmailChange: !!user.pendingEmail,
                currentEmail: user.email,
                pendingEmail: user.pendingEmail || undefined,
                codeExpiresAt: user.emailChangeCodeExpires || undefined
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            this.logger.error(`Ошибка при получении статуса изменения email для пользователя ${id}:`, error.stack);
            throw new InternalServerErrorException('Произошла ошибка при получении статуса');
        }
    }
}
