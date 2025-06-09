// src/categories/dto/create-category.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsUrl,
    IsArray,
    Matches,
    Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Программирование', description: 'Название категории' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ 
        example: 'programming', 
        description: 'URL-friendly название для роутинга' 
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug должен содержать только строчные буквы, цифры и дефисы'
    })
    slug: string;

    @ApiProperty({ 
        example: 'Курсы по программированию и разработке', 
        description: 'Описание категории' 
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ 
        example: 'Изучите программирование с нуля', 
        description: 'Краткое описание',
        required: false 
    })
    @IsString()
    @IsOptional()
    short_description?: string;

    @ApiProperty({ 
        example: 'fas fa-code', 
        description: 'Иконка категории',
        required: false 
    })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({ 
        example: 'https://example.com/category.jpg', 
        description: 'URL изображения категории',
        required: false 
    })
    @IsUrl()
    @IsOptional()
    image_url?: string;

    @ApiProperty({ 
        example: '#3f51b5', 
        description: 'Цвет категории для UI',
        required: false 
    })
    @IsString()
    @IsOptional()
    @Matches(/^#[0-9A-F]{6}$/i, {
        message: 'Цвет должен быть в формате HEX (#RRGGBB)'
    })
    color?: string;

    @ApiProperty({ 
        example: '507f1f77bcf86cd799439011', 
        description: 'ID родительской категории',
        required: false 
    })
    @IsString()
    @IsOptional()
    parent_id?: string;

    @ApiProperty({ 
        example: true, 
        description: 'Активна ли категория',
        required: false 
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ 
        example: false, 
        description: 'Рекомендуемая категория',
        required: false 
    })
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @ApiProperty({ 
        example: 1, 
        description: 'Порядок отображения',
        required: false 
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    order?: number;

    @ApiProperty({ 
        example: 'Курсы программирования', 
        description: 'SEO заголовок',
        required: false 
    })
    @IsString()
    @IsOptional()
    meta_title?: string;

    @ApiProperty({ 
        example: 'Лучшие курсы по программированию', 
        description: 'SEO описание',
        required: false 
    })
    @IsString()
    @IsOptional()
    meta_description?: string;

    @ApiProperty({ 
        example: ['программирование', 'курсы', 'обучение'], 
        description: 'SEO ключевые слова',
        required: false 
    })
    @IsArray()
    @IsOptional()
    meta_keywords?: string[];
}





