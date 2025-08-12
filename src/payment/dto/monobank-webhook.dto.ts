// src/payment/dto/monobank-webhook.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsObject
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MonobankWebhookDto {
    @ApiProperty({
        example: 'inv_abc123def456',
        description: 'ID инвойса в Monobank'
    })
    @IsString()
    @IsNotEmpty()
    invoiceId: string;

    @ApiProperty({
        example: 'success',
        description: 'Статус платежа',
        enum: ['processing', 'hold', 'success', 'failure', 'reversed']
    })
    @IsString()
    @IsNotEmpty()
    status: 'processing' | 'hold' | 'success' | 'failure' | 'reversed';

    @ApiProperty({
        example: 99900,
        description: 'Сумма в копейках'
    })
    @IsNumber()
    @IsOptional()
    amount?: number;

    @ApiProperty({
        example: 'abc123xyz789',
        description: 'Код авторизации'
    })
    @IsString()
    @IsOptional()
    approvalCode?: string;

    @ApiProperty({
        example: 'txn_789xyz123',
        description: 'ID транзакции'
    })
    @IsString()
    @IsOptional()
    rrn?: string;

    @ApiProperty({
        example: 'Insufficient funds',
        description: 'Описание ошибки (для неуспешных платежей)'
    })
    @IsString()
    @IsOptional()
    failureReason?: string;

    @ApiProperty({
        example: { custom_field: 'value' },
        description: 'Дополнительная информация'
    })
    @IsObject()
    @IsOptional()
    reference?: Record<string, any>;

    @ApiProperty({
        example: 'signature_hash_here',
        description: 'Подпись webhook для верификации'
    })
    @IsString()
    @IsNotEmpty()
    signature: string;
}