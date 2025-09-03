// src/lessons/dto/mark-attendance.dto.ts - ПОЛНАЯ ВЕРСИЯ
import { IsArray, ValidateNested, IsString, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AttendanceRecordDto {
    @ApiProperty({
        description: 'ID студента',
        example: '507f1f77bcf86cd799439011'
    })
    @IsString()
    studentId: string; // ИСПРАВЛЕНО: правильное название поля

    @ApiProperty({
        description: 'Присутствовал ли студент на занятии',
        example: true
    })
    @IsBoolean()
    isPresent: boolean;

    @ApiPropertyOptional({
        description: 'Оценка за занятие (1-5)',
        example: 4,
        minimum: 1,
        maximum: 5
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    lessonGrade?: number;

    @ApiPropertyOptional({
        description: 'Заметки преподавателя',
        example: 'Активно участвовал в обсуждении'
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class MarkAttendanceDto {
    @ApiProperty({
        description: 'Массив записей посещаемости',
        type: [AttendanceRecordDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceRecordDto)
    attendanceData: AttendanceRecordDto[];
}
