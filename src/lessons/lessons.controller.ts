// src/lessons/lessons.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
    Logger,
    NotFoundException,
    UseInterceptors,
    UploadedFile,
    Req,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';


@ApiTags('lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsController {
    private readonly logger = new Logger(LessonsController.name);

    constructor(private readonly lessonsService: LessonsService) {

    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Создание нового урока',
        description: 'Создает новый урок и добавляет его к определенному курсу'
    })
    @ApiResponse({ status: 201, description: 'Урок успешно создан' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async createLesson(
        @Body() createLessonDto: CreateLessonDto,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Создание урока: ${createLessonDto.title} для курса ${createLessonDto.courseId}`);

        const lesson = await this.lessonsService.create(createLessonDto, currentUserId, isAdmin);

        return {
            message: 'Урок успешно создан',
            lesson: lesson
        };
    }

    @Get('course/:courseId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Получение всех уроков курса',
        description: 'Возвращает список всех уроков курса в правильном порядке'
    })
    @ApiParam({ name: 'courseId', description: 'ID курса' })
    @ApiQuery({
        name: 'includeUnpublished',
        required: false,
        type: Boolean,
        description: 'Включать ли неопубликованные уроки (только для преподавателей и админов)'
    })
    @ApiResponse({ status: 200, description: 'Список уроков курса' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async getLessonsByCourse(
        @Param('courseId') courseId: string,
        @Query('includeUnpublished') includeUnpublished: boolean = false,
        @Request() req?
    ) {
        const isAdmin = true; // Временно для работы без JWT
        const isTeacher = true; // Временно для работы без JWT

        this.logger.log(`Получение уроков курса ${courseId}`);

        const showUnpublished = includeUnpublished && (isAdmin || isTeacher);
        const lessons = await this.lessonsService.findByCourse(courseId, showUnpublished);

        return {
            courseId: courseId,
            lessons: lessons,
            totalLessons: lessons.length
        };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Получение урока по ID',
        description: 'Возвращает подробную информацию об уроке'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Данные урока' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async getLessonById(@Param('id') id: string) {
        this.logger.log(`Запрос урока с ID: ${id}`);

        const lesson = await this.lessonsService.findById(id);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        return { lesson };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Обновление урока',
        description: 'Обновляет данные урока. Преподаватель может редактировать только уроки своих курсов.'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Урок успешно обновлен' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async updateLesson(
        @Param('id') id: string,
        @Body() updateLessonDto: UpdateLessonDto,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Обновление урока с ID: ${id}`);

        const updatedLesson = await this.lessonsService.update(id, updateLessonDto, currentUserId, isAdmin);

        return {
            message: 'Урок успешно обновлен',
            lesson: updatedLesson
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Удаление урока',
        description: 'Удаляет урок и все связанные с ним домашние задания'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Урок успешно удален' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async deleteLesson(
        @Param('id') id: string,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Удаление урока с ID: ${id}`);

        await this.lessonsService.delete(id, currentUserId, isAdmin);

        return {
            message: 'Урок успешно удален'
        };
    }

    @Post(':id/publish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Публикация или снятие с публикации урока',
        description: 'Изменяет статус публикации урока'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Статус публикации изменен' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async publishLesson(
        @Param('id') id: string,
        @Body('isPublished') isPublished: boolean,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Изменение статуса публикации урока ${id} на ${isPublished}`);

        const lesson = await this.lessonsService.updatePublishStatus(id, isPublished, currentUserId, isAdmin);

        return {
            message: isPublished
                ? 'Урок успешно опубликован'
                : 'Урок снят с публикации',
            lesson: lesson
        };
    }

    @Get(':id/next')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Получение следующего урока в курсе',
        description: 'Возвращает следующий урок в порядке изучения'
    })
    @ApiParam({ name: 'id', description: 'ID текущего урока' })
    @ApiResponse({ status: 200, description: 'Следующий урок' })
    @ApiResponse({ status: 404, description: 'Следующий урок не найден' })
    async getNextLesson(@Param('id') currentLessonId: string) {
        this.logger.log(`Получение следующего урока после ${currentLessonId}`);

        const nextLesson = await this.lessonsService.getNextLesson(currentLessonId);

        if (!nextLesson) {
            return {
                message: 'Это последний урок в курсе',
                nextLesson: null
            };
        }

        return {
            nextLesson: nextLesson
        };
    }

    @Get(':id/previous')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({
        summary: 'Получение предыдущего урока в курсе',
        description: 'Возвращает предыдущий урок в порядке изучения'
    })
    @ApiParam({ name: 'id', description: 'ID текущего урока' })
    @ApiResponse({ status: 200, description: 'Предыдущий урок' })
    @ApiResponse({ status: 404, description: 'Предыдущий урок не найден' })
    async getPreviousLesson(@Param('id') currentLessonId: string) {
        this.logger.log(`Получение предыдущего урока перед ${currentLessonId}`);

        const previousLesson = await this.lessonsService.getPreviousLesson(currentLessonId);

        if (!previousLesson) {
            return {
                message: 'Это первый урок в курсе',
                previousLesson: null
            };
        }

        return {
            previousLesson: previousLesson
        };
    }

    /**
    * POST /lessons/:id/attendance - Отметить посещаемость на уроке
    */
    @Post(':id/attendance')
    @Roles('teacher')
    @ApiOperation({
        summary: 'Отметить посещаемость студентов',
        description: 'Преподаватель отмечает присутствующих студентов и выставляет оценки за занятие'
    })
    async markAttendance(
        @Param('id') lessonId: string,
        @Body() markAttendanceDto: MarkAttendanceDto,
        @Request() req: any
    ) {
        try {
            const teacherId = req.user.id;

            // ИСПРАВЛЕНО: правильная передача данных
            const result = await this.lessonsService.markAttendance(
                lessonId,
                teacherId,
                markAttendanceDto.attendanceData // Передаем массив attendanceData
            );

            return {
                success: true,
                message: 'Посещаемость успешно отмечена',
                data: result
            };

        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка отметки посещаемости',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET /lessons/:id/students - Получить список студентов для отметки посещаемости
     */
    @Get(':id/students')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Получить список студентов курса для урока',
        description: 'Возвращает всех студентов, записанных на курс, с текущей посещаемостью урока'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Список студентов получен' })
    async getStudentsForLesson(@Param('id') lessonId: string) {
        this.logger.log(`Получение студентов для урока ${lessonId}`);

        const students = await this.lessonsService.getStudentsForLesson(lessonId);

        return {
            success: true,
            lessonId,
            students
        };
    }

    /**
     * GET /lessons/:id/attendance-stats - Получить статистику посещаемости урока
     */
    @Get(':id/attendance-stats')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({ summary: 'Получить статистику посещаемости урока' })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Статистика посещаемости' })
    async getLessonAttendanceStats(@Param('id') lessonId: string) {
        this.logger.log(`Получение статистики посещаемости урока ${lessonId}`);

        const stats = await this.lessonsService.getLessonAttendanceStats(lessonId);

        return {
            success: true,
            stats
        };
    }

    /**
     * PUT /lessons/:id/schedule - Обновить расписание урока (только админ)
     */
    @Put(':id/schedule')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Обновить расписание урока',
        description: 'Позволяет администратору изменить дату и время урока'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                date: { type: 'string', format: 'date', description: 'Новая дата урока' },
                startTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description: 'Время начала (HH:MM)' },
                endTime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description: 'Время окончания (HH:MM)' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Расписание урока обновлено' })
    @ApiResponse({ status: 400, description: 'Некорректное время' })
    async updateLessonSchedule(
        @Param('id') lessonId: string,
        @Body() scheduleData: {
            date?: string;
            startTime?: string;
            endTime?: string;
        },
        @Request() req: any
    ) {
        this.logger.log(`Обновление расписания урока ${lessonId}`);

        const userId = req.user?.userId || req.user?.id;
        const isAdmin = req.user?.roles?.includes('admin') || false;

        const updateData: any = {};
        if (scheduleData.date) updateData.date = new Date(scheduleData.date);
        if (scheduleData.startTime) updateData.startTime = scheduleData.startTime;
        if (scheduleData.endTime) updateData.endTime = scheduleData.endTime;

        const updatedLesson = await this.lessonsService.updateLessonSchedule(
            lessonId,
            updateData,
            userId,
            isAdmin
        );

        return {
            success: true,
            message: 'Расписание урока успешно обновлено',
            lesson: updatedLesson
        };
    }

    /**
     * GET /lessons/course/:courseId/attendance - Получить уроки с посещаемостью
     */
    @Get('course/:courseId/attendance')
    @ApiOperation({
        summary: 'Получить уроки курса с данными о посещаемости',
        description: 'Возвращает все уроки курса с информацией о посещаемости студентов'
    })
    @ApiParam({ name: 'courseId', description: 'ID курса' })
    @ApiQuery({ name: 'studentId', required: false, description: 'ID конкретного студента (для получения его посещаемости)' })
    @ApiResponse({ status: 200, description: 'Уроки с данными посещаемости' })
    async getLessonsWithAttendance(
        @Param('courseId') courseId: string,
        @Query('studentId') studentId?: string,
        @Request() req?: any
    ) {
        this.logger.log(`Получение уроков с посещаемостью для курса ${courseId}`);

        // Если studentId не указан в запросе, берем из токена пользователя (если это студент)
        const finalStudentId = studentId || (req?.user?.roles?.includes('student') ? req.user.id : undefined);

        const lessons = await this.lessonsService.getLessonsWithAttendance(
            courseId,
            finalStudentId
        );

        return {
            success: true,
            courseId,
            lessons
        };
    }


    /**
     * Получить посещаемость занятия
     */
    @Get(':id/attendance')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({ summary: 'Получить данные посещаемости занятия' })
    @ApiResponse({ status: 200, description: 'Данные посещаемости получены' })
    async getAttendance(@Param('id') lessonId: string) {
        this.logger.log(`Получение посещаемости для занятия ${lessonId}`);
        return this.lessonsService.getAttendance(lessonId);
    }



    /**
     * Получить занятия по курсу и предмету
     */
    @Get('course/:courseId/subject/:subjectId')
    @ApiOperation({ summary: 'Получить занятия по курсу и предмету' })
    @ApiResponse({ status: 200, description: 'Список занятий' })
    async getLessonsByCourseAndSubject(
        @Param('courseId') courseId: string,
        @Param('subjectId') subjectId: string,
        @Query('upcoming') upcoming?: string
    ) {
        this.logger.log(`Получение занятий для курса ${courseId} и предмета ${subjectId}`);
        return this.lessonsService.getLessonsByCourseAndSubject(courseId, subjectId, upcoming === 'true');
    }



}

