// src/subscriptions/dto/cancel-subscription.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CancelSubscriptionDto {
    @ApiProperty({
        example: 'Не подходит формат обучения',
        description: 'Причина отмены подписки'
    })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({
        example: true,
        description: 'Немедленная отмена (по умолчанию отмена в конце периода)',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    immediate?: boolean;
}