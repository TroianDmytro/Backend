// src/difficulty-levels/difficulty-levels.service.ts
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DifficultyLevel, DifficultyLevelDocument } from './schemas/difficulty-level.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';

@Injectable()
export class DifficultyLevelsService {
    private readonly logger = new Logger(DifficultyLevelsService.name);

    constructor(
        @InjectModel(DifficultyLevel.name) private difficultyLevelModel: Model<DifficultyLevelDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>
    ) {
        this.initDefaultLevels();
    }

    private async initDefaultLevels() {
        const count = await this.difficultyLevelModel.estimatedDocumentCount();
        if (count === 0) {
            const defaultLevels = [
                {
                    name: 'Начинающий',
                    slug: 'beginner',
                    code: 'beginner',
                    level: 1,
                    description: 'Для тех, кто только начинает изучать предмет',
                    color: '#28a745',
                    requirements: ['Отсутствуют предварительные требования']
                },
                {
                    name: 'Средний',
                    slug: 'intermediate',
                    code: 'intermediate',
                    level: 5,
                    description: 'Для тех, кто имеет базовые знания',
                    color: '#ffc107',
                    requirements: ['Базовые знания предмета']
                },
                {
                    name: 'Продвинутый',
                    slug: 'advanced',
                    code: 'advanced',
                    level: 9,
                    description: 'Для опытных изучающих предмет',
                    color: '#dc3545',
                    requirements: ['Глубокие знания предмета', 'Практический опыт']
                }
            ];

            for (const level of defaultLevels) {
                await this.difficultyLevelModel.create(level);
            }

            this.logger.log('Созданы стандартные уровни сложности');
        }
    }

    async findAll(): Promise<DifficultyLevelDocument[]> {
        return this.difficultyLevelModel.find({ isActive: true }).sort({ level: 1 }).exec();
    }

    async findById(id: string): Promise<DifficultyLevelDocument | null> {
        return this.difficultyLevelModel.findById(id).exec();
    }

    async findByCode(code: string): Promise<DifficultyLevelDocument | null> {
        return this.difficultyLevelModel.findOne({ code, isActive: true }).exec();
    }
}