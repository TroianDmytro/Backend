// src/homework/homework.controller.ts
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
    DefaultValuePipe
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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

@ApiTags('homework')
@Controller('homework')
@UseGuards(JwtAuthGuard)
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
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                lessonId: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                requirements: { type: 'string' },
                deadline: { type: 'string', format: 'date-time' },
                max_score: { type: 'number' },
                max_attempts: { type: 'number' },
                allow_late_submission: { type: 'boolean' },
                isPublished: { type: 'boolean' },
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' }
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Домашнее задание успешно создано',
        type: HomeworkResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные или файлы' })
    @ApiResponse({ status: 403, description: 'Нет прав на создание задания' })
    async createHomework(
        @Body() createHomeworkDto: CreateHomeworkDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {
        // const teacherId = req.user.userId;
        const teacherId = 'temp-teacher-id'; // Временно для работы без JWT

        this.logger.log(`Преподаватель ${teacherId} создает домашнее задание: ${createHomeworkDto.title}`);

        const homework = await this.homeworkService.createHomework(createHomeworkDto, files, teacherId);

        return {
            message: 'Домашнее задание успешно создано',
            homework: {
                id: homework.id,
                title: homework.title,
                description: homework.description,
                lessonId: homework.lessonId,
                courseId: homework.courseId,
                deadline: homework.deadline,
                max_score: homework.max_score,
                max_attempts: homework.max_attempts,
                isPublished: homework.isPublished,
                files: homework.files.map((file, index) => ({
                    id: index,
                    filename: file.filename,
                    original_name: file.original_name,
                    size_bytes: file.size_bytes,
                    uploaded_at: file.uploaded_at
                })),
                createdAt: homework.createdAt
            }
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
    @ApiQuery({
        name: 'includeUnpublished',
        required: false,
        type: Boolean,
        description: 'Включать неопубликованные задания (только для преподавателей)'
    })
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
        // const isTeacher = req.user.roles?.includes('teacher') || req.user.roles?.includes('admin');
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