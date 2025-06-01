// src/teachers/dto/create-teacher.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsString, IsNumber, IsOptional, IsArray, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
    @ApiProperty({ example: 'teacher@example.com', description: 'Email преподавателя' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Пароль (минимум 6 символов)' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Иван', description: 'Имя преподавателя' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Иванов', description: 'Фамилия преподавателя' })
    @IsString()
    @IsNotEmpty()
    second_name: string;

    @ApiProperty({ example: 35, description: 'Возраст преподавателя', required: false })
    @IsNumber()
    @IsOptional()
    age?: number;

    @ApiProperty({ example: '+380 (67) 123-45-67', description: 'Номер телефона', required: false })
    @IsString()
    @IsOptional()
    telefon_number?: string;

    @ApiProperty({
        example: 'Опытный преподаватель программирования с 10-летним стажем',
        description: 'Описание преподавателя'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'Веб-разработка', description: 'Специализация', required: false })
    @IsString()
    @IsOptional()
    specialization?: string;

    @ApiProperty({ example: 'МГУ, факультет ВМК', description: 'Образование', required: false })
    @IsString()
    @IsOptional()
    education?: string;

    @ApiProperty({ example: 5, description: 'Опыт работы в годах', required: false })
    @IsNumber()
    @IsOptional()
    experience_years?: number;

    @ApiProperty({
        example: ['JavaScript', 'React', 'Node.js'],
        description: 'Навыки и умения',
        required: false
    })
    @IsArray()
    @IsOptional()
    skills?: string[];

    @ApiProperty({
        example: 'https://drive.google.com/file/d/abc123/view',
        description: 'Ссылка на CV файл',
        required: false
    })
    @IsUrl()
    @IsOptional()
    cv_file_url?: string;
}


