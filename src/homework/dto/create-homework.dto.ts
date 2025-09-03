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











