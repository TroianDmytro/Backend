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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    emailService;
    constructor(usersService, jwtService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Неверный email или пароль');
        }
        if (user.isBlocked) {
            throw new common_1.UnauthorizedException('Ваш аккаунт заблокирован. Обратитесь к администратору.');
        }
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Неверный email или пароль');
        }
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException('Email не подтвержден. Пожалуйста, проверьте вашу почту');
        }
        return user;
    }
    async login(loginUserDto) {
        const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
        const roles = user.roles?.map(role => typeof role === 'object' ? role.name : role) || [];
        const payload = {
            email: user.email,
            sub: user._id,
            roles: roles
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                avatar: user.avatar,
                email: user.email,
                name: user.name,
                second_name: user.second_name,
                isEmailVerified: user.isEmailVerified,
                roles: roles
            },
        };
    }
    async register(createUserDto) {
        const user = await this.usersService.create(createUserDto);
        if (!user) {
            throw new Error('Ошибка при создании пользователя');
        }
        try {
            await this.emailService.sendVerificationEmail(user.email, `${process.env.APP_URL}/auth/verify-email?token=${user.verificationToken}`, user.name);
        }
        catch (error) {
            console.error('Ошибка отправки письма:', error);
        }
        return {
            message: 'Пользователь успешно зарегистрирован. Пожалуйста, проверьте вашу почту для подтверждения email',
            user: {
                email: user.email,
                name: user.name,
                second_name: user.second_name,
                age: user.age,
                telefon_number: user.telefon_number,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }
    async verifyEmail(token) {
        const user = await this.usersService.verifyEmail(token);
        return {
            message: 'Email успешно подтвержден',
            user: {
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }
    async forgotPassword(email) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new common_1.NotFoundException('Пользователь с таким email не найден');
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        await this.usersService.saveResetCode(email, resetCode);
        await this.emailService.sendResetPasswordCode(email, resetCode, user.name);
        return {
            message: 'Код восстановления пароля отправлен на вашу почту'
        };
    }
    async resetPasswordWithCode(code, newPassword) {
        const user = await this.usersService.findByResetCode(code);
        if (!user) {
            throw new common_1.BadRequestException('Недействительный или просроченный код восстановления');
        }
        await this.usersService.updatePassword(user.id, newPassword);
        return {
            message: 'Пароль успешно изменен'
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Неверный текущий пароль');
        }
        await this.usersService.updatePassword(userId, newPassword);
        return {
            message: 'Пароль успешно изменен'
        };
    }
    async resetPassword(token, newPassword) {
        await this.usersService.resetPassword(token, newPassword);
        return {
            message: 'Пароль успешно сброшен',
        };
    }
    async resendVerificationEmail(email) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new common_1.NotFoundException('Пользователь с таким email не найден');
        }
        if (user.isEmailVerified) {
            throw new common_1.ConflictException('Email уже подтвержден');
        }
        const newToken = await this.usersService.generateNewVerificationToken(email);
        await this.emailService.sendVerificationEmail(email, `${process.env.APP_URL}/auth/verify-email?token=${newToken}`, user.name);
        return {
            message: 'Письмо с подтверждением повторно отправлено. Пожалуйста, проверьте вашу почту',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map