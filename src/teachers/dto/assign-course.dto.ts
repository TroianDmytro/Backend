// src/teachers/dto/assign-course.dto.ts
import { IsMongoId, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCourseDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID курса для назначения преподавателю'
    })
    @IsMongoId()
    @IsNotEmpty()
    courseId: string;
}