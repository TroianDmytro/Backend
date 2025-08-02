import { ApiProperty } from "@nestjs/swagger";

// src/homework/dto/homework-response.dto.ts
export class HomeworkResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID задания' })
    id: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID урока' })
    lessonId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID курса' })
    courseId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439014', description: 'ID преподавателя' })
    teacherId: string;

    @ApiProperty({ example: 'Создание веб-приложения', description: 'Название задания' })
    title: string;

    @ApiProperty({ example: 'Создайте веб-приложение...', description: 'Описание задания' })
    description: string;

    @ApiProperty({ example: 'Используйте семантические теги...', description: 'Требования' })
    requirements?: string;

    @ApiProperty({ example: '2024-02-15T23:59:59Z', description: 'Срок сдачи' })
    deadline?: Date;

    @ApiProperty({ example: 100, description: 'Максимальная оценка' })
    max_score: number;

    @ApiProperty({ example: 3, description: 'Максимальное количество попыток' })
    max_attempts: number;

    @ApiProperty({ example: true, description: 'Разрешено ли опоздание' })
    allow_late_submission: boolean;

    @ApiProperty({ example: true, description: 'Активно ли задание' })
    isActive: boolean;

    @ApiProperty({ example: true, description: 'Опубликовано ли задание' })
    isPublished: boolean;

    @ApiProperty({ example: 15, description: 'Количество отправленных работ' })
    submissions_count: number;

    @ApiProperty({ example: 12, description: 'Количество проверенных работ' })
    completed_count: number;

    @ApiProperty({ example: 87.5, description: 'Средняя оценка' })
    average_score: number;

    @ApiProperty({ description: 'Файлы задания' })
    files: Array<{
        filename: string;
        original_name: string;
        size_bytes: number;
        mime_type: string;
        uploaded_at: Date;
    }>;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-20T15:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}
