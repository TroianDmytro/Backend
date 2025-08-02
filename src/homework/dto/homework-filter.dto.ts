// src/homework/dto/homework-filter.dto.ts - дополнительный DTO для фильтрации
import {
    IsOptional,
    IsString,
    IsEnum,
    IsMongoId,
    IsBoolean,
    IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HomeworkFilterDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Фильтр по курсу',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    courseId?: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'Фильтр по уроку',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    lessonId?: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439013',
        description: 'Фильтр по преподавателю',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    teacherId?: string;

    @ApiProperty({
        example: 'submitted',
        description: 'Фильтр по статусу отправки',
        enum: ['submitted', 'in_review', 'reviewed', 'returned_for_revision'],
        required: false
    })
    @IsEnum(['submitted', 'in_review', 'reviewed', 'returned_for_revision'])
    @IsOptional()
    status?: 'submitted' | 'in_review' | 'reviewed' | 'returned_for_revision';

    @ApiProperty({
        example: true,
        description: 'Только опубликованные задания',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiProperty({
        example: true,
        description: 'Только активные задания',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        example: '2024-01-01',
        description: 'Дедлайн от',
        required: false
    })
    @IsDateString()
    @IsOptional()
    deadline_from?: string;

    @ApiProperty({
        example: '2024-12-31',
        description: 'Дедлайн до',
        required: false
    })
    @IsDateString()
    @IsOptional()
    deadline_to?: string;

    @ApiProperty({
        example: 'JavaScript',
        description: 'Поиск по названию задания',
        required: false
    })
    @IsString()
    @IsOptional()
    search?: string;
}
