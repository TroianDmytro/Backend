// src/homework/homework.controller.ts - ЗАВЕРШЕНИЕ
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
    UseInterceptors,
    UploadedFiles,
    Request,
    Logger,
    NotFoundException,
    BadRequestException,
    Res,
    ParseIntPipe,
    DefaultValuePipe,
    UploadedFile
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiConsumes,
    ApiBody
} from '@nestjs/swagger';
import { Response } from 'express';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { ReviewHomeworkDto } from './dto/review-homework.dto';
import { HomeworkResponseDto } from './dto/homework-response.dto';
import { HomeworkSubmissionResponseDto } from './dto/homework-submission-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('homework')
@Controller('homework')
@UseGuards(JwtAuthGuard) // Закомментировано для работы без JWT
@ApiBearerAuth()
export class HomeworkController {
    private readonly logger = new Logger(HomeworkController.name);

    constructor(private readonly homeworkService: HomeworkService) { }

    /**
     * POST /homework - Создание домашнего задания (только преподаватели)
     */
    @Post()
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @UseInterceptors(FilesInterceptor('files', 10, {
        limits: {
            fileSize: 50 * 1024 * 1024, // 50MB
        },
        fileFilter: (req, file, callback) => {
            if (file.mimetype === 'application/zip' ||
                file.mimetype === 'application/x-zip-compressed' ||
                file.originalname.toLowerCase().endsWith('.zip')) {
                callback(null, true);
            } else {
                callback(new BadRequestException('Разрешены только ZIP файлы'), false);
            }
        }
    }))
    @ApiOperation({
        summary: 'Создание домашнего задания',
        description: 'Создает новое домашнее задание с загрузкой ZIP файлов. Доступно только преподавателям.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: 201,
        description: 'Домашнее задание успешно создано',
        type: HomeworkResponseDto
    })
    async createHomework(
        @Body() createHomeworkDto: CreateHomeworkDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {
        const teacherId = 'temp-teacher-id'; // Временно для работы без JWT

        this.logger.log(`Преподаватель ${teacherId} создает домашнее задание: ${createHomeworkDto.title}`);

        const homework = await this.homeworkService.createHomework(createHomeworkDto, files, teacherId);

        return {
            message: 'Домашнее задание успешно создано',
            homework: homework
        };
    }

    /**
     * GET /homework/lesson/:lessonId - Получение заданий урока
     */
    @Get('lesson/:lessonId')
    @ApiOperation({
        summary: 'Получение домашних заданий урока',
        description: 'Возвращает список всех домашних заданий для конкретного урока'
    })
    @ApiParam({ name: 'lessonId', description: 'ID урока' })
    @ApiResponse({
        status: 200,
        description: 'Список домашних заданий урока',
        type: [HomeworkResponseDto]
    })
    async getHomeworksByLesson(
        @Param('lessonId') lessonId: string,
        @Query('includeUnpublished') includeUnpublished: boolean = false,
        @Request() req
    ) {
        const isTeacher = true; // Временно для работы без JWT

        this.logger.log(`Получение заданий урока: ${lessonId}`);

        const showUnpublished = includeUnpublished && isTeacher;
        const homeworks = await this.homeworkService.getHomeworksByLesson(lessonId, showUnpublished);

        return {
            lessonId: lessonId,
            homeworks: homeworks.map(hw => ({
                id: hw.id,
                title: hw.title,
                description: hw.description,
                deadline: hw.deadline,
                max_score: hw.max_score,
                max_attempts: hw.max_attempts,
                allow_late_submission: hw.allow_late_submission,
                isPublished: hw.isPublished,
                submissions_count: hw.submissions_count,
                completed_count: hw.completed_count,
                average_score: hw.average_score,
                files: hw.files.map((file, index) => ({
                    id: index,
                    filename: file.filename,
                    original_name: file.originalName,
                    size_bytes: file.size,
                    uploaded_at: new Date() // Используем текущую дату, так как поле не существует
                })),
                createdAt: hw.createdAt
            })),
            totalHomeworks: homeworks.length
        };
    }

    /**
     * GET /homework/:id - Получение домашнего задания по ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Получение домашнего задания по ID',
        description: 'Возвращает подробную информацию о домашнем задании'
    })
    @ApiParam({ name: 'id', description: 'ID домашнего задания' })
    @ApiResponse({
        status: 200,
        description: 'Данные домашнего задания',
        type: HomeworkResponseDto
    })
    async getHomeworkById(@Param('id') id: string) {
        this.logger.log(`Получение домашнего задания с ID: ${id}`);

        const homework = await this.homeworkService.getHomeworkById(id, false);
        if (!homework) {
            throw new NotFoundException('Домашнее задание не найдено');
        }

        return { homework };
    }

    /**
     * PUT /homework/:id - Обновление домашнего задания
     */
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Обновление домашнего задания',
        description: 'Обновляет данные домашнего задания. Преподаватель может редактировать только свои задания.'
    })
    @ApiParam({ name: 'id', description: 'ID домашнего задания' })
    @ApiResponse({
        status: 200,
        description: 'Домашнее задание успешно обновлено',
        type: HomeworkResponseDto
    })
    async updateHomework(
        @Param('id') id: string,
        @Body() updateHomeworkDto: UpdateHomeworkDto,
        @Request() req
    ) {
        const teacherId = 'temp-teacher-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Обновление домашнего задания с ID: ${id}`);

        const updatedHomework = await this.homeworkService.updateHomework(id, updateHomeworkDto, teacherId, isAdmin);

        return {
            message: 'Домашнее задание успешно обновлено',
            homework: updatedHomework
        };
    }

    /**
     * DELETE /homework/:id - Удаление домашнего задания
     */
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Удаление домашнего задания',
        description: 'Удаляет домашнее задание и все связанные отправки'
    })
    @ApiParam({ name: 'id', description: 'ID домашнего задания' })
    @ApiResponse({ status: 200, description: 'Домашнее задание успешно удалено' })
    async deleteHomework(
        @Param('id') id: string,
        @Request() req
    ) {
        const teacherId = 'temp-teacher-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Удаление домашнего задания с ID: ${id}`);

        await this.homeworkService.deleteHomework(id, teacherId, isAdmin);

        return {
            message: 'Домашнее задание успешно удалено'
        };
    }

    /**
     * POST /homework/submissions/:id/review - Проверка домашнего задания преподавателем
     */
    @Post('submissions/:id/review')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Проверка домашнего задания',
        description: 'Преподаватель проверяет и оценивает отправленное домашнее задание'
    })
    @ApiParam({ name: 'id', description: 'ID отправки домашнего задания' })
    @ApiResponse({
        status: 200,
        description: 'Домашнее задание успешно проверено',
        type: HomeworkSubmissionResponseDto
    })
    async reviewSubmission(
        @Param('id') submissionId: string,
        @Body() reviewDto: ReviewHomeworkDto,
        @Request() req
    ) {
        const teacherId = 'temp-teacher-id'; // Временно для работы без JWT

        this.logger.log(`Преподаватель ${teacherId} проверяет работу: ${submissionId}`);

        const reviewedSubmission = await this.homeworkService.reviewSubmission(
            submissionId,
            reviewDto,
            teacherId
        );

        return {
            message: 'Домашнее задание успешно проверено',
            submission: reviewedSubmission
        };
    }

    /**
     * GET /homework/teacher/submissions - Получение отправок для преподавателя
     */
    @Get('teacher/submissions')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Получение отправок для преподавателя',
        description: 'Возвращает список всех отправок домашних заданий для преподавателя'
    })
    @ApiQuery({ name: 'status', required: false, enum: ['submitted', 'in_review', 'reviewed', 'returned_for_revision'] })
    @ApiQuery({ name: 'courseId', required: false, description: 'Фильтр по курсу' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Список отправок для проверки',
        type: [HomeworkSubmissionResponseDto]
    })
    async getSubmissionsForTeacher(
        @Query('status') status?: string,
        @Query('courseId') courseId?: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
        @Request() req?
    ) {
        const teacherId = 'temp-teacher-id'; // Временно для работы без JWT

        this.logger.log(`Преподаватель ${teacherId} запрашивает отправки для проверки`);

        const result = await this.homeworkService.getSubmissionsForTeacher(
            teacherId,
            status,
            courseId,
            page,
            limit
        );

        return {
            submissions: result.submissions,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /homework/student/submissions - Получение отправок студента
     */
    @Get('student/submissions')
    @UseGuards(RolesGuard)
    @Roles('user')
    @ApiOperation({
        summary: 'Получение отправок студента',
        description: 'Возвращает список всех отправок домашних заданий студента'
    })
    @ApiQuery({ name: 'courseId', required: false, description: 'Фильтр по курсу' })
    @ApiResponse({
        status: 200,
        description: 'Список отправок студента',
        type: [HomeworkSubmissionResponseDto]
    })
    async getStudentSubmissions(
        @Query('courseId') courseId?: string,
        @Request() req?
    ) {
        const studentId = 'temp-student-id'; // Временно для работы без JWT

        this.logger.log(`Студент ${studentId} запрашивает свои отправки`);

        const submissions = await this.homeworkService.getStudentSubmissions(studentId, courseId);

        return {
            submissions: submissions,
            totalSubmissions: submissions.length
        };
    }

    /**
     * GET /homework/:id/statistics - Получение статистики домашнего задания
     */
    @Get(':id/statistics')
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiOperation({
        summary: 'Получение статистики домашнего задания',
        description: 'Возвращает статистику по отправкам и оценкам домашнего задания'
    })
    @ApiParam({ name: 'id', description: 'ID домашнего задания' })
    @ApiResponse({ status: 200, description: 'Статистика домашнего задания' })
    async getHomeworkStatistics(@Param('id') homeworkId: string) {
        this.logger.log(`Получение статистики домашнего задания: ${homeworkId}`);

        const statistics = await this.homeworkService.getHomeworkStatistics(homeworkId);

        return {
            homeworkId: homeworkId,
            statistics: statistics
        };
    }

    /**
     * GET /homework/files/:fileId/download - Скачивание файла задания или отправки
     */
    @Get('files/:fileId/download')
    @ApiOperation({
        summary: 'Скачивание файла домашнего задания',
        description: 'Скачивает ZIP файл задания или отправки'
    })
    @ApiParam({ name: 'fileId', description: 'ID файла (индекс в массиве)' })
    @ApiQuery({ name: 'homeworkId', required: false, description: 'ID домашнего задания' })
    @ApiQuery({ name: 'submissionId', required: false, description: 'ID отправки' })
    async downloadFile(
        @Param('fileId') fileId: string,
        @Query('homeworkId') homeworkId?: string,
        @Query('submissionId') submissionId?: string,
        @Request() req?,
        @Res({ passthrough: false }) res?: Response
    ) {
        const userId = 'temp-user-id'; // Временно для работы без JWT
        const isTeacher = true; // Временно для работы без JWT

        this.logger.log(`Скачивание файла: ${fileId}, задание: ${homeworkId}, отправка: ${submissionId}`);

        if (!homeworkId && !submissionId) {
            throw new BadRequestException('Необходимо указать homeworkId или submissionId');
        }

        if (!res) {
            throw new BadRequestException('Ошибка инициализации ответа');
        }

        try {
            const file = await this.homeworkService.downloadFile(
                fileId,
                homeworkId || '',
                submissionId || null,
                userId,
                isTeacher
            );

            res.setHeader('Content-Type', file.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
            res.send(file.data);
        } catch (error) {
            this.logger.error(`Ошибка скачивания файла: ${error.message}`);
            throw error;
        }
    }
}