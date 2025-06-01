// src/avatars/dto/upload-avatar-file.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarFileDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Файл изображения аватара',
        required: true,
        example: 'avatar.jpg'
    })
    avatar: any;
}

export class AvatarUploadResponseDto {
    @ApiProperty({
        example: 'Аватар успешно загружен',
        description: 'Сообщение о результате операции'
    })
    message: string;

    @ApiProperty({
        type: 'object',
        properties: {
            id: {
                type: 'string',
                example: '507f1f77bcf86cd799439011',
                description: 'ID созданного аватара'
            },
            userId: {
                type: 'string',
                example: '507f1f77bcf86cd799439012',
                description: 'ID пользователя'
            },
            mimeType: {
                type: 'string',
                example: 'image/jpeg',
                description: 'MIME тип файла'
            },
            size: {
                type: 'number',
                example: 524288,
                description: 'Размер файла в байтах'
            },
            width: {
                type: 'number',
                example: 1024,
                description: 'Ширина изображения в пикселях'
            },
            height: {
                type: 'number',
                example: 1024,
                description: 'Высота изображения в пикселях'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2023-01-15T10:30:00Z',
                description: 'Дата создания аватара'
            }
        }
    })
    avatar: {
        id: string;
        userId: string;
        mimeType: string;
        size: number;
        width: number;
        height: number;
        createdAt: Date;
    };
}