// src/courses/dto/create-course.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    IsUrl,
    IsEnum,
    Min,
    Max,
    IsMongoId
} from 'class-validator';

export class CreateCourseDto {
    @ApiProperty({
        example: 'Основы JavaScript для начинающих',
        description: 'Название курса'
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 'javascript-basics-for-beginners',
        description: 'URL-дружелюбный идентификатор курса'
    })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({
        example: 'Полный курс по изучению JavaScript с нуля',
        description: 'Описание курса'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'https://example.com/course-image.jpg',
        description: 'URL изображения курса',
        required: false
    })
    @IsUrl()
    @IsOptional()
    image_url?: string;

    @ApiProperty({
        example: 99.99,
        description: 'Цена курса'
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        example: 15,
        description: 'Процент скидки (0-100)',
        required: false,
        minimum: 0,
        maximum: 100
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discount_percent?: number;

    @ApiProperty({
        example: 'USD',
        description: 'Валюта курса',
        enum: ['USD', 'EUR', 'UAH', 'RUB']
    })
    @IsEnum(['USD', 'EUR', 'UAH', 'RUB'])
    currency: string;

    @ApiProperty({
        example: true,
        description: 'Активен ли курс',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiProperty({
        example: false,
        description: 'Рекомендуемый курс',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_featured?: boolean;

    @ApiProperty({
        example: 40,
        description: 'Продолжительность курса в часах',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration_hours?: number;

    @ApiProperty({
        example: ['javascript', 'programming', 'web-development'],
        description: 'Теги курса',
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({
        example: 'https://example.com/preview-video.mp4',
        description: 'URL превью видео',
        required: false
    })
    @IsUrl()
    @IsOptional()
    preview_video_url?: string;

    @ApiProperty({
        example: true,
        description: 'Разрешены ли комментарии',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    allow_comments?: boolean;

    @ApiProperty({
        example: false,
        description: 'Требует ли курс подтверждения для записи',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    requires_approval?: boolean;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID преподавателя курса'
    })
    @IsMongoId()
    @IsNotEmpty()
    teacherId: string;

    // НОВЫЕ ОБЯЗАТЕЛЬНЫЕ ПОЛЯ для связей
    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'ID категории курса'
    })
    @IsMongoId()
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439013',
        description: 'ID уровня сложности курса'
    })
    @IsMongoId()
    @IsNotEmpty()
    difficultyLevelId: string;
}

/**
 * Объяснение изменений в CreateCourseDto:
 * 
 * 1. **УДАЛЕННЫЕ ПОЛЯ:**
 *    - category?: string → удалено
 *    - difficulty_level?: string → удалено
 * 
 * 2. **НОВЫЕ ОБЯЗАТЕЛЬНЫЕ ПОЛЯ:**
 *    - categoryId: string - ID категории (обязательное поле)
 *    - difficultyLevelId: string - ID уровня сложности (обязательное поле)
 * 
 * 3. **ВАЛИДАЦИЯ:**
 *    - @IsMongoId() - проверяет корректность ObjectId
 *    - @IsNotEmpty() - поля обязательны для заполнения
 * 
 * 4. **ПРЕИМУЩЕСТВА:**
 *    - Строгая типизация связей
 *    - Валидация существования связанных документов
 *    - Предотвращение создания курсов с несуществующими категориями/уровнями
 * 
 * 5. **ИСПОЛЬЗОВАНИЕ:**
 *    - При создании курса нужно передать существующие ID категории и уровня
 *    - Валидация происходит на уровне DTO и в сервисе
 */