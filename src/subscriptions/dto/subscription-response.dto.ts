// src/subscriptions/dto/subscription-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID подписки' })
    id: string;

    @ApiProperty({
        example: {
            id: '507f1f77bcf86cd799439012',
            name: 'Иван',
            email: 'user@example.com'
        },
        description: 'Информация о пользователе'
    })
    user: {
        id: string;
        name?: string;
        email: string;
    };

    @ApiProperty({
        example: {
            id: '507f1f77bcf86cd799439013',
            name: 'Подписка на курс JavaScript',
            type: 'course'
        },
        description: 'Информация о плане'
    })
    plan: {
        id: string;
        name: string;
        type: 'course' | 'period';
        duration_months: number;
    };

    @ApiProperty({ example: '2024-01-15T00:00:00Z', description: 'Дата начала' })
    start_date: Date;

    @ApiProperty({ example: '2024-04-15T23:59:59Z', description: 'Дата окончания' })
    end_date: Date;

    @ApiProperty({ example: 'active', description: 'Статус подписки' })
    status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';

    @ApiProperty({ example: true, description: 'Активна ли подписка сейчас' })
    is_active: boolean;

    @ApiProperty({ example: 75, description: 'Оставшиеся дни' })
    days_remaining: number;

    @ApiProperty({ example: 25, description: 'Прогресс в процентах' })
    progress_percent: number;

    @ApiProperty({ example: 99900, description: 'Оплаченная сумма в копейках' })
    paid_amount: number;

    @ApiProperty({ example: 'UAH', description: 'Валюта оплаты' })
    paid_currency: string;

    @ApiProperty({ example: 'monobank', description: 'Способ оплаты' })
    payment_method?: string;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата оплаты' })
    payment_date?: Date;

    @ApiProperty({ example: false, description: 'Автопродление включено' })
    auto_renewal: boolean;

    @ApiProperty({ example: '2024-04-15T00:00:00Z', description: 'Дата автопродления' })
    auto_renewal_date?: Date;

    @ApiProperty({
        example: {
            name: 'Подписка на курс JavaScript',
            type: 'course',
            duration_months: 3,
            courseId: '507f1f77bcf86cd799439014'
        },
        description: 'Снимок плана на момент покупки'
    })
    plan_snapshot: {
        name: string;
        type: 'course' | 'period';
        duration_months: number;
        price: number;
        currency: string;
        courseId?: string;
        includes_all_courses?: boolean;
    };

    @ApiProperty({ example: 15, description: 'Количество использований' })
    usage_count: number;

    @ApiProperty({ example: '2024-01-20T14:25:00Z', description: 'Последнее использование' })
    last_used_at?: Date;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-20T15:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}