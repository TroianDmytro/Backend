// src/homework/dto/review-homework.dto.ts - ОБНОВЛЕННЫЙ DTO
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewHomeworkDto {
    @ApiProperty({
        description: 'Оценка за домашнее задание',
        example: 85,
        minimum: 0,
        maximum: 100
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;

    @ApiPropertyOptional({
        description: 'Краткий комментарий преподавателя',
        example: 'Хорошая работа, но есть ошибки в 3-м задании'
    })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiPropertyOptional({
        description: 'Подробный отзыв преподавателя',
        example: 'Задания 1-2 выполнены отлично. В задании 3 неправильно применена формула...'
    })
    @IsOptional()
    @IsString()
    detailed_feedback?: string;
}

