// src/homework/homework.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Homework, HomeworkDocument } from './schemas/homework.schema';
import { HomeworkSubmission, HomeworkSubmissionDocument, SubmissionStatus } from './schemas/homework-submission.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { ReviewHomeworkDto } from './dto/review-homework.dto';
import { Subscription, SubscriptionDocument } from 'src/subscriptions/schemas/subscription.schema';

@Injectable()
export class HomeworkService {
    private readonly logger = new Logger(HomeworkService.name);

    constructor(
        @InjectModel(Homework.name) private homeworkModel: Model<HomeworkDocument>,
        @InjectModel(HomeworkSubmission.name) private submissionModel: Model<HomeworkSubmissionDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    ) { }

    async findById(id: string): Promise<HomeworkDocument> {
        const homework = await this.homeworkModel.findById(id)
            .populate('lesson', 'title date')
            .populate('assignedBy', 'name email');

        if (!homework) {
            throw new NotFoundException('Домашнее задание не найдено');
        }
        return homework;
    }

    /**
     * Создание домашнего задания преподавателем
     */
    async createHomework(
        createHomeworkDto: CreateHomeworkDto,
        files: Express.Multer.File[],
        teacherId: string
    ): Promise<HomeworkDocument> {
        this.logger.log(`Создание домашнего задания: ${createHomeworkDto.title}`);

        // Проверяем существование урока
        const lesson = await this.lessonModel.findById(createHomeworkDto.lessonId).populate('courseId').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${createHomeworkDto.lessonId} не найден`);
        }

        const course = lesson.course as any;

        // Проверяем права преподавателя
        if (course.mainTeacher.toString() !== teacherId) {
            throw new ForbiddenException('Вы можете создавать задания только для своих курсов');
        }

        // Проверяем уникальность названия задания в рамках урока
        const existingHomework = await this.homeworkModel.findOne({
            lessonId: createHomeworkDto.lessonId,
            title: createHomeworkDto.title
        }).exec();

        if (existingHomework) {
            throw new ConflictException(`Задание с названием "${createHomeworkDto.title}" уже существует в этом уроке`);
        }

        // Валидируем и конвертируем файлы
        if (!files || files.length === 0) {
            throw new BadRequestException('Необходимо загрузить хотя бы один файл задания');
        }

        const homeworkFiles = await this.processFiles(files);

        // Создаем домашнее задание
        const homework = new this.homeworkModel({
            ...createHomeworkDto,
            courseId: course._id,
            teacherId: teacherId,
            files: homeworkFiles,
            isActive: true,
            isPublished: createHomeworkDto.isPublished || false,
            submissions_count: 0,
            completed_count: 0,
            average_score: 0
        });

        const savedHomework = await homework.save();
        this.logger.log(`Домашнее задание создано: ${savedHomework.id}`);

        return savedHomework;
    }

    /**
     * Получение заданий урока
     */
    async getHomeworksByLesson(lessonId: string, includeUnpublished: boolean = false): Promise<HomeworkDocument[]> {
        const filter: any = { lessonId, isActive: true };

        if (!includeUnpublished) {
            filter.isPublished = true;
        }

        return this.homeworkModel
            .find(filter)
            .populate('teacherId', 'name second_name')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Получение задания по ID
     */
    async getHomeworkById(id: string, includeFiles: boolean = false): Promise<HomeworkDocument | null> {
        const homework = await this.homeworkModel
            .findById(id)
            .populate('lessonId', 'title order')
            .populate('courseId', 'title')
            .populate('teacherId', 'name second_name')
            .exec();

        if (!homework) {
            return null;
        }

        // Если не нужны файлы, исключаем поле data
        if (!includeFiles &&  homework.fileUrl) {
             homework.fileUrl = homework.fileUrl.map(file => ({
                ...file,
                data: undefined // Исключаем Base64 данные для экономии трафика
            } as any));
        }

        return homework;
    }

    /**
     * Обновление домашнего задания
     */
    async updateHomework(
        id: string,
        updateHomeworkDto: UpdateHomeworkDto,
        teacherId: string,
        isAdmin: boolean = false
    ): Promise<HomeworkDocument> {
        const homework = await this.homeworkModel.findById(id).populate('courseId').exec();
        if (!homework) {
            throw new NotFoundException(`Домашнее задание с ID ${id} не найдено`);
        }

        // Проверяем права доступа
        if (!isAdmin && homework.teacherId.toString() !== teacherId) {
            throw new ForbiddenException('У вас нет прав на редактирование этого задания');
        }

        // Проверяем уникальность названия при изменении
        if (updateHomeworkDto.title && updateHomeworkDto.title !== homework.title) {
            const existingHomework = await this.homeworkModel.findOne({
                lessonId: homework.lesson,
                title: updateHomeworkDto.title,
                _id: { $ne: id }
            }).exec();

            if (existingHomework) {
                throw new ConflictException(`Задание с названием "${updateHomeworkDto.title}" уже существует в этом уроке`);
            }
        }

        Object.assign(homework, updateHomeworkDto);
        const updatedHomework = await homework.save();

        this.logger.log(`Домашнее задание обновлено: ${id}`);
        return updatedHomework;
    }

    /**
     * Удаление домашнего задания
     */
    async deleteHomework(id: string, teacherId: string, isAdmin: boolean = false): Promise<void> {
        const homework = await this.homeworkModel.findById(id).exec();
        if (!homework) {
            throw new NotFoundException(`Домашнее задание с ID ${id} не найдено`);
        }

        // Проверяем права доступа
        if (!isAdmin && homework.teacherId.toString() !== teacherId) {
            throw new ForbiddenException('У вас нет прав на удаление этого задания');
        }

        // Проверяем наличие отправленных работ
        const submissionsCount = await this.submissionModel.countDocuments({ homeworkId: id }).exec();
        if (submissionsCount > 0) {
            throw new ConflictException(`Нельзя удалить задание с ${submissionsCount} отправленными работами`);
        }

        await this.homeworkModel.findByIdAndDelete(id).exec();
        this.logger.log(`Домашнее задание удалено: ${id}`);
    }

    /**
     * Проверка домашнего задания преподавателем
     */
    async reviewSubmission(
        submissionId: string,
        reviewDto: ReviewHomeworkDto,
        teacherId: string
    ): Promise<HomeworkSubmissionDocument> {
        this.logger.log(`Проверка работы: ${submissionId} преподавателем: ${teacherId}`);

        const submission = await this.submissionModel
            .findById(submissionId)
            .populate('homeworkId')
            .exec();

        if (!submission) {
            throw new NotFoundException(`Отправка с ID ${submissionId} не найдена`);
        }

        const homework = submission.homeworkId as any;

        // Проверяем права преподавателя
        if (homework.teacherId.toString() !== teacherId) {
            throw new ForbiddenException('Вы можете проверять только задания своих курсов');
        }

        if (submission.status === 'reviewed') {
            throw new BadRequestException('Эта работа уже проверена');
        }

        // Обновляем данные проверки
        submission.score = reviewDto.score;
        submission.teacher_comment = reviewDto.teacher_comment;
        submission.detailed_feedback = reviewDto.detailed_feedback;
        submission.status = reviewDto.status || 'reviewed';
        submission.reviewed_by = teacherId as any;
        submission.reviewed_at = new Date();

        const updatedSubmission = await submission.save();

        // Обновляем статистику задания
        await this.updateHomeworkStatistics(homework._id);

        this.logger.log(`Работа проверена: ${submissionId}, оценка: ${reviewDto.score}`);
        return updatedSubmission;
    }

    /**
     * Получение отправок для преподавателя
     */
    async getSubmissionsForTeacher(
        teacherId: string,
        status?: string,
        courseId?: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ submissions: HomeworkSubmissionDocument[]; totalItems: number; totalPages: number }> {
        const skip = (page - 1) * limit;

        // Строим фильтр
        const matchFilter: any = {};

        if (status) {
            matchFilter.status = status;
        }

        if (courseId) {
            matchFilter.courseId = courseId;
        }

        // Используем агрегацию для фильтрации по преподавателю через homework
        const pipeline: any[] = [
            {
                $lookup: {
                    from: 'homeworks',
                    localField: 'homeworkId',
                    foreignField: '_id',
                    as: 'homework'
                }
            },
            {
                $unwind: '$homework'
            },
            {
                $match: {
                    'homework.teacherId': teacherId,
                    ...matchFilter
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $sort: { submitted_at: -1 }
            }
        ];

        const [submissions, totalCount] = await Promise.all([
            this.submissionModel.aggregate([
                ...pipeline,
                { $skip: skip },
                { $limit: limit }
            ]).exec(),
            this.submissionModel.aggregate([
                ...pipeline,
                { $count: 'total' }
            ]).exec()
        ]);

        const totalItems = totalCount[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        return { submissions, totalItems, totalPages };
    }

    /**
     * Получение отправок студента
     */
    async getStudentSubmissions(
        studentId: string,
        courseId?: string
    ): Promise<HomeworkSubmissionDocument[]> {
        const filter: any = { studentId };

        if (courseId) {
            filter.courseId = courseId;
        }

        return this.submissionModel
            .find(filter)
            .populate('homeworkId', 'title description max_score deadline')
            .populate('courseId', 'title')
            .populate('reviewed_by', 'name second_name')
            .sort({ submitted_at: -1 })
            .exec();
    }

    /**
     * Получение статистики домашних заданий
     */
    async getHomeworkStatistics(homeworkId: string): Promise<any> {
        const homework = await this.homeworkModel.findById(homeworkId).exec();
        if (!homework) {
            throw new NotFoundException(`Домашнее задание с ID ${homeworkId} не найдено`);
        }

        const submissions = await this.submissionModel.find({ homeworkId }).exec();

        const stats = {
            total_submissions: submissions.length,
            submitted: submissions.filter(s => s.status === 'submitted').length,
            in_review: submissions.filter(s => s.status === 'in_review').length,
            reviewed: submissions.filter(s => s.status === 'reviewed').length,
            returned_for_revision: submissions.filter(s => s.status === 'returned_for_revision').length,
            average_score: 0,
            on_time_submissions: submissions.filter(s => !s.is_late).length,
            late_submissions: submissions.filter(s => s.is_late).length
        };

        // Считаем среднюю оценку для проверенных работ
        const reviewedSubmissions = submissions.filter(s => s.score !== undefined);
        if (reviewedSubmissions.length > 0) {
            stats.average_score = reviewedSubmissions.reduce((sum, s) => sum + s.score!, 0) / reviewedSubmissions.length;
        }

        return stats;
    }

    /**
     * Скачивание файла задания или отправки
     */
    async downloadFile(
        fileId: string,
        homeworkId: string,
        submissionId: string | null,
        userId: string,
        isTeacher: boolean = false
    ): Promise<{ filename: string; data: Buffer; mimeType: string }> {
        let files: any[] = [];
        let sourceDoc: any = null;

        if (submissionId) {
            // Скачивание файла из отправки
            const submission = await this.submissionModel
                .findById(submissionId)
                .populate('homeworkId')
                .exec();

            if (!submission) {
                throw new NotFoundException('Отправка не найдена');
            }

            const homework = submission.homeworkId as any;

            // Проверяем права доступа
            if (!isTeacher && submission.studentId.toString() !== userId) {
                throw new ForbiddenException('У вас нет доступа к этому файлу');
            }

            if (isTeacher && homework.teacherId.toString() !== userId) {
                throw new ForbiddenException('У вас нет доступа к этому файлу');
            }

            files = submission.files;
            sourceDoc = submission;
        } else {
            // Скачивание файла задания
            const homework = await this.homeworkModel.findById(homeworkId).exec();
            if (!homework) {
                throw new NotFoundException('Домашнее задание не найдено');
            }

            if (!homework.isPublished) {
                throw new ForbiddenException('Задание не опубликовано');
            }

            files =  homework.fileUrl;
            sourceDoc = homework;
        }

        // Ищем файл по ID (используем индекс в массиве как ID)
        const fileIndex = parseInt(fileId);
        if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= files.length) {
            throw new NotFoundException('Файл не найден');
        }

        const file = files[fileIndex];

        return {
            filename: file.original_name,
            data: Buffer.from(file.data, 'base64'),
            mimeType: file.mime_type
        };
    }

    /**
     * Обработка загруженных файлов
     */
    private async processFiles(files: Express.Multer.File[]): Promise<any[]> {
        const processedFiles: any[] = [];

        for (const file of files) {
            // Проверяем тип файла (только ZIP)
            if (file.mimetype !== 'application/zip' &&
                file.mimetype !== 'application/x-zip-compressed' &&
                !file.originalname.toLowerCase().endsWith('.zip')) {
                throw new BadRequestException(`Файл ${file.originalname} должен быть в формате ZIP`);
            }

            // Проверяем размер файла (максимум 50MB)
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                throw new BadRequestException(`Файл ${file.originalname} превышает максимальный размер 50MB`);
            }

            // Конвертируем в Base64
            const base64Data = file.buffer.toString('base64');

            processedFiles.push({
                filename: `${Date.now()}_${file.originalname}`,
                original_name: file.originalname,
                data: base64Data,
                size_bytes: file.size,
                mime_type: file.mimetype,
                uploaded_at: new Date()
            });
        }

        return processedFiles;
    }

    /**
     * Обновление статистики задания
     */
    private async updateHomeworkStatistics(homeworkId: string): Promise<void> {
        const submissions = await this.submissionModel.find({ homeworkId }).exec();

        const submissionsCount = submissions.length;
        const completedCount = submissions.filter(s => s.status === 'reviewed').length;

        // Считаем среднюю оценку
        const reviewedSubmissions = submissions.filter(s => s.score !== undefined);
        let averageScore = 0;
        if (reviewedSubmissions.length > 0) {
            averageScore = reviewedSubmissions.reduce((sum, s) => sum + s.score!, 0) / reviewedSubmissions.length;
        }

        await this.homeworkModel.findByIdAndUpdate(homeworkId, {
            submissions_count: submissionsCount,
            completed_count: completedCount,
            average_score: Math.round(averageScore * 100) / 100
        }).exec();
    }

    // src/homework/homework.service.ts - ДОБАВИТЬ ЭТИ МЕТОДЫ К СУЩЕСТВУЮЩЕМУ СЕРВИСУ

    async create(createHomeworkDto: any, file: Express.Multer.File, teacherId: string) {
        if (!file || file.mimetype !== 'application/pdf') {
            throw new BadRequestException('Необходим PDF файл с заданием');
        }

        const lesson = await this.lessonModel.findById(createHomeworkDto.lessonId);
        if (!lesson) {
            throw new NotFoundException('Занятие не найдено');
        }

        const fileUrl = `/uploads/homework/${file.filename}`;

        const homework = new this.homeworkModel({
            title: createHomeworkDto.title,
            description: createHomeworkDto.description,
            fileUrl: fileUrl,
            dueDate: new Date(createHomeworkDto.dueDate),
            lesson: createHomeworkDto.lessonId, // ИСПРАВЛЕНО: используем lesson
            assignedBy: teacherId
        });

        const savedHomework = await homework.save();

        // Создать задания для всех студентов курса
        await this.createHomeworkForAllStudents(savedHomework._id.toString(), lesson.course.toString());

        return savedHomework;
    }

    /**
     * Создать задания для всех студентов курса
     */
    private async createHomeworkForAllStudents(homeworkId: string, courseId: string) {
        const subscriptions = await this.subscriptionModel.find({
            course: courseId, // ИСПРАВЛЕНО: courseId -> course
            status: { $in: ['paid', 'active'] }
        }).populate('user');

        this.logger.log(`Домашнее задание ${homeworkId} назначено ${subscriptions.length} студентам`);
    }

    /**
     * Отправить выполненное домашнее задание
     */
    async submitHomework(homeworkId: string, file: Express.Multer.File, studentId: string) {
        if (!file || !file.filename.endsWith('.zip')) {
            throw new BadRequestException('Необходим ZIP файл с выполненным заданием');
        }

        const homework = await this.homeworkModel.findById(homeworkId);
        if (!homework) {
            throw new NotFoundException('Домашнее задание не найдено');
        }

        // Проверяем дедлайн
        if (new Date() > homework.dueDate) {
            throw new BadRequestException('Срок сдачи домашнего задания истек');
        }

        // Проверяем существующую отправку
        const existingSubmission = await this.homeworkSubmissionModel.findOne({
            homework: homeworkId,
            student: studentId // ИСПРАВЛЕНО: studentId -> student
        });

        if (existingSubmission) {
            throw new BadRequestException('Домашнее задание уже отправлено');
        }

        const fileUrl = `/uploads/homework-submissions/${file.filename}`;

        const submission = new this.homeworkSubmissionModel({
            homework: homeworkId,
            student: studentId,
            fileUrl: fileUrl,
            status: SubmissionStatus.SUBMITTED
        });

        return submission.save();
    }

    /**
     * Оценить домашнее задание
     */
    async gradeHomework(submissionId: string, gradeDto: { grade: number; feedback?: string }, teacherId: string) {
        const submission = await this.homeworkSubmissionModel.findById(submissionId);
        if (!submission) {
            throw new NotFoundException('Отправка домашнего задания не найдена');
        }

        if (gradeDto.grade < 1 || gradeDto.grade > 5) {
            throw new BadRequestException('Оценка должна быть от 1 до 5');
        }

        submission.grade = gradeDto.grade;
        submission.feedback = gradeDto.feedback;
        submission.status = SubmissionStatus.GRADED;
        submission.gradedAt = new Date();
        submission.gradedBy = teacherId as any;

        return submission.save();
    }


    /**
     * Получить все отправки домашнего задания
     */
    async getSubmissions(homeworkId: string) {
        const submissions = await this.homeworkSubmissionModel
            .find({ homework: homeworkId })
            .populate('student', 'name email')
            .populate('gradedBy', 'name email')
            .sort({ createdAt: -1 });

        const homework = await this.homeworkModel
            .findById(homeworkId)
            .populate('lesson', 'title')
            .populate('assignedBy', 'name');

        return {
            homework,
            submissions,
            stats: {
                total: submissions.length,
                submitted: submissions.filter(s => s.status !== SubmissionStatus.SUBMITTED).length,
                graded: submissions.filter(s => s.status === SubmissionStatus.GRADED).length,
                averageGrade: submissions.length > 0
                    ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length
                    : 0
            }
        };
    }

    /**
     * Получить домашние задания студента
     */
    async getStudentHomework(studentId: string) {
        // Получаем курсы студента
        const subscriptions = await this.subscriptionModel
            .find({
                user: studentId,
                status: { $in: ['paid', 'active', 'completed'] }
            })
            .populate('course');

        const courseIds = subscriptions.map(sub => sub.course._id);

        // Получаем все домашние задания по курсам студента
        const homeworks = await this.homeworkModel
            .find({})
            .populate({
                path: 'lesson',
                match: { course: { $in: courseIds } },
                populate: {
                    path: 'course subject',
                    select: 'name'
                }
            })
            .populate('assignedBy', 'name');

        // Фильтруем только те задания, где lesson не null
        const validHomeworks = homeworks.filter(hw => hw.lesson);

        // Получаем отправки студента
        const submissions = await this.homeworkSubmissionModel.find({
            student: studentId,
            homework: { $in: validHomeworks.map(hw => hw._id) }
        });

        const submissionMap = new Map(
            submissions.map(sub => [sub.homework.toString(), sub])
        );

        // Формируем результат
        const result = validHomeworks.map(homework => ({
            homework,
            submission: submissionMap.get(homework._id.toString()),
            status: submissionMap.has(homework._id.toString())
                ? submissionMap.get(homework._id.toString()).status
                : 'pending'
        }));

        return result;
    }

}