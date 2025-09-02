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
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiConsumes,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';


@ApiTags('lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsController {
    private readonly logger = new Logger(LessonsController.name);

    constructor(private readonly lessonsService: LessonsService) { }

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
 * Отметить посещаемость занятия (только преподаватель)
 */
    @Post(':id/attendance')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({ summary: 'Отметить посещаемость студентов на занятии' })
    @ApiResponse({ status: 200, description: 'Посещаемость успешно отмечена' })
    async markAttendance(
        @Param('id') lessonId: string,
        @Body() attendanceData: {
            userId: string;
            isPresent: boolean;
            lessonGrade?: number;
            notes?: string;
        }[],
        @GetUser() teacher: any
    ) {
        this.logger.log(`Отметка посещаемости для занятия ${lessonId}`);
        return this.lessonsService.markAttendance(lessonId, attendanceData, teacher._id);
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

    // src/homework/homework.controller.ts - ДОБАВЛЯЕМ НОВЫЕ МЕТОДЫ К СУЩЕСТВУЮЩЕМУ КОНТРОЛЛЕРУ

    /**
     * Создать домашнее задание (только преподаватель)
     */
    @Post()
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Создать домашнее задание с прикреплением PDF файла' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Домашнее задание создано' })
    async create(
        @Body() createHomeworkDto: {
            title: string;
            description: string;
            lessonId: string;
            dueDate: string;
        },
        @UploadedFile() file: Express.Multer.File,
        @GetUser() teacher: any
    ) {
        this.logger.log(`Создание домашнего задания для урока ${createHomeworkDto.lessonId}`);
        return this.homeworkService.create(createHomeworkDto, file, teacher._id);
    }

    /**
     * Отправить выполненное домашнее задание (студент)
     */
    @Post(':id/submit')
    @UseGuards(RolesGuard)
    @Roles('student')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Отправить выполненное домашнее задание (ZIP файл)' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 200, description: 'Домашнее задание отправлено' })
    async submitHomework(
        @Param('id') homeworkId: string,
        @UploadedFile() file: Express.Multer.File,
        @GetUser() student: any
    ) {
        this.logger.log(`Отправка домашнего задания ${homeworkId} студентом ${student._id}`);
        return this.homeworkService.submitHomework(homeworkId, file, student._id);
    }

    /**
     * Оценить домашнее задание (преподаватель)
     */
    @Put('submissions/:submissionId/grade')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({ summary: 'Оценить выполненное домашнее задание' })
    @ApiResponse({ status: 200, description: 'Оценка выставлена' })
    async gradeHomework(
        @Param('submissionId') submissionId: string,
        @Body() gradeDto: {
            grade: number;
            feedback?: string;
        },
        @GetUser() teacher: any
    ) {
        this.logger.log(`Оценивание домашнего задания ${submissionId} преподавателем ${teacher._id}`);
        return this.homeworkService.gradeHomework(submissionId, gradeDto, teacher._id);
    }

    /**
     * Получить все отправки домашнего задания (преподаватель)
     */
    @Get(':id/submissions')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({ summary: 'Получить все отправки домашнего задания' })
    @ApiResponse({ status: 200, description: 'Список отправок домашнего задания' })
    async getSubmissions(@Param('id') homeworkId: string) {
        this.logger.log(`Получение отправок для домашнего задания ${homeworkId}`);
        return this.homeworkService.getSubmissions(homeworkId);
    }

    /**
     * Получить домашние задания студента
     */
    @Get('student/my-homework')
    @UseGuards(RolesGuard)
    @Roles('student')
    @ApiOperation({ summary: 'Получить домашние задания студента' })
    @ApiResponse({ status: 200, description: 'Список домашних заданий студента' })
    async getStudentHomework(@GetUser() student: any) {
        this.logger.log(`Получение домашних заданий для студента ${student._id}`);
        return this.homeworkService.getStudentHomework(student._id);
    }

}

