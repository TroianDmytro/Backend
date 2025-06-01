// src/roles/dto/update-role.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
    @ApiProperty({ example: 'editor', description: 'Название роли', required: false })
    @IsString()
    @IsOptional()
    name?: string;
}