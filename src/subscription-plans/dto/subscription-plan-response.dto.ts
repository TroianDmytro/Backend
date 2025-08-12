// src/subscription-plans/dto/subscription-plan-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID плана' })
    id: string;

    @ApiProperty({ example: 'Подписка на курс JavaScript', description: 'Название плана' })
    name: string;

    @ApiProperty({ example: 'Полный доступ к курсу на 3 месяца', description: 'Описание' })
    description: string;

    @ApiProperty({ example: 'course', description: 'Тип подписки' })
    type: 'course' | 'period';

    @ApiProperty({ example: 99900, description: 'Цена в копейках' })
    price: number;

    @ApiProperty({ example: 89910, description: 'Цена со скидкой в копейках' })
    discounted_price: number;

    @ApiProperty({ example: 'UAH', description: 'Валюта' })
    currency: string;

    @ApiProperty({ example: 10, description: 'Процент скидки' })
    discount_percent: number;

    @ApiProperty({ example: 3, description: 'Длительность в месяцах' })
    duration_months: number;

    @ApiProperty({
        example: {
            id: '507f1f77bcf86cd799439012',
            title: 'JavaScript для начинающих',
            image_url: 'https://example.com/course.jpg'
        },
        description: 'Информация о курсе (для type: course)',
        required: false
    })
    course?: {
        id: string;
        title: string;
        image_url?: string;
        teacher?: {
            name: string;
            second_name: string;
        };
    };

    @ApiProperty({ example: true, description: 'Включает все курсы' })
    includes_all_courses: boolean;

    @ApiProperty({
        example: ['Сертификат', 'Поддержка 24/7'],
        description: 'Дополнительные возможности'
    })
    included_features: string[];

    @ApiProperty({ example: true, description: 'Активен ли план' })
    is_active: boolean;

    @ApiProperty({ example: true, description: 'Доступен ли сейчас' })
    is_available_now: boolean;

    @ApiProperty({ example: 1000, description: 'Максимум подписок' })
    max_subscriptions: number;

    @ApiProperty({ example: 45, description: 'Текущее количество подписок' })
    current_subscriptions: number;

    @ApiProperty({ example: 150, description: 'Общее количество покупок' })
    total_purchases: number;

    @ApiProperty({ example: 1498500, description: 'Общая выручка в копейках' })
    total_revenue: number;

    @ApiProperty({ example: 4.5, description: 'Средняя оценка' })
    average_rating: number;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-20T15:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}