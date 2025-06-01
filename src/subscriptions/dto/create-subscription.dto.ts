// src/subscriptions/dto/create-subscription.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsMongoId,
    IsEnum,
    Min,
    IsDateString,
    ValidateIf
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID пользователя'
    })
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        example: 'course',
        description: 'Тип подписки: на отдельный курс или на период',
        enum: ['course', 'period']
    })
    @IsEnum(['course', 'period'])
    @IsNotEmpty()
    subscription_type: 'course' | 'period';

    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'ID курса (обязательно для типа "course")',
        required: false
    })
    @ValidateIf(o => o.subscription_type === 'course')
    @IsMongoId()
    @IsNotEmpty()
    courseId?: string;

    @ApiProperty({
        example: '3_months',
        description: 'Тип периода (обязательно для типа "period")',
        enum: ['1_month', '3_months', '6_months', '12_months'],
        required: false
    })
    @ValidateIf(o => o.subscription_type === 'period')
    @IsEnum(['1_month', '3_months', '6_months', '12_months'])
    @IsNotEmpty()
    period_type?: '1_month' | '3_months' | '6_months' | '12_months';

    @ApiProperty({
        example: '2024-01-15T00:00:00Z',
        description: 'Дата начала подписки'
    })
    @IsDateString()
    @IsNotEmpty()
    start_date: string;

    @ApiProperty({
        example: '2024-04-15T00:00:00Z',
        description: 'Дата окончания подписки'
    })
    @IsDateString()
    @IsNotEmpty()
    end_date: string;

    @ApiProperty({
        example: 299.99,
        description: 'Цена подписки'
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        example: 'USD',
        description: 'Валюта',
        enum: ['USD', 'EUR', 'UAH'],
        default: 'USD'
    })
    @IsEnum(['USD', 'EUR', 'UAH'])
    @IsOptional()
    currency?: string;

    @ApiProperty({
        example: 50,
        description: 'Размер скидки',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    discount_amount?: number;

    @ApiProperty({
        example: 'PROMO2024',
        description: 'Промокод',
        required: false
    })
    @IsString()
    @IsOptional()
    discount_code?: string;

    @ApiProperty({
        example: 'credit_card',
        description: 'Способ оплаты',
        required: false
    })
    @IsString()
    @IsOptional()
    payment_method?: string;

    @ApiProperty({
        example: true,
        description: 'Автоматическое продление',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    auto_renewal?: boolean;

    @ApiProperty({
        example: true,
        description: 'Уведомления по email',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    email_notifications?: boolean;
}





