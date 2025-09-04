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
    ForbiddenException,
    DefaultValuePipe,
    ParseIntPipe,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TeachersService } from 'src/teachers/teachers.service';
import { CourseFilterDto } from './dto/course-filter.dto';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
    private readonly logger = new Logger(CoursesController.name);

    constructor(private readonly coursesService: CoursesService, private readonly teachersService: TeachersService) { }

    // ШАГ 1: Добавить предмет к курсу (без преподавателя и даты)
    @Post(':id/subjects')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Шаг 1: Добавить предмет к курсу', description: 'Добавляет предмет без назначения преподавателя и даты' })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { subjectId: { type: 'string', description: 'ID предмета' } },
            required: ['subjectId']
        }
    })
    async addCourseSubject(
        @Param('id') courseId: string,
        @Body() body: { subjectId: string },
        @Request() req: any
    ) {
        const userId = req.user?.userId || req.user?.id;
        const isAdmin = req.user?.roles?.includes('admin') || false;
        const updatedCourse = await this.coursesService.addSubject(
            courseId,
            body.subjectId,
            userId,
            isAdmin
        );
        return { success: true, message: 'Предмет добавлен (шаг 1)', course: updatedCourse };
    }

    // ШАГ 2: Назначить / изменить преподавателя предмета
    @Put(':id/subjects/:subjectId/teacher')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Шаг 2: Назначить преподавателя предмету', description: 'Присваивает или изменяет преподавателя для предмета курса' })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiParam({ name: 'subjectId', description: 'ID предмета' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { teacherId: { type: 'string', description: 'ID преподавателя' } },
            required: ['teacherId']
        }
    })
    async setCourseSubjectTeacher(
        @Param('id') courseId: string,
        @Param('subjectId') subjectId: string,
        @Body() body: { teacherId: string },
        @Request() req: any
    ) {
        const userId = req.user?.userId || req.user?.id;
        const isAdmin = req.user?.roles?.includes('admin') || false;
        const updatedCourse = await this.coursesService.setSubjectTeacher(
            courseId,
            subjectId,
            body.teacherId,
            userId,
            isAdmin
        );
        return { success: true, message: 'Преподаватель назначен (шаг 2)', course: updatedCourse };
    }

    // ШАГ 3: Установить / изменить дату начала предмета
    @Put(':id/subjects/:subjectId/start-date')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Шаг 3: Установить дату начала предмета', description: 'Устанавливает или изменяет дату начала предмета курса' })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiParam({ name: 'subjectId', description: 'ID предмета' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { startDate: { type: 'string', format: 'date-time', description: 'Дата начала' } },
            required: ['startDate']
        }
    })
    async setCourseSubjectStartDate(
        @Param('id') courseId: string,
        @Param('subjectId') subjectId: string,
        @Body() body: { startDate: string },
        @Request() req: any
    ) {
        const userId = req.user?.userId || req.user?.id;
        const isAdmin = req.user?.roles?.includes('admin') || false;
        const updatedCourse = await this.coursesService.setSubjectStartDate(
            courseId,
            subjectId,
            new Date(body.startDate),
            userId,
            isAdmin
        );
        return { success: true, message: 'Дата начала установлена (шаг 3)', course: updatedCourse };
    }

    // ===== создание курса =====
    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Создать курс', description: 'Создает новый курс (преподаватель может создать курс только для себя)' })
    @ApiBody({ type: CreateCourseDto })
    @ApiResponse({ status: 201, description: 'Курс создан', type: CourseResponseDto })
    @ApiResponse({ status: 403, description: 'Нет прав создавать курс для другого преподавателя' })
    async createCourse(
        @Body() createCourseDto: CreateCourseDto,
        @Request() req?: any
    ) {
        const currentUserId = req?.user?.userId;
        const isAdmin = req?.user?.roles?.includes('admin');

        this.logger.log(`Создание курса: ${createCourseDto.title}`);

        if (!isAdmin && createCourseDto.teacherId && createCourseDto.teacherId !== currentUserId) {
            throw new ForbiddenException('Вы можете создавать курсы только для себя');
        }

        const course = await this.coursesService.create(createCourseDto);
        return { message: 'Курс успешно создан', course };
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
    const isAdmin = req?.user?.roles?.includes('admin');

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

        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        return { course };
    }

    /**
     * PUT /courses/:id - Обновление курса
     */
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
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
    const currentUserId = req?.user?.userId;
    const isAdmin = req?.user?.roles?.includes('admin');

        this.logger.log(`Обновление курса с ID: ${id}`);

        // Проверяем права доступа
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        if (!isAdmin && course.mainTeacher?.toString() !== currentUserId) {
            throw new ForbiddenException('У вас нет прав на редактирование этого курса');
        }

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
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
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
    const currentUserId = req?.user?.userId;
    const isAdmin = req?.user?.roles?.includes('admin');

        this.logger.log(`Удаление курса с ID: ${id}`);

        // Проверяем права доступа
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        if (!isAdmin && course.mainTeacher?.toString() !== currentUserId) {
            throw new ForbiddenException('У вас нет прав на удаление этого курса');
        }

        await this.coursesService.delete(id);

        return {
            message: 'Курс успешно удален'
        };
    }

    /**
     * POST /courses/:id/publish - Публикация/снятие с публикации курса
     */
    @Post(':id/publish')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
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
    const currentUserId = req?.user?.userId;
    const isAdmin = req?.user?.roles?.includes('admin');

        this.logger.log(`Изменение статуса публикации курса ${id} на ${isPublished}`);

        // Получаем курс для проверки владельца
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new NotFoundException('Курс не найден');
        }

        // Проверка прав доступа
        const isOwner = course.mainTeacher?.toString() === currentUserId;

        if (!isAdmin && !isOwner) {
            this.logger.warn(
                `Отказано в доступе. Пользователь ${req?.user?.email} ` +
                `(ID: ${currentUserId}) пытается изменить статус публикации курса ${id}. ` +
                `Владелец курса: ${course.mainTeacher}`
            );
            throw new ForbiddenException(
                'У вас нет прав на изменение статуса публикации этого курса. ' +
                'Только владелец курса или администратор могут изменять статус публикации.'
            );
        }

        // Дополнительная проверка для преподавателей (исправлено: корректно получаем mainTeacher)
        if (!isAdmin && isOwner) {
            const mainTeacherId = course.mainTeacher?.toString();
            if (!mainTeacherId) {
                throw new NotFoundException('У курса не назначен преподаватель');
            }

            const teacher = await this.teachersService.findById(mainTeacherId);
            if (!teacher) {
                throw new NotFoundException('Преподаватель не найден');
            }

            if (teacher.isApproved === false) {
                throw new ForbiddenException('Преподаватель не подтвержден');
            }

            if (teacher.isBlocked) {
                throw new ForbiddenException('Преподаватель заблокирован');
            }
        }

        // Выполняем изменение статуса публикации
        const updatedCourse = await this.coursesService.updatePublishStatus(id, isPublished);

        return {
            message: isPublished
                ? 'Курс успешно опубликован'
                : 'Курс снят с публикации',
            course: updatedCourse
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
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
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
     * GET /courses/:id/students - Получение списка студентов курса
     */
    @Get(':id/students')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
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
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
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

    ////////////////////////////////////////////////////////

    /**
   * GET /courses/category/:categoryId - Получение курсов категории (карточки)
   */
    @Get('category/:categoryId')
    @ApiOperation({
        summary: 'Получение курсов категории',
        description: 'Возвращает курсы указанной категории с краткой информацией для карточек'
    })
    @ApiParam({ name: 'categoryId', description: 'ID категории' })
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
        description: 'Количество элементов на странице (по умолчанию 12)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов категории'
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async getCoursesByCategory(
        @Param('categoryId') categoryId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение курсов категории ${categoryId}. Страница: ${page}, Лимит: ${limit}`);

        const result = await this.coursesService.getCoursesByCategory(categoryId, page, limit, 'card');

        return {
            category: result.category,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /courses/category/:categoryId/full - Получение курсов категории (полная информация)
     */
    @Get('category/:categoryId/full')
    @ApiOperation({
        summary: 'Получение курсов категории с полной информацией',
        description: 'Возвращает курсы категории с подробной информацией (без админских данных)'
    })
    @ApiParam({ name: 'categoryId', description: 'ID категории' })
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
        description: 'Количество элементов на странице (по умолчанию 12)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов категории с полной информацией'
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async getCoursesByCategoryFull(
        @Param('categoryId') categoryId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение полных данных курсов категории ${categoryId}`);

        const result = await this.coursesService.getCoursesByCategory(categoryId, page, limit, 'full');

        return {
            category: result.category,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /courses/category/:categoryId/admin - Получение курсов категории (админская информация)
     */
    @Get('category/:categoryId/admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение курсов категории со всей информацией',
        description: 'Возвращает курсы категории со всей информацией (только для админов и владельцев)'
    })
    @ApiParam({ name: 'categoryId', description: 'ID категории' })
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
        description: 'Количество элементов на странице (по умолчанию 12)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов категории со всей информацией'
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async getCoursesByCategoryAdmin(
        @Param('categoryId') categoryId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение админских данных курсов категории ${categoryId}`);

        const result = await this.coursesService.getCoursesByCategory(categoryId, page, limit, 'admin');

        return {
            category: result.category,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /courses/difficulty/:difficultyLevelId - Получение курсов по уровню сложности (карточки)
     */
    @Get('difficulty/:difficultyLevelId')
    @ApiOperation({
        summary: 'Получение курсов по уровню сложности',
        description: 'Возвращает курсы указанного уровня сложности с краткой информацией для карточек'
    })
    @ApiParam({ name: 'difficultyLevelId', description: 'ID уровня сложности' })
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
        description: 'Количество элементов на странице (по умолчанию 12)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов уровня сложности'
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async getCoursesByDifficultyLevel(
        @Param('difficultyLevelId') difficultyLevelId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение курсов уровня сложности ${difficultyLevelId}. Страница: ${page}, Лимит: ${limit}`);

        const result = await this.coursesService.getCoursesByDifficultyLevel(difficultyLevelId, page, limit, 'card');

        return {
            difficultyLevel: result.difficultyLevel,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /courses/difficulty/:difficultyLevelId/full - Получение курсов по уровню сложности (полная информация)
     */
    @Get('difficulty/:difficultyLevelId/full')
    @ApiOperation({
        summary: 'Получение курсов по уровню сложности с полной информацией',
        description: 'Возвращает курсы уровня сложности с подробной информацией (без админских данных)'
    })
    @ApiParam({ name: 'difficultyLevelId', description: 'ID уровня сложности' })
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
        description: 'Количество элементов на странице (по умолчанию 12)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов уровня сложности с полной информацией'
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async getCoursesByDifficultyLevelFull(
        @Param('difficultyLevelId') difficultyLevelId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение полных данных курсов уровня сложности ${difficultyLevelId}`);

        const result = await this.coursesService.getCoursesByDifficultyLevel(difficultyLevelId, page, limit, 'full');

        return {
            difficultyLevel: result.difficultyLevel,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }

    /**
     * GET /courses/difficulty/:difficultyLevelId/admin - Получение курсов по уровню сложности (админская информация)
     */
    @Get('difficulty/:difficultyLevelId/admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Получение курсов по уровню сложности со всей информацией',
        description: 'Возвращает курсы уровня сложности со всей информацией (только для админов и владельцев)'
    })
    @ApiParam({ name: 'difficultyLevelId', description: 'ID уровня сложности' })
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
        description: 'Количество элементов на странице (по умолчанию 12)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список курсов уровня сложности со всей информацией'
    })
    @ApiResponse({ status: 404, description: 'Уровень сложности не найден' })
    async getCoursesByDifficultyLevelAdmin(
        @Param('difficultyLevelId') difficultyLevelId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number
    ) {
        this.logger.log(`Получение админских данных курсов уровня сложности ${difficultyLevelId}`);

        const result = await this.coursesService.getCoursesByDifficultyLevel(difficultyLevelId, page, limit, 'admin');

        return {
            difficultyLevel: result.difficultyLevel,
            courses: result.courses,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: limit
            }
        };
    }


    /**
     * DELETE /courses/:courseId/subjects/:subjectId - Удалить предмет из курса
     */
    @Delete(':courseId/subjects/:subjectId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Удалить предмет из курса' })
    @ApiParam({ name: 'courseId', description: 'ID курса' })
    @ApiParam({ name: 'subjectId', description: 'ID предмета' })
    @ApiResponse({ status: 200, description: 'Предмет удален из курса' })
    async removeSubjectFromCourse(
        @Param('courseId') courseId: string,
        @Param('subjectId') subjectId: string,
        @Request() req: any
    ) {
        this.logger.log(`Удаление предмета ${subjectId} из курса ${courseId}`);

        const userId = req.user?.userId || req.user?.id;
        const isAdmin = req.user?.roles?.includes('admin') || false;

        const updatedCourse = await this.coursesService.removeSubjectFromCourse(
            courseId,
            subjectId,
            userId,
            isAdmin
        );

        return {
            success: true,
            message: 'Предмет успешно удален из курса',
            course: updatedCourse
        };
    }

    /**
     * GET /courses/:id/subjects - Получить предметы курса
     */
    @Get(':id/subjects')
    @ApiOperation({
        summary: 'Получить предметы курса',
        description: 'Возвращает список всех предметов курса с назначенными преподавателями'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiResponse({ status: 200, description: 'Список предметов курса' })
    async getCourseSubjects(@Param('id') courseId: string) {
        this.logger.log(`Получение предметов курса ${courseId}`);

        const subjects = await this.coursesService.getCourseSubjects(courseId);

        return {
            success: true,
            courseId,
            subjects
        };
    }

    /**
     * POST /courses/:id/enroll - Записаться на курс
     */
    @Post(':id/enroll')
    @ApiOperation({
        summary: 'Записаться на курс',
        description: 'Записывает пользователя на курс. Проверяет даты начала и оплату.'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiResponse({ status: 200, description: 'Успешная запись на курс' })
    @ApiResponse({ status: 400, description: 'Курс уже начался или требуется оплата' })
    @ApiResponse({ status: 409, description: 'Уже записан на курс или достигнут лимит' })
    async enrollInCourse(
        @Param('id') courseId: string,
        @Request() req: any
    ) {
        const userId = req.user?.userId || req.user?.id;
        this.logger.log(`Запись пользователя ${userId} на курс ${courseId}`);

        const subscription = await this.coursesService.enrollInCourse(
            courseId,
            userId,
            false // не админ
        );

        return {
            success: true,
            message: 'Успешная запись на курс',
            subscription
        };
    }

    /**
     * POST /courses/:id/admin-enroll - Административная запись на курс
     */
    @Post(':id/admin-enroll')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Административная запись на курс',
        description: 'Может быть выполнена даже после начала курса.'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: 'ID пользователя' },
                forceEnroll: { type: 'boolean', description: 'Принудительная запись' }
            },
            required: ['userId']
        }
    })
    @ApiResponse({ status: 200, description: 'Успешная административная запись на курс' })
    @ApiResponse({ status: 409, description: 'Пользователь уже записан на курс' })
    async adminEnrollInCourse(
        @Param('id') courseId: string,
        @Body() enrollDto: { userId: string; forceEnroll?: boolean }
    ) {
        this.logger.log(`Административная запись пользователя ${enrollDto.userId} на курс ${courseId}`);

        const result = await this.coursesService.adminEnrollInCourse(courseId, enrollDto);

        return {
            success: true,
            message: 'Пользователь успешно записан на курс администратором',
            subscription: result
        };
    }

    /**
     * PUT /courses/:id/start-date - Обновление даты начала курса (только админ)
     */
    @Put(':id/start-date')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({
        summary: 'Обновление даты начала курса',
        description: 'Позволяет администратору изменить дату начала курса'
    })
    @ApiParam({ name: 'id', description: 'ID курса' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                startDate: { type: 'string', format: 'date-time' }
            },
            required: ['startDate']
        }
    })
    @ApiResponse({ status: 200, description: 'Дата начала курса успешно обновлена' })
    async updateCourseStartDate(
        @Param('id') courseId: string,
        @Body('startDate') startDate: Date
    ) {
        this.logger.log(`Обновление даты начала курса ${courseId} на ${startDate}`);

        const updatedCourse = await this.coursesService.updateStartDate(courseId, startDate);

        return {
            success: true,
            message: 'Дата начала курса успешно обновлена',
            course: updatedCourse
        };
    }

}