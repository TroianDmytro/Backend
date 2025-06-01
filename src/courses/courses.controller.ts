// src/courses/courses.controller.ts
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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('courses')
@Controller('courses')
// @UseGuards(JwtAuthGuard) // Закомментировано для работы без JWT
// @ApiBearerAuth()
export class CoursesController {
    private readonly logger = new Logger(CoursesController.name);

    constructor(private readonly coursesService: CoursesService) { }

    /**
     * POST /courses - Создание нового курса
     */
    @Post()
    // @UseGuards(RolesGuard)
    // @Roles('admin', 'teacher') // Только админы и преподаватели могут создавать курсы
    @ApiOperation({
        summary: 'Создание нового курса',
        description: 'Создает новый курс. Только одобренные преподаватели могут создавать курсы.'
    })
    @ApiResponse({
        status: 201,
        description: 'Курс успешно создан',
        type: CourseResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 403, description: 'Нет прав на создание курса' })
    @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
    @ApiBody({ type: CreateCourseDto })
    async createCourse(
        @Body() createCourseDto: CreateCourseDto,
        @Request() req?
    ) {
        // const currentUserId = req?.user?.userId;
        // const isAdmin = req?.user?.roles?.includes('admin');
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Создание курса: ${createCourseDto.title}`);

        // Если не админ, преподаватель может создать курс только для себя
        // if (!isAdmin && createCourseDto.teacherId !== currentUserId) {
        //     throw new ForbiddenException('Вы можете создавать курсы только для себя');
        // }

        const course = await this.coursesService.create(createCourseDto);

        return {
            message: 'Курс успешно создан',
            course: course
        };
    }

    /**
     * GET /courses - Получение списка курсов с фильтрацией
     */
    @Get()
    @ApiOperation({
        summary: 'Получение списка курсов',
        description: 'Возвращает список курсов с возможностью фильтрации и поиска'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы (по умолчанию 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице (по умолчанию 10)' })
    @ApiQuery({ name: 'category', required: false, type: String, description: 'Фильтр по категории' })
    @ApiQuery({ name: 'difficulty_level', required: false, enum: ['beginner', 'intermediate', 'advanced'], description: 'Фильтр по уровню сложности' })
    @ApiQuery({ name: 'teacherId', required: false, type: String, description: 'Фильтр по преподавателю' })
    @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Минимальная цена' })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Максимальная цена' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Язык курса' })
    @ApiQuery({ name: 'isPublished', required: false, type: Boolean, description: 'Только опубликованные курсы' })
    @ApiQuery({ name: 'isFeatured', required: false, type: Boolean, description: 'Только рекомендуемые курсы' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Поиск по названию и описанию' })
    @ApiQuery({ name: 'tag', required: false, type: String, description: 'Поиск по тегам' })
    @ApiResponse({
        status: 200,
        description: 'Список курсов',
        type: [CourseResponseDto]
    })
    async getAllCourses(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query() filters: CourseFilterDto,
        @Request() req?
    ) {
        // const isAdmin = req?.user?.roles?.includes('admin');
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Запрос списка курсов. Страница: ${page}, Лимит: ${limit}`);

        // Обычные пользователи видят только опубликованные и активные курсы
        if (!isAdmin) {
            filters.isPublished = true;
            filters.isActive = true;
        }

        const result = await this.coursesService.findAll(filters, page, limit);

