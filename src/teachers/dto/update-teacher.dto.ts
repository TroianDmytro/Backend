// src/teachers/dto/update-teacher.dto.ts
import { IsOptional, IsString, IsNumber, IsEmail, MinLength, IsArray, IsUrl, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeacherDto {
    @ApiProperty({ example: 'teacher@example.com', description: 'Email преподавателя', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'Иван', description: 'Имя преподавателя', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'Иванов', description: 'Фамилия преподавателя', required: false })
    @IsOptional()
    @IsString()
    second_name?: string;

    @ApiProperty({ example: 35, description: 'Возраст преподавателя', required: false })
    @IsOptional()
    @IsNumber()
    age?: number;

    @ApiProperty({ example: '+380 (67) 123-45-67', description: 'Номер телефона', required: false })
    @IsOptional()
    @IsString()
    telefon_number?: string;

    @ApiProperty({
        example: 'Обновленное описание преподавателя',
        description: 'Описание преподавателя',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'Веб-разработка', description: 'Специализация', required: false })
    @IsOptional()
    @IsString()
    specialization?: string;

    @ApiProperty({ example: 'МГУ, факультет ВМК', description: 'Образование', required: false })
    @IsOptional()
    @IsString()
    education?: string;

    @ApiProperty({ example: 7, description: 'Опыт работы в годах', required: false })
    @IsOptional()
    @IsNumber()
    experience_years?: number;

    @ApiProperty({
        example: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        description: 'Навыки и умения',
        required: false
    })
    @IsOptional()
    @IsArray()
    skills?: string[];

    @ApiProperty({
        example: 'https://drive.google.com/file/d/abc123/view',
        description: 'Ссылка на CV файл',
        required: false
    })
    @IsOptional()
    @IsUrl()
    cv_file_url?: string;

    @ApiProperty({ example: 'password123', description: 'Новый пароль', required: false })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}