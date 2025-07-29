import { CourseCardDto } from './course-card.dto';
import { CategoryResponseDto } from './category-response.dto';
export declare class CategoryWithCoursesDto extends CategoryResponseDto {
    courses: CourseCardDto[];
    subcategories_count?: number;
}
