// src/lessons/dto/create-lesson.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    IsUrl,
    IsBoolean,
    IsMongoId,
    Min,
    Max,
    IsDateString,
    ValidateNested,
    IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
    @ApiProperty({ example: 'Введение в JavaScript', description: 'Название видео' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'https://youtube.com/watch?v=abc123', description: 'Ссылка на видео' })
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @ApiProperty({ example: 15, description: 'Продолжительность видео в минутах' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration_minutes?: number;

    @ApiProperty({ example: 1, description: 'Порядковый номер видео в уроке' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    order?: number;
}

export class MaterialDto {
    @ApiProperty({ example: 'Конспект урока', description: 'Название материала' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'https://drive.google.com/file/d/abc123', description: 'Ссылка на файл' })
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @ApiProperty({
        example: 'pdf',
        description: 'Тип материала',
        enum: ['pdf', 'doc', 'ppt', 'image', 'link', 'other']
    })
    @IsEnum(['pdf', 'doc', 'ppt', 'image', 'link', 'other'])
    @IsNotEmpty()
    type: 'pdf' | 'doc' | 'ppt' | 'image' | 'link' | 'other';

    @ApiProperty({ example: 1024000, description: 'Размер файла в байтах' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    size_bytes?: number;
}

export class HomeworkFileDto {
    @ApiProperty({ example: 'Задание 1', description: 'Название файла задания' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'https://drive.google.com/file/d/xyz789', description: 'Ссылка на файл в Google Drive' })
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @ApiProperty({
        example: 'document',
        description: 'Тип файла',
        enum: ['document', 'template', 'example']
    })
    @IsEnum(['document', 'template', 'example'])
    @IsOptional()
    type?: 'document' | 'template' | 'example';
}

export class CreateLessonDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID курса, к которому относится урок'
    })
    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

    @ApiProperty({ example: 'Введение в веб-разработку', description: 'Название урока' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 'В этом уроке мы изучим основы HTML и CSS',
        description: 'Описание урока'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: 'Основы HTML и CSS',
        description: 'Краткое описание',
        required: false
    })
    @IsString()
    @IsOptional()
    short_description?: string;

    @ApiProperty({ example: 1, description: 'Порядковый номер урока в курсе' })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        example: 45,
        description: 'Продолжительность урока в минутах',
        required: false
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration_minutes?: number;

    @ApiProperty({
        example: 'HTML - это язык разметки гипертекста...',
        description: 'Текстовый контент урока',
        required: false
    })
    @IsString()
    @IsOptional()
    text_content?: string;

    @ApiProperty({
        example: '<h1>HTML Basics</h1><p>HTML - это...</p>',
        description: 'HTML контент урока',
        required: false
    })
    @IsString()
    @IsOptional()
    content_html?: string;

    @ApiProperty({
        description: 'Видео материалы урока',
        type: [VideoDto],
        required: false
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VideoDto)
    @IsOptional()
    videos?: VideoDto[];

    @ApiProperty({
        description: 'Дополнительные материалы урока',
        type: [MaterialDto],
        required: false
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialDto)
    @IsOptional()
    materials?: MaterialDto[];

    @ApiProperty({
        example: 'Создайте простую HTML страницу с заголовком и абзацем',
        description: 'Описание домашнего задания',
        required: false
    })
    @IsString()
    @IsOptional()
    homework_description?: string;

    @ApiProperty({
        description: 'Файлы домашнего задания',
        type: [HomeworkFileDto],
        required: false
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HomeworkFileDto)
    @IsOptional()
    homework_files?: HomeworkFileDto[];

    @ApiProperty({
        example: '2024-02-01T23:59:59Z',
        description: 'Срок сдачи домашнего задания',
        required: false
    })
    @IsDateString()
    @IsOptional()
    homework_deadline?: string;

    @ApiProperty({
        example: 100,
        description: 'Максимальная оценка за домашнее задание',
        required: false
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    homework_max_score?: number;

    @ApiProperty({
        example: true,
        description: 'Активен ли урок',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
        example: false,
        description: 'Опубликован ли урок',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiProperty({
        example: false,
        description: 'Бесплатный ли урок',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isFree?: boolean;

    @ApiProperty({
        example: ['507f1f77bcf86cd799439012'],
        description: 'ID уроков-предварительных требований',
        required: false
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    prerequisites?: string[];
}





