// src/courses/dto/create-course.dto.ts
import {
    IsNotEmpty,
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

export class CreateCourseDto {
    @ApiProperty({ example: 'Основы веб-разработки', description: 'Название курса' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 'Полный курс по изучению веб-разработки с нуля до профессионального уровня',
        description: 'Описание курса'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'Изучите веб-разработку с нуля',
        description: 'Краткое описание для карточек',
        required: false
    })
    @IsString()
    @IsOptional()
    short_description?: string;

    @ApiProperty({
        example: 'https://example.com/logo.png',
        description: 'URL логотипа курса',
        required: false
    })
    @IsUrl()
    @IsOptional()
    logo_url?: string;

    @ApiProperty({
        example: 'https://example.com/cover.jpg',
        description: 'URL обложки курса',
        required: false
    })
    @IsUrl()
    @IsOptional()
    cover_image_url?: string;

    @ApiProperty({ example: 299.99, description: 'Цена курса' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        example: 199.99,
        description: 'Цена со скидкой',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    discount_price?: number;

    @ApiProperty({
        example: 'USD',
        description: 'Валюта',
        enum: ['USD', 'EUR', 'UAH'],
        default: 'USD'
    })
    @IsEnum(['USD', 'EUR', 'UAH'])
    @IsOptional()
    currency?: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID преподавателя курса'
    })
    @IsMongoId()
    @IsNotEmpty()
    teacherId: string;

    @ApiProperty({
        example: 'Программирование',
        description: 'Категория курса',
        required: false
    })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({
        example: ['JavaScript', 'React', 'Frontend'],
        description: 'Теги для поиска',
        required: false
    })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty({
        example: 'beginner',
        description: 'Уровень сложности',
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    })
    @IsEnum(['beginner', 'intermediate', 'advanced'])
    @IsOptional()
    difficulty_level?: string;

    @ApiProperty({
        example: 40,
        description: 'Продолжительность в часах',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration_hours?: number;

    @ApiProperty({
        example: 100,
        description: 'Максимальное количество студентов (0 = без ограничений)',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    max_students?: number;

    @ApiProperty({
        example: ['Базовые знания HTML', 'Умение работать с компьютером'],
        description: 'Предварительные требования',
        required: false
    })
    @IsArray()
    @IsOptional()
    prerequisites?: string[];

    @ApiProperty({
        example: ['Создание сайтов', 'Работа с JavaScript', 'Использование React'],
        description: 'Что изучит студент',
        required: false
    })
    @IsArray()
    @IsOptional()
    learning_outcomes?: string[];

    @ApiProperty({
        example: 'ru',
        description: 'Язык курса',
        required: false
    })
    @IsString()
    @IsOptional()
    language?: string;

    @ApiProperty({
        example: true,
        description: 'Выдается ли сертификат',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    has_certificate?: boolean;

    @ApiProperty({
        example: 'https://youtube.com/watch?v=abc123',
        description: 'Промо-видео курса',
        required: false
    })
    @IsUrl()
    @IsOptional()
    promo_video_url?: string;

    @ApiProperty({
        example: ['Начинающие разработчики', 'Студенты IT'],
        description: 'Целевая аудитория',
        required: false
    })
    @IsArray()
    @IsOptional()
    target_audience?: string[];

    @ApiProperty({
        example: '2024-01-15',
        description: 'Дата начала курса',
        required: false
    })
    @IsDateString()
    @IsOptional()
    start_date?: string;

    @ApiProperty({
        example: '2024-06-15',
        description: 'Дата окончания курса',
        required: false
    })
    @IsDateString()
    @IsOptional()
    end_date?: string;
}

