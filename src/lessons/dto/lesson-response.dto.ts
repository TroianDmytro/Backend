// src/lessons/dto/lesson-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LessonResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID урока' })
    id: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID курса' })
    courseId: string;

    @ApiProperty({ example: 'Введение в веб-разработку', description: 'Название урока' })
    title: string;

    @ApiProperty({ example: 'В этом уроке мы изучим основы HTML и CSS', description: 'Описание урока' })
    description: string;

    @ApiProperty({ example: 'Основы HTML и CSS', description: 'Краткое описание' })
    short_description?: string;

    @ApiProperty({ example: 1, description: 'Порядковый номер урока в курсе' })
    order: number;

    @ApiProperty({ example: 45, description: 'Продолжительность урока в минутах' })
    duration_minutes: number;

    @ApiProperty({ example: 'HTML - это язык разметки...', description: 'Текстовый контент урока' })
    text_content?: string;

    @ApiProperty({ example: '<h1>HTML Basics</h1>', description: 'HTML контент урока' })
    content_html?: string;

    @ApiProperty({ description: 'Видео материалы урока' })
    videos: Array<{
        title: string;
        url: string;
        duration_minutes: number;
        order: number;
    }>;

    @ApiProperty({ description: 'Дополнительные материалы урока' })
    materials: Array<{
        title: string;
        url: string;
        type: string;
        size_bytes: number;
    }>;

    @ApiProperty({ example: 'Создайте простую HTML страницу', description: 'Описание домашнего задания' })
    homework_description?: string;

    @ApiProperty({ description: 'Файлы домашнего задания' })
    homework_files: Array<{
        title: string;
        url: string;
        type: string;
    }>;

    @ApiProperty({ example: '2024-02-01T23:59:59Z', description: 'Срок сдачи домашнего задания' })
    homework_deadline?: Date;

    @ApiProperty({ example: 100, description: 'Максимальная оценка за домашнее задание' })
    homework_max_score?: number;

    @ApiProperty({ example: true, description: 'Активен ли урок' })
    isActive: boolean;

    @ApiProperty({ example: false, description: 'Опубликован ли урок' })
    isPublished: boolean;

    @ApiProperty({ example: false, description: 'Бесплатный ли урок' })
    isFree: boolean;

    @ApiProperty({ example: ['507f1f77bcf86cd799439013'], description: 'ID предварительных уроков' })
    prerequisites: string[];

    @ApiProperty({ example: '2023-12-01T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2023-12-15T14:20:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}