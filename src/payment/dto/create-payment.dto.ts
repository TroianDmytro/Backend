// src/payment/dto/create-payment.dto.ts
import {
    IsNotEmpty,
    IsMongoId,
    IsOptional,
    IsString,
    IsObject
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID пользователя'
    })
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'ID плана подписки'
    })
    @IsMongoId()
    @IsNotEmpty()
    planId: string;

    @ApiProperty({
        example: 'https://mysite.com/success',
        description: 'URL для редиректа после успешной оплаты',
        required: false
    })
    @IsString()
    @IsOptional()
    success_url?: string;

    @ApiProperty({
        example: 'https://mysite.com/cancel',
        description: 'URL для редиректа после отмены оплаты',
        required: false
    })
    @IsString()
    @IsOptional()
    cancel_url?: string;

    @ApiProperty({
        example: { coupon_code: 'DISCOUNT10' },
        description: 'Дополнительные метаданные',
        required: false
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}









