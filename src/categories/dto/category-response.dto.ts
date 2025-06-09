// src/categories/dto/category-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID категории' })
    id: string;

    @ApiProperty({ example: 'Программирование', description: 'Название категории' })
    name: string;

    @ApiProperty({ example: 'programming', description: 'URL-friendly название' })
    slug: string;

    @ApiProperty({ example: 'Курсы по программированию', description: 'Описание' })
    description: string;

    @ApiProperty({ example: 'Изучите программирование', description: 'Краткое описание' })
    short_description?: string;

    @ApiProperty({ example: 'fas fa-code', description: 'Иконка' })
    icon?: string;

    @ApiProperty({ example: 'https://example.com/cat.jpg', description: 'Изображение' })
    image_url?: string;

    @ApiProperty({ example: '#3f51b5', description: 'Цвет' })
    color?: string;

    @ApiProperty({ example: null, description: 'ID родительской категории' })
    parent_id?: string;

    @ApiProperty({ example: true, description: 'Активна ли категория' })
    isActive: boolean;

    @ApiProperty({ example: false, description: 'Рекомендуемая категория' })
    isFeatured: boolean;

    @ApiProperty({ example: 1, description: 'Порядок отображения' })
    order: number;

    @ApiProperty({ example: 15, description: 'Количество курсов' })
    courses_count: number;

    @ApiProperty({ example: 250, description: 'Количество студентов' })
    students_count: number;

    @ApiProperty({ example: '2023-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-20T15:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}
