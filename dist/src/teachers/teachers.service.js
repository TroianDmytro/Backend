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
var TeachersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const teacher_schema_1 = require("./schemas/teacher.schema");
const course_schema_1 = require("../courses/schemas/course.schema");
const email_service_1 = require("../email/email.service");
let TeachersService = TeachersService_1 = class TeachersService {
    teacherModel;
    courseModel;
    emailService;
    logger = new common_1.Logger(TeachersService_1.name);
    constructor(teacherModel, courseModel, emailService) {
        this.teacherModel = teacherModel;
        this.courseModel = courseModel;
        this.emailService = emailService;
    }
    async createApplication(createTeacherDto) {
        const { email, password, ...teacherData } = createTeacherDto;
        const existingTeacher = await this.teacherModel.findOne({ email }).exec();
        if (existingTeacher) {
            throw new common_1.ConflictException('Преподаватель с таким email уже существует');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = (0, uuid_1.v4)();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
        const newTeacher = new this.teacherModel({
            email,
            password: hashedPassword,
            ...teacherData,
            verificationToken,
            verificationTokenExpires,
            isEmailVerified: false,
            isApproved: false,
            isBlocked: false,
            approvalStatus: 'pending',
            courses: [],
            rating: 0,
            reviewsCount: 0
        });
        const savedTeacher = await newTeacher.save();
        try {
            await this.emailService.sendVerificationEmail(email, `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`, teacherData.name);
        }
        catch (error) {
            this.logger.error(`Ошибка отправки письма верификации: ${error.message}`);
        }
        try {
            await this.notifyAdminsAboutNewApplication(savedTeacher);
        }
        catch (error) {
            this.logger.error(`Ошибка уведомления администраторов: ${error.message}`);
        }
        this.logger.log(`Создана заявка преподавателя: ${email}`);
        return savedTeacher;
    }
    async findAll(status = 'all', page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        let filter = {};
        if (status !== 'all') {
            filter.approvalStatus = status;
        }
        if (status === 'approved') {
            filter.isBlocked = false;
        }
        const [teachers, totalItems] = await Promise.all([
            this.teacherModel
                .find(filter)
                .populate('assignedCourses')
                .select('-password -verificationToken -resetPasswordToken')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.teacherModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return { teachers, totalItems, totalPages };
    }
    async findById(id) {
        return this.teacherModel
            .findById(id)
            .populate('assignedCourses')
            .select('-password -verificationToken -resetPasswordToken')
            .exec();
    }
    async findByEmail(email) {
        return this.teacherModel
            .findOne({ email })
            .populate('assignedCourses')
            .exec();
    }
    async update(id, updateTeacherDto) {
        const teacher = await this.teacherModel.findById(id).exec();
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${id} не найден`);
        }
        if (updateTeacherDto.email && updateTeacherDto.email !== teacher.email) {
            const existingTeacher = await this.findByEmail(updateTeacherDto.email);
            if (existingTeacher) {
                throw new common_1.ConflictException(`Email ${updateTeacherDto.email} уже занят`);
            }
            teacher.isEmailVerified = false;
            teacher.verificationToken = (0, uuid_1.v4)();
            const verificationTokenExpires = new Date();
            verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
            teacher.verificationTokenExpires = verificationTokenExpires;
        }
        if (updateTeacherDto.password) {
            updateTeacherDto.password = await bcrypt.hash(updateTeacherDto.password, 10);
        }
        Object.assign(teacher, updateTeacherDto);
        const updatedTeacher = await teacher.save();
        this.logger.log(`Обновлены данные преподавателя: ${id}`);
        return updatedTeacher;
    }
    async approveApplication(teacherId, status, adminId, rejectionReason) {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }
        if (teacher.approvalStatus !== 'pending') {
            throw new common_1.BadRequestException('Заявка уже была рассмотрена');
        }
        teacher.approvalStatus = status;
        teacher.isApproved = status === 'approved';
        teacher.approvedAt = new Date();
        teacher.approvedBy = adminId;
        if (status === 'rejected' && rejectionReason) {
            teacher.rejectionReason = rejectionReason;
        }
        const updatedTeacher = await teacher.save();
        try {
            if (status === 'approved') {
                await this.emailService.sendTeacherApprovalNotification(teacher.email, teacher.name, 'approved');
            }
            else {
                await this.emailService.sendTeacherApprovalNotification(teacher.email, teacher.name, 'rejected', rejectionReason);
            }
        }
        catch (error) {
            this.logger.error(`Ошибка отправки уведомления: ${error.message}`);
        }
        this.logger.log(`Заявка преподавателя ${teacherId} ${status === 'approved' ? 'одобрена' : 'отклонена'}`);
        return updatedTeacher;
    }
    async assignCourse(teacherId, courseId) {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }
        if (!teacher.isApproved) {
            throw new common_1.BadRequestException('Нельзя назначить курс неодобренному преподавателю');
        }
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        if (teacher.assignedCourses.includes(courseId)) {
            throw new common_1.ConflictException('Курс уже назначен этому преподавателю');
        }
        teacher.assignedCourses.push(courseId);
        await teacher.save();
        course.teacherId = teacherId;
        await course.save();
        this.logger.log(`Курс ${courseId} назначен преподавателю ${teacherId}`);
        const result = await this.findById(teacherId);
        if (!result) {
            throw new common_1.NotFoundException('Преподаватель не найден после назначения курса');
        }
        return result;
    }
    async removeCourse(teacherId, courseId) {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        teacher.assignedCourses = teacher.assignedCourses.filter(id => id.toString() !== courseId);
        await teacher.save();
        course.teacherId = undefined;
        await course.save();
        this.logger.log(`Курс ${courseId} удален у преподавателя ${teacherId}`);
        const result = await this.findById(teacherId);
        if (!result) {
            throw new common_1.NotFoundException('Преподаватель не найден после удаления курса');
        }
        return result;
    }
    async getTeacherCourses(teacherId) {
        const teacher = await this.teacherModel
            .findById(teacherId)
            .populate({
            path: 'courses',
            populate: {
                path: 'lessons',
                select: 'title order duration_minutes'
            },
            select: '-__v'
        })
            .exec();
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }
        const activeCourses = teacher.assignedCourses.filter(course => course.is_active && course.isPublished);
        return activeCourses;
    }
    async getTeacherStatistics(teacherId) {
        const teacher = await this.findById(teacherId);
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }
        const courses = await this.getTeacherCourses(teacherId);
        const statistics = {
            totalCourses: courses.length,
            publishedCourses: courses.filter(course => course.isPublished).length,
            totalStudents: courses.reduce((sum, course) => sum + (course.current_students_count || 0), 0),
            averageRating: teacher.rating,
            totalReviews: teacher.reviewsCount,
            totalRevenue: courses.reduce((sum, course) => sum + (course.price * (course.current_students_count || 0)), 0)
        };
        return statistics;
    }
    async blockTeacher(teacherId, isBlocked, reason) {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }
        teacher.isBlocked = isBlocked;
        if (isBlocked && reason) {
        }
        const updatedTeacher = await teacher.save();
        try {
            await this.emailService.sendBlockNotification(teacher.email, teacher.name, isBlocked, reason);
        }
        catch (error) {
            this.logger.error(`Ошибка отправки уведомления о блокировке: ${error.message}`);
        }
        this.logger.log(`Преподаватель ${teacherId} ${isBlocked ? 'заблокирован' : 'разблокирован'}`);
        return updatedTeacher;
    }
    async delete(teacherId) {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new common_1.NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }
        const activeCourses = await this.courseModel.find({
            teacherId: teacherId,
            is_active: true,
            current_students_count: { $gt: 0 }
        }).exec();
        if (activeCourses.length > 0) {
            throw new common_1.ConflictException('Нельзя удалить преподавателя с активными курсами, имеющими студентов');
        }
        await this.courseModel.updateMany({ teacherId: teacherId }, { $unset: { teacherId: 1 } }).exec();
        await this.teacherModel.findByIdAndDelete(teacherId).exec();
        this.logger.log(`Преподаватель ${teacherId} удален`);
    }
    async notifyAdminsAboutNewApplication(teacher) {
        this.logger.log(`Новая заявка от преподавателя: ${teacher.email}`);
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = TeachersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(teacher_schema_1.Teacher.name)),
    __param(1, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map