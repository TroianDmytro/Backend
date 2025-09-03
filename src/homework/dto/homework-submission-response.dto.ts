// src/homework/dto/homework-submission-response.dto.ts
import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsDateString,
    Min,
    Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HomeworkSubmissionResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID отправки' })
    id: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID задания' })
    homeworkId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439014', description: 'ID студента' })
    studentId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439015', description: 'ID курса' })
    courseId: string;

    @ApiProperty({ description: 'Информация о студенте' })
    student?: {
        id: string;
        email: string;
        name: string;
        second_name: string;
    };

    @ApiProperty({ description: 'Информация о задании' })
    homework?: {
        id: string;
        title: string;
        description: string;
        max_score: number;
    };

    @ApiProperty({ description: 'Информация о курсе' })
    course?: {
        id: string;
        title: string;
    };

    @ApiProperty({ example: 'Выполнил все требования', description: 'Комментарий студента' })
    student_comment?: string;

    @ApiProperty({ example: 'submitted', description: 'Статус проверки' })
    status: 'submitted' | 'in_review' | 'reviewed' | 'returned_for_revision';

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата отправки' })
    submitted_at: Date;

    @ApiProperty({ example: '507f1f77bcf86cd799439016', description: 'ID проверяющего преподавателя' })
    reviewed_by?: string;

    @ApiProperty({ example: '2024-01-18T14:20:00Z', description: 'Дата проверки' })
    reviewed_at?: Date;

    @ApiProperty({ example: 90, description: 'Оценка' })
    score?: number;

    @ApiProperty({ example: 'Отличная работа!', description: 'Комментарий преподавателя' })
    teacher_comment?: string;

    @ApiProperty({ description: 'Детальная обратная связь' })
    detailed_feedback?: Array<{
        criteria: string;
        score: number;
        comment?: string;
    }>;

    @ApiProperty({ example: 1, description: 'Номер попытки' })
    attempt_number: number;

    @ApiProperty({ example: false, description: 'Сдано с опозданием' })
    is_late: boolean;

    @ApiProperty({ description: 'Файлы работы' })
    files: Array<{
        filename: string;
        original_name: string;
        size_bytes: number;
        mime_type: string;
        uploaded_at: Date;
    }>;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-18T14:20:00Z', description: 'Дата обновления' })
    updatedAt: Date;
    @ApiProperty({ description: 'Название задания' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Описание задания' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'ID урока' })
    @IsString()
    lessonId: string;

    // ✅ ДОБАВИТЬ НЕДОСТАЮЩИЕ ПОЛЯ:
    @ApiProperty({ description: 'Крайний срок сдачи', required: false })
    @IsOptional()
    @IsDateString()
    deadline?: string;

    @ApiProperty({ description: 'Максимальный балл', required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    max_score?: number;

    @ApiProperty({ description: 'Максимальное количество попыток', required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    max_attempts?: number;

    @ApiProperty({ description: 'Разрешить сдачу после дедлайна', required: false })
    @IsOptional()
    @IsBoolean()
    allow_late_submission?: boolean;
}