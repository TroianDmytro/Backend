// src/difficulty-levels/dto/difficulty-level-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DifficultyLevelResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID уровня' })
    id: string;

    @ApiProperty({ example: 'Начальный', description: 'Название уровня' })
    name: string;

    @ApiProperty({ example: 'beginner', description: 'URL-friendly название' })
    slug: string;

    @ApiProperty({ example: 'beginner', description: 'Код уровня' })
    code: string;

    @ApiProperty({ example: 'Для начинающих', description: 'Описание' })
    description: string;

    @ApiProperty({ example: 'Начните с основ', description: 'Краткое описание' })
    short_description?: string;

    @ApiProperty({ example: 'fas fa-user-graduate', description: 'Иконка' })
    icon?: string;

    @ApiProperty({ example: '#4caf50', description: 'Цвет' })
    color?: string;

    @ApiProperty({ example: 1, description: 'Числовой уровень' })
    level: number;

    @ApiProperty({ example: 1, description: 'Порядок отображения' })
    order: number;

    @ApiProperty({ example: ['Базовые знания'], description: 'Требования' })
    prerequisites: string[];

    @ApiProperty({ example: ['Новички'], description: 'Целевая аудитория' })
    target_audience: string[];

    @ApiProperty({ example: 40, description: 'Рекомендуемые часы' })
    recommended_hours?: number;

    @ApiProperty({ example: true, description: 'Активен ли уровень' })
    isActive: boolean;

    @ApiProperty({ example: 25, description: 'Количество курсов' })
    courses_count: number;

    @ApiProperty({ example: 500, description: 'Количество студентов' })
    students_count: number;

    @ApiProperty({ example: 75.5, description: 'Средний процент завершения' })
    average_completion_rate: number;

    @ApiProperty({ example: '2023-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-20T15:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}