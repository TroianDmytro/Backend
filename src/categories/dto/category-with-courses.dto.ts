// src/categories/dto/category-with-courses.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CourseCardDto } from './course-card.dto';
import { CategoryResponseDto } from './category-response.dto';

export class CategoryWithCoursesDto extends CategoryResponseDto {
    @ApiProperty({
        type: [CourseCardDto],
        description: 'Список курсов в категории'
    })
    courses: CourseCardDto[];

    @ApiProperty({ example: 5, description: 'Количество подкатегорий' })
    subcategories_count?: number;
}