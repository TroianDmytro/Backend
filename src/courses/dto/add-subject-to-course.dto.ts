import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class AddSubjectToCourseDto {
    @ApiProperty({
        description: 'ID предмета',
        example: '507f1f77bcf86cd799439011'
    })
    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @ApiProperty({
        description: 'ID преподавателя',
        example: '507f1f77bcf86cd799439012'
    })
    @IsString()
    @IsNotEmpty()
    teacherId: string;

    @ApiProperty({
        description: 'Дата начала предмета в курсе',
        example: '2024-02-01'
    })
    @IsDateString()
    startDate: string;
}