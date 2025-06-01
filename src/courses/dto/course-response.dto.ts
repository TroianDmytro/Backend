// src/courses/dto/course-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID курса' })
    id: string;

    @ApiProperty({ example: 'Основы веб-разработки', description: 'Название курса' })
    title: string;

    @ApiProperty({ example: 'Полный курс по изучению веб-разработки', description: 'Описание курса' })
    description: string;

    @ApiProperty({ example: 'Изучите веб-разработку с нуля', description: 'Краткое описание' })
    short_description?: string;

    @ApiProperty({ example: 'https://example.com/logo.png', description: 'URL логотипа' })
    logo_url?: string;

    @ApiProperty({ example: 'https://example.com/cover.jpg', description: 'URL обложки' })
    cover_image_url?: string;

    @ApiProperty({ example: 299.99, description: 'Цена курса' })
    price: number;

    @ApiProperty({ example: 199.99, description: 'Цена со скидкой' })
    discount_price?: number;

    @ApiProperty({ example: 'USD', description: 'Валюта' })
    currency: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID преподавателя' })
    teacherId: string;

    @ApiProperty({ description: 'Информация о преподавателе' })
    teacher?: {
        id: string;
        name: string;
        second_name: string;
        rating: number;
        experience_years: number;
    };

    @ApiProperty({ example: 'Программирование', description: 'Категория курса' })
    category?: string;

    @ApiProperty({ example: ['JavaScript', 'React'], description: 'Теги курса' })
    tags: string[];

    @ApiProperty({ example: 'beginner', description: 'Уровень сложности' })
    difficulty_level: string;

    @ApiProperty({ example: true, description: 'Опубликован ли курс' })
    isPublished: boolean;

    @ApiProperty({ example: true, description: 'Активен ли курс' })
    isActive: boolean;

    @ApiProperty({ example: false, description: 'Рекомендуемый курс' })
    isFeatured: boolean;

    @ApiProperty({ example: 40, description: 'Продолжительность в часах' })
    duration_hours: number;

    @ApiProperty({ example: 15, description: 'Количество уроков' })
    lessons_count: number;

    @ApiProperty({ example: 100, description: 'Максимальное количество студентов' })
    max_students: number;

    @ApiProperty({ example: 45, description: 'Текущее количество студентов' })
    current_students_count: number;

    @ApiProperty({ example: ['Базовые знания HTML'], description: 'Предварительные требования' })
    prerequisites: string[];

    @ApiProperty({ example: ['Создание сайтов'], description: 'Что изучит студент' })
    learning_outcomes: string[];

    @ApiProperty({ example: 4.5, description: 'Рейтинг курса' })
    rating: number;

    @ApiProperty({ example: 23, description: 'Количество отзывов' })
    reviews_count: number;

    @ApiProperty({ example: 'ru', description: 'Язык курса' })
    language?: string;

    @ApiProperty({ example: true, description: 'Выдается ли сертификат' })
    has_certificate: boolean;

    @ApiProperty({ example: 'https://youtube.com/watch?v=abc123', description: 'Промо-видео' })
    promo_video_url?: string;

    @ApiProperty({ example: ['Начинающие разработчики'], description: 'Целевая аудитория' })
    target_audience: string[];

    @ApiProperty({ example: '2024-01-15T00:00:00Z', description: 'Дата начала курса' })
    start_date?: Date;

    @ApiProperty({ example: '2024-06-15T00:00:00Z', description: 'Дата окончания курса' })
    end_date?: Date;

    @ApiProperty({ example: '2023-12-01T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2023-12-15T14:20:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}
