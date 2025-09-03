// src/homework/dto/review-homework.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsNumber,
    Min,
    Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class DetailedFeedbackDto {
    @ApiProperty({ example: 'Качество кода', description: 'Критерий оценки' })
    @IsString()
    @IsNotEmpty()
    criteria: string;

    @ApiProperty({ example: 85, description: 'Оценка по критерию (0-100)' })
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;

    @ApiProperty({
        example: 'Код хорошо структурирован, но нужно добавить комментарии',
        description: 'Комментарий по критерию',
        required: false
    })
    @IsString()
    @IsOptional()
    comment?: string;
}

export class ReviewHomeworkDto {
    @ApiProperty({
        example: 90,
        description: 'Общая оценка за задание (0-100)'
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;

    @ApiProperty({
        example: 'Отличная работа! Все требования выполнены. Рекомендую добавить больше комментариев в код.',
        description: 'Комментарий преподавателя'
    })
    @IsString()
    @IsNotEmpty()
    teacher_comment: string;

    @ApiProperty({
        description: 'Детальная оценка по критериям',
        type: [DetailedFeedbackDto],
        required: false
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailedFeedbackDto)
    @IsOptional()
    detailed_feedback?: DetailedFeedbackDto[];

    @ApiProperty({
        example: 'reviewed',
        description: 'Статус после проверки',
        enum: ['reviewed', 'returned_for_revision']
    })
    @IsString()
    @IsOptional()
    status?: 'reviewed' | 'returned_for_revision';
}