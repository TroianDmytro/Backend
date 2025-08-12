// src/subscriptions/dto/subscription-filter.dto.ts
import {
    
    IsOptional,
    IsBoolean,
    IsMongoId,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class SubscriptionFilterDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Фильтр по пользователю',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    userId?: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'Фильтр по курсу',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    courseId?: string;

    @ApiProperty({
        example: 'active',
        description: 'Фильтр по статусу',
        enum: ['active', 'expired', 'cancelled', 'pending'],
        required: false
    })
    @IsEnum(['active', 'expired', 'cancelled', 'pending'])
    @IsOptional()
    status?: 'active' | 'expired' | 'cancelled' | 'pending';

    @ApiProperty({
        example: 'course',
        description: 'Фильтр по типу подписки',
        enum: ['course', 'period'],
        required: false
    })
    @IsEnum(['course', 'period'])
    @IsOptional()
    subscription_type?: 'course' | 'period';

    @ApiProperty({
        example: '3_months',
        description: 'Фильтр по типу периода',
        enum: ['1_month', '3_months', '6_months', '12_months'],
        required: false
    })
    @IsEnum(['1_month', '3_months', '6_months', '12_months'])
    @IsOptional()
    period_type?: '1_month' | '3_months' | '6_months' | '12_months';

    @ApiProperty({
        example: true,
        description: 'Только оплаченные подписки',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_paid?: boolean;

    @ApiProperty({
        example: true,
        description: 'Только подписки с автопродлением',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    auto_renewal?: boolean;

    @ApiProperty({
        example: '2024-01-01',
        description: 'Дата начала периода (от)',
        required: false
    })
    @IsDateString()
    @IsOptional()
    start_date_from?: string;

    @ApiProperty({
        example: '2024-12-31',
        description: 'Дата начала периода (до)',
        required: false
    })
    @IsDateString()
    @IsOptional()
    start_date_to?: string;

    @ApiProperty({
        example: 'USD',
        description: 'Фильтр по валюте',
        enum: ['USD', 'EUR', 'UAH'],
        required: false
    })
    @IsEnum(['USD', 'EUR', 'UAH'])
    @IsOptional()
    currency?: string;
}
