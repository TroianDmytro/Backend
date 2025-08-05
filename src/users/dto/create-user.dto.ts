// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email пользователя для регистрации'
    })
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsNotEmpty({ message: 'Email обязателен' })
    email: string;
}

export class VerifyEmailCodeDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email пользователя'
    })
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsNotEmpty({ message: 'Email обязателен' })
    email: string;

    @ApiProperty({
        example: '123456',
        description: '6-значный код подтверждения'
    })
    @IsString({ message: 'Код должен быть строкой' })
    @IsNotEmpty({ message: 'Код подтверждения обязателен' })
    code: string;

    @ApiProperty({
        example: 'Иван',
        description: 'Имя пользователя (необязательно)'
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: 'Иванов',
        description: 'Фамилия пользователя (необязательно)'
    })
    @IsString()
    @IsOptional()
    second_name?: string;

    @ApiProperty({
        example: 25,
        description: 'Возраст пользователя (необязательно)'
    })
    @IsOptional()
    age?: number;

    @ApiProperty({
        example: '+380 (67) 123-45-67',
        description: 'Номер телефона (необязательно)'
    })
    @IsString()
    @IsOptional()
    telefon_number?: string;
}