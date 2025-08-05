// src/difficulty-levels/difficulty-levels.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DifficultyLevelsService } from './difficulty-levels.service';
import { DifficultyLevelsController } from './difficulty-levels.controller';
import { DifficultyLevel, DifficultyLevelSchema } from './schemas/difficulty-level.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DifficultyLevel.name, schema: DifficultyLevelSchema },
            { name: Course.name, schema: CourseSchema }
        ])
    ],
    controllers: [DifficultyLevelsController],
    providers: [DifficultyLevelsService],
    exports: [DifficultyLevelsService],
})
export class DifficultyLevelsModule { }