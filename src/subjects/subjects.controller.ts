// src/subjects/subjects.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto, AddStudyMaterialDto } from './dto/subject.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/users/schemas/user.schema';
import { UserRole } from 'src/users/enums/user-role.enum';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Subjects')
@Controller('subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubjectsController {
    private readonly logger = new Logger(SubjectsController.name);

    constructor(private readonly subjectsService: SubjectsService) { }

    /**
     * Получить все предметы
     */
    @Get()
    @Public()
    @ApiOperation({ summary: 'Получить список всех предметов' })
    @ApiResponse({ status: 200, description: 'Список предметов успешно получен' })
    async findAll() {
        this.logger.log('Получение списка всех предметов');
        return this.subjectsService.findAll();
    }

    /**
     * Получить предмет по ID
     */
    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Получить предмет по ID' })
    @ApiResponse({ status: 200, description: 'Предмет найден' })
    @ApiResponse({ status: 404, description: 'Предмет не найден' })
    async findOne(@Param('id') id: string) {
        this.logger.log(`Получение предмета с ID: ${id}`);
        return this.subjectsService.findById(id);
    }

    /**
     * Создать новый предмет (только админ)
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 201, description: 'Предмет успешно создан' })
    @ApiOperation({ summary: 'Создать новый предмет' })
    async create(@Body() createSubjectDto: CreateSubjectDto) {
        this.logger.log(`Создание нового предмета: ${createSubjectDto.name}`);
        return this.subjectsService.create(createSubjectDto);
    }

    /**
     * Обновить предмет (только админ)
     */
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Обновить предмет' })
    @ApiResponse({ status: 200, description: 'Предмет успешно обновлен' })
    async update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
        this.logger.log(`Обновление предмета с ID: ${id}`);
        return this.subjectsService.update(id, updateSubjectDto);
    }

    /**
     * Удалить предмет (только админ)
     */
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Удалить предмет' })
    @ApiResponse({ status: 200, description: 'Предмет успешно удален' })
    async remove(@Param('id') id: string) {
        this.logger.log(`Удаление предмета с ID: ${id}`);
        return this.subjectsService.remove(id);
    }

    /**
     * Получить учебные материалы предмета
     */
    @Get(':id/materials')
    @Public()
    @ApiOperation({ summary: 'Получить учебные материалы предмета' })
    @ApiResponse({ status: 200, description: 'Учебные материалы получены' })
    async getStudyMaterials(@Param('id') id: string) {
        this.logger.log(`Получение учебных материалов предмета: ${id}`);
        return this.subjectsService.getStudyMaterials(id);
    }

    /**
     * Добавить учебный материал к предмету (админ или преподаватель)
     */
    @Post(':id/materials')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Добавить учебный материал к предмету' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async addStudyMaterial(
        @Param('id') subjectId: string,
        @Body() addMaterialDto: AddStudyMaterialDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        this.logger.log(`Добавление учебного материала к предмету: ${subjectId}`);
        return this.subjectsService.addStudyMaterial(subjectId, addMaterialDto, file);
    }

    /**
     * Удалить учебный материал (админ или преподаватель)
     */
    @Delete(':subjectId/materials/:materialId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Удалить учебный материал' })
    async removeStudyMaterial(
        @Param('subjectId') subjectId: string,
        @Param('materialId') materialId: string
    ) {
        this.logger.log(`Удаление учебного материала ${materialId} из предмета ${subjectId}`);
        return this.subjectsService.removeStudyMaterial(subjectId, materialId);
    }
}
