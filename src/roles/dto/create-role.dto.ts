// src/roles/dto/create-role.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ example: 'admin', description: 'Название роли' })
    @IsString()
    @IsNotEmpty()
    name: string;
}