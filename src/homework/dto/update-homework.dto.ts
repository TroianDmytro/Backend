// src/homework/dto/update-homework.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateHomeworkDto } from './create-homework.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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