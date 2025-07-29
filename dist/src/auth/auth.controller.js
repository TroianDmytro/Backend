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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const login_user_dto_1 = require("../users/dto/login-user.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = AuthController_1 = class AuthController {
    authService;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    async register(createUserDto) {
        this.logger.log(`Запрос на регистрацию: ${createUserDto.email}`);
        return this.authService.register(createUserDto);
    }
    async login(loginUserDto) {
        this.logger.log(`Запрос на вход: ${loginUserDto.email}`);
        return this.authService.login(loginUserDto);
    }
    async verifyEmail(token, res) {
        if (!token) {
            this.logger.warn('Попытка верификации без токена');
            return res.status(400).send(this.getErrorPage('Токен верификации отсутствует'));
        }
        try {
            this.logger.log(`Верификация email с токеном: ${token.substring(0, 8)}...`);
            const result = await this.authService.verifyEmail(token);
            return res.send(this.getSuccessPage(result.user.email));
        }
        catch (error) {
            this.logger.error(`Ошибка верификации email: ${error.message}`);
            return res.status(400).send(this.getErrorPage(error.message));
        }
    }
    async resendVerificationEmail(email) {
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
        }
        catch (error) {
            this.logger.error(`Ошибка при повторной отправке: ${error.message}`);
            return {
                success: false,
                message: error.message
            };
        }
    }
    async forgotPassword(email) {
        this.logger.log(`Запрос на восстановление пароля для: ${email}`);
        try {
            const result = await this.authService.forgotPassword(email);
            return {
                success: true,
                message: result.message
            };
        }
        catch (error) {
            this.logger.error(`Ошибка восстановления пароля: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Ошибка при отправке кода восстановления');
        }
    }
    async resetPassword(code, newPassword) {
        this.logger.log(`Попытка сброса пароля с кодом: ${code.substring(0, 3)}...`);
        try {
            const result = await this.authService.resetPasswordWithCode(code, newPassword);
            return {
                success: true,
                message: result.message
            };
        }
        catch (error) {
            this.logger.error(`Ошибка сброса пароля: ${error.message}`);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async changePassword(req, body) {
        const userId = req.user?.userId || body.userId;
        const userEmail = req.user?.email || 'тестовый пользователь';
        if (!userId) {
            throw new common_1.BadRequestException('userId обязателен при отключенной авторизации');
        }
        this.logger.log(`Пользователь ${userEmail} меняет пароль`);
        try {
            const result = await this.authService.changePassword(userId, body.currentPassword, body.newPassword);
            return {
                success: true,
                message: result.message
            };
        }
        catch (error) {
            this.logger.error(`Ошибка изменения пароля: ${error.message}`);
            throw new common_1.BadRequestException(error.message);
        }
    }
    getSuccessPage(email) {
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
    getErrorPage(message) {
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
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Регистрация нового пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Пользователь успешно зарегистрирован' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректные данные' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Авторизация пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Успешная авторизация' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Неверные учетные данные' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Подтверждение email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email успешно подтвержден' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Неверный или устаревший токен' }),
    (0, swagger_1.ApiQuery)({ name: 'token', description: 'Токен верификации', required: true }),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Get)('resend-verification/:email'),
    (0, swagger_1.ApiOperation)({ summary: 'Повторная отправка письма с подтверждением email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Письмо успешно отправлено' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь не найден' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email уже подтвержден' }),
    (0, swagger_1.ApiParam)({ name: 'email', description: 'Email пользователя', required: true }),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerificationEmail", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Запрос на восстановление пароля' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Код восстановления отправлен на email' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь не найден' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' }
            },
            required: ['email']
        }
    }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Сброс пароля с использованием кода' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Пароль успешно изменен' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Недействительный или просроченный код' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '123456', description: 'Код из письма' },
                newPassword: { type: 'string', example: 'newPassword123', description: 'Новый пароль' }
            },
            required: ['code', 'newPassword']
        }
    }),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Изменение пароля авторизованным пользователем' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Пароль успешно изменен' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Неверный текущий пароль' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'Только для тестирования без авторизации' },
                currentPassword: { type: 'string', example: 'currentPassword123' },
                newPassword: { type: 'string', example: 'newPassword123' }
            },
            required: ['currentPassword', 'newPassword']
        }
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map