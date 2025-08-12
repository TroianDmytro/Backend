// src/subscriptions/dto/extend-subscription.dto.ts
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtendSubscriptionDto {
    @ApiProperty({
        example: 3,
        description: 'Количество месяцев для продления'
    })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    months: number;

    @ApiProperty({
        example: 'Бонусное продление за активность',
        description: 'Причина продления',
        required: false
    })
    @IsString()
    @IsOptional()
    reason?: string;
}