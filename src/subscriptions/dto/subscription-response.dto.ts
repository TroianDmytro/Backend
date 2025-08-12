// src/subscriptions/dto/subscription-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';


export class SubscriptionResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID подписки' })
    id: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID пользователя' })
    userId: string;

    @ApiProperty({ description: 'Информация о пользователе' })
    user?: {
        id: string;
        email: string;
        name: string;
        second_name: string;
    };

    @ApiProperty({ example: 'course', description: 'Тип подписки' })
    subscription_type: 'course' | 'period';

    @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID курса' })
    courseId?: string;

    @ApiProperty({ description: 'Информация о курсе' })
    course?: {
        id: string;
        title: string;
        description: string;
        price: number;
        teacherId: string;
        teacher?: {
            name: string;
            second_name: string;
        };
    };

    @ApiProperty({ example: '3_months', description: 'Тип периода' })
    period_type?: '1_month' | '3_months' | '6_months' | '12_months';

    @ApiProperty({ example: '2024-01-15T00:00:00Z', description: 'Дата начала подписки' })
    start_date: Date;

    @ApiProperty({ example: '2024-04-15T00:00:00Z', description: 'Дата окончания подписки' })
    end_date: Date;

    @ApiProperty({ example: 'active', description: 'Статус подписки' })
    status: 'active' | 'expired' | 'cancelled' | 'pending';

    @ApiProperty({ example: 299.99, description: 'Цена подписки' })
    price: number;

    @ApiProperty({ example: 'USD', description: 'Валюта' })
    currency: string;

    @ApiProperty({ example: 50, description: 'Размер скидки' })
    discount_amount?: number;

    @ApiProperty({ example: 'PROMO2024', description: 'Промокод' })
    discount_code?: string;

    @ApiProperty({ example: 'credit_card', description: 'Способ оплаты' })
    payment_method?: string;

    @ApiProperty({ example: 'TXN123456789', description: 'ID транзакции оплаты' })
    payment_transaction_id?: string;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата оплаты' })
    payment_date?: Date;

    @ApiProperty({ example: true, description: 'Оплачена ли подписка' })
    is_paid: boolean;

    @ApiProperty({ example: false, description: 'Автоматическое продление' })
    auto_renewal: boolean;

    @ApiProperty({ example: '2024-04-15T00:00:00Z', description: 'Дата следующего списания' })
    next_billing_date?: Date;

    @ApiProperty({ example: 75, description: 'Процент прохождения курса' })
    progress_percentage: number;

    @ApiProperty({ example: 8, description: 'Количество пройденных уроков' })
    completed_lessons: number;

    @ApiProperty({ example: 12, description: 'Общее количество уроков' })
    total_lessons: number;

    @ApiProperty({ example: '2024-01-20T15:45:00Z', description: 'Дата последнего доступа' })
    last_accessed?: Date;

    @ApiProperty({ example: true, description: 'Уведомления по email' })
    email_notifications: boolean;

    @ApiProperty({ example: 'Не подходит формат обучения', description: 'Причина отмены' })
    cancellation_reason?: string;

    @ApiProperty({ example: '2024-02-01T12:00:00Z', description: 'Дата отмены' })
    cancelled_at?: Date;

    @ApiProperty({ example: '507f1f77bcf86cd799439014', description: 'Кто отменил подписку' })
    cancelled_by?: string;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-20T15:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;

    // Виртуальные поля
    @ApiProperty({ example: true, description: 'Активна ли подписка в данный момент' })
    is_active?: boolean;

    @ApiProperty({ example: 45, description: 'Дней до окончания подписки' })
    days_remaining?: number;
}
