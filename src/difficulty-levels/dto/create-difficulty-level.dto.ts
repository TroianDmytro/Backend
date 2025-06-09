// src/difficulty-levels/dto/create-difficulty-level.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsArray,
    Matches,
    Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDifficultyLevelDto {
    @ApiProperty({ example: 'Начальный', description: 'Название уровня' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ 
        example: 'beginner', 
        description: 'URL-friendly название' 
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug должен содержать только строчные буквы, цифры и дефисы'
    })
    slug: string;

    @ApiProperty({ 
        example: 'beginner', 
        description: 'Код уровня' 
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z_]+$/, {
        message: 'Код должен содержать только строчные буквы и подчеркивания'
    })
    code: string;

    @ApiProperty({ 
        example: 'Для тех, кто только начинает изучать предмет', 
        description: 'Описание уровня' 
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ 
        example: 'Начните с основ', 
        description: 'Краткое описание',
        required: false 
    })
    @IsString()
    @IsOptional()
    short_description?: string;

    @ApiProperty({ 
        example: 'fas fa-user-graduate', 
        description: 'Иконка уровня',
        required: false 
    })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({ 
        example: '#4caf50', 
        description: 'Цвет уровня',
        required: false 
    })
    @IsString()
    @IsOptional()
    @Matches(/^#[0-9A-F]{6}$/i, {
        message: 'Цвет должен быть в формате HEX (#RRGGBB)'
    })
    color?: string;

    @ApiProperty({ 
        example: 1, 
        description: 'Числовой уровень (1-начальный, 2-средний, 3-продвинутый)' 
    })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    level: number;

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
        example: ['Базовые знания компьютера'], 
        description: 'Предварительные требования',
        required: false 
    })
    @IsArray()
    @IsOptional()
    prerequisites?: string[];

    @ApiProperty({ 
        example: ['Новички', 'Студенты'], 
        description: 'Целевая аудитория',
        required: false 
    })
    @IsArray()
    @IsOptional()
    target_audience?: string[];

    @ApiProperty({ 
        example: 40, 
        description: 'Рекомендуемое количество часов',
        required: false 
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    recommended_hours?: number;

    @ApiProperty({ 
        example: 0, 
        description: 'Минимальный опыт в годах',
        required: false 
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    min_experience_years?: number;

    @ApiProperty({ 
        example: true, 
        description: 'Активен ли уровень',
        required: false 
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}




