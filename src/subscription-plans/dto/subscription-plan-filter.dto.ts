// src/subscription-plans/dto/subscription-plan-filter.dto.ts
import {
    IsOptional,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsString,
    Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanFilterDto {
    @ApiProperty({
        example: 'course',
        description: 'Фильтр по типу подписки',
        enum: ['course', 'period'],
        required: false
    })
    @IsEnum(['course', 'period'])
    @IsOptional()
    type?: 'course' | 'period';

    @ApiProperty({
        example: true,
        description: 'Только активные планы',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiProperty({
        example: true,
        description: 'Только доступные для покупки',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_available?: boolean;

    @ApiProperty({
        example: 50000,
        description: 'Минимальная цена в копейках',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    min_price?: number;

    @ApiProperty({
        example: 200000,
        description: 'Максимальная цена в копейках',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    max_price?: number;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Фильтр по ID курса',
        required: false
    })
    @IsString()
    @IsOptional()
    courseId?: string;

    @ApiProperty({
        example: 'JavaScript',
        description: 'Поиск по названию плана',
        required: false
    })
    @IsString()
    @IsOptional()
    search?: string;
}