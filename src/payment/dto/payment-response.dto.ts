// src/payment/dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID платежа' })
    id: string;

    @ApiProperty({
        example: {
            id: '507f1f77bcf86cd799439012',
            email: 'user@example.com',
            name: 'Иван Иванов'
        },
        description: 'Информация о пользователе'
    })
    user: {
        id: string;
        email: string;
        name?: string;
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
    };

    @ApiProperty({ example: 99900, description: 'Сумма в копейках' })
    amount: number;

    @ApiProperty({ example: 9990, description: 'Размер скидки в копейках' })
    discount_amount: number;

    @ApiProperty({ example: 89910, description: 'Итоговая сумма к оплате' })
    final_amount: number;

    @ApiProperty({ example: 'UAH', description: 'Валюта' })
    currency: string;

    @ApiProperty({ example: 'pending', description: 'Статус платежа' })
    status: 'created' | 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';

    @ApiProperty({ example: 'https://pay.mbnk.biz/p/abc123', description: 'Ссылка на оплату' })
    payment_url?: string;

    @ApiProperty({ example: '2024-01-15T11:30:00Z', description: 'Срок действия ссылки' })
    payment_link_expires_at?: Date;

    @ApiProperty({ example: 15, description: 'Минут до истечения ссылки' })
    link_expires_in_minutes: number;

    @ApiProperty({ example: 'inv_abc123def456', description: 'ID инвойса Monobank' })
    monobank_invoice_id?: string;

    @ApiProperty({ example: 'txn_789xyz123', description: 'ID транзакции Monobank' })
    monobank_transaction_id?: string;

    @ApiProperty({ example: '2024-01-15T10:45:00Z', description: 'Дата оплаты' })
    paid_at?: Date;

    @ApiProperty({ example: 'Insufficient funds', description: 'Причина неудачи' })
    failure_reason?: string;

    @ApiProperty({ example: 1, description: 'Номер попытки оплаты' })
    attempt_number: number;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-15T10:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}