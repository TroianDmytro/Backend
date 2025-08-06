import { Injectable, UnauthorizedException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto, VerifyEmailCodeDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { use } from 'passport';

const tagsList = [
    'Cool',
    'Fast',
    'Silent',
    'Smart',
    'Brave',
    'Sharp',
    'Lucky',
    'Coder',
    'Wizard',
    'Ninja',
    'Dev',
    'Samurai',
    'Guru',
    'Rider',
    'Maker',
    'Hero',
    'Master',
    'Pro',
    'Expert',
    'Sage',
    'Sensei',
    'Captain',
    'Chief',
    'Fox',
    'Eagle',
    'Panther',
    'Tiger',
    'Lion',
    'Dragon',
    'Phoenix',
    'Viking',
    'Knight',
    'Pirate',
    'Ranger',
    'Scout',
    'Hunter',
    'Adventurer',
    'Explorer',
    'Traveler',
    'Nomad',
    'Wanderer',
    'Pathfinder',
    'Seeker',
    'Visionary',
    'Innovator',
    'Creator',
    'Inventor',
    'Builder',
    'Architect',
    'Designer',
    'Artist',
    'Craftsman',
    'Engineer',
    'Technician',
    'Mechanic',
    'Programmer',
    'Developer',
    'Hacker',
    'Debugger',
    'Scripter',
    'Assembler',
];

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }
    // Генерация случайного пароля
    private generateSecurePassword(): string {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';

        // Гарантируем наличие каждого типа символов
        password += uppercase[Math.floor(Math.random() * uppercase.length)]; // 1 заглавная
        password += digits[Math.floor(Math.random() * digits.length)]; // 1 цифра
        password += specialChars[Math.floor(Math.random() * specialChars.length)]; // 1 спец символ

        // Добавляем остальные 5 символов случайно
        const allChars = lowercase + uppercase + digits;
        for (let i = 3; i < 8; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Перемешиваем символы для случайного порядка
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    // Генерация уникального логина на основе email
    private generateLogin(email: string): string {
        const base = email.split('@')[0]
            .replace(/[^a-zA-Z0-9]/g, '') // убираем лишние символы
            .slice(0, 10); // ограничим длину

        const tags = tagsList;
        const tag = tags[Math.floor(Math.random() * tags.length)];

        const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `${base}${tag}${number}`;
    }


    // Отправка кода подтверждения на email
    async sendVerificationCode(createUserDto: CreateUserDto) {
        const { email } = createUserDto;

        // Проверяем, не зарегистрирован ли уже пользователь
        const existingUser = await this.usersService.findOne(email);
        if (existingUser && existingUser.isEmailVerified) {
            throw new ConflictException('Пользователь с таким email уже зарегистрирован');
        }

        // Генерируем 6-значный код
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Сохраняем код в временном хранилище или обновляем существующего пользователя
        await this.usersService.saveVerificationCode(email, verificationCode);

        // Отправляем код на email
        await this.emailService.sendVerificationCode(email, verificationCode);

        return {
            success: true,
            message: 'Код подтверждения отправлен на ваш email. Проверьте почту.',
            email: email
        };
    }

    // Подтверждение кода и завершение регистрации
    async verifyCodeAndCompleteRegistration(verifyDto: VerifyEmailCodeDto) {
        const { email, code, name, second_name, age, telefon_number } = verifyDto;

        // Проверяем код подтверждения
        const isValidCode = await this.usersService.verifyCode(email, code);
        if (!isValidCode) {
            throw new BadRequestException('Неверный или просроченный код подтверждения');
        }

        // Генерируем логин и пароль
        const login = this.generateLogin(email);
        const password = this.generateSecurePassword();

        // Создаем пользователя с сгенерированными данными
        const user = await this.usersService.createWithCredentials({
            email,
            login,
            password,
            name,
            second_name,
            age,
            telefon_number
        });

        // Отправляем логин и пароль на email
        await this.emailService.sendLoginCredentials(email, login, password, name);

        return {
            success: true,
            message: 'Регистрация завершена! Логин и пароль отправлены на ваш email.',
            user: {
                id: user.id,
                email: user.email,
                login: user.login,
                name: user.name,
                second_name: user.second_name,
                isEmailVerified: user.isEmailVerified
            }
        };
    }

    async validateUser(login: string, pass: string): Promise<any> {
        // Теперь ищем по логину вместо email
        const user = await this.usersService.findByLogin(login);

        if (!user) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        // Проверка на блокировку
        if (user.isBlocked) {
            throw new UnauthorizedException('Ваш аккаунт заблокирован. Обратитесь к администратору.');
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Email не подтвержден. Пожалуйста, проверьте вашу почту');
        }

        return user;
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.validateUser(loginUserDto.login, loginUserDto.password);

        // Преобразуем роли в массив строк
        const roles = user.roles?.map(role =>
            typeof role === 'object' ? role.name : role
        ) || [];

        // Включаем роли в payload токена
        const payload = {
            email: user.email,
            login: user.login,
            sub: user._id,
            roles: roles
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                login: user.login,
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

        // Сохраняем код в базе
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

        // Генерируем новый код верификации
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        await this.usersService.saveVerificationCode(email, verificationCode);

        // Отправляем письмо с кодом
        await this.emailService.sendVerificationCode(email, verificationCode);

        return {
            message: 'Новый код подтверждения отправлен. Пожалуйста, проверьте вашу почту',
        };
    }
}