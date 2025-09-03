// src/homework/homework.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFiles,
    HttpStatus,
    HttpException,
    Query
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { ReviewHomeworkDto } from './dto/review-homework.dto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UserRole } from 'src/users/enums/user-role.enum';

// Конфигурация для сохранения файлов
const multerConfig = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = join(process.cwd(), 'uploads', 'homework');
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `homework-${uniqueSuffix}${extname(file.originalname)}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        // Разрешенные типы файлов для домашних заданий
        const allowedMimes = [
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый тип файла. Разрешены: PDF, ZIP, DOC, DOCX, TXT'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 5 // Максимум 5 файлов
    }
};

@ApiTags('homework')
@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HomeworkController {
    constructor(private readonly homeworkService: HomeworkService) { }

    /**
     * Создать домашнее задание (только преподаватели)
     */
    @Post()
    @Roles('teacher')
    @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
    @ApiOperation({
        summary: 'Создать домашнее задание',
        description: 'Преподаватель создает домашнее задание с возможностью прикрепления файлов'
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Домашнее задание создано' })
    @ApiResponse({ status: 403, description: 'Доступ запрещен' })
    async create(
        @Body() createHomeworkDto: CreateHomeworkDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req: any
    ) {
        try {
            const teacherId = req.user.id;
            const homework = await this.homeworkService.create(createHomeworkDto, teacherId, files);

            return {
                success: true,
                message: 'Домашнее задание успешно создано',
                data: homework
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка создания домашнего задания',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Получить домашние задания студента
     */
    @Get('student/my')
    @Roles('student')
    @ApiOperation({
        summary: 'Получить мои домашние задания',
        description: 'Студент получает список своих домашних заданий'
    })
    async getMyHomeworks(
        @Request() req: any,
        @Query('courseId') courseId?: string
    ) {
        try {
            const studentId = req.user.id;
            const homeworks = await this.homeworkService.getStudentHomeworks(studentId, courseId);

            return {
                success: true,
                data: homeworks
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка получения домашних заданий',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Отправить выполненное домашнее задание
     */
    @Post(':id/submit')
    @Roles('student')
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(process.cwd(), 'uploads', 'submissions');
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `submission-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            // Для отправок студентов разрешаем больше типов файлов
            const allowedMimes = [
                'application/zip',
                'application/x-zip-compressed',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'image/jpeg',
                'image/png',
                'image/gif'
            ];

            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Неподдерживаемый тип файла'), false);
            }
        },
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB для студенческих работ
            files: 10
        }
    }))
    @ApiOperation({
        summary: 'Отправить домашнее задание',
        description: 'Студент отправляет выполненное домашнее задание'
    })
    @ApiConsumes('multipart/form-data')
    async submitHomework(
        @Param('id') homeworkId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req: any
    ) {
        try {
            const studentId = req.user.id;

            if (!files || files.length === 0) {
                throw new HttpException(
                    'Необходимо прикрепить хотя бы один файл с решением',
                    HttpStatus.BAD_REQUEST
                );
            }

            const submission = await this.homeworkService.submitHomework(homeworkId, studentId, files);

            return {
                success: true,
                message: 'Домашнее задание успешно отправлено',
                data: submission
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка отправки домашнего задания',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Получить отправки для проверки (преподаватели)
     */
    @Get('teacher/submissions')
    @Roles('teacher')
    @ApiOperation({
        summary: 'Получить отправки для проверки',
        description: 'Преподаватель получает список отправленных домашних заданий для проверки'
    })
    async getSubmissionsForReview(
        @Request() req: any,
        @Query('status') status?: string,
        @Query('courseId') courseId?: string
    ) {
        try {
            const teacherId = req.user.id;
            const submissions = await this.homeworkService.getSubmissionsForTeacher(
                teacherId,
                status,
                courseId
            );

            return {
                success: true,
                data: submissions
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка получения отправок',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Проверить домашнее задание (преподаватели)
     */
    @Put('submissions/:submissionId/review')
    @Roles('teacher')
    @ApiOperation({
        summary: 'Проверить домашнее задание',
        description: 'Преподаватель проверяет и оценивает домашнее задание студента'
    })
    async reviewHomework(
        @Param('submissionId') submissionId: string,
        @Body() reviewData: ReviewHomeworkDto,
        @Request() req: any
    ) {
        try {
            const teacherId = req.user.id;
            const reviewedSubmission = await this.homeworkService.reviewHomework(
                submissionId,
                teacherId,
                reviewData
            );

            return {
                success: true,
                message: 'Домашнее задание успешно проверено',
                data: reviewedSubmission
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка проверки домашнего задания',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Получить конкретное домашнее задание
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Получить домашнее задание по ID',
        description: 'Получить детальную информацию о домашнем задании'
    })
    async getHomework(
        @Param('id') homeworkId: string,
        @Request() req: any
    ) {
        try {
            // ИСПРАВЛЕНО: используем существующий метод findOne
            const homework = await this.homeworkService.findOne(homeworkId);

            if (!homework) {
                throw new HttpException('Домашнее задание не найдено', HttpStatus.NOT_FOUND);
            }

            // Проверяем доступ
            const userRole = req.user.role;
            const userId = req.user.id;

            if (userRole === UserRole.STUDENT) {
                // ИСПРАВЛЕНО: используем существующий метод checkStudentAccess
                const hasAccess = await this.homeworkService.checkStudentAccess(homeworkId, userId);
                if (!hasAccess) {
                    throw new HttpException('Доступ к заданию запрещен', HttpStatus.FORBIDDEN);
                }
            } else if (userRole === UserRole.TEACHER) {
                // Преподаватель может видеть только свои задания
                if (homework.teacher.toString() !== userId) {
                    throw new HttpException('Доступ к заданию запрещен', HttpStatus.FORBIDDEN);
                }
            }

            return {
                success: true,
                data: homework
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка получения домашнего задания',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Получить статистику по домашнему заданию (преподаватели)
     */
    @Get(':id/statistics')
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Получить статистику по домашнему заданию',
        description: 'Статистика выполнения домашнего задания студентами'
    })
    async getHomeworkStatistics(
        @Param('id') homeworkId: string,
        @Request() req: any
    ) {
        try {
            // ИСПРАВЛЕНО: используем существующий метод getHomeworkStatistics
            const statistics = await this.homeworkService.getHomeworkStatistics(homeworkId);

            return {
                success: true,
                data: statistics
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка получения статистики',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}

/**
 * ОБЪЯСНЕНИЕ КОНТРОЛЛЕРА ДОМАШНИХ ЗАДАНИЙ:
 * 
 * 1. **ЗАГРУЗКА ФАЙЛОВ**:
 *    - Multer настроен для сохранения файлов в папки uploads/homework и uploads/submissions
 *    - Поддерживаются PDF, ZIP, DOC, DOCX, TXT файлы
 *    - Ограничения: 50MB для заданий преподавателя, 100MB для отправок студентов
 * 
 * 2. **РОЛИ И ДОСТУП**:
 *    - Создавать задания могут только преподаватели
 *    - Отправлять решения могут только студенты
 *    - Проверять могут только преподаватели своих заданий
 * 
 * 3. **ENDPOINTS**:
 *    - POST /homework - создать задание (преподаватель)
 *    - GET /homework/student/my - мои задания (студент)
 *    - POST /homework/:id/submit - отправить решение (студент)
 *    - GET /homework/teacher/submissions - отправки для проверки (преподаватель)
 *    - PUT /homework/submissions/:id/review - проверить задание (преподаватель)
 *    - GET /homework/:id - получить задание
 *    - GET /homework/:id/statistics - статистика задания
 * 
 * 4. **ВАЛИДАЦИЯ ФАЙЛОВ**:
 *    - Проверка типа файлов
 *    - Ограничение размера
 *    - Автоматическое создание папок для загрузки
 * 
 * 5. **ОБРАБОТКА ОШИБОК**:
 *    - Все методы обернуты в try-catch
 *    - Понятные сообщения об ошибках
 *    - Правильные HTTP статус коды
 */