// src/payment/dto/create-payment.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID подписки для оплаты'
    })
    @IsMongoId()
    @IsNotEmpty()
    subscriptionId: string;

    @ApiProperty({
        example: 299.99,
        description: 'Сумма платежа в указанной валюте'
    })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({
        example: 'UAH',
        description: 'Валюта платежа',
        enum: ['UAH', 'USD', 'EUR']
    })
    @IsEnum(['UAH', 'USD', 'EUR'])
    currency: string;

    @ApiProperty({
        example: 'Оплата подписки на курс JavaScript',
        description: 'Описание платежа'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'https://mysite.com/payment/success',
        description: 'URL для редиректа после успешной оплаты',
        required: false
    })
    @IsString()
    @IsOptional()
    redirectUrl?: string;
}
