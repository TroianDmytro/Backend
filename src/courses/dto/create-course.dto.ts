import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsArray, IsOptional, IsMongoId, IsUrl, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCourseDto {
    @ApiProperty({
        description: 'Название курса',
        example: 'Основы JavaScript для начинающих'
    })
    @IsString({ message: 'Название курса должно быть строкой' })
    @IsNotEmpty({ message: 'Название курса не может быть пустым' })
    title: string;

    @ApiProperty({
        description: 'URL-дружелюбный идентификатор курса',
        example: 'javascript-basics-for-beginners'
    })
    @IsString({ message: 'Slug должен быть строкой' })
    @IsNotEmpty({ message: 'Slug не может быть пустым' })
    slug: string;

    @ApiProperty({
        description: 'Подробное описание курса',
        example: 'Полный курс по изучению JavaScript с нуля'
    })
    @IsString({ message: 'Описание должно быть строкой' })
    @IsNotEmpty({ message: 'Описание не может быть пустым' })
    description: string;

    @ApiProperty({
        description: 'URL изображения курса',
        example: 'https://example.com/course-image.jpg',
        required: false
    })
    @IsOptional()
    @IsUrl({}, { message: 'URL изображения должен быть валидным' })
    image_url?: string;

    @ApiProperty({
        description: 'Цена курса',
        example: 99.99
    })
    @IsNumber({}, { message: 'Цена должна быть числом' })
    @Min(0, { message: 'Цена не может быть отрицательной' })
    price: number;

    @ApiProperty({
        description: 'Процент скидки',
        example: 15,
        required: false
    })
    @IsOptional()
    @IsNumber({}, { message: 'Процент скидки должен быть числом' })
    @Min(0, { message: 'Процент скидки не может быть отрицательным' })
    @Max(100, { message: 'Процент скидки не может быть больше 100' })
    discount_percent?: number;

    @ApiProperty({
        description: 'Валюта',
        example: 'USD'
    })
    @IsString({ message: 'Валюта должна быть строкой' })
    @IsNotEmpty({ message: 'Валюта не может быть пустой' })
    currency: string;

    @ApiProperty({
        description: 'Активен ли курс',
        example: true
    })
    @IsBoolean({ message: 'is_active должно быть булевым значением' })
    is_active: boolean;

    @ApiProperty({
        description: 'Рекомендуемый курс',
        example: false,
        required: false
    })
    @IsOptional()
    @IsBoolean({ message: 'is_featured должно быть булевым значением' })
    is_featured?: boolean;

    @ApiProperty({
        description: 'Длительность курса в часах',
        example: 40
    })
    @IsNumber({}, { message: 'Длительность должна быть числом' })
    @Min(1, { message: 'Длительность должна быть положительной' })
    duration_hours: number;

    @ApiProperty({
        description: 'Теги курса',
        example: ['javascript', 'programming', 'web-development'],
        required: false
    })
    @IsOptional()
    @IsArray({ message: 'Теги должны быть массивом' })
    @IsString({ each: true, message: 'Каждый тег должен быть строкой' })
    tags?: string[];

    @ApiProperty({
        description: 'URL превью видео',
        example: 'https://example.com/preview-video.mp4',
        required: false
    })
    @IsOptional()
    @IsUrl({}, { message: 'URL превью видео должен быть валидным' })
    preview_video_url?: string;

    @ApiProperty({
        description: 'Разрешить комментарии',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean({ message: 'allow_comments должно быть булевым значением' })
    allow_comments?: boolean;

    @ApiProperty({
        description: 'Требует одобрения',
        example: false,
        required: false
    })
    @IsOptional()
    @IsBoolean({ message: 'requires_approval должно быть булевым значением' })
    requires_approval?: boolean;

    @ApiProperty({
        description: 'ID преподавателя курса (может быть null)',
        example: '507f1f77bcf86cd799439011',
        required: false,
        nullable: true
    })
    @IsOptional()
    @Transform(({ value }) => {
        // Преобразуем строку 'null' или null в undefined для валидации
        if (value === null || value === 'null' || value === '') {
            return undefined;
        }
        return value;
    })
    @IsMongoId({ message: 'ID преподавателя должен быть валидным MongoDB ID' })
    teacherId?: string;

    @ApiProperty({
        description: 'ID категории курса',
        example: '507f1f77bcf86cd799439012'
    })
    @IsString({ message: 'ID категории должен быть строкой' })
    @IsNotEmpty({ message: 'ID категории не может быть пустым' })
    @IsMongoId({ message: 'ID категории должен быть валидным MongoDB ID' })
    categoryId: string;

    @ApiProperty({
        description: 'ID уровня сложности',
        example: '507f1f77bcf86cd799439013'
    })
    @IsString({ message: 'ID уровня сложности должен быть строкой' })
    @IsNotEmpty({ message: 'ID уровня сложности не может быть пустым' })
    @IsMongoId({ message: 'ID уровня сложности должен быть валидным MongoDB ID' })
    difficultyLevelId: string;

    @ApiProperty({
        description: 'Краткое описание курса',
        example: 'Изучите JavaScript с нуля за 30 дней',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Краткое описание должно быть строкой' })
    short_description?: string;

    @ApiProperty({
        description: 'URL логотипа курса',
        example: 'https://example.com/logo.png',
        required: false
    })
    @IsOptional()
    @IsUrl({}, { message: 'URL логотипа должен быть валидным' })
    logo_url?: string;

    @ApiProperty({
        description: 'Максимальное количество студентов',
        example: 100,
        required: false
    })
    @IsOptional()
    @IsInt({ message: 'Максимальное количество студентов должно быть целым числом' })
    @Min(1, { message: 'Максимальное количество студентов должно быть положительным' })
    max_students?: number;

    @ApiProperty({
        description: 'Дата начала курса',
        example: '2024-12-01T09:00:00.000Z'
    })
    @IsDateString({}, { message: 'Дата начала должна быть валидной датой' })
    startDate: string;
}