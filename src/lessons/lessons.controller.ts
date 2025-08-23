// src/lessons/lessons.controller.ts
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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
    private readonly logger = new Logger(LessonsController.name);

    constructor(private readonly lessonsService: LessonsService) { }

    @Post()
    @ApiOperation({
        summary: 'Создание нового урока',
        description: 'Создает новый урок и добавляет его к определенному курсу'
    })
    @ApiResponse({ status: 201, description: 'Урок успешно создан' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async createLesson(
        @Body() createLessonDto: CreateLessonDto,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Создание урока: ${createLessonDto.title} для курса ${createLessonDto.courseId}`);

        const lesson = await this.lessonsService.create(createLessonDto, currentUserId, isAdmin);

        return {
            message: 'Урок успешно создан',
            lesson: lesson
        };
    }

    @Get('course/:courseId')
    @ApiOperation({
        summary: 'Получение всех уроков курса',
        description: 'Возвращает список всех уроков курса в правильном порядке'
    })
    @ApiParam({ name: 'courseId', description: 'ID курса' })
    @ApiQuery({
        name: 'includeUnpublished',
        required: false,
        type: Boolean,
        description: 'Включать ли неопубликованные уроки (только для преподавателей и админов)'
    })
    @ApiResponse({ status: 200, description: 'Список уроков курса' })
    @ApiResponse({ status: 404, description: 'Курс не найден' })
    async getLessonsByCourse(
        @Param('courseId') courseId: string,
        @Query('includeUnpublished') includeUnpublished: boolean = false,
        @Request() req?
    ) {
        const isAdmin = true; // Временно для работы без JWT
        const isTeacher = true; // Временно для работы без JWT

        this.logger.log(`Получение уроков курса ${courseId}`);

        const showUnpublished = includeUnpublished && (isAdmin || isTeacher);
        const lessons = await this.lessonsService.findByCourse(courseId, showUnpublished);

        return {
            courseId: courseId,
            lessons: lessons,
            totalLessons: lessons.length
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Получение урока по ID',
        description: 'Возвращает подробную информацию об уроке'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Данные урока' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async getLessonById(@Param('id') id: string) {
        this.logger.log(`Запрос урока с ID: ${id}`);

        const lesson = await this.lessonsService.findById(id);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        return { lesson };
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Обновление урока',
        description: 'Обновляет данные урока. Преподаватель может редактировать только уроки своих курсов.'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Урок успешно обновлен' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async updateLesson(
        @Param('id') id: string,
        @Body() updateLessonDto: UpdateLessonDto,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Обновление урока с ID: ${id}`);

        const updatedLesson = await this.lessonsService.update(id, updateLessonDto, currentUserId, isAdmin);

        return {
            message: 'Урок успешно обновлен',
            lesson: updatedLesson
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Удаление урока',
        description: 'Удаляет урок и все связанные с ним домашние задания'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Урок успешно удален' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async deleteLesson(
        @Param('id') id: string,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Удаление урока с ID: ${id}`);

        await this.lessonsService.delete(id, currentUserId, isAdmin);

        return {
            message: 'Урок успешно удален'
        };
    }

    @Post(':id/publish')
    @ApiOperation({
        summary: 'Публикация или снятие с публикации урока',
        description: 'Изменяет статус публикации урока'
    })
    @ApiParam({ name: 'id', description: 'ID урока' })
    @ApiResponse({ status: 200, description: 'Статус публикации изменен' })
    @ApiResponse({ status: 404, description: 'Урок не найден' })
    async publishLesson(
        @Param('id') id: string,
        @Body('isPublished') isPublished: boolean,
        @Request() req?
    ) {
        const currentUserId = 'temp-user-id'; // Временно для работы без JWT
        const isAdmin = true; // Временно для работы без JWT

        this.logger.log(`Изменение статуса публикации урока ${id} на ${isPublished}`);

        const lesson = await this.lessonsService.updatePublishStatus(id, isPublished, currentUserId, isAdmin);

        return {
            message: isPublished
                ? 'Урок успешно опубликован'
                : 'Урок снят с публикации',
            lesson: lesson
        };
    }

    @Get(':id/next')
    @ApiOperation({
        summary: 'Получение следующего урока в курсе',
        description: 'Возвращает следующий урок в порядке изучения'
    })
    @ApiParam({ name: 'id', description: 'ID текущего урока' })
    @ApiResponse({ status: 200, description: 'Следующий урок' })
    @ApiResponse({ status: 404, description: 'Следующий урок не найден' })
    async getNextLesson(@Param('id') currentLessonId: string) {
        this.logger.log(`Получение следующего урока после ${currentLessonId}`);

        const nextLesson = await this.lessonsService.getNextLesson(currentLessonId);

        if (!nextLesson) {
            return {
                message: 'Это последний урок в курсе',
                nextLesson: null
            };
        }

        return {
            nextLesson: nextLesson
        };
    }

    @Get(':id/previous')
    @ApiOperation({
        summary: 'Получение предыдущего урока в курсе',
        description: 'Возвращает предыдущий урок в порядке изучения'
    })
    @ApiParam({ name: 'id', description: 'ID текущего урока' })
    @ApiResponse({ status: 200, description: 'Предыдущий урок' })
    @ApiResponse({ status: 404, description: 'Предыдущий урок не найден' })
    async getPreviousLesson(@Param('id') currentLessonId: string) {
        this.logger.log(`Получение предыдущего урока перед ${currentLessonId}`);

        const previousLesson = await this.lessonsService.getPreviousLesson(currentLessonId);

        if (!previousLesson) {
            return {
                message: 'Это первый урок в курсе',
                previousLesson: null
            };
        }

        return {
            previousLesson: previousLesson
        };
    }
}

