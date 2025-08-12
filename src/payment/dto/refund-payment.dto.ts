// src/payment/dto/refund-payment.dto.ts
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundPaymentDto {
    @ApiProperty({
        example: 50000,
        description: 'Сумма возврата в копейках (если не указана, возвращается вся сумма)',
        required: false
    })
    @IsNumber()
    @Min(1)
    @IsOptional()
    amount?: number;

    @ApiProperty({
        example: 'По просьбе клиента',
        description: 'Причина возврата'
    })
    @IsString()
    @IsNotEmpty()
    reason: string;
}