        return {
            courses: result.courses,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            },
            filters: filters
        };
    }

    /**
     * GET /courses/:id - Получение курса по ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Получение курса по ID',
        description: 'Возвращает подробную информацию о курсе включая уроки'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiResponse({
        status: 200,
        description: 'Данные курса',
        type: CourseResponseDto
    })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async getCourseById(
        @Param('id') id: string,
        @Query('includeLessons') includeLessons: boolean = false
    ) {
        this.logger.log(`Запрос курса с ID: ${id}`);

        const course = await this.coursesService.findById(id, includeLessons);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        return { course };
    }

    /**
     * PUT /courses/:id - Обновление курса
     */
    @Put(':id')
    // @UseGuards(RolesGuard)
    // @Roles('admin', 'teacher')
    @ApiOperation({
        summary: 'Обновление курса',
        description: 'Обновляет данные курса. Преподаватель может редактировать только свои курсы.'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiBody({ type: UpdateCourseDto })
    @ApiResponse({
        status: 200,
        description: 'Курс успешно обновлен',
        type: CourseResponseDto
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 403, description: 'Нет прав на редактирование' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async updateCourse(
        @Param('id') id: string,
        @Body() updateCourseDto: UpdateCourseDto,
        @Request() req?
    ) {
        // const currentUserId = req?.user?.userId;
        // const isAdmin = req?.user?.roles?.includes('admin');
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Обновление курса с ID: ${id}`);

        // Проверяем права доступа
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // if (!isAdmin && course.teacherId.toString() !== currentUserId) {
        //     throw new ForbiddenException('У вас нет прав на редактирование этого курса');
        // }

        const updatedCourse = await this.coursesService.update(id, updateCourseDto);

        return {
            message: 'Курс успешно обновлен',
            course: updatedCourse
        };
    }

    /**
     * DELETE /courses/:id - Удаление курса
     */
    @Delete(':id')
    // @UseGuards(RolesGuard)
    // @Roles('admin', 'teacher')
    @ApiOperation({
        summary: 'Удаление курса',
        description: 'Удаляет курс и все связанные с ним уроки. Нельзя удалить курс с активными подписками.'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiResponse({ status: 200, description: 'Курс успешно удален' })
    @ApiResponse({ status: 403, description: 'Нет прав на удаление' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    @ApiResponse({ status: 409, description: 'Нельзя удалить курс с активными подписками' })
    async deleteCourse(
        @Param('id') id: string,
        @Request() req?
    ) {
        // const currentUserId = req?.user?.userId;
        // const isAdmin = req?.user?.roles?.includes('admin');
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Удаление курса с ID: ${id}`);

        // Проверяем права доступа
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // if (!isAdmin && course.teacherId.toString() !== currentUserId) {
        //     throw new ForbiddenException('У вас нет прав на удаление этого курса');
        // }

        await this.coursesService.delete(id);

        return {
            message: 'Курс успешно удален'
        };
    }

    /**
     * POST /courses/:id/publish - Публикация/снятие с публикации курса
     */
    @Post(':id/publish')
    // @UseGuards(RolesGuard)
    // @Roles('admin', 'teacher')
    @ApiOperation({
        summary: 'Публикация или снятие с публикации курса',
        description: 'Изменяет статус публикации курса'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                isPublished: { type: 'boolean' }
            },
            required: ['isPublished']
        }
    })
    @ApiResponse({ status: 200, description: 'Статус публикации изменен' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async publishCourse(
        @Param('id') id: string,
        @Body('isPublished') isPublished: boolean,
        @Request() req?
    ) {
        // const currentUserId = req?.user?.userId;
        // const isAdmin = req?.user?.roles?.includes('admin');
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Изменение статуса публикации курса ${id} на ${isPublished}`);

        const course = await this.coursesService.updatePublishStatus(id, isPublished);

        return {
            message: isPublished
                ? 'Курс успешно опубликован'
                : 'Курс снят с публикации',
            course: course
        };
    }

    /**
     * GET /courses/:id/lessons - Получение уроков курса
     */
    @Get(':id/lessons')
    @ApiOperation({
        summary: 'Получение уроков курса',
        description: 'Возвращает список всех уроков курса в правильном порядке'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiResponse({ status: 200, description: 'Список уроков курса' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async getCourseLessons(@Param('id') id: string) {
        this.logger.log(`Получение уроков курса с ID: ${id}`);

        const lessons = await this.coursesService.getCourseLessons(id);

        return {
            courseId: id,
            lessons: lessons,
            totalLessons: lessons.length
        };
    }

    /**
     * GET /courses/:id/statistics - Получение статистики курса
     */
    @Get(':id/statistics')
    // @UseGuards(RolesGuard)
    // @Roles('admin', 'teacher')
    @ApiOperation({
        summary: 'Получение статистики курса',
        description: 'Возвращает статистику по студентам, урокам и доходам курса'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiResponse({ status: 200, description: 'Статистика курса' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async getCourseStatistics(@Param('id') id: string) {
        this.logger.log(`Получение статистики курса с ID: ${id}`);

        const statistics = await this.coursesService.getCourseStatistics(id);

        return {
            courseId: id,
            statistics: statistics
        };
    }

    /**
     * GET /courses/featured - Получение рекомендуемых курсов
     */
    @Get('featured/list')
    @ApiOperation({
        summary: 'Получение рекомендуемых курсов',
        description: 'Возвращает список рекомендуемых курсов'
    })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество курсов (по умолчанию 6)' })
    @ApiResponse({
        status: 200,
        description: 'Список рекомендуемых курсов',
        type: [CourseResponseDto]
    })
    async getFeaturedCourses(@Query('limit') limit: number = 6) {
        this.logger.log(`Получение рекомендуемых курсов. Лимит: ${limit}`);

        const courses = await this.coursesService.getFeaturedCourses(limit);

        return {
            courses: courses,
            totalCourses: courses.length
        };
    }

    /**
     * GET /courses/popular - Получение популярных курсов
     */
    @Get('popular/list')
    @ApiOperation({
        summary: 'Получение популярных курсов',
        description: 'Возвращает список популярных курсов по количеству студентов и рейтингу'
    })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество курсов (по умолчанию 10)' })
    @ApiResponse({
        status: 200,
        description: 'Список популярных курсов',
        type: [CourseResponseDto]
    })
    async getPopularCourses(@Query('limit') limit: number = 10) {
        this.logger.log(`Получение популярных курсов. Лимит: ${limit}`);

        const courses = await this.coursesService.getPopularCourses(limit);

        return {
            courses: courses,
            totalCourses: courses.length
        };
    }

    /**
     * GET /courses/categories - Получение списка категорий
     */
    @Get('categories/list')
    @ApiOperation({
        summary: 'Получение списка категорий курсов',
        description: 'Возвращает список всех доступных категорий с количеством курсов в каждой'
    })
    @ApiResponse({ status: 200, description: 'Список категорий курсов' })
    async getCategories() {
        this.logger.log('Получение списка категорий курсов');

        const categories = await this.coursesService.getCategories();

        return {
            categories: categories
        };
    }

    /**
     * POST /courses/:id/enroll - Записаться на курс (создать подписку)
     */
    @Post(':id/enroll')
    // @UseGuards(RolesGuard)
    // @Roles('user')
    @ApiOperation({
        summary: 'Записаться на курс',
        description: 'Создает подписку пользователя на курс'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiResponse({ status: 201, description: 'Успешная запись на курс' })
    @ApiResponse({ status: 400, description: 'Курс недоступен для записи' })
    @ApiResponse({ status: 409, description: 'Пользователь уже записан на этот курс' })
    async enrollInCourse(
        @Param('id') courseId: string,
        @Request() req?
    ) {
        // const userId = req?.user?.userId;
        const userId = 'temp-user-id'; // Временно для работы без JWT

        this.logger.log(`Пользователь ${userId} записывается на курс ${courseId}`);

        const enrollment = await this.coursesService.enrollStudent(courseId, userId);

        return {
            message: 'Вы успешно записались на курс',
            enrollment: enrollment
        };
    }

    /**
     * GET /courses/:id/students - Получение списка студентов курса
     */
    @Get(':id/students')
    // @UseGuards(RolesGuard)
    // @Roles('admin', 'teacher')
    @ApiOperation({
        summary: 'Получение списка студентов курса',
        description: 'Возвращает список студентов, записанных на курс'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
    @ApiResponse({ status: 200, description: 'Список студентов курса' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async getCourseStudents(
        @Param('id') id: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20
    ) {
        this.logger.log(`Получение списка студентов курса с ID: ${id}`);

        const result = await this.coursesService.getCourseStudents(id, page, limit);

        return {
            courseId: id,
            students: result.students,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * POST /courses/:id/duplicate - Дублирование курса
     */
    @Post(':id/duplicate')
    // @UseGuards(RolesGuard)
    // @Roles('admin', 'teacher')
    @ApiOperation({
        summary: 'Дублирование курса',
        description: 'Создает копию курса со всеми уроками'
    })
    @ApiParam({ name: 'id', description: 'ID курса для дублирования' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Новое название курса' }
            },
            required: ['title']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Курс успешно дублирован',
        type: CourseResponseDto
    })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async duplicateCourse(
        @Param('id') id: string,
        @Body('title') newTitle: string,
        @Request() req?
    ) {
        // const currentUserId = req?.user?.userId;
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT

        this.logger.log(`Дублирование курса ${id} с новым названием: ${newTitle}`);

        const duplicatedCourse = await this.coursesService.duplicateCourse(id, newTitle, currentUserId);

        return {
            message: 'Курс успешно дублирован',
            originalCourseId: id,
            duplicatedCourse: duplicatedCourse
        };
    }
}