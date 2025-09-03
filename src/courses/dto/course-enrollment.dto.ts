// src/courses/dto/course-enrollment.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollCourseDto {
    @ApiProperty({ description: 'ID курса для записи' })
    @IsString()
    courseId: string;

    @ApiProperty({ description: 'ID платежа для подтверждения оплаты', required: false })
    @IsOptional()
    @IsString()
    paymentId?: string;
}

export class AdminEnrollCourseDto extends EnrollCourseDto {
    @ApiProperty({ description: 'ID пользователя для записи' })
    @IsString()
    userId: string;

    @ApiProperty({ description: 'Принудительная запись даже после начала курса', required: false })
    @IsOptional()
    @IsBoolean()
    forceEnroll?: boolean;
}

export class CourseEnrollmentResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    message: string;

    @ApiProperty({ required: false })
    courseId?: string;

    @ApiProperty({ required: false })
    userId?: string;

    @ApiProperty({ required: false })
    enrolledAt?: Date;
}
