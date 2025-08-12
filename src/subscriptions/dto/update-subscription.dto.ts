// src/subscriptions/dto/update-subscription.dto.ts
import {
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsEnum,
    Min,
    IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateSubscriptionDto {
    @ApiProperty({
        example: 'active',
        description: 'Статус подписки',
        enum: ['active', 'expired', 'cancelled', 'pending'],
        required: false
    })
    @IsEnum(['active', 'expired', 'cancelled', 'pending'])
    @IsOptional()
    status?: 'active' | 'expired' | 'cancelled' | 'pending';

    @ApiProperty({
        example: '2024-07-15T00:00:00Z',
        description: 'Новая дата окончания подписки',
        required: false
    })
    @IsDateString()
    @IsOptional()
    end_date?: string;

    @ApiProperty({
        example: 399.99,
        description: 'Новая цена подписки',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @ApiProperty({
        example: true,
        description: 'Оплачена ли подписка',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    is_paid?: boolean;

    @ApiProperty({
        example: 'TXN123456789',
        description: 'ID транзакции оплаты',
        required: false
    })
    @IsString()
    @IsOptional()
    payment_transaction_id?: string;

    @ApiProperty({
        example: '2024-01-15T10:30:00Z',
        description: 'Дата оплаты',
        required: false
    })
    @IsDateString()
    @IsOptional()
    payment_date?: string;

    @ApiProperty({
        example: false,
        description: 'Автоматическое продление',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    auto_renewal?: boolean;

    @ApiProperty({
        example: '2024-04-15T00:00:00Z',
        description: 'Дата следующего списания',
        required: false
    })
    @IsDateString()
    @IsOptional()
    next_billing_date?: string;

    @ApiProperty({
        example: 75,
        description: 'Процент прохождения курса',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    progress_percentage?: number;

    @ApiProperty({
        example: 8,
        description: 'Количество пройденных уроков',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    completed_lessons?: number;

    @ApiProperty({
        example: false,
        description: 'Уведомления по email',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    email_notifications?: boolean;

    @ApiProperty({
        example: 'Не подходит формат обучения',
        description: 'Причина отмены подписки',
        required: false
    })
    @IsString()
    @IsOptional()
    cancellation_reason?: string;
}