// src/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID пользователя'
    })
    @Expose()
    @Transform(({ obj }) => obj._id?.toString() || obj.id)
    id: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'Email пользователя'
    })
    @Expose()
    email: string;

    @ApiProperty({
        example: 'Иван',
        description: 'Имя пользователя'
    })
    @Expose()
    name?: string;

    @ApiProperty({
        example: 'Иванов',
        description: 'Фамилия пользователя'
    })
    @Expose()
    second_name?: string;

    @ApiProperty({
        example: 25,
        description: 'Возраст пользователя'
    })
    @Expose()
    age?: number;

    @ApiProperty({
        example: '+380 (67) 123-45-67',
        description: 'Номер телефона'
    })
    @Expose()
    telefon_number?: string;

    @ApiProperty({
        example: true,
        description: 'Статус подтверждения email'
    })
    @Expose()
    isEmailVerified: boolean;

    @ApiProperty({
        example: false,
        description: 'Статус блокировки пользователя'
    })
    @Expose()
    isBlocked: boolean;

    // ID аватара (ссылка на существующую коллекцию avatars)
    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'ID аватара (используйте GET /avatars/:userId для получения аватара)',
        required: false
    })
    @Expose()
    @Transform(({ obj }) => obj.avatarId?.toString() || null)
    avatarId?: string | null;

    // Удобное поле для клиентов
    @ApiProperty({
        example: true,
        description: 'Есть ли аватар у пользователя'
    })
    @Expose()
    @Transform(({ obj }) => !!obj.avatarId)
    hasAvatar: boolean;

    // URL для получения аватара (удобно для фронтенда)
    @ApiProperty({
        example: '/avatars/507f1f77bcf86cd799439011',
        description: 'URL для получения аватара пользователя',
        required: false
    })
    @Expose()
    @Transform(({ obj }) => obj.avatarId ? `/avatars/${obj._id?.toString() || obj.id}` : null)
    avatarUrl?: string | null;

    @ApiProperty({
        example: ['user'],
        description: 'Роли пользователя'
    })
    @Expose()
    @Transform(({ obj }) => {
        if (!obj.roles) return [];
        return obj.roles.map(role => typeof role === 'object' ? role.name : role);
    })
    roles: string[];

    @ApiProperty({
        example: '2023-01-15T10:30:00Z',
        description: 'Дата создания'
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        example: '2023-01-20T15:45:00Z',
        description: 'Дата последнего обновления'
    })
    @Expose()
    updatedAt: Date;

    // Исключаем чувствительные данные
    @Exclude()
    password: string;

    @Exclude()
    verificationToken: string;

    @Exclude()
    resetPasswordToken: string;

    @Exclude()
    verificationTokenExpires: Date;

    @Exclude()
    resetPasswordExpires: Date;
}