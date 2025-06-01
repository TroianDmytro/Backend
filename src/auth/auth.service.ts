import { Injectable, UnauthorizedException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { use } from 'passport';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);

        if (!user) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        // Проверка на блокировку
        if (user.isBlocked) {
            throw new UnauthorizedException('Ваш аккаунт заблокирован. Обратитесь к администратору.');
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Email не подтвержден. Пожалуйста, проверьте вашу почту');
        }

        return user;
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.validateUser(loginUserDto.email, loginUserDto.password);

        // Преобразуем роли в массив строк
        const roles = user.roles?.map(role =>
            typeof role === 'object' ? role.name : role
        ) || [];

        // Включаем роли в payload токена
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

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);

        // Проверка, что user не null
        if (!user) {
            throw new Error('Ошибка при создании пользователя');
        }

        // Отправка письма с подтверждением
        try {
            await this.emailService.sendVerificationEmail(
                user.email,
                `${process.env.APP_URL}/auth/verify-email?token=${user.verificationToken}`,
                user.name
            );
        } catch (error) {
            console.error('Ошибка отправки письма:', error);
            // Продолжаем работу даже при ошибке отправки
        }

        // // ВРЕМЕННО для тестирования: автоматически подтверждаем email
        // if (process.env.NODE_ENV !== 'production') {
        //     await this.usersService.verifyEmailWithoutToken(user.email);
        // }

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
            // // ВРЕМЕННО для тестирования: возвращаем токен верификации
            // verificationToken: process.env.NODE_ENV !== 'production' ? user.verificationToken : undefined,
        };
    }

    async verifyEmail(token: string) {
        const user = await this.usersService.verifyEmail(token);

        return {
            message: 'Email успешно подтвержден',
            user: {
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }


    async forgotPassword(email: string) {
        const user = await this.usersService.findOne(email);

        if (!user) {
            throw new NotFoundException('Пользователь с таким email не найден');
        }

        // Генерируем 6-значный код
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Сохраняем код в базе (используем поле resetPasswordToken)
        await this.usersService.saveResetCode(email, resetCode);

        // Отправляем код на email
        await this.emailService.sendResetPasswordCode(email, resetCode, user.name);

        return {
            message: 'Код восстановления пароля отправлен на вашу почту'
        };
    }

    async resetPasswordWithCode(code: string, newPassword: string) {
        const user = await this.usersService.findByResetCode(code);

        if (!user) {
            throw new BadRequestException('Недействительный или просроченный код восстановления');
        }

        await this.usersService.updatePassword(user.id, newPassword);

        return {
            message: 'Пароль успешно изменен'
        };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        // Проверяем текущий пароль
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверный текущий пароль');
        }

        // Обновляем пароль
        await this.usersService.updatePassword(userId, newPassword);

        return {
            message: 'Пароль успешно изменен'
        };
    }

    async resetPassword(token: string, newPassword: string) {
        await this.usersService.resetPassword(token, newPassword);

        return {
            message: 'Пароль успешно сброшен',
        };
    }

    async resendVerificationEmail(email: string) {
        // Проверяем существование пользователя
        const user = await this.usersService.findOne(email);

        if (!user) {
            throw new NotFoundException('Пользователь с таким email не найден');
        }

        if (user.isEmailVerified) {
            throw new ConflictException('Email уже подтвержден');
        }

        // Генерируем новый токен верификации
        const newToken = await this.usersService.generateNewVerificationToken(email);

        // Отправляем письмо с подтверждением
        await this.emailService.sendVerificationEmail(
            email,
            `${process.env.APP_URL}/auth/verify-email?token=${newToken}`,
            user.name
        );

        return {
            message: 'Письмо с подтверждением повторно отправлено. Пожалуйста, проверьте вашу почту',
        };
    }
}