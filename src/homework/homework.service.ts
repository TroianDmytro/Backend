// src/homework/homework.service.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
     * Создать домашнее задание
     * Преподаватель может создать задание только для своих занятий
     */
    async create(createHomeworkDto: CreateHomeworkDto, teacherId: string, files?: Express.Multer.File[]): Promise<Homework> {
        try {
            // Проверяем существование урока
            const lesson = await this.lessonModel
                .findById(createHomeworkDto.lesson)
                .populate('teacher')
                .populate('course')
                .exec();

            if (!lesson) {
                throw new NotFoundException('Занятие не найдено');
            }

            // ИСПРАВЛЕНИЕ 1: Правильная проверка ID преподавателя
            const lessonTeacher = lesson.teacher as TeacherDocument;
            if (lessonTeacher._id.toString() !== teacherId) {
                throw new ForbiddenException('Вы не можете создавать задания для чужих занятий');
            }

            // Обработка загруженных файлов
            let processedFiles: Array<{
                filename: string;
                originalName: string;
                mimeType?: string;
                size?: number;
                url: string;
            }> = [];

            if (files && files.length > 0) {
                // ИСПРАВЛЕНИЕ 2: Правильная структура файлов
                processedFiles = files.map(file => ({
                    filename: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: `/uploads/homework/${file.filename}` // URL для доступа к файлу
                }));
            }

            // Создание домашнего задания
            const homework = new this.homeworkModel({
                ...createHomeworkDto,
                teacher: teacherId, // ИСПРАВЛЕНИЕ: используем правильное поле
                files: processedFiles,
                isPublished: false
            });

            const savedHomework = await homework.save();

            const result = await this.homeworkModel  // ИСПРАВЛЕНО: возвращаем HomeworkDocument
                .findById(savedHomework._id)
                .populate('lesson', 'title date startTime endTime')
                .populate('teacher', 'name second_name email')
                .exec();

            if (!result) {
                throw new NotFoundException('Не удалось создать домашнее задание');
            }

            return result;


        } catch (error) {
            this.logger.error(`Ошибка создания домашнего задания: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Получить домашние задания студента
     */
    async getStudentHomeworks(studentId: string, courseId?: string) {
        try {
            // Получаем подписки студента
            const subscriptions = await this.subscriptionModel.find({
                user: studentId,
                status: 'active',
                ...(courseId && { course: courseId })
            }).populate('course');

            if (!subscriptions.length) {
                return [];
            }

            const courseIds = subscriptions.map(sub => sub.course);

            // Получаем занятия из курсов студента
            const lessons = await this.lessonModel.find({
                course: { $in: courseIds },
                isActive: true
            });

            const lessonIds = lessons.map(lesson => lesson._id);

            // Получаем домашние задания
            const homeworks = await this.homeworkModel
                .find({
                    lesson: { $in: lessonIds },
                    isActive: true,
                    isPublished: true
                })
                .populate('lesson', 'title date startTime endTime course')
                .populate('teacher', 'name second_name')
                .sort({ createdAt: -1 })
                .exec();

            // Получаем отправки студента
            const submissions = await this.submissionModel.find({
                student: studentId,
                homework: { $in: homeworks.map(hw => hw._id) }
            });

            const submissionMap = new Map(
                submissions.map(sub => [sub.homework.toString(), sub])
            );

            // Формируем результат
            const result = homeworks.map(homework => {
                const submission = submissionMap.get(homework._id.toString());

                return {
                    homework: {
                        _id: homework._id,
                        title: homework.title,
                        description: homework.description,
                        deadline: homework.deadline,
                        lesson: homework.lesson,
                        teacher: homework.teacher, // ИСПРАВЛЕНИЕ: используем teacher вместо assignedBy
                        createdAt: homework.createdAt,
                        files: homework.files
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

        } catch (error) {
            this.logger.error(`Ошибка получения домашних заданий студента: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Отправить домашнее задание студентом
     */
    async submitHomework(
        homeworkId: string,
        studentId: string,
        files?: Express.Multer.File[]
    ): Promise<HomeworkSubmission> {
        try {
            // Проверяем существование задания
            const homework = await this.homeworkModel
                .findById(homeworkId)
                .populate('lesson')
                .exec();

            if (!homework) {
                throw new NotFoundException('Домашнее задание не найдено');
            }

            // Проверяем, не отправлял ли студент уже это задание
            const existingSubmission = await this.submissionModel.findOne({
                homework: homeworkId,
                student: studentId
            });

            if (existingSubmission) {
                throw new ConflictException('Вы уже отправили это домашнее задание');
            }

            // Проверяем дедлайн
            const now = new Date();
            const isLate = homework.deadline ? now > homework.deadline : false;

            if (isLate && !homework.allow_late_submission) {
                throw new BadRequestException('Срок сдачи домашнего задания истек');
            }

            // Обработка файлов
            let processedFiles: Array<{
                filename: string;
                originalName: string;
                mimeType?: string;
                size?: number;
                url: string;
            }> = [];

            if (files && files.length > 0) {
                processedFiles = files.map(file => ({
                    filename: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: `/uploads/submissions/${file.filename}`
                }));
            }

            // Создаем отправку
            const submission = new this.submissionModel({
                homework: homeworkId,
                student: studentId,
                files: processedFiles,
                is_late: isLate,
                status: SubmissionStatus.SUBMITTED
            });

            const savedSubmission = await submission.save();

            // Обновляем статистику домашнего задания
            await this.homeworkModel.findByIdAndUpdate(homeworkId, {
                $inc: { submissions_count: 1 }
            });

            const result = await this.submissionModel  // ИСПРАВЛЕНО: возвращаем HomeworkSubmissionDocument
                .findById(savedSubmission._id)
                .populate('homework', 'title deadline')
                .populate('student', 'name second_name email')
                .exec();

            if (!result) {
                throw new NotFoundException('Не удалось создать отправку');
            }

            return result;

        } catch (error) {
            this.logger.error(`Ошибка отправки домашнего задания: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Проверить домашнее задание преподавателем
     */
    async reviewHomework(
        submissionId: string,
        teacherId: string,
        reviewData: ReviewHomeworkDto
    ): Promise<HomeworkSubmission> {
        try {
            // Находим отправку с проверкой доступа
            const submission = await this.submissionModel
                .findById(submissionId)
                .populate('homework')
                .exec();

            if (!submission) {
                throw new NotFoundException('Отправка домашнего задания не найдена');
            }

            // ИСПРАВЛЕНО: правильная типизация
            const homeworkId = (submission.homework as any)._id;
            const homeworkWithTeacher = await this.homeworkModel
                .findById(homeworkId)
                .populate('teacher')
                .exec();

            if (!homeworkWithTeacher) { // ИСПРАВЛЕНО: проверка на null
                throw new NotFoundException('Домашнее задание не найдено');
            }

            // ИСПРАВЛЕНО: правильная проверка доступа
            const homeworkTeacher = homeworkWithTeacher.teacher as any;
            if (homeworkTeacher._id.toString() !== teacherId) {
                throw new ForbiddenException('Вы можете проверять только свои задания');
            }

            // Проверяем статус
            if (submission.status === SubmissionStatus.REVIEWED) {
                throw new ConflictException('Это задание уже проверено');
            }

            // Обновляем отправку
            const updatedSubmission = await this.submissionModel.findByIdAndUpdate(
                submissionId,
                {
                    status: SubmissionStatus.REVIEWED,
                    score: reviewData.score,
                    teacher_comment: reviewData.comment,
                    detailed_feedback: reviewData.detailed_feedback,
                    reviewed_by: teacherId,
                    reviewed_at: new Date()
                },
                { new: true, runValidators: true }
            )
                .populate('homework', 'title max_score')
                .populate('student', 'name second_name email')
                .populate('reviewed_by', 'name second_name')
                .exec();

            if (!updatedSubmission) { // ИСПРАВЛЕНО: проверка на null
                throw new NotFoundException('Не удалось обновить отправку');
            }

            // Обновляем статистику
            await this.updateHomeworkStatistics(homeworkId.toString());

            return updatedSubmission;

        } catch (error) {
            this.logger.error(`Ошибка проверки домашнего задания: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Обновить статистику домашнего задания
     */
    private async updateHomeworkStatistics(homeworkId: string) {
        try {
            const submissions = await this.submissionModel.find({
                homework: homeworkId,
                status: SubmissionStatus.REVIEWED
            });

            const completedCount = submissions.length;
            const scores = submissions
                .filter(sub => sub.score !== undefined && sub.score !== null)
                .map(sub => sub.score)
                .filter((score): score is number => score !== undefined);

            let averageScore = 0;
            if (scores.length > 0) {
                // ИСПРАВЛЕНО: безопасное вычисление среднего
                const sum = scores.reduce((acc, score) => (acc || 0) + (score || 0), 0);
                averageScore = (sum || 0) / scores.length;
            }

            await this.homeworkModel.findByIdAndUpdate(homeworkId, {
                completed_count: completedCount,
                average_score: Math.round(averageScore * 100) / 100
            });
        } catch (error) {
            this.logger.error(`Ошибка обновления статистики: ${error.message}`, error.stack);
        }
    }

    /**
     * Получить отправки для преподавателя
     */
    async getSubmissionsForTeacher(
        teacherId: string,
        status?: string,
        courseId?: string
    ) {
        try {
            // Строим условия запроса
            let matchConditions: any = {};

            if (status && Object.values(SubmissionStatus).includes(status as SubmissionStatus)) {
                matchConditions.status = status;
            }

            // Находим домашние задания преподавателя
            let homeworkQuery: any = { teacher: teacherId };

            if (courseId) {
                const lessons = await this.lessonModel.find({ course: courseId });
                const lessonIds = lessons.map(lesson => lesson._id);
                homeworkQuery.lesson = { $in: lessonIds };
            }

            const homeworks = await this.homeworkModel.find(homeworkQuery);
            const homeworkIds = homeworks.map(hw => hw._id);

            // Получаем отправки
            const submissions = await this.submissionModel
                .find({
                    homework: { $in: homeworkIds },
                    ...matchConditions
                })
                .populate('homework', 'title deadline lesson')
                .populate('student', 'name second_name email')
                .populate({
                    path: 'homework',
                    populate: {
                        path: 'lesson',
                        select: 'title course',
                        populate: {
                            path: 'course',
                            select: 'name'
                        }
                    }
                })
                .sort({ submitted_at: -1 })
                .exec();

            return submissions;

        } catch (error) {
            this.logger.error(`Ошибка получения отправок: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
 * Найти домашнее задание по ID
 */
    async findOne(homeworkId: string): Promise<HomeworkDocument | null> {
        try {
            const homework = await this.homeworkModel
                .findById(homeworkId)
                .populate('lesson', 'title date startTime endTime course')
                .populate('teacher', 'name second_name email')
                .populate({
                    path: 'lesson',
                    populate: {
                        path: 'course',
                        select: 'title'
                    }
                })
                .exec();

            return homework; // ИСПРАВЛЕНО: возвращаем null если не найдено, а не выбрасываем ошибку
        } catch (error) {
            this.logger.error(`Ошибка поиска домашнего задания: ${error.message}`, error.stack);
            throw new NotFoundException('Домашнее задание не найдено');
        }
    }

    /**
     * Проверить доступ студента к домашнему заданию
     */
    async checkStudentAccess(homeworkId: string, studentId: string): Promise<boolean> {
        try {
            // Находим домашнее задание с информацией о курсе
            const homework = await this.homeworkModel
                .findById(homeworkId)
                .populate({
                    path: 'lesson',
                    populate: {
                        path: 'course',
                        select: '_id'
                    }
                })
                .exec();

            if (!homework) {
                return false;
            }

            // Проверяем, записан ли студент на курс
            const lesson = homework.lesson as any;
            const courseId = lesson.course._id;

            const subscription = await this.subscriptionModel.findOne({
                user: studentId,
                course: courseId,
                status: 'active'
            });

            return !!subscription;
        } catch (error) {
            this.logger.error(`Ошибка проверки доступа: ${error.message}`, error.stack);
            return false;
        }
    }

    /**
     * Получить статистику домашнего задания
     */
    async getHomeworkStatistics(homeworkId: string) {
        try {
            const homework = await this.homeworkModel.findById(homeworkId);

            if (!homework) {
                throw new NotFoundException('Домашнее задание не найдено');
            }

            // Получаем все отправки для этого задания
            const submissions = await this.submissionModel.find({
                homework: homeworkId
            }).populate('student', 'name second_name email');

            // Статистика по статусам
            const statusStats = {
                [SubmissionStatus.SUBMITTED]: 0,
                [SubmissionStatus.IN_REVIEW]: 0,
                [SubmissionStatus.REVIEWED]: 0,
                [SubmissionStatus.RETURNED_FOR_REVISION]: 0
            };

            submissions.forEach(submission => {
                statusStats[submission.status]++;
            });

            // Статистика оценок
            const reviewedSubmissions = submissions.filter(s => s.status === SubmissionStatus.REVIEWED && s.score !== undefined);
            const scores = reviewedSubmissions.map(s => s.score).filter(score => score !== undefined) as number[];

            let averageScore = 0;
            let minScore = 0;
            let maxScore = 0;

            if (scores.length > 0) {
                // ИСПРАВЛЕНО: безопасное вычисление статистики
                const sum = scores.reduce((acc, score) => (acc || 0) + (score || 0), 0);
                averageScore = (sum || 0) / scores.length;
                minScore = Math.min(...scores);
                maxScore = Math.max(...scores);
            }

            return {
                homework: {
                    _id: homework._id,
                    title: homework.title,
                    deadline: homework.deadline,
                    max_score: homework.max_score
                },
                totalSubmissions: submissions.length,
                statusBreakdown: statusStats,
                averageScore: Math.round(averageScore * 100) / 100,
                minScore,
                maxScore,
                reviewedCount: reviewedSubmissions.length,
                pendingReview: statusStats[SubmissionStatus.SUBMITTED] + statusStats[SubmissionStatus.IN_REVIEW],
                submissions: submissions.map(submission => ({
                    _id: submission._id,
                    student: submission.student,
                    status: submission.status,
                    score: submission.score,
                    submitted_at: submission.submitted_at,
                    is_late: submission.is_late
                }))
            };

        } catch (error) {
            this.logger.error(`Ошибка получения статистики: ${error.message}`, error.stack);
            throw error;
        }
    }

}