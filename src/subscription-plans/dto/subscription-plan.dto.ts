// src/subscription-plans/dto/subscription-plan.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsArray,
    Min,
    Max,
    ArrayNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
    @ApiProperty({
        example: 'Премиум 3 месяца',
        description: 'Название тарифного плана'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'premium-3-months',
        description: 'URL-дружелюбный идентификатор (slug). Должен быть уникальным.'
    })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({
        example: 'Оптимальный план для серьезного обучения на 3 месяца',
        description: 'Подробное описание тарифного плана'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: '3_months',
        description: 'Тип периода подписки',
        enum: ['1_month', '3_months', '6_months', '12_months']
    })
    @IsEnum(['1_month', '3_months', '6_months', '12_months'])
    @IsNotEmpty()
    period_type: '1_month' | '3_months' | '6_months' | '12_months';

    @ApiProperty({
        example: 1000,
        description: 'Цена тарифного плана в указанной валюте'
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        example: 'UAH',
        description: 'Валюта тарифного плана',
        enum: ['UAH', 'USD', 'EUR'],
        default: 'UAH'
    })
    @IsEnum(['UAH', 'USD', 'EUR'])
    @IsOptional()
    currency: string = 'UAH';

    @ApiProperty({
        example: 33,
        description: 'Процент скидки (0-100)',
        required: false
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discount_percent?: number;

    @ApiProperty({
        example: 1500,
        description: 'Оригинальная цена до скидки (обязательно если есть скидка)',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    original_price?: number;

    @ApiProperty({
        example: false,
        description: 'Популярный план (для выделения в UI)',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    is_popular?: boolean = false;

    @ApiProperty({
        example: false,
        description: 'Рекомендуемый план',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    is_featured?: boolean = false;

    @ApiProperty({
        example: [
            'Доступ ко всем курсам',
            'Персональная поддержка',
            'Сертификаты об окончании'
        ],
        description: 'Список особенностей плана',
        type: [String],
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    features?: string[] = [];

    @ApiProperty({
        example: [
            'Экономия 500 грн',
            'Достаточно времени для изучения',
            'Популярный выбор студентов'
        ],
        description: 'Список преимуществ плана',
        type: [String],
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    benefits?: string[] = [];

    @ApiProperty({
        example: '#51CF66',
        description: 'Цвет для отображения в UI (HEX формат)',
        required: false
    })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiProperty({
        example: '🎯',
        description: 'Эмодзи-иконка плана',
        required: false
    })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({
        example: 2,
        description: 'Порядок сортировки (чем меньше число, тем выше в списке)',
        default: 0
    })
    @IsNumber()
    @IsOptional()
    sort_order?: number = 0;

    @ApiProperty({
        example: true,
        description: 'Активен ли план',
        default: true
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean = true;
}

export class UpdatePlanDto {
    @ApiProperty({
        example: 'Премиум 3 месяца (обновлен)',
        description: 'Название тарифного плана',
        required: false
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: 'premium-3-months-updated',
        description: 'URL-дружелюбный идентификатор (slug)',
        required: false
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        example: 'Обновленное описание премиум плана',
        description: 'Описание тарифного плана',
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: '6_months',
        description: 'Тип периода подписки',
        enum: ['1_month', '3_months', '6_months', '12_months'],
        required: false
    })
    @IsEnum(['1_month', '3_months', '6_months', '12_months'])
    @IsOptional()
    period_type?: '1_month' | '3_months' | '6_months' | '12_months';

    @ApiProperty({
        example: 1200,
        description: 'Новая цена тарифного плана',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @ApiProperty({
        example: 'USD',
        description: 'Валюта тарифного плана',
        enum: ['UAH', 'USD', 'EUR'],
        required: false
    })
    @IsEnum(['UAH', 'USD', 'EUR'])
    @IsOptional()
    currency?: string;

    @ApiProperty({
        example: 25,
        description: 'Процент скидки (0-100)',
        required: false
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discount_percent?: number;

    @ApiProperty({
        example: 1600,
        description: 'Оригинальная цена до скидки',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    original_price?: number;

    @ApiProperty({
        example: true,
        description: 'Популярный план',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_popular?: boolean;

    @ApiProperty({
        example: true,
        description: 'Рекомендуемый план',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_featured?: boolean;

    @ApiProperty({
        example: [
            'Доступ ко всем курсам',
            'VIP поддержка 24/7',
            'Индивидуальные консультации'
        ],
        description: 'Обновленный список особенностей',
        type: [String],
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    features?: string[];

    @ApiProperty({
        example: [
            'Максимальная экономия',
            'Персональный подход',
            'Лучший выбор для профессионалов'
        ],
        description: 'Обновленный список преимуществ',
        type: [String],
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    benefits?: string[];

    @ApiProperty({
        example: '#9775FA',
        description: 'Новый цвет плана',
        required: false
    })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiProperty({
        example: '👑',
        description: 'Новая иконка плана',
        required: false
    })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({
        example: 1,
        description: 'Новый порядок сортировки',
        required: false
    })
    @IsNumber()
    @IsOptional()
    sort_order?: number;

    @ApiProperty({
        example: false,
        description: 'Статус активности плана',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}