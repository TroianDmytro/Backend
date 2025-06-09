// src/difficulty-levels/dto/difficulty-level-with-courses.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CourseCardDto } from '../../categories/dto/course-card.dto';
import { DifficultyLevelResponseDto } from './difficulty-level-response.dto';

export class DifficultyLevelWithCoursesDto extends DifficultyLevelResponseDto {
    @ApiProperty({
        type: [CourseCardDto],
        description: 'Список курсов этого уровня'
    })
    courses: CourseCardDto[];
}