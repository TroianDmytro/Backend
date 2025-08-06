// src/difficulty-levels/dto/difficulty-level-filter.dto.ts
import {
    IsOptional,
    IsBoolean,
    IsEnum,
    IsNumber,
    Min,
    Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DifficultyLevelFilterDto {
    @ApiProperty({
        example: true,
        description: 'Только активные уровни',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        example: 1,
        description: 'Минимальный числовой уровень',
        required: false
    })
    @IsNumber()
    @Min(1)
    @Max(10)
    @IsOptional()
    minLevel?: number;

    @ApiProperty({
        example: 5,
        description: 'Максимальный числовой уровень',
        required: false
    })
    @IsNumber()
    @Min(1)
    @Max(10)
    @IsOptional()
    maxLevel?: number;

    @ApiProperty({
        example: 'beginner',
        description: 'Фильтр по коду уровня',
        enum: ['beginner', 'intermediate', 'advanced'],
        required: false
    })
    @IsEnum(['beginner', 'intermediate', 'advanced'])
    @IsOptional()
    code?: 'beginner' | 'intermediate' | 'advanced';
}
