// src/lessons/attendance.controller.ts
import {
    Controller,
    Post,
    Get,
    Put,
    Param,
    Body,
    UseGuards,
    Request,
    Logger,
    NotFoundException,
    ForbiddenException,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LessonsService } from './lessons.service';
import { UserRole } from 'src/users/enums/user-role.enum';

/**
 * DTO для отметки посещаемости - ИСПРАВЛЕННАЯ СТРУКТУРА
 */
export class MarkAttendanceDto {
    attendanceData: Array<{
        studentId: string; // ИСПРАВЛЕНО: правильное название поля
        isPresent: boolean;
        lessonGrade?: number;
        notes?: string;
    }>;
}

@ApiTags('Lesson Attendance')
@Controller('lessons/:lessonId/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
    private readonly logger = new Logger(AttendanceController.name);

    constructor(private readonly lessonsService: LessonsService) { }

    /**
     * Отметить посещаемость студентов на занятии
     * Только преподаватель может отмечать посещаемость
     */
    @Post()
    @Roles('teacher')
    @ApiOperation({
        summary: 'Отметить посещаемость студентов',
        description: 'Преподаватель отмечает присутствующих студентов и выставляет оценки за занятие'
    })
    @ApiResponse({
        status: 200,
        description: 'Посещаемость успешно отмечена'
    })
    @ApiResponse({
        status: 403,
        description: 'Доступ запрещен - только преподаватель урока может отмечать посещаемость'
    })
    @ApiResponse({
        status: 404,
        description: 'Занятие не найдено'
    })
    async markAttendance(
        @Param('id') lessonId: string,
        @Body() markAttendanceDto: MarkAttendanceDto,
        @Request() req: any
    ) {
        try {
            const teacherId = req.user.id;

            // ИСПРАВЛЕНИЕ: Правильная передача данных с правильным полем studentId
            const result = await this.lessonsService.markAttendance(
                lessonId,
                teacherId,
                markAttendanceDto.attendanceData // Передаем массив с правильной структурой
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
    * Получить посещаемость занятия
    */
    @Get()
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Получить посещаемость занятия',
        description: 'Получить список студентов и их посещаемость для конкретного занятия'
    })
    async getAttendance(
        @Param('id') lessonId: string,
        @Request() req: any
    ) {
        try {
            // ИСПРАВЛЕНО: используем существующий метод findOne
            const lesson = await this.lessonsService.findOne(lessonId);

            if (!lesson) {
                throw new HttpException('Занятие не найдено', HttpStatus.NOT_FOUND);
            }

            // Проверяем доступ для преподавателей (админы видят все)
            if (req.user.role === UserRole.TEACHER) {
                const teacherId = req.user.id;
                if (lesson.teacher.toString() !== teacherId) {
                    throw new HttpException(
                        'Доступ запрещен - вы можете видеть только свои занятия',
                        HttpStatus.FORBIDDEN
                    );
                }
            }

            return {
                success: true,
                data: {
                    lesson: {
                        id: lesson._id,
                        title: lesson.title,
                        date: lesson.date,
                        startTime: lesson.startTime,
                        endTime: lesson.endTime
                    },
                    attendance: lesson.attendance.map(att => ({
                        student: att.user,
                        isPresent: att.isPresent,
                        lessonGrade: att.lessonGrade,
                        notes: att.notes,
                        markedAt: att.markedAt,
                        markedBy: att.markedBy
                    }))
                }
            };

        } catch (error) {
            throw new HttpException(
                error.message || 'Ошибка получения посещаемости',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Получить статистику посещаемости студента
     */
    @Get('student/:studentId/statistics')
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Получить статистику посещаемости студента',
        description: 'Получить детальную статистику посещаемости и оценок студента'
    })
    async getStudentStatistics(
        @Param('id') lessonId: string,
        @Param('studentId') studentId: string,
        @Request() req: any
    ) {
        try {
            // ИСПРАВЛЕНО: используем существующий метод findOne
            const lesson = await this.lessonsService.findOne(lessonId);

            if (!lesson) {
                throw new HttpException('Занятие не найдено', HttpStatus.NOT_FOUND);
            }

            // Проверяем доступ для преподавателей
            if (req.user.role === UserRole.TEACHER) {
                const teacherId = req.user.id;
                if (lesson.teacher.toString() !== teacherId) {
                    throw new HttpException(
                        'Доступ запрещен - вы можете видеть статистику только по своим занятиям',
                        HttpStatus.FORBIDDEN
                    );
                }
            }

            const courseId = lesson.course.toString();
            const statistics = await this.lessonsService.getStudentStatistics(studentId, courseId);

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