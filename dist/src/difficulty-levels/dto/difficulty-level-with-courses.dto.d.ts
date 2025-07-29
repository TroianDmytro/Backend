import { CourseCardDto } from '../../categories/dto/course-card.dto';
import { DifficultyLevelResponseDto } from './difficulty-level-response.dto';
export declare class DifficultyLevelWithCoursesDto extends DifficultyLevelResponseDto {
    courses: CourseCardDto[];
}
