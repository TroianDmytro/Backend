//  src/payment/dto/payment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID платежа' })
    id: string;

    @ApiProperty({ example: 'p2_9ZgpZVKFqktfn', description: 'ID инвойса в Monobank' })
    invoiceId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID подписки' })
    subscriptionId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID пользователя' })
    userId: string;

    @ApiProperty({ example: 29999, description: 'Сумма в копейках' })
    amount: number;

    @ApiProperty({ example: 'UAH', description: 'Валюта' })
    currency: string;

    @ApiProperty({
        example: 'success',
        description: 'Статус платежа',
        enum: ['created', 'processing', 'hold', 'success', 'failure', 'reversed', 'expired']
    })
    status: string;

    @ApiProperty({ example: 'Успешно оплачен', description: 'Описание статуса' })
    statusDescription: string;

    @ApiProperty({
        example: 'https://pay.mbnk.biz/p2_9ZgpZVKFqktfn',
        description: 'URL страницы оплаты'
    })
    pageUrl?: string;

    @ApiProperty({ example: 'Оплата подписки на курс', description: 'Описание платежа' })
    description: string;

    @ApiProperty({ example: '220524A27D4A', description: 'Референс транзакции' })
    reference?: string;

    @ApiProperty({ example: '123456', description: 'Код авторизации' })
    approvalCode?: string;

    @ApiProperty({ example: '123456789012', description: 'RRN транзакции' })
    rrn?: string;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-15T10:35:00Z', description: 'Дата оплаты' })
    paidAt?: Date;
}
