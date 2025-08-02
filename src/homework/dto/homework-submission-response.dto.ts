import { ApiProperty } from "@nestjs/swagger";

// src/homework/dto/homework-submission-response.dto.ts
export class HomeworkSubmissionResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID отправки' })
    id: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID задания' })
    homeworkId: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID урока' })
    lessonId: string;

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
}