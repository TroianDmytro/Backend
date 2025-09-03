// src/teachers/teachers.controller.ts
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
    BadRequestException
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherApprovalDto } from './dto/teacher-approval.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { TeacherResponseDto } from './dto/teacher-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CourseDocument } from 'src/courses/schemas/course.schema';

@ApiTags('teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard) // Закомментировано для работы без JWT
@ApiBearerAuth()
export class TeachersController {
    private readonly logger = new Logger(TeachersController.name);

    constructor(private readonly teachersService: TeachersService) { }

    /**
     * POST /teachers - Создание заявки на регистрацию преподавателя
     * Доступно всем для подачи заявки
     */
    @Post()
    @ApiOperation({
        summary: 'Подача заявки на регистрацию преподавателя',
        description: 'Создает заявку на регистрацию преподавателя. Статус заявки будет "pending" до одобрения администратором.'
    })
    @ApiResponse({
        status: 201,
        description: 'Заявка успешно подана',
        type: TeacherResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Преподаватель с таким email уже существует' })
    @ApiBody({ type: CreateTeacherDto })
    async createTeacherApplication(@Body() createTeacherDto: CreateTeacherDto) {
        this.logger.log(`Подача заявки на регистрацию преподавателя: ${createTeacherDto.email}`);

        const teacher = await this.teachersService.createApplication(createTeacherDto);

        return {
            message: 'Заявка на регистрацию преподавателя успешно подана. Ожидайте одобрения администратора.',
            teacher: teacher
        };
    }

    /**
     * GET /teachers - Получение списка всех преподавателей
     */
    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin', 'user') // Пользователи могут видеть только одобренных преподавателей
    @ApiOperation({ summary: 'Получение списка преподавателей' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['pending', 'approved', 'rejected', 'all'],
        description: 'Фильтр по статусу (только для админов)'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество элементов на странице (по умолчанию 10)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список преподавателей',
        type: [TeacherResponseDto]
    })
    async getAllTeachers(
        @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'all',
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Request() req?
    ) {
        // Определяем права пользователя
        // const isAdmin = req?.user?.roles?.includes('admin');
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Запрос списка преподавателей. Статус: ${status}, Страница: ${page}, Лимит: ${limit}`);

        // Обычные пользователи видят только одобренных преподавателей
        const filterStatus = isAdmin ? status || 'all' : 'approved';

        const result = await this.teachersService.findAll(filterStatus, page, limit);

        return {
            teachers: result.teachers,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /teachers/:id - Получение преподавателя по ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Получение преподавателя по ID' })
    @ApiParam({ name: 'id', description: 'ID преподавателя' })
    @ApiResponse({
        status: 200,
        description: 'Данные преподавателя',
        type: TeacherResponseDto
    })
    @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
    async getTeacherById(@Param('id') id: string) {
        this.logger.log(`Запрос преподавателя с ID: ${id}`);

        const teacher = await this.teachersService.findById(id);
        if (!teacher) {
            throw new NotFoundException('Преподаватель не найден');
        }

        return { teacher };
    }

    /**
     * PUT /teachers/:id - Обновление данных преподавателя
     */
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher') // Преподаватель может редактировать только свой профиль
    @ApiOperation({ summary: 'Обновление данных преподавателя' })
    @ApiParam({ name: 'id', description: 'ID преподавателя' })
    @ApiBody({ type: UpdateTeacherDto })
    @ApiResponse({
        status: 200,
        description: 'Данные преподавателя успешно обновлены',
        type: TeacherResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 403, description: 'Нет прав на редактирование' })
    @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
    async updateTeacher(
        @Param('id') id: string,
        @Body() updateTeacherDto: UpdateTeacherDto,
        @Request() req?
    ) {
        // Проверяем права доступа
        // const isAdmin = req?.user?.roles?.includes('admin');
        // const isOwner = req?.user?.userId === id;
        const isAdmin = true; // Временно для работы без JWT
        const isOwner = true; // Временно для работы без JWT

        // if (!isAdmin && !isOwner) {
        //     throw new ForbiddenException('У вас нет прав на редактирование данных этого преподавателя');
        // }

        this.logger.log(`Обновление данных преподавателя с ID: ${id}`);

        const updatedTeacher = await this.teachersService.update(id, updateTeacherDto);

        return {
            message: 'Данные преподавателя успешно обновлены',
            teacher: updatedTeacher
        };
    }

    /**
     * POST /teachers/:id/approve - Одобрение/отклонение заявки преподавателя (только админ)
     */
    @Post(':id/approve')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Одобрение или отклонение заявки преподавателя',
        description: 'Только администраторы могут одобрять или отклонять заявки на регистрацию преподавателей'
    })
    @ApiParam({ name: 'id', description: 'ID преподавателя' })
    @ApiBody({ type: TeacherApprovalDto })
    @ApiResponse({ status: 200, description: 'Статус заявки изменен' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
    async approveTeacher(
        @Param('id') id: string,
        @Body() approvalDto: TeacherApprovalDto,
        @Request() req?
    ) {
        const adminId = req?.user?.userId;
        // const adminId = 'temp-admin-id'; // Временно для работы без JWT

        this.logger.log(`Администратор изменяет статус заявки преподавателя ${id} на ${approvalDto.approvalStatus}`);

        if (approvalDto.approvalStatus === 'rejected' && !approvalDto.rejectionReason) {
            throw new BadRequestException('При отклонении заявки необходимо указать причину');
        }

        const result = await this.teachersService.approveApplication(
            id,
            approvalDto.approvalStatus,
            adminId,
            approvalDto.rejectionReason
        );

        return {
            message: approvalDto.approvalStatus === 'approved'
                ? 'Заявка преподавателя одобрена'
                : 'Заявка преподавателя отклонена',
            teacher: result
        };
    }

    /**
     * POST /teachers/:teacherId/courses/:courseId - Назначение курса преподавателю
     */
    @Post(':teacherId/courses/:courseId')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Назначение курса преподавателю',
        description: 'Закрепляет курс за выбранным преподавателем'
    })
    @ApiParam({ name: 'teacherId', description: 'ID преподавателя' })
    @ApiParam({ name: 'courseId', description: 'ID курса' })
    @ApiResponse({ status: 200, description: 'Курс успешно назначен преподавателю' })
    @ApiResponse({ status: 404, description: 'Преподаватель или курс не найден' })
    @ApiResponse({ status: 409, description: 'Курс уже назначен этому преподавателю' })
    async assignCourseToTeacher(
        @Param('teacherId') teacherId: string,
        @Param('courseId') courseId: string
    ) {
        this.logger.log(`Назначение курса ${courseId} преподавателю ${teacherId}`);

        const result = await this.teachersService.assignCourse(teacherId, courseId);

        return {
            message: 'Курс успешно назначен преподавателю',
            teacher: result
        };
    }

    /**
     * DELETE /teachers/:teacherId/courses/:courseId - Удаление курса у преподавателя
     */
    @Delete(':teacherId/courses/:courseId')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Удаление курса у преподавателя',
        description: 'Убирает назначение курса у преподавателя'
    })
    @ApiParam({ name: 'teacherId', description: 'ID преподавателя' })
    @ApiParam({ name: 'courseId', description: 'ID курса' })
    @ApiResponse({ status: 200, description: 'Курс успешно удален у преподавателя' })
    @ApiResponse({ status: 404, description: 'Преподаватель или курс не найден' })
    async removeCourseFromTeacher(
        @Param('teacherId') teacherId: string,
        @Param('courseId') courseId: string
    ) {
        this.logger.log(`Удаление курса ${courseId} у преподавателя ${teacherId}`);

        const result = await this.teachersService.removeCourse(teacherId, courseId);

        return {
            message: 'Курс успешно удален у преподавателя',
            teacher: result
        };
    }

    /**
     * DELETE /teachers/:id - Удаление заявки/профиля преподавателя
     */
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Удаление заявки или профиля преподавателя',
        description: 'Полностью удаляет заявку или профиль преподавателя из системы. Также удаляет связанные курсы если они есть.'
    })
    @ApiParam({ name: 'id', description: 'ID преподавателя' })
    @ApiResponse({ status: 200, description: 'Преподаватель успешно удален' })
    @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
    @ApiResponse({ status: 409, description: 'Нельзя удалить преподавателя с активными курсами' })
    async deleteTeacher(@Param('id') id: string) {
        this.logger.log(`Удаление преподавателя с ID: ${id}`);

        await this.teachersService.delete(id);

        return {
            message: 'Преподаватель успешно удален'
        };
    }




    /**
     * GET /teachers/pending/applications - Получение заявок на рассмотрение
     */
    @Get('pending/applications')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Получение заявок на рассмотрение',
        description: 'Возвращает список всех заявок на регистрацию преподавателей со статусом "pending"'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество элементов на странице (по умолчанию 10)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список заявок на рассмотрение',
        type: [TeacherResponseDto]
    })
    async getPendingApplications(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        this.logger.log(`Получение заявок на рассмотрение. Страница: ${page}, Лимит: ${limit}`);

        const result = await this.teachersService.findAll('pending', page, limit);

        return {
            applications: result.teachers,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /teachers/:id/statistics - Получение статистики преподавателя
     */
    @Get(':id/statistics')
    @ApiOperation({
        summary: 'Получение статистики преподавателя',
        description: 'Возвращает статистику по курсам, студентам и оценкам преподавателя'
    })
    @ApiParam({ name: 'id', description: 'ID преподавателя' })
    @ApiResponse({ status: 200, description: 'Статистика преподавателя' })
    @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
    async getTeacherStatistics(@Param('id') id: string) {
        this.logger.log(`Получение статистики преподавателя с ID: ${id}`);

        const statistics = await this.teachersService.getTeacherStatistics(id);

        return {
            teacherId: id,
            statistics: statistics
        };
    }

    /**
     * POST /teachers/:id/block - Блокировка/разблокировка преподавателя
     */
    @Post(':id/block')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Блокировка или разблокировка преподавателя',
        description: 'Изменяет статус блокировки преподавателя'
    })
    @ApiParam({ name: 'id', description: 'ID преподавателя' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                isBlocked: { type: 'boolean' },
                reason: { type: 'string', description: 'Причина блокировки' }
            },
            required: ['isBlocked']
        }
    })
    @ApiResponse({ status: 200, description: 'Статус блокировки изменен' })
    @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
    async blockTeacher(
        @Param('id') id: string,
        @Body('isBlocked') isBlocked: boolean,
        @Body('reason') reason?: string
    ) {
        this.logger.log(`Изменение статуса блокировки преподавателя ${id} на ${isBlocked}`);

        const teacher = await this.teachersService.blockTeacher(id, isBlocked, reason);

        return {
            message: isBlocked
                ? 'Преподаватель успешно заблокирован'
                : 'Преподаватель успешно разблокирован',
            teacher: teacher
        };
    }

    /**
     * GET /teachers/:id/courses - Получение курсов преподавателя
     */
    @Get(':id/courses')
    @ApiOperation({
        summary: 'Получение курсов преподавателя',
        description: 'Возвращает список всех курсов с полной информацией'
    })
    async getTeacherCourses(@Param('id') id: string) {
        this.logger.log(`Получение курсов преподавателя с ID: ${id}`);

        const teacher = await this.teachersService.findById(id);
        if (!teacher) {
            throw new NotFoundException('Преподаватель не найден');
        }

        // Получаем назначенные курсы
        const courses = teacher.assignedCourses as CourseDocument[] || [];

        return {
            teacherId: id,
            courses: courses,
            totalCourses: courses.length,
            publishedCourses: courses.filter(c => c.isPublished).length,
            activeCourses: courses.filter(c => c.isActive).length
        };
    }
}