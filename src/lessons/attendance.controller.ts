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
    ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LessonsService } from './lessons.service';

@ApiTags('Lesson Attendance')
@Controller('lessons/:lessonId/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
    private readonly logger = new Logger(AttendanceController.name);

    constructor(private readonly lessonsService: LessonsService) { }

    /**
     * POST /lessons/:lessonId/attendance - Отметка посещаемости
     */
    @Post()
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Отметка посещаемости студентов',
        description: 'Преподаватель отмечает присутствующих и выставляет оценки за занятие'
    })
    async markAttendance(
        @Param('lessonId') lessonId: string,
        @Body() attendanceData: {
            userId: string;
            isPresent: boolean;
            lessonGrade?: number;
            notes?: string;
        }[],
        @Request() req
    ) {
        const teacherId = req.user.userId;

        this.logger.log(`Отметка посещаемости урока ${lessonId} преподавателем ${teacherId}`);

        const lesson = await this.lessonsService.findById(lessonId);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        // Проверяем права - только преподаватель урока или админ
        const isAdmin = req.user.roles?.includes('admin');
        if (!isAdmin && lesson.teacher.toString() !== teacherId) {
            throw new ForbiddenException('У вас нет прав для отметки посещаемости этого урока');
        }

        const updatedLesson = await this.lessonsService.markAttendance(lessonId, attendanceData, teacherId);

        return {
            message: 'Посещаемость успешно отмечена',
            lesson: updatedLesson
        };
    }

    /**
     * GET /lessons/:lessonId/attendance - Получение данных о посещаемости
     */
    @Get()
    @UseGuards(RolesGuard)
    @Roles('teacher', 'admin', 'student')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение данных о посещаемости урока'
    })
    async getAttendance(
        @Param('lessonId') lessonId: string,
        @Request() req
    ) {
        const userId = req.user.userId;
        const isAdmin = req.user.roles?.includes('admin');
        const isTeacher = req.user.roles?.includes('teacher');

        const lesson = await this.lessonsService.findByIdWithAttendance(lessonId);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        // Студент может видеть только свою посещаемость
        if (!isAdmin && !isTeacher && lesson.teacher.toString() !== userId) {
            const userAttendance = lesson.attendance?.filter(a => a.user.toString() === userId);
            return {
                lesson: {
                    _id: lesson._id,
                    title: lesson.title,
                    date: lesson.date,
                    startTime: lesson.startTime,
                    endTime: lesson.endTime
                },
                myAttendance: userAttendance
            };
        }

        return {
            lesson,
            attendance: lesson.attendance
        };
    }
}