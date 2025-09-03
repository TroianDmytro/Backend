// src/courses/dto/course-filter.dto.ts
import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsMongoId,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CourseFilterDto {
    @ApiProperty({ example: 'Программирование', description: 'Категория для фильтрации', required: false })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ example: 'beginner', description: 'Уровень сложности', enum: ['beginner', 'intermediate', 'advanced'], required: false })
    @IsEnum(['beginner', 'intermediate', 'advanced'])
    @IsOptional()
    difficulty_level?: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID преподавателя', required: false })
    @IsMongoId()
    @IsOptional()
    teacherId?: string;

    @ApiProperty({ example: 50, description: 'Минимальная цена', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Transform(({ value }) => value ? Number(value) : undefined)
    minPrice?: number;

    @ApiProperty({ example: 500, description: 'Максимальная цена', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    @Transform(({ value }) => value ? Number(value) : undefined)
    maxPrice?: number;

    @ApiProperty({ example: 'ru', description: 'Язык курса', required: false })
    @IsString()
    @IsOptional()
    language?: string;

    @ApiProperty({ example: true, description: 'Только опубликованные курсы', required: false })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isPublished?: boolean;

    @ApiProperty({ example: true, description: 'Только активные курсы', required: false })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isActive?: boolean;

    @ApiProperty({ example: true, description: 'Только рекомендуемые курсы', required: false })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isFeatured?: boolean;

    @ApiProperty({ example: 'JavaScript', description: 'Поиск по тегам', required: false })
    @IsString()
    @IsOptional()
    tag?: string;

    @ApiProperty({ example: 'веб-разработка', description: 'Поиск по названию и описанию', required: false })
    @IsString()
    @IsOptional()
    search?: string;
}