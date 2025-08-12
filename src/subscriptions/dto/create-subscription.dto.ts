// src/subscriptions/dto/create-subscription.dto.ts
import {
    IsNotEmpty,
    IsMongoId,
    IsOptional,
    IsBoolean,
    IsString
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
        example: '507f1f77bcf86cd799439012',
        description: 'ID плана подписки'
    })
    @IsMongoId()
    @IsNotEmpty()
    planId: string;

    @ApiProperty({
        example: false,
        description: 'Включить автопродление',
        required: false,
        default: false
    })
    @IsBoolean()
    @IsOptional()
    auto_renewal?: boolean;

    @ApiProperty({
        example: 'Подарочная подписка от администратора',
        description: 'Заметки администратора',
        required: false
    })
    @IsString()
    @IsOptional()
    notes?: string;
}






