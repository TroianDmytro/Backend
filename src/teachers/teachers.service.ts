// src/teachers/teachers.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class TeachersService {
    private readonly logger = new Logger(TeachersService.name);

    constructor(
        @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        private readonly emailService: EmailService
    ) { }

    /**
     * Создание заявки на регистрацию преподавателя
     */
    async createApplication(createTeacherDto: CreateTeacherDto): Promise<TeacherDocument> {
        const { email, password, ...teacherData } = createTeacherDto;

        // Проверка на существование преподавателя с таким email
        const existingTeacher = await this.teacherModel.findOne({ email }).exec();
        if (existingTeacher) {
            throw new ConflictException('Преподаватель с таким email уже существует');
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание токена верификации
        const verificationToken = uuidv4();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

        // Создание нового преподавателя со статусом "pending"
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

        // Отправка письма с подтверждением email
        try {
            await this.emailService.sendVerificationEmail(
                email,
                `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`,
                teacherData.name
            );
        } catch (error) {
            this.logger.error(`Ошибка отправки письма верификации: ${error.message}`);
        }

        // Уведомление администраторов о новой заявке
        try {
            await this.notifyAdminsAboutNewApplication(savedTeacher);
        } catch (error) {
            this.logger.error(`Ошибка уведомления администраторов: ${error.message}`);
        }

        this.logger.log(`Создана заявка преподавателя: ${email}`);
        return savedTeacher;
    }

    /**
     * Получение списка преподавателей с фильтрацией и пагинацией
     */
    async findAll(
        status: 'pending' | 'approved' | 'rejected' | 'all' = 'all',
        page: number = 1,
        limit: number = 10
    ): Promise<{ teachers: TeacherDocument[]; totalItems: number; totalPages: number }> {
        const skip = (page - 1) * limit;

        // фильтр
        let filter: any = {};
        if (status !== 'all') {
            filter.approvalStatus = status;
        }

        // Если статус "approved", показываем только не заблокированных
        if (status === 'approved') {
            filter.isBlocked = false;
        }

        const [teachers, totalItems] = await Promise.all([
            this.teacherModel
                .find(filter)
                .populate('assignedCourses') //используем assignedCourses вместо courses
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

    /**
     * Получение преподавателя по ID
     */
    async findById(id: string): Promise<TeacherDocument | null> {
        return this.teacherModel
            .findById(id)
            .populate('assignedCourses') // используем assignedCourses
            .select('-password -verificationToken -resetPasswordToken')
            .exec();
    }

    /**
     * Получение преподавателя по email
     */
    async findByEmail(email: string): Promise<TeacherDocument | null> {
        return this.teacherModel
            .findOne({ email })
            .populate('assignedCourses') // используем assignedCourses
            .exec();
    }

    /**
     * Обновление данных преподавателя
     */
    async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<TeacherDocument> {
        const teacher = await this.teacherModel.findById(id).exec();
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${id} не найден`);
        }

        // Если обновляется email, проверяем уникальность
        if (updateTeacherDto.email && updateTeacherDto.email !== teacher.email) {
            const existingTeacher = await this.findByEmail(updateTeacherDto.email);
            if (existingTeacher) {
                throw new ConflictException(`Email ${updateTeacherDto.email} уже занят`);
            }
            // При смене email сбрасываем верификацию
            teacher.isEmailVerified = false;
            teacher.verificationToken = uuidv4();
            const verificationTokenExpires = new Date();
            verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
            teacher.verificationTokenExpires = verificationTokenExpires;
        }

        // Если обновляется пароль
        if (updateTeacherDto.password) {
            updateTeacherDto.password = await bcrypt.hash(updateTeacherDto.password, 10);
        }

        // Обновляем поля
        Object.assign(teacher, updateTeacherDto);

        const updatedTeacher = await teacher.save();

        this.logger.log(`Обновлены данные преподавателя: ${id}`);
        return updatedTeacher;
    }

    /**
     * Одобрение или отклонение заявки преподавателя
     */
    async approveApplication(
        teacherId: string,
        status: 'approved' | 'rejected',
        adminId: string,
        rejectionReason?: string
    ): Promise<TeacherDocument> {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        if (teacher.approvalStatus !== 'pending') {
            throw new BadRequestException('Заявка уже была рассмотрена');
        }

        // Обновляем статус
        teacher.approvalStatus = status;
        teacher.isApproved = status === 'approved';
        teacher.approvedAt = new Date();
        teacher.approvedBy = adminId as any;

        if (status === 'rejected' && rejectionReason) {
            teacher.rejectionReason = rejectionReason;
        }

        const updatedTeacher = await teacher.save();

        // Отправляем уведомление преподавателю
        try {
            if (status === 'approved') {
                await this.emailService.sendTeacherApprovalNotification(
                    teacher.email,
                    teacher.name,
                    'approved'
                );
            } else {
                await this.emailService.sendTeacherApprovalNotification(
                    teacher.email,
                    teacher.name,
                    'rejected',
                    rejectionReason
                );
            }
        } catch (error) {
            this.logger.error(`Ошибка отправки уведомления: ${error.message}`);
        }

        this.logger.log(`Заявка преподавателя ${teacherId} ${status === 'approved' ? 'одобрена' : 'отклонена'}`);
        return updatedTeacher;
    }

    /**
     * Назначение курса преподавателю
     */
    async assignCourse(teacherId: string, courseId: string): Promise<TeacherDocument> {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        if (!teacher.isApproved) {
            throw new BadRequestException('Нельзя назначить курс неодобренному преподавателю');
        }

        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Проверяем, не назначен ли уже этот курс
        if (teacher.assignedCourses.includes(courseId as any)) {
            throw new ConflictException('Курс уже назначен этому преподавателю');
        }

        // Назначаем курс преподавателю
        teacher.assignedCourses.push(courseId as any);
        await teacher.save();

        // Обновляем курс
        course.teacherId = teacherId as any;
        await course.save();

        this.logger.log(`Курс ${courseId} назначен преподавателю ${teacherId}`);

        // ИСПРАВЛЕНИЕ: проверяем результат на null
        const result = await this.findById(teacherId);
        if (!result) {
            throw new NotFoundException('Преподаватель не найден после назначения курса');
        }
        return result;
    }

    /*
     * Удаление курса у преподавателя
     */
    async removeCourse(teacherId: string, courseId: string): Promise<TeacherDocument> {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new NotFoundException(`Курс с ID ${courseId} не найден`);
        }

        // Удаляем курс из списка преподавателя
        teacher.assignedCourses = teacher.assignedCourses.filter(
            id => id.toString() !== courseId
        ) as any;
        await teacher.save();

        // Обнуляем преподавателя в курсе
        course.teacherId = undefined as any;
        await course.save();

        this.logger.log(`Курс ${courseId} удален у преподавателя ${teacherId}`);

        const result = await this.findById(teacherId);
        if (!result) {
            throw new NotFoundException('Преподаватель не найден после удаления курса');
        }
        return result;
    }

    /**
     * Получение курсов преподавателя
     */
    async getTeacherCourses(teacherId: string): Promise<CourseDocument[]> {
        const teacher = await this.teacherModel
            .findById(teacherId)
            .populate({
                path: 'courses',
                populate: {
                    path: 'lessons',  // Вложенный populate для уроков
                    select: 'title order duration_minutes'  // Выбираем только нужные поля
                },
                select: '-__v'  // Исключаем служебное поле __v
            })
            .exec();

        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        // Фильтруем и обрабатываем курсы
        const activeCourses = (teacher.assignedCourses as CourseDocument[]).filter(
            course => course.is_active && course.isPublished
        );

        return activeCourses;
    }

    /**
     * Получение статистики преподавателя
     */
    async getTeacherStatistics(teacherId: string): Promise<any> {
        const teacher = await this.findById(teacherId);
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        const courses = await this.getTeacherCourses(teacherId);

        // Базовая статистика
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

    /**
     * Блокировка/разблокировка преподавателя
     */
    async blockTeacher(teacherId: string, isBlocked: boolean, reason?: string): Promise<TeacherDocument> {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        teacher.isBlocked = isBlocked;

        if (isBlocked && reason) {
            // Можно добавить поле blockReason в схему если нужно
            // teacher.blockReason = reason;
        }

        const updatedTeacher = await teacher.save();

        // Уведомляем преподавателя
        try {
            await this.emailService.sendBlockNotification(
                teacher.email,
                teacher.name,
                isBlocked,
                reason
            );
        } catch (error) {
            this.logger.error(`Ошибка отправки уведомления о блокировке: ${error.message}`);
        }

        this.logger.log(`Преподаватель ${teacherId} ${isBlocked ? 'заблокирован' : 'разблокирован'}`);
        return updatedTeacher;
    }

    /**
     * Удаление преподавателя
     */
    async delete(teacherId: string): Promise<void> {
        const teacher = await this.teacherModel.findById(teacherId).exec();
        if (!teacher) {
            throw new NotFoundException(`Преподаватель с ID ${teacherId} не найден`);
        }

        // Проверяем, есть ли активные курсы
        const activeCourses = await this.courseModel.find({
            teacherId: teacherId,
            is_active: true,
            current_students_count: { $gt: 0 }
        }).exec();

        if (activeCourses.length > 0) {
            throw new ConflictException(
                'Нельзя удалить преподавателя с активными курсами, имеющими студентов'
            );
        }

        // Удаляем связь с курсами
        await this.courseModel.updateMany(
            { teacherId: teacherId },
            { $unset: { teacherId: 1 } }
        ).exec();

        // Удаляем преподавателя
        await this.teacherModel.findByIdAndDelete(teacherId).exec();

        this.logger.log(`Преподаватель ${teacherId} удален`);
    }

    /**
     * Уведомление администраторов о новой заявке
     */
    private async notifyAdminsAboutNewApplication(teacher: TeacherDocument): Promise<void> {
        // Здесь можно получить список администраторов и отправить им уведомления
        // Пока что просто логируем
        this.logger.log(`Новая заявка от преподавателя: ${teacher.email}`);

        // Можно отправить email администраторам
        //TODO
        //await this.emailService.sendNewTeacherApplicationNotification(adminEmails, teacher);
    }
}