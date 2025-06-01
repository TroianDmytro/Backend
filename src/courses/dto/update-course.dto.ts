// src/courses/dto/update-course.dto.ts
import {
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    IsUrl,
    IsEnum,
    IsBoolean,
    IsMongoId,
    Min,
    IsDateString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
    @ApiProperty({ example: 'Обновленное название курса', description: 'Название курса', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ example: 'Обновленное описание курса', description: 'Описание курса', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'Новое краткое описание', description: 'Краткое описание', required: false })
    @IsString()
    @IsOptional()
    short_description?: string;

    @ApiProperty({ example: 'https://example.com/new-logo.png', description: 'URL логотипа', required: false })
    @IsUrl()
    @IsOptional()
    logo_url?: string;

    @ApiProperty({ example: 'https://example.com/new-cover.jpg', description: 'URL обложки', required: false })
    @IsUrl()
    @IsOptional()
    cover_image_url?: string;

    @ApiProperty({ example: 399.99, description: 'Цена курса', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @ApiProperty({ example: 299.99, description: 'Цена со скидкой', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    discount_price?: number;

    @ApiProperty({ example: 'EUR', description: 'Валюта', enum: ['USD', 'EUR', 'UAH'], required: false })
    @IsEnum(['USD', 'EUR', 'UAH'])
    @IsOptional()
    currency?: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID преподавателя', required: false })
    @IsMongoId()
    @IsOptional()
    teacherId?: string;

    @ApiProperty({ example: 'Дизайн', description: 'Категория курса', required: false })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ example: ['Design', 'UI/UX'], description: 'Теги', required: false })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty({ example: 'intermediate', description: 'Уровень сложности', enum: ['beginner', 'intermediate', 'advanced'], required: false })
    @IsEnum(['beginner', 'intermediate', 'advanced'])
    @IsOptional()
    difficulty_level?: string;

    @ApiProperty({ example: 60, description: 'Продолжительность в часах', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration_hours?: number;

    @ApiProperty({ example: 150, description: 'Максимальное количество студентов', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    max_students?: number;

    @ApiProperty({ example: ['Базовые знания дизайна'], description: 'Предварительные требования', required: false })
    @IsArray()
    @IsOptional()
    prerequisites?: string[];

    @ApiProperty({ example: ['Создание UI/UX дизайна'], description: 'Что изучит студент', required: false })
    @IsArray()
    @IsOptional()
    learning_outcomes?: string[];

    @ApiProperty({ example: 'en', description: 'Язык курса', required: false })
    @IsString()
    @IsOptional()
    language?: string;

    @ApiProperty({ example: false, description: 'Выдается ли сертификат', required: false })
    @IsBoolean()
    @IsOptional()
    has_certificate?: boolean;

    @ApiProperty({ example: 'https://youtube.com/watch?v=xyz789', description: 'Промо-видео', required: false })
    @IsUrl()
    @IsOptional()
    promo_video_url?: string;

    @ApiProperty({ example: ['Дизайнеры', 'Творческие люди'], description: 'Целевая аудитория', required: false })
    @IsArray()
    @IsOptional()
    target_audience?: string[];

    @ApiProperty({ example: true, description: 'Опубликован ли курс', required: false })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiProperty({ example: true, description: 'Активен ли курс', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: true, description: 'Рекомендуемый курс', required: false })
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @ApiProperty({ example: '2024-02-01', description: 'Дата начала курса', required: false })
    @IsDateString()
    @IsOptional()
    start_date?: string;

    @ApiProperty({ example: '2024-07-01', description: 'Дата окончания курса', required: false })
    @IsDateString()
    @IsOptional()
    end_date?: string;
}
