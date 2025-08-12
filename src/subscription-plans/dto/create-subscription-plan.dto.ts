// src/subscription-plans/dto/create-subscription-plan.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsArray,
    IsDateString,
    IsMongoId,
    Min,
    Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
    @ApiProperty({
        example: 'Подписка на курс JavaScript',
        description: 'Название плана подписки'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Полный доступ к курсу JavaScript на 3 месяца',
        description: 'Описание плана подписки'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'course',
        description: 'Тип подписки',
        enum: ['course', 'period']
    })
    @IsEnum(['course', 'period'])
    @IsNotEmpty()
    type: 'course' | 'period';

    @ApiProperty({
        example: 99900,
        description: 'Цена в копейках (999.00 грн = 99900 копеек)'
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        example: 'UAH',
        description: 'Валюта',
        enum: ['UAH', 'USD', 'EUR'],
        default: 'UAH'
    })
    @IsEnum(['UAH', 'USD', 'EUR'])
    @IsOptional()
    currency?: string;

    @ApiProperty({
        example: 10,
        description: 'Процент скидки (0-100)',
        required: false
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discount_percent?: number;

    @ApiProperty({
        example: 3,
        description: 'Длительность подписки в месяцах'
    })
    @IsNumber()
    @Min(1)
    duration_months: number;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID курса (обязательно для type: course)',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    courseId?: string;

    @ApiProperty({
        example: true,
        description: 'Включает ли все курсы (для type: period)',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    includes_all_courses?: boolean;

    @ApiProperty({
        example: ['Сертификат', 'Поддержка 24/7', 'Доступ к закрытому чату'],
        description: 'Дополнительные возможности',
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    included_features?: string[];

    @ApiProperty({
        example: ['course_id_1', 'course_id_2'],
        description: 'Исключенные курсы (для периодических подписок)',
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    excluded_courses?: string[];

    @ApiProperty({
        example: true,
        description: 'Активен ли план',
        required: false,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiProperty({
        example: true,
        description: 'Доступен ли для покупки',
        required: false,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    is_available?: boolean;

    @ApiProperty({
        example: '2024-01-01T00:00:00Z',
        description: 'Дата начала доступности',
        required: false
    })
    @IsDateString()
    @IsOptional()
    available_from?: string;

    @ApiProperty({
        example: '2024-12-31T23:59:59Z',
        description: 'Дата окончания доступности',
        required: false
    })
    @IsDateString()
    @IsOptional()
    available_until?: string;

    @ApiProperty({
        example: 1000,
        description: 'Максимальное количество подписок (0 = без лимита)',
        required: false,
        default: 0
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    max_subscriptions?: number;
}

