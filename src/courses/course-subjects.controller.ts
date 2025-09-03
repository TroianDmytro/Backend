// src/courses/course-subjects.controller.ts
import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    Logger,
    BadRequestException,
    NotFoundException,
    ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CoursesService } from './courses.service';
import { SubjectsService } from '../subjects/subjects.service';
import { TeachersService } from '../teachers/teachers.service';

@ApiTags('Course Subjects')
@Controller('courses/:courseId/subjects')
@UseGuards(JwtAuthGuard)
export class CourseSubjectsController {
    private readonly logger = new Logger(CourseSubjectsController.name);

    constructor(
        private readonly coursesService: CoursesService,
        private readonly subjectsService: SubjectsService,
        private readonly teachersService: TeachersService
    ) { }

    /**
     * POST /courses/:courseId/subjects - Добавление предмета к курсу
     */
    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Добавление предмета к курсу',
        description: 'Добавляет предмет к курсу с возможностью назначения преподавателя'
    })
    async addSubjectToCourse(
        @Param('courseId') courseId: string,
        @Body() addSubjectDto: {
            subjectId: string;
            teacherId?: string;
            startDate: Date;
        },
        @Request() req
    ) {
        const currentUserId = req.user.userId;
        const isAdmin = req.user.roles?.includes('admin');

        this.logger.log(`Добавление предмета ${addSubjectDto.subjectId} к курсу ${courseId}`);

        // Проверяем существование курса
        const course = await this.coursesService.findById(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher?.toString() !== currentUserId) {
            throw new ForbiddenException('У вас нет прав для добавления предметов к этому курсу');
        }

        // Проверяем существование предмета
        const subject = await this.subjectsService.findById(addSubjectDto.subjectId);
        if (!subject) {
            throw new BadRequestException('Предмет не найден');
        }

        // Проверяем преподавателя если указан
        if (addSubjectDto.teacherId) {
            const teacher = await this.teachersService.findById(addSubjectDto.teacherId);
            if (!teacher) {
                throw new BadRequestException('Преподаватель не найден');
            }
        }

        // Проверяем, не добавлен ли уже этот предмет
        const existingSubject = course.courseSubjects?.find(
            cs => cs.subject.toString() === addSubjectDto.subjectId
        );

        if (existingSubject) {
            throw new BadRequestException('Этот предмет уже добавлен к курсу');
        }

        // Добавляем предмет к курсу
        const updatedCourse = await this.coursesService.addSubjectToCourse(courseId, {
            subjectId: addSubjectDto.subjectId,
            teacherId: addSubjectDto.teacherId,
            startDate: addSubjectDto.startDate
        });

        return {
            message: 'Предмет успешно добавлен к курсу',
            course: updatedCourse
        };
    }

    /**
     * GET /courses/:courseId/subjects - Получение предметов курса
     */
    @Get()
    @ApiOperation({
        summary: 'Получение предметов курса',
        description: 'Возвращает список всех предметов курса с назначенными преподавателями'
    })
    async getCourseSubjects(@Param('courseId') courseId: string) {
        this.logger.log(`Получение предметов курса ${courseId}`);

        const course = await this.coursesService.findByIdWithSubjects(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        return {
            courseId: course._id,
            courseName: course.title,
            subjects: course.courseSubjects
        };
    }

    /**
     * DELETE /courses/:courseId/subjects/:subjectId - Удаление предмета из курса
     */
    @Delete(':subjectId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Удаление предмета из курса',
        description: 'Удаляет предмет из курса'
    })
    async removeSubjectFromCourse(
        @Param('courseId') courseId: string,
        @Param('subjectId') subjectId: string,
        @Request() req
    ) {
        const currentUserId = req.user.userId;
        const isAdmin = req.user.roles?.includes('admin');

        this.logger.log(`Удаление предмета ${subjectId} из курса ${courseId}`);

        const course = await this.coursesService.findById(courseId);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверяем права доступа
        if (!isAdmin && course.mainTeacher?.toString() !== currentUserId) {
            throw new ForbiddenException('У вас нет прав для удаления предметов из этого курса');
        }

        const updatedCourse = await this.coursesService.removeSubjectFromCourse(courseId, subjectId);

        return {
            message: 'Предмет успешно удален из курса',
            course: updatedCourse
        };
    }
}