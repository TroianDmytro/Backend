// СОЗДАТЬ src/lessons/dto/attendance.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class AttendanceRecordDto {
    @ApiProperty({
        description: 'ID студента',
        example: '507f1f77bcf86cd799439013'
    })
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @ApiProperty({
        description: 'Присутствовал ли студент на занятии',
        example: true
    })
    @IsBoolean()
    isPresent: boolean;

    @ApiProperty({
        description: 'Оценка за урок (1-5)',
        example: 4,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    lessonGrade?: number;

    @ApiProperty({
        description: 'Дополнительные заметки',
        example: 'Активно участвовал в дискуссии',
        required: false
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class MarkAttendanceDto {
    @ApiProperty({
        type: [AttendanceRecordDto],
        description: 'Список записей о посещаемости'
    })
    attendance: AttendanceRecordDto[];
}
