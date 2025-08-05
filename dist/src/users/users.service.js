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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("./schemas/user.schema");
const uuid_1 = require("uuid");
const roles_service_1 = require("../roles/roles.service");
const email_service_1 = require("../email/email.service");
let UsersService = UsersService_1 = class UsersService {
    userModel;
    rolesService;
    emailService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userModel, rolesService, emailService) {
        this.userModel = userModel;
        this.rolesService = rolesService;
        this.emailService = emailService;
    }
    async findOne(email) {
        return this.userModel.findOne({ email }).populate('roles').exec();
    }
    async findByVerificationToken(token) {
        return this.userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        }).populate('roles').exec();
    }
    async findAll() {
        return this.userModel
            .find()
            .populate('roles')
            .select('-password -verificationToken -resetPasswordToken -verificationTokenExpires -resetPasswordExpires')
            .exec();
    }
    async create(createUserDto) {
        const { email, password, name, second_name, age, telefon_number } = createUserDto;
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            throw new common_1.ConflictException('Пользователь с таким email уже существует');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = (0, uuid_1.v4)();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
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
    async verifyEmail(token) {
        const user = await this.userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        }).exec();
        if (!user) {
            throw new common_1.NotFoundException('Недействительный или просроченный токен верификации');
        }
        user.isEmailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        return user.save();
    }
    async generateNewVerificationToken(email) {
        const user = await this.findOne(email);
        if (!user) {
            throw new common_1.NotFoundException('Пользователь с таким email не найден');
        }
        if (user.isEmailVerified) {
            throw new common_1.ConflictException('Email уже подтвержден');
        }
        const verificationToken = (0, uuid_1.v4)();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
        await this.userModel.updateOne({ email }, {
            verificationToken,
            verificationTokenExpires,
        });
        return verificationToken;
    }
    async generateResetPasswordToken(email) {
        const user = await this.findOne(email);
        if (!user) {
            throw new common_1.NotFoundException('Пользователь с таким email не найден');
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
        await this.userModel.updateOne({ email }, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetTokenExpires,
        });
        return resetToken;
    }
    async resetPassword(token, newPassword) {
        const user = await this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        }).exec();
        if (!user) {
            throw new common_1.NotFoundException('Недействительный или просроченный токен сброса пароля');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        return user.save();
    }
    async addRoleToUser(userId, roleId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${userId} не найден`);
        }
        const role = await this.rolesService.findOne(roleId);
        const hasRole = user.roles && user.roles.some(r => r.toString() === roleId);
        if (!hasRole) {
            if (!user.roles) {
                user.roles = [];
            }
            user.roles.push(role._id);
            await user.save();
        }
        return this.userModel.findById(userId).populate('roles').exec();
    }
    async removeRoleFromUser(userId, roleId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${userId} не найден`);
        }
        await this.rolesService.findOne(roleId);
        if (user.roles && user.roles.length === 1 && user.roles[0].toString() === roleId) {
            throw new common_1.ConflictException('Нельзя удалить последнюю роль пользователя');
        }
        if (user.roles) {
            user.roles = user.roles.filter(r => r.toString() !== roleId);
            await user.save();
        }
        return this.userModel.findById(userId).populate('roles').exec();
    }
    async verifyEmailWithoutToken(email) {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        user.isEmailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        return user.save();
    }
    async findById(id) {
        return this.userModel.findById(id).populate('roles').exec();
    }
    async updateUser(id, updateUserDto, isAdmin = false) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${id} не найден`);
        }
        if (!isAdmin) {
            delete updateUserDto.roles;
            delete updateUserDto.isBlocked;
            delete updateUserDto.isEmailVerified;
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findOne(updateUserDto.email);
            if (existingUser) {
                throw new common_1.ConflictException(`Email ${updateUserDto.email} уже занят`);
            }
            const oldEmail = user.email;
            user.email = updateUserDto.email;
            user.isEmailVerified = false;
            user.verificationToken = (0, uuid_1.v4)();
            const verificationTokenExpires = new Date();
            verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
            user.verificationTokenExpires = verificationTokenExpires;
            await user.save();
            const verificationUrl = `${process.env.APP_URL || 'http://localhost:8000'}/auth/verify-email?token=${user.verificationToken}`;
            try {
                await this.emailService.sendEmailChangeNotification(oldEmail, user.email, verificationUrl);
            }
            catch (error) {
                this.logger.error(`Ошибка при отправке уведомлений об изменении email: ${error.message}`);
            }
        }
        else {
            if (updateUserDto.password) {
                user.password = await bcrypt.hash(updateUserDto.password, 10);
            }
            if (updateUserDto.name !== undefined)
                user.name = updateUserDto.name;
            if (updateUserDto.second_name !== undefined)
                user.second_name = updateUserDto.second_name;
            if (updateUserDto.age !== undefined)
                user.age = updateUserDto.age;
            if (updateUserDto.telefon_number !== undefined)
                user.telefon_number = updateUserDto.telefon_number;
            await user.save();
        }
        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`Пользователь с ID ${id} не найден после обновления`);
        }
        return updatedUser;
    }
    async blockUser(id, isBlocked) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${id} не найден`);
        }
        user.isBlocked = isBlocked;
        return user.save();
    }
    async deleteUser(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${id} не найден`);
        }
        await this.userModel.findByIdAndDelete(id);
    }
    async findUsersWithAvatars() {
        return this.userModel
            .find({ avatarId: { $ne: null } })
            .populate('roles')
            .exec();
    }
    async findUsersWithoutAvatars() {
        return this.userModel
            .find({ $or: [{ avatarId: null }, { avatarId: { $exists: false } }] })
            .populate('roles')
            .exec();
    }
    async saveResetCode(email, code) {
        const resetTokenExpires = new Date();
        resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 15);
        await this.userModel.updateOne({ email }, {
            resetPasswordToken: code,
            resetPasswordExpires: resetTokenExpires
        });
    }
    async findByResetCode(code) {
        return this.userModel.findOne({
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: new Date() }
        }).exec();
    }
    async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        roles_service_1.RolesService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map