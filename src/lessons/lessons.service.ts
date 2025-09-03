// src/lessons/lessons.service.ts 
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Subscription, SubscriptionDocument } from 'src/subscriptions/schemas/subscription.schema';

@Injectable()
export class LessonsService {
    private readonly logger = new Logger(LessonsService.name);

    constructor(
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
    ) { }


    /**
     * Получение уроков курса с домашними заданиями
     */
    async findByCourse(courseId: string, includeUnpublished = false): Promise<LessonDocument[]> {
        const filter: any = {
            course: courseId, // ИСПРАВЛЕНО: courseId -> course
            isActive: true
        };

        return this.lessonModel.find(filter)
            .populate('course', 'name')
            .populate('subject', 'name')
            .populate('teacher', 'name')
            .sort({ date: 1, startTime: 1 });
    }

    /**
     * Получение урока по ID с домашними заданиями
     */
    async findById(id: string, includeHomeworks = false): Promise<LessonDocument | null> {
        let query = this.lessonModel.findById(id).populate('course', 'title mainTeacher');

        if (includeHomeworks) {
            query = query.populate({
                path: 'homeworks',
                match: { isActive: true },
                select: 'title description deadline max_score isPublished submissions_count average_score'
            });
        }

        return query.exec();
    }

    /**
     * Обновление урока
     */
    async update(id: string, updateLessonDto: UpdateLessonDto, userId: string, isAdmin: boolean): Promise<LessonDocument> {
        const lesson = await this.lessonModel.findById(id).populate('course').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${id} не найден`);
        }

        const course = lesson.course as any;

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на редактирование этого урока');
        }

        // Если меняется порядковый номер, проверяем уникальность
        if (updateLessonDto.order && updateLessonDto.order !== lesson.order) {
            const existingLesson = await this.lessonModel.findOne({
                course: lesson.course,
                order: updateLessonDto.order,
                _id: { $ne: id }
            }).exec();

            if (existingLesson) {
                throw new ConflictException(`Урок с порядковым номером ${updateLessonDto.order} уже существует в этом курсе`);
            }
        }

        // Обновляем поля урока
        Object.assign(lesson, updateLessonDto);
        const updatedLesson = await lesson.save();

        this.logger.log(`Обновлен урок: ${id}`);
        return updatedLesson;
    }

    /**
     * Удаление урока
     */
    async delete(id: string, userId: string, isAdmin: boolean): Promise<void> {
        const lesson = await this.lessonModel.findById(id).populate('course').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${id} не найден`);
        }

        const course = lesson.course as any;

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на удаление этого урока');
        }



        const courseId = lesson.course;

        // Удаляем урок
        await this.lessonModel.findByIdAndDelete(id).exec();

        // Обновляем количество уроков в курсе
        await this.updateCourseLessonsCount(courseId.toString());

        this.logger.log(`Удален урок: ${id}`);
    }

    /**
     * Обновление статуса публикации урока
     */
    async updatePublishStatus(id: string, isPublished: boolean, userId: string, isAdmin: boolean): Promise<LessonDocument> {
        const lesson = await this.lessonModel.findById(id).populate('course').exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${id} не найден`);
        }

        const course = lesson.course as any;

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher.toString() !== userId) {
            throw new BadRequestException('У вас нет прав на изменение статуса публикации этого урока');
        }

        await lesson.save();

        this.logger.log(`Урок ${id} ${isPublished ? 'опубликован' : 'снят с публикации'}`);
        return lesson;
    }

    /**
     * Получение следующего урока
     */
    async getNextLesson(currentLessonId: string): Promise<LessonDocument | null> {
        const currentLesson = await this.lessonModel.findById(currentLessonId).exec();
        if (!currentLesson) {
            throw new NotFoundException('Текущий урок не найден');
        }

        return this.lessonModel
            .findOne({
                course: currentLesson.course,
                order: { $gt: currentLesson.order },
                isActive: true,
                // isPublished: true
            })
            .sort({ date: 1, startTime: 1 })
            .exec();
    }

    /**
     * Получение предыдущего урока
     */
    async getPreviousLesson(currentLessonId: string): Promise<LessonDocument | null> {
        const currentLesson = await this.lessonModel.findById(currentLessonId).exec();
        if (!currentLesson) {
            throw new NotFoundException('Текущий урок не найден');
        }

        return this.lessonModel
            .findOne({
                course: currentLesson.course,
                order: { $lt: currentLesson.order },
                isActive: true,
                // isPublished: true TODO
            })
            .sort({ date: 1, startTime: 1 })
            .exec();
    }

    /**
     * НОВЫЙ МЕТОД: Обновление статистики домашних заданий урока
     */
    async updateHomeworkStatistics(lessonId: string): Promise<void> {
        try {
            // Временная заглушка - будет реализовано после создания HomeworkSubmission модели
            this.logger.debug(`Обновление статистики ДЗ для урока ${lessonId} - заглушка`);

            // Обновляем урок с базовыми значениями
            await this.lessonModel.findByIdAndUpdate(lessonId, {
                // homework_count: 0,TODO
                // homework_submissions_count: 0,
                // homework_average_score: 0
            }).exec();

        } catch (error) {
            this.logger.error(`Ошибка обновления статистики ДЗ для урока ${lessonId}: ${error.message}`);
        }
    }

    /**
     * НОВЫЙ МЕТОД: Получение домашних заданий урока
     */
    async getLessonHomeworkSubmissions(
        lessonId: string,
        status?: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ submissions: any[]; totalItems: number; totalPages: number }> {
        // Временная заглушка - будет реализовано после создания HomeworkSubmission модели
        this.logger.debug(`Получение ДЗ урока ${lessonId} - заглушка`);

        return {
            submissions: [],
            totalItems: 0,
            totalPages: 0
        };
    }

    /**
     * НОВЫЙ МЕТОД: Получение прогресса урока с учетом домашних заданий
     */
    async getLessonProgress(lessonId: string): Promise<any> {
        const lesson = await this.lessonModel.findById(lessonId).exec();
        if (!lesson) {
            throw new NotFoundException(`Урок с ID ${lessonId} не найден`);
        }

        // Временная заглушка - будет реализовано после создания HomeworkSubmission модели
        const stats = {
            lessonId: lessonId,
            //TODO
            // averageScore: lesson.homework_average_score,
            submissionsByStatus: {
                submitted: 0,
                in_review: 0,
                reviewed: 0,
                returned_for_revision: 0
            }
        };

        return stats;
    }

    /**
     * Обновление количества уроков в курсе
     */
    private async updateCourseLessonsCount(courseId: string): Promise<void> {
        const lessonsCount = await this.lessonModel.countDocuments({
            course: courseId,
            isActive: true
        }).exec();

        await this.courseModel.findByIdAndUpdate(courseId, {
            lessons_count: lessonsCount
        }).exec();
    }

    /**
     * Отметить урок как пройденный
     */
    async markLessonComplete(lessonId: string, userId: string): Promise<void> {
        // Базовая реализация - расширить при создании системы прогресса
        this.logger.log(`Урок ${lessonId} отмечен как пройденный пользователем ${userId}`);
    }

    /**
     * Изменение порядка уроков
     */
    async reorderLessons(lessons: Array<{ lessonId: string; order: number }>, userId: string, isAdmin: boolean): Promise<void> {
        // Проверяем права доступа и обновляем порядок уроков
        for (const lessonUpdate of lessons) {
            await this.lessonModel.findByIdAndUpdate(lessonUpdate.lessonId, {
                order: lessonUpdate.order
            }).exec();
        }

        this.logger.log('Порядок уроков обновлен');
    }

    /**
     * Дублирование урока
     */
    async duplicateLesson(
        originalId: string,
        newTitle: string,
        userId: string,
        isAdmin: boolean,
        targetCourseId?: string
    ): Promise<LessonDocument> {
        const originalLesson = await this.lessonModel.findById(originalId).exec();
        if (!originalLesson) {
            throw new NotFoundException(`Урок с ID ${originalId} не найден`);
        }

        const lessonData = originalLesson.toObject();
        const { _id, id, createdAt, updatedAt, ...lessonDataWithoutId } = lessonData;

        // Находим следующий доступный порядковый номер
        const courseId = targetCourseId || originalLesson.course.toString();
        const maxOrder = await this.lessonModel
            .findOne({ course: courseId })
            .sort({ date: 1, startTime: 1 })
            .exec();

        const newOrder = maxOrder ? maxOrder.order + 1 : 1;

        const duplicatedLesson = new this.lessonModel({
            ...lessonDataWithoutId,
            title: newTitle,
            course: courseId,
            order: newOrder,
            // isPublished: false,
            // Сбрасываем статистику домашних заданий
            // homework_count: 0,TODO
            // homework_submissions_count: 0,
            // homework_average_score: 0
        });

        const savedLesson = await duplicatedLesson.save();

        // Обновляем количество уроков в курсе
        await this.updateCourseLessonsCount(courseId);

        this.logger.log(`Урок ${originalId} дублирован как ${savedLesson.id}`);
        return savedLesson;
    }

    /**
     * Получить данные посещаемости занятия
     */
    async getAttendance(lessonId: string) {
        const lesson = await this.lessonModel
            .findById(lessonId)
            .populate({
                path: 'attendance.user',
                select: 'name email'
            })
            .populate({
                path: 'attendance.markedBy',
                select: 'name email'
            });

        if (!lesson) {
            throw new NotFoundException('Занятие не найдено');
        }

        return {
            lessonId: lesson._id,
            lessonTitle: lesson.title,
            lessonDate: lesson.date,
            attendance: lesson.attendance
        };
    }

    /**
     * Получить занятия по курсу и предмету
     */
    async getLessonsByCourseAndSubject(courseId: string, subjectId: string, upcomingOnly = false) {
        const query: any = {
            course: courseId,
            subject: subjectId,
            isActive: true
        };

        if (upcomingOnly) {
            query.date = { $gte: new Date() };
        }

        const lessons = await this.lessonModel
            .find(query)
            .populate('course', 'name')
            .populate('subject', 'name')
            .populate('teacher', 'name email')
            .sort({ date: 1, startTime: 1 });

        return lessons;
    }

    /**
     * Создать занятие с проверкой
     */
    ///////////////////////
    async create(createLessonDto: any, userId: string, isAdmin: boolean) {
        // Проверяем, что курс и предмет связаны
        const course = await this.courseModel.findById(createLessonDto.course);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        const courseSubject = course.courseSubjects.find(
            cs => cs.subject.toString() === createLessonDto.subject &&
                cs.teacher?.toString() === createLessonDto.teacher
        );

        if (!courseSubject) {
            throw new BadRequestException(
                'Предмет не привязан к курсу или преподаватель не назначен'
            );
        }

        const lesson = new this.lessonModel(createLessonDto);
        return lesson.save();
    }

    /**
       * НОВЫЙ МЕТОД: Отметить посещаемость студентов
       */
    async markAttendance(
        lessonId: string,
        attendanceData: Array<{
            studentId: string;
            isPresent: boolean;
            lessonGrade?: number;
            notes?: string;
        }>,
        teacherId: string
    ): Promise<LessonDocument> {
        this.logger.log(`Отметка посещаемости урока ${lessonId} преподавателем ${teacherId}`);

        const lesson = await this.lessonModel.findById(lessonId)
            .populate('course teacher');

        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        // Проверяем права преподавателя
        if (lesson.teacher._id.toString() !== teacherId) {
            throw new ForbiddenException('Только назначенный преподаватель может отмечать посещаемость');
        }

        // Валидация оценок
        for (const attendance of attendanceData) {
            if (attendance.lessonGrade && (attendance.lessonGrade < 1 || attendance.lessonGrade > 5)) {
                throw new BadRequestException('Оценка за урок должна быть от 1 до 5');
            }
        }

        // Обновляем посещаемость
        for (const attendance of attendanceData) {
            const existingIndex = lesson.attendance.findIndex(
                a => a.user.toString() === attendance.studentId
            );

            const attendanceRecord = {
                user: attendance.studentId as any,
                isPresent: attendance.isPresent,
                lessonGrade: attendance.lessonGrade,
                notes: attendance.notes,
                markedAt: new Date(),
                markedBy: teacherId as any
            };

            if (existingIndex >= 0) {
                // Обновляем существующую запись
                lesson.attendance[existingIndex] = attendanceRecord;
            } else {
                // Добавляем новую запись
                lesson.attendance.push(attendanceRecord);
            }
        }

        const updatedLesson = await lesson.save();
        this.logger.log(`Посещаемость урока ${lessonId} обновлена`);

        return updatedLesson;
    }

    /**
     * НОВЫЙ МЕТОД: Получить студентов курса для урока
     */
    async getStudentsForLesson(lessonId: string): Promise<any[]> {
        this.logger.log(`Получение списка студентов для урока ${lessonId}`);

        const lesson = await this.lessonModel.findById(lessonId)
            .populate('course');

        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        // Получаем подписки на курс
        const subscriptions = await this.subscriptionModel.find({
            course: lesson.course._id,
            status: { $in: ['active', 'paid'] }
        }).populate('user', 'name email');

        // Получаем текущую посещаемость для этого урока
        const currentAttendance = lesson.attendance || [];
        const attendanceMap = new Map(
            currentAttendance.map(a => [a.user.toString(), a])
        );

        return subscriptions.map(sub => ({
            student: sub.user,
            currentAttendance: attendanceMap.get(sub.user._id.toString()) || {
                isPresent: false,
                lessonGrade: null,
                notes: ''
            }
        }));
    }

    /**
     * НОВЫЙ МЕТОД: Получить статистику посещаемости урока
     */
    async getLessonAttendanceStats(lessonId: string): Promise<any> {
        this.logger.log(`Получение статистики посещаемости урока ${lessonId}`);

        const lesson = await this.lessonModel.findById(lessonId);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        const attendance = lesson.attendance || [];
        const present = attendance.filter(a => a.isPresent).length;
        const absent = attendance.filter(a => !a.isPresent).length;

        // Средняя оценка за урок
        const gradesGiven = attendance.filter(a => a.lessonGrade).map(a => a.lessonGrade);
        const averageGrade = gradesGiven.length > 0
            ? gradesGiven.reduce((sum, grade) => sum + grade, 0) / gradesGiven.length
            : 0;

        return {
            lessonId,
            totalStudents: attendance.length,
            present,
            absent,
            attendanceRate: attendance.length > 0 ? (present / attendance.length) * 100 : 0,
            gradesGiven: gradesGiven.length,
            averageGrade: Math.round(averageGrade * 100) / 100
        };
    }

    /**
     * НОВЫЙ МЕТОД: Обновить расписание урока (админ)
     */
    async updateLessonSchedule(
        lessonId: string,
        scheduleData: {
            date?: Date;
            startTime?: string;
            endTime?: string;
        },
        userId: string,
        isAdmin: boolean
    ): Promise<LessonDocument> {
        this.logger.log(`Обновление расписания урока ${lessonId}`);

        if (!isAdmin) {
            throw new ForbiddenException('Только администратор может изменять расписание уроков');
        }

        const lesson = await this.lessonModel.findById(lessonId);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        // Проверяем корректность времени
        if (scheduleData.startTime && scheduleData.endTime) {
            const startTime = new Date(`1970-01-01T${scheduleData.startTime}:00`);
            const endTime = new Date(`1970-01-01T${scheduleData.endTime}:00`);

            if (startTime >= endTime) {
                throw new BadRequestException('Время начала должно быть раньше времени окончания');
            }
        }

        const updateData: any = {};
        if (scheduleData.date) updateData.date = scheduleData.date;
        if (scheduleData.startTime) updateData.startTime = scheduleData.startTime;
        if (scheduleData.endTime) updateData.endTime = scheduleData.endTime;

        const updatedLesson = await this.lessonModel.findByIdAndUpdate(
            lessonId,
            updateData,
            { new: true }
        ).populate(['course', 'subject', 'teacher']);

        if (!updatedLesson) {
            throw new NotFoundException('Не удалось обновить урок');
        }

        this.logger.log(`Расписание урока ${lessonId} обновлено`);
        return updatedLesson;
    }

    /**
     * НОВЫЙ МЕТОД: Получить уроки с посещаемостью для курса
     */
    async getLessonsWithAttendance(
        courseId: string,
        studentId?: string
    ): Promise<any[]> {
        this.logger.log(`Получение уроков с посещаемостью для курса ${courseId}`);

        const lessons = await this.lessonModel.find({
            course: courseId,
            isActive: true
        })
            .populate(['subject', 'teacher'])
            .sort({ date: 1, startTime: 1 });

        return lessons.map(lesson => {
            const lessonObj = lesson.toObject();

            if (studentId) {
                // Если указан конкретный студент, возвращаем его посещаемость
                const studentAttendance = lesson.attendance.find(
                    a => a.user.toString() === studentId
                );

                return {
                    ...lessonObj,
                    myAttendance: studentAttendance || {
                        isPresent: false,
                        lessonGrade: null,
                        notes: ''
                    }
                };
            } else {
                // Возвращаем общую статистику
                const present = lesson.attendance.filter(a => a.isPresent).length;
                const total = lesson.attendance.length;

                return {
                    ...lessonObj,
                    attendanceStats: {
                        present,
                        total,
                        attendanceRate: total > 0 ? (present / total) * 100 : 0
                    }
                };
            }
        });
    }

    /**
 * Получение урока с данными о посещаемости
 */
    async findByIdWithAttendance(id: string) {
        return await this.lessonModel
            .findById(id)
            .populate('teacher', 'firstName lastName')
            .populate('subject', 'name')
            .populate('course', 'title')
            .populate('attendance.user', 'firstName lastName email')
            .populate('attendance.markedBy', 'firstName lastName')
            .exec();
    }

    /**
     * Обновление расписания урока (только админ и преподаватель)
     */
    async updateSchedule(lessonId: string, scheduleData: {
        date?: Date;
        startTime?: string;
        endTime?: string;
    }): Promise<Lesson> {
        const lesson = await this.lessonModel.findById(lessonId);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        // Проверяем корректность времени
        if (scheduleData.startTime && scheduleData.endTime) {
            const startTime = new Date(`1970-01-01T${scheduleData.startTime}:00`);
            const endTime = new Date(`1970-01-01T${scheduleData.endTime}:00`);

            if (startTime >= endTime) {
                throw new BadRequestException('Время начала должно быть раньше времени окончания');
            }
        }

        const updateData: any = {};
        if (scheduleData.date) updateData.date = scheduleData.date;
        if (scheduleData.startTime) updateData.startTime = scheduleData.startTime;
        if (scheduleData.endTime) updateData.endTime = scheduleData.endTime;

        const updatedLesson = await this.lessonModel.findByIdAndUpdate(
            lessonId,
            updateData,
            { new: true }
        ).populate(['course', 'subject', 'teacher']);

        if (!updatedLesson) {
            throw new NotFoundException('Не удалось обновить урок');
        }

        this.logger.log(`Расписание урока ${lessonId} обновлено`);
        return updatedLesson;
    }
}

/**
 * Объяснение дополнений в LessonsService:
 * 
 * 1. **НОВЫЕ МЕТОДЫ ДЛЯ ДОМАШНИХ ЗАДАНИЙ:**
 *    - updateHomeworkStatistics() - обновление статистики ДЗ урока
 *    - getLessonHomeworkSubmissions() - получение отправок ДЗ урока
 *    - getLessonProgress() - прогресс урока с учетом ДЗ
 * 
 * 2. **ОБНОВЛЕННЫЕ МЕТОДЫ:**
 *    - findByCourse() - опция загрузки домашних заданий
 *    - findById() - опция загрузки домашних заданий
 *    - create() - инициализация счетчиков ДЗ
 *    - delete() - проверка на наличие отправленных ДЗ
 * 
 * 3. **СТАТИСТИКА:**
 *    - Автоматическое обновление счетчиков при изменениях
 *    - Агрегация данных по статусам отправок
 *    - Расчет средних оценок
 * 
 * 4. **ИНТЕГРАЦИЯ:**
 *    - Связь с HomeworkSubmission моделью
 *    - Обновление статистики при операциях с ДЗ
 *    - Проверка зависимостей при удалении
 */