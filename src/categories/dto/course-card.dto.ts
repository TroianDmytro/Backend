// src/categories/dto/course-card.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CourseCardDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID курса' })
    id: string;

    @ApiProperty({ example: 'Основы JavaScript', description: 'Название курса' })
    title: string;

    @ApiProperty({ example: 'Изучите JavaScript с нуля', description: 'Краткое описание' })
    short_description?: string;

    @ApiProperty({ example: 'https://example.com/logo.png', description: 'Логотип курса' })
    logo_url?: string;

    @ApiProperty({ example: 299.99, description: 'Цена курса' })
    price: number;

    @ApiProperty({ example: 199.99, description: 'Цена со скидкой' })
    discount_price?: number;

    @ApiProperty({ example: 'USD', description: 'Валюта' })
    currency: string;

    @ApiProperty({ example: 4.5, description: 'Рейтинг курса' })
    rating: number;

    @ApiProperty({ example: 23, description: 'Количество отзывов' })
    reviews_count: number;

    @ApiProperty({ example: 45, description: 'Количество студентов' })
    current_students_count: number;

    @ApiProperty({ example: 40, description: 'Продолжительность в часах' })
    duration_hours: number;

    @ApiProperty({ example: 15, description: 'Количество уроков' })
    lessons_count: number;

    @ApiProperty({ example: 'beginner', description: 'Уровень сложности' })
    difficulty_level: string;

    @ApiProperty({
        description: 'Информация о преподавателе',
        example: { id: '123', name: 'Иван', second_name: 'Иванов' }
    })
    teacher: {
        id: string;
        name: string;
        second_name: string;
        rating?: number;
    };
}