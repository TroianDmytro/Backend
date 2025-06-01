// src/lessons/dto/reorder-lessons.dto.ts
import {
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderLessonsDto {
    @ApiProperty({
        example: [
            { lessonId: '507f1f77bcf86cd799439011', order: 1 },
            { lessonId: '507f1f77bcf86cd799439012', order: 2 }
        ],
        description: 'Массив объектов с ID урока и новым порядковым номером'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Object)
    lessons: Array<{
        lessonId: string;
        order: number;
    }>;
}