// src/users/dto/login-user.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({
        example: 'user123',
        description: 'Логин пользователя (генерируется автоматически при регистрации)'
    })
    @IsString({ message: 'Логин должен быть строкой' })
    @IsNotEmpty({ message: 'Логин обязателен' })
    login: string;

    @ApiProperty({
        example: 'Abc123!@',
        description: 'Пароль пользователя (отправляется на email после регистрации)'
    })
    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен' })
    password: string;
}