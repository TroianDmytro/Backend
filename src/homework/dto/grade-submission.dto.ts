// СОЗДАТЬ src/homework/dto/grade-submission.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class GradeSubmissionDto {
    @ApiProperty({
        description: 'Оценка за работу (1-5)',
        example: 4
    })
    @IsNumber()
    @Min(1)
    @Max(5)
    grade: number;

    @ApiProperty({
        description: 'Обратная связь от преподавателя',
        example: 'Хорошая работа, но есть замечания по стилю кода',
        required: false
    })
    @IsOptional()
    @IsString()
    feedback?: string;
}