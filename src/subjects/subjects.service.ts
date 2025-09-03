// src/subjects/subjects.service.ts
import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateSubjectDto, UpdateSubjectDto, AddStudyMaterialDto } from './dto/subject.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SubjectsService {
    private readonly logger = new Logger(SubjectsService.name);

    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>
    ) { }

    /**
     * Создать новый предмет
     */
    async create(createSubjectDto: CreateSubjectDto): Promise<SubjectDocument> {
        const subject = new this.subjectModel(createSubjectDto);
        return subject.save();
    }

    /**
     * Получить все предметы
     */
    async findAll(): Promise<SubjectDocument[]> {
        return this.subjectModel.find({ isActive: true }).sort({ name: 1 });
    }

    /**
     * Найти предмет по ID
     */
    async findById(id: string): Promise<SubjectDocument> {
        const subject = await this.subjectModel.findById(id);
        if (!subject) {
            throw new NotFoundException('Предмет не найден');
        }
        return subject;
    }

    /**
     * Обновить предмет
     */
    async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<SubjectDocument> {
        const subject = await this.subjectModel.findByIdAndUpdate(
            id,
            updateSubjectDto,
            { new: true }
        );
        if (!subject) {
            throw new NotFoundException('Предмет не найден');
        }
        return subject;
    }

    /**
     * Удалить предмет (мягкое удаление)
     */
    async remove(id: string): Promise<{ message: string }> {
        // Проверяем, используется ли предмет в курсах
        const coursesCount = await this.courseModel.countDocuments({
            'courseSubjects.subject': id
        });

        if (coursesCount > 0) {
            throw new BadRequestException(
                `Предмет используется в ${coursesCount} курсах. Удаление невозможно.`
            );
        }

        const result = await this.subjectModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!result) {
            throw new NotFoundException('Предмет не найден');
        }

        return { message: 'Предмет успешно удален' };
    }

    /**
     * Получить учебные материалы предмета
     */
    async getStudyMaterials(subjectId: string) {
        const subject = await this.findById(subjectId);
        return {
            subjectId: subject._id,
            subjectName: subject.name,
            materials: subject.studyMaterials || []
        };
    }

    /**
     * Добавить учебный материал к предмету
     */
    async addStudyMaterial(
        subjectId: string,
        addMaterialDto: AddStudyMaterialDto,
        file?: Express.Multer.File
    ): Promise<SubjectDocument> {
        const subject = await this.findById(subjectId);

        let fileUrl: string | undefined;

        // Если загружен файл, сохраняем его
        if (file) {
            const uploadPath = path.join('./uploads/study-materials/', file.filename);
            fileUrl = `/uploads/study-materials/${file.filename}`;
        }

        // Проверяем соответствие типа материала и наличие файла/ссылки
        if ((addMaterialDto.type === 'pdf_book' || addMaterialDto.type === 'lecture_files') && !file) {
            throw new BadRequestException('Для данного типа материала требуется файл');
        }

        if ((addMaterialDto.type === 'video' || addMaterialDto.type === 'document_link') && !addMaterialDto.externalUrl) {
            throw new BadRequestException('Для данного типа материала требуется внешняя ссылка');
        }

        const newMaterial = {
            title: addMaterialDto.title,
            description: addMaterialDto.description,
            type: addMaterialDto.type,
            fileUrl,
            externalUrl: addMaterialDto.externalUrl,
            createdAt: new Date()
        };

        subject.studyMaterials.push(newMaterial);
        return subject.save();
    }

    /**
     * Удалить учебный материал
     */
    async removeStudyMaterial(subjectId: string, materialId: string): Promise<SubjectDocument> {
        const subject = await this.findById(subjectId);

        // ИСПРАВЛЕНО: поиск по индексу, так как у материалов нет _id
        const materialIndex = parseInt(materialId);
        
        if (materialIndex < 0 || materialIndex >= subject.studyMaterials.length) {
            throw new NotFoundException('Учебный материал не найден');
        }

        const material = subject.studyMaterials[materialIndex];
        if (material.fileUrl) {
            const filePath = path.join('.', material.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        subject.studyMaterials.splice(materialIndex, 1);
        return subject.save();
    }
}