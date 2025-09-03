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
        if (!includeFiles && homework.files) {
            homework.files = homework.files.map(file => ({
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
        if (!isAdmin && homework.teacher?.id?.toString() !== teacherId) {
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
   * НОВЫЙ МЕТОД: Создать домашнее задание для урока
   */
    async createHomework(
        lessonId: string,
        homeworkData: {
            title: string;
            description?: string;
            dueDate?: string;
        },
        file: Express.Multer.File,
        teacherId: string
    ): Promise<HomeworkDocument> {
        this.logger.log(`Создание домашнего задания для урока ${lessonId}`);

        const lesson = await this.lessonModel.findById(lessonId)
            .populate('course teacher');

        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        // Проверяем права преподавателя
        if (lesson.teacher._id.toString() !== teacherId) {
            throw new ForbiddenException('Можно создавать задания только для своих уроков');
        }

        // Сохраняем файл задания в base64
        const fileData = {
            filename: `homework_${lessonId}_${Date.now()}.pdf`,
            original_name: file.originalname,
            data: file.buffer.toString('base64'),
            mime_type: file.mimetype,
            size_bytes: file.size,
            uploaded_at: new Date()
        };

        const homework = new this.homeworkModel({
            title: homeworkData.title,
            description: homeworkData.description,
            lesson: lessonId,
            assignedBy: teacherId,
            files: [fileData],
            deadline: homeworkData.dueDate ? new Date(homeworkData.dueDate) : null,
            isPublished: true
        });

        const savedHomework = await homework.save();

        // Создаем задания для всех студентов курса
        await this.createHomeworkForAllStudents(savedHomework._id.toString(), lesson.course._id.toString());

        this.logger.log(`Домашнее задание создано: ${savedHomework._id}`);
        return savedHomework;
    }

    /**
     * НОВЫЙ МЕТОД: Отправить выполненную работу
     */
    async submitHomework(
        homeworkId: string,
        file: Express.Multer.File,
        studentId: string
    ): Promise<HomeworkSubmissionDocument> {
        this.logger.log(`Отправка домашнего задания ${homeworkId} студентом ${studentId}`);

        const homework = await this.homeworkModel.findById(homeworkId)
            .populate('lesson');

        if (!homework) {
            throw new NotFoundException('Домашнее задание не найдено');
        }

        if (!homework.isPublished) {
            throw new BadRequestException('Задание не опубликовано');
        }

        // Проверяем срок сдачи
        if (homework.deadline && new Date() > homework.deadline) {
            this.logger.warn(`Студент ${studentId} сдает задание ${homeworkId} с опозданием`);
        }

        // Проверяем, не сдавал ли уже студент работу
        const existingSubmission = await this.submissionModel.findOne({
            homework: homeworkId,
            student: studentId
        });

        if (existingSubmission && existingSubmission.status === 'graded') {
            throw new BadRequestException('Работа уже проверена и оценена');
        }

        // Сохраняем файл отправки
        const fileData = {
            filename: `submission_${homeworkId}_${studentId}_${Date.now()}.zip`,
            original_name: file.originalname,
            data: file.buffer.toString('base64'),
            mime_type: file.mimetype,
            size_bytes: file.size,
            uploaded_at: new Date()
        };

        if (existingSubmission) {
            // Обновляем существующую отправку
            existingSubmission.files = [fileData];
            existingSubmission.status = 'submitted' as any;
            existingSubmission.submitted_at = new Date();

            const updatedSubmission = await existingSubmission.save();
            this.logger.log(`Домашнее задание переотправлено: ${homeworkId}`);
            return updatedSubmission;
        } else {
            // Создаем новую отправку
            const submission = new this.submissionModel({
                homework: homeworkId,
                student: studentId,
                files: [fileData],
                status: 'submitted',
                submitted_at: new Date(),
                is_late: homework.deadline ? new Date() > homework.deadline : false
            });

            const savedSubmission = await submission.save();
            this.logger.log(`Домашнее задание отправлено: ${homeworkId}`);
            return savedSubmission;
        }
    }

    /**
     * НОВЫЙ МЕТОД: Оценить выполненную работу
     */
    async gradeSubmission(
        submissionId: string,
        gradeData: { grade: number; feedback?: string },
        teacherId: string
    ): Promise<HomeworkSubmissionDocument> {
        this.logger.log(`Оценивание работы ${submissionId} преподавателем ${teacherId}`);

        const submission = await this.submissionModel.findById(submissionId)
            .populate({
                path: 'homework',
                populate: {
                    path: 'assignedBy',
                    select: '_id'
                }
            });

        if (!submission) {
            throw new NotFoundException('Отправка домашнего задания не найдена');
        }

        // Проверяем права преподавателя
        const homework = submission.homework as any;
        if (homework.assignedBy._id.toString() !== teacherId) {
            throw new ForbiddenException('Можно оценивать только задания своих курсов');
        }

        if (gradeData.grade < 1 || gradeData.grade > 5) {
            throw new BadRequestException('Оценка должна быть от 1 до 5');
        }

        // Обновляем отправку
        submission.score = gradeData.grade;
        submission.teacher_comment = gradeData.feedback;
        submission.status = 'graded' as any;
        submission.reviewed_at = new Date();
        submission.reviewed_by = teacherId as any;

        const updatedSubmission = await submission.save();
        this.logger.log(`Работа оценена: ${submissionId}, оценка: ${gradeData.grade}`);

        return updatedSubmission;
    }

    /**
     * НОВЫЙ МЕТОД: Получить домашние задания студента
     */
    async getStudentHomeworks(studentId: string): Promise<any[]> {
        this.logger.log(`Получение домашних заданий студента ${studentId}`);

        // Получаем курсы студента
        const subscriptions = await this.subscriptionModel
            .find({
                user: studentId,
                status: { $in: ['active', 'paid'] }
            })
            .populate('course');

        const courseIds = subscriptions.map(sub => (sub.course as any)._id);

        // Получаем все домашние задания по курсам студента
        const homeworks = await this.homeworkModel
            .find({ isPublished: true })
            .populate({
                path: 'lesson',
                match: { course: { $in: courseIds } },
                populate: {
                    path: 'course subject',
                    select: 'title name'
                }
            })
            .populate('assignedBy', 'name second_name');

        // Фильтруем только те задания, где lesson не null
        const validHomeworks = homeworks.filter(hw => hw.lesson);

        // Получаем отправки студента
        const submissions = await this.submissionModel.find({
            student: studentId,
            homework: { $in: validHomeworks.map(hw => hw._id) }
        });

        const submissionMap = new Map(
            submissions.map(sub => [sub.homework.toString(), sub])
        );

        // Формируем результат
        const result = validHomeworks.map(homework => {
            const submission = submissionMap.get(homework._id.toString());

            return {
                homework: {
                    _id: homework._id,
                    title: homework.title,
                    description: homework.description,
                    deadline: homework.deadline,
                    lesson: homework.lesson,
                    assignedBy: homework.assignedBy,
                    createdAt: homework.createdAt
                },
                submission: submission ? {
                    _id: submission._id,
                    status: submission.status,
                    submitted_at: submission.submitted_at,
                    score: submission.score,
                    teacher_comment: submission.teacher_comment,
                    is_late: submission.is_late
                } : null,
                status: submission ? submission.status : 'pending'
            };
        });

        return result;
    }

    /**
     * НОВЫЙ МЕТОД: Получить отправки для преподавателя
     */
    async getSubmissionsForTeacher(
        teacherId: string,
        status?: string,
        courseId?: string
    ): Promise<HomeworkSubmissionDocument[]> {
        this.logger.log(`Получение отправок для преподавателя ${teacherId}`);

        // Строим фильтр для поиска домашних заданий преподавателя
        const homeworkFilter: any = { assignedBy: teacherId };

        // Если указан курс, добавляем фильтр по курсу
        if (courseId) {
            const lessons = await this.lessonModel.find({ course: courseId }).select('_id');
            const lessonIds = lessons.map(l => l._id);
            homeworkFilter.lesson = { $in: lessonIds };
        }

        const homeworks = await this.homeworkModel.find(homeworkFilter).select('_id');
        const homeworkIds = homeworks.map(hw => hw._id);

        // Строим фильтр для отправок
        const submissionFilter: any = { homework: { $in: homeworkIds } };
        if (status) {
            submissionFilter.status = status;
        }

        return this.submissionModel
            .find(submissionFilter)
            .populate('student', 'name email')
            .populate({
                path: 'homework',
                populate: {
                    path: 'lesson',
                    populate: {
                        path: 'course subject',
                        select: 'title name'
                    }
                }
            })
            .sort({ submitted_at: -1 })
            .exec();
    }

    /**
     * НОВЫЙ МЕТОД: Создать домашние задания для всех студентов курса
     */
    private async createHomeworkForAllStudents(
        homeworkId: string,
        courseId: string
    ): Promise<void> {
        this.logger.log(`Создание заданий для студентов курса ${courseId}`);

        // Получаем всех студентов курса
        const subscriptions = await this.subscriptionModel.find({
            course: courseId,
            status: { $in: ['active', 'paid'] }
        });

        // Создаем записи для каждого студента (если нужно для отслеживания)
        // В текущей реализации мы создаем отправки только при фактической сдаче работы
        this.logger.log(`Задание доступно для ${subscriptions.length} студентов`);
    }

    /**
     * НОВЫЙ МЕТОД: Найти домашнее задание по ID
     */
    async findById(homeworkId: string): Promise<HomeworkDocument> {
        const homework = await this.homeworkModel.findById(homeworkId)
            .populate('lesson')
            .populate('assignedBy', 'name second_name');

        if (!homework) {
            throw new NotFoundException('Домашнее задание не найдено');
        }

        return homework;
    }

    /**
     * НОВЫЙ МЕТОД: Удалить домашнее задание
     */
    async deleteHomework(homeworkId: string, teacherId: string): Promise<void> {
        this.logger.log(`Удаление домашнего задания ${homeworkId}`);

        const homework = await this.homeworkModel.findById(homeworkId);
        if (!homework) {
            throw new NotFoundException('Домашнее задание не найдено');
        }

        // Проверяем права
        if (homework.assignedBy.toString() !== teacherId) {
            throw new ForbiddenException('Можно удалять только свои задания');
        }

        // Проверяем, есть ли отправки
        const submissionsCount = await this.submissionModel.countDocuments({
            homework: homeworkId
        });

        if (submissionsCount > 0) {
            throw new BadRequestException(
                `Нельзя удалить задание: есть ${submissionsCount} отправок от студентов`
            );
        }

        await this.homeworkModel.findByIdAndDelete(homeworkId);
        this.logger.log(`Домашнее задание удалено: ${homeworkId}`);
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

        const homework = submission.homework as any;

        // Проверяем права преподавателя
        if (homework.teacherId.toString() !== teacherId) {
            throw new ForbiddenException('Вы можете проверять только задания своих курсов');
        }

        if (submission.status === SubmissionStatus.REVIEWED) {
            throw new BadRequestException('Эта работа уже проверена');
        }

        // Обновляем данные проверки
        submission.score = reviewDto.score;
        submission.teacher_comment = reviewDto.teacher_comment;
        (submission as any).detailed_feedback = JSON.stringify(reviewDto.detailed_feedback);
        (submission as any).status = reviewDto.status || 'reviewed';
        submission.reviewed_by = teacherId as any;
        submission.reviewed_at = new Date();

        const updatedSubmission = await submission.save();

        // Обновляем статистику задания
        await this.updateHomeworkStatistics(homework._id);

        this.logger.log(`Работа проверена: ${submissionId}, оценка: ${reviewDto.score}`);
        return updatedSubmission;
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

            const homework = submission.homework as any;

            // Проверяем права доступа
            if (!isTeacher && submission.student?.id?.toString() !== userId) {
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

            files = homework.files;
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
     * Получить все отправки домашнего задания
     */
    async getSubmissions(homeworkId: string) {
        const submissions = await this.submissionModel
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
                submitted: submissions.filter(s => (s as any).status !== 'submitted').length,
                graded: submissions.filter(s => (s as any).status === 'graded').length,
                averageGrade: submissions.length > 0
                    ? submissions.reduce((sum, s) => sum + ((s as any).grade || 0), 0) / submissions.length
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
        const submissions = await this.submissionModel.find({
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
                ? (submissionMap.get(homework._id.toString()) as any)?.status || 'pending'
                : 'pending'
        }));

        return result;
    }

}