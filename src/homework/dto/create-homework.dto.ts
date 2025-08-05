// src/homework/dto/create-homework.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsMongoId,
    IsDateString,
    Min,
    Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHomeworkDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID урока'
    })
    @IsMongoId()
    @IsNotEmpty()
    lessonId: string;

    @ApiProperty({
        example: 'Создание веб-приложения',
        description: 'Название задания'
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 'Создайте простое веб-приложение используя HTML, CSS и JavaScript',
        description: 'Описание задания'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'Используйте семантические HTML теги, адаптивную верстку',
        description: 'Требования к выполнению',
        required: false
    })
    @IsString()
    @IsOptional()
    requirements?: string;

    @ApiProperty({
        example: '2024-02-15T23:59:59Z',
        description: 'Срок сдачи задания',
        required: false
    })
    @IsDateString()
    @IsOptional()
    deadline?: string;

    @ApiProperty({
        example: 100,
        description: 'Максимальная оценка за задание (0-100)',
        required: false
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    max_score?: number;

    @ApiProperty({
        example: 3,
        description: 'Максимальное количество попыток',
        required: false
    })
    @IsNumber()
    @Min(1)
    @IsOptional()
    max_attempts?: number;

    @ApiProperty({
        example: true,
        description: 'Разрешить сдачу после дедлайна',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    allow_late_submission?: boolean;

    @ApiProperty({
        example: false,
        description: 'Опубликовать задание сразу',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}

// src/homework/dto/update-homework.dto.ts
import { PartialType } from '@nestjs/swagger';

export class UpdateHomeworkDto extends PartialType(CreateHomeworkDto) {
    @ApiProperty({
        example: true,
        description: 'Активно ли задание',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

// src/homework/dto/submit-homework.dto.ts
export class SubmitHomeworkDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID домашнего задания'
    })
    @IsMongoId()
    @IsNotEmpty()
    homeworkId: string;

    @ApiProperty({
        example: 'Выполнил все требования, добавил дополнительные функции',
        description: 'Комментарий студента к работе',
        required: false
    })
    @IsString()
    @IsOptional()
    student_comment?: string;
}

// src/homework/dto/review-homework.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class DetailedFeedbackDto {
    @ApiProperty({ example: 'Качество кода', description: 'Критерий оценки' })
    @IsString()
    @IsNotEmpty()
    criteria: string;

    @ApiProperty({ example: 85, description: 'Оценка по критерию (0-100)' })
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;

    @ApiProperty({
        example: 'Код хорошо структурирован, но нужно добавить комментарии',
        description: 'Комментарий по критерию',
        required: false
    })
    @IsString()
    @IsOptional()
    comment?: string;
}

export class ReviewHomeworkDto {
    @ApiProperty({
        example: 90,
        description: 'Общая оценка за задание (0-100)'
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;

    @ApiProperty({
        example: 'Отличная работа! Все требования выполнены. Рекомендую добавить больше комментариев в код.',
        description: 'Комментарий преподавателя'
    })
    @IsString()
    @IsNotEmpty()
    teacher_comment: string;

    @ApiProperty({
        description: 'Детальная оценка по критериям',
        type: [DetailedFeedbackDto],
        required: false
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailedFeedbackDto)
    @IsOptional()
    detailed_feedback?: DetailedFeedbackDto[];

    @ApiProperty({
        example: 'reviewed',
        description: 'Статус после проверки',
        enum: ['reviewed', 'returned_for_revision']
    })
    @IsString()
    @IsOptional()
    status?: 'reviewed' | 'returned_for_revision';
}

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