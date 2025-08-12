// src/payment/dto/payment-statistics.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatisticsDto {
    @ApiProperty({ example: 1250, description: 'Общее количество платежей' })
    total_payments: number;

    @ApiProperty({ example: 1100, description: 'Успешные платежи' })
    successful_payments: number;

    @ApiProperty({ example: 88, description: 'Процент успешных платежей' })
    success_rate: number;

    @ApiProperty({ example: 12495000, description: 'Общая сумма в копейках' })
    total_amount: number;

    @ApiProperty({ example: 10995000, description: 'Успешно оплаченная сумма' })
    successful_amount: number;

    @ApiProperty({ example: 1500000, description: 'Сумма возвратов' })
    refunded_amount: number;

    @ApiProperty({
        example: {
            'UAH': 11500000,
            'USD': 995000
        },
        description: 'Суммы по валютам'
    })
    by_currency: Record<string, number>;

    @ApiProperty({
        example: {
            'success': 1100,
            'failed': 100,
            'pending': 30,
            'cancelled': 20
        },
        description: 'Количество по статусам'
    })
    by_status: Record<string, number>;

    @ApiProperty({ example: 99900, description: 'Средняя сумма платежа' })
    average_amount: number;

    @ApiProperty({
        example: [
            { date: '2024-01-15', amount: 495000, count: 5 },
            { date: '2024-01-16', amount: 795000, count: 8 }
        ],
        description: 'Статистика по дням (последние 30 дней)'
    })
    daily_stats: Array<{
        date: string;
        amount: number;
        count: number;
    }>;
}