// СОЗДАТЬ НОВЫЙ ФАЙЛ: src/homework/homework.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Logger,
    BadRequestException,
    StreamableFile,
    Response
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiConsumes,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiResponse,
    ApiQuery
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { HomeworkService } from './homework.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('homework')
@Controller('homework')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HomeworkController {
    private readonly logger = new Logger(HomeworkController.name);

    constructor(private readonly homeworkService: HomeworkService) { }

    /**
     * POST /homework/lesson/:lessonId - Создать домашнее задание (преподаватель)
     */
    @Post('lesson/:lessonId')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Создать домашнее задание для урока',
        description: 'Преподаватель создает домашнее задание с PDF файлом инструкций'
    })
    @ApiParam({ name: 'lessonId', description: 'ID урока' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Название задания' },
                description: { type: 'string', description: 'Описание задания' },
                dueDate: { type: 'string', format: 'date-time', description: 'Срок сдачи (опционально)' },
                file: { type: 'string', format: 'binary', description: 'PDF файл с заданием' }
            },
            required: ['title', 'file']
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    @ApiResponse({ status: 201, description: 'Домашнее задание создано' })
    @ApiResponse({ status: 400, description: 'Требуется PDF файл' })
    @ApiResponse({ status: 403, description: 'Нет прав доступа' })
    async createHomework(
        @Param('lessonId') lessonId: string,
        @Body() homeworkData: {
            title: string;
            description?: string;
            dueDate?: string;
        },
        @UploadedFile() file: Express.Multer.File,
        @Req() request: any
    ) {
        this.logger.log(`Создание домашнего задания для урока ${lessonId}`);

        if (!file || file.mimetype !== 'application/pdf') {
            throw new BadRequestException('Требуется PDF файл с заданием');
        }

        const teacherId = request.user?.userId || request.user?.id;

        const homework = await this.homeworkService.createHomework(
            lessonId,
            homeworkData,
            file,
            teacherId
        );

        return {
            success: true,
            message: 'Домашнее задание успешно создано',
            homework
        };
    }

    /**
     * POST /homework/:homeworkId/submit - Отправить выполненное задание (студент)
     */
    @Post(':homeworkId/submit')
    @ApiOperation({
        summary: 'Отправить выполненное домашнее задание',
        description: 'Студент отправляет ZIP файл с выполненным заданием'
    })
    @ApiParam({ name: 'homeworkId', description: 'ID домашнего задания' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'ZIP файл с выполненным заданием' }
            },
            required: ['file']
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    @ApiResponse({ status: 200, description: 'Задание отправлено' })
    @ApiResponse({ status: 400, description: 'Требуется ZIP файл или работа уже проверена' })
    async submitHomework(
        @Param('homeworkId') homeworkId: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() request: any
    ) {
        this.logger.log(`Отправка домашнего задания ${homeworkId}`);

        if (!file || !file.originalname.toLowerCase().endsWith('.zip')) {
            throw new BadRequestException('Требуется ZIP файл с выполненным заданием');
        }

        const studentId = request.user?.userId || request.user?.id;

        const submission = await this.homeworkService.submitHomework(
            homeworkId,
            file,
            studentId
        );

        return {
            success: true,
            message: 'Домашнее задание успешно отправлено',
            submission
        };
    }

    /**
     * PUT /homework/submission/:submissionId/grade - Проверить и оценить работу (преподаватель)
     */
    @Put('submission/:submissionId/grade')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Оценить выполненную работу',
        description: 'Преподаватель проверяет работу и выставляет оценку'
    })
    @ApiParam({ name: 'submissionId', description: 'ID отправленной работы' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                grade: { type: 'number', minimum: 1, maximum: 5, description: 'Оценка (1-5)' },
                feedback: { type: 'string', description: 'Обратная связь преподавателя' }
            },
            required: ['grade']
        }
    })
    @ApiResponse({ status: 200, description: 'Работа оценена' })
    async gradeSubmission(
        @Param('submissionId') submissionId: string,
        @Body() gradeData: {
            grade: number;
            feedback?: string;
        },
        @Req() request: any
    ) {
        this.logger.log(`Оценивание работы ${submissionId}`);

        const teacherId = request.user?.userId || request.user?.id;

        const submission = await this.homeworkService.gradeSubmission(
            submissionId,
            gradeData,
            teacherId
        );

        return {
            success: true,
            message: 'Работа успешно оценена',
            submission
        };
    }

    /**
     * GET /homework/student/my - Получить мои домашние задания (студент)
     */
    @Get('student/my')
    @ApiOperation({
        summary: 'Получить мои домашние задания',
        description: 'Студент получает список всех своих домашних заданий'
    })
    @ApiQuery({ name: 'status', required: false, description: 'Фильтр по статусу (pending, submitted, graded)' })
    @ApiResponse({ status: 200, description: 'Список домашних заданий студента' })
    async getMyHomeworks(
        @Req() request: any,
        @Query('status') status?: string
    ) {
        const studentId = request.user?.userId || request.user?.id;
        this.logger.log(`Получение домашних заданий студента ${studentId}`);

        const homeworks = await this.homeworkService.getStudentHomeworks(studentId);

        // Фильтруем по статусу если указан
        let filteredHomeworks = homeworks;
        if (status) {
            filteredHomeworks = homeworks.filter(hw => hw.status === status);
        }

        return {
            success: true,
            studentId,
            homeworks: filteredHomeworks
        };
    }

    /**
     * GET /homework/teacher/submissions - Получить задания для проверки (преподаватель)
     */
    @Get('teacher/submissions')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Получить задания для проверки',
        description: 'Преподаватель получает список работ студентов для проверки'
    })
    @ApiQuery({ name: 'status', required: false, description: 'Фильтр по статусу проверки' })
    @ApiQuery({ name: 'courseId', required: false, description: 'Фильтр по курсу' })
    @ApiResponse({ status: 200, description: 'Список работ для проверки' })
    async getSubmissionsForReview(
        @Req() request: any,
        @Query('status') status?: string,
        @Query('courseId') courseId?: string
    ) {
        const teacherId = request.user?.userId || request.user?.id;
        this.logger.log(`Получение работ для проверки преподавателем ${teacherId}`);

        const submissions = await this.homeworkService.getSubmissionsForTeacher(
            teacherId,
            status,
            courseId
        );

        return {
            success: true,
            teacherId,
            submissions
        };
    }

    /**
     * GET /homework/:homeworkId - Получить информацию о домашнем задании
     */
    @Get(':homeworkId')
    @ApiOperation({ summary: 'Получить информацию о домашнем задании' })
    @ApiParam({ name: 'homeworkId', description: 'ID домашнего задания' })
    @ApiResponse({ status: 200, description: 'Информация о задании' })
    async getHomework(@Param('homeworkId') homeworkId: string) {
        this.logger.log(`Получение информации о задании ${homeworkId}`);

        const homework = await this.homeworkService.findById(homeworkId);

        return {
            success: true,
            homework
        };
    }

    /**
     * GET /homework/:homeworkId/submissions - Получить все отправки задания (преподаватель)
     */
    @Get(':homeworkId/submissions')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({ summary: 'Получить все отправки домашнего задания' })
    @ApiParam({ name: 'homeworkId', description: 'ID домашнего задания' })
    @ApiResponse({ status: 200, description: 'Список отправок задания' })
    async getHomeworkSubmissions(@Param('homeworkId') homeworkId: string) {
        this.logger.log(`Получение отправок задания ${homeworkId}`);

        const result = await this.homeworkService.getSubmissions(homeworkId);

        return {
            success: true,
            ...result
        };
    }

    /**
     * GET /homework/download/:homeworkId/:fileId - Скачать файл задания
     */
    @Get('download/:homeworkId/:fileId')
    @ApiOperation({ summary: 'Скачать файл домашнего задания' })
    @ApiParam({ name: 'homeworkId', description: 'ID домашнего задания' })
    @ApiParam({ name: 'fileId', description: 'ID файла' })
    async downloadHomeworkFile(
        @Param('homeworkId') homeworkId: string,
        @Param('fileId') fileId: string,
        @Response({ passthrough: true }) res: ExpressResponse,
        @Req() request: any
    ) {
        this.logger.log(`Скачивание файла ${fileId} задания ${homeworkId}`);

        const userId = request.user?.userId || request.user?.id;
        const isTeacher = request.user?.roles?.includes('teacher') || request.user?.roles?.includes('admin');

        const fileData = await this.homeworkService.downloadFile(
            fileId,
            homeworkId,
            null, // submissionId = null для файлов задания
            userId,
            isTeacher
        );

        res.set({
            'Content-Type': fileData.mimeType,
            'Content-Disposition': `attachment; filename="${fileData.filename}"`
        });

        return new StreamableFile(fileData.data);
    }

    /**
     * GET /homework/download/submission/:submissionId/:fileId - Скачать файл отправки
     */
    @Get('download/submission/:submissionId/:fileId')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin', 'student')
    @ApiOperation({ summary: 'Скачать файл отправленной работы' })
    @ApiParam({ name: 'submissionId', description: 'ID отправки' })
    @ApiParam({ name: 'fileId', description: 'ID файла' })
    async downloadSubmissionFile(
        @Param('submissionId') submissionId: string,
        @Param('fileId') fileId: string,
        @Response({ passthrough: true }) res: ExpressResponse,
        @Req() request: any
    ) {
        this.logger.log(`Скачивание файла ${fileId} отправки ${submissionId}`);

        const userId = request.user?.userId || request.user?.id;
        const isTeacher = request.user?.roles?.includes('teacher') || request.user?.roles?.includes('admin');

        const fileData = await this.homeworkService.downloadFile(
            fileId,
            '', // homeworkId не нужен для отправок
            submissionId,
            userId,
            isTeacher
        );

        res.set({
            'Content-Type': fileData.mimeType,
            'Content-Disposition': `attachment; filename="${fileData.filename}"`
        });

        return new StreamableFile(fileData.data);
    }

    /**
     * DELETE /homework/:homeworkId - Удалить домашнее задание (преподаватель)
     */
    @Delete(':homeworkId')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({ summary: 'Удалить домашнее задание' })
    @ApiParam({ name: 'homeworkId', description: 'ID домашнего задания' })
    @ApiResponse({ status: 200, description: 'Задание удалено' })
    async deleteHomework(
        @Param('homeworkId') homeworkId: string,
        @Req() request: any
    ) {
        this.logger.log(`Удаление домашнего задания ${homeworkId}`);

        const teacherId = request.user?.userId || request.user?.id;

        await this.homeworkService.deleteHomework(homeworkId, teacherId);

        return {
            success: true,
            message: 'Домашнее задание успешно удалено'
        };
    }
}