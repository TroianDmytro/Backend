// СОЗДАТЬ src/homework/dto/create-homework.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateHomeworkDto {
    @ApiProperty({
        description: 'Название домашнего задания',
        example: 'Создание веб-приложения на React'
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Описание задания',
        example: 'Создайте простое веб-приложение...',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Крайний срок сдачи',
        example: '2024-02-20T23:59:59Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    dueDate?: string;
}