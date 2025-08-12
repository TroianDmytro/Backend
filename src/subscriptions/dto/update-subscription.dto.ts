// src/subscriptions/dto/update-subscription.dto.ts
import {
    IsOptional,
    IsEnum,
    IsString,
    IsBoolean,
    IsDateString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
    @ApiProperty({
        example: 'active',
        description: 'Статус подписки',
        enum: ['pending', 'active', 'expired', 'cancelled', 'suspended'],
        required: false
    })
    @IsEnum(['pending', 'active', 'expired', 'cancelled', 'suspended'])
    @IsOptional()
    status?: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';

    @ApiProperty({
        example: '2024-12-31T23:59:59Z',
        description: 'Новая дата окончания подписки',
        required: false
    })
    @IsDateString()
    @IsOptional()
    end_date?: string;

    @ApiProperty({
        example: true,
        description: 'Включить автопродление',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    auto_renewal?: boolean;

    @ApiProperty({
        example: 'Продлено администратором',
        description: 'Заметки администратора',
        required: false
    })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({
        example: 'Нарушение правил пользования',
        description: 'Причина приостановки (для статуса suspended)',
        required: false
    })
    @IsString()
    @IsOptional()
    suspension_reason?: string;

    @ApiProperty({
        example: 'По просьбе пользователя',
        description: 'Причина отмены (для статуса cancelled)',
        required: false
    })
    @IsString()
    @IsOptional()
    cancellation_reason?: string;
}