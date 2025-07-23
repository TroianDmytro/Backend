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

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private rolesService: RolesService,
        private readonly emailService: EmailService
    ) { }

    async findOne(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).populate('roles').exec();
    }

    async findByVerificationToken(token: string): Promise<User | null> {
        return this.userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        }).populate('roles').exec();
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel
            .find()
            .populate('roles')
            .populate('courses')
            .select('-password -verificationToken -resetPasswordToken -verificationTokenExpires -resetPasswordExpires')
            .exec();
    }

    async create(createUserDto: CreateUserDto): Promise<User | null> {
        const { email, password, name, second_name, age, telefon_number } = createUserDto;

        // Проверка на существование пользователя
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание токена верификации
        const verificationToken = uuidv4();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // Токен действителен 24 часа

        // Получение базовой роли 'user'
        const userRole = await this.rolesService.getUserRole();

        const newUser = new this.userModel({
            email,
            password: hashedPassword,
            name,
            second_name,
            age,
            telefon_number,
            verificationToken,
            verificationTokenExpires,
            isEmailVerified: false,
            roles: [userRole._id]
        });

        const savedUser = await newUser.save();
        return this.userModel.findById(savedUser._id).populate('roles').exec();
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

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).populate('roles').exec();
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto, isAdmin: boolean = false): Promise<UserDocument> {
        // Проверяем существование пользователя
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${id} не найден`);
        }

        // Если пользователь не админ, удаляем критические поля из обновления
        if (!isAdmin) {
            // Удаляем эти поля
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
                // Продолжаем выполнение даже в случае ошибки отправки
            }
        } else {
            // Если email не менялся, обновляем остальные поля
            if (updateUserDto.password) {
                user.password = await bcrypt.hash(updateUserDto.password, 10);
            }

            if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
            if (updateUserDto.second_name !== undefined) user.second_name = updateUserDto.second_name;
            if (updateUserDto.age !== undefined) user.age = updateUserDto.age;
            if (updateUserDto.telefon_number !== undefined) user.telefon_number = updateUserDto.telefon_number;

            await user.save();
        }
        // Проверяем результат findById на null
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

        // Обновляем статус блокировки
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

    /**
     *  Получение всех пользователей с аватарами
     */
    async findUsersWithAvatars(): Promise<UserDocument[]> {
        return this.userModel
            .find({ avatarId: { $ne: null } })
            .populate('roles')
            .exec();
    }

    /**
     * Получение всех пользователей без аватаров
     */
    async findUsersWithoutAvatars(): Promise<UserDocument[]> {
        return this.userModel
            .find({ $or: [{ avatarId: null }, { avatarId: { $exists: false } }] })
            .populate('roles')
            .exec();
    }

    // Добавьте эти методы в класс UsersService

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