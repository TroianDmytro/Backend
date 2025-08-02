// src/homework/dto/submit-homework.dto.ts
import { IsMongoId, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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