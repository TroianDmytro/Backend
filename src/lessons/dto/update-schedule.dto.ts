// СОЗДАТЬ src/lessons/dto/update-schedule.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, Matches } from 'class-validator';

export class UpdateLessonScheduleDto {
    @ApiProperty({
        description: 'Новая дата урока',
        example: '2024-02-15',
        required: false
    })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiProperty({
        description: 'Время начала урока (HH:MM)',
        example: '09:00',
        required: false
    })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Время должно быть в формате HH:MM'
    })
    startTime?: string;

    @ApiProperty({
        description: 'Время окончания урока (HH:MM)',
        example: '10:30',
        required: false
    })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Время должно быть в формате HH:MM'
    })
    endTime?: string;
}
