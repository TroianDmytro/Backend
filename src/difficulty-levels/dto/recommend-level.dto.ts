// src/difficulty-levels/dto/recommend-level.dto.ts
import {
    IsOptional,
    IsArray,
    IsString,
    IsNumber,
    Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendLevelDto {
    @ApiProperty({
        example: ['Базовые знания HTML', 'Понимание CSS'],
        description: 'Предварительные требования курса',
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    prerequisites?: string[];

    @ApiProperty({
        example: ['Начинающие разработчики', 'Студенты'],
        description: 'Целевая аудитория курса',
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    targetAudience?: string[];

    @ApiProperty({
        example: 40,
        description: 'Предполагаемое количество часов обучения',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    estimatedHours?: number;
}