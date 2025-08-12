// src/subscriptions/dto/subscription-filter.dto.ts
import {
    IsOptional,
    IsEnum,
    IsMongoId,
    IsDateString,
    IsString,
    IsBoolean
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionFilterDto {
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
        example: 'active',
        description: 'Фильтр по статусу',
        enum: ['pending', 'active', 'expired', 'cancelled', 'suspended'],
        required: false
    })
    @IsEnum(['pending', 'active', 'expired', 'cancelled', 'suspended'])
    @IsOptional()
    status?: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';

    @ApiProperty({
        example: 'course',
        description: 'Фильтр по типу подписки',
        enum: ['course', 'period'],
        required: false
    })
    @IsEnum(['course', 'period'])
    @IsOptional()
    type?: 'course' | 'period';

    @ApiProperty({
        example: true,
        description: 'Только активные подписки',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    only_active?: boolean;

    @ApiProperty({
        example: '2024-01-01T00:00:00Z',
        description: 'Подписки, созданные после даты',
        required: false
    })
    @IsDateString()
    @IsOptional()
    created_after?: string;

    @ApiProperty({
        example: '2024-12-31T23:59:59Z',
        description: 'Подписки, созданные до даты',
        required: false
    })
    @IsDateString()
    @IsOptional()
    created_before?: string;

    @ApiProperty({
        example: '2024-04-30T23:59:59Z',
        description: 'Подписки, истекающие до даты',
        required: false
    })
    @IsDateString()
    @IsOptional()
    expires_before?: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'Поиск по email пользователя',
        required: false
    })
    @IsString()
    @IsOptional()
    user_email?: string;
}
