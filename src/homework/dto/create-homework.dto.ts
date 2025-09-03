// src/homework/dto/create-homework.dto.ts - ОБНОВЛЕННЫЙ DTO
import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean, IsMongoId, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateHomeworkDto {
    @ApiProperty({
        description: 'Название домашнего задания',
        example: 'Решение квадратных уравнений'
    })
    @IsString()
    title: string;

    @ApiPropertyOptional({
        description: 'Описание задания',
        example: 'Решить 10 квадратных уравнений из учебника, стр. 45'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'ID занятия к которому привязано задание',
        example: '507f1f77bcf86cd799439011'
    })
    @IsMongoId()
    lesson: string;

    @ApiPropertyOptional({
        description: 'Крайний срок сдачи',
        example: '2024-12-31T23:59:59.000Z'
    })
    @IsOptional()
    @IsDateString()
    deadline?: string;

    @ApiPropertyOptional({
        description: 'Максимальный балл за задание',
        example: 100,
        minimum: 1,
        maximum: 100
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    max_score?: number;

    @ApiPropertyOptional({
        description: 'Максимальное количество попыток сдачи',
        example: 3,
        minimum: 1
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    max_attempts?: number;

    @ApiPropertyOptional({
        description: 'Разрешить сдачу после дедлайна',
        example: false
    })
    @IsOptional()
    @IsBoolean()
    allow_late_submission?: boolean;

    @ApiPropertyOptional({
        description: 'Опубликовать задание сразу',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
