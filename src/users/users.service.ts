// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from '../roles/roles.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from 'src/email/email.service';
import { CreateWithCredentialsDto } from './interfaces/create-credentials.interface';

// Интерфейс для создания Google пользователя
interface CreateGoogleUserDto {
    googleId: string;
    email: string;
    name: string;
    second_name: string;
    avatar_url?: string;
    accessToken: string;
    refreshToken?: string;
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private rolesService: RolesService,
        private readonly emailService: EmailService
    ) { }


    /**
     * Поиск пользователя по Google ID
     * @param googleId - ID пользователя в Google
     */
    async findByGoogleId(googleId: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({ googleId })
            .populate('roles')
            .exec();
    }

    /**
     * Создание нового пользователя через Google OAuth
     * @param googleUserData - данные пользователя от Google
     */
    async createGoogleUser(googleUserData: CreateGoogleUserDto): Promise<UserDocument> {
        const { googleId, email, name, second_name, avatar_url, accessToken, refreshToken } = googleUserData;

        // Проверяем, что пользователь с таким email не существует
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        // Получаем базовую роль
        const userRole = await this.rolesService.getUserRole();

        // Генерируем уникальный логин для Google пользователя
        let login: string;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            const baseLogin = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
            const suffix = attempts === 0 ? 'google' : `google${attempts}`;
            const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            login = `${baseLogin}${suffix}${number}`;

            const existingLogin = await this.userModel.findOne({ login }).exec();
            if (!existingLogin) break;

            attempts++;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // Если не удалось сгенерировать уникальный логин, используем Google ID
            login = `google_${googleId}`;
        }

        // Создаем нового Google пользователя
        const newUser = new this.userModel({
            email,
            login,
            name,
            second_name,
            googleId,
            avatar_url,
            is_google_user: true,
            isEmailVerified: true, // Google пользователи уже верифицированы
            isBlocked: false,
            roles: [userRole._id],
            // Не устанавливаем пароль для Google пользователей
            password: undefined,
        });

        // Устанавливаем Google токены
        newUser.updateGoogleTokens(accessToken, refreshToken);

        const savedUser = await newUser.save();

        // Отправляем приветственное письмо
        try {
            await this.emailService.sendWelcomeEmailForGoogleUser(email, name);
        } catch (error) {
            this.logger.error(`Ошибка отправки приветственного письма: ${error.message}`);
        }

        // Возвращаем пользователя с заполненными ролями
        const result = await this.userModel
            .findById(savedUser._id)
            .populate('roles')
            .exec();

        if (!result) {
            throw new NotFoundException('Ошибка при создании пользователя');
        }

        this.logger.log(`Создан новый Google пользователь: ${email}`);
        return result;
    }

    /**
     * Связывание существующего аккаунта с Google
     * @param userId - ID существующего пользователя
     * @param googleData - данные от Google
     */
    async linkGoogleAccount(userId: string, googleData: CreateGoogleUserDto): Promise<UserDocument> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        // Проверяем, что Google аккаунт не связан с другим пользователем
        const existingGoogleUser = await this.findByGoogleId(googleData.googleId);
        if (existingGoogleUser && (existingGoogleUser._id as any).toString() !== userId) {
            throw new ConflictException('Этот Google аккаунт уже связан с другим пользователем');
        }

        // Связываем аккаунты
        user.googleId = googleData.googleId;
        user.is_google_user = true;
        user.isEmailVerified = true;
        user.avatar_url = googleData.avatar_url;
        user.updateGoogleTokens(googleData.accessToken, googleData.refreshToken);

        // Обновляем имя/фамилию если они пустые
        if (!user.name && googleData.name) user.name = googleData.name;
        if (!user.second_name && googleData.second_name) user.second_name = googleData.second_name;

        await user.save();

        this.logger.log(`Связан Google аккаунт с пользователем: ${user.email}`);
        return user;
    }

    /**
     * Отвязывание Google аккаунта от пользователя
     * @param userId - ID пользователя
     */
    async unlinkGoogleAccount(userId: string): Promise<UserDocument> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        if (!user.is_google_user) {
            throw new ConflictException('У пользователя нет связанного Google аккаунта');
        }

        // Проверяем, есть ли у пользователя пароль
        if (!user.password) {
            throw new ConflictException(
                'Нельзя отвязать Google аккаунт без установки пароля. Сначала установите пароль.'
            );
        }

        // Отвязываем Google аккаунт
        user.googleId = undefined;
        user.is_google_user = false;
        user.avatar_url = undefined;
        user.google_access_token = undefined;
        user.google_refresh_token = undefined;
        user.google_token_expires_at = undefined;
        user.last_google_login = undefined;

        await user.save();

        this.logger.log(`Отвязан Google аккаунт от пользователя: ${user.email}`);
        return user;
    }

    /**
     * Получение всех Google пользователей
     */
    async findGoogleUsers(): Promise<UserDocument[]> {
        return this.userModel
            .find({ is_google_user: true })
            .populate('roles')
            .select('-password -google_access_token -google_refresh_token')
            .exec();
    }

    //Поиск пользователя по email
    async findOne(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).populate('roles').exec();
    }

    //Поиск пользователя по логину
    async findByLogin(login: string): Promise<User | null> {
        return this.userModel.findOne({ login }).populate('roles').exec();
    }

    //Поиск пользователя по ID
    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).populate('roles').exec();
    }

    //Сохранение кода верификации для email
    async saveVerificationCode(email: string, code: string): Promise<void> {
        const codeExpires = new Date();
        codeExpires.setMinutes(codeExpires.getMinutes() + 15); // Код действителен 15 минут

        // Проверяем, есть ли уже пользователь с таким email
        const existingUser = await this.userModel.findOne({ email }).exec();

        if (existingUser) {
            // Обновляем код для существующего пользователя
            existingUser.verificationCode = code;
            existingUser.verificationCodeExpires = codeExpires;
            await existingUser.save();
        } else {
            // Создаем временную запись пользователя только с email и кодом
            const tempUser = new this.userModel({
                email,
                login: `temp_${Date.now()}`, // Временный логин
                password: 'temp_password', // Временный пароль
                verificationCode: code,
                verificationCodeExpires: codeExpires,
                isEmailVerified: false,
                roles: [] // Пустые роли пока что
            });
            await tempUser.save();
        }
    }

    //Проверка кода верификации
    async verifyCode(email: string, code: string): Promise<boolean> {
        const user = await this.userModel.findOne({
            email,
            verificationCode: code,
            verificationCodeExpires: { $gt: new Date() }
        }).exec();

        return !!user;
    }

    //Создание пользователя с готовыми учетными данными
    async createWithCredentials(data: CreateWithCredentialsDto): Promise<UserDocument> {
        const { email, login, password, name, second_name, age, telefon_number } = data;

        // Проверяем уникальность логина
        const existingUserByLogin = await this.userModel.findOne({ login }).exec();
        if (existingUserByLogin && existingUserByLogin.login !== `temp_${Date.now()}`) {
            throw new ConflictException('Пользователь с таким логином уже существует');
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Получаем базовую роль
        const userRole = await this.rolesService.getUserRole();

        // Ищем существующую временную запись или создаем новую
        let user = await this.userModel.findOne({ email }).exec();

        if (user) {
            // Обновляем существующего пользователя
            user.login = login;
            user.password = hashedPassword;
            if (name !== undefined) user.name = name;
            if (second_name !== undefined) user.second_name = second_name;
            if (age !== undefined) user.age = age;
            if (telefon_number !== undefined) user.telefon_number = telefon_number;
            user.isEmailVerified = true;
            user.verificationCode = null;
            user.verificationCodeExpires = null;
            user.roles = [userRole._id as any];

            await user.save();
        } else {
            // Создаем нового пользователя
            user = new this.userModel({
                email,
                login,
                password: hashedPassword,
                name: name || undefined,
                second_name: second_name || undefined,
                age: age || undefined,
                telefon_number: telefon_number || undefined,
                isEmailVerified: true,
                roles: [userRole._id as any]
            });

            await user.save();
        }

        const result = await this.userModel.findById(user._id).populate('roles').exec();
        if (!result) {
            throw new NotFoundException('Ошибка при создании пользователя');
        }
        return result;
    }

    //Старый метод создания пользователя (для обратной совместимости)
    async create(createUserDto: CreateUserDto): Promise<User | null> {
        const { email } = createUserDto;

        // Проверка на существование пользователя
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        // Для старого метода генерируем временные данные
        const tempPassword = Math.random().toString(36).substring(2, 15);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Создание токена верификации (старый метод)
        const verificationToken = uuidv4();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

        // Получение базовой роли 'user'
        const userRole = await this.rolesService.getUserRole();

        const newUser = new this.userModel({
            email,
            login: `user_${Date.now()}`, // Временный логин
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires,
            isEmailVerified: false,
            roles: [userRole._id]
        });

        const savedUser = await newUser.save();
        return this.userModel.findById(savedUser._id).populate('roles').exec();
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel
            .find()
            .populate('roles')
            .select('-password -verificationToken -resetPasswordToken -verificationTokenExpires -resetPasswordExpires -verificationCode -verificationCodeExpires')
            .exec();
    }

    async findByVerificationToken(token: string): Promise<User | null> {
        return this.userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        }).populate('roles').exec();
    }

    async verifyEmail(token: string): Promise<User> {
        const user = await this.userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        }).exec();

        if (!user) {
            throw new NotFoundException('Недействительный или просроченный токен верификации');
        }

        user.isEmailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;

        return user.save();
    }

    async generateNewVerificationToken(email: string): Promise<string> {
        const user = await this.findOne(email);

        if (!user) {
            throw new NotFoundException('Пользователь с таким email не найден');
        }

        if (user.isEmailVerified) {
            throw new ConflictException('Email уже подтвержден');
        }

        const verificationToken = uuidv4();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

        await this.userModel.updateOne(
            { email },
            {
                verificationToken,
                verificationTokenExpires,
            },
        );

        return verificationToken;
    }

    async generateResetPasswordToken(email: string): Promise<string> {
        const user = await this.findOne(email);

        if (!user) {
            throw new NotFoundException('Пользователь с таким email не найден');
        }

        const resetToken = uuidv4();
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Токен действителен 1 час

        await this.userModel.updateOne(
            { email },
            {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetTokenExpires,
            },
        );

        return resetToken;
    }

    async resetPassword(token: string, newPassword: string): Promise<User> {
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        }).exec();

        if (!user) {
            throw new NotFoundException('Недействительный или просроченный токен сброса пароля');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        return user.save();
    }

    async addRoleToUser(userId: string, roleId: string): Promise<User | null> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }

        const role = await this.rolesService.findOne(roleId);

        // Проверяем, есть ли уже такая роль у пользователя
        const hasRole = user.roles && user.roles.some(r => r.toString() === roleId);
        if (!hasRole) {
            if (!user.roles) {
                user.roles = [];
            }
            user.roles.push(role._id as any);
            await user.save();
        }

        return this.userModel.findById(userId).populate('roles').exec();
    }

    async removeRoleFromUser(userId: string, roleId: string): Promise<User | null> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }

        // Проверяем существование роли
        await this.rolesService.findOne(roleId);

        // Проверяем, не пытаемся ли удалить последнюю роль пользователя
        if (user.roles && user.roles.length === 1 && user.roles[0].toString() === roleId) {
            throw new ConflictException('Нельзя удалить последнюю роль пользователя');
        }

        // Удаляем роль
        if (user.roles) {
            user.roles = user.roles.filter(r => r.toString() !== roleId);
            await user.save();
        }

        return this.userModel.findById(userId).populate('roles').exec();
    }

    async verifyEmailWithoutToken(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        user.isEmailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;

        return user.save();
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto, isAdmin: boolean = false): Promise<UserDocument> {
        // Проверяем существование пользователя
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }

        // Если пользователь не админ, удаляем критические поля из обновления
        if (!isAdmin) {
            delete (updateUserDto as any).roles;
            delete (updateUserDto as any).isBlocked;
            delete (updateUserDto as any).isEmailVerified;
        }

        // Если пользователь пытается изменить email, проверяем, не занят ли этот email
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findOne(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException(`Email ${updateUserDto.email} уже занят`);
            }

            // Сохраняем старый email для отправки уведомления
            const oldEmail = user.email;

            // Обновляем email
            user.email = updateUserDto.email;

            // Сбрасываем статус верификации при изменении email
            user.isEmailVerified = false;

            // Генерируем новый токен для верификации
            user.verificationToken = uuidv4();
            const verificationTokenExpires = new Date();
            verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
            user.verificationTokenExpires = verificationTokenExpires;

            // Сохраняем пользователя, чтобы получить обновленный документ
            await user.save();

            // Формируем URL для верификации
            const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${user.verificationToken}`;

            // Отправляем уведомления об изменении email
            try {
                await this.emailService.sendEmailChangeNotification(oldEmail, user.email, verificationUrl);
            } catch (error) {
                this.logger.error(`Ошибка при отправке уведомлений об изменении email: ${error.message}`);
            }
        } else {
            // Если email не менялся, обновляем остальные поля
            // if (updateUserDto.password) {
            //     user.password = await bcrypt.hash(updateUserDto.password, 10);
            // }

            if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
            if (updateUserDto.second_name !== undefined) user.second_name = updateUserDto.second_name;
            if (updateUserDto.age !== undefined) user.age = updateUserDto.age;
            if (updateUserDto.telefon_number !== undefined) user.telefon_number = updateUserDto.telefon_number;

            await user.save();
        }

        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден после обновления`);
        }

        return updatedUser;
    }

    async blockUser(id: string, isBlocked: boolean): Promise<UserDocument> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }

        user.isBlocked = isBlocked;
        return user.save();
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }

        await this.userModel.findByIdAndDelete(id);
    }

    async findUsersWithAvatars(): Promise<UserDocument[]> {
        return this.userModel
            .find({ avatarId: { $ne: null } })
            .populate('roles')
            .exec();
    }

    async findUsersWithoutAvatars(): Promise<UserDocument[]> {
        return this.userModel
            .find({ $or: [{ avatarId: null }, { avatarId: { $exists: false } }] })
            .populate('roles')
            .exec();
    }

    async saveResetCode(email: string, code: string): Promise<void> {
        const resetTokenExpires = new Date();
        resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 15); // Код действителен 15 минут

        await this.userModel.updateOne(
            { email },
            {
                resetPasswordToken: code,
                resetPasswordExpires: resetTokenExpires
            }
        );
    }

    async findByResetCode(code: string): Promise<UserDocument | null> {
        return this.userModel.findOne({
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: new Date() }
        }).exec();
    }

    async updatePassword(userId: string, newPassword: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
    }

    
}