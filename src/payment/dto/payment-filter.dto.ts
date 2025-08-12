// src/payment/dto/payment-filter.dto.ts
import {
    IsOptional,
    IsEnum,
    IsMongoId,
    IsDateString,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentFilterDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Фильтр по ID пользователя',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    userId?: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'Фильтр по ID плана',
        required: false
    })
    @IsMongoId()
    @IsOptional()
    planId?: string;

    @ApiProperty({
        example: 'success',
        description: 'Фильтр по статусу',
        enum: ['created', 'pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'],
        required: false
    })
    @IsEnum(['created', 'pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'])
    @IsOptional()
    status?: 'created' | 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';

    @ApiProperty({
        example: '2024-01-01T00:00:00Z',
        description: 'Платежи после даты',
        required: false
    })
    @IsDateString()
    @IsOptional()
    created_after?: string;

    @ApiProperty({
        example: '2024-12-31T23:59:59Z',
        description: 'Платежи до даты',
        required: false
    })
    @IsDateString()
    @IsOptional()
    created_before?: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'Поиск по email пользователя',
        required: false
    })
    @IsString()
    @IsOptional()
    user_email?: string;

    @ApiProperty({
        example: 'inv_abc123',
        description: 'Поиск по ID инвойса Monobank',
        required: false
    })
    @IsString()
    @IsOptional()
    monobank_invoice_id?: string;
}