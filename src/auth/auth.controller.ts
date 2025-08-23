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
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService, private configService: ConfigService) { }

    // === НОВЫЕ ЭНДПОИНТЫ ДЛЯ GOOGLE OAUTH ===
    /**
        * GET /auth/google - С ОТЛАДКОЙ
        */
    @Get('google')
    @Public()
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({
        summary: 'Авторизация через Google - начало процесса',
        description: 'Перенаправляет пользователя на страницу авторизации Google'
    })
    async googleAuth(@Request() req) {
        console.log('🚀 Google OAuth инициирован');
        console.log('🔧 Конфиг Google:', {
            clientId: this.configService.get('google.clientId') ? '✅ Найден' : '❌ Не найден',
            callbackUrl: this.configService.get('google.callbackUrl'),
            nodeEnv: process.env.NODE_ENV || 'development'
        });
        console.log('🌍 Headers:', req.headers);

        // Passport автоматически перенаправит на Google
    }


    // GET /auth/test/config - ТЕСТОВЫЙ эндпоинт для проверки конфигурации
    @Get('test/config')
    @Public()
    @ApiOperation({
        summary: 'Тестовый эндпоинт для проверки конфигурации Google OAuth',
        description: 'Возвращает текущую конфигурацию (без секретов)'
    })
    getGoogleConfig() {
        return {
            environment: process.env.NODE_ENV || 'development',
            googleConfig: {
                clientId: this.configService.get('google.clientId'),
                callbackUrl: this.configService.get('google.callbackUrl'),
                hasClientSecret: this.configService.get('google.clientSecret')
            },
            appConfig: {
                appUrl: this.configService.get('app.url'),
                frontendUrl: this.configService.get('app.frontendUrl'),
                allowedOrigins: this.configService.get('app.allowedOrigins')
            }
        };
    }


    // GET /auth/test - Тестовая HTML страница для Google OAuth
    @Get('test')
    @Public()
    @ApiOperation({
        summary: 'Тестовая страница для Google OAuth',
        description: 'HTML страница с кнопкой для тестирования Google OAuth'
    })
    @ApiResponse({
        status: 200,
        description: 'HTML страница с кнопкой авторизации'
    })
    getTestPage(@Res() res: Response) {
        const html = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Тест Google OAuth</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 50px auto;
                    padding: 20px;
                    text-align: center;
                }
                .button {
                    background-color: #4285f4;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    margin: 10px;
                    display: inline-block;
                    border: none;
                    cursor: pointer;
                }
                .button:hover {
                    background-color: #3367d6;
                }
                .config {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    text-align: left;
                }
                .success {
                    color: #28a745;
                    font-weight: bold;
                }
                .error {
                    color: #dc3545;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>🔧 Тест Google OAuth</h1>
            
            <div class="config">
                <h3>Текущая конфигурация:</h3>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <p><strong>App URL:</strong> ${this.configService.get('app.url')}</p>
                <p><strong>Callback URL:</strong> ${this.configService.get('google.callbackUrl')}</p>
                <p><strong>Client ID:</strong> ${this.configService.get('google.clientId') ? '✅ Настроен' : '❌ Не настроен'}</p>
                <p><strong>Client Secret:</strong> ${this.configService.get('google.clientSecret') ? '✅ Настроен' : '❌ Не настроен'}</p>
            </div>

            <h3>🚀 Тестирование:</h3>
            <p>Нажмите кнопку ниже, чтобы начать авторизацию через Google</p>
            
            <a href="/api/auth/google" class="button">
                🔐 Войти через Google
            </a>

            <div style="margin-top: 30px;">
                <h4>📋 Инструкции:</h4>
                <ol style="text-align: left;">
                    <li>Убедитесь, что в Google Console добавлены локальные URL</li>
                    <li>Authorized JavaScript origins: <code>http://localhost:8000</code></li>
                    <li>Authorized redirect URIs: <code>http://localhost:8000/api/auth/google/callback</code></li>
                    <li>Не используйте Swagger для тестирования OAuth</li>
                </ol>
            </div>

            <div style="margin-top: 20px;">
                <a href="/api/docs" class="button" style="background-color: #6c757d;">
                    📚 Вернуться к Swagger
                </a>
            </div>
        </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }

    /**
      * GET /auth/google/callback - ИСПРАВЛЕННЫЙ callback для локальной разработки
      */
    @Get('google/callback')
    @Public()
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({
        summary: 'Callback Google OAuth',
        description: 'Обрабатывает ответ от Google после авторизации'
    })
    async googleAuthRedirect(@Request() req, @Res() res: Response) {
        try {
            console.log('🔄 Обработка Google OAuth callback');
            console.log('👤 Пользователь в req:', req.user ? '✅ Найден' : '❌ Отсутствует');

            if (!req.user) {
                console.error('❌ req.user отсутствует в callback');
                return this.showErrorPage(res, 'Ошибка авторизации: пользователь не найден');
            }

            // Генерируем JWT токен
            const tokenData = await this.authService.generateGoogleJWT(req.user);
            console.log(`✅ JWT токен сгенерирован для: ${req.user.email}`);

            // Проверяем переменную окружения для отладочного режима
            const showDebugPage = process.env.GOOGLE_AUTH_DEBUG === 'true';
            const frontendUrl = this.configService.get<string>('app.frontendUrl');
            
            if (showDebugPage) {
                // Показываем отладочную страницу с токеном
                console.log('🔧 Показываем отладочную страницу');
                return res.send(this.getGoogleSuccessPage(tokenData.access_token, tokenData.user));
            } else {
                // Перенаправляем на фронтенд
                console.log(`🚀 Перенаправляем на фронтенд: ${frontendUrl}`);
                const redirectUrl = `${frontendUrl}?token=${tokenData.access_token}&user=${encodeURIComponent(JSON.stringify(tokenData.user))}`;
                return res.redirect(redirectUrl);
            }

        } catch (error) {
            console.error(`❌ Ошибка в Google OAuth callback:`, error);
            return this.showErrorPage(res, `Ошибка обработки авторизации: ${error.message}`);
        }
    }



    /**
     * ВСПОМОГАТЕЛЬНЫЙ метод для редиректа с ошибкой
     */
    private redirectToFrontendWithError(res: Response, error: string) {
        const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'https://neuronest.pp.ua';
        const redirectUrl = `${frontendUrl}/auth/error?error=${error}`;
        console.log(`❌ Редирект с ошибкой: ${redirectUrl}`);
        return res.redirect(redirectUrl);
    }

    /**
     * POST /auth/google/link - Связывание Google аккаунта с существующим
     * Позволяет авторизованному пользователю связать свой аккаунт с Google
     */
    @Post('google/link')
    @Public()
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
    @Public()
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
    @Public()
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

    /**
     * УЛУЧШЕННАЯ страница успешной авторизации
     */
    private getGoogleSuccessPage(token: string, user: any): string {
        return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Google OAuth - Успешно!</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .success-header {
                    color: #28a745;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .user-info {
                    background: #e8f5e8;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .token-section {
                    background: #fff3cd;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #ffc107;
                    margin-bottom: 20px;
                }
                .token-display {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    font-family: monospace;
                    font-size: 12px;
                    word-break: break-all;
                    margin-top: 10px;
                    max-height: 150px;
                    overflow-y: auto;
                }
                .button {
                    background-color: #007bff;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 10px 5px;
                    border: none;
                    cursor: pointer;
                }
                .copy-button {
                    background-color: #28a745;
                }
                .actions {
                    text-align: center;
                    margin-top: 30px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 15px;
                }
                @media (max-width: 600px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-header">
                    <h1>🎉 Google OAuth Авторизация успешна!</h1>
                    <p>Добро пожаловать, ${user.name || user.email}!</p>
                </div>

                <div class="user-info">
                    <h3>👤 Информация о пользователе:</h3>
                    <div class="info-grid">
                        <div><strong>ID:</strong> ${user.id}</div>
                        <div><strong>Email:</strong> ${user.email}</div>
                        <div><strong>Имя:</strong> ${user.name || 'Не указано'}</div>
                        <div><strong>Фамилия:</strong> ${user.second_name || 'Не указано'}</div>
                        <div><strong>Логин:</strong> ${user.login || 'Автогенерируемый'}</div>
                        <div><strong>Email подтвержден:</strong> ${user.isEmailVerified ? '✅ Да' : '❌ Нет'}</div>
                        <div><strong>Провайдер:</strong> ${user.provider || 'google'}</div>
                        <div><strong>Роли:</strong> ${(user.roles || []).join(', ')}</div>
                    </div>
                </div>

                <div class="token-section">
                    <h3>🔐 JWT Access Token:</h3>
                    <p>Используйте этот токен для авторизации API запросов:</p>
                    <div class="token-display" id="tokenDisplay">${token}</div>
                    <button class="button copy-button" onclick="copyToken()">📋 Скопировать токен</button>
                </div>

                <div class="actions">
                    <a href="/api/docs" class="button">📚 Swagger UI</a>
                    <a href="/api/auth/test" class="button">🔧 Тестовая страница</a>
                    <a href="/api/auth/google/status" class="button">📊 Статус Google</a>
                </div>

                <div style="margin-top: 30px; padding: 15px; background: #d1ecf1; border-radius: 5px;">
                    <h4>💡 Что делать дальше:</h4>
                    <ol>
                        <li><strong>Скопируйте токен</strong> и используйте его в заголовке <code>Authorization: Bearer YOUR_TOKEN</code></li>
                        <li><strong>Протестируйте API</strong> через Swagger UI с этим токеном</li>
                        <li><strong>В production</strong> токен будет передан на ваш фронтенд</li>
                    </ol>
                </div>
            </div>

            <script>
                function copyToken() {
                    const tokenText = document.getElementById('tokenDisplay').textContent;
                    navigator.clipboard.writeText(tokenText).then(() => {
                        alert('Токен скопирован в буфер обмена!');
                    }).catch(err => {
                        console.error('Ошибка копирования: ', err);
                        // Fallback для старых браузеров
                        const textArea = document.createElement('textarea');
                        textArea.value = tokenText;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Токен скопирован!');
                    });
                }

                // Сохраняем токен и данные пользователя в localStorage для удобства
                localStorage.setItem('auth_token', '${token}');
                localStorage.setItem('user_data', '${JSON.stringify(user).replace(/'/g, "\\'")}');
                
                console.log('✅ Токен и данные пользователя сохранены в localStorage');
                console.log('Token:', '${token}');
                console.log('User:', ${JSON.stringify(user)});
            </script>
        </body>
        </html>
        `;
    }

    /**
     * Страница ошибки
     */
    private showErrorPage(res: Response, errorMessage: string): Response {
        const html = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ошибка авторизации</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                .error { color: #dc3545; background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
            </style>
        </head>
        <body>
            <h1>❌ Ошибка Google OAuth</h1>
            <div class="error">
                <strong>Ошибка:</strong> ${errorMessage}
            </div>
            <a href="/api/auth/test" class="button">🔄 Попробовать еще раз</a>
            <a href="/api/docs" class="button">📚 Вернуться к Swagger</a>
        </body>
        </html>
        `;
        return res.status(400).send(html);
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
    @Public()
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
    @Public()
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
    @Public()
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
    @Public()
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
    @Public()
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
    @Public()
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
    @Public()
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