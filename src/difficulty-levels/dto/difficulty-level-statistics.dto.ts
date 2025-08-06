// src/difficulty-levels/dto/difficulty-level-statistics.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DifficultyLevelStatisticsDto {
    @ApiProperty({ example: 3, description: 'Общее количество уровней' })
    totalLevels: number;

    @ApiProperty({ example: 3, description: 'Количество активных уровней' })
    activeLevels: number;

    @ApiProperty({ example: 0, description: 'Количество неактивных уровней' })
    inactiveLevels: number;

    @ApiProperty({ example: 45, description: 'Общее количество курсов' })
    totalCourses: number;

    @ApiProperty({ example: 1250, description: 'Общее количество студентов' })
    totalStudents: number;

    @ApiProperty({ example: 4.2, description: 'Средний рейтинг' })
    averageRating: number;

    @ApiProperty({
        description: 'Детализация по уровням',
        type: [Object]
    })
    levelBreakdown: Array<{
        id: string;
        name: string;
        code: string;
        level: number;
        courses_count: number;
        students_count: number;
        average_rating: number;
        isActive: boolean;
    }>;
}