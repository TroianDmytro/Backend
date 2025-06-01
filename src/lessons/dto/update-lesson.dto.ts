// src/lessons/dto/update-lesson.dto.ts
import {
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    IsBoolean,
    IsMongoId,
    Min,
    Max,
    IsDateString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { HomeworkFileDto, MaterialDto, VideoDto } from './create-lesson.dto';

export class UpdateLessonDto {
    @ApiProperty({ example: 'Обновленное название урока', description: 'Название урока', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ example: 'Обновленное описание урока', description: 'Описание урока', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'Новое краткое описание', description: 'Краткое описание', required: false })
    @IsString()
    @IsOptional()
    short_description?: string;

    @ApiProperty({ example: 2, description: 'Порядковый номер урока', required: false })
    @IsNumber()
    @Min(1)
    @IsOptional()
    order?: number;

    @ApiProperty({ example: 60, description: 'Продолжительность в минутах', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration_minutes?: number;

    @ApiProperty({ example: 'Обновленный текстовый контент', description: 'Текстовый контент', required: false })
    @IsString()
    @IsOptional()
    text_content?: string;

    @ApiProperty({ example: '<h1>Updated Content</h1>', description: 'HTML контент', required: false })
    @IsString()
    @IsOptional()
    content_html?: string;

    @ApiProperty({ description: 'Видео материалы', type: [VideoDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VideoDto)
    @IsOptional()
    videos?: VideoDto[];

    @ApiProperty({ description: 'Дополнительные материалы', type: [MaterialDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialDto)
    @IsOptional()
    materials?: MaterialDto[];

    @ApiProperty({ example: 'Обновленное задание', description: 'Описание домашнего задания', required: false })
    @IsString()
    @IsOptional()
    homework_description?: string;

    @ApiProperty({ description: 'Файлы домашнего задания', type: [HomeworkFileDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HomeworkFileDto)
    @IsOptional()
    homework_files?: HomeworkFileDto[];

    @ApiProperty({ example: '2024-02-15T23:59:59Z', description: 'Срок сдачи задания', required: false })
    @IsDateString()
    @IsOptional()
    homework_deadline?: string;

    @ApiProperty({ example: 90, description: 'Максимальная оценка', required: false })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    homework_max_score?: number;

    @ApiProperty({ example: true, description: 'Активен ли урок', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: true, description: 'Опубликован ли урок', required: false })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiProperty({ example: false, description: 'Бесплатный ли урок', required: false })
    @IsBoolean()
    @IsOptional()
    isFree?: boolean;

    @ApiProperty({ example: ['507f1f77bcf86cd799439013'], description: 'ID предварительных уроков', required: false })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    prerequisites?: string[];
}