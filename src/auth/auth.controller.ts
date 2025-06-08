// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Param, Query, Logger, Request, NotFoundException, BadRequestException, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    async register(@Body() createUserDto: CreateUserDto) {
        this.logger.log(`Запрос на регистрацию: ${createUserDto.email}`);
        return this.authService.register(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Авторизация пользователя' })
    @ApiResponse({ status: 200, description: 'Успешная авторизация' })
    @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
    async login(@Body() loginUserDto: LoginUserDto) {
        this.logger.log(`Запрос на вход: ${loginUserDto.email}`);
        return this.authService.login(loginUserDto);
    }

    @Get('verify-email')
    @ApiOperation({ summary: 'Подтверждение email' })
    @ApiResponse({ status: 200, description: 'Email успешно подтвержден' })
    @ApiResponse({ status: 404, description: 'Неверный или устаревший токен' })
    @ApiQuery({ name: 'token', description: 'Токен верификации', required: true })
    async verifyEmail(@Query('token') token: string, @Res() res: Response) {
        if (!token) {
            this.logger.warn('Попытка верификации без токена');
            return res.status(400).send(this.getErrorPage('Токен верификации отсутствует'));
        }

        try {
            this.logger.log(`Верификация email с токеном: ${token.substring(0, 8)}...`);
            const result = await this.authService.verifyEmail(token);

            // Возвращаем HTML страницу с результатом
            return res.send(this.getSuccessPage(result.user.email));
        } catch (error) {
            this.logger.error(`Ошибка верификации email: ${error.message}`);
            return res.status(400).send(this.getErrorPage(error.message));
        }
    }


    @Get('resend-verification/:email')
    @ApiOperation({ summary: 'Повторная отправка письма с подтверждением email' })
    @ApiResponse({ status: 200, description: 'Письмо успешно отправлено' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiResponse({ status: 409, description: 'Email уже подтвержден' })
    @ApiParam({ name: 'email', description: 'Email пользователя', required: true })
    async resendVerificationEmail(@Param('email') email: string) {
        if (!email) {
            this.logger.warn('Попытка повторной отправки без указания email');
            return {
                success: false,
                message: 'Email не указан'
            };
        }

        try {
            this.logger.log(`Запрос на повторную отправку верификации: ${email}`);
            await this.authService.resendVerificationEmail(email);
            return {
                success: true,
                message: `Письмо с подтверждением повторно отправлено на ${email}`
            };
        } catch (error) {
            this.logger.error(`Ошибка при повторной отправке: ${error.message}`);
            return {
                success: false,
                message: error.message
            };
        }
    }


    @Post('forgot-password')
    @ApiOperation({ summary: 'Запрос на восстановление пароля' })
    @ApiResponse({ status: 200, description: 'Код восстановления отправлен на email' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' }
            },
            required: ['email']
        }
    })
    async forgotPassword(@Body('email') email: string) {
        this.logger.log(`Запрос на восстановление пароля для: ${email}`);

        try {
            const result = await this.authService.forgotPassword(email);
            return {
                success: true,
                message: result.message
            };
        } catch (error) {
            this.logger.error(`Ошибка восстановления пароля: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Ошибка при отправке кода восстановления');
        }
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Сброс пароля с использованием кода' })
    @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
    @ApiResponse({ status: 400, description: 'Недействительный или просроченный код' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '123456', description: 'Код из письма' },
                newPassword: { type: 'string', example: 'newPassword123', description: 'Новый пароль' }
            },
            required: ['code', 'newPassword']
        }
    })
    async resetPassword(
        @Body('code') code: string,
        @Body('newPassword') newPassword: string
    ) {
        this.logger.log(`Попытка сброса пароля с кодом: ${code.substring(0, 3)}...`);

        try {
            const result = await this.authService.resetPasswordWithCode(code, newPassword);
            return {
                success: true,
                message: result.message
            };
        } catch (error) {
            this.logger.error(`Ошибка сброса пароля: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Изменение пароля авторизованным пользователем' })
    @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
    @ApiResponse({ status: 400, description: 'Неверный текущий пароль' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'Только для тестирования без авторизации' },
                currentPassword: { type: 'string', example: 'currentPassword123' },
                newPassword: { type: 'string', example: 'newPassword123' }
            },
            required: ['currentPassword', 'newPassword']
        }
    })
    async changePassword(
        @Request() req,
        @Body() body: { userId?: string; currentPassword: string; newPassword: string }
    ) {
        // Проверяем, есть ли req.user (работает ли авторизация)
        const userId = req.user?.userId || body.userId;
        const userEmail = req.user?.email || 'тестовый пользователь';

        if (!userId) {
            throw new BadRequestException('userId обязателен при отключенной авторизации');
        }

        this.logger.log(`Пользователь ${userEmail} меняет пароль`);

        try {
            const result = await this.authService.changePassword(
                userId,
                body.currentPassword,
                body.newPassword
            );
            return {
                success: true,
                message: result.message
            };
        } catch (error) {
            this.logger.error(`Ошибка изменения пароля: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }


    private getSuccessPage(email: string): string {
        return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email подтвержден</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
            }
            .success-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background-color: #4CAF50;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .checkmark {
                color: white;
                font-size: 40px;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
            }
            .email {
                color: #666;
                font-style: italic;
                margin-bottom: 20px;
            }
            .message {
                color: #555;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            .button:hover {
                background-color: #45a049;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">
                <span class="checkmark">✓</span>
            </div>
            <h1>Email успешно подтвержден!</h1>
            <p class="email">${email}</p>
            <p class="message">
                Ваш email адрес был успешно подтвержден. 
                Теперь вы можете войти в систему используя свои учетные данные.
            </p>
            <a href="/login" class="button">Перейти к входу</a>
        </div>
    </body>
    </html>
    `;
    }

    private getErrorPage(message: string): string {
        return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ошибка подтверждения</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
            }
            .error-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background-color: #f44336;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cross {
                color: white;
                font-size: 40px;
            }
            h1 {
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                color: #555;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #2196F3;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            .button:hover {
                background-color: #1976D2;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">
                <span class="cross">✕</span>
            </div>
            <h1>Ошибка подтверждения</h1>
            <p class="message">${message}</p>
            <a href="/resend-verification" class="button">Отправить письмо повторно</a>
        </div>
    </body>
    </html>
    `;
    }
}