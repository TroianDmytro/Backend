// src/users/dto/user-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID пользователя'
    })
    id: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439012',
        description: 'ID аватара',
        required: false
    })
    avatar?: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'Email пользователя'
    })
    email: string;

    @ApiProperty({
        example: 'Иван',
        description: 'Имя пользователя',
        required: false
    })
    name?: string;

    @ApiProperty({
        example: 'Иванов',
        description: 'Фамилия пользователя',
        required: false
    })
    second_name?: string;

    @ApiProperty({
        example: 25,
        description: 'Возраст',
        required: false
    })
    age?: number;

    @ApiProperty({
        example: '+380 (67) 123-45-67',
        description: 'Номер телефона',
        required: false
    })
    telefon_number?: string;

    @ApiProperty({
        example: true,
        description: 'Подтвержден ли email'
    })
    isEmailVerified: boolean;

    @ApiProperty({
        example: false,
        description: 'Заблокирован ли пользователь'
    })
    isBlocked: boolean;

    @ApiProperty({
        example: ['user', 'admin'],
        description: 'Роли пользователя',
        type: [String]
    })
    roles: string[];

    @ApiProperty({
        example: '2023-01-15T10:30:00Z',
        description: 'Дата создания'
    })
    createdAt: Date;

    @ApiProperty({
        example: '2023-01-20T15:45:00Z',
        description: 'Дата последнего обновления'
    })
    updatedAt: Date;

    @ApiProperty({
        example: true,
        description: 'Зарегистрирован ли через Google'
    })
    is_google_user?: boolean;

    @ApiProperty({
        example: 'https://lh3.googleusercontent.com/...',
        description: 'URL аватара от Google',
        required: false
    })
    avatar_url?: string;

    @ApiProperty({
        example: 'newemail@example.com',
        description: 'Новый email, ожидающий подтверждения',
        required: false
    })
    pendingEmail?: string;

    @ApiProperty({
        example: true,
        description: 'Есть ли запрос на изменение email'
    })
    hasPendingEmailChange?: boolean;

    @ApiProperty({
        example: '2025-01-01T10:15:00Z',
        description: 'Срок действия кода изменения email',
        required: false
    })
    emailChangeCodeExpiresAt?: Date;

    // ОБНОВИТЬ конструктор:
    constructor(user: any) {
        this.id = user._id?.toString() || user.id;
        this.avatar = user.avatarId?.toString() || null;
        this.email = user.email;
        this.name = user.name;
        this.second_name = user.second_name;
        this.age = user.age;
        this.telefon_number = user.telefon_number;
        this.isEmailVerified = user.isEmailVerified;
        this.isBlocked = user.isBlocked;
        this.roles = user.roles?.map(role =>
            typeof role === 'object' ? role.name : role
        ) || [];
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.is_google_user = user.is_google_user;
        this.avatar_url = user.avatar_url;

        // Новые поля для изменения email
        this.pendingEmail = user.pendingEmail;
        this.hasPendingEmailChange = !!user.pendingEmail;
        this.emailChangeCodeExpiresAt = user.emailChangeCodeExpires;
    }
} 