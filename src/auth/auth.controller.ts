// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Param, Query, Logger, Request, NotFoundException, BadRequestException, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, VerifyEmailCodeDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService, private configService: ConfigService) { }

    // === НОВЫЕ ЭНДПОИНТЫ ДЛЯ GOOGLE OAUTH ===

    /**
     * GET /auth/google - Начало авторизации через Google
     * Перенаправляет пользователя на страницу авторизации Google
     */
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({
        summary: 'Авторизация через Google - начало процесса',
        description: 'Перенаправляет пользователя на страницу авторизации Google. После успешной авторизации Google перенаправит на /auth/google/callback'
    })
    @ApiResponse({
        status: 302,
        description: 'Перенаправление на Google OAuth'
    })
    async googleAuth(@Request() req) {
        // Этот метод автоматически перенаправит на Google
        // Реальная логика происходит в GoogleAuthGuard и GoogleStrategy
    }

    /**
     * GET /auth/google/callback - Callback после авторизации в Google
     * Google перенаправляет сюда после успешной авторизации
     */
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({
        summary: 'Callback Google OAuth',
        description: 'Обрабатывает ответ от Google после авторизации и создает/авторизует пользователя'
    })
    @ApiResponse({
        status: 302,
        description: 'Перенаправление на фронтенд с токеном'
    })
    @ApiResponse({
        status: 400,
        description: 'Ошибка авторизации Google'
    })
    async googleAuthRedirect(@Request() req, @Res() res: Response) {
        try {
            this.logger.log('🔄 Обработка Google OAuth callback');

            if (!req.user) {
                this.logger.error('❌ Пользователь не найден в req.user');
                return this.redirectToFrontendWithError(res, 'google_auth_failed');
            }

            // Генерируем JWT токен для пользователя
            const tokenData = await this.authService.generateGoogleJWT(req.user);

            this.logger.log(`✅ Google OAuth успешно: ${req.user.email}`);

            // Получаем URL фронтенда из конфигурации
            const frontendUrl = this.configService.get<string>('app.frontendUrl');

            // Перенаправляем на фронтенд с токеном в URL
            const redirectUrl = `${frontendUrl}/auth/google/success?token=${tokenData.access_token}&user=${encodeURIComponent(JSON.stringify(tokenData.user))}`;

            return res.redirect(redirectUrl);

        } catch (error) {
            this.logger.error(`❌ Ошибка Google OAuth callback: ${error.message}`, error.stack);
            return this.redirectToFrontendWithError(res, 'google_auth_error');
        }
    }

    /**
     * POST /auth/google/link - Связывание Google аккаунта с существующим
     * Позволяет авторизованному пользователю связать свой аккаунт с Google
     */
    @Post('google/link')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Связывание Google аккаунта',
        description: 'Связывает Google аккаунт с текущим авторизованным пользователем'
    })
    @ApiResponse({
        status: 200,
        description: 'Google аккаунт успешно связан'
    })
    @ApiResponse({
        status: 409,
        description: 'Google аккаунт уже связан с другим пользователем'
    })
    async linkGoogleAccount(@Request() req) {
        const userId = req.user?.userId;

        this.logger.log(`Запрос на связывание Google аккаунта для пользователя: ${userId}`);

        // Здесь нужна дополнительная логика для получения данных от Google
        // Можно реализовать через отдельный эндпоинт или frontend процесс

        return {
            message: 'Для связывания Google аккаунта перейдите по ссылке',
            linkUrl: `/auth/google?link=${userId}`
        };
    }

    /**
     * POST /auth/google/unlink - Отвязывание Google аккаунта
     * Отвязывает Google аккаунт от текущего пользователя
     */
    @Post('google/unlink')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Отвязывание Google аккаунта',
        description: 'Отвязывает Google аккаунт от текущего пользователя'
    })
    @ApiResponse({
        status: 200,
        description: 'Google аккаунт успешно отвязан'
    })
    @ApiResponse({
        status: 400,
        description: 'Нельзя отвязать Google аккаунт без пароля'
    })
    async unlinkGoogleAccount(@Request() req) {
        const userId = req.user?.userId;

        this.logger.log(`Отвязывание Google аккаунта для пользователя: ${userId}`);

        await this.authService.unlinkGoogleAccount(userId);

        return {
            success: true,
            message: 'Google аккаунт успешно отвязан'
        };
    }

    /**
     * GET /auth/google/status - Проверка статуса Google авторизации
     * Показывает, связан ли Google аккаунт с текущим пользователем
     */
    @Get('google/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Статус Google авторизации',
        description: 'Возвращает информацию о связанном Google аккаунте'
    })
    @ApiResponse({
        status: 200,
        description: 'Статус Google авторизации'
    })
    async getGoogleStatus(@Request() req) {
        const userId = req.user?.userId;
        const user = await this.authService.getUserGoogleStatus(userId);

        return {
            isLinked: user.is_google_user,
            googleId: user.is_google_user ? user.googleId : null,
            lastGoogleLogin: user.last_google_login,
            hasValidToken: user.isGoogleTokenValid?.() || false
        };
    }

    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

    /**
     * Перенаправление на фронтенд с ошибкой
     */
    private redirectToFrontendWithError(res: Response, error: string) {
        const frontendUrl = this.configService.get<string>('app.frontendUrl');
        const redirectUrl = `${frontendUrl}/auth/google/error?error=${error}`;
        return res.redirect(redirectUrl);
    }

    /**
     * HTML страница для успешной авторизации Google (запасной вариант)
     */
    private getGoogleSuccessPage(token: string, user: any): string {
        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Авторизация Google - Успешно</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                .token { background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; }
                .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
            </style>
            <script>
                // Автоматически закрываем окно и передаем данные родительскому окну
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'GOOGLE_AUTH_SUCCESS',
                        token: '${token}',
                        user: ${JSON.stringify(user)}
                    }, '*');
                    window.close();
                } else {
                    // Если нет родительского окна, сохраняем токен в localStorage
                    localStorage.setItem('auth_token', '${token}');
                    localStorage.setItem('user_data', '${JSON.stringify(user)}');
                }
            </script>
        </head>
        <body>
            <div class="success">✅ Авторизация через Google успешна!</div>
            <p>Добро пожаловать, ${user.name}!</p>
            <div class="token">
                <strong>Токен:</strong><br>
                ${token}
            </div>
            <a href="${this.configService.get<string>('app.frontendUrl')}" class="button">
                Перейти к приложению
            </a>
        </body>
        </html>
        `;
    }

    /**
     * HTML страница для ошибки авторизации Google
     */
    private getGoogleErrorPage(error: string): string {
        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ошибка авторизации Google</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
                .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="error">❌ Ошибка авторизации через Google</div>
            <p>Код ошибки: ${error}</p>
            <a href="${this.configService.get<string>('app.frontendUrl')}" class="button">
                Вернуться к приложению
            </a>
        </body>
        </html>
        `;
    }

    @Post('register/send-code')
    @ApiOperation({
        summary: 'Шаг 1: Отправка кода подтверждения на email',
        description: 'Пользователь вводит только email, получает 6-значный код подтверждения'
    })
    @ApiResponse({ status: 201, description: 'Код подтверждения отправлен на email' })
    @ApiResponse({ status: 400, description: 'Некорректный email' })
    @ApiResponse({ status: 409, description: 'Пользователь уже зарегистрирован' })
    @ApiBody({ type: CreateUserDto })
    async sendVerificationCode(@Body() createUserDto: CreateUserDto) {
        this.logger.log(`Запрос на отправку кода подтверждения: ${createUserDto.email}`);
        return this.authService.sendVerificationCode(createUserDto);
    }

    @Post('register/verify-code')
    @ApiOperation({
        summary: 'Шаг 2: Подтверждение кода и завершение регистрации',
        description: 'Пользователь вводит код, дополнительные данные и получает логин/пароль на email'
    })
    @ApiResponse({
        status: 201,
        description: 'Регистрация завершена, логин и пароль отправлены на email'
    })
    @ApiResponse({ status: 400, description: 'Неверный или просроченный код' })
    @ApiBody({ type: VerifyEmailCodeDto })
    async verifyCodeAndRegister(@Body() verifyDto: VerifyEmailCodeDto) {
        this.logger.log(`Подтверждение кода для: ${verifyDto.email}`);
        return this.authService.verifyCodeAndCompleteRegistration(verifyDto);
    }

    @Post('login')
    @ApiOperation({
        summary: 'Авторизация пользователя по логину и паролю',
        description: 'Теперь используется логин вместо email'
    })
    @ApiResponse({ status: 200, description: 'Успешная авторизация' })
    @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
    @ApiBody({ type: LoginUserDto })
    async login(@Body() loginUserDto: LoginUserDto) {
        this.logger.log(`Запрос на вход: ${loginUserDto.login}`);
        return this.authService.login(loginUserDto);
    }

    @Post('resend-code')
    @ApiOperation({
        summary: 'Повторная отправка кода подтверждения',
        description: 'Отправляет новый 6-значный код на email'
    })
    @ApiResponse({ status: 200, description: 'Новый код отправлен на email' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiResponse({ status: 409, description: 'Email уже подтвержден' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' }
            },
            required: ['email']
        }
    })
    async resendVerificationCode(@Body('email') email: string) {
        if (!email) {
            this.logger.warn('Попытка повторной отправки без указания email');
            throw new BadRequestException('Email обязателен');
        }

        try {
            this.logger.log(`Запрос на повторную отправку кода: ${email}`);
            const result = await this.authService.resendVerificationEmail(email);
            return {
                success: true,
                message: result.message
            };
        } catch (error) {
            this.logger.error(`Ошибка при повторной отправке: ${error.message}`);
            throw error;
        }
    }

    // Старый эндпоинт для верификации по токену (для обратной совместимости)
    @Get('verify-email')
    @ApiOperation({ summary: 'Подтверждение email по токену (устаревший метод)' })
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
            return res.send(this.getSuccessPage(result.user.email));
        } catch (error) {
            this.logger.error(`Ошибка верификации email: ${error.message}`);
            return res.status(400).send(this.getErrorPage(error.message));
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
        const userId = req.user?.userId || body.userId;
        const userLogin = req.user?.login || 'тестовый пользователь';

        if (!userId) {
            throw new BadRequestException('userId обязателен при отключенной авторизации');
        }

        this.logger.log(`Пользователь ${userLogin} меняет пароль`);

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

    // HTML страницы остаются без изменений
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
            <a href="/resend-verification" class="button">Отправить код повторно</a>
        </div>
    </body>
    </html>
    `;
    }
}