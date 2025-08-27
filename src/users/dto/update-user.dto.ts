// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEmail, MinLength, Max, Min, IsMongoId } from 'class-validator';

export class UpdateUserDto {
    // ID аватара для связывания с пользователем
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID аватара из коллекции avatars',
        required: false
    })
    @IsOptional()
    @IsMongoId({ message: 'Некорректный формат ID аватара' })
    avatarId?: string;

    @ApiProperty({ example: 'user@example.com', description: 'Email пользователя', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'Иван', description: 'Имя пользователя', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя', required: false })
    @IsOptional()
    @IsString()
    second_name?: string;

    @ApiProperty({ example: 25, description: 'Возраст пользователя', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(150)
    age?: number;

    @ApiProperty({ example: '+1234567890', description: 'Телефонный номер пользователя', required: false })
    @IsOptional()
    @IsString()
    telefon_number?: string;

    // @ApiProperty({ example: 'password123', description: 'Новый пароль', required: false })
    // @IsOptional()
    // @IsString()
    // @MinLength(6)
    // password?: string;
}