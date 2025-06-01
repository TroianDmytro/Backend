// users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Пароль пользователя (минимум 6 символов)' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Иван', description: 'Имя пользователя', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя', required: false })
    @IsString()
    @IsOptional()
    second_name?: string;

    @ApiProperty({ example: 25, description: 'Возраст пользователя', required: false })
    @IsNumber()
    @IsOptional()
    age?: number;

    @ApiProperty({ example: '+380 (67) 123-45-67', description: 'Номер телефона пользователя', required: false })
    @IsString()
    @IsOptional()
    telefon_number?: string;
}
