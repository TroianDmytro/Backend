// src/teachers/dto/teacher-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TeacherResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID преподавателя' })
    id: string;

    @ApiProperty({ example: 'teacher@example.com', description: 'Email преподавателя' })
    email: string;

    @ApiProperty({ example: 'Иван', description: 'Имя преподавателя' })
    name: string;

    @ApiProperty({ example: 'Иванов', description: 'Фамилия преподавателя' })
    second_name: string;

    @ApiProperty({ example: 35, description: 'Возраст преподавателя' })
    age?: number;

    @ApiProperty({ example: '+380 (67) 123-45-67', description: 'Номер телефона' })
    telefon_number?: string;

    @ApiProperty({ example: 'Описание преподавателя', description: 'Описание' })
    description: string;

    @ApiProperty({ example: 'Веб-разработка', description: 'Специализация' })
    specialization?: string;

    @ApiProperty({ example: 'МГУ, факультет ВМК', description: 'Образование' })
    education?: string;

    @ApiProperty({ example: 5, description: 'Опыт работы в годах' })
    experience_years?: number;

    @ApiProperty({ example: ['JavaScript', 'React', 'Node.js'], description: 'Навыки' })
    skills?: string[];

    @ApiProperty({ example: 'https://drive.google.com/file/d/abc123/view', description: 'CV файл' })
    cv_file_url?: string;

    @ApiProperty({ example: ['507f1f77bcf86cd799439012'], description: 'Список ID курсов' })
    courses: string[];

    @ApiProperty({ example: true, description: 'Подтвержден ли email' })
    isEmailVerified: boolean;

    @ApiProperty({ example: false, description: 'Заблокирован ли преподаватель' })
    isBlocked: boolean;

    @ApiProperty({ example: true, description: 'Одобрен ли преподаватель' })
    isApproved: boolean;

    @ApiProperty({ example: 'approved', description: 'Статус заявки' })
    approvalStatus: 'pending' | 'approved' | 'rejected';

    @ApiProperty({ example: 4.5, description: 'Рейтинг преподавателя' })
    rating: number;

    @ApiProperty({ example: 15, description: 'Количество отзывов' })
    reviewsCount: number;

    @ApiProperty({ example: '2023-01-15T10:30:00Z', description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-20T15:45:00Z', description: 'Дата обновления' })
    updatedAt: Date;
}