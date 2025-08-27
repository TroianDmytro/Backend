// src/users/dto/update-user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from './user-profile.dto';

export class UpdateUserResponseDto {
    @ApiProperty({
        example: 'Профиль успешно обновлен',
        description: 'Сообщение о результате операции'
    })
    message: string;

    @ApiProperty({
        description: 'Обновленные данные пользователя',
        type: UserProfileDto
    })
    user: UserProfileDto;

    constructor(message: string, user: any) {
        this.message = message;
        this.user = new UserProfileDto(user);
    }
}