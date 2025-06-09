// src/courses/dto/update-course.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
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

export class UpdateCourseDto {
    @ApiProperty({ example: 'Продвинутый JavaScript', description: 'Название курса', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ example: 'advanced-javascript', description: 'URL-дружелюбный идентификатор', required: false })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({ example: 'Углубленное изучение JavaScript', description: 'Описание курса', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'https://example.com/new-image.jpg', description: 'URL изображения', required: false })
    @IsUrl()
    @IsOptional()
    image_url?: string;

    @ApiProperty({ example: 149.99, description: 'Цена курса', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @ApiProperty({ example: 20, description: 'Процент скидки (0-100)', required: false })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discount_percent?: number;

    @ApiProperty({ example: 'EUR', description: 'Валюта', enum: ['USD', 'EUR', 'UAH', 'RUB'], required: false })
    @IsEnum(['USD', 'EUR', 'UAH', 'RUB'])
    @IsOptional()
    currency?: string;

    @ApiProperty({ example: false, description: 'Активен ли курс', required: false })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiProperty({ example: true, description: 'Рекомендуемый курс', required: false })
    @IsBoolean()
    @IsOptional()
    is_featured?: boolean;

    @ApiProperty({ example: 60, description: 'Продолжительность в часах', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration_hours?: number;

    @ApiProperty({ example: ['javascript', 'advanced', 'es6'], description: 'Теги курса', required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({ example: 'https://example.com/new-preview.mp4', description: 'URL превью видео', required: false })
    @IsUrl()
    @IsOptional()
    preview_video_url?: string;

    @ApiProperty({ example: false, description: 'Разрешены ли комментарии', required: false })
    @IsBoolean()
    @IsOptional()
    allow_comments?: boolean;

    @ApiProperty({ example: true, description: 'Требует ли подтверждения', required: false })
    @IsBoolean()
    @IsOptional()
    requires_approval?: boolean;

    @ApiProperty({ example: '507f1f77bcf86cd799439014', description: 'ID преподавателя', required: false })
    @IsMongoId()
    @IsOptional()
    teacherId?: string;

    // НОВЫЕ ПОЛЯ для обновления связей
    @ApiProperty({ example: '507f1f77bcf86cd799439015', description: 'ID категории курса', required: false })
    @IsMongoId()
    @IsOptional()
    categoryId?: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439016', description: 'ID уровня сложности курса', required: false })
    @IsMongoId()
    @IsOptional()
    difficultyLevelId?: string;
}

/**
 * Объяснение UpdateCourseDto:
 * 
 * 1. **ВСЕ ПОЛЯ ОПЦИОНАЛЬНЫЕ** - можно обновлять частично
 * 
 * 2. **НОВЫЕ ПОЛЯ-СВЯЗИ:**
 *    - categoryId?: string - можно изменить категорию курса
 *    - difficultyLevelId?: string - можно изменить уровень сложности
 * 
 * 3. **ВАЛИДАЦИЯ:**
 *    - @IsMongoId() проверяет корректность ObjectId
 *    - @IsOptional() делает поля необязательными
 * 
 * 4. **ИСПОЛЬЗОВАНИЕ:**
 *    - PATCH /courses/:id с любыми полями из DTO
 *    - Валидация только переданных полей
 *    - Возможность менять связи между сущностями
 */