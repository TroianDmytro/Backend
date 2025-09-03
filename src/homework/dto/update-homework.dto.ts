// src/homework/dto/update-homework.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateHomeworkDto } from './create-homework.dto';

export class UpdateHomeworkDto extends PartialType(CreateHomeworkDto) {
    @ApiProperty({
        example: true,
        description: 'Активно ли задание',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}